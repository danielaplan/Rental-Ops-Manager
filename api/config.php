<?php
/**
 * config.php
 * ------------------------------------------------------------------
 * Shared bootstrap for every api/*.php endpoint.
 *
 * - Sets JSON content type + permissive CORS so the Bootstrap admin
 *   pages (served from /admin) can talk to /api.
 * - Opens one MySQL connection per request via PDO.
 * - Exposes sendJson() and the shared DB constant.
 *
 * Database credentials live here so they can be changed in one place.
 * Defaults point at a local XAMPP/WAMP MySQL install; override with
 * environment variables or edit the values below.
 * --------------------------------------------------------------- */

define('DB_HOST', getenv('AKAD_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('AKAD_DB_NAME') ?: 'akad_rentals');
define('DB_USER', getenv('AKAD_DB_USER') ?: 'root');
define('DB_PASS', getenv('AKAD_DB_PASS') ?: '');
define('DB_CHAR', 'utf8mb4');

// Allow any origin during development. Narrow this before production.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Open a PDO connection to the akad_rentals database.
 * Throws RuntimeException on failure — callers catch and send 500.
 */
function db() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHAR;
    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $opts);
    } catch (PDOException $e) {
        sendJson(['ok' => false, 'error' => 'Database unavailable.', 'code' => 'server_error'], 500);
    }
    return $pdo;
}

/**
 * Send a JSON response and terminate.
 * @param array $payload
 * @param int   $httpStatus
 */
function sendJson($payload, $httpStatus = 200) {
    http_response_code($httpStatus);
    echo json_encode($payload, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Read the raw JSON body of a request, decoded as an associative array.
 * Returns [] when there is no body or it is not valid JSON.
 */
function readJsonBody() {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Read a value from the JSON body, falling back to $_GET / $_POST.
 * Used by endpoints that accept either a JSON payload or form-encoded data.
 */
function input($key, $default = null) {
    $body = readJsonBody();
    if (array_key_exists($key, $body)) return $body[$key];
    if (array_key_exists($key, $_POST)) return $_POST[$key];
    if (array_key_exists($key, $_GET))  return $_GET[$key];
    return $default;
}

/**
 * Require a non-empty value; return null when missing/blank.
 */
function requireField($key) {
    $val = input($key);
    if ($val === null || (is_string($val) && trim($val) === '')) return null;
    return $val;
}

/**
 * Coerce a value to a non-negative integer.
 */
function asInt($val, $min = null) {
    if ($val === null || $val === '') return null;
    $n = filter_var($val, FILTER_VALIDATE_INT);
    if ($n === false) return null;
    if ($min !== null && $n < $min) return null;
    return $n;
}

/**
 * Coerce a value to a non-negative decimal string suitable for DECIMAL columns.
 */
function asDecimal($val) {
    if ($val === null || $val === '') return null;
    if (!is_numeric($val)) return null;
    return number_format((float)$val, 2, '.', '');
}

/**
 * Validate a YYYY-MM-DD date. Returns normalized string or null.
 */
function asDate($val) {
    if (!is_string($val) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $val)) return null;
    $d = DateTime::createFromFormat('Y-m-d', $val);
    return ($d && $d->format('Y-m-d') === $val) ? $val : null;
}

/**
 * Validate a HH:MM or HH:MM:SS time. Returns normalized HH:MM:SS or null.
 */
function asTime($val) {
    if (!is_string($val)) return null;
    if (preg_match('/^\d{2}:\d{2}$/', $val)) return $val . ':00';
    if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $val)) return $val;
    return null;
}