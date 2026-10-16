<?php
/**
 * image_service.php
 * ------------------------------------------------------------------
 * Shared validation and storage for uploaded images.
 *
 * Included by the upload endpoints (api/image-upload.php and the
 * legacy api/gallery-upload.php). Enforces the rules the gallery
 * uploader has always applied: JPG/PNG/GIF/WebP only, at most 5 MB
 * and 20 megapixels, stored under uploads/<type>/ with a random
 * filename so an uploaded name can never be guessed or executed.
 * --------------------------------------------------------------- */

require_once __DIR__ . '/config.php';

const IMAGE_UPLOAD_MAX_BYTES  = 5 * 1024 * 1024;
const IMAGE_UPLOAD_MAX_PIXELS = 20000000;

/** Upload destinations. The key is what callers ask for, the value is the uploads/ folder. */
const IMAGE_UPLOAD_TYPES = [
    'gallery'  => 'gallery',
    'content'  => 'content',
    'services' => 'services',
];

/** Carries the API error code and HTTP status an upload failure should report. */
class ImageUploadError extends RuntimeException
{
    public $errorCode;
    public $httpStatus;

    public function __construct($message, $errorCode = 'validation', $httpStatus = 400)
    {
        parent::__construct($message);
        $this->errorCode  = $errorCode;
        $this->httpStatus = $httpStatus;
    }
}

/**
 * Validate one uploaded image and move it into uploads/<type>/.
 * Returns the public URL path of the stored file.
 * Throws ImageUploadError when the file or the destination is rejected.
 */
function storeImageUpload($file, $type)
{
    if (!is_string($type) || !isset(IMAGE_UPLOAD_TYPES[$type])) {
        throw new ImageUploadError('Unknown image destination.');
    }
    if (!is_array($file) || !isset($file['error'])) {
        throw new ImageUploadError('Choose an image to upload.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new ImageUploadError(match ($file['error']) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The image is too large. Maximum file size is 5 MB.',
            UPLOAD_ERR_NO_FILE => 'Choose an image to upload.',
            default => 'The image could not be uploaded. Please try again.'
        });
    }
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name']) || $file['size'] < 1 || $file['size'] > IMAGE_UPLOAD_MAX_BYTES) {
        throw new ImageUploadError('Choose an image no larger than 5 MB.');
    }

    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/webp' => 'webp'
    ];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $imageInfo = @getimagesize($file['tmp_name']);
    if (!isset($extensions[$mime]) || !$imageInfo || $imageInfo['mime'] !== $mime) {
        throw new ImageUploadError('Use a valid JPG, PNG, GIF, or WebP image.');
    }
    if ($imageInfo[0] < 1 || $imageInfo[1] < 1 || $imageInfo[0] * $imageInfo[1] > IMAGE_UPLOAD_MAX_PIXELS) {
        throw new ImageUploadError('Image dimensions must be no larger than 20 megapixels.');
    }

    $folder = IMAGE_UPLOAD_TYPES[$type];
    $directory = __DIR__ . '/../uploads/' . $folder;
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new ImageUploadError('Image storage is unavailable.', 'server_error', 500);
    }
    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) {
        throw new ImageUploadError('The image could not be saved. Check server storage permissions.', 'server_error', 500);
    }

    $basePath = rtrim(str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME']))), '/');
    return ($basePath ? $basePath : '') . '/uploads/' . $folder . '/' . $filename;
}
