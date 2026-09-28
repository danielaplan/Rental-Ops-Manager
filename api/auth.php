<?php
/**
 * auth.php
 * ------------------------------------------------------------------
 * Staff/owner authentication and session management.
 *
 * The admin pages keep a lightweight session marker in localStorage
 * (er_admin_session); this endpoint is the single place that decides
 * whether that marker is real. PHP verifies credentials against the
 * USERS table and issues the session — setting a localStorage flag
 * alone is not access control, per the handoff.
 *
 * Endpoints:
 *   POST /api/auth.php          login   {contact_number, password}
 *   POST /api/auth.php?do=logout logout  {session_token}
 *   GET  /api/auth.php?do=me    current user (requires session)
 * --------------------------------------------------------------- */
require_once __DIR__ . '/config.php';

const SESSION_TTL = 86400; // 24 hours

function hashPassword($plain) {
    return password_hash((string)$plain, PASSWORD_DEFAULT);
}

function verifyPassword($plain, $hash) {
    return password_verify((string)$plain, $hash);
}

function currentSession() {
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = preg_replace('/^Bearer\s+/', '', $token);
    if ($token === '' && isset($_GET['session_token'])) $token = $_GET['session_token'];
    if ($token === '') return null;

    $db = db();
    $stmt = $db->prepare(
        "SELECT s.user_id, u.full_name, u.role, u.contact_number, s.expires_at
         FROM sessions s
         JOIN users u ON u.user_id = s.user_id
         WHERE s.session_token = ? AND s.expires_at > NOW()"
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    if (!$row) return null;

    // Sliding expiry: extend the session on each authenticated request.
    $db->prepare("UPDATE sessions SET expires_at = DATE_ADD(NOW(), INTERVAL ? SECOND) WHERE session_token = ?")
       ->execute([SESSION_TTL, $token]);

    return $row;
}

function requireAuth() {
    $user = currentSession();
    if (!$user) {
        sendJson(['ok' => false, 'error' => 'Authentication required.', 'code' => 'unauthorized'], 401);
    }
    return $user;
}

function requireRole($roles) {
    $user = requireAuth();
    if (is_array($roles) && !in_array($user['role'], $roles, true)) {
        sendJson(['ok' => false, 'error' => 'Access denied.', 'code' => 'forbidden'], 403);
    }
    return $user;
}

function createSession($userId) {
    $db = db();
    $token = bin2hex(random_bytes(32));
    $db->prepare(
        "INSERT INTO sessions (user_id, session_token, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))"
    )->execute([$userId, $token, SESSION_TTL]);
    return $token;
}

if (basename($_SERVER['SCRIPT_NAME'] ?? '') === 'auth.php') {
$do = $_GET['do'] ?? null;

// ---- POST /api/auth.php  (login) ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $do === null) {
    $body = readJsonBody();
    $contact = $body['contact_number'] ?? $body['contact'] ?? null;
    $password = $body['password'] ?? null;

    if (!$contact || !$password) {
        sendJson(['ok' => false, 'error' => 'Contact number and password are required.', 'code' => 'validation'], 400);
    }

    $db = db();
    $stmt = $db->prepare("SELECT * FROM users WHERE contact_number = ? LIMIT 1");
    $stmt->execute([$contact]);
    $user = $stmt->fetch();

    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        // Generic message so attackers can't enumerate accounts.
        sendJson(['ok' => false, 'error' => 'Invalid credentials.', 'code' => 'unauthorized'], 401);
    }

    $token = createSession($user['user_id']);
    sendJson([
        'ok' => true,
        'data' => [
            'session_token' => $token,
            'user' => [
                'user_id' => (int)$user['user_id'],
                'full_name' => $user['full_name'],
                'role' => $user['role'],
                'contact_number' => $user['contact_number'],
            ],
            'expires_in' => SESSION_TTL,
        ],
    ]);
}

// ---- POST /api/auth.php?do=logout ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $do === 'logout') {
    $body = readJsonBody();
    $token = $body['session_token'] ?? currentSession()['session_token'] ?? null;
    if ($token) {
        db()->prepare("DELETE FROM sessions WHERE session_token = ?")->execute([$token]);
    }
    sendJson(['ok' => true, 'data' => ['logged_out' => true]]);
}

// ---- GET /api/auth.php?do=me ----
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $do === 'me') {
    $user = requireAuth();
    sendJson([
        'ok' => true,
        'data' => [
            'user_id' => (int)$user['user_id'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'contact_number' => $user['contact_number'],
        ],
    ]);
}

sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
}
