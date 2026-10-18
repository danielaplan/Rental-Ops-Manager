<?php
<<<<<<< HEAD
require_once __DIR__.'/config.php';require_once __DIR__.'/auth.php';require_once __DIR__.'/equipment_service.php';require_once __DIR__.'/booking_pricing.php';require_once __DIR__.'/booking_items_service.php';require_once __DIR__.'/sync_state.php';require_once __DIR__.'/deposit_service.php';
if($_SERVER['REQUEST_METHOD']==='GET'&&($_GET['do']??'')==='queue')sendJson(['ok'=>true,'data'=>['queue'=>[]]]);
if($_SERVER['REQUEST_METHOD']!=='POST'||($_GET['do']??'')!=='commit')sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
$syncUser=requireAuth();$queue=readJsonBody()['queue']??null;if(!is_array($queue)||count($queue)>100)sendJson(['ok'=>false,'error'=>'Queue must be an array of at most 100 operations.','code'=>'validation'],400);
$tables=['services'=>['services','service_id',['service_name','description','status','image']], 'categories'=>['categories','category_id',['name','status']], 'addons'=>['addons','addon_id',['service_id','name','price','status']], 'packages'=>['packages','package_id',['service_id','package_name','price']], 'customers'=>['customers','customer_id',['full_name','contact_number','messenger_handle']], 'equipment'=>['equipment_checklist','checklist_id',['booking_id','item_name','condition_out','condition_in','return_status','checked_by']], 'rentalItems'=>['rental_items','rental_item_id',['service_id','name','quantity','item_code','required','tracking','status','condition','notes']], 'gallery'=>['gallery','image_id',['title','image','featured']], 'bookingItems'=>['booking_items','booking_item_id',['booking_id','rental_item_id','service_id','name','expected_qty','released_qty','returned_qty','required','checked_released','condition','notes']], 'itemReleases'=>['item_releases','release_id',['booking_id','released_by','notes','released_at']], 'itemHistory'=>['item_history','history_id',['rental_item_id','booking_id','action','qty','condition']]];
function syncId($value){$value=(string)$value;return (int)(preg_match('/-(\d+)$/',$value,$m)?$m[1]:$value);}
$committed=[];$conflicts=[];$failed=[];$pdo=db();$pdo->exec("INSERT IGNORE INTO app_settings(settings_id,settings) VALUES(2,'{\"receipts\":{},\"ids\":{}}')");
foreach($queue as $it){$client=$it['client_id']??null;$entity=$it['entity']??'';$action=$it['action']??'';$d=$it['data']??[];
 try{
  if(!is_string($client)||$client===''||strlen($client)>128||!is_array($d))throw new InvalidArgumentException('Operation id and object data are required.');
  if(isset($it['owner_id'])&&(int)$it['owner_id']!==(int)$syncUser['user_id'])throw new InvalidArgumentException('This operation belongs to another user.');
  if(in_array($entity,['services','categories','addons','packages','customers','rentalItems','gallery','settings','websiteContent'],true)&&$syncUser['role']!=='owner')throw new InvalidArgumentException('Owner access is required for this operation.');
  $hash=hash('sha256',json_encode([$entity,$action,$d,$it['local_id']??null],JSON_THROW_ON_ERROR));
  $pdo->beginTransaction();$state=syncState($pdo);$receipt=$state['receipts'][$syncUser['user_id'].':'.$client]??null;
  if($receipt){if($receipt['hash']!==$hash)throw new InvalidArgumentException('An acknowledged operation cannot be changed.');$pdo->commit();$committed[]=$receipt['ack'];continue;}
  foreach(['id'=>$entity,'booking_id'=>'bookings','service_id'=>'services','package_id'=>'packages','customer_id'=>'customers','rental_item_id'=>'rentalItems'] as $field=>$target)if(isset($d[$field]))$d[$field]=syncReference($d[$field],$target,$state,(int)$syncUser['user_id']);
  foreach(['service_ids'=>'services','addon_ids'=>'addons'] as $field=>$target)if(isset($d[$field])){if(!is_array($d[$field]))throw new InvalidArgumentException('Selections must be arrays.');$d[$field]=array_map(fn($v)=>syncReference($v,$target,$state,(int)$syncUser['user_id']),$d[$field]);}
  if(isset($d['items']))foreach($d['items'] as &$inspection)$inspection['rental_item_id']=syncReference($inspection['rental_item_id']??0,'rentalItems',$state,(int)$syncUser['user_id']);unset($inspection);
  $record=null;$id=0;
  if($entity==='bookings'){
   $pdo->query('SELECT service_id FROM services WHERE service_id=1 FOR UPDATE')->fetchColumn();
   if(!in_array($action,['create','update','delete'],true))throw new RuntimeException('Unsupported booking action.');$rawId=(string)($d['id']??$d['booking_id']??0);$id=(int)((preg_match('/-(\d+)$/',$rawId,$m)?$m[1]:$rawId));$old=null;if($action!=='create'&&$id){$q=$pdo->prepare('SELECT * FROM bookings WHERE booking_id=? FOR UPDATE');$q->execute([$id]);$old=$q->fetch();if(!$old)throw new RuntimeException('Booking not found.');}
   if($action==='delete'){$pdo->prepare('DELETE FROM bookings WHERE booking_id=?')->execute([$id]);$ack=['client_id'=>$client,'entity'=>$entity,'server_id'=>$id,'data'=>['deleted'=>true]];saveSyncReceipt($pdo,$state,$it,$ack,(int)$syncUser['user_id'],$hash);$pdo->commit();$committed[]=$ack;continue;}
   if($old&&isset($d['_base'])){foreach($d['_base'] as $field=>$expected){if(!in_array($field,['status','event_date','start_time','end_time','event_location'],true))continue;$actual=$old[$field]??null;if($field==='status'){$actual=strtolower((string)$actual);$expected=strtolower((string)$expected);}if(in_array($field,['start_time','end_time'],true)){$actual=substr((string)$actual,0,5);$expected=substr((string)$expected,0,5);}if((string)$actual!==(string)$expected){$pdo->rollBack();$conflicts[]=['client_id'=>$client,'server_record'=>$old,'kind'=>'stale','reason'=>'Booking changed on another device. Review your draft before retrying.'];continue 2;}}}
   $date=$d['event_date']??($old['event_date']??'');$start=$d['start_time']??($old['start_time']??'');$end=$d['end_time']??($old['end_time']??'');$status=strtolower($d['status']??($old['status']??'pending'));
   if(!asDate($date)||!preg_match('/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/',$start)||!preg_match('/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/',$end)||strtotime($start)>=strtotime($end))throw new RuntimeException('A valid date and an end time after the start time are required.');
   $contact=$d['contact']??$d['contact_number']??null;$name=$d['customer_name']??null;$cid=(int)($d['customer_id']??($old['customer_id']??0));if(!$cid&&$action==='create'&&$contact&&$name){$q=$pdo->prepare('SELECT customer_id FROM customers WHERE contact_number=?');$q->execute([$contact]);$cid=(int)$q->fetchColumn();if($cid)$pdo->prepare('UPDATE customers SET full_name=? WHERE customer_id=?')->execute([$name,$cid]);else{$pdo->prepare('INSERT INTO customers(full_name,contact_number,messenger_handle) VALUES(?,?,?)')->execute([$name,$contact,$d['email']??null]);$cid=(int)$pdo->lastInsertId();}}
   if(!$cid)throw new RuntimeException('Booking customer is required.');$services=$d['service_ids']??(isset($old['service_ids'])?json_decode($old['service_ids'],true):[]);$svc=isset($services[0])?(int)preg_replace('/\D/','',(string)$services[0]):(int)($old['service_id']??0);$pkg=(int)preg_replace('/\D/','',(string)($d['package_id']??($old['package_id']??0)));if(!$pkg&&$svc){$q=$pdo->prepare('SELECT package_id FROM packages WHERE service_id=? ORDER BY package_id LIMIT 1');$q->execute([$svc]);$pkg=(int)$q->fetchColumn();}if(!$svc||!$pkg)throw new RuntimeException('Valid service and package are required.');
   $slotChanged=$action==='create'||$date!==($old['event_date']??null)||$start!==($old['start_time']??null)||$end!==($old['end_time']??null)||$status!==strtolower($old['status']??'');if($svc===1&&$slotChanged&&in_array($status,['confirmed','reserved','preparing','released'],true)){$q=$pdo->prepare("SELECT * FROM bookings WHERE event_date=? AND service_id=1 AND LOWER(status) IN ('confirmed','reserved','preparing','released') AND booking_id<>? AND start_time<? AND end_time>? LIMIT 1");$q->execute([$date,$action==='create'?0:$id,$end,$start]);$conflict=$q->fetch();if($conflict){$pdo->rollBack();$conflicts[]=['client_id'=>$client,'server_record'=>$conflict,'reason'=>'Time slot already booked.'];continue;}}
   $addonIds=$d['addon_ids']??($old?json_decode($old['addon_ids']?:'[]',true):[]);if(!is_array($addonIds))throw new InvalidArgumentException('Add-ons must be an array.');$discount=$d['discount']??($old['discount']??0);$fees=$d['fees']??($old['fees']??0);$totals=calculateBookingTotals($pdo,$svc,$pkg,$addonIds,$discount,$fees);
   $vals=['customer_id'=>$cid,'service_id'=>$svc,'package_id'=>$pkg,'event_date'=>$date,'start_time'=>$start,'end_time'=>$end,'event_location'=>$d['location']??$d['event_location']??($old['event_location']??null),'status'=>$status,'service_ids'=>json_encode($services),'addon_ids'=>json_encode($addonIds),'discount'=>$discount,'fees'=>$fees,'subtotal'=>$totals['subtotal'],'addons_total'=>$totals['addons_total'],'total'=>$totals['total'],'amount_paid'=>$action==='create'?0:($d['amount_paid']??$old['amount_paid']),'payment_status'=>$action==='create'?'Unpaid':($d['payment_status']??$old['payment_status']),'source'=>$d['source']??($old['source']??null),'guests'=>$d['guests']??($old['guests']??null),'event_type'=>$d['event_type']??($old['event_type']??null),'special_requests'=>$d['special_requests']??($old['special_requests']??null),'email'=>$d['email']??($old['email']??null),'customer_type'=>$d['customer_type']??($old['customer_type']??null)];
   if($action==='create'){$vals['created_by']=requireAuth()['user_id'];$cols=array_keys($vals);$pdo->prepare('INSERT INTO bookings (`'.implode('`,`',$cols).'`) VALUES ('.implode(',',array_fill(0,count($cols),'?')).')')->execute(array_values($vals));$id=(int)$pdo->lastInsertId();ensureBookingItems($pdo,$id,$services);}else{$cols=array_keys($vals);$pdo->prepare('UPDATE bookings SET '.implode(',',array_map(fn($x)=>"`$x`=?",$cols)).' WHERE booking_id=?')->execute([...array_values($vals),$id]);}
   $record=['id'=>$id];
  }elseif($entity==='payments'&&$action==='create'){
   $bid=syncId($d['booking_id']??0);$amount=asDecimal($d['amount']??null);$method=strtolower($d['payment_method']??$d['method']??'');$method=match($method){'gcash'=>'gcash','maribank','bank transfer','cash','other'=>'maribank',default=>null};if(!$bid||$amount===null||!$method)throw new RuntimeException('Invalid payment data.');$pdo->prepare("INSERT INTO payments(booking_id,amount,payment_method,payment_status,notes) VALUES(?,?,?,'paid',?)")->execute([$bid,$amount,$method,$d['notes']??null]);$id=(int)$pdo->lastInsertId();$total="CASE WHEN total>0 THEN total ELSE GREATEST(subtotal+addons_total-discount+fees,0) END";$pdo->prepare("UPDATE bookings SET payment_status=CASE WHEN amount_paid+?>=$total THEN 'Fully Paid' WHEN amount_paid+?>0 THEN 'Partial' ELSE 'Unpaid' END,amount_paid=amount_paid+? WHERE booking_id=?")->execute([$amount,$amount,$amount,$bid]);$record=['payment_id'=>$id];
  }elseif(in_array($entity,['websiteContent','settings'],true)&&$action==='update'){
   $table=$entity==='websiteContent'?'website_content':'app_settings';$column=$entity==='websiteContent'?'content':'settings';$keyColumn=$entity==='websiteContent'?'content_id':'settings_id';$pdo->prepare('INSERT INTO `'.$table.'` (`'.$keyColumn.'`,`'.$column.'`) VALUES (1,?) ON DUPLICATE KEY UPDATE `'.$column.'`=VALUES(`'.$column.'`)')->execute([json_encode($d,JSON_THROW_ON_ERROR)]);$record=['saved'=>true];
  }elseif($entity==='bookingItems'&&$action==='generate'){
   $bid=syncId($d['booking_id']??0);$services=$d['service_ids']??[];if(!$bid||!is_array($services))throw new RuntimeException('Booking and services are required.');ensureBookingItems($pdo,$bid,$services);$record=['booking_id'=>$bid];
  }elseif($entity==='bookingItems'&&$action==='update'&&empty($d['id'])&&empty($d['booking_item_id'])){
   $bid=syncId($d['booking_id']??0);$rid=syncId($d['rental_item_id']??0);$allowed=['expected_qty','released_qty','returned_qty','required','checked_released','condition','notes'];$vals=array_intersect_key($d,array_flip($allowed));if(!$bid||!$rid||!$vals)throw new RuntimeException('Booking and rental item ids with update fields are required.');$pdo->prepare('UPDATE booking_items SET '.implode(',',array_map(fn($x)=>"`$x`=?",array_keys($vals))).' WHERE booking_id=? AND rental_item_id=?')->execute([...array_values($vals),$bid,$rid]);$record=['booking_id'=>$bid,'rental_item_id'=>$rid];
  }elseif(in_array($entity,['deposits','delivery'],true)&&$action==='upsert'){
   $bid=syncId($d['booking_id']??0);if(!$bid)throw new RuntimeException('Booking is required.');if($entity==='deposits'){$record=saveDeposit($pdo,$bid,$d);}else{if(!in_array($d['delivery_method']??'', ['self_pickup','lalamove','owner_delivered'],true)||!in_array($d['fee_shouldered_by']??'', ['renter','owner'],true))throw new InvalidArgumentException('Invalid delivery values.');$pdo->prepare('INSERT INTO delivery(booking_id,delivery_method,delivery_fee,fee_shouldered_by) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE delivery_method=VALUES(delivery_method),delivery_fee=VALUES(delivery_fee),fee_shouldered_by=VALUES(fee_shouldered_by)')->execute([$bid,$d['delivery_method'],$d['delivery_fee']??0,$d['fee_shouldered_by']]);$record=['booking_id'=>$bid];}
  }elseif($entity==='equipment'&&$action==='finalizeReturn'){
   $bid=syncId($d['booking_id']??0);$record=finalizeBookingReturn($pdo,$bid,(int)$syncUser['user_id']);
  }elseif($entity==='equipment'&&$action==='inspect'){
   $bid=syncId($d['booking_id']??0);$user=requireAuth();$record=['booking_id'=>$bid,'items'=>saveReturnInspection($pdo,$bid,$d['items']??[],(int)$user['user_id'])];
  }elseif(isset($tables[$entity])&&in_array($action,['create','update','delete'],true)){
   [$table,$pk,$allowed]=$tables[$entity];$rawId=(string)($d[$pk]??$d['id']??0);$id=(int)(preg_match('/-(\d+)$/',$rawId,$m)?$m[1]:$rawId);
   if($action==='create'){$vals=array_intersect_key($d,array_flip($allowed));if(!$vals)throw new RuntimeException('No allowed fields supplied.');$cols=array_keys($vals);$pdo->prepare('INSERT INTO `'.$table.'` (`'.implode('`,`',$cols).'`) VALUES ('.implode(',',array_fill(0,count($cols),'?')).')')->execute(array_values($vals));$id=(int)$pdo->lastInsertId();}
   elseif($action==='update'){$vals=array_intersect_key($d,array_flip($allowed));if(!$id||!$vals)throw new RuntimeException('An id and update fields are required.');$pdo->prepare('UPDATE `'.$table.'` SET '.implode(',',array_map(fn($x)=>"`$x`=?",array_keys($vals))).' WHERE `'.$pk.'`=?')->execute([...array_values($vals),$id]);}
   else{if(!$id)throw new RuntimeException('An id is required.');$pdo->prepare('DELETE FROM `'.$table.'` WHERE `'.$pk.'`=?')->execute([$id]);}$record=[$pk=>$id];
  }else throw new RuntimeException('Unsupported operation.');
  $ack=['client_id'=>$client,'entity'=>$entity,'server_id'=>$id?:($record['id']??$record['payment_id']??null),'data'=>$record];saveSyncReceipt($pdo,$state,$it,$ack,(int)$syncUser['user_id'],$hash);
  $pdo->commit();$committed[]=$ack;
 }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();$failed[]=['client_id'=>$client,'reason'=>$e->getMessage()];}
