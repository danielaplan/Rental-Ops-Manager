const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('manual booking uses event-date promotions, reusable customers, and bounded inputs', () => {
  const source = read('admin/manual-booking.html');
  assert.match(source, /id="mCustomerId"/);
  assert.match(source, /id="mCustName" maxlength="100"/);
  assert.match(source, /id="mCustContact" maxlength="20"/);
  assert.match(source, /id="mCustEmail" maxlength="100"/);
  assert.match(source, /const eventDate = \$\('#mDate'\)\.val\(\)/);
  assert.match(source, /promotion_start_date <= eventDate && p\.promotion_end_date >= eventDate/);
  assert.match(source, /customer_id: \$\('#mCustomerId'\)\.val\(\) \|\| null/);
  assert.doesNotMatch(source, /conflict_ids|reviewedConflictApproval/);
});

test('confirmation preserves blocked-time allowances and requires explicit overlap approval', () => {
  const source = read('admin/bookings.html');
  const api = read('js/api.js');
  assert.equal(source.match(/API\.checkAvailability\([^\n]+booking\._server_id \?\? booking\.id/g)?.length, 2);
  assert.match(api, /const time = value => String\(value\)\.slice\(0, 5\)/);
  assert.match(api, /event_start_datetime: `\$\{date\} \$\{time\(startTime\)\}:00`/);
  assert.match(api, /event_end_datetime: `\$\{date\} \$\{time\(endTime\)\}:00`/);
  assert.match(source, /preparation_minutes: Number\(booking\.preparation_minutes \|\| 0\)/);
  assert.match(source, /travel_minutes: Number\(booking\.travel_minutes \|\| 0\)/);
  assert.match(source, /approve_conflicts: true/);
  assert.match(source, /conflicting_booking_ids: pendingConflictApproval\.ids/);
  assert.match(source, /override_reason: reason/);
});

test('return conditions, deposit lock, and payment correction controls match server behavior', () => {
  const config = read('js/config.js');
  const bookings = read('admin/bookings.html');
  const payments = read('js/payments.js');
  assert.match(config, /itemConditions:\s*\[[^\]]*"Unwashed"/);
  assert.doesNotMatch(config, /itemConditions:\s*\[[^\]]*"Not Applicable"/);
  assert.match(bookings, /deposit\.deposit_id\|\|deposit\.pending_sync/);
  assert.match(bookings, /#depositHeld/);
  assert.match(bookings, /#saveDepositBtn/);
  for (const id of ['paymentCorrectionModal', 'paymentCorrectionForm', 'correctionPaymentId', 'correctionAmount', 'correctionMethod', 'correctionStatus', 'correctionType', 'correctionReason']) {
    assert.match(bookings, new RegExp(`id="${id}"`));
  }
  assert.match(payments, /js-correct-payment/);
});

test('deposit refund control supports a queued held deposit and waits for server acknowledgement', () => {
  const source = fs.readFileSync(path.join(root, 'admin', 'bookings.html'), 'utf8');
  const sync = fs.readFileSync(path.join(root, 'js', 'sync.js'), 'utf8');
  const depositService = fs.readFileSync(path.join(root, 'api', 'deposit_service.php'), 'utf8');
  const depositsEndpoint = fs.readFileSync(path.join(root, 'api', 'deposits.php'), 'utf8');
  const syncEndpoint = fs.readFileSync(path.join(root, 'api', 'sync.php'), 'utf8');
  assert.match(source, /!depositRecorded\|\|refunded\|\|Number\(deposit\.refund_amount\)<=0\|\|Boolean\(refundOperation\)/);
  assert.match(source, /Refund pending · Pending Sync/);
  assert.match(sync, /refund_pending:true,pending_sync:true/);
  assert.match(sync, /applyAcceptedDeposit\(op,ack\.data\)/);
  assert.match(depositService, /function refundDeposit\(PDO \$pdo, int \$bookingId, int \$ownerId\): array/);
  assert.match(depositsEndpoint, /return refundDeposit\(\$pdo,\$bid,\(int\)\$owner\['user_id'\]\)/);
  assert.match(syncEndpoint, /\$record=refundDeposit\(\$pdo,\$bid,\(int\)\$actor\['user_id'\]\)/);
});

test('Pending alteration exposes every mutable booking term without changing non-Pending edits', () => {
  const source = read('admin/bookings.html');
  for (const id of ['editPendingFields', 'editCustomerId', 'editServiceId', 'editPackageId', 'editAddonList', 'editPreparation', 'editTravel', 'editDiscount', 'editFees', 'editAgreedTotal']) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
  assert.match(source, /booking\.status === 'Pending'/);
  assert.match(source, /customer_id:/);
  assert.match(source, /addon_ids:/);
  assert.match(source, /agreed_total:/);
});

test('release and return queue only their atomic server operations', () => {
  const bookings = read('admin/bookings.html');
  const source = read('js/sync.js');
  const inventory = read('js/inventory.js');
  const checklist = read('api/checklist_service.php');
  const inspection = read('api/equipment_service.php');
  const availability = read('api/availability_service.php');
  const release = source.match(/API\.recordRelease=.*?;\r?\n/)?.[0] || '';
  const returned = source.match(/API\.recordReturn=.*?;\r?\n/)?.[0] || '';
  assert.match(release, /enqueue\('itemReleases','create'/);
  assert.match(returned, /enqueue\('equipment','inspect'/);
  assert.doesNotMatch(release + returned, /logItemHistory|itemHistory','create/);
  assert.match(source, /updatePayment:\['payments','update'\]/);
  assert.match(bookings, /\$\('#bookingDetailModal'\)\.onAdmin\('change', '\.js-release-check, \.js-release-qty, \.js-release-condition'/);
  assert.doesNotMatch(bookings, /\$\('\.admin-main'\)\.onAdmin\('change', '\.js-release-check'/);
  assert.match(inventory, /js-release-qty/);
  assert.match(inventory, /js-release-condition/);
  assert.match(bookings, /quantity_released: checked \? Number\(\$row\.find\('\.js-release-qty'\)\.val\(\)\) : 0/);
  assert.match(bookings, /for \(const row of \$\('#releaseChecklistWrap \.checklist-row'\)\.toArray\(\)\)/);
  assert.match(bookings, /await API\.updateBookingItem\(\$row\.data\('item'\), \{/);
  assert.match(bookings, /A short return must be marked Missing and include item notes/);
  assert.match(checklist, /array_key_exists\('condition_out',\$body\)/);
  assert.match(inspection, /A short return must be marked Missing and include item notes/);
  assert.match(availability, /condition_in<>'Missing'/);
  assert.match(bookings, /approval_base: approvalBase/);
  assert.match(bookings, /const allowedStatusOptions = b\.status === 'Pending' \? \['Pending','Confirmed'\] : \['Confirmed'\]/);
});

test('server booking boundaries keep pricing, text limits, release, history, and payment replay authoritative', () => {
  const pricing = read('api/booking_pricing.php');
  const bookings = read('api/booking_service.php');
  const release = read('api/supporting_service.php');
  const inspection = read('api/equipment_service.php');
  const sync = read('api/sync.php');
  assert.match(pricing, /status = 'Active' AND addon_id IN/);
  for (const rule of ["'email'=>255", "'source'=>50", "'event_type'=>100", "'customer_type'=>100"]) assert.match(bookings, new RegExp(rule));
  assert.match(bookings, /New customer email must be at most 100 bytes/);
  assert.match(release, /Only confirmed bookings can release equipment/);
  assert.match(release, /duplicate_release/);
  assert.match(release, /incomplete_checklist/);
  assert.match(release, /saveChecklistHistory\(\$pdo,\$item,\$bookingId,'Released'/);
  assert.match(inspection, /'action'=>'Returned'/);
  assert.match(sync, /\$entity==='payments' && in_array\(\$action,\['create','update'\],true\)/);
  assert.match(sync, /_sync_conflict_check/);
});
