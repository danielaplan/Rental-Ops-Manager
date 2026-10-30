<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/availability_service.php';

$actor = requireAuth();
$do = $_GET['do'] ?? 'unresolved';
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || !in_array($do,['all','unresolved'],true)) {
    sendJson(['ok'=>false,'error'=>'Notifications are read-only; workflow completion resolves action-required items.','code'=>'method_not_allowed'],405);
}

domainTransaction(function(PDO $pdo): void {
    reconcileBookings($pdo);
    $pdo->exec("UPDATE notifications n
        JOIN bookings b ON b.booking_id=n.booking_id
        SET n.resolved_at=COALESCE(n.resolved_at,NOW())
        WHERE n.resolved_at IS NULL AND n.requires_action=1
        AND ((n.notification_type='awaiting_completion' AND b.status<>'Awaiting Completion')
          OR (n.notification_type='awaiting_payment' AND b.status<>'Awaiting Payment'))");
});
$limit = min(asInt($_GET['limit'] ?? 100,1) ?? 100,500);
$sql = "SELECT n.*,b.booking_reference,b.status AS booking_status,b.event_date,b.start_time,b.end_time,
    c.full_name AS customer_name,s.service_name,
    GREATEST(b.agreed_total-COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.booking_id=b.booking_id AND p.payment_status='Completed'),0),0) AS outstanding_balance
    FROM notifications n
    JOIN bookings b ON b.booking_id=n.booking_id
    JOIN customers c ON c.customer_id=b.customer_id
    JOIN services s ON s.service_id=b.service_id
    WHERE n.user_id=?";
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
