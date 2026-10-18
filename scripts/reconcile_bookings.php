<?php
// Run from Task Scheduler/cron with the same explicit database environment as the application.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
if (!getenv('AKAD_DB_NAME')) {
    fwrite(STDERR, "AKAD_DB_NAME must explicitly identify the migrated target database.\n");
    exit(2);
}
$_SERVER['REQUEST_METHOD'] = 'CLI';
require_once __DIR__ . '/../api/availability_service.php';

try {
    $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset='.DB_CHAR,DB_USER,DB_PASS,[
        PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES=>false,
    ]);
    $pdo->exec("SET time_zone = '+08:00'");
    $pdo->beginTransaction();
    $count = reconcileBookings($pdo);
    $pdo->commit();
    echo json_encode(['ok'=>true,'database'=>DB_NAME,'transitioned'=>$count]).PHP_EOL;
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, "Booking reconciliation failed: ".$error->getMessage().PHP_EOL);
    exit(1);
}
