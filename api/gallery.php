<?php
require_once __DIR__.'/crud.php';if($_SERVER['REQUEST_METHOD']==='POST')authWrite();tableCrud('gallery','image_id',['title','image','featured'],['featured'=>0]);
