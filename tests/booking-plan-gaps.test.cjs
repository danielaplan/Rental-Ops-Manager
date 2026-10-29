const assert = require('node:assert/strict');
const { test } = require('node:test');
const { execFileSync, spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const php = process.env.AKAD_TEST_PHP || 'C:/xampp/php/php.exe';
const mysql = process.env.AKAD_TEST_MYSQL || 'C:/xampp/mysql/bin/mysql.exe';
const scheduled = path.join(root, 'scripts/reconcile_bookings.php');

test('scheduled reconciler refuses an implicit operational database', () => {
  const env = { ...process.env };
  delete env.AKAD_DB_NAME;
  const result = spawnSync(php, [scheduled], { env, encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /AKAD_DB_NAME must explicitly identify/);
});

const database = process.env.AKAD_TEST_DB_NAME;
const base = process.env.AKAD_TEST_BASE_URL;
test('scheduled reconciliation and reviewed checklist release are atomic and idempotent', {
  skip: !database || !base ? 'Run through tests/run_revised_backend.cjs with an isolated synthetic target.' : false,
}, async () => {
  assert.match(database, /^akad_verify_plan_[a-zA-Z0-9_]+$/);
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
  const env = { ...process.env, AKAD_DB_NAME: database };
  function sql(statement) {
    return execFileSync(mysql, [
      '--host=' + (env.AKAD_DB_HOST || 'localhost'), '--user=' + (env.AKAD_DB_USER || 'root'),
      '--port=' + (env.AKAD_DB_PORT || '3306'),
      '--database=' + database, '--batch', '--skip-column-names', '-e', statement,
    ], { env: { ...env, MYSQL_PWD: env.AKAD_DB_PASS || '' }, encoding: 'utf8' }).trim();
  }
  async function request(endpoint, body, token) {
    const result = await fetch(new URL(endpoint, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: result.status, ...(await result.json()) };
  }
  const login = await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' });
  assert.equal(login.status, 200, JSON.stringify(login));
  const token = login.data.session_token;
  const pack = await request('api/packages.php?do=create', { service_id: 1, package_name: 'Scheduled review fixture', price: '1000.00' }, token);
  assert.equal(pack.status, 201, JSON.stringify(pack));
  const packageId = pack.data.package_id;
  const template = await request('api/checklistTemplates.php?do=create', {
    package_id: packageId, template_name: 'Scheduled review items', items: [{ item_name: 'Microphone', expected_quantity: 1 }],
  }, token);
  assert.equal(template.status, 200, JSON.stringify(template));
  const created = await request('api/bookings.php?do=create', {
    customer_name: 'Scheduled review fixture', contact: 'TEST-SCHEDULER', service_id: 1, package_id: packageId,
    event_start_datetime: '2001-01-01 10:00:00', event_end_datetime: '2001-01-01 11:00:00',
    event_location: 'Synthetic fixture', status: 'Pending',
  }, token);
  assert.equal(created.status, 201, JSON.stringify(created));
  const bookingId = Number(created.data.booking_id);
  assert.ok(Number.isSafeInteger(bookingId) && bookingId > 0);
  assert.equal((await request(`api/checklistTemplates.php?do=delete&id=${template.data.template_id}`, {}, token)).status, 200);
  assert.equal((await request('api/checklistTemplates.php?do=create', {
    package_id: packageId, template_name: 'Replacement template', items: [{ item_name: 'Replacement speaker', expected_quantity: 3 }],
  }, token)).status, 200);
  // Stage a due confirmation without a request that would already run reconciliation.
  sql(`UPDATE bookings SET status='Confirmed' WHERE booking_id=${bookingId}`);
  const run = () => JSON.parse(execFileSync(php, [scheduled], { env, encoding: 'utf8' }));
  assert.ok(run().transitioned >= 1);
  assert.equal(run().transitioned, 0);
  assert.equal(sql(`SELECT status FROM bookings WHERE booking_id=${bookingId}`), 'Awaiting Completion');
  const awaitingCompletionCancel = await request(`api/bookings.php?do=cancel&id=${bookingId}`, { cancellation_reason: 'Synthetic late cancellation' }, token);
  assert.equal(awaitingCompletionCancel.status, 409, JSON.stringify(awaitingCompletionCancel));
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${bookingId} AND new_status='Awaiting Completion'`), '1');
  const activeOwners = sql("SELECT COUNT(*) FROM users WHERE role='owner' AND account_status='Active'");
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${bookingId} AND notification_type='awaiting_completion' AND resolved_at IS NULL`), activeOwners);
  const completionNotices = await request(`api/notifications.php?booking_id=${bookingId}`, undefined, token);
  assert.equal(completionNotices.status, 200, JSON.stringify(completionNotices));
  assert.equal(completionNotices.data[0].notification_type, 'awaiting_completion');
  assert.equal(completionNotices.data[0].customer_name, 'Scheduled review fixture');
  assert.equal(completionNotices.data[0].event_date, '2001-01-01');
  assert.ok(completionNotices.data[0].service_name);
  const checklist = await request(`api/bookingItems.php?booking_id=${bookingId}`, undefined, token);
  assert.equal(checklist.status, 200, JSON.stringify(checklist));
  assert.equal(checklist.data.length, 1);
  assert.equal(checklist.data[0].item_name_snapshot, 'Microphone');
  assert.equal(Number(checklist.data[0].expected_quantity), 1);
  const futureBody = {
    customer_name: 'Future fixture', contact: 'TEST-FUTURE', service_id: 1,
    event_start_datetime: '9099-01-01 10:00:00', event_end_datetime: '9099-01-01 11:00:00',
    event_location: 'Synthetic fixture', status: 'Confirmed',
  };
  const unavailable = await request('api/bookings.php?do=create', futureBody, token);
  assert.equal(unavailable.status, 409, JSON.stringify(unavailable));
  assert.ok(unavailable.details.bookings.some(row => Number(row.booking_id) === bookingId));
  const itemId = checklist.data[0].checklist_item_id;
  const released = await request(`api/bookingItems.php?do=update&id=${itemId}`, {
    booking_id: bookingId, quantity_released: 1, condition_out: 'Good',
  }, token);
  assert.equal(released.status, 200, JSON.stringify(released));
  const review = {
    service_ready: true, payments_reviewed: true, deposits_reviewed: true, review_notes: 'Fixture inspection completed',
    checklist_items: [{ checklist_item_id: itemId, quantity_returned: 1, condition_in: 'unrecognized condition' }],
  };
  const invalid = await request(`api/bookings.php?do=release&id=${bookingId}`, review, token);
  assert.equal(invalid.status, 400, JSON.stringify(invalid));
  assert.equal(sql(`SELECT quantity_returned FROM booking_checklist_items WHERE checklist_item_id=${Number(itemId)}`), '0');
  assert.equal(sql(`SELECT status FROM bookings WHERE booking_id=${bookingId}`), 'Awaiting Completion');
  review.checklist_items[0].condition_in = 'Good';
  const bookingReleased = await request(`api/bookings.php?do=release&id=${bookingId}`, review, token);
  assert.equal(bookingReleased.status, 200, JSON.stringify(bookingReleased));
  assert.equal(bookingReleased.data.status, 'Awaiting Payment');
  const awaitingPaymentCancel = await request(`api/bookings.php?do=cancel&id=${bookingId}`, { cancellation_reason: 'Synthetic late cancellation' }, token);
  assert.equal(awaitingPaymentCancel.status, 409, JSON.stringify(awaitingPaymentCancel));
  assert.equal(bookingReleased.data.completed_at, null);
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${bookingId} AND notification_type='awaiting_completion' AND resolved_at IS NULL`), '0');
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${bookingId} AND notification_type='awaiting_payment' AND resolved_at IS NULL`), activeOwners);
  const paymentNotices = await request(`api/notifications.php?booking_id=${bookingId}`, undefined, token);
  assert.equal(paymentNotices.status, 200, JSON.stringify(paymentNotices));
  assert.equal(paymentNotices.data[0].notification_type, 'awaiting_payment');
  assert.equal(paymentNotices.data[0].booking_status, 'Awaiting Payment');
  assert.equal(Number(paymentNotices.data[0].outstanding_balance), 1000);
  const dashboardWhileUnpaid = await request('api/reports.php?do=dashboard', undefined, token);
  assert.equal(dashboardWhileUnpaid.status, 200, JSON.stringify(dashboardWhileUnpaid));
  assert.ok(Number(dashboardWhileUnpaid.data.awaiting_payment_bookings) >= 1);
  assert.ok(!dashboardWhileUnpaid.data.upcoming_bookings.some(row => Number(row.id) === bookingId));
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='checklist' AND record_id=${Number(itemId)} AND action='checklist_updated'`), '2');
  assert.equal((await request(`api/bookingItems.php?do=update&id=${itemId}`, {
    booking_id: bookingId, quantity_returned: 1, condition_in: 'Good',
  }, token)).status, 400);
  const unpaidRetry = await request(`api/bookings.php?do=release&id=${bookingId}`, {}, token);
  assert.equal(unpaidRetry.status, 409, JSON.stringify(unpaidRetry));
  assert.equal(unpaidRetry.code, 'outstanding_balance');
  assert.match(unpaidRetry.error, /Outstanding rental balance: ₱1000\.00/);
  const availableAfterRelease = await request('api/bookings.php?do=create', futureBody, token);
  assert.equal(availableAfterRelease.status, 201, JSON.stringify(availableAfterRelease));
  const payment = await request('api/payments.php?do=create', {
    booking_id: bookingId, amount: '1000.00', payment_method: 'GCash', payment_status: 'Completed',
    payment_date: '2026-10-16 12:00:00',
  }, token);
  assert.equal(payment.status, 201, JSON.stringify(payment));
  const completed = await request(`api/bookings.php?do=release&id=${bookingId}`, {}, token);
  assert.equal(completed.status, 200, JSON.stringify(completed));
  assert.equal(completed.data.status, 'Completed');
  const releasedByBeforeCorrection = completed.data.released_by;
  const reviewNotesBeforeCorrection = completed.data.review_notes;
  const correctedPayment = await request(`api/payments.php?do=update&id=${payment.data.payment_id}`, {
    amount: '600.00', correction_reason: 'Corrected synthetic receipt amount',
  }, token);
  assert.equal(correctedPayment.status, 200, JSON.stringify(correctedPayment));
  const reopened = await request(`api/bookings.php?do=get&id=${bookingId}`, undefined, token);
  assert.equal(reopened.status, 200, JSON.stringify(reopened));
  assert.equal(reopened.data.status, 'Awaiting Payment');
  assert.equal(Number(reopened.data.amount_paid), 600);
  assert.equal(Number(reopened.data.outstanding_balance), 400);
  assert.equal(reopened.data.completed_at, null);
  assert.equal(Number(reopened.data.released_by), Number(releasedByBeforeCorrection));
  assert.equal(reopened.data.review_notes, reviewNotesBeforeCorrection);
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${bookingId} AND notification_type='awaiting_payment' AND resolved_at IS NULL`), activeOwners);
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${bookingId} AND action='payment_correction_reopened' AND old_status='Completed' AND new_status='Awaiting Payment'`), '1');
  const releasedOngoing = await request('api/bookings.php?do=create', {
    ...futureBody, customer_name: 'Released ongoing cancellation fixture', contact: 'TEST-RELEASED-CANCEL', package_id: packageId,
    event_start_datetime: '9100-01-01 10:00:00', event_end_datetime: '9100-01-01 11:00:00',
  }, token);
  assert.equal(releasedOngoing.status, 201, JSON.stringify(releasedOngoing));
  const releasedOngoingId = Number(releasedOngoing.data.booking_id);
  const releasedOngoingItems = await request(`api/bookingItems.php?booking_id=${releasedOngoingId}`, undefined, token);
  assert.equal(releasedOngoingItems.status, 200, JSON.stringify(releasedOngoingItems));
  const releasedOngoingItem = releasedOngoingItems.data[0];
  assert.equal((await request(`api/bookingItems.php?do=update&id=${releasedOngoingItem.checklist_item_id}`, {
    booking_id: releasedOngoingId, quantity_released: releasedOngoingItem.expected_quantity, condition_out: 'Good',
  }, token)).status, 200);
  const releasedRecord = await request('api/itemReleases.php?do=create', { booking_id: releasedOngoingId, released_by: 'Synthetic owner', notes: 'Ongoing release fixture' }, token);
  assert.equal(releasedRecord.status, 201, JSON.stringify(releasedRecord));
  const releasedOngoingCancel = await request(`api/bookings.php?do=cancel&id=${releasedOngoingId}`, { cancellation_reason: 'Synthetic ongoing cancellation' }, token);
  assert.equal(releasedOngoingCancel.status, 409, JSON.stringify(releasedOngoingCancel));
  assert.equal(releasedOngoingCancel.code, 'equipment_return_required');
  assert.equal(sql(`SELECT status FROM bookings WHERE booking_id=${releasedOngoingId}`), 'Confirmed');
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${releasedOngoingId} AND action='cancellation'`), '0');
  const recovered = await request('api/equipment.php?do=inspect', {
    booking_id: releasedOngoingId,
    items: [{
      checklist_item_id: releasedOngoingItem.checklist_item_id,
      quantity_returned: Number(releasedOngoingItem.expected_quantity),
      condition_in: 'Good',
      notes: 'Synthetic equipment fully recovered',
    }],
  }, token);
  assert.equal(recovered.status, 200, JSON.stringify(recovered));
  const resolvedCancellation = await request(`api/bookings.php?do=cancel&id=${releasedOngoingId}`, { cancellation_reason: 'Synthetic cancellation after equipment recovery' }, token);
  assert.equal(resolvedCancellation.status, 200, JSON.stringify(resolvedCancellation));
  assert.equal(resolvedCancellation.data.status, 'Cancelled');
  assert.equal(sql(`SELECT COUNT(*) FROM item_releases WHERE booking_id=${releasedOngoingId}`), '1');
  assert.equal(sql(`SELECT COUNT(*) FROM booking_checklist_items WHERE booking_id=${releasedOngoingId} AND quantity_returned=quantity_released AND condition_in='Good'`), '1');
  const completedCancel = await request(`api/bookings.php?do=cancel&id=${bookingId}`, { cancellation_reason: 'Synthetic completed cancellation' }, token);
  assert.equal(completedCancel.status, 409, JSON.stringify(completedCancel));
  assert.ok(completed.data.completed_at);
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${bookingId} AND resolved_at IS NULL`), activeOwners);
  assert.equal((await request(`api/bookings.php?do=release&id=${bookingId}`, {}, token)).status, 409);
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${bookingId} AND new_status='Completed'`), '1');
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${bookingId} AND new_status='Awaiting Payment'`), '2');
});
