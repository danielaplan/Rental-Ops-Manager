<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/equipment_service.php';
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$do = $_GET['do'] ?? ($method === 'GET' ? 'all' : null);
$id = asInt($_GET['id'] ?? null, 1);

if ($method === 'GET' && $do === 'all') sendJson(['ok' => true, 'data' => $pdo->query('SELECT * FROM equipment_checklist ORDER BY checklist_id DESC')->fetchAll()]);
if ($method === 'GET' && $do === 'forBooking') {
    $bookingId = asInt($_GET['booking_id'] ?? null, 1);
    $s = $pdo->prepare('SELECT * FROM equipment_checklist WHERE booking_id=? ORDER BY checklist_id');
    $s->execute([$bookingId]);
    sendJson(['ok' => true, 'data' => $s->fetchAll()]);
}
if ($method === 'GET' && $do === 'get' && $id) {
    $s = $pdo->prepare('SELECT * FROM equipment_checklist WHERE checklist_id=?');
    $s->execute([$id]);
    $row = $s->fetch();
    if (!$row) sendJson(['ok' => false, 'error' => 'Checklist record not found.', 'code' => 'not_found'], 404);
    sendJson(['ok' => true, 'data' => $row]);
}

if ($method === 'POST' && $do === 'inspect') {
    $user = requireAuth();
    $body = readJsonBody();
    $bookingId = asInt($body['booking_id'] ?? null, 1);
    $items = $body['items'] ?? null;
    if (!$bookingId || !is_array($items)) sendJson(['ok' => false, 'error' => 'Booking and inspection items are required.', 'code' => 'validation'], 400);
    try {
        $saved = saveReturnInspection($pdo, $bookingId, $items, (int)$user['user_id']);
        sendJson(['ok' => true, 'data' => ['booking_id' => $bookingId, 'items' => $saved]]);
    } catch (InvalidArgumentException $e) {
        sendJson(['ok' => false, 'error' => $e->getMessage(), 'code' => 'validation'], 400);
    } catch (Throwable $e) {
        sendJson(['ok' => false, 'error' => 'Unable to save return inspection.', 'code' => 'server_error'], 500);
    }
}

if ($method === 'POST' && $do === 'finalizeReturn') {
    $user = requireAuth();
    $body = readJsonBody();
    $bookingId = asInt($body['booking_id'] ?? null, 1);
    if (!$bookingId) sendJson(['ok' => false, 'error' => 'Valid booking_id required.', 'code' => 'validation'], 400);
    try {
        $result = finalizeBookingReturn($pdo, $bookingId, (int)$user['user_id']);
        sendJson(['ok' => true, 'data' => $result]);
    } catch (InvalidArgumentException $e) {
        sendJson(['ok' => false, 'error' => $e->getMessage(), 'code' => 'validation'], 400);
    } catch (Throwable $e) {
        sendJson(['ok' => false, 'error' => 'Unable to finalize return.', 'code' => 'server_error'], 500);
    }
}

if ($method === 'POST' && in_array($do, ['create', 'update', 'delete'], true)) {
    $user = requireRole(['owner']);
    $body = readJsonBody();
    $validStatuses = ['pending', 'inspected', 'damaged', 'missing'];
    if ($do === 'delete') {
        $s = $pdo->prepare('DELETE FROM equipment_checklist WHERE checklist_id=?');
        $s->execute([$id]);
        if (!$s->rowCount()) sendJson(['ok' => false, 'error' => 'Checklist record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => ['deleted' => true]]);
    }
    $fields = ['booking_id', 'rental_item_id', 'item_name', 'condition_out', 'condition_in', 'expected_qty', 'returned_qty', 'inspection_notes', 'return_status'];
    $values = [];
    foreach ($fields as $field) if (array_key_exists($field, $body)) $values[$field] = $body[$field];
    if ($do === 'create') {
        $values += ['expected_qty' => 0, 'returned_qty' => 0, 'return_status' => 'pending'];
        $values['checked_by'] = (int)$user['user_id'];
        if (empty($values['booking_id']) || empty($values['item_name'])) sendJson(['ok' => false, 'error' => 'Booking and item name are required.', 'code' => 'validation'], 400);
    } elseif (!$id || !$values) sendJson(['ok' => false, 'error' => 'Id and update fields are required.', 'code' => 'validation'], 400);
    if (isset($values['return_status']) && !in_array($values['return_status'], $validStatuses, true)) sendJson(['ok' => false, 'error' => 'Invalid return status.', 'code' => 'validation'], 400);
    if (isset($values['expected_qty']) && asInt($values['expected_qty'], 0) === null) sendJson(['ok' => false, 'error' => 'Expected quantity must be a non-negative integer.', 'code' => 'validation'], 400);
    if (isset($values['returned_qty']) && asInt($values['returned_qty'], 0) === null) sendJson(['ok' => false, 'error' => 'Returned quantity must be a non-negative integer.', 'code' => 'validation'], 400);
    if (isset($values['condition_in']) && !in_array($values['condition_in'], ['Good', 'Minor Damage', 'Damaged', 'Missing'], true)) sendJson(['ok' => false, 'error' => 'Invalid inspected condition.', 'code' => 'validation'], 400);
    if ($do === 'update') {
        $existing = $pdo->prepare('SELECT expected_qty,returned_qty FROM equipment_checklist WHERE checklist_id=?');
        $existing->execute([$id]);
        $old = $existing->fetch();
        if (!$old) sendJson(['ok' => false, 'error' => 'Checklist record not found.', 'code' => 'not_found'], 404);
    } else {
        $old = ['expected_qty' => 0, 'returned_qty' => 0];
    }
    $expected = (int)($values['expected_qty'] ?? $old['expected_qty']);
    $returned = (int)($values['returned_qty'] ?? $old['returned_qty']);
    if ($returned > $expected) sendJson(['ok' => false, 'error' => 'Returned quantity cannot exceed expected quantity.', 'code' => 'validation'], 400);
    if ($do === 'create') {
        $columns = array_keys($values);
        $pdo->prepare('INSERT INTO equipment_checklist (`' . implode('`,`', $columns) . '`) VALUES (' . implode(',', array_fill(0, count($columns), '?')) . ')')->execute(array_values($values));
        $id = (int)$pdo->lastInsertId();
    } else {
        if (array_intersect(['condition_in', 'returned_qty', 'return_status', 'inspection_notes'], array_keys($values))) $values['checked_by'] = (int)$user['user_id'];
        $columns = array_keys($values);
        $pdo->prepare('UPDATE equipment_checklist SET ' . implode(',', array_map(fn($f) => "`$f`=?", $columns)) . ' WHERE checklist_id=?')->execute([...array_values($values), $id]);
    }
    $s = $pdo->prepare('SELECT * FROM equipment_checklist WHERE checklist_id=?');
    $s->execute([$id]);
    $row = $s->fetch();
    if (!$row) sendJson(['ok' => false, 'error' => 'Checklist record not found.', 'code' => 'not_found'], 404);
    sendJson(['ok' => true, 'data' => $row], $do === 'create' ? 201 : 200);
}
sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
