<?php
declare(strict_types=1);

require_once __DIR__ . '/tests/php_test_bootstrap.php';

test('booking lifecycle and integrity fixes work together', function (PDO $pdo): void {
    $ids = fixtureIds($pdo);

    $bookingId = saveBooking($pdo, 'create', null, [
        'customer_id' => $ids['customer'],
        'service_id' => $ids['service'],
        'event_start_datetime' => '2035-09-01 10:00:00',
        'event_end_datetime' => '2035-09-01 11:00:00',
        'event_location' => 'Synthetic lifecycle venue',
        'status' => 'Pending',
        'agreed_total' => '1000.00',
    ], $ids['owner']);
    assertSameValue('Pending', bookingRecord($pdo, $bookingId)['status']);

    saveBooking(
        $pdo,
        'update',
        $bookingId,
        ['status' => 'Confirmed'],
        $ids['owner']
    );
    assertSameValue('Confirmed', bookingRecord($pdo, $bookingId)['status']);

    $pdo->prepare(
        "INSERT INTO booking_checklist_items(
            booking_id,item_name_snapshot,expected_quantity,quantity_released,
            quantity_returned,condition_out,return_status
         ) VALUES(?,'Lifecycle speaker',1,1,0,'Good','pending')"
    )->execute([$bookingId]);
    $checklistId = (int)$pdo->lastInsertId();
    $pdo->prepare(
        "INSERT INTO item_releases(booking_id,released_by,notes)
         VALUES(?,'PHP Test Owner','Synthetic dispatch')"
    )->execute([$bookingId]);

    $pdo->prepare(
        "UPDATE bookings
         SET blocked_end_datetime='2001-01-01 11:00:00'
         WHERE booking_id=?"
    )->execute([$bookingId]);
    reconcileBookings($pdo);
    assertSameValue('Awaiting Completion', bookingRecord($pdo, $bookingId)['status']);

    saveReturnInspection($pdo, $bookingId, [[
        'checklist_item_id' => $checklistId,
        'quantity_returned' => 1,
        'condition_in' => 'Good',
        'notes' => 'Synthetic complete return',
    ]], $ids['owner']);

    $payment = savePayment($pdo, 'create', null, [
        'booking_id' => $bookingId,
        'amount' => '1000.00',
        'payment_method' => 'GCash',
        'payment_status' => 'Completed',
        'payment_date' => date('Y-m-d H:i:s'),
    ], ['user_id' => $ids['owner']]);

    releaseBooking($pdo, $bookingId, [
        'service_ready' => true,
        'payments_reviewed' => true,
        'deposits_reviewed' => true,
        'review_notes' => 'Synthetic lifecycle review complete',
        'checklist_items' => [],
    ], $ids['owner']);
    $completed = bookingRecord($pdo, $bookingId);
    assertSameValue('Completed', $completed['status']);
    assertSameValue($ids['owner'], (int)$completed['released_by']);

    savePayment($pdo, 'update', (int)$payment['payment_id'], [
        'amount' => '600.00',
        'correction_reason' => 'Synthetic lifecycle correction',
    ], ['user_id' => $ids['owner']]);
    $reopened = bookingRecord($pdo, $bookingId);
    assertSameValue('Awaiting Payment', $reopened['status']);
    assertSameValue(40000, bookingBalanceCents($pdo, $bookingId, $reopened['agreed_total']));
    assertSameValue('Synthetic lifecycle review complete', $reopened['review_notes']);

    savePayment($pdo, 'create', null, [
        'booking_id' => $bookingId,
        'amount' => '400.00',
        'payment_method' => 'MariBank',
        'payment_status' => 'Completed',
        'payment_date' => date('Y-m-d H:i:s'),
    ], ['user_id' => $ids['owner']]);
    releaseBooking($pdo, $bookingId, [], $ids['owner']);
    assertSameValue('Completed', bookingRecord($pdo, $bookingId)['status']);

    $protectedId = fixtureBooking($pdo, $ids, 'Pending', '1000.00');
    fixturePayment($pdo, $protectedId, $ids['owner'], '800.00');
    assertThrows(
        fn() => saveBooking(
            $pdo,
            'update',
            $protectedId,
            ['agreed_total' => '500.00'],
            $ids['owner']
        ),
        'collected_payments_exceed_total'
    );
    assertSameValue('1000.00', bookingRecord($pdo, $protectedId)['agreed_total']);

    $dispatchId = fixtureBooking($pdo, $ids, 'Confirmed', '500.00');
    $pdo->prepare(
        "INSERT INTO booking_checklist_items(
            booking_id,item_name_snapshot,expected_quantity,quantity_released,
            quantity_returned,condition_out,return_status
         ) VALUES(?,'Dispatched lifecycle item',1,1,0,'Good','pending')"
    )->execute([$dispatchId]);
    assertThrows(
        fn() => saveBooking(
            $pdo,
            'cancel',
            $dispatchId,
            ['cancellation_reason' => 'Must not strand equipment'],
            $ids['owner']
        ),
        'equipment_return_required'
    );
    assertSameValue('Confirmed', bookingRecord($pdo, $dispatchId)['status']);

    $packageBookingId = fixtureBooking(
        $pdo,
        $ids,
        'Pending',
        '1000.00',
        $ids['package']
    );
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
    assertSameValue(
        $ids['package'],
        (int)bookingRecord($pdo, $packageBookingId)['package_id']
    );
});

finishTests();
