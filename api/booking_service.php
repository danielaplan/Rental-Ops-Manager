<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/availability_service.php';
require_once __DIR__ . '/booking_pricing.php';
require_once __DIR__ . '/checklist_service.php';

function bookingView(array $row): array {
    $row['id'] = $row['booking_id'];
    $row['has_approved_overlap'] = (bool)($row['has_approved_overlap'] ?? false);
    $row['service_ids'] = [(int)$row['service_id']];
    $row['addon_ids'] = json_decode($row['addon_ids'] ?: '[]',true);
    $row['total'] = $row['agreed_total'];
    $row['amount_paid'] = $row['completed_payments'] ?? '0.00';
    $balance = moneyCents($row['agreed_total']) - moneyCents($row['amount_paid']);
    $row['outstanding_balance'] = centsDecimal($balance);
    $row['payment_status'] = $balance <= 0 ? 'Fully Paid' : (moneyCents($row['amount_paid']) > 0 ? 'Partially Paid' : 'Unpaid');
    return $row;
}
function bookingRow(int $id): ?array {
    $q = db()->prepare("SELECT b.*,c.full_name AS customer_name,c.contact_number AS contact,(SELECT COALESCE(SUM(p.amount),0) FROM payments p WHERE p.booking_id=b.booking_id AND p.payment_status='Completed') AS completed_payments,EXISTS(SELECT 1 FROM booking_conflict_overrides o WHERE o.booking_id=b.booking_id OR o.conflicting_booking_id=b.booking_id) AS has_approved_overlap FROM bookings b JOIN customers c ON c.customer_id=b.customer_id WHERE b.booking_id=?");
    $q->execute([$id]);
    $row = $q->fetch();
    return $row ? bookingView($row) : null;
}
function entityId($value): ?int {
    if ($value === null || $value === '') return null;
    if (!is_scalar($value) || is_bool($value)) domainFail('Invalid record ID.');
    if (preg_match('/^(?:[A-Za-z][A-Za-z0-9]*-)?([1-9]\d*)$/D',(string)$value,$match)) return (int)$match[1];
    domainFail('Invalid record ID.');
}

