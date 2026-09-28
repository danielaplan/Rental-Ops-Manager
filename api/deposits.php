<?php
require_once __DIR__.'/config.php';require_once __DIR__.'/auth.php';require_once __DIR__.'/deposit_service.php';$do=$_GET['do']??'';$p=db();
if($_SERVER['REQUEST_METHOD']==='GET'&&$do==='get'){$s=$p->prepare('SELECT * FROM deposits WHERE booking_id=? ORDER BY deposit_id DESC LIMIT 1');$s->execute([asInt($_GET['booking_id']??null,1)]);$row=$s->fetch();if($row)$row['refund_amount']=number_format((float)$row['amount_held']-(float)$row['deduction_amount'],2,'.','');sendJson(['ok'=>true,'data'=>$row?:null]);}
if($_SERVER['REQUEST_METHOD']==='POST'&&$do==='upsert'){requireAuth();$b=readJsonBody();try{$row=saveDeposit($p,asInt($b['booking_id']??null,1)??0,$b);sendJson(['ok'=>true,'data'=>$row]);}catch(InvalidArgumentException $e){sendJson(['ok'=>false,'error'=>$e->getMessage(),'code'=>'validation'],400);}}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
