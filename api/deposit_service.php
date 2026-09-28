<?php
function saveDeposit(PDO $pdo,int $bookingId,array $body): array {
    $held=asDecimal($body['amount_held']??null);$ded=asDecimal($body['deduction_amount']??0);$reason=trim((string)($body['deduction_reason']??''));
    if($bookingId<1||$held===null||$ded===null||(float)$held<0||(float)$ded<0||(float)$ded>(float)$held||((float)$ded>0&&$reason===''))throw new InvalidArgumentException('Valid booking and non-negative amounts are required. Deductions must not exceed the deposit and must have a reason.');
    $q=$pdo->prepare('SELECT booking_id FROM bookings WHERE booking_id=?');$q->execute([$bookingId]);if(!$q->fetchColumn())throw new InvalidArgumentException('Booking not found.');
    $status=(float)$held<=0?'pending':((float)$ded<=0?'full':((float)$ded<(float)$held?'partial':'none'));
    $pdo->prepare('INSERT INTO deposits(booking_id,amount_held,deduction_amount,deduction_reason,refund_status) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE amount_held=VALUES(amount_held),deduction_amount=VALUES(deduction_amount),deduction_reason=VALUES(deduction_reason),refund_status=VALUES(refund_status)')->execute([$bookingId,$held,$ded,$reason,$status]);
    $q=$pdo->prepare('SELECT * FROM deposits WHERE booking_id=?');$q->execute([$bookingId]);$row=$q->fetch();$row['refund_amount']=number_format((float)$held-(float)$ded,2,'.','');return $row;
}
