<?php
<<<<<<< HEAD
require_once __DIR__.'/config.php';require_once __DIR__.'/auth.php';requireAuth();$do=$_GET['do']??'';$p=db();
if($do==='dashboard'){$d=$p->query("SELECT COUNT(*) total_bookings,SUM(status='pending') pending_bookings,SUM(status='confirmed') confirmed_bookings,SUM(status='completed') completed_bookings,COALESCE(SUM(amount_paid),0) total_revenue FROM bookings")->fetch();$d['active_services']=(int)$p->query("SELECT COUNT(*) FROM services WHERE status='Active'")->fetchColumn();$d+=['available_inventory'=>0,'items_on_rental'=>0,'items_needing_attention'=>0];$d['upcoming_bookings']=$p->query("SELECT b.booking_id AS id,b.event_date,b.start_time,b.end_time,b.status,c.full_name customer_name,s.service_name FROM bookings b JOIN customers c ON c.customer_id=b.customer_id LEFT JOIN services s ON s.service_id=b.service_id WHERE b.event_date>=CURDATE() AND LOWER(b.status) NOT IN ('completed','cancelled','rejected') ORDER BY b.event_date LIMIT 5")->fetchAll();sendJson(['ok'=>true,'data'=>$d]);}
if($do==='report'){$start=asDate($_GET['start']??'');$end=asDate($_GET['end']??'');$sql='SELECT COUNT(*) total_bookings,COUNT(DISTINCT customer_id) total_customers,SUM(status="pending") pending,SUM(status="confirmed") confirmed,SUM(status="completed") completed,SUM(status IN ("cancelled","rejected")) cancelled,COALESCE(SUM(amount_paid),0) total_revenue,COALESCE(SUM(GREATEST(total-amount_paid,0)),0) outstanding_balance FROM bookings WHERE 1=1';$args=[];if($start){$sql.=' AND event_date>=?';$args[]=$start;}if($end){$sql.=' AND event_date<=?';$args[]=$end;}$s=$p->prepare($sql);$s->execute($args);$r=$s->fetch();$q='SELECT s.service_name name,COUNT(*) count FROM bookings b JOIN services s ON s.service_id=b.service_id WHERE 1=1';$popularArgs=[];if($start){$q.=' AND b.event_date>=?';$popularArgs[]=$start;}if($end){$q.=' AND b.event_date<=?';$popularArgs[]=$end;}$q.=' GROUP BY s.service_id ORDER BY count DESC';$s=$p->prepare($q);$s->execute($popularArgs);$r['popular_services']=$s->fetchAll();$r['damaged_or_missing']=(int)$p->query("SELECT COUNT(*) FROM equipment_checklist WHERE return_status IN ('damaged','missing')")->fetchColumn();$r['range_start']=$start??'';$r['range_end']=$end??'';sendJson(['ok'=>true,'data'=>$r]);}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
=======
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/domain.php';
require_once __DIR__ . '/availability_service.php';

$owner = requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
$do = $_GET['do'] ?? 'dashboard';
$p = db();

// Keep existing lifetime metrics explicit when returned alongside a selected period.
$definitions = [
    'revenue' => 'Completed payments by payment date within the selected period; deposits excluded.',
    'balances' => 'Current lifetime balances, excluding cancelled bookings; payment-state totals include all transactions.',
    'deposits_and_deductions' => 'Current lifetime held deposits, refundable balances, and separately reported deductions.',
'upcoming' => 'Pending, Confirmed, and Awaiting Completion bookings whose event starts within the selected period; released bookings Awaiting Payment are excluded.',
    'completed_and_cancelled_totals' => 'Lifetime retained bookings by current status.',
    'approved_overlaps' => 'Lifetime unique booking pairs; detailed overlap rows retain each approval and reason.',
    'popularity' => 'All retained bookings by event start within the selected period, including cancelled bookings in booking_count; cancelled_count is separate.'
];

/**
 * B5-01: Calculate collected revenue from Completed payments filtered by payment date.
 */
