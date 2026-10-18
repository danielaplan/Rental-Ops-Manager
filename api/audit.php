<?php
require_once __DIR__.'/auth.php';
requireAuth();
if ($_SERVER['REQUEST_METHOD']!=='GET') sendJson(['ok'=>false,'error'=>'Audit and migration history are read-only.'],405);
$archive=($_GET['do'] ?? '')==='migration';
$id=asInt($_GET['after_id'] ?? 0,0) ?? 0;
$limit=min(asInt($_GET['limit'] ?? 100,1) ?? 100,500);
$args=[$id];
if ($archive) {
    $sql='SELECT * FROM migration_archive WHERE archive_id>?';
    if (isset($_GET['source_table'])) { $sql.=' AND source_table=?'; $args[]=$_GET['source_table']; }
    if (isset($_GET['source_id'])) { $sql.=' AND source_id=?'; $args[]=$_GET['source_id']; }
    $sql.=' ORDER BY archive_id';
} else {
    $sql='SELECT a.*,u.full_name AS actor_name FROM audit_logs a LEFT JOIN users u ON u.user_id=a.user_id WHERE a.audit_id>?';
    if (isset($_GET['booking_id'])) { $sql.=" AND record_type='booking' AND record_id=?"; $args[]=asInt($_GET['booking_id'],1); }
    $sql.=' ORDER BY a.audit_id';
}
$q=db()->prepare($sql.' LIMIT '.$limit); $q->execute($args);
sendJson(['ok'=>true,'data'=>$q->fetchAll()]);
