<?php
/**
 * End-to-end booking lifecycle integration test
 * Exercises all 7 fixes in a realistic flow:
 * create → confirm → release → return → complete
 */
require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/domain.php';
require_once __DIR__ . '/api/catalog_definitions.php';
require_once __DIR__ . '/api/booking_pricing.php';
require_once __DIR__ . '/api/checklist_service.php';
require_once __DIR__ . '/api/equipment_service.php';
require_once __DIR__ . '/api/availability_service.php';
require_once __DIR__ . '/api/supporting_service.php';
require_once __DIR__ . '/api/deposit_service.php';

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

// Cleanup helper
function cleanup(PDO $pdo, int $bookingId, ?int $packageId = null, ?int $templateId = null): void {
    $pdo->exec("DELETE FROM item_history WHERE booking_id=$bookingId");
    $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bookingId");
    $pdo->exec("DELETE FROM item_releases WHERE booking_id=$bookingId");
    $pdo->exec("DELETE FROM notifications WHERE booking_id=$bookingId");
    $pdo->exec("DELETE FROM payments WHERE booking_id=$bookingId");
    $pdo->exec("DELETE FROM deposits WHERE booking_id=$bookingId");
    $pdo->exec("DELETE FROM bookings WHERE booking_id=$bookingId");
    if ($templateId) {
        $pdo->exec("DELETE FROM checklist_template_items WHERE template_id=$templateId");
        $pdo->exec("DELETE FROM checklist_templates WHERE template_id=$templateId");
    }
    if ($packageId) {
        $pdo->exec("DELETE FROM packages WHERE package_id=$packageId");
    }
}

echo "=== Booking Lifecycle Integration Test ===\n\n";

// ============================================================
// SETUP: Create service, package, template with checklist items
// ============================================================
$pdo->exec("INSERT INTO services (service_name, status) VALUES ('Test Karaoke', 'Active')");
$serviceId = (int)$pdo->lastInsertId();

$pdo->exec("INSERT INTO packages (service_id, package_name, price, status) VALUES ($serviceId, 'Test Package', 5000, 'Active')");
$packageId = (int)$pdo->lastInsertId();

$pdo->exec("INSERT INTO checklist_templates (package_id, template_name, status) VALUES ($packageId, 'Test Template', 'Active')");
$templateId = (int)$pdo->lastInsertId();

$pdo->exec("INSERT INTO checklist_template_items (template_id, item_name, expected_quantity) VALUES ($templateId, 'Speaker', 2)");
$pdo->exec("INSERT INTO checklist_template_items (template_id, item_name, expected_quantity) VALUES ($templateId, 'Microphone', 2)");

$pdo->exec("INSERT INTO customers (full_name, contact_number) VALUES ('Test Customer', '09123456789')");
$customerId = (int)$pdo->lastInsertId();

// ============================================================
// STEP 1: Create booking with package (triggers Fix 7: package/template ID)
// ============================================================
echo "--- Step 1: Create booking with package ---\n";
$pdo->exec("INSERT INTO bookings (customer_id, service_id, package_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES ($customerId, $serviceId, $packageId, 'Pending', 5000, CURDATE(), '10:00', '12:00', 1)");
$bookingId = (int)$pdo->lastInsertId();

test('Fix 7: copyBookingChecklist finds template by raw package_id', function() use ($pdo, $bookingId, $packageId) {
    $items = copyBookingChecklist($pdo, $bookingId, $packageId);
    if (count($items) !== 2) throw new Exception('Expected 2 template items, got ' . count($items));
    // Verify template_item_id is set (Fix 4 prerequisite)
    foreach ($items as $item) {
        if (!$item['template_item_id']) throw new Exception('template_item_id not set');
    }
});

// ============================================================
// STEP 2: Confirm booking (triggers Fix 2: quantities locked after Confirmed)
// ============================================================
echo "--- Step 2: Confirm booking (status → Confirmed) ---\n";
$pdo->exec("UPDATE bookings SET status='Confirmed', blocked_start_datetime=NOW(), blocked_end_datetime=DATE_ADD(NOW(), INTERVAL 2 HOUR) WHERE booking_id=$bookingId");

test('Fix 2: updateChecklistItem blocks quantity changes on Confirmed', function() use ($pdo, $bookingId) {
    $items = checklistRows($pdo, $bookingId);
    $itemId = $items[0]['checklist_item_id'];
    try {
        updateChecklistItem($pdo, $bookingId, $itemId, ['quantity_released' => 1], 1);
        throw new Exception('Should have thrown');
    } catch (DomainError $e) {
        if (!str_contains($e->getMessage(), 'cannot be edited')) throw $e;
    }
});

// ============================================================
// STEP 3: Release equipment (Pending → Awaiting Completion via reconcile)
// ============================================================
echo "--- Step 3: Simulate release (update quantities, add notes) ---\n";
// First move to Awaiting Completion (simulating reconcileBookings)
$pdo->exec("UPDATE bookings SET status='Awaiting Completion', awaiting_completion_at=NOW() WHERE booking_id=$bookingId");

test('Fix 3: updateChecklistItem persists notes during release', function() use ($pdo, $bookingId) {
    $items = checklistRows($pdo, $bookingId);
    $itemId = $items[0]['checklist_item_id'];
    $result = updateChecklistItem($pdo, $bookingId, $itemId, [
        'quantity_released' => 2,
        'condition_out' => 'Good',
        'notes' => 'Released in good condition'
    ], 1);
    if ($result['notes'] !== 'Released in good condition') throw new Exception('Notes not persisted');
    if ($result['quantity_released'] !== 2) throw new Exception('Quantity not updated');
});

