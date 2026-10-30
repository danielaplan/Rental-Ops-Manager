<?php
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
    }
    $rows = db()->query("SELECT b.*,c.full_name AS customer_name,c.contact_number AS contact,COALESCE(p.completed_payments,0) AS completed_payments,EXISTS(SELECT 1 FROM booking_conflict_overrides o WHERE o.booking_id=b.booking_id OR o.conflicting_booking_id=b.booking_id) AS has_approved_overlap FROM bookings b JOIN customers c ON c.customer_id=b.customer_id LEFT JOIN (SELECT booking_id,SUM(amount) AS completed_payments FROM payments WHERE payment_status='Completed' GROUP BY booking_id) p ON p.booking_id=b.booking_id ORDER BY b.event_start_datetime DESC")->fetchAll();
    sendJson(['ok'=>true,'data'=>array_map('bookingView',$rows)]);
}
if ($method === 'POST' && $action==='overrideStatus') {
    $body=readJsonBody();
    $status=is_string($body['status'] ?? null) ? trim($body['status']) : '';
    $savedId=domainTransaction(fn(PDO $pdo)=>overrideBookingStatus($pdo,$id ?? 0,$status,$ownerId));
    sendJson(['ok'=>true,'data'=>bookingRow($savedId)]);
}
if ($method === 'POST' && in_array($action,['create','update','cancel','delete','release','complete'],true)) {
    $body = readJsonBody();
    $savedId = domainTransaction(fn(PDO $pdo) => saveBooking($pdo,$action,$id,$body,$ownerId));
    sendJson(['ok'=>true,'data'=>bookingRow($savedId)],$action==='create' ? 201 : 200);
}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'method_not_allowed'],405);
