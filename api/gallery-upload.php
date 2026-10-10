<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
requireRole(['owner']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
}

$file = $_FILES['image'] ?? null;
if (!$file || !isset($file['error'])) {
    sendJson(['ok' => false, 'error' => 'Choose an image to upload.', 'code' => 'validation'], 400);
}
if ($file['error'] !== UPLOAD_ERR_OK) {
    $message = match ($file['error']) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The image is too large. Maximum file size is 5 MB.',
        UPLOAD_ERR_NO_FILE => 'Choose an image to upload.',
        default => 'The image could not be uploaded. Please try again.'
    };
    sendJson(['ok' => false, 'error' => $message, 'code' => 'validation'], 400);
}
if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name']) || $file['size'] < 1 || $file['size'] > 5 * 1024 * 1024) {
    sendJson(['ok' => false, 'error' => 'Choose an image no larger than 5 MB.', 'code' => 'validation'], 400);
}

$extensions = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp'
];
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$imageInfo = @getimagesize($file['tmp_name']);
if (!isset($extensions[$mime]) || !$imageInfo || $imageInfo['mime'] !== $mime) {
    sendJson(['ok' => false, 'error' => 'Use a valid JPG, PNG, GIF, or WebP image.', 'code' => 'validation'], 400);
}
if ($imageInfo[0] < 1 || $imageInfo[1] < 1 || $imageInfo[0] * $imageInfo[1] > 20000000) {
    sendJson(['ok' => false, 'error' => 'Image dimensions must be no larger than 20 megapixels.', 'code' => 'validation'], 400);
}

$directory = __DIR__ . '/../uploads/gallery';
if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
    sendJson(['ok' => false, 'error' => 'Image storage is unavailable.', 'code' => 'server_error'], 500);
}
$filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) {
    sendJson(['ok' => false, 'error' => 'The image could not be saved. Check server storage permissions.', 'code' => 'server_error'], 500);
}

$basePath = rtrim(str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME']))), '/');
$imageUrl = ($basePath ? $basePath : '') . '/uploads/gallery/' . $filename;
sendJson(['ok' => true, 'data' => $imageUrl], 201);
