<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/domain.php';
requireRole(['owner']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(['ok'=>false,'error'=>'Method not allowed.','code'=>'method_not_allowed'],405);
try {
    $file = $_FILES['image'] ?? null;
    if (!$file || !isset($file['error'])) domainFail('Choose an image to upload.');
    if ($file['error'] !== UPLOAD_ERR_OK) domainFail(in_array($file['error'],[UPLOAD_ERR_INI_SIZE,UPLOAD_ERR_FORM_SIZE],true) ? 'The image is too large. Maximum file size is 5 MB.' : 'The image could not be uploaded. Please try again.');
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name']) || $file['size'] < 1 || $file['size'] > 5 * 1024 * 1024) domainFail('Choose an image no larger than 5 MB.');
    $extensions=['image/jpeg'=>'jpg','image/png'=>'png','image/gif'=>'gif','image/webp'=>'webp'];
    $mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $info=@getimagesize($file['tmp_name']);
    if (!isset($extensions[$mime]) || !$info || $info['mime']!==$mime) domainFail('Use a valid JPG, PNG, GIF, or WebP image.');
    if ($info[0]<1 || $info[1]<1 || $info[0]*$info[1]>20000000) domainFail('Image dimensions must be no larger than 20 megapixels.');
    $directory=__DIR__.'/../uploads/services';
    if (!is_dir($directory) && !mkdir($directory,0755,true) && !is_dir($directory)) throw new RuntimeException('Image storage is unavailable.');
    $filename=bin2hex(random_bytes(16)).'.'.$extensions[$mime];
    if (!move_uploaded_file($file['tmp_name'],$directory.'/'.$filename)) throw new RuntimeException('The image could not be saved. Check server storage permissions.');
    $basePath=rtrim(str_replace('\\','/',dirname(dirname($_SERVER['SCRIPT_NAME']))),'/');
    sendJson(['ok'=>true,'data'=>($basePath?$basePath:'').'/uploads/services/'.$filename],201);
} catch (DomainException $e) {
    sendJson(['ok'=>false,'error'=>$e->getMessage(),'code'=>'validation'],400);
} catch (Throwable $e) {
    sendJson(['ok'=>false,'error'=>$e->getMessage(),'code'=>'server_error'],500);
}
