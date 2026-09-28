<?php
require_once __DIR__.'/config.php';require_once __DIR__.'/auth.php';$do=$_GET['do']??'get';
if($_SERVER['REQUEST_METHOD']==='GET'&&$do==='get'){$s=db()->query('SELECT content FROM website_content WHERE content_id=1');$row=$s->fetch();sendJson(['ok'=>true,'data'=>$row?json_decode($row['content'],true):new stdClass()]);}
if($_SERVER['REQUEST_METHOD']==='POST'&&$do==='update'){requireRole(['owner']);$data=readJsonBody();$s=db()->prepare('INSERT INTO website_content(content_id,content) VALUES(1,?) ON DUPLICATE KEY UPDATE content=VALUES(content)');$s->execute([json_encode($data,JSON_THROW_ON_ERROR)]);sendJson(['ok'=>true,'data'=>$data]);}
sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
 