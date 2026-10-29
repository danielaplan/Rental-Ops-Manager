<?php
/** Run from project root: C:\Users\acer\Desktop\Rental-Ops-Manager */

require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/domain.php';
require_once __DIR__ . '/api/catalog_definitions.php';
require_once __DIR__ . '/api/booking_pricing.php';
require_once __DIR__ . '/api/checklist_service.php';
require_once __DIR__ . '/api/equipment_service.php';
require_once __DIR__ . '/api/availability_service.php';
require_once __DIR__ . '/api/supporting_service.php';

$pdo = db();
$passed = 0; $failed = 0;

function test(string $name, callable $fn): void {
    global $passed, $failed;
    try { $fn(); echo "✅ $name\n"; $passed++; }
    catch (Throwable $e) { echo "❌ $name: {$e->getMessage()}\n"; $failed++; }
}

function assertThrows(string $name, callable $fn, string $expectedMsg = ''): void {
    test($name, function() use ($fn, $expectedMsg) {
        try { $fn(); throw new Exception('Expected exception not thrown'); }
        catch (InvalidArgumentException|DomainError $e) {
            if ($expectedMsg && !str_contains($e->getMessage(), $expectedMsg)) {
                throw new Exception("Wrong message: {$e->getMessage()}");
            }
        }
    });
}

// ===== 1. Negative add-on prices =====
assertThrows('Fix 1a: addonCrudDefinition rejects negative price', function() {
    $def = addonCrudDefinition();
    $validator = $def[5];
    $validator(['price' => -10], []);
}, 'non-negative');

assertThrows('Fix 1b: booking_pricing.php rejects negative addon price from DB', function() {
    $pdo = db();
    $pdo->exec("INSERT INTO addons (service_id, name, price, status) VALUES (1, 'Test Negative', -50, 'Active')");
    $id = $pdo->lastInsertId();
    try {
        calculateBookingTotals($pdo, 1, null, [$id], 0, 0);
    } finally {
        $pdo->exec("DELETE FROM addons WHERE addon_id=$id");
    }
}, 'negative');

// ===== 2. Quantities locked after Confirmed =====
test('Fix 2: updateChecklistItem blocks on Confirmed status', function() {
    $pdo = db();
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, 'Confirmed', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO booking_checklist_items (booking_id, item_name_snapshot, expected_quantity, quantity_released, quantity_returned, condition_out, return_status) VALUES ($bid, 'Test', 2, 1, 0, 'Good', 'pending')");
    $itemId = $pdo->lastInsertId();
    try {
        updateChecklistItem($pdo, $bid, $itemId, ['quantity_released' => 2], 1);
        throw new Exception('Should have thrown');
    } catch (DomainError $e) {
        if (!str_contains($e->getMessage(), 'cannot be edited')) throw $e;
    } finally {
        $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bid");
        $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    }
});

// ===== 3. Notes persist =====
test('Fix 3: updateChecklistItem persists notes', function() {
    $pdo = db();
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, 'Pending', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO booking_checklist_items (booking_id, item_name_snapshot, expected_quantity, quantity_released, quantity_returned, condition_out, return_status, notes) VALUES ($bid, 'Test', 2, 1, 0, 'Good', 'pending', 'old note')");
    $itemId = $pdo->lastInsertId();
    // Must include condition_out when released > 0 (validation requires it)
    $result = updateChecklistItem($pdo, $bid, $itemId, ['notes' => 'new note', 'condition_out' => 'Good'], 1);
    if ($result['notes'] !== 'new note') throw new Exception("Notes not updated: {$result['notes']}");
    $check = $pdo->prepare('SELECT notes FROM booking_checklist_items WHERE checklist_item_id=?');
    $check->execute([$itemId]);
    if ($check->fetchColumn() !== 'new note') throw new Exception('Notes not in DB');
    $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bid");
    $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
});

