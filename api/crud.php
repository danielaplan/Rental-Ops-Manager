<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/domain.php';

function tableCrudSave(PDO $db, $table, $pk, $fields, $defaults, $validate, $do, $id, array $body, array $actor) {
    if (!in_array($do,['create','update','delete'],true) || ($do !== 'create' && !$id)) domainFail('A valid action and record ID are required.');
    $old = null;
    if ($do!=='create') {
        $q = $db->prepare("SELECT * FROM `$table` WHERE `$pk`=? FOR UPDATE");
        $q->execute([$id]);
        $old = $q->fetch();
        if (!$old) domainFail('Record not found.',404,'not_found');
    }
    if ($do==='delete') {
        if (in_array($table,['packages','services'],true)) {
            $db->prepare("UPDATE `$table` SET status='Inactive' WHERE `$pk`=?")->execute([$id]);
            auditWrite($db,(int)$actor['user_id'],'archive',$table,$id,'Archived without deleting history.');
            return ['archived'=>true];
        }
        if ($table==='customers') {
            $q = $db->prepare('SELECT 1 FROM bookings WHERE customer_id=? LIMIT 1');
            $q->execute([$id]);
            if ($q->fetchColumn()) domainFail('Customers with booking history cannot be deleted.',409,'conflict');
        }
        if ($table==='rental_items') {
            // Keep history addressable; legacy foreign keys otherwise null the item link.
            foreach (['item_history','equipment_checklist','booking_items','booking_checklist_items'] as $historyTable) {
                $q = $db->prepare("SELECT rental_item_id FROM `$historyTable` WHERE rental_item_id=? LIMIT 1 FOR UPDATE");
                $q->execute([$id]);
                if ($q->fetchColumn()) domainFail('Rental items with history or booking checklists cannot be deleted.',409,'history_retained');
            }
        }
        $db->prepare("DELETE FROM `$table` WHERE `$pk`=?")->execute([$id]);
        auditWrite($db,(int)$actor['user_id'],'delete',$table,$id,'Deleted record.');
        return ['deleted'=>true];
    }
    $values = array_intersect_key($body,array_flip($fields));
    if ($do==='create') $values += $defaults;
    if (!$values) domainFail('No fields supplied.');
    if ($validate) $values = $validate($values,$old);
    if ($do==='create') {
        $columns = array_keys($values);
        $sql = "INSERT INTO `$table` (`".implode('`,`',$columns).'`) VALUES ('.implode(',',array_fill(0,count($columns),'?')).')';
        $db->prepare($sql)->execute(array_values($values));
        $id = (int)$db->lastInsertId();
    } else {
        $set = implode(',',array_map(fn($field)=>"`$field`=?",array_keys($values)));
        $db->prepare("UPDATE `$table` SET $set WHERE `$pk`=?")->execute([...array_values($values),$id]);
    }
    auditWrite($db,(int)$actor['user_id'],$do,$table,$id,'Updated '.implode(', ',array_keys($values)).'.');
    $q = $db->prepare("SELECT * FROM `$table` WHERE `$pk`=?");
    $q->execute([$id]);
    return $q->fetch();
}

function tableCrud($table, $pk, $fields, $defaults = [], $filters = [], $validate = null, $publicRead = false)
{
    $db = db();
    $method = $_SERVER['REQUEST_METHOD'];
    $do = $_GET['do'] ?? ($method === 'GET' ? 'all' : null);
    $id = asInt($_GET['id'] ?? null,1);
    if ($method==='GET' && in_array($do,['all','forService','forBooking'],true)) {
        if (!$publicRead) requireAuth();
        $where = '';
        $args = [];
        $filter = $do==='forService' ? 'service_id' : ($do==='forBooking' ? 'booking_id' : null);
        if ($filter !== null) {
            $value = asInt($_GET[$filter] ?? null,1);
            if (!$value || !in_array($filter,$fields,true)) sendJson(['ok'=>false,'error'=>'Invalid filter.','code'=>'validation'],400);
            $where = " WHERE `$filter`=?";
            $args[] = $value;
        }
        $q = $db->prepare("SELECT * FROM `$table`$where ORDER BY `$pk` DESC");
        $q->execute($args);
        sendJson(['ok'=>true,'data'=>$q->fetchAll()]);
    }
    if ($method==='GET' && $do==='get' && $id) {
        if (!$publicRead) requireAuth();
        $q = $db->prepare("SELECT * FROM `$table` WHERE `$pk`=?");
        $q->execute([$id]);
        $row = $q->fetch();
        if (!$row) sendJson(['ok'=>false,'error'=>'Record not found.','code'=>'not_found'],404);
        sendJson(['ok'=>true,'data'=>$row]);
    }
    if ($method==='POST' && in_array($do,['create','update','delete'],true) && ($do==='create' || $id)) {
        $actor = requireRole(['owner']);
        $body = readJsonBody();
        $result = domainTransaction(fn(PDO $pdo) => tableCrudSave($pdo,$table,$pk,$fields,$defaults,$validate,$do,$id,$body,$actor));
        sendJson(['ok'=>true,'data'=>$result],$do==='create'?201:200);
    }
    sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
}

function authWrite() { return requireRole(['owner']); }
