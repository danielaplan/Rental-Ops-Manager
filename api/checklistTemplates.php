<?php
require_once __DIR__.'/auth.php';
require_once __DIR__.'/domain.php';
$owner=requireAuth(); $do=$_GET['do'] ?? 'all';
if ($_SERVER['REQUEST_METHOD']==='GET') {
    $id=asInt($_GET['id'] ?? null,1);
    $q=db()->prepare('SELECT * FROM checklist_templates'.($id?' WHERE template_id=?':'').' ORDER BY template_id'); $q->execute($id?[$id]:[]); $rows=$q->fetchAll();
    foreach($rows as &$row) { $q=db()->prepare('SELECT * FROM checklist_template_items WHERE template_id=? ORDER BY template_item_id'); $q->execute([$row['template_id']]); $row['items']=$q->fetchAll(); } unset($row);
    sendJson(['ok'=>true,'data'=>$id?($rows[0]??null):$rows]);
}
if ($_SERVER['REQUEST_METHOD']==='POST' && in_array($do,['create','update','delete'],true)) {
    $body=readJsonBody();
    $row=domainTransaction(function(PDO $pdo) use ($owner,$do,$body) {
        $id=asInt($_GET['id'] ?? null,1); $old=[];
        if ($do!=='create') { $q=$pdo->prepare('SELECT * FROM checklist_templates WHERE template_id=?'); $q->execute([$id]); $old=$q->fetch(); if (!$old) domainFail('Template not found.',404,'not_found'); }
        $package=asInt($old['package_id'] ?? $body['package_id'] ?? null,1);
        $q=$pdo->prepare('SELECT package_id FROM packages WHERE package_id=? FOR UPDATE'); $q->execute([$package]); if (!$q->fetchColumn()) domainFail('Valid package required.');
        $name=$body['template_name'] ?? $old['template_name'] ?? '';
        if (!is_string($name)) domainFail('Template name must be text.');
        $name=trim($name);
        $status=$do==='delete'?'Inactive':($body['status'] ?? $old['status'] ?? 'Active');
        if ($name==='' || strlen($name)>150 || !in_array($status,['Active','Inactive'],true)) domainFail('Template name of at most 150 bytes and valid status required.');
        if ($status==='Active') { $q=$pdo->prepare("SELECT template_id FROM checklist_templates WHERE package_id=? AND status='Active' AND template_id<>?"); $q->execute([$package,$id??0]); if ($q->fetch()) domainFail('Deactivate the existing active template first.'); }
        if ($old) $pdo->prepare('UPDATE checklist_templates SET template_name=?,status=? WHERE template_id=?')->execute([$name,$status,$id]);
        else { $pdo->prepare('INSERT INTO checklist_templates(package_id,template_name,status) VALUES(?,?,?)')->execute([$package,$name,$status]); $id=(int)$pdo->lastInsertId(); }
        if (array_key_exists('items',$body)) {
            if ($old) domainFail('Create a new template version to replace its items; deactivate the old template.');
            if (!is_array($body['items']) || !array_is_list($body['items'])) domainFail('Template items must be a list.');
            foreach($body['items'] as $item) {
                if (!is_array($item)) domainFail('Invalid template item.');
                if (!is_string($item['item_name'] ?? null)) domainFail('Item name must be text.');
                $itemName=trim($item['item_name']);
                $quantity=$item['expected_quantity'] ?? null;
                $qty=is_bool($quantity) ? null : asInt($quantity,0);
                if ($itemName==='' || strlen($itemName)>100 || $qty===null || $qty>4294967295) domainFail('Item name and quantity between zero and 4294967295 required.');
                $pdo->prepare('INSERT INTO checklist_template_items(template_id,item_name,expected_quantity) VALUES(?,?,?)')->execute([$id,$itemName,$qty]);
            }
        }
        auditWrite($pdo,$owner['user_id'],'template_'.$do,'checklist_template',$id,json_encode($body));
        return ['template_id'=>$id,'package_id'=>$package,'template_name'=>$name,'status'=>$status];
    });
    sendJson(['ok'=>true,'data'=>$row]);
}
sendJson(['ok'=>false,'error'=>'Method not allowed.'],405);
