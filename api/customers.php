<?php
require_once __DIR__ . '/crud.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') authWrite();
if (($_GET['do'] ?? '') === 'search') {
    $q = '%' . ($_GET['q'] ?? '') . '%';
    $s = db()->prepare('SELECT * FROM customers WHERE full_name LIKE ? OR contact_number LIKE ? ORDER BY customer_id DESC');
    $s->execute([$q, $q]);
    sendJson(['ok' => true, 'data' => $s->fetchAll()]);
}
tableCrud('customers', 'customer_id', ['full_name', 'contact_number', 'messenger_handle']);
