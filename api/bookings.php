<?php
<<<<<<< HEAD
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/booking_pricing.php';
require_once __DIR__ . '/booking_items_service.php';
function bookingRow($id)
{
    $s = db()->prepare('SELECT b.*,b.booking_id AS id,c.full_name AS customer_name,c.contact_number AS contact FROM bookings b JOIN customers c ON c.customer_id=b.customer_id WHERE b.booking_id=?');
    $s->execute([$id]);
    $r = $s->fetch();
    if ($r) {
        $r['service_ids'] = json_decode($r['service_ids'] ?: '[]', true);
        $r['addon_ids'] = json_decode($r['addon_ids'] ?: '[]', true);
=======
require_once __DIR__ . '/booking_service.php';
$actor = requireAuth();
$ownerId = (int)$actor['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['do'] ?? ($method === 'GET' ? 'all' : '');
$id = asInt($_GET['id'] ?? null,1);
if ($method === 'GET' && $action === 'availability') {
    $serviceId = asInt($_GET['service_id'] ?? null,1);
    $excludeId = asInt($_GET['exclude_booking_id'] ?? 0,0) ?? 0;
    if (!$serviceId) domainFail('A valid service is required.');
    $start = bookingDatetime($_GET['event_start_datetime'] ?? null);
    $end = bookingDatetime($_GET['event_end_datetime'] ?? null);
    $preparation = bookingMinutes($_GET['preparation_minutes'] ?? 0);
    $travel = bookingMinutes($_GET['travel_minutes'] ?? 0);
    [$blockedStart,$blockedEnd] = blockedInterval($start,$end,$preparation,$travel);
    $result = domainTransaction(function(PDO $pdo) use ($serviceId,$excludeId,$blockedStart,$blockedEnd) {
        $q = $pdo->prepare("SELECT 1 FROM services WHERE service_id=? AND status='Active'");
        $q->execute([$serviceId]);
        if (!$q->fetchColumn()) domainFail('Select an active service.');
        reconcileBookings($pdo);
        $now = $pdo->query('SELECT NOW()')->fetchColumn();
        return availabilityConflicts($pdo,$serviceId,$blockedStart,$blockedEnd,$excludeId,$blockedEnd>$now);
    });
    sendJson(['ok'=>true,'data'=>[
        'available'=>!$result['bookings'] && !$result['blocks'],
        'blocked_start_datetime'=>$blockedStart,
        'blocked_end_datetime'=>$blockedEnd,
        'conflicts'=>$result
    ]]);
}
if ($method === 'GET' && in_array($action,['all','get'],true)) {
    domainTransaction(fn(PDO $pdo) => reconcileBookings($pdo));
    if ($action === 'get') {
        $row = $id ? bookingRow($id) : null;
        if (!$row) sendJson(['ok'=>false,'error'=>'Booking not found.','code'=>'not_found'],404);
        sendJson(['ok'=>true,'data'=>$row]);
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7
    }
    $rows = db()->query("SELECT b.*,c.full_name AS customer_name,c.contact_number AS contact,COALESCE(p.completed_payments,0) AS completed_payments,EXISTS(SELECT 1 FROM booking_conflict_overrides o WHERE o.booking_id=b.booking_id OR o.conflicting_booking_id=b.booking_id) AS has_approved_overlap FROM bookings b JOIN customers c ON c.customer_id=b.customer_id LEFT JOIN (SELECT booking_id,SUM(amount) AS completed_payments FROM payments WHERE payment_status='Completed' GROUP BY booking_id) p ON p.booking_id=b.booking_id ORDER BY b.event_start_datetime DESC")->fetchAll();
    sendJson(['ok'=>true,'data'=>array_map('bookingView',$rows)]);
}
if ($method === 'POST' && in_array($action,['create','update','cancel','delete','release','complete'],true)) {
    $body = readJsonBody();
    $savedId = domainTransaction(fn(PDO $pdo) => saveBooking($pdo,$action,$id,$body,$ownerId));
    sendJson(['ok'=>true,'data'=>bookingRow($savedId)],$action==='create' ? 201 : 200);
}
<<<<<<< HEAD
function checkSlot($date, $start, $end, $id, $status, $serviceId = null)
{
    if (!in_array(strtolower($status), ['confirmed', 'reserved', 'preparing', 'released'], true) || $serviceId !== 1) return;
    $s = db()->prepare("SELECT booking_id FROM bookings WHERE event_date=? AND service_id=1 AND LOWER(status) IN ('confirmed','reserved','preparing','released') AND booking_id<>? AND start_time<? AND end_time>? LIMIT 1");
    $s->execute([$date, $id, $end, $start]);
    if ($s->fetch()) sendJson(['ok' => false, 'error' => 'Time slot already booked.', 'code' => 'conflict'], 409);
}
$m = $_SERVER['REQUEST_METHOD'];
$do = $_GET['do'] ?? ($m === 'GET' ? 'all' : null);
$id = asInt($_GET['id'] ?? null, 1);
if ($m === 'GET' && $do === 'all') {
    $rs = db()->query('SELECT booking_id AS id,b.*,c.full_name AS customer_name,c.contact_number AS contact FROM bookings b JOIN customers c ON c.customer_id=b.customer_id ORDER BY event_date DESC')->fetchAll();
    foreach ($rs as &$r) {
        $r['service_ids'] = json_decode($r['service_ids'] ?: '[]', true);
        $r['addon_ids'] = json_decode($r['addon_ids'] ?: '[]', true);
    }
    sendJson(['ok' => true, 'data' => $rs]);
}
if ($m === 'GET' && $do === 'get' && $id) {
    $r = bookingRow($id);
    if (!$r) sendJson(['ok' => false, 'error' => 'Booking not found.', 'code' => 'not_found'], 404);
    sendJson(['ok' => true, 'data' => $r]);
}
if ($m === 'POST' && in_array($do, ['create', 'update'], true)) {
    requireAuth();
    $b = readJsonBody();
    $pdo = db();
    $pdo->beginTransaction();
    $pdo->query('SELECT service_id FROM services WHERE service_id=1 FOR UPDATE')->fetchColumn();
    if ($do === 'create') {
        $contact = $b['contact'] ?? $b['contact_number'] ?? '';
        $name = $b['customer_name'] ?? '';
        $cid = asInt($b['customer_id'] ?? null, 1);
        if ($cid) {
            $q = $pdo->prepare('SELECT customer_id FROM customers WHERE customer_id=?');
            $q->execute([$cid]);
            if (!$q->fetchColumn()) $cid = 0;
        }
        if (!$cid) {
            if (!$name || !$contact) sendJson(['ok' => false, 'error' => 'Customer name and contact are required.', 'code' => 'validation'], 400);
            $q = $pdo->prepare('SELECT customer_id FROM customers WHERE contact_number=? LIMIT 1');
            $q->execute([$contact]);
            $cid = $q->fetchColumn();
            if ($cid) {
                $pdo->prepare('UPDATE customers SET full_name=?,messenger_handle=COALESCE(?,messenger_handle) WHERE customer_id=?')->execute([$name, $b['email'] ?? null, $cid]);
            } else {
                $pdo->prepare('INSERT INTO customers(full_name,contact_number,messenger_handle) VALUES(?,?,?)')->execute([$name, $contact, $b['email'] ?? null]);
                $cid = $pdo->lastInsertId();
            }
        }
    }
    if ($do === 'update') {
        $old = bookingRow($id);
        if (!$old) sendJson(['ok' => false, 'error' => 'Booking not found.', 'code' => 'not_found'], 404);
        $cid = $old['customer_id'];
        foreach (['customer_name' => 'full_name', 'contact' => 'contact_number', 'email' => 'messenger_handle'] as $k => $col) if (isset($b[$k])) $pdo->prepare("UPDATE customers SET $col=? WHERE customer_id=?")->execute([$b[$k], $cid]);
    }
    $status = $b['status'] ?? ($do === 'update' ? $old['status'] : 'pending');
    $date = $b['event_date'] ?? ($old['event_date'] ?? null);
    $start = $b['start_time'] ?? ($old['start_time'] ?? null);
    $end = $b['end_time'] ?? ($old['end_time'] ?? null);
    if (!asDate($date) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/', (string)$start) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/', (string)$end) || strtotime($start) >= strtotime($end)) sendJson(['ok' => false, 'error' => 'Event date and times required.', 'code' => 'validation'], 400);
    $services = $b['service_ids'] ?? ($do === 'update' ? $old['service_ids'] : []);
    $svc = entityId($services[0] ?? ($old['service_id'] ?? null));
    $pkg = entityId($b['package_id'] ?? ($do === 'update' ? $old['package_id'] : null));
    if (!$pkg && $svc) {
        $q = $pdo->prepare('SELECT package_id FROM packages WHERE service_id=? ORDER BY package_id LIMIT 1');
        $q->execute([$svc]);
        $pkg = (int)$q->fetchColumn();
    }
    if (!$svc || !$pkg) sendJson(['ok' => false, 'error' => 'A valid service and package are required.', 'code' => 'validation'], 400);
    checkSlot($date, $start, $end, $do === 'update' ? $id : 0, $status, $svc);
    if (strtolower($status) === 'completed') {
        // Universal rule: mark completed only after all equipment on the booking
        // has been inspected and fully returned (mirrors finalizeReturn).
        // Must enforce independently of the frontend — a direct API call with
        // status=completed must also pass the equipment-return check.
        $q = $pdo->prepare('SELECT expected_qty, returned_qty, condition_in FROM equipment_checklist WHERE booking_id=?');
        $q->execute([$id]);
        $items = $q->fetchAll();
        foreach ($items as $item) {
            if ($item['returned_qty'] < (int) $item['expected_qty'] || strtolower((string) $item['condition_in']) === 'missing') {
                sendJson(['ok' => false, 'error' => 'All equipment must be returned before completing this booking.', 'code' => 'incomplete_inspection'], 400);
            }
        }
    }
    $addonIds = $b['addon_ids'] ?? ($do === 'update' ? $old['addon_ids'] : []);
    if (!is_array($addonIds)) sendJson(['ok' => false, 'error' => 'Add-ons must be an array.', 'code' => 'validation'], 400);
    $discount = $b['discount'] ?? ($do === 'update' ? $old['discount'] : 0);
    $fees = $b['fees'] ?? ($do === 'update' ? $old['fees'] : 0);
    try {
        $totals = calculateBookingTotals($pdo, $svc, $pkg, $addonIds, $discount, $fees);
    } catch (InvalidArgumentException $e) {
        sendJson(['ok' => false, 'error' => $e->getMessage(), 'code' => 'validation'], 400);
    }
    $map = ['customer_id' => $cid, 'service_id' => $svc, 'package_id' => $pkg, 'event_date' => $date, 'start_time' => $start, 'end_time' => $end, 'event_location' => $b['location'] ?? $b['event_location'] ?? ($old['event_location'] ?? null), 'status' => strtolower($status), 'service_ids' => json_encode($services), 'addon_ids' => json_encode($addonIds), 'discount' => $discount, 'fees' => $fees, 'subtotal' => $totals['subtotal'], 'addons_total' => $totals['addons_total'], 'total' => $totals['total'], 'amount_paid' => $do === 'create' ? 0 : ($b['amount_paid'] ?? $old['amount_paid']), 'payment_status' => $do === 'create' ? 'Unpaid' : ($b['payment_status'] ?? $old['payment_status']), 'source' => $b['source'] ?? ($old['source'] ?? null), 'guests' => $b['guests'] ?? ($old['guests'] ?? null), 'event_type' => $b['event_type'] ?? ($old['event_type'] ?? null), 'special_requests' => $b['special_requests'] ?? ($old['special_requests'] ?? null), 'email' => $b['email'] ?? ($old['email'] ?? null), 'customer_type' => $b['customer_type'] ?? ($old['customer_type'] ?? null)];
    if ($do === 'create') {
        $map['created_by'] = requireAuth()['user_id'];
        $cols = array_keys($map);
        $pdo->prepare('INSERT INTO bookings (`' . implode('`,`', $cols) . '`) VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')')->execute(array_values($map));
        $id = (int)$pdo->lastInsertId();
        ensureBookingItems($pdo, $id, $services);
    } else {
        $cols = array_keys($map);
        $pdo->prepare('UPDATE bookings SET ' . implode(',', array_map(fn($c) => "`$c`=?", $cols)) . ' WHERE booking_id=?')->execute([...array_values($map), $id]);
    }
    $pdo->commit();
    sendJson(['ok' => true, 'data' => bookingRow($id)], $do === 'create' ? 201 : 200);
}
if ($m === 'POST' && $do === 'delete' && $id) {
    requireAuth();
    $s = db()->prepare('DELETE FROM bookings WHERE booking_id=?');
    $s->execute([$id]);
    if (!$s->rowCount()) sendJson(['ok' => false, 'error' => 'Booking not found.', 'code' => 'not_found'], 404);
    sendJson(['ok' => true, 'data' => ['deleted' => true]]);
}
sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
=======
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'method_not_allowed'],405);
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7
