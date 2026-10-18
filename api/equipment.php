<?php
require_once __DIR__.'/auth.php';
require_once __DIR__.'/equipment_service.php';
$owner=requireAuth(); $do=$_GET['do'] ?? 'all';
if ($_SERVER['REQUEST_METHOD']==='GET') {
    if ($do==='forBooking') sendJson(['ok'=>true,'data'=>checklistRows(db(),asInt($_GET['booking_id'] ?? null,1)??0)]);
    $id=asInt($_GET['id'] ?? null,1);
    $q=db()->prepare('SELECT * FROM booking_checklist_items'.($id?' WHERE checklist_item_id=?':'').' ORDER BY checklist_item_id'); $q->execute($id?[$id]:[]);
    sendJson(['ok'=>true,'data'=>$id?$q->fetch():$q->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD']==='POST' && in_array($do,['inspect','finalizeReturn'],true)) {
    $body=readJsonBody();
    $data=domainTransaction(function(PDO $pdo) use($body,$do,$owner) {
        $bid=asInt($body['booking_id'] ?? null,1); if (!$bid) domainFail('Booking is required.');
        if ($do==='finalizeReturn') return finalizeBookingReturn($pdo,$bid,(int)$owner['user_id'],$body);
        if (!is_array($body['items'] ?? null)) domainFail('Inspection items are required.');
        return ['booking_id'=>$bid,'items'=>saveReturnInspection($pdo,$bid,$body['items'],(int)$owner['user_id'])];
    });
    sendJson(['ok'=>true,'data'=>$data]);
}
sendJson(['ok'=>false,'error'=>'Use the retained booking checklist workflow.'],405);
