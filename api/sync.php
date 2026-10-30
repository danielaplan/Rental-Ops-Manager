<?php
require_once __DIR__.'/booking_service.php';
require_once __DIR__.'/equipment_service.php';
require_once __DIR__.'/booking_items_service.php';
require_once __DIR__.'/payment_service.php';
require_once __DIR__.'/deposit_service.php';
require_once __DIR__.'/supporting_service.php';
require_once __DIR__.'/catalog_definitions.php';
require_once __DIR__.'/sync_state.php';

function syncDepositUpsert(PDO $pdo,int $bookingId,array $data,int $ownerId): array {
 $deposit=saveDeposit($pdo,$bookingId,['amount_held'=>$data['amount_held']??null],$ownerId);
 $deduction=moneyCents($data['deduction_amount']??0);
 if($deduction>0){
  $depositId=(int)$deposit['deposit_id'];
  $q=$pdo->prepare('SELECT deduction_id,amount FROM deposit_deductions WHERE legacy_deposit_id=? FOR UPDATE');$q->execute([$depositId]);$existing=$q->fetch();
  if($existing){
   if(moneyCents($existing['amount'])!==$deduction)throw new InvalidArgumentException('The synchronized aggregate deduction has already been recorded with a different amount.');
  }else{
   if(moneyCents($deposit['deduction_amount'])!==0)throw new InvalidArgumentException('An aggregate deduction cannot be combined with existing itemized deductions.');
   if (!is_string($data['deduction_reason'] ?? null)) domainFail('A deduction reason must be text.');
   $reason=trim($data['deduction_reason']);
   if($reason==='')throw new InvalidArgumentException('A reason is required for the synchronized aggregate deduction.');
   $deductionId=addDepositDeduction($pdo,$depositId,['amount'=>$data['deduction_amount'],'affected_item'=>'Legacy aggregate deduction; affected item unavailable','reason'=>$reason],$ownerId);
   $pdo->prepare("UPDATE deposit_deductions SET provenance='legacy-sync',legacy_deposit_id=? WHERE deduction_id=?")->execute([$depositId,$deductionId]);
  }
 }
 return depositView($pdo,$bookingId);
}

