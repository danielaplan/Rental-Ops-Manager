<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/supporting_service.php';
$actor = requireAuth();
$do = $_GET['do'] ?? '';
$p = db();
if ($_SERVER['REQUEST_METHOD']==='GET' && $do==='get') {
    $bid = asInt($_GET['booking_id'] ?? null,1);
    if (!$bid) sendJson(['ok'=>false,'error'=>'Valid booking_id required.','code'=>'validation'],400);
    $s = $p->prepare('SELECT * FROM delivery WHERE booking_id=?');
    $s->execute([$bid]);
    sendJson(['ok'=>true,'data'=>$s->fetch() ?: null]);
}
if ($_SERVER['REQUEST_METHOD']==='POST' && $do==='upsert') {
    $body = readJsonBody();
    $result = domainTransaction(function () use ($p,$body,$actor) {
        return saveDelivery($p,$body,$actor);

    });
    sendJson(['ok'=>true,'data'=>$result]);
}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
