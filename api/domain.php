<?php
require_once __DIR__ . '/config.php';

class DomainError extends RuntimeException {
    public array $details = [];
    public int $httpStatus;
    public string $errorCode;
    public function __construct(string $message, int $status = 400, string $code = 'validation') {
        parent::__construct($message);
        $this->httpStatus = $status;
        $this->errorCode = $code;
    }
}
function domainFail(string $message, int $status = 400, string $code = 'validation'): never {
    throw new DomainError($message, $status, $code);
}
function domainTransaction(callable $work) {
    $pdo = db();
    $owns = !$pdo->inTransaction();
    try {
        if ($owns) $pdo->beginTransaction();
        $result = $work($pdo);
        if ($owns) $pdo->commit();
        return $result;
    } catch (Throwable $e) {
        if ($owns && $pdo->inTransaction()) $pdo->rollBack();
        if (!$owns) throw $e;
        if ($e instanceof DomainError) sendJson(['ok'=>false,'error'=>$e->getMessage(),'code'=>$e->errorCode,'details'=>$e->details], $e->httpStatus);
        if ($e instanceof InvalidArgumentException) sendJson(['ok'=>false,'error'=>$e->getMessage(),'code'=>'validation'], 400);
        error_log((string)$e);
        sendJson(['ok'=>false,'error'=>'Unable to save this operation.','code'=>'server_error'], 500);
    }
}
function moneyCents($value): int {
    if (!is_scalar($value) || is_bool($value) || !preg_match('/^\d{1,8}(?:\.\d{1,2})?$/D', (string)$value)) {
        domainFail('Amount must be non-negative with at most two decimal places.');
    }
    $parts = explode('.', (string)$value);
    return ((int)$parts[0] * 100) + (int)str_pad($parts[1] ?? '', 2, '0');
}
function centsDecimal(int $value): string {
    return ($value < 0 ? '-' : '') . intdiv(abs($value), 100) . '.' . str_pad((string)(abs($value) % 100), 2, '0', STR_PAD_LEFT);
}
function auditWrite(PDO $pdo, $actorId, $action, $recordType, $recordId, $description, $oldStatus = null, $newStatus = null, $origin = 'owner'): void {
    if (!in_array($origin, ['owner','system','migration'], true) || ($origin === 'owner' && !$actorId)) domainFail('An authenticated audit actor is required.');
    $pdo->prepare('INSERT INTO audit_logs(user_id,action,record_type,record_id,description,old_status,new_status,origin,created_at) VALUES(?,?,?,?,?,?,?,?,NOW())')
        ->execute([$actorId,$action,$recordType,$recordId,$description,$oldStatus,$newStatus,$origin]);
}
function lockBooking(PDO $pdo, int $id): array {
    $q = $pdo->prepare('SELECT * FROM bookings WHERE booking_id=? FOR UPDATE');
    $q->execute([$id]);
    $row = $q->fetch();
    if (!$row) domainFail('Booking not found.', 404, 'not_found');
    return $row;
}
