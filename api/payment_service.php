<?php
require_once __DIR__ . '/domain.php';

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
    lockBooking($pdo,$bid);
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
    if ($type===null) {
        $q=$pdo->prepare("SELECT GREATEST(b.agreed_total-COALESCE(SUM(CASE WHEN p.payment_status='Completed' AND p.payment_id<>? THEN p.amount ELSE 0 END),0),0) FROM bookings b LEFT JOIN payments p ON p.booking_id=b.booking_id WHERE b.booking_id=? GROUP BY b.booking_id,b.agreed_total");
        $q->execute([$id ?? 0,$bid]);
        $remaining=moneyCents($q->fetchColumn());
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
    $q=$pdo->prepare('SELECT * FROM payments WHERE payment_id=?'); $q->execute([$id]); return $q->fetch();
}
