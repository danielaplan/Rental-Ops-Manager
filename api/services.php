<?php
<<<<<<< HEAD
require_once __DIR__.'/crud.php';
if($_SERVER['REQUEST_METHOD']==='POST')authWrite();
tableCrud('services','service_id',['service_name','description','status','image'],['status'=>'Active']);
=======
require_once __DIR__.'/catalog_definitions.php';
tableCrud(...serviceCrudDefinition());
>>>>>>> 5594e032c3ee1168d1ac00d34d9a9ab7151967a7
