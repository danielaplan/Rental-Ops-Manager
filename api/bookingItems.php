<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
$do = $_GET['do'] ?? 'forBooking';
$m = $_SERVER['REQUEST_METHOD'];
$id = asInt($_GET['id'] ?? null, 1);
$pdo = db();
if ($m === 'GET' && $do === 'forBooking') {
    $bid = asInt($_GET['booking_id'] ?? null, 1);
    $s = $pdo->prepare('SELECT * FROM booking_items WHERE booking_id=? ORDER BY booking_item_id');
    $s->execute([$bid]);
    sendJson(['ok' => true, 'data' => $s->fetchAll()]);
}
if ($m === 'POST' && $do === 'generate') {
    requireAuth();
    $b = readJsonBody();
    $bid = asInt($b['booking_id'] ?? null, 1);
    $services = $b['service_ids'] ?? [];
    if (!$bid || !is_array($services)) sendJson(['ok' => false, 'error' => 'Booking and services are required.', 'code' => 'validation'], 400);
    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM booking_items WHERE booking_id=?')->execute([$bid]);
        $s = $pdo->prepare('INSERT INTO booking_items(booking_id,rental_item_id,service_id,name,expected_qty,released_qty,returned_qty,required,checked_released) SELECT ?,rental_item_id,service_id,name,quantity,0,0,required,0 FROM rental_items WHERE service_id=?');
        foreach ($services as $sid) {
            $s->execute([$bid, asInt($sid, 1)]);
        }
        $pdo->commit();
        $q = $pdo->prepare('SELECT * FROM booking_items WHERE booking_id=? ORDER BY booking_item_id');
        $q->execute([$bid]);
        sendJson(['ok' => true, 'data' => $q->fetchAll()]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        sendJson(['ok' => false, 'error' => 'Unable to generate checklist.', 'code' => 'server_error'], 500);
    }
}
if ($m === 'POST' && in_array($do, ['create', 'update', 'delete'], true)) {
    requireRole(['owner']);
    $b = readJsonBody();
    if ($do === 'create') {
        $cols = ['booking_id', 'rental_item_id', 'service_id', 'name', 'expected_qty', 'released_qty', 'returned_qty', 'required', 'checked_released', 'condition', 'notes'];
        $v = [];
        foreach ($cols as $k) if (array_key_exists($k, $b)) $v[$k] = $b[$k];
        if (empty($v['booking_id']) || empty($v['name'])) sendJson(['ok' => false, 'error' => 'Booking and item name are required.', 'code' => 'validation'], 400);
        $keys = array_keys($v);
        $pdo->prepare('INSERT INTO booking_items (`' . implode('`,`', $keys) . '`) VALUES (' . implode(',', array_fill(0, count($keys), '?')) . ')')->execute(array_values($v));
        $id = (int)$pdo->lastInsertId();
    } elseif ($do === 'update') {
        $allowed = ['expected_qty', 'released_qty', 'returned_qty', 'required', 'checked_released', 'condition', 'notes'];
        $v = array_intersect_key($b, array_flip($allowed));
        if (!$v) sendJson(['ok' => false, 'error' => 'Update fields are required.', 'code' => 'validation'], 400);
        if ($id) {
            $where = 'booking_item_id=?';
            $key = [$id];
        } else {
            $where = 'booking_id=? AND rental_item_id=?';
            $key = [asInt($b['booking_id'] ?? null, 1), asInt($b['rental_item_id'] ?? null, 1)];
        }
        if (in_array(null, $key, true)) sendJson(['ok' => false, 'error' => 'A checklist id or booking and rental item ids are required.', 'code' => 'validation'], 400);
        $pdo->prepare('UPDATE booking_items SET ' . implode(',', array_map(fn($k) => "`$k`=?", array_keys($v))) . ' WHERE ' . $where)->execute([...array_values($v), ...$key]);
        if (!$id) {
            $s = $pdo->prepare('SELECT booking_item_id FROM booking_items WHERE ' . $where);
            $s->execute($key);
            $id = (int)$s->fetchColumn();
        }
    } else {
        if (!$id) sendJson(['ok' => false, 'error' => 'Id is required.', 'code' => 'validation'], 400);
        $pdo->prepare('DELETE FROM booking_items WHERE booking_item_id=?')->execute([$id]);
        sendJson(['ok' => true, 'data' => ['deleted' => true]]);
    }
    $s = $pdo->prepare('SELECT * FROM booking_items WHERE booking_item_id=?');
    $s->execute([$id]);
    sendJson(['ok' => true, 'data' => $s->fetch()]);
}
sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
