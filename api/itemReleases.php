<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/supporting_service.php';

$actor = requireAuth();
$do = $_GET['do'] ?? 'all';
if ($_SERVER['REQUEST_METHOD'] === 'GET' && in_array($do,['all','forBooking','get'],true)) {
    $id = asInt($_GET['id'] ?? null,1);
    $bookingId = asInt($_GET['booking_id'] ?? null,1);
    if ($do === 'get' && !$id) sendJson(['ok'=>false,'error'=>'Valid release ID required.','code'=>'validation'],400);
    if ($do === 'forBooking' && !$bookingId) sendJson(['ok'=>false,'error'=>'Valid booking_id required.','code'=>'validation'],400);
    $where = $do === 'get' ? ' WHERE release_id=?' : ($do === 'forBooking' ? ' WHERE booking_id=?' : '');
    $args = $do === 'get' ? [$id] : ($do === 'forBooking' ? [$bookingId] : []);
    $query = db()->prepare('SELECT * FROM item_releases' . $where . ' ORDER BY released_at DESC,release_id DESC');
    $query->execute($args);
    $rows = $query->fetchAll();
    if ($do === 'get' && !$rows) sendJson(['ok'=>false,'error'=>'Release record not found.','code'=>'not_found'],404);
    sendJson(['ok'=>true,'data'=>$do === 'get' ? $rows[0] : $rows]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $do === 'create') {
    $body = readJsonBody();
    $row = domainTransaction(function (PDO $pdo) use ($actor,$body) {
        return saveItemRelease($pdo,$body,$actor);

    });
    sendJson(['ok'=>true,'data'=>$row],201);
}
sendJson(['ok'=>false,'error'=>'Release history is append-only.','code'=>'method_not_allowed'],405);
