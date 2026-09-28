<?php
require_once __DIR__.'/config.php';require_once __DIR__.'/auth.php';$do=$_GET['do']??'forItem';
if($_SERVER['REQUEST_METHOD']==='GET'&&$do==='forItem'){$item=asInt($_GET['rental_item_id']??null,1);$s=db()->prepare('SELECT history_id,rental_item_id,booking_id,action,qty,`condition`,event_date AS date FROM item_history WHERE rental_item_id=? ORDER BY event_date DESC');$s->execute([$item]);sendJson(['ok'=>true,'data'=>$s->fetchAll()]);}
if($_SERVER['REQUEST_METHOD']==='POST'&&$do==='create'){requireRole(['owner']);$b=readJsonBody();$s=db()->prepare('INSERT INTO item_history(rental_item_id,booking_id,action,qty,`condition`) VALUES(?,?,?,?,?)');$s->execute([$b['rental_item_id']??null,$b['booking_id']??null,$b['action']??'Updated',$b['qty']??0,$b['condition']??null]);sendJson(['ok'=>true,'data'=>['history_id'=>(int)db()->lastInsertId()]],201);}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
