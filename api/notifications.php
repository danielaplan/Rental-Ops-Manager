<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/availability_service.php';

$actor = requireAuth();
$do = $_GET['do'] ?? 'unresolved';
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || !in_array($do,['all','unresolved'],true)) {
    sendJson(['ok'=>false,'error'=>'Notifications are read-only; workflow completion resolves action-required items.','code'=>'method_not_allowed'],405);
}

domainTransaction(fn(PDO $pdo) => reconcileBookings($pdo));
$limit = min(asInt($_GET['limit'] ?? 100,1) ?? 100,500);
$sql = 'SELECT n.*,b.booking_reference,b.status AS booking_status FROM notifications n JOIN bookings b ON b.booking_id=n.booking_id WHERE n.user_id=?';
if ($do === 'unresolved') $sql .= ' AND n.requires_action=1 AND n.resolved_at IS NULL';
$args = [(int)$actor['user_id']];
if (isset($_GET['booking_id'])) {
    $bookingId = asInt($_GET['booking_id'],1);
    if (!$bookingId) sendJson(['ok'=>false,'error'=>'Invalid booking ID.','code'=>'validation'],400);
    $sql .= ' AND n.booking_id=?';
    $args[] = $bookingId;
}
$sql .= ' ORDER BY n.created_at DESC,n.notification_id DESC LIMIT ' . $limit;
$query = db()->prepare($sql);
$query->execute($args);
sendJson(['ok'=>true,'data'=>$query->fetchAll()]);
