<?php
require_once __DIR__.'/crud.php';if($_SERVER['REQUEST_METHOD']==='POST')authWrite();tableCrud('rental_items','rental_item_id',['service_id','name','quantity','item_code','required','tracking','status','condition','notes'],['quantity'=>1,'required'=>0,'tracking'=>'quantity','status'=>'Available','condition'=>'Good']);
