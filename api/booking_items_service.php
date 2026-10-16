<?php
require_once __DIR__.'/checklist_service.php';
function ensureBookingItems(PDO $pdo,int $bookingId,array $serviceIds=[]): array {
    $booking=lockBooking($pdo,$bookingId);
    return copyBookingChecklist($pdo,$bookingId,$booking['package_id']?(int)$booking['package_id']:null);
}
