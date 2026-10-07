<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
$do = $_GET['do'] ?? 'all';
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $do === 'all') {
    if (isset($_GET['booking_id'])) {
        $s = db()->prepare('SELECT * FROM payments WHERE booking_id=? ORDER BY payment_date DESC');
        $s->execute([asInt($_GET['booking_id'], 1)]);
    } else {
        $s = db()->query('SELECT * FROM payments ORDER BY payment_date DESC');
    }
    sendJson(['ok' => true, 'data' => $s->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $do === 'create') {
    requireAuth();
    $b = readJsonBody();
    $bid = asInt($b['booking_id'] ?? null, 1);
    $amt = asDecimal($b['amount'] ?? null);
    $method = strtolower(trim($b['payment_method'] ?? ''));
    $method = match ($method) {
        'gcash' => 'gcash',
        'maribank', 'bank transfer', 'other' => 'maribank',
        default => null
    };
    if (!$bid || $amt === null || !$method || !is_numeric($amt) || is_infinite((float)$amt) || (float)$amt <= 0) sendJson(['ok' => false, 'error' => 'Valid booking, positive amount, and payment method required.', 'code' => 'validation'], 400);
    $p = db();
    $p->beginTransaction();
    $s = $p->prepare('INSERT INTO payments(booking_id,amount,payment_method,payment_status,notes) VALUES(?,?,?,\'paid\',?)');
    $s->execute([$bid, $amt, $method, $b['notes'] ?? null]);
    $total = "CASE WHEN total>0 THEN total ELSE GREATEST(subtotal+addons_total-discount+fees,0) END";
    $p->prepare("UPDATE bookings SET payment_status=CASE WHEN amount_paid+?>=$total THEN 'Fully Paid' WHEN amount_paid+?>0 THEN 'Partial' ELSE 'Unpaid' END,amount_paid=amount_paid+? WHERE booking_id=?")->execute([$amt, $amt, $amt, $bid]);
    $id = (int)$p->lastInsertId();
    $p->commit();
    $s = $p->prepare('SELECT * FROM payments WHERE payment_id=?');
    $s->execute([$id]);
    sendJson(['ok' => true, 'data' => $s->fetch()], 201);
}
sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