// ===== 4. Template item return history =====
test('Fix 4: saveReturnInspection creates history for template item (no rental_item_id)', function() {
    $pdo = db();
    // Create valid template item first (FK constraint)
    $pdo->exec("INSERT INTO packages (service_id, package_name, price, status) VALUES (1, 'Test Pkg', 100, 'Active')");
    $pid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO checklist_templates (package_id, template_name, status) VALUES ($pid, 'Test Template', 'Active')");
    $tid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO checklist_template_items (template_id, item_name, expected_quantity) VALUES ($tid, 'Template Item', 1)");
    $templateItemId = $pdo->lastInsertId();

    $pdo->exec("INSERT INTO bookings (customer_id, service_id, package_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, $pid, 'Awaiting Completion', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = $pdo->lastInsertId();
    // Template item (no rental_item_id, but has template_item_id) - need condition_out when released > 0
    $pdo->exec("INSERT INTO booking_checklist_items (booking_id, template_item_id, item_name_snapshot, expected_quantity, quantity_released, quantity_returned, condition_out, condition_in, return_status, checked_by) VALUES ($bid, $templateItemId, 'Template Item', 1, 1, 0, 'Good', 'Good', 'pending', 1)");
    $itemId = $pdo->lastInsertId();
    saveReturnInspection($pdo, $bid, [[
        'checklist_item_id' => $itemId,
        'quantity_returned' => 1,
        'condition_in' => 'Good',
    ]], 1);
    $hist = $pdo->prepare('SELECT * FROM item_history WHERE booking_id=? AND action="Returned" AND rental_item_id IS NULL');
    $hist->execute([$bid]);
    if (!$hist->fetch()) throw new Exception('History row not created for template item');
    $pdo->exec("DELETE FROM item_history WHERE booking_id=$bid");
    $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bid");
    $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    $pdo->exec("DELETE FROM checklist_template_items WHERE template_id=$tid");
    $pdo->exec("DELETE FROM checklist_templates WHERE template_id=$tid");
    $pdo->exec("DELETE FROM packages WHERE package_id=$pid");
});

// ===== 5. Empty checklists rejected =====
test('Fix 5a: copyBookingChecklist rejects empty when no package and no existing', function() {
    $pdo = db();
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, 'Pending', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = $pdo->lastInsertId();
    try {
        // No packageId, no existing checklist -> should throw
        copyBookingChecklist($pdo, $bid, null);
        throw new Exception('Should have thrown');
    } catch (DomainError $e) {
        if (!str_contains($e->getMessage(), 'cannot be empty')) throw $e;
    } finally {
        $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    }
});

// ===== 6. Negative quantities =====
assertThrows('Fix 6a: rentalItemCrudDefinition rejects negative quantity', function() {
    $def = rentalItemCrudDefinition();
    $validator = $def[5];
    $validator(['quantity' => -1], []);
}, 'non-negative');

assertThrows('Fix 6b: updateChecklistItem rejects negative released', function() {
    $pdo = db();
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, 'Pending', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO booking_checklist_items (booking_id, item_name_snapshot, expected_quantity, quantity_released, quantity_returned, condition_out, return_status) VALUES ($bid, 'Test', 2, 1, 0, 'Good', 'pending')");
    $itemId = $pdo->lastInsertId();
    try {
        // Must include condition_out when released > 0
        updateChecklistItem($pdo, $bid, $itemId, ['quantity_released' => -1, 'condition_out' => 'Good'], 1);
        throw new Exception('Should have thrown');
    } finally {
        $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bid");
        $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    }
}, 'non-negative');

// ===== 7. Package/template ID comparison (backend logic) =====
test('Fix 7: copyBookingChecklist finds template by raw package_id', function() {
    $pdo = db();
    $pdo->exec("INSERT INTO packages (service_id, package_name, price, status) VALUES (1, 'Test Package', 100, 'Active')");
    $pid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO checklist_templates (package_id, template_name, status) VALUES ($pid, 'Test Template', 'Active')");
    $tid = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO checklist_template_items (template_id, item_name, expected_quantity) VALUES ($tid, 'Item 1', 2)");
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, package_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, $pid, 'Pending', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = $pdo->lastInsertId();
    $items = copyBookingChecklist($pdo, $bid, $pid);
    if (count($items) !== 1) throw new Exception('Template not copied: expected 1 item, got ' . count($items));
    $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bid");
    $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    $pdo->exec("DELETE FROM checklist_template_items WHERE template_id=$tid");
    $pdo->exec("DELETE FROM checklist_templates WHERE template_id=$tid");
    $pdo->exec("DELETE FROM packages WHERE package_id=$pid");
});

echo "\n=== Results: $passed passed, $failed failed ===\n";
exit($failed > 0 ? 1 : 0);