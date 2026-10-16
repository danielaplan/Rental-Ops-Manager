const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = 'http://127.0.0.1:8035/';
const output = path.join(__dirname, 'walkthrough-run-2026-10-16.json');
const results = [];
let primaryToken;
let secondaryToken;

async function request(endpoint, { token = primaryToken, body, expected } = {}) {
  const response = await fetch(new URL(endpoint, base), {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await response.json();
  if (expected !== undefined) assert.equal(response.status, expected, `${endpoint}: ${JSON.stringify(json)}`);
  return { status: response.status, json };
}
async function step(id, run) {
  const started = Date.now();
  try {
    const evidence = await run();
    results.push({ id, status: 'PASS', elapsed_ms: Date.now() - started, evidence });
    console.log(`PASS ${id}`);
  } catch (error) {
    results.push({ id, status: 'FAIL', elapsed_ms: Date.now() - started, error: String(error.stack || error) });
    console.error(`FAIL ${id}`, error);
  }
}
function data(result) { return result.json.data; }

(async () => {
  await step('W01', async () => {
    const primary = await request('api/auth.php', { token: null, body: { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' }, expected: 200 });
    primaryToken = data(primary).session_token;
    const secondary = await request('api/auth.php', { token: null, body: { username: 'juan', password: 'password' }, expected: 200 });
    secondaryToken = data(secondary).session_token;
    const primaryRows = data(await request('api/bookings.php?do=all', { expected: 200 }));
    const secondaryRows = data(await request('api/bookings.php?do=all', { token: secondaryToken, expected: 200 }));
    assert.deepEqual(secondaryRows.map(row => row.booking_id), primaryRows.map(row => row.booking_id));
    assert.equal((await request('api/owners.php', { token: secondaryToken })).status, 403);
    const report = data(await request('api/reports.php?do=report&start=2026-10-01&end=2026-10-31', { expected: 200 }));
    const a = data(await request('api/bookings.php?do=get&id=1', { expected: 200 }));
    const d = data(await request('api/bookings.php?do=get&id=4', { expected: 200 }));
    assert.equal(Number(report.total_revenue_collected), 500);
    assert.equal(Number(a.outstanding_balance), 750);
    assert.equal(Number(d.outstanding_balance), 750);
    return { booking_ids: primaryRows.map(row => row.booking_id), secondary_owner_admin_http: 403, revenue: report.total_revenue_collected, balances: { A: a.outstanding_balance, D: d.outstanding_balance } };
  });

  await step('W02', async () => {
    const response = await request('api/bookings.php?do=update&id=2', { body: { status: 'Confirmed' }, expected: 409 });
    const conflicts = response.json.details.bookings.map(row => Number(row.booking_id));
    assert.deepEqual(conflicts.sort((a, b) => a - b), [1, 4]);
    const notices = data(await request('api/notifications.php?do=unresolved&booking_id=4', { expected: 200 }));
    assert.equal(notices.length, 1);
    assert.equal(data(await request('api/bookings.php?do=get&id=2', { expected: 200 })).status, 'Pending');
    return { http: 409, conflict_booking_ids: conflicts, unresolved_notification_count: notices.length };
  });

  await step('W03', async () => {
    const response = await request('api/equipment.php?do=finalizeReturn', { body: { booking_id: 4, service_ready: true, payments_reviewed: true, deposits_reviewed: true, review_notes: 'Premature synthetic review' }, expected: 400 });
    const d = data(await request('api/bookings.php?do=get&id=4', { expected: 200 }));
    const notices = data(await request('api/notifications.php?do=unresolved&booking_id=4', { expected: 200 }));
    assert.equal(d.status, 'Awaiting Completion');
    assert.equal(notices.length, 1);
    return { http: 400, error: response.json.error, booking_status: d.status, unresolved_notification_count: notices.length };
  });

  await step('W04', async () => {
    const before = data(await request('api/bookingItems.php?booking_id=4', { expected: 200 }));
    const invalid = before.map((row, index) => ({ checklist_item_id: row.checklist_item_id, returned_qty: index === 0 ? Number(row.quantity_released) + 1 : Number(row.quantity_released), condition: 'Good' }));
    const rejected = await request('api/equipment.php?do=inspect', { body: { booking_id: 4, items: invalid }, expected: 400 });
    const afterInvalid = data(await request('api/bookingItems.php?booking_id=4', { expected: 200 }));
    assert.deepEqual(afterInvalid.map(row => Number(row.quantity_returned)), [0, 0]);
    const valid = before.map(row => ({ checklist_item_id: row.checklist_item_id, returned_qty: Number(row.quantity_released), condition: 'Good' }));
    await request('api/equipment.php?do=inspect', { body: { booking_id: 4, items: valid }, expected: 200 });
    const saved = data(await request('api/bookingItems.php?booking_id=4', { expected: 200 }));
    assert.ok(saved.every(row => Number(row.quantity_returned) === Number(row.quantity_released) && row.condition_in === 'Good' && Number(row.checked_by) === 1));
    return { invalid_http: 400, invalid_error: rejected.json.error, saved: saved.map(row => ({ id: row.checklist_item_id, released: row.quantity_released, returned: row.quantity_returned, condition: row.condition_in, checked_by: row.checked_by })) };
  });

  await step('W05', async () => {
    await request('api/payments.php?do=create', { body: { booking_id: 4, amount: '750.00', payment_method: 'MariBank', payment_type: 'Balance', payment_status: 'Completed', payment_date: '2026-10-15 12:00:00', payment_reference: 'SYNTHETIC-W05' }, expected: 201 });
    await request('api/deposits.php?do=deduct', { body: { booking_id: 4, amount: '50.00', affected_item: 'Synthetic cleaning', reason: 'Synthetic walkthrough cleaning deduction' }, expected: 200 });
    const d = data(await request('api/bookings.php?do=get&id=4', { expected: 200 }));
    const deposit = data(await request('api/deposits.php?booking_id=4', { expected: 200 }));
    const report = data(await request('api/reports.php?do=report&start=2026-10-01&end=2026-10-31', { expected: 200 }));
    assert.equal(Number(d.outstanding_balance), 0);
    assert.equal(Number(deposit.amount_held), 350);
    assert.equal(Number(deposit.refund_amount), 300);
    assert.equal(Number(report.total_revenue_collected), 1250);
    return { booking_balance: d.outstanding_balance, held: deposit.amount_held, deduction: deposit.deduction_amount, refundable: deposit.refund_amount, revenue: report.total_revenue_collected };
  });

  await step('W06', async () => {
    const first = data(await request('api/deposits.php?do=refund', { body: { booking_id: 4 }, expected: 200 }));
    const auditBefore = data(await request('api/audit.php', { expected: 200 })).filter(row => row.action === 'deposit_refunded' && Number(row.record_id) === Number(first.deposit_id)).length;
    const secondResponse = await request('api/deposits.php?do=refund', { body: { booking_id: 4 }, expected: 200 });
    const second = data(secondResponse);
    const auditAfter = data(await request('api/audit.php', { expected: 200 })).filter(row => row.action === 'deposit_refunded' && Number(row.record_id) === Number(first.deposit_id)).length;
    const report = data(await request('api/reports.php?do=report&start=2026-10-01&end=2026-10-31', { expected: 200 }));
    assert.equal(first.refund_status, 'Refunded');
    assert.equal(second.refund_status, 'Refunded');
    assert.equal(auditBefore, 1);
    assert.equal(auditAfter, 1);
    assert.equal(Number(report.total_revenue_collected), 1250);
    return { first_http: 200, retry_http: secondResponse.status, status: second.refund_status, refund_audit_count: auditAfter, revenue: report.total_revenue_collected };
  });

  await step('W07', async () => {
    await request('api/equipment.php?do=finalizeReturn', { body: { booking_id: 4, service_ready: true, payments_reviewed: true, deposits_reviewed: true, review_notes: 'Synthetic walkthrough reviewed and complete' }, expected: 200 });
    const d = data(await request('api/bookings.php?do=get&id=4', { expected: 200 }));
    const notices = data(await request('api/notifications.php?do=unresolved&booking_id=4', { expected: 200 }));
    const audit = data(await request('api/audit.php?booking_id=4', { expected: 200 }));
    assert.equal(d.status, 'Completed');
    assert.equal(Number(d.released_by), 1);
    assert.ok(d.completed_at);
    assert.equal(notices.length, 0);
    assert.ok(audit.some(row => row.action === 'manual_release' && row.old_status === 'Awaiting Completion' && row.new_status === 'Completed'));
    return { status: d.status, released_by: d.released_by, completed_at: d.completed_at, unresolved_notification_count: notices.length, manual_release_audit: true };
  });

  await step('W08', async () => {
    const rejected = await request('api/bookings.php?do=update&id=2', { body: { status: 'Confirmed' }, expected: 409 });
    const conflicts = rejected.json.details.bookings.map(row => Number(row.booking_id));
    assert.deepEqual(conflicts, [1]);
    const approved = data(await request('api/bookings.php?do=update&id=2', { body: { status: 'Confirmed', approve_conflicts: true, conflicting_booking_ids: [1], override_reason: 'Synthetic owner walkthrough overlap' }, expected: 200 }));
    const a = data(await request('api/bookings.php?do=get&id=1', { expected: 200 }));
    assert.equal(approved.status, 'Confirmed');
    assert.equal(approved.has_approved_overlap, true);
    assert.equal(a.has_approved_overlap, true);
    const audit = data(await request('api/audit.php?booking_id=2', { expected: 200 }));
    assert.ok(audit.some(row => row.action === 'overlap_override'));
    return { first_http: 409, remaining_conflict_booking_ids: conflicts, status: approved.status, markers: { A: a.has_approved_overlap, B: approved.has_approved_overlap }, override_audit: true };
  });

  await step('W09', async () => {
    await request('api/payments.php?do=create', { body: { booking_id: 3, amount: '100.00', payment_method: 'GCash', payment_type: 'Down payment', payment_status: 'Completed', payment_date: '2026-10-15 12:30:00', payment_reference: 'SYNTHETIC-W09' }, expected: 201 });
    const cancelled = data(await request('api/bookings.php?do=cancel&id=3', { body: { cancellation_reason: 'Synthetic walkthrough cancellation' }, expected: 200 }));
    const payments = data(await request('api/payments.php?booking_id=3', { expected: 200 }));
    const audit = data(await request('api/audit.php?booking_id=3', { expected: 200 }));
    const report = data(await request('api/reports.php?do=report&start=2026-10-01&end=2026-10-31', { expected: 200 }));
    assert.equal(cancelled.status, 'Cancelled');
    assert.equal(cancelled.cancellation_reason, 'Synthetic walkthrough cancellation');
    assert.equal(payments.length, 1);
    assert.ok(audit.some(row => row.action === 'cancellation' && row.new_status === 'Cancelled'));
    assert.equal(Number(report.total_revenue_collected), 1350);
    return { status: cancelled.status, cancellation_reason: cancelled.cancellation_reason, retained_payment_count: payments.length, cancellation_audit: true, revenue: report.total_revenue_collected };
  });

  await step('W10', async () => {
    const before = data(await request('api/delivery.php?do=get&booking_id=1', { expected: 200 }));
    const payments = data(await request('api/payments.php?booking_id=1', { expected: 200 }));
    await request('api/delivery.php?do=upsert', { body: { booking_id: 1, delivery_method: before.delivery_method, delivery_fee: before.delivery_fee, fee_shouldered_by: before.fee_shouldered_by, delivery_notes: 'SYNTHETIC updated delivery note' }, expected: 200 });
    const after = data(await request('api/delivery.php?do=get&booking_id=1', { expected: 200 }));
    const a = data(await request('api/bookings.php?do=get&id=1', { expected: 200 }));
    const report = data(await request('api/reports.php?do=report&start=2026-10-01&end=2026-10-31', { expected: 200 }));
    assert.equal(after.delivery_notes, 'SYNTHETIC updated delivery note');
    assert.equal(payments.filter(row => row.payment_status === 'Pending' && Number(row.amount) === 100).length, 1);
    assert.equal(Number(a.amount_paid), 250);
    assert.equal(Number(a.outstanding_balance), 750);
    assert.equal(Number(report.total_revenue_collected), 1350);
    return { before_note: before.delivery_notes, after_note: after.delivery_notes, pending_payment_count: 1, accepted_paid: a.amount_paid, outstanding_balance: a.outstanding_balance, revenue: report.total_revenue_collected };
  });

  const summary = { run_at: new Date().toISOString(), database: 'akad_verify_plan_1792046564392_28220', base, results,
    passed: results.filter(row => row.status === 'PASS').length, failed: results.filter(row => row.status === 'FAIL').length,
    not_executed: ['W11 browser offline/reconnect walkthrough', 'W12 two-browser stale-draft usability walkthrough', 'owner policy decisions and sign-off'] };
  fs.writeFileSync(output, JSON.stringify(summary, null, 2), { flag: 'wx' });
  console.log(`RESULT ${summary.passed} passed, ${summary.failed} failed; ${output}`);
  if (summary.failed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
