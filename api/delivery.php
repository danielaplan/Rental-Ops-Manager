<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
$do = $_GET['do'] ?? '';
$p = db();
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $do === 'get') {
    $s = $p->prepare('SELECT * FROM delivery WHERE booking_id=? ORDER BY delivery_id DESC LIMIT 1');
    $s->execute([asInt($_GET['booking_id'] ?? null, 1)]);
    sendJson(['ok' => true, 'data' => $s->fetch() ?: null]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $do === 'upsert') {
    requireAuth();
    $b = readJsonBody();
    $bid = asInt($b['booking_id'] ?? null, 1);
    if (!$bid) sendJson(['ok' => false, 'error' => 'Valid booking_id required', 'code' => 'validation'], 400);
    if (!in_array($b['delivery_method'] ?? '', ['self_pickup', 'lalamove', 'owner_delivered'], true) || !in_array($b['fee_shouldered_by'] ?? '', ['renter', 'owner'], true)) sendJson(['ok' => false, 'error' => 'Invalid delivery values.', 'code' => 'validation'], 400);
    $s = $p->prepare('INSERT INTO delivery(booking_id,delivery_method,delivery_fee,fee_shouldered_by) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE delivery_method=VALUES(delivery_method),delivery_fee=VALUES(delivery_fee),fee_shouldered_by=VALUES(fee_shouldered_by)');
    $s->execute([$bid, $b['delivery_method'], $b['delivery_fee'] ?? 0, $b['fee_shouldered_by']]);
    $s = $p->prepare('SELECT * FROM delivery WHERE booking_id=?');
    $s->execute([$bid]);
    sendJson(['ok' => true, 'data' => $s->fetch()]);
}
sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
