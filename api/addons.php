<?php
require_once __DIR__ . '/crud.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') authWrite();
tableCrud('addons', 'addon_id', ['service_id', 'name', 'price', 'status'], ['status' => 'Active']);