function reportsRevenue(PDO $pdo, string $start, string $end): array {
    $q = $pdo->prepare("SELECT
        COUNT(*) AS total_payments,
        COALESCE(SUM(amount), 0) AS total_collected,
        COUNT(DISTINCT booking_id) AS bookings_with_payments
        FROM payments
        WHERE payment_status = 'Completed'
        AND payment_date BETWEEN ? AND ?
    ");
    $q->execute([$start . ' 00:00:00', $end . ' 23:59:59']);
    return $q->fetch();
}

/**
 * B5-02: Calculate balances, deposits held, deductions, and other metrics.
 */
function reportsBalances(PDO $pdo): array {
    // Keep payment-state totals separate from the amount still owed on bookings.
    $q = $pdo->prepare("SELECT
        COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN amount ELSE 0 END), 0) AS pending_payments,
        COALESCE(SUM(CASE WHEN payment_status = 'Failed' THEN amount ELSE 0 END), 0) AS failed_payments
        FROM payments
    ");
    $q->execute();
    $paymentResult = $q->fetch();

    $q = $pdo->prepare("SELECT
        COALESCE(SUM(GREATEST(b.agreed_total - COALESCE(p.completed_amount, 0), 0)), 0) AS outstanding_balances,
        COUNT(CASE WHEN b.status = 'Awaiting Completion' OR (b.status = 'Confirmed' AND b.released_by IS NULL AND b.blocked_end_datetime <= NOW()) THEN 1 END) AS awaiting_completion_count,
        COUNT(CASE WHEN b.status = 'Awaiting Payment' THEN 1 END) AS awaiting_payment_count,
        COALESCE(SUM(CASE WHEN b.status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending_bookings
        FROM bookings b
        LEFT JOIN (
            SELECT booking_id, SUM(amount) AS completed_amount
            FROM payments
            WHERE payment_status = 'Completed'
            GROUP BY booking_id
        ) p ON p.booking_id = b.booking_id
        WHERE b.status <> 'Cancelled'
    ");
    $q->execute();
    $result = $q->fetch();

    // Deposits held and deductions
    $q = $pdo->prepare("SELECT
        COALESCE(SUM(CASE WHEN refund_status = 'Held' THEN amount_held ELSE 0 END), 0) AS deposits_held,
        COALESCE(SUM(CASE WHEN refund_status = 'Held' THEN GREATEST(amount_held - COALESCE((SELECT SUM(amount) FROM deposit_deductions WHERE deposit_id = d.deposit_id), 0), 0) ELSE 0 END), 0) AS refunds_available,
        COUNT(*) AS deposits_count
        FROM deposits d
    ");
    $q->execute();
    $depositResult = $q->fetch();

    // Deductions summary
    $q = $pdo->prepare("SELECT
        COUNT(*) AS total_deductions,
        COALESCE(SUM(amount), 0) AS total_deductions_amount
        FROM deposit_deductions
    ");
    $q->execute();
    $deductionResult = $q->fetch();

    return [
        'pending_payments' => $paymentResult['pending_payments'],
        'failed_payments' => $paymentResult['failed_payments'],
        'outstanding_balances' => $result['outstanding_balances'],
        'awaiting_completion_count' => (int)$result['awaiting_completion_count'],
        'awaiting_payment_count' => (int)$result['awaiting_payment_count'],
        'pending_bookings' => (int)$result['pending_bookings'],
        'deposits_held' => $depositResult['deposits_held'],
        'refunds_available' => $depositResult['refunds_available'],
        'deposits_count' => (int)$depositResult['deposits_count'],
        'total_deductions' => (int)$deductionResult['total_deductions'],
        'total_deductions_amount' => $deductionResult['total_deductions_amount']
    ];
}

/**
 * B5-02: Upcoming and completed bookings.
 */
function reportsBookings(PDO $pdo, string $start, string $end): array {
    // Upcoming bookings (not completed/cancelled)
    $q = $pdo->prepare("SELECT
        COUNT(*) AS upcoming_count,
        SUM(status='Pending') AS pending,
        SUM(status='Confirmed') AS confirmed,
        SUM(status='Awaiting Completion') AS awaiting_completion
        FROM bookings
        WHERE event_start_datetime BETWEEN ? AND ?
        AND status IN ('Pending', 'Confirmed', 'Awaiting Completion')
    ");
    $q->execute([$start . ' 00:00:00', $end . ' 23:59:59']);
    $upcoming = $q->fetch();

    // Completed bookings
    $q = $pdo->prepare("SELECT
        COUNT(*) AS completed_count,
        COALESCE(SUM(agreed_total), 0) AS total_value
        FROM bookings
        WHERE status = 'Completed'
    ");
    $q->execute();
    $completed = $q->fetch();

    // Cancellations
    $q = $pdo->prepare("SELECT
        COUNT(*) AS cancelled_count,
        COALESCE(SUM(agreed_total), 0) AS total_cancelled_value
        FROM bookings
        WHERE status = 'Cancelled'
    ");
    $q->execute();
    $cancelled = $q->fetch();

    return [
        'upcoming' => $upcoming,
        'completed' => $completed,
        'cancelled' => $cancelled
    ];
}

/**
 * B5-02: Approved overlaps.
 */
function reportsOverlaps(PDO $pdo): array {
    $q = $pdo->prepare("SELECT
        COUNT(DISTINCT LEAST(booking_id, conflicting_booking_id), GREATEST(booking_id, conflicting_booking_id)) AS total_overlaps
        FROM booking_conflict_overrides
    ");
    $q->execute();
    return $q->fetch();
}

/**
 * B5-03: Service and package popularity reports.
 */
function reportsPopularity(PDO $pdo, string $start, string $end): array {
    // Service popularity - counts of bookings per service
    $q = $pdo->prepare("SELECT
        s.service_id,
        s.service_name,
        COUNT(*) AS booking_count,
        COUNT(CASE WHEN b.status = 'Completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN b.status = 'Cancelled' THEN 1 END) AS cancelled_count
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        WHERE b.event_start_datetime BETWEEN ? AND ?
        GROUP BY s.service_id, s.service_name
        ORDER BY booking_count DESC
    ");
    $q->execute([$start . ' 00:00:00', $end . ' 23:59:59']);
    $services = $q->fetchAll();

    // Package popularity
    $q = $pdo->prepare("SELECT
        pkg.package_id,
        pkg.package_name,
        s.service_name,
        COUNT(*) AS booking_count,
        COUNT(CASE WHEN b.status = 'Completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN b.status = 'Cancelled' THEN 1 END) AS cancelled_count
        FROM bookings b
        JOIN packages pkg ON b.package_id = pkg.package_id
        JOIN services s ON pkg.service_id = s.service_id
        WHERE b.event_start_datetime BETWEEN ? AND ?
        AND b.package_id IS NOT NULL
        GROUP BY pkg.package_id, pkg.package_name, s.service_name
        ORDER BY booking_count DESC
    ");
    $q->execute([$start . ' 00:00:00', $end . ' 23:59:59']);
    $packages = $q->fetchAll();

    return ['services' => $services, 'packages' => $packages];
}

// FR-14 requires inspectable booking/approval rows in addition to dashboard totals.
if (in_array($do, ['upcoming','cancellations','overlaps'], true)) {
    $start = $_GET['start'] ?? date('Y-m-01');
    $end = $_GET['end'] ?? date('Y-m-t');
    if (!asDate($start) || !asDate($end) || $start > $end) sendJson(['ok'=>false,'error'=>'Invalid date range. Use YYYY-MM-DD.','code'=>'validation'],400);
    $columns = 'b.booking_id,b.booking_reference,b.customer_id,c.full_name AS customer_name,b.service_id,s.service_name,b.event_start_datetime,b.event_end_datetime,b.status';
    if ($do === 'overlaps') {
        $q = $p->prepare("SELECT o.*,{$columns},other.booking_reference AS conflicting_booking_reference,
            other.event_start_datetime AS conflicting_event_start_datetime,other.event_end_datetime AS conflicting_event_end_datetime,
            other.status AS conflicting_status,u.full_name AS approving_owner
            FROM booking_conflict_overrides o
            JOIN bookings b ON b.booking_id=o.booking_id
            JOIN bookings other ON other.booking_id=o.conflicting_booking_id
            JOIN customers c ON c.customer_id=b.customer_id
            JOIN services s ON s.service_id=b.service_id
            LEFT JOIN users u ON u.user_id=o.approved_by
            WHERE b.event_start_datetime BETWEEN ? AND ? OR other.event_start_datetime BETWEEN ? AND ?
            ORDER BY o.approved_at,o.override_id");
        $q->execute([$start.' 00:00:00',$end.' 23:59:59',$start.' 00:00:00',$end.' 23:59:59']);
    } else {
        $status = $do === 'cancellations' ? "b.status='Cancelled'" : "b.status IN ('Pending','Confirmed','Awaiting Completion')";
        $q = $p->prepare("SELECT {$columns},b.cancellation_reason FROM bookings b
            JOIN customers c ON c.customer_id=b.customer_id JOIN services s ON s.service_id=b.service_id
            WHERE {$status} AND b.event_start_datetime BETWEEN ? AND ? ORDER BY b.event_start_datetime,b.booking_id");
        $q->execute([$start.' 00:00:00',$end.' 23:59:59']);
    }
    sendJson(['ok'=>true,'data'=>$q->fetchAll(),'period'=>['start'=>$start,'end'=>$end],
        'definition'=>$do === 'overlaps' ? 'Approvals where either affected booking starts within the selected event period; historical approvals remain visible.' : 'Retained bookings by current status and event start within the selected period.']);
}

// Dashboard endpoint
if ($do === 'dashboard') {
    $now = new DateTime('now', new DateTimeZone('Asia/Manila'));
    $monthStart = $now->format('Y-m-01');
    $monthEnd = $now->format('Y-m-t');

    $revenue = reportsRevenue($p, $monthStart, $monthEnd);
    $balances = reportsBalances($p);
    $bookings = reportsBookings($p, $monthStart, $monthEnd);
    $overlaps = reportsOverlaps($p);
    $popularity = reportsPopularity($p, $monthStart, $monthEnd);

    $counts = $p->query("SELECT COUNT(*) AS total_bookings,
        COALESCE(SUM(status='Pending'),0) AS pending_bookings,
        COALESCE(SUM(status='Confirmed'),0) AS confirmed_bookings,
        COALESCE(SUM(status='Awaiting Payment'),0) AS awaiting_payment_bookings,
        COALESCE(SUM(status='Completed'),0) AS completed_bookings
        FROM bookings")->fetch();
    foreach (['total_bookings','pending_bookings','confirmed_bookings','awaiting_payment_bookings','completed_bookings'] as $field) {
        $counts[$field] = (int)$counts[$field];
    }
    $counts['active_services'] = (int)$p->query("SELECT COUNT(*) FROM services WHERE status='Active'")->fetchColumn();
    $counts['available_inventory'] = 0;
    $counts['items_on_rental'] = 0;
    $counts['items_needing_attention'] = 0;
    $upcoming = $p->prepare("SELECT b.booking_id AS id,b.booking_reference,b.event_date,b.start_time,b.end_time,
        b.event_start_datetime,b.event_end_datetime,b.total,b.status,c.full_name AS customer_name,s.service_name
        FROM bookings b JOIN customers c ON c.customer_id=b.customer_id
        JOIN services s ON s.service_id=b.service_id
        WHERE b.event_start_datetime>=NOW() AND b.status IN ('Pending','Confirmed','Awaiting Completion')
        ORDER BY b.event_start_datetime,b.booking_id LIMIT 5");
    $upcoming->execute();
    $counts['upcoming_bookings'] = $upcoming->fetchAll();

    sendJson(['ok' => true, 'data' => [
        ...$counts,
        'total_revenue' => $revenue['total_collected'],
        'revenue' => $revenue,
        'balances' => $balances,
        'bookings' => $bookings,
        'overlaps' => $overlaps,
        'popularity' => $popularity,
        'period' => ['start' => $monthStart, 'end' => $monthEnd],
        'definitions' => $definitions
    ]]);
}

// Detailed report endpoint with date range
if ($do === 'report') {
    $start = $_GET['start'] ?? date('Y-m-01');
    $end = $_GET['end'] ?? date('Y-m-t');

    // Validate dates
    if (!asDate($start) || !asDate($end) || $start > $end) {
        sendJson(['ok' => false, 'error' => 'Invalid date format. Use YYYY-MM-DD.', 'code' => 'validation'], 400);
    }

    $revenue = reportsRevenue($p, $start, $end);
    $balances = reportsBalances($p);
    $bookings = reportsBookings($p, $start, $end);
    $overlaps = reportsOverlaps($p);
    $popularity = reportsPopularity($p, $start, $end);

    $legacyCounts = $p->prepare("SELECT COUNT(*) AS total_bookings,COUNT(DISTINCT customer_id) AS total_customers,
        COALESCE(SUM(status='Pending'),0) AS pending,
        COALESCE(SUM(status='Confirmed'),0) AS confirmed,
        COALESCE(SUM(status='Awaiting Payment'),0) AS awaiting_payment,
        COALESCE(SUM(status='Completed'),0) AS completed,
        COALESCE(SUM(status='Cancelled'),0) AS cancelled
        FROM bookings WHERE event_start_datetime BETWEEN ? AND ?");
    $legacyCounts->execute([$start.' 00:00:00',$end.' 23:59:59']);
    $legacyCounts = $legacyCounts->fetch();
    $damagedOrMissing = (int)$p->query("SELECT COUNT(*) FROM booking_checklist_items WHERE return_status IN ('damaged','missing')")->fetchColumn();
    $popularServices = array_map(static fn($service) => [
        'name' => $service['service_name'],
        'count' => (int)$service['booking_count']
    ], $popularity['services']);

    // Summary statistics
    $summary = [
        'period' => ['start' => $start, 'end' => $end],
        'definitions' => $definitions,
        'total_bookings' => (int)$legacyCounts['total_bookings'],
        'total_customers' => (int)$legacyCounts['total_customers'],
        'pending' => (int)$legacyCounts['pending'],
        'confirmed' => (int)$legacyCounts['confirmed'],
        'awaiting_payment' => (int)$legacyCounts['awaiting_payment'],
        'completed' => (int)$legacyCounts['completed'],
        'cancelled' => (int)$legacyCounts['cancelled'],
        'popular_services' => $popularServices,
        'damaged_or_missing' => $damagedOrMissing,
        'total_revenue_collected' => $revenue['total_collected'] ?? 0,
        'total_pending_payments' => $balances['pending_payments'] ?? 0,
        'total_failed_payments' => $balances['failed_payments'] ?? 0,
        'outstanding_balances' => $balances['outstanding_balances'] ?? 0,
        'deposits_held' => $balances['deposits_held'] ?? 0,
        'refunds_available' => $balances['refunds_available'] ?? 0,
        'total_deductions_amount' => $balances['total_deductions_amount'] ?? 0,
        'upcoming_bookings' => $bookings['upcoming'] ?? [],
        'completed_bookings' => $bookings['completed'] ?? [],
        'cancelled_bookings' => $bookings['cancelled'] ?? [],
        'approved_overlaps' => $overlaps['total_overlaps'] ?? 0,
        'service_popularity' => $popularity['services'] ?? [],
        'package_popularity' => $popularity['packages'] ?? []
    ];

    sendJson(['ok' => true, 'data' => $summary]);
}

sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7
