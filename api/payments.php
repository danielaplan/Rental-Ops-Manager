<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/payment_service.php';
$owner = requireAuth();
$do = $_GET['do'] ?? 'all';
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $do === 'all') {
    $q = db()->prepare('SELECT * FROM payments' . (isset($_GET['booking_id']) ? ' WHERE booking_id=?' : '') . ' ORDER BY payment_date DESC,payment_id DESC');
    $q->execute(isset($_GET['booking_id']) ? [asInt($_GET['booking_id'],1)] : []);
    sendJson(['ok'=>true,'data'=>$q->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($do,['create','update'],true)) {
    $body = readJsonBody();
    $row = domainTransaction(function(PDO $pdo) use ($do,$body,$owner) {
        $id = asInt($_GET['id'] ?? $body['payment_id'] ?? null,1);
        return savePayment($pdo,$do,$id,$body,$owner);
    });
    sendJson(['ok'=>true,'data'=>$row],$do==='create'?201:200);
}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
