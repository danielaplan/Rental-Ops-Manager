<?php
require_once __DIR__.'/crud.php';
if($_SERVER['REQUEST_METHOD']==='POST')authWrite();
tableCrud('services','service_id',['service_name','description','status'],['status'=>'Active']);
