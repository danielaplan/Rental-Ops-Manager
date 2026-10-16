<?php
/**
 * image-upload.php
 * ------------------------------------------------------------------
 * General image upload endpoint for the admin pages.
 *
 *   POST /api/image-upload.php?type=gallery|content|services
 *        multipart field: image
 *
 * Returns {ok:true, data:"<basePath>/uploads/<type>/<file>"} with 201.
 * Validation and storage live in image_service.php so this endpoint and
 * the legacy gallery-upload.php cannot drift apart.
 * --------------------------------------------------------------- */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/image_service.php';
requireRole(['owner']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
}

try {
    $url = storeImageUpload($_FILES['image'] ?? null, input('type', 'content'));
} catch (ImageUploadError $e) {
    sendJson(['ok' => false, 'error' => $e->getMessage(), 'code' => $e->errorCode], $e->httpStatus);
}

sendJson(['ok' => true, 'data' => $url], 201);
