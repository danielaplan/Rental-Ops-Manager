<?php
require_once __DIR__ . '/domain.php';
function depositView(PDO $pdo, int $bookingId): ?array {
    $q=$pdo->prepare('SELECT * FROM deposits WHERE booking_id=?'); $q->execute([$bookingId]); $row=$q->fetch();
    if (!$row) return null;
    $q=$pdo->prepare('SELECT * FROM deposit_deductions WHERE deposit_id=? ORDER BY deduction_id'); $q->execute([$row['deposit_id']]);
    $row['deductions']=$q->fetchAll();
    $sum=0; foreach($row['deductions'] as $deduction) $sum+=moneyCents($deduction['amount']);
    $held=moneyCents($row['amount_held']);
    $refundable=max(0, $held-$sum);
    $row['deduction_amount']=centsDecimal($sum);
    $row['refund_amount']=centsDecimal($refundable);
    return $row;
}
function addDepositDeduction(PDO $pdo, int $depositId, array $body, int $ownerId): int {
    $q=$pdo->prepare('SELECT * FROM deposits WHERE deposit_id=? FOR UPDATE'); $q->execute([$depositId]); $deposit=$q->fetch();
    if (!$deposit) domainFail('Deposit not found.',404,'not_found');
    if ($deposit['refund_status']!=='Held') domainFail('A refunded deposit cannot be changed.');
    $amount=moneyCents($body['amount'] ?? null);
    if (!is_string($body['reason'] ?? null) || !is_string($body['affected_item'] ?? null)) domainFail('Deduction affected item and reason must be text.');
    $reason=trim($body['reason']);
    $item=trim($body['affected_item']);
    if (!$amount || $reason==='' || $item==='') domainFail('Deduction amount, affected item, and reason are required.');
    if (strlen($item)>255) domainFail('Affected item must contain at most 255 bytes.');
    $q=$pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM deposit_deductions WHERE deposit_id=?'); $q->execute([$depositId]);
    if (moneyCents($q->fetchColumn())+$amount>moneyCents($deposit['amount_held'])) domainFail('Deductions cannot exceed the held deposit.');
    $pdo->prepare('INSERT INTO deposit_deductions(deposit_id,affected_item,reason,amount,recorded_by,recorded_at) VALUES(?,?,?,?,?,NOW())')->execute([$depositId,$item,$reason,centsDecimal($amount),$ownerId]);
    $id=(int)$pdo->lastInsertId();
    auditWrite($pdo,$ownerId,'deposit_deduction','deduction',$id,json_encode($body));
    return $id;
}
function saveDeposit(PDO $pdo, int $bookingId, array $body, ?int $ownerId = null): array {
    if (!$ownerId) domainFail('An authenticated recording owner is required.');
    lockBooking($pdo,$bookingId);
    $held=moneyCents($body['amount_held'] ?? null);
    if ($held<=0) domainFail('Held deposit amount must be greater than zero.');
    if (isset($body['deduction_amount']) && moneyCents($body['deduction_amount'])>0) domainFail('Record each deduction through the itemized deduction action.');
    $old=depositView($pdo,$bookingId);
    if ($old) {
        $oldHeld=moneyCents($old['amount_held']);
        if ($held!==$oldHeld) {
            $repairableZero=$oldHeld===0
                && $old['refund_status']==='Held'
                && empty($old['refund_date'])
                && moneyCents($old['deduction_amount'])===0
                && count($old['deductions'])===0;
            if (!$repairableZero) domainFail('An existing held amount cannot be overwritten.');
            $pdo->prepare('UPDATE deposits SET amount_held=?,updated_at=NOW() WHERE deposit_id=?')->execute([centsDecimal($held),$old['deposit_id']]);
            auditWrite($pdo,$ownerId,'deposit_zero_corrected','deposit',(int)$old['deposit_id'],json_encode(['before'=>'0.00','after'=>centsDecimal($held)]));
            return depositView($pdo,$bookingId);
        }
        return $old;
    }
    $pdo->prepare("INSERT INTO deposits(booking_id,amount_held,refund_status,recorded_by,created_at,updated_at) VALUES(?,?,'Held',?,NOW(),NOW())")->execute([$bookingId,centsDecimal($held),$ownerId]);
    auditWrite($pdo,$ownerId,'deposit_recorded','deposit',(int)$pdo->lastInsertId(),json_encode(['amount_held'=>centsDecimal($held)]));
    return depositView($pdo,$bookingId);
}
