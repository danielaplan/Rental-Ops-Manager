<?php
require_once __DIR__.'/domain.php';
function checklistRows(PDO $pdo,int $bookingId): array {
    $q=$pdo->prepare('SELECT c.*,checklist_item_id AS booking_item_id,item_name_snapshot AS name,expected_quantity AS expected_qty,quantity_released AS released_qty,quantity_returned AS returned_qty,condition_in AS `condition`,IF(COALESCE(quantity_released,0)=expected_quantity,1,0) AS checked_released FROM booking_checklist_items c WHERE booking_id=? ORDER BY checklist_item_id');
    $q->execute([$bookingId]); return $q->fetchAll();
}
function copyBookingChecklist(PDO $pdo,int $bookingId,?int $packageId): array {
    lockBooking($pdo,$bookingId);
    $existing=checklistRows($pdo,$bookingId);
    if ($existing || !$packageId) return $existing;
    $q=$pdo->prepare("SELECT template_id FROM checklist_templates WHERE package_id=? AND status='Active' ORDER BY template_id FOR UPDATE");
    $q->execute([$packageId]); $templates=$q->fetchAll(PDO::FETCH_COLUMN);
    if (count($templates)>1) domainFail('The package has multiple active checklist templates.');
    if ($templates) $pdo->prepare('INSERT INTO booking_checklist_items(booking_id,template_item_id,item_name_snapshot,expected_quantity) SELECT ?,template_item_id,item_name,expected_quantity FROM checklist_template_items WHERE template_id=? ORDER BY template_item_id')->execute([$bookingId,$templates[0]]);
    return checklistRows($pdo,$bookingId);
}
function updateChecklistItem(PDO $pdo,int $bookingId,int $itemId,array $body,int $ownerId): array {
    $booking=lockBooking($pdo,$bookingId);
    if (in_array($booking['status'],['Awaiting Payment','Completed','Cancelled'],true)) domainFail('Released or historical checklists cannot be edited.');
    $q=$pdo->prepare('SELECT * FROM booking_checklist_items WHERE checklist_item_id=? AND booking_id=? FOR UPDATE'); $q->execute([$itemId,$bookingId]); $old=$q->fetch();
    if (!$old) domainFail('Checklist item not found.',404,'not_found');
    $releasedValue=$body['quantity_released'] ?? $body['released_qty'] ?? (array_key_exists('checked_released',$body) ? (!empty($body['checked_released']) ? $old['expected_quantity'] : 0) : $old['quantity_released']);
    $released=asInt($releasedValue,0);
    $returned=asInt($body['quantity_returned'] ?? $body['returned_qty'] ?? $old['quantity_returned'],0);
    if ($released===null || $returned===null || $released>(int)$old['expected_quantity'] || $returned>$released) domainFail('Quantities must satisfy returned <= released <= expected.');
    $out=$body['condition_out'] ?? $old['condition_out'];
    if ($released>0 && !$out && !empty($body['checked_released'])) $out='Good';
    $in=$body['condition_in'] ?? $body['condition'] ?? $old['condition_in'];
    $allowed=['Good','Minor Damage','Damaged','Missing','Unwashed'];
    if (($out!==null && !in_array($out,$allowed,true)) || ($in!==null && !in_array($in,$allowed,true))) domainFail('Invalid checklist condition.');
    if ($released>0 && !$out) domainFail('Release condition is required.');
    $status=$in===null?'pending':(($returned<$released || $in==='Missing')?'missing':(in_array($in,['Minor Damage','Damaged'],true)?'damaged':'inspected'));
    $pdo->prepare('UPDATE booking_checklist_items SET quantity_released=?,quantity_returned=?,condition_out=?,condition_in=?,return_status=?,checked_by=?,checked_at=NOW() WHERE checklist_item_id=?')->execute([$released,$returned,$out,$in,$status,$ownerId,$itemId]);
    auditWrite($pdo,$ownerId,'checklist_updated','checklist',$itemId,json_encode(['before'=>$old,'after'=>[$released,$returned,$out,$in,$status]]));
    $q->execute([$itemId,$bookingId]); return $q->fetch();
}
