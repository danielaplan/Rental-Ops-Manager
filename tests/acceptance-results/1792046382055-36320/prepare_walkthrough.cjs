const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
assert.match(process.env.AKAD_TEST_DB_NAME || '', /^akad_verify_plan_\d+_\d+$/);
assert.match(process.env.AKAD_TEST_BASE_URL || '', /^http:\/\/127\.0\.0\.1:\d+\/$/);
let token;
async function request(endpoint, body, expected = 200) {
  const response = await fetch(new URL(endpoint, process.env.AKAD_TEST_BASE_URL), {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  return result.data;
}
(async () => {
  token = (await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).session_token;
  await request('api/checklistTemplates.php?do=create', { package_id: 1, template_name: 'SYNTHETIC owner walkthrough',
    items: [{ item_name: 'Demo speaker', expected_quantity: 1 }, { item_name: 'Demo microphone', expected_quantity: 2 }] });
  await request('api/services.php?do=update&id=1', { default_preparation_minutes: 30, default_travel_minutes: 30 });
  const customer = await request('api/customers.php?do=create', { full_name: 'SYNTHETIC Walkthrough Customer', contact_number: 'DEMO-ONLY' }, 201);
  const book = (label, extra) => request('api/bookings.php?do=create', {
    customer_id: customer.customer_id, service_id: 1, package_id: 1, agreed_total: '1000.00',
    event_start_datetime: '2030-11-05 10:00:00', event_end_datetime: '2030-11-05 12:00:00',
    event_location: 'SYNTHETIC demo venue', theme_notes: label, status: 'Pending', ...extra,
  }, 201);
  const primary = await book('DEMO-A future booking', { status: 'Confirmed' });
  const overlap = await book('DEMO-B overlapping pending booking', {});
  const cancellation = await book('DEMO-C cancellation exercise', { event_start_datetime: '2030-11-06 10:00:00', event_end_datetime: '2030-11-06 12:00:00' });
  const due = await book('DEMO-D return exercise: synthetic past event', {
    event_start_datetime: '2020-01-02 10:00:00', event_end_datetime: '2020-01-02 12:00:00', status: 'Confirmed',
  });
  assert.equal(due.status, 'Awaiting Completion');
  for (const booking of [primary, due]) {
    await request('api/payments.php?do=create', { booking_id: booking.booking_id, amount: '250.00', payment_method: 'GCash', payment_type: 'Down payment', payment_status: 'Completed', payment_date: '2026-10-15 10:00:00', payment_reference: 'SYNTHETIC-ONLY' }, 201);
    await request('api/deposits.php?do=upsert', { booking_id: booking.booking_id, amount_held: '350.00' });
  }
  await request('api/payments.php?do=create', { booking_id: primary.booking_id, amount: '100.00', payment_method: 'MariBank', payment_type: 'Balance', payment_status: 'Pending', payment_date: '2026-10-15 10:01:00' }, 201);
  await request('api/delivery.php?do=upsert', { booking_id: primary.booking_id, delivery_method: 'owner_delivered', delivery_fee: '50.00', fee_shouldered_by: 'Customer', delivery_notes: 'SYNTHETIC delivery note' });
  const checklist = await request(`api/bookingItems.php?booking_id=${due.booking_id}`);
  for (const item of checklist) await request(`api/bookingItems.php?do=update&id=${item.checklist_item_id}`, { checked_released: true });
  const manifest = { synthetic_only: true, owner_acceptance: 'Pending', database: process.env.AKAD_TEST_DB_NAME,
    created_at: new Date().toISOString(), customer_id: customer.customer_id, bookings: {},
    return_checklist: await request(`api/bookingItems.php?booking_id=${due.booking_id}`),
    baseline_report: await request('api/reports.php?do=report&start=2026-10-01&end=2026-10-31') };
  for (const [label, booking] of Object.entries({ A: primary, B: overlap, C: cancellation, D: due })) {
    manifest.bookings[label] = await request(`api/bookings.php?do=get&id=${booking.booking_id}`);
  }
  assert.equal(Number(manifest.bookings.A.amount_paid), 250);
  assert.equal(Number(manifest.bookings.A.outstanding_balance), 750);
  assert.equal(Number(manifest.baseline_report.total_revenue_collected), 500);
  assert.equal(manifest.return_checklist.length, 2);
  assert.ok(manifest.return_checklist.every(item => Number(item.quantity_released) === Number(item.expected_quantity) && item.condition_in === null));
  fs.writeFileSync(path.join(__dirname, 'walkthrough-fixtures.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  console.log(`PREPARED synthetic owner walkthrough: ${manifest.database}. Owner acceptance remains pending.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
