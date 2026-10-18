<?php
require_once __DIR__ . '/config.php';

const SESSION_TTL = 86400;
const LOGIN_FAILURE_LIMIT = 5;
const LOGIN_LOCK_MINUTES = 15;

function hashPassword($plain) { return password_hash((string)$plain, PASSWORD_DEFAULT); }
function verifyPassword($plain, $hash) { return password_verify((string)$plain, $hash); }

function sessionToken() {
    return preg_replace('/^Bearer\s+/i', '', $_SERVER['HTTP_AUTHORIZATION'] ?? '');
}

function currentSession() {
    $token = sessionToken();
    if ($token === '') return null;
    $db = db();
    // Read after the conditional refresh so a revoked or expired token cannot use an earlier lookup.
    $stmt = $db->prepare("UPDATE sessions s JOIN users u ON u.user_id=s.user_id
        SET s.expires_at=DATE_ADD(NOW(),INTERVAL ? SECOND)
        WHERE s.session_token=? AND s.expires_at>NOW() AND u.account_status='Active' AND u.role='owner'");
    $stmt->execute([SESSION_TTL, $token]);
    $stmt = $db->prepare("SELECT s.user_id,u.full_name,u.username,u.role,u.contact_number,u.is_primary_owner,s.expires_at
        FROM sessions s JOIN users u ON u.user_id=s.user_id
        WHERE s.session_token=? AND s.expires_at>NOW() AND u.account_status='Active' AND u.role='owner'");
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function requireAuth() {
    $user = currentSession();
    if (!$user) sendJson(['ok'=>false,'error'=>'Authentication required.','code'=>'unauthorized'],401);
    return $user;
}

function requireRole($roles) {
    $user = requireAuth();
    if (is_array($roles) && !in_array($user['role'],$roles,true)) {
        sendJson(['ok'=>false,'error'=>'Access denied.','code'=>'forbidden'],403);
    }
    return $user;
}

// The caller holds the user-row lock so issuance cannot race account revocation.
function createSession($userId) {
    $token = bin2hex(random_bytes(32));
    db()->prepare('INSERT INTO sessions(user_id,session_token,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL ? SECOND))')
        ->execute([$userId,$token,SESSION_TTL]);
    return $token;
}

if (basename($_SERVER['SCRIPT_NAME'] ?? '') === 'auth.php') {
    require_once __DIR__ . '/domain.php';
    $do = $_GET['do'] ?? null;
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'POST' && $do === null) {
        $body = readJsonBody();
        $username = $body['username'] ?? $body['contact_number'] ?? $body['contact'] ?? null;
        $password = $body['password'] ?? null;
        if (!is_string($username) || trim($username)==='' || !is_string($password) || $password==='') {
            sendJson(['ok'=>false,'error'=>'Username and password are required.','code'=>'validation'],400);
        }
        $credential = array_key_exists('username',$body) ? 'username' : 'contact_number';
        $result = domainTransaction(function () use ($username,$password,$credential) {
            $db = db();
            $q = $db->prepare("SELECT *, locked_until>NOW() AS is_locked FROM users WHERE `$credential`=? ORDER BY user_id FOR UPDATE");
            $q->execute([trim($username)]);
            $matches = $q->fetchAll();
            if (count($matches)!==1) return null;
            $user = $matches[0];
            if ($user['account_status']!=='Active' || $user['role']!=='owner' || $user['is_locked']) return null;
            if (!verifyPassword($password,$user['password_hash'])) {
                $count = (int)$user['failed_login_count']+1;
                $q = $db->prepare('UPDATE users SET failed_login_count=?,locked_until=IF(? >= ?,DATE_ADD(NOW(),INTERVAL ? MINUTE),NULL) WHERE user_id=?');
                $q->execute([$count,$count,LOGIN_FAILURE_LIMIT,LOGIN_LOCK_MINUTES,$user['user_id']]);
                return null;
            }
            $db->prepare('UPDATE users SET failed_login_count=0,locked_until=NULL WHERE user_id=?')->execute([$user['user_id']]);
            $token = createSession($user['user_id']);
            return ['session_token'=>$token,'expires_in'=>SESSION_TTL,'user'=>[
                'user_id'=>(int)$user['user_id'],'full_name'=>$user['full_name'],'username'=>$user['username'],
                'role'=>$user['role'],'contact_number'=>$user['contact_number'],'is_primary_owner'=>(bool)$user['is_primary_owner']
            ]];
        });
        if (!$result) sendJson(['ok'=>false,'error'=>'Invalid credentials.','code'=>'unauthorized'],401);
        sendJson(['ok'=>true,'data'=>$result]);
    }
    if ($method === 'POST' && $do === 'logout') {
        $body = readJsonBody();
        $token = sessionToken() ?: ($body['session_token'] ?? '');
        if (is_string($token) && $token !== '') db()->prepare('DELETE FROM sessions WHERE session_token=?')->execute([$token]);
        sendJson(['ok'=>true,'data'=>['logged_out'=>true]]);
    }
    if ($method === 'GET' && $do === 'me') sendJson(['ok'=>true,'data'=>requireAuth()]);
    sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'server_error'],405);
}
