<?php
require_once __DIR__ . '/domain.php';

function bookingDatetime($value): string {
    if (!is_string($value)) domainFail('A valid event datetime is required.');
    $value = str_replace('T', ' ', $value);
    if (strlen($value) === 16) $value .= ':00';
    $date = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $value);
    if (!$date || $date->format('Y-m-d H:i:s') !== $value) domainFail('A valid event datetime is required.');
    return $value;
}
function bookingMinutes($value): int {
    if (is_bool($value) || !is_scalar($value) || !preg_match('/^\d+$/D', (string)$value) || (float)$value > 525600) domainFail('Allowances must be whole minutes between zero and 525600.');
    return (int)$value;
}
function blockedInterval(string $start, string $end, int $preparation, int $travel): array {
    if ($start >= $end) domainFail('Event end must be after event start.');
    $from = (new DateTimeImmutable($start))->modify("-$preparation minutes")->format('Y-m-d H:i:s');
    $until = (new DateTimeImmutable($end))->modify("+$travel minutes")->format('Y-m-d H:i:s');
    if (substr($from, 0, 4) < '1000' || substr($until, 0, 4) > '9999') domainFail('Blocked interval is outside the supported date range.');
    return [$from, $until];
}
function lockServices(PDO $pdo): void {
    // Three shared service locks serialize confirmations, blocks, reconciliation, and release in the same order.
    $pdo->query('SELECT service_id FROM services ORDER BY service_id FOR UPDATE')->fetchAll();
}
function reconcileBookings(PDO $pdo): int {
    lockServices($pdo);
    $rows = $pdo->query("SELECT booking_id,blocked_end_datetime FROM bookings WHERE status='Confirmed' AND released_by IS NULL AND blocked_end_datetime<=NOW() ORDER BY booking_id FOR UPDATE")->fetchAll();
    foreach ($rows as $row) {
        $pdo->prepare("UPDATE bookings SET status='Awaiting Completion',awaiting_completion_at=COALESCE(awaiting_completion_at,blocked_end_datetime) WHERE booking_id=?")->execute([$row['booking_id']]);
        $pdo->prepare("INSERT INTO notifications(user_id,booking_id,notification_type,message,requires_action,created_at) SELECT user_id,?,'awaiting_completion','Post-event review and manual service release required.',1,NOW() FROM users WHERE role='owner' AND account_status='Active' ON DUPLICATE KEY UPDATE notification_id=notification_id")->execute([$row['booking_id']]);
        auditWrite($pdo, null, 'status_change', 'booking', $row['booking_id'], 'Scheduled blocked end reached.', 'Confirmed', 'Awaiting Completion', 'system');
    }
    return count($rows);
}
function availabilityConflicts(PDO $pdo, int $serviceId, string $start, string $end, int $excludeId = 0, bool $includeUnreleased = false): array {
    $q = $pdo->prepare("SELECT b.booking_id,b.booking_reference,b.service_id,b.status,b.blocked_start_datetime,b.blocked_end_datetime,
        b.event_start_datetime,b.event_end_datetime,c.full_name AS customer_name,s.service_name,
        CASE WHEN b.status='Awaiting Completion' OR (b.status='Confirmed' AND b.released_by IS NULL AND b.blocked_end_datetime<=NOW()) THEN NULL ELSE b.blocked_end_datetime END AS effective_blocked_end_datetime
        FROM bookings b JOIN customers c ON c.customer_id=b.customer_id JOIN services s ON s.service_id=b.service_id
        WHERE b.service_id=? AND b.booking_id<>? AND b.status IN ('Confirmed','Awaiting Completion')
        AND ((?=1 AND (b.status='Awaiting Completion' OR (b.released_by IS NULL AND b.blocked_end_datetime<=NOW())))
          OR (b.blocked_start_datetime<? AND b.blocked_end_datetime>?)) ORDER BY b.booking_id");
    $q->execute([$serviceId, $excludeId, (int)$includeUnreleased, $end, $start]);
    $bookings = $q->fetchAll();
    $q = $pdo->prepare("SELECT * FROM availability_blocks WHERE status='Active' AND (service_id=? OR service_id IS NULL) AND start_datetime<? AND end_datetime>? ORDER BY block_id");
    $q->execute([$serviceId, $end, $start]);
    return ['bookings'=>$bookings, 'blocks'=>$q->fetchAll()];
}
function requireConflictApproval(array $conflicts, array $body): string {
    if (!$conflicts['bookings'] && !$conflicts['blocks']) return '';
    $reason = is_string($body['override_reason'] ?? null) ? trim($body['override_reason']) : '';
    $approved = $body['approve_conflicts'] ?? false;
    $ids = $body['conflicting_booking_ids'] ?? [];
    $expected = array_map('intval', array_column($conflicts['bookings'], 'booking_id'));
    $actual = is_array($ids) ? array_map('intval', $ids) : [];
    sort($expected); sort($actual);
    if ($conflicts['blocks'] || $approved !== true || $reason === '' || $actual !== $expected) {
        $error = new DomainError('Review current conflicts and explicitly approve each booking overlap with a reason. Active availability blocks cannot be overridden.', 409, 'conflict');
        $error->details = $conflicts;
        throw $error;
    }
    return $reason;
}
function recordConflictApproval(PDO $pdo, int $bookingId, array $conflicts, string $reason, int $ownerId): void {
    foreach ($conflicts['bookings'] as $conflict) {
        $pdo->prepare('INSERT INTO booking_conflict_overrides(booking_id,conflicting_booking_id,approved_by,reason,approved_at) VALUES(?,?,?,?,NOW())')->execute([$bookingId,$conflict['booking_id'],$ownerId,$reason]);
        auditWrite($pdo,$ownerId,'overlap_override','booking',$bookingId,'Overlap with booking '.$conflict['booking_id'].': '.$reason);
    }
}
function releaseBooking(PDO $pdo, int $id, array $body, int $ownerId): array {
    require_once __DIR__ . '/checklist_service.php';
    reconcileBookings($pdo);
    $booking = lockBooking($pdo, $id);
    if ($booking['status'] === 'Completed') return $booking;
    $q = $pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM payments WHERE booking_id=? AND payment_status='Completed'");
    $q->execute([$id]);
    $balanceCents = max(0, moneyCents($booking['agreed_total']) - moneyCents($q->fetchColumn()));
    $balance = centsDecimal($balanceCents);
    if ($booking['status'] === 'Awaiting Payment') {
        if ($balanceCents > 0) domainFail('Outstanding rental balance: ₱'.$balance.'. Record the completed payment before completing the booking.',409,'outstanding_balance');
        $pdo->prepare("UPDATE bookings SET status='Completed',completed_at=NOW() WHERE booking_id=?")->execute([$id]);
        $pdo->prepare("UPDATE notifications SET resolved_at=COALESCE(resolved_at,NOW()) WHERE booking_id=? AND notification_type='awaiting_payment'")->execute([$id]);
        auditWrite($pdo,$ownerId,'payment_completion','booking',$id,'Rental balance fully paid; booking completed.','Awaiting Payment','Completed');
        return lockBooking($pdo,$id);
    }
    if ($booking['status'] !== 'Awaiting Completion') domainFail('Only bookings awaiting completion can be manually released.',409,'invalid_transition');
    $notes = is_string($body['review_notes'] ?? null) ? trim($body['review_notes']) : '';
    if (($body['service_ready'] ?? false) !== true || ($body['payments_reviewed'] ?? false) !== true || ($body['deposits_reviewed'] ?? false) !== true || !$notes) domainFail('Confirm service readiness, review payments and deposits, and supply review notes.');
    $items = $body['checklist_items'] ?? [];
    if (!is_array($items)) domainFail('Checklist items must be an array.');
    foreach ($items as $item) {
        if (!is_array($item)) domainFail('Invalid checklist item.');
        $itemId = asInt($item['checklist_item_id'] ?? null, 1);
        $quantity = asInt($item['quantity_returned'] ?? null, 0);
        if ($quantity < 0) domainFail('Returned quantity cannot be negative.');
        $condition = trim((string)($item['condition_in'] ?? ''));
        $status = strtolower((string)($item['return_status'] ?? 'inspected'));
        if (!$itemId || $quantity === null || !$condition || !in_array($status,['inspected','damaged','missing'],true)) domainFail('Each return needs a valid quantity, condition, and inspection status.');
        updateChecklistItem($pdo,$id,$itemId,['quantity_returned'=>$quantity,'condition_in'=>$condition,'notes'=>$item['notes'] ?? null],$ownerId);
    }
    $q = $pdo->prepare("SELECT checklist_item_id FROM booking_checklist_items WHERE booking_id=? AND (checked_by IS NULL OR checked_at IS NULL OR condition_in IS NULL OR TRIM(condition_in)='' OR return_status NOT IN ('inspected','damaged','missing') OR quantity_returned>quantity_released OR (quantity_returned<quantity_released AND (return_status<>'missing' OR condition_in<>'Missing'))) LIMIT 1");
    $q->execute([$id]);
    if ($q->fetchColumn()) domainFail('Inspect all checklist items and document missing or damaged returns before release.');
    require_once __DIR__ . '/deposit_service.php';
    $deductions = $body['deductions'] ?? [];
    if (!is_array($deductions)) domainFail('Deductions must be an array.');
    if ($deductions) {
        $q = $pdo->prepare('SELECT deposit_id FROM deposits WHERE booking_id=? FOR UPDATE');
        $q->execute([$id]);
        $depositId = $q->fetchColumn();
        if (!$depositId) domainFail('A held deposit is required for deductions.');
        foreach ($deductions as $deduction) {
            if (!is_array($deduction)) domainFail('Invalid deduction.');
            addDepositDeduction($pdo,(int)$depositId,$deduction,$ownerId);
        }
    }
    if ($balanceCents > 0) {
        $pdo->prepare("UPDATE bookings SET status='Awaiting Payment',released_by=?,review_notes=? WHERE booking_id=?")->execute([$ownerId,$notes,$id]);
        $pdo->prepare("UPDATE notifications SET resolved_at=COALESCE(resolved_at,NOW()) WHERE booking_id=? AND notification_type='awaiting_completion'")->execute([$id]);
        $message = 'Service released after return review. Collect the outstanding rental balance of ₱'.$balance.' before completing the booking.';
        $pdo->prepare("INSERT INTO notifications(user_id,booking_id,notification_type,message,requires_action,created_at) SELECT user_id,?,'awaiting_payment',?,1,NOW() FROM users WHERE role='owner' AND account_status='Active' ON DUPLICATE KEY UPDATE message=VALUES(message),resolved_at=NULL")
            ->execute([$id,$message]);
        auditWrite($pdo,$ownerId,'manual_release','booking',$id,$notes.'; outstanding rental balance: '.$balance,'Awaiting Completion','Awaiting Payment');
        return lockBooking($pdo,$id);
    }
    $pdo->prepare("UPDATE bookings SET status='Completed',completed_at=NOW(),released_by=?,review_notes=? WHERE booking_id=?")->execute([$ownerId,$notes,$id]);
    $pdo->prepare("UPDATE notifications SET resolved_at=COALESCE(resolved_at,NOW()) WHERE booking_id=? AND notification_type='awaiting_completion'")->execute([$id]);
    auditWrite($pdo,$ownerId,'manual_release','booking',$id,$notes.'; rental balance fully paid.','Awaiting Completion','Completed');
    return lockBooking($pdo,$id);
}
