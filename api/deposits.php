<?php
require_once __DIR__.'/auth.php';
require_once __DIR__.'/deposit_service.php';
$owner=requireAuth();
$do=$_GET['do'] ?? 'get';
if ($_SERVER['REQUEST_METHOD']==='GET' && $do==='get') sendJson(['ok'=>true,'data'=>depositView(db(),asInt($_GET['booking_id'] ?? null,1) ?? 0)]);
if ($_SERVER['REQUEST_METHOD']==='POST' && in_array($do,['create','upsert','deduct','refund'],true)) {
    $body=readJsonBody();
    $row=domainTransaction(function(PDO $pdo) use ($body,$do,$owner) {
        $bid=asInt($body['booking_id'] ?? null,1);
        if (!$bid) domainFail('A valid booking is required.');
        lockBooking($pdo,$bid);
        if (in_array($do,['create','upsert'],true)) return saveDeposit($pdo,$bid,$body,(int)$owner['user_id']);
        $lock=$pdo->prepare('SELECT deposit_id FROM deposits WHERE booking_id=? FOR UPDATE');
        $lock->execute([$bid]);
        $deposit=depositView($pdo,$bid);
        if (!$deposit) domainFail('Deposit not found.',404,'not_found');
        if ($do==='deduct') addDepositDeduction($pdo,(int)$deposit['deposit_id'],$body,(int)$owner['user_id']);
        if ($do==='refund' && $deposit['refund_status']!=='Refunded') {
            $refundCents = moneyCents($deposit['refund_amount'] ?? '0.00');
            if ($refundCents <= 0) domainFail('No refundable balance remains for this deposit.',409,'invalid_state');
            $pdo->prepare("UPDATE deposits SET refund_status='Refunded',refund_date=NOW(),updated_at=NOW() WHERE deposit_id=?")->execute([$deposit['deposit_id']]);
            auditWrite($pdo,$owner['user_id'],'deposit_refunded','deposit',$deposit['deposit_id'],json_encode(['refund_amount'=>$deposit['refund_amount']]));
        }
        return depositView($pdo,$bid);
    });
    sendJson(['ok'=>true,'data'=>$row]);
}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
