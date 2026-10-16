<?php
require_once __DIR__ . '/catalog_definitions.php';
requireAuth();
if ($_SERVER['REQUEST_METHOD']==='GET' && ($_GET['do'] ?? '') === 'history') {
    $id = asInt($_GET['id'] ?? $_GET['customer_id'] ?? null,1);
    if (!$id) sendJson(['ok'=>false,'error'=>'Valid customer_id required.','code'=>'validation'],400);
    $s = db()->prepare('SELECT * FROM customers WHERE customer_id=?');
    $s->execute([$id]);
    $customer = $s->fetch();
    if (!$customer) sendJson(['ok'=>false,'error'=>'Customer not found.','code'=>'not_found'],404);
    $s = db()->prepare('SELECT * FROM bookings WHERE customer_id=? ORDER BY event_start_datetime DESC,booking_id DESC');
    $s->execute([$id]);
    sendJson(['ok'=>true,'data'=>['customer'=>$customer,'bookings'=>$s->fetchAll()]]);
}
if ($_SERVER['REQUEST_METHOD']==='GET' && ($_GET['do'] ?? '') === 'search') {
    if (!is_string($_GET['q'] ?? '')) sendJson(['ok'=>false,'error'=>'Search must be text.','code'=>'validation'],400);
    $q = '%' . ($_GET['q'] ?? '') . '%';
    $s = db()->prepare('SELECT * FROM customers WHERE full_name LIKE ? OR contact_number LIKE ? ORDER BY customer_id DESC');
    $s->execute([$q, $q]);
    sendJson(['ok' => true, 'data' => $s->fetchAll()]);
}
tableCrud(...customerCrudDefinition());
