<?php
require_once __DIR__.'/crud.php';

function serviceCrudDefinition(): array {
    return ['services','service_id',['service_name','description','status','default_preparation_minutes','default_travel_minutes'],
    ['status'=>'Active','default_preparation_minutes'=>0,'default_travel_minutes'=>0],[],function ($values,$old) {
        $record = $values + ($old ?? []);
        if (!is_string($record['service_name'] ?? null) || trim($record['service_name'])==='' || strlen($record['service_name'])>50) domainFail('Service name must contain 1 to 50 bytes.');
        if (!in_array($record['status'] ?? '',['Active','Inactive'],true)) domainFail('Invalid service status.');
        foreach (['default_preparation_minutes','default_travel_minutes'] as $field) {
            if (array_key_exists($field,$values)) {
                $minutes = is_bool($values[$field]) ? null : asInt($values[$field],0);
                if ($minutes===null || $minutes>525600) domainFail('Allowances must be whole minutes between zero and 525600.');
                $values[$field] = $minutes;
            }
        }
        if (isset($values['description']) && !is_string($values['description'])) domainFail('Description must be text.');
        return $values;
    },true];
}

function packageCrudDefinition(): array {
    return ['packages','package_id',[
    'service_id','package_name','description','inclusions','price','duration_minutes','requires_deposit',
    'deposit_amount','is_promotional','promotion_start_date','promotion_end_date','status'
],['status'=>'Active','duration_minutes'=>0,'requires_deposit'=>0,'deposit_amount'=>'0.00','is_promotional'=>0],[],function ($values,$old) {
    $record = $values + ($old ?? []);
    $service = asInt($record['service_id'] ?? null,1);
    if (!$service) domainFail('A valid service is required.');
    $q = db()->prepare('SELECT 1 FROM services WHERE service_id=?');
    $q->execute([$service]);
    if (!$q->fetchColumn()) domainFail('Service not found.');
    if ($old && (int)$old['service_id'] !== $service) {
        // tableCrudSave already holds the package row lock. Booking saves lock the
        // same package row before creating a reference, so this read can remain
        // non-locking and avoids reversing the booking -> package lock order.
        $q = db()->prepare('SELECT booking_id FROM bookings WHERE package_id=? ORDER BY booking_id LIMIT 1');
        $q->execute([(int)$old['package_id']]);
        if ($q->fetchColumn()) {
            domainFail(
                'This package is used by existing bookings and cannot be moved to another service. Create a new package for the other service instead.',
                409,
                'package_service_locked'
            );
        }
    }
    if (!is_string($record['package_name'] ?? null) || trim($record['package_name'])==='' || strlen($record['package_name'])>100) domainFail('Package name must contain 1 to 100 bytes.');
    if (!in_array($record['status'] ?? '',['Active','Inactive'],true)) domainFail('Invalid package status.');
    if (!array_key_exists('price',$record)) domainFail('Package price is required.');
    foreach (['price','deposit_amount'] as $field) {
        if (array_key_exists($field,$values)) $values[$field] = centsDecimal(moneyCents($values[$field]));
    }
    foreach (['requires_deposit','is_promotional'] as $field) {
        if (array_key_exists($field,$values)) {
            if (!in_array($values[$field],[0,1,'0','1',false,true],true)) domainFail('Invalid '.$field.'.');
            $values[$field] = (int)$values[$field];
        }
    }
    if (array_key_exists('duration_minutes',$values)) {
        $duration = asInt($values['duration_minutes'],0);
        if ($duration===null || $duration>2147483647) domainFail('Duration must be nonnegative whole minutes.');
        $values['duration_minutes'] = $duration;
    }
    foreach (['description','inclusions'] as $field) {
        if (isset($values[$field]) && !is_string($values[$field])) domainFail($field.' must be text.');
    }
    foreach (['promotion_start_date','promotion_end_date'] as $field) {
        if (array_key_exists($field,$values)) {
            if ($values[$field]==='') $values[$field] = null;
            if ($values[$field]!==null && !asDate($values[$field])) domainFail('Invalid promotion date.');
        }
    }
    $record = $values + ($old ?? []);
    if ($record['is_promotional'] && (empty($record['promotion_start_date']) || empty($record['promotion_end_date']))) domainFail('Promotional packages require both promotion dates.');
    if (!empty($record['promotion_start_date']) && !empty($record['promotion_end_date']) && $record['promotion_start_date']>$record['promotion_end_date']) domainFail('Promotion end cannot precede its start.');
    return $values;
},true];
}

function addonCrudDefinition(): array {
    return ['addons', 'addon_id', ['service_id', 'name', 'price', 'status'], ['status' => 'Active'], [], null, true];
}

function galleryCrudDefinition(): array {
    return ['gallery','image_id',['title','image','featured'],['featured'=>0],[],null,true];
}

function rentalItemCrudDefinition(): array {
    return ['rental_items','rental_item_id',['service_id','name','quantity','item_code','required','tracking','status','condition','notes'],['quantity'=>1,'required'=>0,'tracking'=>'quantity','status'=>'Available','condition'=>'Good']];
}

function categoryCrudDefinition(): array {
    return ['categories', 'category_id', ['name', 'status'], ['status' => 'Active']];
}

function customerCrudDefinition(): array {
    return ['customers', 'customer_id', ['full_name', 'contact_number', 'messenger_handle'],[],[],function ($values,$old) {
    $record = $values + ($old ?? []);
    if (!is_string($record['full_name'] ?? null) || trim($record['full_name'])==='' || strlen($record['full_name'])>100) domainFail('Customer name must contain 1 to 100 bytes.');
    foreach ($values as $field=>$value) {
        if ($value!==null && !is_string($value)) domainFail($field.' must be text.');
    }
    if (isset($values['contact_number']) && strlen($values['contact_number'])>20) domainFail('Contact number is too long.');
    if (isset($values['messenger_handle']) && strlen($values['messenger_handle'])>100) domainFail('Messenger handle is too long.');
    return $values;
}];
}
