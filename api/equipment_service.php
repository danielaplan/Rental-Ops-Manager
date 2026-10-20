<?php
require_once __DIR__.'/checklist_service.php';
require_once __DIR__.'/supporting_service.php';
function saveReturnInspection(PDO $pdo,int $bookingId,array $items,int $checkedBy): array {
    lockBooking($pdo,$bookingId);
    $expected=checklistRows($pdo,$bookingId); $seen=[];
    if (!$expected || count($expected)!==count($items)) domainFail('The inspection must include every checklist item.');
    foreach($items as $item) {
        if (!is_array($item)) domainFail('Invalid inspection item.');
        $id=asInt($item['checklist_item_id'] ?? $item['booking_item_id'] ?? null,1);
        if (!$id && isset($item['template_item_id'])) {
            foreach($expected as $row) if ((int)$row['template_item_id']===(int)$item['template_item_id']) $id=(int)$row['checklist_item_id'];
        }
        if (!$id && isset($item['rental_item_id'])) {
            foreach($expected as $row) if ((int)$row['rental_item_id']===(int)$item['rental_item_id']) $id=(int)$row['checklist_item_id'];
        }
        if (!$id || isset($seen[$id])) domainFail('Each checklist item must appear exactly once.');
        $seen[$id]=true;
        if (empty($item['condition_in']) && empty($item['condition'])) domainFail('Return condition is required.');
        $saved=updateChecklistItem($pdo,$bookingId,$id,$item,$checkedBy);
        if ($saved['rental_item_id'] !== null) saveItemHistory($pdo,[
            'rental_item_id'=>$saved['rental_item_id'],'booking_id'=>$bookingId,'action'=>'Returned',
            'qty'=>$saved['quantity_returned'],'condition'=>$saved['condition_in'],
        ],['user_id'=>$checkedBy]);
    }
    return checklistRows($pdo,$bookingId);
}
function finalizeBookingReturn(PDO $pdo,int $bookingId,int $checkedBy,array $review=[]): array {
    require_once __DIR__.'/availability_service.php';
    return releaseBooking($pdo,$bookingId,$review,$checkedBy);
}
