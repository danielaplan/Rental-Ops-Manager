<?php
require_once __DIR__ . '/domain.php';

function reconcilePaymentLifecycleAfterSave(PDO $pdo, array $booking, int $ownerId, bool $isCorrection): void {
    $bookingId = (int)$booking['booking_id'];
    $q = $pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM payments WHERE booking_id=? AND payment_status='Completed'");
    $q->execute([$bookingId]);
    $balanceCents = max(0,moneyCents($booking['agreed_total'])-moneyCents($q->fetchColumn()));
    $balance = centsDecimal($balanceCents);

    if ($isCorrection && $booking['status']==='Completed' && $balanceCents>0) {
        $pdo->prepare("UPDATE bookings SET status='Awaiting Payment',completed_at=NULL WHERE booking_id=?")->execute([$bookingId]);
        $message = 'A payment correction reopened this booking. Collect the outstanding rental balance of ₱'.$balance.' before completing it again.';
        $pdo->prepare("INSERT INTO notifications(user_id,booking_id,notification_type,message,requires_action,created_at)
            SELECT user_id,?,'awaiting_payment',?,1,NOW() FROM users WHERE role='owner' AND account_status='Active'
            ON DUPLICATE KEY UPDATE message=VALUES(message),requires_action=1,resolved_at=NULL")->execute([$bookingId,$message]);
        auditWrite($pdo,$ownerId,'payment_correction_reopened','booking',$bookingId,
            'Completed payment correction left an outstanding rental balance of '.$balance.'. Equipment review remains preserved.',
            'Completed','Awaiting Payment');
        return;
    }

    if ($booking['status']==='Awaiting Payment') {
        $message = $balanceCents>0
            ? 'Collect the outstanding rental balance of ₱'.$balance.' before completing the booking.'
            : 'Payment is fully collected. Complete the booking to resolve this notification.';
        $pdo->prepare("UPDATE notifications SET message=?,requires_action=1,resolved_at=NULL
            WHERE booking_id=? AND notification_type='awaiting_payment'")->execute([$message,$bookingId]);
    }
}

function savePayment(PDO $pdo, string $action, ?int $id, array $body, array $owner): array {
    if (!in_array($action,['create','update'],true) || empty($owner['user_id'])) domainFail('An authenticated payment action is required.');
    if ($action === 'create') $id = null;
    $old = [];
    if ($action === 'update') {
        $q=$pdo->prepare('SELECT * FROM payments WHERE payment_id=?'); $q->execute([$id]); $old=$q->fetch();
        if (!$old) domainFail('Payment not found.',404,'not_found');
    }
    $bid=asInt($old['booking_id'] ?? $body['booking_id'] ?? null,1);
    if (!$bid) domainFail('A valid booking is required.');
    $booking=lockBooking($pdo,$bid);
    if ($old) {
        $q=$pdo->prepare('SELECT * FROM payments WHERE payment_id=? FOR UPDATE'); $q->execute([$id]); $old=$q->fetch();
        if (!is_string($body['correction_reason'] ?? null) || trim($body['correction_reason'])==='') domainFail('A correction reason is required.');
        if (array_key_exists('booking_id',$body) && asInt($body['booking_id'],1)!==$bid) domainFail('A payment cannot be moved to another booking.');
    }
    $data=$body+$old;
    $cents=moneyCents($data['amount'] ?? null);
    if ($cents===0) domainFail('Payment amount must be positive.');
    $method=is_string($data['payment_method'] ?? null) ? match(strtolower($data['payment_method'])) {'gcash'=>'GCash','maribank'=>'MariBank',default=>null} : null;
    $type=$data['payment_type'] ?? null;
    $status=$data['payment_status'] ?? 'Completed';
    $date=$data['payment_date'] ?? date('Y-m-d H:i:s');
    $parsed=is_string($date) ? DateTimeImmutable::createFromFormat('!Y-m-d H:i:s',$date) : false;
    if (!$method || ($type!==null && !in_array($type,['Down payment','Balance'],true)) || !in_array($status,['Pending','Completed','Failed'],true) || !$parsed || $parsed->format('Y-m-d H:i:s')!==$date) domainFail('Valid payment method, type, status, and date are required.');
    if ($parsed > new DateTimeImmutable('now')) domainFail('Payment date cannot be in the future.');
    $q=$pdo->prepare("SELECT GREATEST(b.agreed_total-COALESCE(SUM(CASE WHEN p.payment_status='Completed' AND p.payment_id<>? THEN p.amount ELSE 0 END),0),0) FROM bookings b LEFT JOIN payments p ON p.booking_id=b.booking_id WHERE b.booking_id=? GROUP BY b.booking_id,b.agreed_total");
    $q->execute([$id ?? 0,$bid]);
    $remaining=moneyCents($q->fetchColumn());
    if ($status==='Completed' && $cents>$remaining) domainFail('Completed payment exceeds the remaining booking balance.');
    if ($type===null) {
        $type=$cents<$remaining?'Down payment':'Balance';
    }
    $reference=$data['payment_reference'] ?? null;
    if ($reference!==null && (!is_string($reference) || strlen($reference)>150)) domainFail('Invalid payment reference.');
    if (isset($data['notes']) && !is_string($data['notes'])) domainFail('Payment notes must be text.');
    $values=[centsDecimal($cents),$method,$type,$status,$date,$reference,$data['notes'] ?? null];
    if ($old) {
        $pdo->prepare('UPDATE payments SET amount=?,payment_method=?,payment_type=?,payment_status=?,payment_date=?,payment_reference=?,notes=? WHERE payment_id=?')->execute([...$values,$id]);
    } else {
        $pdo->prepare("INSERT INTO payments(amount,payment_method,payment_type,payment_status,payment_date,payment_reference,notes,booking_id,recorded_by,recorded_at,provenance) VALUES(?,?,?,?,?,?,?,?,?,NOW(),'owner')")->execute([...$values,$bid,$owner['user_id']]);
        $id=(int)$pdo->lastInsertId();
    }
    auditWrite($pdo,$owner['user_id'],$old?'payment_corrected':'payment_recorded','payment',$id,json_encode(['before'=>$old ?: null,'after'=>$values,'reason'=>$body['correction_reason'] ?? null]));
    reconcilePaymentLifecycleAfterSave($pdo,$booking,(int)$owner['user_id'],(bool)$old);
    $q=$pdo->prepare('SELECT * FROM payments WHERE payment_id=?'); $q->execute([$id]); return $q->fetch();
}
