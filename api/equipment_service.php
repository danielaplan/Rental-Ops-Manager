<?php
require_once __DIR__.'/config.php';

/** Persist and validate one complete return inspection as a single transaction. */
function saveReturnInspection(PDO $pdo, int $bookingId, array $items, int $checkedBy): array {
    if ($bookingId < 1 || count($items) === 0) {
        throw new InvalidArgumentException('Booking and at least one inspected item are required.');
    }
    $allowedConditions = ['Good', 'Minor Damage', 'Damaged', 'Missing'];
    $seen = [];
    $ownsTransaction = !$pdo->inTransaction();
    if ($ownsTransaction) $pdo->beginTransaction();
    try {
        $booking = $pdo->prepare('SELECT booking_id FROM bookings WHERE booking_id=?');
        $booking->execute([$bookingId]);
        if (!$booking->fetchColumn()) throw new InvalidArgumentException('Booking not found.');
        $expectedCount = $pdo->prepare('SELECT COUNT(*) FROM booking_items WHERE booking_id=?');
        $expectedCount->execute([$bookingId]);
        $expectedTotal = (int)$expectedCount->fetchColumn();
        if ($expectedTotal === 0) throw new InvalidArgumentException('This booking has no saved equipment checklist.');

        $lookup = $pdo->prepare('SELECT booking_item_id,name,expected_qty FROM booking_items WHERE booking_id=? AND rental_item_id=? FOR UPDATE');
        $updateBookingItem = $pdo->prepare('UPDATE booking_items SET returned_qty=?,`condition`=?,notes=? WHERE booking_item_id=?');
        $upsertEquipment = $pdo->prepare('INSERT INTO equipment_checklist(booking_id,rental_item_id,item_name,condition_in,expected_qty,returned_qty,inspection_notes,return_status,checked_by) VALUES(?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE item_name=VALUES(item_name),condition_in=VALUES(condition_in),expected_qty=VALUES(expected_qty),returned_qty=VALUES(returned_qty),inspection_notes=VALUES(inspection_notes),return_status=VALUES(return_status),checked_by=VALUES(checked_by)');
        $saved = [];
        foreach ($items as $item) {
            if (!is_array($item)) throw new InvalidArgumentException('Each inspection item must be an object.');
            $rentalId = asInt($item['rental_item_id'] ?? null, 1);
            $returned = asInt($item['returned_qty'] ?? null, 0);
            $condition = $item['condition'] ?? null;
            $notes = $item['notes'] ?? '';
            if (!$rentalId || $returned === null || !in_array($condition, $allowedConditions, true) || !is_string($notes) || strlen($notes) > 2000) {
                throw new InvalidArgumentException('Inspection item has an invalid item id, quantity, condition, or note.');
            }
            if (isset($seen[$rentalId])) throw new InvalidArgumentException('An item may only appear once in an inspection.');
            $seen[$rentalId] = true;
            $lookup->execute([$bookingId, $rentalId]);
            $expectedItem = $lookup->fetch();
            if (!$expectedItem) throw new InvalidArgumentException('An inspected item is not assigned to this booking.');
            $expected = (int)$expectedItem['expected_qty'];
            if ($returned > $expected) throw new InvalidArgumentException('Returned quantity cannot exceed the expected quantity.');
            $returnStatus = ($condition === 'Missing' || $returned < $expected) ? 'missing' : (str_contains($condition, 'Damage') ? 'damaged' : 'inspected');
            $updateBookingItem->execute([$returned, $condition, $notes, $expectedItem['booking_item_id']]);
            $upsertEquipment->execute([$bookingId,$rentalId,$expectedItem['name'],$condition,$expected,$returned,$notes,$returnStatus,$checkedBy]);
            $saved[] = ['rental_item_id'=>$rentalId,'item_name'=>$expectedItem['name'],'expected_qty'=>$expected,'returned_qty'=>$returned,'condition'=>$condition,'notes'=>$notes,'return_status'=>$returnStatus];
        }
        if (count($seen) !== $expectedTotal) throw new InvalidArgumentException('The inspection must include every item on the booking checklist.');
        if ($ownsTransaction) $pdo->commit();
        return $saved;
    } catch (Throwable $e) {
        if ($ownsTransaction && $pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

/** Complete only a fully inspected and returned checklist; participates in the caller's transaction. */
function finalizeBookingReturn(PDO $pdo,int $bookingId,int $checkedBy): array {
    $ownsTransaction=!$pdo->inTransaction();if($ownsTransaction)$pdo->beginTransaction();
    try{
        $q=$pdo->prepare('SELECT booking_id FROM bookings WHERE booking_id=? FOR UPDATE');$q->execute([$bookingId]);
        if(!$q->fetchColumn())throw new InvalidArgumentException('Booking not found.');
        $q=$pdo->prepare('SELECT rental_item_id,returned_qty,condition_in,inspection_notes FROM equipment_checklist WHERE booking_id=?');$q->execute([$bookingId]);
        $items=array_map(fn($r)=>['rental_item_id'=>$r['rental_item_id'],'returned_qty'=>$r['returned_qty'],'condition'=>$r['condition_in'],'notes'=>$r['inspection_notes']??''],$q->fetchAll());
        $saved=saveReturnInspection($pdo,$bookingId,$items,$checkedBy);
        foreach($saved as $item)if($item['returned_qty']<$item['expected_qty']||$item['condition']==='Missing')throw new InvalidArgumentException('All equipment must be returned before completing this booking.');
        $pdo->prepare("UPDATE bookings SET status='completed' WHERE booking_id=?")->execute([$bookingId]);
        if($ownsTransaction)$pdo->commit();
        return ['booking_id'=>$bookingId,'status'=>'completed'];
    }catch(Throwable $e){if($ownsTransaction&&$pdo->inTransaction())$pdo->rollBack();throw $e;}
}
