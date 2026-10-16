<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/availability_service.php';

$actor = requireAuth();
$do = $_GET['do'] ?? 'all';
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET' && in_array($do, ['all', 'get'], true)) {
    $id = asInt($_GET['id'] ?? null, 1);
    if ($do === 'get' && !$id) sendJson(['ok'=>false,'error'=>'Valid block ID required.','code'=>'validation'],400);
    $query = $pdo->prepare('SELECT * FROM availability_blocks' . ($id ? ' WHERE block_id=?' : '') . ' ORDER BY start_datetime,block_id');
    $query->execute($id ? [$id] : []);
    $rows = $query->fetchAll();
    if ($do === 'get' && !$rows) sendJson(['ok'=>false,'error'=>'Availability block not found.','code'=>'not_found'],404);
    sendJson(['ok'=>true,'data'=>$do === 'get' ? $rows[0] : $rows]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($do, ['create', 'update', 'deactivate', 'reactivate'], true)) {
    $body = readJsonBody();
    $result = domainTransaction(function (PDO $pdo) use ($actor, $do, $body) {
        reconcileBookings($pdo);
        $id = asInt($_GET['id'] ?? $body['block_id'] ?? null, 1);
        $old = null;
        if ($do !== 'create') {
            if (!$id) domainFail('Valid block ID required.');
            $query = $pdo->prepare('SELECT * FROM availability_blocks WHERE block_id=? FOR UPDATE');
            $query->execute([$id]);
            $old = $query->fetch();
            if (!$old) domainFail('Availability block not found.',404,'not_found');
        }

        if ($do === 'deactivate' || $do === 'reactivate') {
            $status = $do === 'deactivate' ? 'Inactive' : 'Active';
            if ($status === 'Active') {
                assertNoBookingConflicts($pdo, $old['service_id'] === null ? null : (int)$old['service_id'], $old['start_datetime'], $old['end_datetime']);
            }
            $pdo->prepare('UPDATE availability_blocks SET status=? WHERE block_id=?')->execute([$status,$id]);
            auditWrite($pdo,(int)$actor['user_id'],'availability_block_'.$do,'availability_block',$id,'Availability block '.$do.'.');
            $query = $pdo->prepare('SELECT * FROM availability_blocks WHERE block_id=?');
            $query->execute([$id]);
            return $query->fetch();
        }

        $serviceId = array_key_exists('service_id',$body)
            ? ($body['service_id'] === null ? null : asInt($body['service_id'],1))
            : ($old ? ($old['service_id'] === null ? null : (int)$old['service_id']) : null);
        if (array_key_exists('service_id',$body) && $body['service_id'] !== null && !$serviceId) domainFail('Invalid service ID.');
        if ($serviceId !== null) {
            $query = $pdo->prepare('SELECT service_id FROM services WHERE service_id=?');
            $query->execute([$serviceId]);
            if (!$query->fetchColumn()) domainFail('Service not found.',404,'not_found');
        }
        $start = array_key_exists('start_datetime',$body)
            ? bookingDatetime($body['start_datetime'])
            : ($old['start_datetime'] ?? '');
        $end = array_key_exists('end_datetime',$body)
            ? bookingDatetime($body['end_datetime'])
            : ($old['end_datetime'] ?? '');
        if (!$start || !$end || $start >= $end) domainFail('Block end must be after block start.');
        $reason = array_key_exists('reason',$body)
            ? trim(is_string($body['reason']) ? $body['reason'] : '')
            : trim((string)($old['reason'] ?? ''));
        if ($reason === '' || strlen($reason) > 5000) domainFail('A reason of at most 5000 bytes is required.');
        $status = $body['status'] ?? ($old['status'] ?? 'Active');
        if (!in_array($status,['Active','Inactive'],true)) domainFail('Invalid availability block status.');
        if ($status === 'Active') assertNoBookingConflicts($pdo,$serviceId,$start,$end);

        if ($old) {
            $pdo->prepare('UPDATE availability_blocks SET service_id=?,start_datetime=?,end_datetime=?,reason=?,status=? WHERE block_id=?')
                ->execute([$serviceId,$start,$end,$reason,$status,$id]);
        } else {
            $pdo->prepare('INSERT INTO availability_blocks(service_id,start_datetime,end_datetime,reason,created_by,status) VALUES(?,?,?,?,?,?)')
                ->execute([$serviceId,$start,$end,$reason,$actor['user_id'],$status]);
            $id = (int)$pdo->lastInsertId();
        }
        auditWrite($pdo,(int)$actor['user_id'],$old ? 'availability_block_updated' : 'availability_block_created','availability_block',$id,json_encode(['service_id'=>$serviceId,'start_datetime'=>$start,'end_datetime'=>$end,'reason'=>$reason,'status'=>$status]));
        $query = $pdo->prepare('SELECT * FROM availability_blocks WHERE block_id=?');
        $query->execute([$id]);
        return $query->fetch();
    });
    sendJson(['ok'=>true,'data'=>$result],$do === 'create' ? 201 : 200);
}

sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);

function assertNoBookingConflicts(PDO $pdo, ?int $serviceId, string $start, string $end): void {
    $services = $serviceId === null
        ? $pdo->query('SELECT service_id FROM services ORDER BY service_id')->fetchAll(PDO::FETCH_COLUMN)
        : [$serviceId];
    $conflicts = [];
    foreach ($services as $id) {
        $matches = availabilityConflicts($pdo,(int)$id,$start,$end);
        array_push($conflicts,...$matches['bookings']);
    }
    if ($conflicts) {
        $error = new DomainError('The availability block overlaps an active booking.',409,'conflict');
        $error->details = ['bookings'=>$conflicts];
        throw $error;
    }
}
