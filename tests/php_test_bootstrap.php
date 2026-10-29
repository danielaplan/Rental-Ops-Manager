<?php
declare(strict_types=1);

$testDatabase = getenv('AKAD_TEST_DB_NAME') ?: '';
$configuredDatabase = getenv('AKAD_DB_NAME') ?: '';
if (!preg_match('/^akad_verify_plan_\d+_\d+$/D', $testDatabase)
    || $configuredDatabase !== $testDatabase
) {
    fwrite(
        STDERR,
        "Refusing database access. Run through: node tests/run_revised_backend.cjs <php-test-file>\n"
    );
    exit(2);
}

require_once __DIR__ . '/../api/booking_service.php';
require_once __DIR__ . '/../api/payment_service.php';
require_once __DIR__ . '/../api/equipment_service.php';
require_once __DIR__ . '/../api/catalog_definitions.php';

$testCount = 0;
$testFailures = 0;

function assertTrue(bool $condition, string $message = 'Expected condition to be true.'): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function assertSameValue(mixed $expected, mixed $actual, string $message = ''): void
{
    if ($expected !== $actual) {
        $detail = 'Expected '.var_export($expected, true)
            .', received '.var_export($actual, true).'.';
        throw new RuntimeException($message ? $message.' '.$detail : $detail);
    }
}

function assertThrows(callable $work, string $expectedCode): DomainError
{
    try {
        $work();
    } catch (DomainError $error) {
        assertSameValue($expectedCode, $error->errorCode, 'Unexpected domain error code.');
        return $error;
    }
    throw new RuntimeException('Expected DomainError '.$expectedCode.' was not thrown.');
}

function test(string $name, callable $work): void
{
    global $testCount, $testFailures;
    $testCount++;
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $work($pdo);
        echo "PASS {$name}\n";
    } catch (Throwable $error) {
        $testFailures++;
        fwrite(STDERR, "FAIL {$name}: {$error->getMessage()}\n");
    } finally {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
    }
}

function finishTests(): never
{
    global $testCount, $testFailures;
    if ($testFailures > 0) {
        fwrite(STDERR, "{$testFailures}/{$testCount} PHP tests failed.\n");
        exit(1);
    }
    echo "PASS all {$testCount} PHP tests.\n";
    exit(0);
}

function fixtureIds(PDO $pdo): array
{
    $suffix = bin2hex(random_bytes(4));
    $pdo->prepare(
        'INSERT INTO users(full_name,role,username,account_status,password_hash,contact_number)
         VALUES(?,\'owner\',?,\'Active\',?,?)'
    )->execute([
        'PHP Test Owner',
        'php-test-'.$suffix,
        password_hash('Synthetic only', PASSWORD_DEFAULT),
        substr('T'.$suffix, 0, 20),
    ]);
    $ownerId = (int)$pdo->lastInsertId();

    $pdo->prepare('INSERT INTO customers(full_name,contact_number) VALUES(?,?)')
        ->execute(['PHP Test Customer', substr('C'.$suffix, 0, 20)]);
    $customerId = (int)$pdo->lastInsertId();

    $serviceIds = [];
    foreach (['PHP Test Service A', 'PHP Test Service B'] as $name) {
        $pdo->prepare('INSERT INTO services(service_name,status) VALUES(?,\'Active\')')
            ->execute([$name.' '.$suffix]);
        $serviceIds[] = (int)$pdo->lastInsertId();
    }

    $pdo->prepare(
        'INSERT INTO packages(service_id,package_name,price,status)
         VALUES(?,?,1000.00,\'Active\')'
    )->execute([$serviceIds[0], 'PHP Test Package '.$suffix]);
    $packageId = (int)$pdo->lastInsertId();

    return [
        'owner' => $ownerId,
        'customer' => $customerId,
        'service' => $serviceIds[0],
        'other_service' => $serviceIds[1],
        'package' => $packageId,
    ];
}

function fixtureBooking(
    PDO $pdo,
    array $ids,
    string $status = 'Pending',
    string $total = '1000.00',
    ?int $packageId = null,
    ?int $releasedBy = null
): int {
    $reference = 'PHP-'.strtoupper(bin2hex(random_bytes(8)));
    $start = '2035-08-01 10:00:00';
    $end = '2035-08-01 11:00:00';
    $pdo->prepare(
        'INSERT INTO bookings(
            customer_id,service_id,package_id,created_by,event_date,start_time,end_time,
            event_location,status,sync_status,service_ids,addon_ids,total,agreed_total,
            booking_reference,event_start_datetime,event_end_datetime,
            blocked_start_datetime,blocked_end_datetime,package_name_snapshot,
            package_price_snapshot,released_by,review_notes,completed_at,created_at
         ) VALUES(?,?,?,?,?,?,?,?,?,\'synced\',?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())'
    )->execute([
        $ids['customer'], $ids['service'], $packageId, $ids['owner'],
        '2035-08-01', '10:00:00', '11:00:00', 'Synthetic PHP venue', $status,
        json_encode([$ids['service']]), json_encode([]), $total, $total, $reference,
        $start, $end, $start, $end,
        $packageId ? 'PHP Test Package Snapshot' : null,
        $packageId ? '1000.00' : null,
        $releasedBy,
        $releasedBy ? 'Synthetic completed equipment review' : null,
        $status === 'Completed' ? '2035-08-01 12:00:00' : null,
    ]);
    return (int)$pdo->lastInsertId();
}

function fixturePayment(
    PDO $pdo,
    int $bookingId,
    int $ownerId,
    string $amount,
    string $status = 'Completed'
): int {
    $pdo->prepare(
        'INSERT INTO payments(
            booking_id,amount,payment_method,payment_status,payment_date,
            payment_type,recorded_by,recorded_at,provenance
         ) VALUES(?,?,\'gcash\',?,NOW(),\'Balance\',?,NOW(),\'owner\')'
    )->execute([$bookingId, $amount, $status, $ownerId]);
    return (int)$pdo->lastInsertId();
}

function bookingRecord(PDO $pdo, int $bookingId): array
{
    $query = $pdo->prepare('SELECT * FROM bookings WHERE booking_id=?');
    $query->execute([$bookingId]);
    return $query->fetch() ?: [];
}