function saveBooking(PDO $pdo, string $action, ?int $id, array $body, int $ownerId): int {
    foreach (['status','customer_name','contact','contact_number','email','location','event_location','cancellation_reason','theme_notes','source','event_type','special_requests','customer_type'] as $field) {
        if (isset($body[$field]) && !is_string($body[$field])) domainFail($field.' must be text.');
    }
    reconcileBookings($pdo);
    $old = $action === 'create' ? null : lockBooking($pdo,$id ?? 0);
    if (in_array($action,['release','complete'],true) || strtolower((string)($body['status'] ?? '')) === 'completed') {
        if (!$old) domainFail('Create a booking before post-event release.');
        releaseBooking($pdo,(int)$old['booking_id'],$body,$ownerId);
        return (int)$old['booking_id'];
    }
    $status = ucfirst(strtolower((string)($body['status'] ?? ($old['status'] ?? 'Pending'))));
    if ($status === 'Awaiting completion') $status = 'Awaiting Completion';
    if (in_array($action,['cancel','delete'],true)) $status = 'Cancelled';
    if (!in_array($status,['Pending','Confirmed','Cancelled'],true)) domainFail('Use the post-event release workflow for completion.');
    if (!$old && !in_array($status,['Pending','Confirmed'],true)) domainFail('A new booking must be Pending or Confirmed.');
    if ($old && in_array($old['status'],['Awaiting Completion','Awaiting Payment','Completed','Cancelled'],true)) {
        if ($old['status'] === 'Cancelled' && $status === 'Cancelled') return (int)$old['booking_id'];
        domainFail('This booking is retained in history; awaiting bookings require post-event release.',409,'invalid_transition');
    }
    if ($old && $old['status'] === 'Confirmed' && $status === 'Pending') domainFail('A confirmed booking must be cancelled with a reason to stop reserving its service.',409,'invalid_transition');
    if ($status === 'Cancelled') {
        $reason = trim((string)($body['cancellation_reason'] ?? ''));
        if (!$reason) domainFail('A cancellation reason is required.');
        $pdo->prepare("UPDATE bookings SET status='Cancelled',cancellation_reason=? WHERE booking_id=?")->execute([$reason,$id]);
        auditWrite($pdo,$ownerId,'cancellation','booking',$id,$reason,$old['status'],'Cancelled');
        return $id;
    }
    $customerId = entityId($body['customer_id'] ?? ($old['customer_id'] ?? null));
    if (!$customerId) {
        $name = trim((string)($body['customer_name'] ?? ''));
        $contact = trim((string)($body['contact'] ?? $body['contact_number'] ?? ''));
        if (!$name || !$contact || strlen($name)>100 || strlen($contact)>20) domainFail('Customer name (up to 100 bytes) and contact (up to 20 bytes) are required.');
        $pdo->prepare('INSERT INTO customers(full_name,contact_number,messenger_handle) VALUES(?,?,?)')->execute([$name,$contact,$body['email'] ?? null]);
        $customerId = (int)$pdo->lastInsertId();
    }
    $q = $pdo->prepare('SELECT customer_id FROM customers WHERE customer_id=?');
    $q->execute([$customerId]);
    if (!$q->fetchColumn()) domainFail('Customer not found.');
    $services = $body['service_ids'] ?? null;
    if ($services !== null && (!is_array($services) || !array_is_list($services) || count($services)!==1)) domainFail('Each booking must have exactly one service.');
    $serviceId = entityId($body['service_id'] ?? ($services[0] ?? ($old['service_id'] ?? null)));
    if ($services !== null && entityId($services[0]) !== $serviceId) domainFail('Service selections disagree.');
    $q = $pdo->prepare('SELECT * FROM services WHERE service_id=?');
    $q->execute([$serviceId]);
    $service = $q->fetch();
    if (!$service || ($service['status'] !== 'Active' && (!$old || (int)$old['service_id'] !== $serviceId))) domainFail('Select an active service.');
    $packageId = entityId(array_key_exists('package_id',$body) ? $body['package_id'] : ($old['package_id'] ?? null));
    $packageChanged = !$old || $packageId !== ($old['package_id'] === null ? null : (int)$old['package_id']);
    if ($old && $old['status'] !== 'Pending' && ($packageChanged || (int)$old['service_id'] !== $serviceId)) domainFail('Service and package can only change while a booking is Pending.');
    $start = bookingDatetime($body['event_start_datetime'] ?? (isset($body['event_date']) || isset($body['start_time']) ? ($body['event_date'] ?? $old['event_date'] ?? '').' '.($body['start_time'] ?? $old['start_time'] ?? '') : ($old['event_start_datetime'] ?? '')));
    $end = bookingDatetime($body['event_end_datetime'] ?? (isset($body['event_date']) || isset($body['end_time']) ? ($body['event_date'] ?? $old['event_date'] ?? '').' '.($body['end_time'] ?? $old['end_time'] ?? '') : ($old['event_end_datetime'] ?? '')));
    $preparation = bookingMinutes($body['preparation_minutes'] ?? ($old['preparation_minutes'] ?? $service['default_preparation_minutes']));
    $travel = bookingMinutes($body['travel_minutes'] ?? ($old['travel_minutes'] ?? $service['default_travel_minutes']));
    [$blockedStart,$blockedEnd] = blockedInterval($start,$end,$preparation,$travel);
    $location = trim((string)($body['event_location'] ?? $body['location'] ?? ($old['event_location'] ?? '')));
    if (!$location || strlen($location)>255) domainFail('Event location must contain 1 to 255 bytes.');
    $package = null;
    if ($packageId) {
        $q = $pdo->prepare('SELECT * FROM packages WHERE package_id=? AND service_id=?');
        $q->execute([$packageId,$serviceId]);
        $package = $q->fetch();
        if (!$package) domainFail('Package does not belong to the selected service.');
        $eligibilityChanged = $packageChanged || ($old && $old['event_start_datetime'] !== $start) || ($old && $old['status'] === 'Pending' && $status === 'Confirmed');
        if ($eligibilityChanged && ($package['status'] !== 'Active' || ((int)$package['is_promotional'] && (!$package['promotion_start_date'] || !$package['promotion_end_date'] || substr($start,0,10)<$package['promotion_start_date'] || substr($start,0,10)>$package['promotion_end_date'])))) domainFail('Select an active package whose promotion covers the event date.');
    }
    $addons = $body['addon_ids'] ?? ($old ? json_decode($old['addon_ids'] ?: '[]',true) : []);
    if (!is_array($addons)) domainFail('Add-ons must be an array.');
    $discount = centsDecimal(moneyCents($body['discount'] ?? ($old['discount'] ?? 0)));
    $fees = centsDecimal(moneyCents($body['fees'] ?? ($old['fees'] ?? 0)));
    $snapshotPrice = $packageChanged ? ($package['price'] ?? null) : $old['package_price_snapshot'];
    $totals = $old && !$packageChanged && !array_intersect(['addon_ids','discount','fees'],array_keys($body)) ? ['subtotal'=>$old['subtotal'],'addons_total'=>$old['addons_total'],'total'=>$old['total']] : calculateBookingTotals($pdo,$serviceId,$packageId,$addons,$discount,$fees,$snapshotPrice);
    $agreed = centsDecimal(moneyCents($body['agreed_total'] ?? $body['total'] ?? ($old['agreed_total'] ?? $totals['total'])));
    $conflicts = ['bookings'=>[],'blocks'=>[]];
    $reason = '';
    $changedReservation = !$old || $old['status'] !== $status || (int)$old['service_id'] !== $serviceId || $old['blocked_start_datetime'] !== $blockedStart || $old['blocked_end_datetime'] !== $blockedEnd;
    if ($status === 'Confirmed' && $changedReservation) {
        $now = $pdo->query('SELECT NOW()')->fetchColumn();
        $conflicts = availabilityConflicts($pdo,$serviceId,$blockedStart,$blockedEnd,$id ?? 0,$blockedEnd > $now);
        $reason = requireConflictApproval($conflicts,$body);
    }
    $map = ['customer_id'=>$customerId,'service_id'=>$serviceId,'package_id'=>$packageId,'event_start_datetime'=>$start,'event_end_datetime'=>$end,'event_date'=>substr($start,0,10),'start_time'=>substr($start,11),'end_time'=>substr($end,11),'event_location'=>$location,'preparation_minutes'=>$preparation,'travel_minutes'=>$travel,'blocked_start_datetime'=>$blockedStart,'blocked_end_datetime'=>$blockedEnd,'status'=>$status,'service_ids'=>json_encode([$serviceId]),'addon_ids'=>json_encode($addons),'discount'=>$discount,'fees'=>$fees,'subtotal'=>$totals['subtotal'],'addons_total'=>$totals['addons_total'],'total'=>$agreed,'agreed_total'=>$agreed,'package_name_snapshot'=>$packageChanged ? ($package['package_name'] ?? null) : $old['package_name_snapshot'],'package_price_snapshot'=>$snapshotPrice];
    foreach (['theme_notes','source','event_type','special_requests','email','customer_type'] as $field) $map[$field] = $body[$field] ?? ($old[$field] ?? null);
    if (isset($body['guests'])) {
        $guests = asInt($body['guests'],0);
        if ($guests === null) domainFail('Guest count must be a non-negative integer.');
        $map['guests'] = $guests;
    }
    if (!$old) {
        $map['created_by'] = $ownerId;
        $map['booking_reference'] = 'AKAD-'.strtoupper(bin2hex(random_bytes(10)));
        $columns = array_keys($map);
        $pdo->prepare('INSERT INTO bookings (`'.implode('`,`',$columns).'`,created_at) VALUES ('.implode(',',array_fill(0,count($columns),'?')).',NOW())')->execute(array_values($map));
        $savedId = (int)$pdo->lastInsertId();
        copyBookingChecklist($pdo,$savedId,$packageId);
        auditWrite($pdo,$ownerId,'booking_created','booking',$savedId,'Booking created.',null,$status);
    } else {
        $savedId = (int)$old['booking_id'];
        if ($packageChanged) {
            $q = $pdo->prepare('SELECT checklist_item_id FROM booking_checklist_items WHERE booking_id=? AND (checked_by IS NOT NULL OR quantity_released>0) LIMIT 1');
            $q->execute([$savedId]);
            if ($q->fetchColumn()) domainFail('A package cannot change after checklist work has started.');
            $pdo->prepare('DELETE FROM booking_checklist_items WHERE booking_id=?')->execute([$savedId]);
            copyBookingChecklist($pdo,$savedId,$packageId);
        }
        $pdo->prepare('UPDATE bookings SET '.implode(',',array_map(fn($field)=>'`'.$field.'`=?',array_keys($map))).' WHERE booking_id=?')->execute([...array_values($map),$savedId]);
        if ($old['status'] !== $status) auditWrite($pdo,$ownerId,'status_change','booking',$savedId,'Booking status changed.',$old['status'],$status);
        if (moneyCents($old['agreed_total']) !== moneyCents($agreed)) auditWrite($pdo,$ownerId,'price_change','booking',$savedId,'Agreed total changed from '.$old['agreed_total'].' to '.$agreed.'.');
        auditWrite($pdo,$ownerId,'booking_updated','booking',$savedId,'Booking details updated.');
    }
    recordConflictApproval($pdo,$savedId,$conflicts,$reason,$ownerId);
    reconcileBookings($pdo);
    return $savedId;

}

