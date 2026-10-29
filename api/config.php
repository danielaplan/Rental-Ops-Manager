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
 * Defaults point at a local XAMPP/WAMP MySQL install. Production settings
 * come from environment variables or the ignored api/config.local.php file.
 * Never commit a production config.local.php file.
 * --------------------------------------------------------------- */

/**
 * Hostinger shared hosting does not expose a consistent PHP environment
 * variable editor. A deployment may therefore provide an ignored local PHP
 * configuration file which returns an associative array of AKAD_* values.
 * Environment variables take precedence so container/managed deployments do
 * not need the local file.
 */
$localConfig = [];
$localConfigPath = __DIR__ . '/config.local.php';
if (is_file($localConfigPath)) {
    $loadedConfig = require $localConfigPath;
    if (!is_array($loadedConfig)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok'=>false,'error'=>'Production configuration is invalid.','code'=>'server_error']);
        exit(1);
    }
    $localConfig = $loadedConfig;
}

function akadConfigValue($key, $default = '') {
    global $localConfig;
    $environmentValue = getenv($key);
    if ($environmentValue !== false && $environmentValue !== '') return $environmentValue;
    return array_key_exists($key, $localConfig) ? $localConfig[$key] : $default;
}

$production = akadConfigValue('AKAD_ENV') === 'production';
if ($production) {
    foreach (['AKAD_DB_HOST', 'AKAD_DB_NAME', 'AKAD_DB_USER', 'AKAD_DB_PASS', 'AKAD_ALLOWED_ORIGINS'] as $key) {
        if (trim((string) akadConfigValue($key)) === '') {
            if (PHP_SAPI === 'cli') fwrite(STDERR, "Production configuration is incomplete.\n");
            else {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['ok'=>false,'error'=>'Production configuration is incomplete.','code'=>'server_error']);
            }
            exit(1);
        }
    }
}

define('DB_HOST', akadConfigValue('AKAD_DB_HOST', 'localhost'));
define('DB_PORT', akadConfigValue('AKAD_DB_PORT', '3306'));
define('DB_NAME', akadConfigValue('AKAD_DB_NAME', 'akad_rentals'));
define('DB_USER', akadConfigValue('AKAD_DB_USER', 'root'));
define('DB_PASS', akadConfigValue('AKAD_DB_PASS', ''));
define('DB_CHAR', 'utf8mb4');

if (!function_exists('array_is_list')) {
    function array_is_list(array $array): bool {
        $expectedKey = 0;
        foreach ($array as $key => $_) {
            if ($key !== $expectedKey++) return false;
        }
        return true;
    }
}

date_default_timezone_set('Asia/Manila');
header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', akadConfigValue('AKAD_ALLOWED_ORIGINS', ''))));
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} elseif ($production && $origin !== '') {
    http_response_code(403);
    echo json_encode(['ok'=>false,'error'=>'Origin is not allowed.']);
    exit;
}
if ($production && PHP_SAPI !== 'cli' && (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off')) {
    http_response_code(403);
    echo json_encode(['ok'=>false,'error'=>'HTTPS is required.']);
    exit;
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    exit(0);
}

/**
 * Open a PDO connection to the akad_rentals database.
 * Throws RuntimeException on failure — callers catch and send 500.
 */
function db() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHAR;
    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $opts);
        $pdo->exec("SET time_zone = '+08:00'");
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
    static $body = null;
    if ($body !== null) return $body;
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return $body = [];
    $data = json_decode($raw, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) sendJson(['ok'=>false,'error'=>'A valid JSON object is required.','code'=>'validation'],400);
    return $body = $data;
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
