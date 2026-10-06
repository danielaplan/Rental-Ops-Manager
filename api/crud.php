<?php
require_once __DIR__ . '/config.php';
function tableCrud($table, $pk, $fields, $defaults = [], $filters = [])
{
    $db = db();
    $method = $_SERVER['REQUEST_METHOD'];
    $do = $_GET['do'] ?? ($method === 'GET' ? 'all' : null);
    $id = asInt($_GET['id'] ?? null, 1);
    if ($do === 'all' || $do === 'forService' || $do === 'forBooking') {
        $where = '';
        $args = [];
        if ($do === 'forService' && isset($_GET['service_id'])) {
            $where = ' WHERE service_id=?';
            $args[] = (int)$_GET['service_id'];
        }
        if ($do === 'forBooking' && isset($_GET['booking_id'])) {
            $where = ' WHERE booking_id=?';
            $args[] = (int)$_GET['booking_id'];
        }
        $q = $db->prepare("SELECT * FROM `$table`$where ORDER BY `$pk` DESC");
        $q->execute($args);
        sendJson(['ok' => true, 'data' => $q->fetchAll()]);
    }
    if ($do === 'get' && $id) {
        $q = $db->prepare("SELECT * FROM `$table` WHERE `$pk`=?");
        $q->execute([$id]);
        $r = $q->fetch();
        if (!$r) sendJson(['ok' => false, 'error' => 'Record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => $r]);
    }
    if ($do === 'create' && $method === 'POST') {
        $b = readJsonBody();
        $vals = [];
        foreach ($fields as $f) if (array_key_exists($f, $b)) $vals[$f] = $b[$f];
        $vals = $defaults + $vals;
        if (!$vals) sendJson(['ok' => false, 'error' => 'Missing fields.', 'code' => 'validation'], 400);
        $cols = array_keys($vals);
        $sql = "INSERT INTO `$table` (`" . implode('`,`', $cols) . '`) VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')';
        $db->prepare($sql)->execute(array_values($vals));
        $id = (int)$db->lastInsertId();
        $q = $db->prepare("SELECT * FROM `$table` WHERE `$pk`=?");
        $q->execute([$id]);
        sendJson(['ok' => true, 'data' => $q->fetch()], 201);
    }
    if ($do === 'update' && $method === 'POST' && $id) {
        $b = readJsonBody();
        $vals = [];
        foreach ($fields as $f) if (array_key_exists($f, $b)) $vals[$f] = $b[$f];
        if (!$vals) sendJson(['ok' => false, 'error' => 'No fields to update.', 'code' => 'validation'], 400);
        $set = implode(',', array_map(fn($f) => "`$f`=?", array_keys($vals)));
        $q = $db->prepare("UPDATE `$table` SET $set WHERE `$pk`=?");
        $q->execute([...array_values($vals), $id]);
        $q = $db->prepare("SELECT * FROM `$table` WHERE `$pk`=?");
        $q->execute([$id]);
        $r = $q->fetch();
        if (!$r) sendJson(['ok' => false, 'error' => 'Record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => $r]);
    }
    if ($do === 'delete' && $method === 'POST' && $id) {
        $q = $db->prepare("DELETE FROM `$table` WHERE `$pk`=?");
        $q->execute([$id]);
        if (!$q->rowCount()) sendJson(['ok' => false, 'error' => 'Record not found.', 'code' => 'not_found'], 404);
        sendJson(['ok' => true, 'data' => ['deleted' => true]]);
    }
    sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
}
function authWrite()
{
    require_once __DIR__ . '/auth.php';
    requireRole(['owner']);
}
