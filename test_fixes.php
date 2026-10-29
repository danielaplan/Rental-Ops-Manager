<?php
declare(strict_types=1);

require_once __DIR__ . '/tests/php_test_bootstrap.php';

test('price cannot fall below completed payments and records stay unchanged', function (PDO $pdo): void {
    $ids = fixtureIds($pdo);
    $bookingId = fixtureBooking($pdo, $ids, 'Pending', '1000.00');
    fixturePayment($pdo, $bookingId, $ids['owner'], '800.00');

    assertThrows(
        fn() => saveBooking(
            $pdo,
            'update',
            $bookingId,
            ['agreed_total' => '500.00'],
            $ids['owner']
        ),
        'collected_payments_exceed_total'
    );

    $booking = bookingRecord($pdo, $bookingId);
    assertSameValue('1000.00', $booking['agreed_total']);
    assertSameValue(80000, completedBookingPaymentsCents($pdo, $bookingId));
    assertSameValue(20000, bookingBalanceCents($pdo, $bookingId, $booking['agreed_total']));
});

test('payment correction reopens an unpaid completed booking with evidence', function (PDO $pdo): void {
    $ids = fixtureIds($pdo);
    $bookingId = fixtureBooking(
        $pdo,
        $ids,
        'Completed',
        '1000.00',
        null,
        $ids['owner']
    );
    $paymentId = fixturePayment($pdo, $bookingId, $ids['owner'], '1000.00');

    savePayment($pdo, 'update', $paymentId, [
        'amount' => '600.00',
        'correction_reason' => 'Corrected synthetic receipt',
    ], ['user_id' => $ids['owner']]);

    $booking = bookingRecord($pdo, $bookingId);
    assertSameValue('Awaiting Payment', $booking['status']);
    assertSameValue(null, $booking['completed_at']);
    assertSameValue($ids['owner'], (int)$booking['released_by']);
    assertSameValue('Synthetic completed equipment review', $booking['review_notes']);
    assertSameValue(40000, bookingBalanceCents($pdo, $bookingId, $booking['agreed_total']));

    $notification = $pdo->prepare(
        "SELECT message FROM notifications
         WHERE booking_id=? AND notification_type='awaiting_payment' AND resolved_at IS NULL"
    );
    $notification->execute([$bookingId]);
    assertTrue(str_contains((string)$notification->fetchColumn(), '400.00'));

    $audit = $pdo->prepare(
        "SELECT COUNT(*) FROM audit_logs
         WHERE record_type='booking' AND record_id=?
           AND action='payment_correction_reopened'
           AND old_status='Completed' AND new_status='Awaiting Payment'"
    );
    $audit->execute([$bookingId]);
    assertSameValue(1, (int)$audit->fetchColumn());
});

test('unresolved released equipment blocks cancellation until return review', function (PDO $pdo): void {
    $ids = fixtureIds($pdo);
    $bookingId = fixtureBooking($pdo, $ids, 'Confirmed', '1000.00');
    $pdo->prepare(
        "INSERT INTO booking_checklist_items(
            booking_id,item_name_snapshot,expected_quantity,quantity_released,
            quantity_returned,condition_out,return_status
         ) VALUES(?,'Synthetic speaker',1,1,0,'Good','pending')"
    )->execute([$bookingId]);

    assertThrows(
        fn() => saveBooking(
            $pdo,
            'cancel',
            $bookingId,
            ['cancellation_reason' => 'Synthetic cancellation'],
            $ids['owner']
        ),
        'equipment_return_required'
    );
    assertSameValue('Confirmed', bookingRecord($pdo, $bookingId)['status']);

    $pdo->prepare(
        "UPDATE booking_checklist_items
         SET quantity_returned=1,condition_in='Good',return_status='inspected',
             checked_by=?,checked_at=NOW()
         WHERE booking_id=?"
    )->execute([$ids['owner'], $bookingId]);
    saveBooking(
        $pdo,
        'cancel',
        $bookingId,
        ['cancellation_reason' => 'Synthetic cancellation after return'],
        $ids['owner']
    );
    assertSameValue('Cancelled', bookingRecord($pdo, $bookingId)['status']);
});

test('referenced packages cannot move services while unreferenced packages can', function (PDO $pdo): void {
    $ids = fixtureIds($pdo);
    fixtureBooking($pdo, $ids, 'Pending', '1000.00', $ids['package']);
    $definition = packageCrudDefinition();

    assertThrows(
        fn() => tableCrudSave(
            $pdo,
            $definition[0],
            $definition[1],
            $definition[2],
            $definition[3],
            $definition[5],
            'update',
            $ids['package'],
            ['service_id' => $ids['other_service']],
            ['user_id' => $ids['owner']]
        ),
        'package_service_locked'
    );

    $pdo->prepare(
        "INSERT INTO packages(service_id,package_name,price,status)
         VALUES(?,'Unreferenced PHP package',250.00,'Active')"
    )->execute([$ids['service']]);
    $unreferencedId = (int)$pdo->lastInsertId();
    tableCrudSave(
        $pdo,
        $definition[0],
        $definition[1],
        $definition[2],
        $definition[3],
        $definition[5],
        'update',
        $unreferencedId,
        ['service_id' => $ids['other_service']],
        ['user_id' => $ids['owner']]
    );
    $service = $pdo->query(
        'SELECT service_id FROM packages WHERE package_id='.(int)$unreferencedId
    )->fetchColumn();
    assertSameValue($ids['other_service'], (int)$service);
});

finishTests();
