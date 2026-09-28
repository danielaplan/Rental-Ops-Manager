<?php
require_once __DIR__.'/crud.php';if($_SERVER['REQUEST_METHOD']==='POST')authWrite();tableCrud('categories','category_id',['name','status'],['status'=>'Active']);