// Verify notes in DB
$check = $pdo->prepare('SELECT notes FROM booking_checklist_items WHERE booking_id=? LIMIT 1');
$check->execute([$bookingId]);
if ($check->fetchColumn() !== 'Released in good condition') throw new Exception('Notes not in DB');

// ============================================================
// STEP 4: Return inspection (triggers Fix 4: template item history, Fix 3: notes)
// ============================================================
echo "--- Step 4: Return inspection ---\n";
$items = checklistRows($pdo, $bookingId);

test('Fix 4: saveReturnInspection creates history for template items', function() use ($pdo, $bookingId, $items) {
    $returnData = [];
    foreach ($items as $item) {
        $returnData[] = [
            'checklist_item_id' => $item['checklist_item_id'],
            'quantity_returned' => $item['quantity_released'], // all returned
            'condition_in' => 'Good',
            'notes' => 'Returned intact',
        ];
    }
    saveReturnInspection($pdo, $bookingId, $returnData, 1);

    // Verify history created for BOTH template items (rental_item_id IS NULL)
    $hist = $pdo->prepare('SELECT COUNT(*) FROM item_history WHERE booking_id=? AND action="Returned" AND rental_item_id IS NULL');
    $hist->execute([$bookingId]);
    $count = (int)$hist->fetchColumn();
    if ($count !== 2) throw new Exception("Expected 2 history rows for template items, got $count");
});

test('Fix 3: Return notes persist', function() use ($pdo, $bookingId) {
    $check = $pdo->prepare('SELECT notes FROM booking_checklist_items WHERE booking_id=?');
    $check->execute([$bookingId]);
    $notes = $check->fetchAll(PDO::FETCH_COLUMN);
    foreach ($notes as $note) {
        if ($note !== 'Returned intact') throw new Exception("Return notes not persisted: $note");
    }
});

// ============================================================
// STEP 5: Complete booking (triggers Fix 5a, 6a, 6b validations)
// ============================================================
echo "--- Step 5: Complete booking & validation tests ---\n";
$pdo->exec("UPDATE bookings SET status='Completed', completed_at=NOW(), released_by=1 WHERE booking_id=$bookingId");

test('Fix 5a: Empty checklist rejected when creating new booking without package', function() use ($pdo) {
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, 'Pending', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = (int)$pdo->lastInsertId();
    try {
        copyBookingChecklist($pdo, $bid, null);
        throw new Exception('Should have thrown');
    } catch (DomainError $e) {
        if (!str_contains($e->getMessage(), 'cannot be empty')) throw $e;
    } finally {
        $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    }
});

assertThrows('Fix 1a: addonCrudDefinition rejects negative price', function() {
    $def = addonCrudDefinition();
    $validator = $def[5];
    $validator(['price' => -10], []);
}, 'non-negative');

assertThrows('Fix 1b: calculateBookingTotals rejects negative addon from DB', function() use ($pdo) {
    $pdo->exec("INSERT INTO addons (service_id, name, price, status) VALUES (1, 'Negative Addon', -50, 'Active')");
    $id = (int)$pdo->lastInsertId();
    try {
        calculateBookingTotals($pdo, 1, null, [$id], 0, 0);
        throw new Exception('Should have thrown');
    } finally {
        $pdo->exec("DELETE FROM addons WHERE addon_id=$id");
    }
}, 'negative');

assertThrows('Fix 6a: rentalItemCrudDefinition rejects negative quantity', function() {
    $def = rentalItemCrudDefinition();
    $validator = $def[5];
    $validator(['quantity' => -1], []);
}, 'non-negative');

assertThrows('Fix 6b: updateChecklistItem rejects negative released', function() use ($pdo) {
    $pdo->exec("INSERT INTO bookings (customer_id, service_id, status, agreed_total, event_date, start_time, end_time, created_by) VALUES (1, 1, 'Pending', 1000, CURDATE(), '10:00', '12:00', 1)");
    $bid = (int)$pdo->lastInsertId();
    $pdo->exec("INSERT INTO booking_checklist_items (booking_id, item_name_snapshot, expected_quantity, quantity_released, quantity_returned, condition_out, return_status) VALUES ($bid, 'Test', 2, 1, 0, 'Good', 'pending')");
    $itemId = (int)$pdo->lastInsertId();
    try {
        updateChecklistItem($pdo, $bid, $itemId, ['quantity_released' => -1, 'condition_out' => 'Good'], 1);
        throw new Exception('Should have thrown');
    } finally {
        $pdo->exec("DELETE FROM booking_checklist_items WHERE booking_id=$bid");
        $pdo->exec("DELETE FROM bookings WHERE booking_id=$bid");
    }
}, 'non-negative');

// ============================================================
// CLEANUP
// ============================================================
cleanup($pdo, $bookingId, $packageId, $templateId);
$pdo->exec("DELETE FROM customers WHERE customer_id=$customerId");
$pdo->exec("DELETE FROM services WHERE service_id=$serviceId");

echo "\n=== Results: $passed passed, $failed failed ===\n";
exit($failed > 0 ? 1 : 0);