$actor=requireAuth();
$action=$_GET['do'] ?? '';
if ($_SERVER['REQUEST_METHOD']==='GET' && $action==='queue') sendJson(['ok'=>true,'data'=>['queue'=>[]]]);
if ($_SERVER['REQUEST_METHOD']!=='POST' || $action!=='commit') sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'method_not_allowed'],405);
$queue=readJsonBody()['queue'] ?? null;
if (!is_array($queue) || !array_is_list($queue) || count($queue)>100) sendJson(['ok'=>false,'error'=>'Queue must be an array of at most 100 operations.','code'=>'validation'],400);
$definitions=[
    'services'=>'serviceCrudDefinition','packages'=>'packageCrudDefinition','categories'=>'categoryCrudDefinition',
    'addons'=>'addonCrudDefinition','gallery'=>'galleryCrudDefinition','rentalItems'=>'rentalItemCrudDefinition','customers'=>'customerCrudDefinition',
];
$pdo=db();
$pdo->exec("INSERT IGNORE INTO app_settings(settings_id,settings) VALUES(2,'{\"receipts\":{},\"ids\":{}}')");
$committed=[]; $conflicts=[]; $failed=[];
foreach ($queue as $item) {
    $client=is_array($item)?($item['client_id'] ?? null):null;
    try {
        if (!is_array($item) || !is_string($client) || $client==='' || strlen($client)>128) domainFail('A valid operation ID is required.');
        $entity=$item['entity'] ?? ''; $action=$item['action'] ?? ''; $data=$item['data'] ?? null;
        if (!is_string($entity) || !is_string($action) || !is_array($data)) domainFail('Operation entity, action, and object data are required.');
        $hash=hash('sha256',json_encode([$entity,$action,$data,$item['local_id'] ?? null],JSON_THROW_ON_ERROR));
        $offlineAllowed=($entity==='bookings' && $action==='create')
            || ($entity==='bookingItems' && in_array($action,['generate','update'],true))
            || ($entity==='equipment' && $action==='inspect');
        if (!$offlineAllowed) domainFail('This action requires an internet connection and cannot be replayed from the offline queue.',422,'online_required');
        if ($entity==='bookings' && $action==='create') {
            $status=strtolower(trim((string)($data['status'] ?? 'Pending')));
            $hasApprovalData=array_intersect(['approve_conflicts','conflicting_booking_ids','override_reason','approval_base'],array_keys($data));
            if ($status!=='pending' || moneyCents($data['amount_paid'] ?? 0)!==0 || $hasApprovalData) {
                domainFail('Offline booking drafts must remain Pending and cannot record payment or approve a conflict.',422,'online_required');
            }
            $data['status']='Pending';
            $data['amount_paid']=0;
        }
        if (isset($item['owner_id']) && (int)$item['owner_id']!==(int)$actor['user_id']) domainFail('This operation belongs to another user.');
        $pdo->beginTransaction();
        $state=syncState($pdo);
        $receipt=$state['receipts'][$actor['user_id'].':'.$client] ?? null;
        if ($receipt) {
            if ($receipt['hash']!==$hash) domainFail('An acknowledged operation cannot be changed.');
            $pdo->commit(); $committed[]=$receipt['ack']; continue;
        }
        foreach (['id'=>$entity,'booking_id'=>'bookings','service_id'=>'services','package_id'=>'packages','customer_id'=>'customers','rental_item_id'=>'rentalItems'] as $field=>$target) {
            if (isset($data[$field]) && $data[$field]!=='') $data[$field]=syncReference($data[$field],$target,$state,(int)$actor['user_id']);
        }
        foreach (['service_ids'=>'services','addon_ids'=>'addons'] as $field=>$target) if (isset($data[$field])) {
            if (!is_array($data[$field])) domainFail('Selections must be arrays.');
            $data[$field]=array_map(fn($value)=>syncReference($value,$target,$state,(int)$actor['user_id']),$data[$field]);
        }
        $record=null; $id=null;
        if ($entity==='bookings') {
            if (!in_array($action,['create','update','delete','cancel'],true)) domainFail('Unsupported booking action.');
            // Reconciliation and reservation changes share the same service lock order.
            reconcileBookings($pdo);
            $id=$action==='create'?null:entityId($data['id'] ?? $data['booking_id'] ?? null);
            if ($action!=='create' && !$id) domainFail('A booking ID is required.');
            if ($id && isset($data['_base'])) {
                if (!is_array($data['_base'])) domainFail('Invalid previous booking values.');
                $old=lockBooking($pdo,$id);
                foreach ($data['_base'] as $field=>$expected) {
                    if (!in_array($field,['status','event_date','start_time','end_time','event_location','service_id','package_id','addon_ids','discount','fees','agreed_total','preparation_minutes','travel_minutes','event_start_datetime','event_end_datetime'],true)) continue;
                    $actual=$old[$field] ?? null;
                    if ($field==='addon_ids') {
                        if (!is_array($expected)) domainFail('Invalid previous add-on values.');
                        $expected=array_map(fn($value)=>syncReference($value,'addons',$state,(int)$actor['user_id']),$expected);
                        $actual=json_decode((string)$actual,true) ?: [];
                        sort($expected); sort($actual);
                        if ($actual===$expected) continue;
                        $actual=json_encode($actual); $expected=json_encode($expected);
                    }
                    if (in_array($field,['discount','fees','agreed_total'],true)) {
                        if (moneyCents($actual ?? 0)===moneyCents($expected ?? 0)) continue;
                    }
                    if (in_array($field,['service_id','package_id'],true)) {
                        $actual=$actual===null?null:(int)$actual;
                        $expected=$expected===null||$expected===''?null:(int)syncReference($expected,$field==='service_id'?'services':'packages',$state,(int)$actor['user_id']);
                    }
                    if (in_array($field,['preparation_minutes','travel_minutes'],true)) { $actual=(int)$actual; $expected=(int)$expected; }
                    if ($field==='status') { $actual=strtolower((string)$actual); $expected=strtolower((string)$expected); }
                    if (in_array($field,['start_time','end_time'],true)) { $actual=substr((string)$actual,0,5); $expected=substr((string)$expected,0,5); }
                    if (!is_scalar($expected) && $expected!==null) domainFail('Invalid previous booking value.');
                    if ((string)$actual!==(string)$expected) {
                        $error=new DomainError('Booking changed on another device. Review your draft before retrying.',409,'stale');
                        $error->details=['server_record'=>$old]; throw $error;
                    }
                }
            }
            // Offline drafts have no real-time reservation. Before accepting a queued
            // create, classify an overlap with an existing confirmed booking as an
            // actionable conflict rather than silently creating an ordinary Pending row.
            if ($action==='create') $data['_sync_conflict_check']=true;
            $id=saveBooking($pdo,$action,$id,$data,(int)$actor['user_id']);
            $record=bookingRow($id);
        } elseif ($entity==='payments' && in_array($action,['create','update'],true)) {
            $id=$action==='update' ? asInt($data['payment_id'] ?? $data['id'] ?? null,1) : null;
            if ($action==='update' && !$id) domainFail('A payment ID is required.');
            $record=savePayment($pdo,$action,$id,$data,$actor); $id=(int)$record['payment_id'];
        } elseif ($entity==='deposits' && $action==='upsert') {
            $record=syncDepositUpsert($pdo,asInt($data['booking_id'] ?? null,1)??0,$data,(int)$actor['user_id']);
        } elseif ($entity==='deposits' && in_array($action,['deduct','refund'],true)) {
            $bid=asInt($data['booking_id'] ?? null,1);
            if (!$bid) domainFail('A valid booking is required.');
            if ($action==='refund') $record=refundDeposit($pdo,$bid,(int)$actor['user_id']);
            else {
                lockBooking($pdo,$bid);
                $deposit=depositView($pdo,$bid);
                if (!$deposit) domainFail('Deposit not found.',404,'not_found');
                addDepositDeduction($pdo,(int)$deposit['deposit_id'],$data,(int)$actor['user_id']);
                $record=depositView($pdo,$bid);
            }
        } elseif ($entity==='delivery' && $action==='upsert') {
            $record=saveDelivery($pdo,$data,$actor);
        } elseif ($entity==='bookingItems' && $action==='generate') {
            $bid=asInt($data['booking_id'] ?? null,1);
            if (!$bid) domainFail('A booking ID is required.');
            $record=['booking_id'=>$bid,'items'=>ensureBookingItems($pdo,$bid)];
        } elseif ($entity==='bookingItems' && $action==='update') {
            $bid=asInt($data['booking_id'] ?? null,1);
            if (!$bid) domainFail('A booking ID is required.');
            lockBooking($pdo,$bid);
            $id=asInt($data['checklist_item_id'] ?? $data['booking_item_id'] ?? $data['id'] ?? null,1);
            if (!$id) {
                foreach (['template_item_id','rental_item_id'] as $field) if (isset($data[$field])) {
                    $value=asInt($data[$field],1); if (!$value) domainFail('Invalid checklist reference.');
                    $q=$pdo->prepare('SELECT checklist_item_id FROM booking_checklist_items WHERE booking_id=? AND '.$field.'=?');
                    $q->execute([$bid,$value]); $id=asInt($q->fetchColumn(),1);
                    if ($id) break;
                }
            }
            if (!$id) domainFail('Matching booking checklist item was not found.');
            $record=updateChecklistItem($pdo,$bid,$id,$data,(int)$actor['user_id']);
        } elseif ($entity==='equipment' && in_array($action,['inspect','finalizeReturn'],true)) {
            $bid=asInt($data['booking_id'] ?? null,1);
            if (!$bid) domainFail('A booking ID is required.');
            if ($action==='inspect') {
                if (!is_array($data['items'] ?? null)) domainFail('Inspection items are required.');
                foreach ($data['items'] as &$inspection) {
                    if (!is_array($inspection)) domainFail('Each inspection item must be an object.');
                    if (isset($inspection['rental_item_id'])) $inspection['rental_item_id']=syncReference($inspection['rental_item_id'],'rentalItems',$state,(int)$actor['user_id']);
                } unset($inspection);
                $record=['booking_id'=>$bid,'items'=>saveReturnInspection($pdo,$bid,$data['items'],(int)$actor['user_id'])];
            } else $record=finalizeBookingReturn($pdo,$bid,(int)$actor['user_id'],$data);
        } elseif ($entity==='itemHistory' && $action==='create') {
            $record=saveItemHistory($pdo,$data,$actor); $id=(int)$record['history_id'];
        } elseif ($entity==='itemReleases' && $action==='create') {
            $record=saveItemRelease($pdo,$data,$actor); $id=(int)$record['release_id'];
        } elseif (isset($definitions[$entity])) {
            $definition=$definitions[$entity]()+[3=>[],4=>[],5=>null];
            [$table,$pk,$fields,$defaults,,$validate]=$definition;
            $id=$action==='create'?null:asInt($data[$pk] ?? $data['id'] ?? null,1);
            $record=tableCrudSave($pdo,$table,$pk,$fields,$defaults,$validate,$action,$id,$data,$actor);
            $id=$record[$pk] ?? $id;
        } elseif (in_array($entity,['settings','websiteContent'],true) && $action==='update') {
            $table=$entity==='settings'?'app_settings':'website_content'; $column=$entity==='settings'?'settings':'content'; $pk=$entity==='settings'?'settings_id':'content_id';
            $pdo->prepare('INSERT INTO '.$table.'('.$pk.','.$column.') VALUES(1,?) ON DUPLICATE KEY UPDATE '.$column.'=VALUES('.$column.')')->execute([json_encode($data,JSON_THROW_ON_ERROR)]);
            auditWrite($pdo,(int)$actor['user_id'],'update',$table,1,'Updated synchronized application content.');
            $record=['saved'=>true];
        } else domainFail('Unsupported operation; historical checklists, item releases, and item history cannot be deleted.');
        $ack=['client_id'=>$client,'entity'=>$entity,'server_id'=>$id,'data'=>$record];
        saveSyncReceipt($pdo,$state,$item,$ack,(int)$actor['user_id'],$hash);
        $pdo->commit(); $committed[]=$ack;
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($error instanceof DomainError && in_array($error->errorCode,['conflict','stale'],true)) {
            $conflicts[]=['client_id'=>$client,'kind'=>$error->errorCode,'reason'=>$error->getMessage(),'details'=>$error->details,
                'server_record'=>$error->details['server_record'] ?? ($error->details['bookings'][0] ?? null)];
        } else {
            if (!($error instanceof DomainError) && !($error instanceof InvalidArgumentException)) error_log((string)$error);
            $failed[]=['client_id'=>$client,'reason'=>($error instanceof DomainError || $error instanceof InvalidArgumentException)?$error->getMessage():'Unable to commit this operation.'];
        }
    }
}
sendJson(['ok'=>true,'data'=>['committed'=>$committed,'conflicts'=>$conflicts,'failed'=>$failed]]);
