<?php
require_once __DIR__.'/crud.php';if($_SERVER['REQUEST_METHOD']==='POST')authWrite();tableCrud('item_releases','release_id',['booking_id','released_by','notes','released_at']);
