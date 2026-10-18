<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/domain.php';
$actor = requireAuth();
if (!$actor['is_primary_owner']) sendJson(['ok'=>false,'error'=>'Primary owner required.','code'=>'forbidden'],403);
$do = $_GET['do'] ?? 'all';
if ($_SERVER['REQUEST_METHOD']==='GET' && $do==='all') {
    $rows = db()->query("SELECT user_id,full_name,username,contact_number,account_status,is_primary_owner,created_at,updated_at FROM users WHERE role='owner' ORDER BY user_id")->fetchAll();
    sendJson(['ok'=>true,'data'=>$rows]);
}
if ($_SERVER['REQUEST_METHOD']!=='POST' || !in_array($do,['create','deactivate','reactivate','resetPassword'],true)) {
    sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
}
$body = readJsonBody();
$result = domainTransaction(function () use ($actor,$do,$body) {
    $db = db();
    $q = $db->prepare('SELECT * FROM users WHERE user_id=? FOR UPDATE');
    $q->execute([$actor['user_id']]);
    $primary = $q->fetch();
    if (!$primary || !$primary['is_primary_owner'] || $primary['account_status']!=='Active') domainFail('Primary owner required.',403,'forbidden');
    if ($do==='create' || $do==='resetPassword') {
        $password = $body['password'] ?? null;
        if (!is_string($password) || strlen($password)<8 || strlen($password)>72) domainFail('Password must contain 8 to 72 bytes.');
    }
    if ($do==='create') {
        $username = $body['username'] ?? null;
        $name = $body['full_name'] ?? null;
        if (!is_string($username) || !preg_match('/^[A-Za-z0-9_.-]{1,100}$/',$username)) domainFail('A valid username is required.');
        if (!is_string($name) || trim($name)==='' || strlen($name)>100) domainFail('A full name of at most 100 bytes is required.');
        if ((int)$db->query("SELECT COUNT(*) FROM users WHERE role='owner'")->fetchColumn()>=2) domainFail('The two owner accounts already exist; reactivate the existing account.',409,'conflict');
        $check = $db->prepare('SELECT 1 FROM users WHERE username=?');
        $check->execute([$username]);
        if ($check->fetchColumn()) domainFail('Username is already in use.',409,'conflict');
        $contact = $body['contact_number'] ?? null;
        if ($contact!==null && (!is_string($contact) || strlen($contact)>20)) domainFail('Invalid contact number.');
        $db->prepare("INSERT INTO users(full_name,username,contact_number,password_hash,role,account_status,is_primary_owner) VALUES(?,?,?,?,'owner','Active',0)")
            ->execute([trim($name),$username,$contact,hashPassword($password)]);
        $id = (int)$db->lastInsertId();
    } else {
        $id = asInt($_GET['id'] ?? $body['user_id'] ?? null,1);
        if (!$id || $id===(int)$actor['user_id']) domainFail('Select the other owner account.');
        $q->execute([$id]);
        $target = $q->fetch();
        if (!$target || $target['role']!=='owner' || $target['is_primary_owner']) domainFail('Other owner account not found.',404,'not_found');
        if ($do==='resetPassword') {
            $db->prepare('UPDATE users SET password_hash=?,failed_login_count=0,locked_until=NULL WHERE user_id=?')->execute([hashPassword($password),$id]);
        } else {
            $db->prepare('UPDATE users SET account_status=? WHERE user_id=?')->execute([$do==='deactivate'?'Inactive':'Active',$id]);
        }
        if ($do!=='reactivate') $db->prepare('DELETE FROM sessions WHERE user_id=?')->execute([$id]);
    }
    auditWrite($db,(int)$actor['user_id'],'owner_'.$do,'user',$id,'Owner account '.$do);
    $q = $db->prepare('SELECT user_id,full_name,username,contact_number,account_status,is_primary_owner FROM users WHERE user_id=?');
    $q->execute([$id]);
    return $q->fetch();
});
sendJson(['ok'=>true,'data'=>$result],$do==='create'?201:200);
