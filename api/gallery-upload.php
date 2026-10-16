<?php
/**
 * gallery-upload.php
 * ------------------------------------------------------------------
 * Legacy gallery upload endpoint, kept so existing callers and the
 * frontend contract in js/api.js (API.uploadGalleryImage) keep working.
 * New uploads should use api/image-upload.php?type=...
 *
 *   POST /api/gallery-upload.php   multipart field: image
 * --------------------------------------------------------------- */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/image_service.php';
requireRole(['owner']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['ok' => false, 'error' => 'Method not allowed.', 'code' => 'server_error'], 405);
}

try {
    $url = storeImageUpload($_FILES['image'] ?? null, 'gallery');
} catch (ImageUploadError $e) {
    sendJson(['ok' => false, 'error' => $e->getMessage(), 'code' => $e->errorCode], $e->httpStatus);
}

sendJson(['ok' => true, 'data' => $url], 201);
