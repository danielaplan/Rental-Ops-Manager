<?php
/** Sync receipts use reserved app_settings row 2; public application settings remain in row 1. */
function syncState(PDO $pdo): array {
    $q=$pdo->query('SELECT settings FROM app_settings WHERE settings_id=2 FOR UPDATE');
    return json_decode($q->fetchColumn(),true) ?: ['receipts'=>[],'ids'=>[]];
}
function syncReference($value,string $entity,array $state,int $userId): int {
    if(str_starts_with((string)$value,'LOCAL-')) {
        $id=$state['ids'][$userId.':'.$entity.':'.$value]??null;
        if(!$id)throw new InvalidArgumentException('Related '.$entity.' record is still pending. Resolve its conflict or retry it first.');
        return (int)$id;
    }
    if(preg_match('/^(?:[A-Za-z]+-(?:\d{4}-)?)?(\d+)$/',(string)$value,$m))return (int)$m[1];
    return 0;
}
function saveSyncReceipt(PDO $pdo,array &$state,array $item,array $ack,int $userId,string $hash): void {
    $state['receipts'][$userId.':'.$item['client_id']]=['hash'=>$hash,'ack'=>$ack];
    if(($item['action']??'')==='create'&&!empty($item['local_id'])&&!empty($ack['server_id']))$state['ids'][$userId.':'.$item['entity'].':'.$item['local_id']]=$ack['server_id'];
    $pdo->prepare('UPDATE app_settings SET settings=? WHERE settings_id=2')->execute([json_encode($state,JSON_THROW_ON_ERROR)]);
}
