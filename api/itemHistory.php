<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/supporting_service.php';

$actor = requireAuth();
$do = $_GET['do'] ?? 'forItem';
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $do === 'forItem') {
    $item = asInt($_GET['rental_item_id'] ?? null,1);
    if (!$item) sendJson(['ok'=>false,'error'=>'Valid rental_item_id required.','code'=>'validation'],400);
    $query = db()->prepare('SELECT history_id,rental_item_id,booking_id,action,qty,`condition`,event_date AS date FROM item_history WHERE rental_item_id=? ORDER BY event_date DESC,history_id DESC');
    $query->execute([$item]);
    sendJson(['ok'=>true,'data'=>$query->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $do === 'create') {
    $body = readJsonBody();
    $row = domainTransaction(function (PDO $pdo) use ($actor,$body) {
        return saveItemHistory($pdo,$body,$actor);

    });
    sendJson(['ok'=>true,'data'=>$row],201);
}
sendJson(['ok'=>false,'error'=>'Item history is append-only.','code'=>'method_not_allowed'],405);
