<?php
require_once __DIR__.'/domain.php';

function saveDelivery(PDO $p, array $body, array $actor): array {
    $bid = asInt($body['booking_id'] ?? null,1);
    if (!$bid) domainFail('Valid booking_id required.');
    lockBooking($p,$bid);
    $method = $body['delivery_method'] ?? '';
    $responsibility = $body['fee_shouldered_by'] ?? '';
    if (!is_string($responsibility)) domainFail('Invalid fee responsibility.');
    $responsibility = ['renter'=>'Customer','owner'=>'Owner','included'=>'Included in package'][$responsibility] ?? $responsibility;
    if (!in_array($method,['self_pickup','lalamove','owner_delivered'],true) || !in_array($responsibility,['Customer','Included in package','Owner'],true)) domainFail('Invalid delivery values.');
    $fee = centsDecimal(moneyCents($body['delivery_fee'] ?? 0));
    $s = $p->prepare('SELECT * FROM delivery WHERE booking_id=?');
    $s->execute([$bid]);
    $old = $s->fetch();
    $notes = $body['delivery_notes'] ?? ($old['delivery_notes'] ?? null);
    if ($notes!==null && !is_string($notes)) domainFail('Delivery notes must be text.');
    $p->prepare('INSERT INTO delivery(booking_id,delivery_method,delivery_fee,fee_shouldered_by,delivery_notes) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE delivery_method=VALUES(delivery_method),delivery_fee=VALUES(delivery_fee),fee_shouldered_by=VALUES(fee_shouldered_by),delivery_notes=VALUES(delivery_notes)')
        ->execute([$bid,$method,$fee,$responsibility,$notes]);
    $s->execute([$bid]);
    $delivery = $s->fetch();
    auditWrite($p,(int)$actor['user_id'],'delivery_update','delivery',$delivery['delivery_id'],'Updated delivery for booking '.$bid.'.');
    return $delivery;
}

function saveItemHistory(PDO $pdo, array $body, array $actor): array {
    $itemId = asInt($body['rental_item_id'] ?? null,1);
    $bookingId = asInt($body['booking_id'] ?? null,1);
    if (isset($body['booking_id']) && (!$bookingId || is_bool($body['booking_id']))) domainFail('A supplied booking_id must be a positive integer.');
    $action = $body['action'] ?? 'Updated';
    $quantity = asInt($body['qty'] ?? 0,0);
    $condition = $body['condition'] ?? null;
    if (!$itemId || !is_string($action) || trim($action)==='' || strlen($action)>40 || $quantity===null) domainFail('A valid item, action, and non-negative quantity are required.');
    if ($condition!==null && (!is_string($condition) || strlen($condition)>100)) domainFail('Invalid item condition.');
    if ($bookingId) lockBooking($pdo,$bookingId);
    $query = $pdo->prepare('SELECT rental_item_id FROM rental_items WHERE rental_item_id=?');
    $query->execute([$itemId]);
    if (!$query->fetchColumn()) domainFail('Rental item not found.',404,'not_found');
    $pdo->prepare('INSERT INTO item_history(rental_item_id,booking_id,action,qty,`condition`) VALUES(?,?,?,?,?)')
        ->execute([$itemId,$bookingId,$action,$quantity,$condition]);
    $id = (int)$pdo->lastInsertId();
    auditWrite($pdo,(int)$actor['user_id'],'item_history_recorded','item_history',$id,json_encode($body));
    $query = $pdo->prepare('SELECT history_id,rental_item_id,booking_id,action,qty,`condition`,event_date AS date FROM item_history WHERE history_id=?');
    $query->execute([$id]);
    return $query->fetch();
}

function saveItemRelease(PDO $pdo, array $body, array $actor): array {
    $bookingId = asInt($body['booking_id'] ?? null,1);
    $releasedBy = $body['released_by'] ?? null;
    $notes = $body['notes'] ?? '';
    if (!$bookingId || !is_string($releasedBy) || trim($releasedBy)==='' || strlen($releasedBy)>100) domainFail('A booking and release label of at most 100 bytes are required.');
    if (!is_string($notes) || strlen($notes)>5000) domainFail('Release notes must be text of at most 5000 bytes.');
    lockBooking($pdo,$bookingId);
    $pdo->prepare('INSERT INTO item_releases(booking_id,released_by,notes,released_at) VALUES(?,?,?,NOW())')
        ->execute([$bookingId,trim($releasedBy),$notes]);
    $id = (int)$pdo->lastInsertId();
    auditWrite($pdo,(int)$actor['user_id'],'items_released','item_release',$id,json_encode(['booking_id'=>$bookingId,'released_by'=>trim($releasedBy),'notes'=>$notes]));
    $query = $pdo->prepare('SELECT * FROM item_releases WHERE release_id=?');
    $query->execute([$id]);
    return $query->fetch();
}
