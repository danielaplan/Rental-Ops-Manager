<?php
require_once __DIR__.'/auth.php';
require_once __DIR__.'/checklist_service.php';
$owner=requireAuth(); $do=$_GET['do'] ?? 'forBooking';
if ($_SERVER['REQUEST_METHOD']==='GET' && $do==='forBooking') sendJson(['ok'=>true,'data'=>checklistRows(db(),asInt($_GET['booking_id'] ?? null,1)??0)]);
if ($_SERVER['REQUEST_METHOD']==='POST' && in_array($do,['generate','update'],true)) {
    $body=readJsonBody();
    $data=domainTransaction(function(PDO $pdo) use($owner,$do,$body) {
        $id=asInt($_GET['id'] ?? $body['checklist_item_id'] ?? $body['booking_item_id'] ?? null,1);
        $bid=asInt($body['booking_id'] ?? null,1);
        if (!$bid && $id) { $q=$pdo->prepare('SELECT booking_id FROM booking_checklist_items WHERE checklist_item_id=?'); $q->execute([$id]); $bid=(int)$q->fetchColumn(); }
        if (!$bid) domainFail('Booking is required.');
        if ($do==='generate') { $booking=lockBooking($pdo,$bid); return copyBookingChecklist($pdo,$bid,$booking['package_id']?(int)$booking['package_id']:null); }
        if (!$id) domainFail('Checklist item ID is required.');
        return updateChecklistItem($pdo,$bid,$id,$body,(int)$owner['user_id']);
    });
    sendJson(['ok'=>true,'data'=>$data]);
}
sendJson(['ok'=>false,'error'=>'Checklist snapshots cannot be deleted or replaced.','code'=>'validation'],405);