=======
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
        if (isset($item['owner_id']) && (int)$item['owner_id']!==(int)$actor['user_id']) domainFail('This operation belongs to another user.');
        $hash=hash('sha256',json_encode([$entity,$action,$data,$item['local_id'] ?? null],JSON_THROW_ON_ERROR));
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
                    if (!in_array($field,['status','event_date','start_time','end_time','event_location','service_id','package_id','preparation_minutes','travel_minutes','event_start_datetime','event_end_datetime'],true)) continue;
                    $actual=$old[$field] ?? null;
                    if ($field==='status') { $actual=strtolower((string)$actual); $expected=strtolower((string)$expected); }
                    if (in_array($field,['start_time','end_time'],true)) { $actual=substr((string)$actual,0,5); $expected=substr((string)$expected,0,5); }
                    if (!is_scalar($expected) && $expected!==null) domainFail('Invalid previous booking value.');
                    if ((string)$actual!==(string)$expected) {
                        $error=new DomainError('Booking changed on another device. Review your draft before retrying.',409,'stale');
                        $error->details=['server_record'=>$old]; throw $error;
                    }
                }
            }
            $id=saveBooking($pdo,$action,$id,$data,(int)$actor['user_id']);
            $record=bookingRow($id);
        } elseif ($entity==='payments' && $action==='create') {
            $record=savePayment($pdo,'create',null,$data,$actor); $id=(int)$record['payment_id'];
        } elseif ($entity==='deposits' && $action==='upsert') {
            $record=syncDepositUpsert($pdo,asInt($data['booking_id'] ?? null,1)??0,$data,(int)$actor['user_id']);
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
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7
}
sendJson(['ok'=>true,'data'=>['committed'=>$committed,'conflicts'=>$conflicts,'failed'=>$failed]]);
