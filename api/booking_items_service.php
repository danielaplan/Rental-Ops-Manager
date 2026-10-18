<?php
<<<<<<< HEAD

function bookingItemEntityId($value): ?int
{
    if (is_int($value) || ctype_digit((string)$value)) return (int)$value;
    return preg_match('/-(\d+)$/', (string)$value, $match) ? (int)$match[1] : null;
}

function ensureBookingItems(PDO $pdo, int $bookingId, array $serviceIds): array
{
    $insert = $pdo->prepare(
        'INSERT INTO booking_items(booking_id,rental_item_id,service_id,name,expected_qty,released_qty,returned_qty,required,checked_released)
         SELECT ?,r.rental_item_id,r.service_id,r.name,r.quantity,0,0,r.required,0
         FROM rental_items r
         WHERE r.service_id=?
           AND NOT EXISTS (
             SELECT 1 FROM booking_items bi
             WHERE bi.booking_id=? AND bi.rental_item_id=r.rental_item_id
           )'
    );
    foreach ($serviceIds as $serviceId) {
        $serviceId = bookingItemEntityId($serviceId);
        if ($serviceId) $insert->execute([$bookingId, $serviceId, $bookingId]);
    }
    $items = $pdo->prepare('SELECT * FROM booking_items WHERE booking_id=? ORDER BY booking_item_id');
    $items->execute([$bookingId]);
    return $items->fetchAll();
=======
require_once __DIR__.'/checklist_service.php';
function ensureBookingItems(PDO $pdo,int $bookingId,array $serviceIds=[]): array {
    $booking=lockBooking($pdo,$bookingId);
    return copyBookingChecklist($pdo,$bookingId,$booking['package_id']?(int)$booking['package_id']:null);
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7
}
