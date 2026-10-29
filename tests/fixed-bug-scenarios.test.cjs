const assert = require('node:assert/strict');
const { before, test } = require('node:test');
const { execFileSync } = require('node:child_process');

const database = process.env.AKAD_TEST_DB_NAME;
const base = process.env.AKAD_TEST_BASE_URL;
const mysql = process.env.AKAD_TEST_MYSQL || 'C:/xampp/mysql/bin/mysql.exe';
assert.match(database || '', /^akad_verify_plan_\d+_\d+$/,
  'Run with tests/run_revised_backend.cjs so these scenarios never touch the normal database.');
assert.ok(base && /^http:\/\/127\.0\.0\.1:\d+\/$/.test(base));

let token;
let sequence = 0;

async function request(endpoint, body, expected = 200) {
  const response = await fetch(new URL(endpoint, base), {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await response.json();
  assert.equal(response.status, expected, `${endpoint}: ${JSON.stringify(json)}`);
  return json;
}

function sql(statement) {
  return execFileSync(mysql, [
    '--host=' + (process.env.AKAD_DB_HOST || 'localhost'),
    '--user=' + (process.env.AKAD_DB_USER || 'root'),
    '--database=' + database,
    '--batch', '--skip-column-names', '-e', statement,
  ], {
    env: { ...process.env, MYSQL_PWD: process.env.AKAD_DB_PASS || '' },
    encoding: 'utf8',
  }).trim();
}

async function createService(label) {
  return (await request('api/services.php?do=create', {
    service_name: `${label} ${Date.now()} ${++sequence}`,
  }, 201)).data;
}

async function createPackage(serviceId, label, price = '1000.00', withChecklist = false) {
  const packageRow = (await request('api/packages.php?do=create', {
    service_id: serviceId, package_name: `${label} ${++sequence}`, price,
  }, 201)).data;
  if (withChecklist) {
    await request('api/checklistTemplates.php?do=create', {
      package_id: packageRow.package_id,
      template_name: `${label} equipment`,
      items: [{ item_name: 'Synthetic speaker', expected_quantity: 1 }],
    });
  }
  return packageRow;
}

async function createBooking(serviceId, extra = {}) {
  const suffix = `${Date.now()}-${++sequence}`;
  return (await request('api/bookings.php?do=create', {
    customer_name: `Scenario customer ${suffix}`,
    contact: `SC-${sequence}`,
    service_id: serviceId,
    event_start_datetime: '9100-01-01 10:00:00',
    event_end_datetime: '9100-01-01 11:00:00',
    event_location: 'Synthetic scenario venue',
    status: 'Pending',
    agreed_total: '1000.00',
    ...extra,
  }, 201)).data;
}

async function booking(id) {
  return (await request(`api/bookings.php?do=get&id=${id}`)).data;
}

before(async () => {
  const login = await request('api/auth.php', {
    contact_number: 'TEST-OWNER', password: 'OfflineTest!2026',
  });
  token = login.data.session_token;
});

test('scenario 1: collected payments prevent a lower booking total without partial writes', async () => {
  const service = await createService('Price floor service');
  const created = await createBooking(service.service_id);
  const payment = (await request('api/payments.php?do=create', {
    booking_id: created.booking_id, amount: '800.00', payment_method: 'GCash',
    payment_status: 'Completed', payment_date: '2026-10-01 10:00:00',
  }, 201)).data;
  const beforeRow = await booking(created.booking_id);
  const rejected = await request(`api/bookings.php?do=update&id=${created.booking_id}`, {
    agreed_total: '500.00', theme_notes: 'This must roll back with the rejected price.',
  }, 409);
  assert.equal(rejected.code, 'collected_payments_exceed_total');
  const afterRow = await booking(created.booking_id);
  assert.equal(Number(afterRow.agreed_total), 1000);
  assert.equal(Number(afterRow.amount_paid), 800);
  assert.equal(Number(afterRow.outstanding_balance), 200);
  assert.equal(afterRow.theme_notes, beforeRow.theme_notes);
  assert.equal(sql(`SELECT amount FROM payments WHERE payment_id=${Number(payment.payment_id)}`), '800.00');
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${Number(created.booking_id)} AND action='price_change'`), '0');
});

test('scenario 2: correcting a fully paid Completed booking reopens payment while preserving review evidence', async () => {
  const service = await createService('Correction lifecycle service');
  const pack = await createPackage(service.service_id, 'Correction package', '1000.00', true);
  const created = await createBooking(service.service_id, {
    package_id: pack.package_id,
    status: 'Confirmed',
    event_start_datetime: '2002-01-01 10:00:00',
    event_end_datetime: '2002-01-01 11:00:00',
  });
  const fullPayment = (await request('api/payments.php?do=create', {
    booking_id: created.booking_id, amount: '1000.00', payment_method: 'GCash',
    payment_status: 'Completed', payment_date: '2026-10-01 10:00:00',
  }, 201)).data;
  const checklist = (await request(`api/bookingItems.php?booking_id=${created.booking_id}`)).data;
  assert.equal(checklist.length, 1);
  await request(`api/bookingItems.php?do=update&id=${checklist[0].checklist_item_id}`, {
    booking_id: created.booking_id, quantity_released: 1, condition_out: 'Good',
  });
  const completed = (await request(`api/bookings.php?do=release&id=${created.booking_id}`, {
    service_ready: true,
    payments_reviewed: true,
    deposits_reviewed: true,
    review_notes: 'Synthetic completed return review',
    checklist_items: [{
      checklist_item_id: checklist[0].checklist_item_id,
      quantity_returned: 1,
      condition_in: 'Good',
      return_status: 'inspected',
    }],
  })).data;
  assert.equal(completed.status, 'Completed');
  const preserved = {
    released_by: completed.released_by,
    review_notes: completed.review_notes,
    checklist: sql(`SELECT CONCAT(quantity_released,'|',quantity_returned,'|',condition_out,'|',condition_in,'|',return_status) FROM booking_checklist_items WHERE checklist_item_id=${Number(checklist[0].checklist_item_id)}`),
  };

  await request(`api/payments.php?do=update&id=${fullPayment.payment_id}`, {
    amount: '600.00', correction_reason: 'Synthetic correction from 1000 to 600',
  });
  const reopened = await booking(created.booking_id);
  assert.equal(reopened.status, 'Awaiting Payment');
  assert.equal(Number(reopened.amount_paid), 600);
  assert.equal(Number(reopened.outstanding_balance), 400);
  assert.equal(reopened.completed_at, null);
  assert.equal(String(reopened.released_by), String(preserved.released_by));
  assert.equal(reopened.review_notes, preserved.review_notes);
  assert.equal(sql(`SELECT CONCAT(quantity_released,'|',quantity_returned,'|',condition_out,'|',condition_in,'|',return_status) FROM booking_checklist_items WHERE checklist_item_id=${Number(checklist[0].checklist_item_id)}`), preserved.checklist);
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${Number(created.booking_id)} AND notification_type='awaiting_payment' AND resolved_at IS NULL AND message LIKE '%400.00%'`), sql("SELECT COUNT(*) FROM users WHERE role='owner' AND account_status='Active'"));
  assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='booking' AND record_id=${Number(created.booking_id)} AND old_status='Completed' AND new_status='Awaiting Payment'`), '1');

  await request('api/payments.php?do=create', {
    booking_id: created.booking_id, amount: '400.00', payment_method: 'MariBank',
    payment_status: 'Completed', payment_date: '2026-10-02 10:00:00',
  }, 201);
  const finalized = (await request(`api/bookings.php?do=release&id=${created.booking_id}`, {})).data;
  assert.equal(finalized.status, 'Completed');
  assert.equal(sql(`SELECT COUNT(*) FROM notifications WHERE booking_id=${Number(created.booking_id)} AND resolved_at IS NULL`), '0');
});

test('scenario 3: cancellation waits for dispatched-equipment recovery and then preserves its history', async () => {
  const service = await createService('Recovery service');
  const pack = await createPackage(service.service_id, 'Recovery package', '500.00', true);
  const created = await createBooking(service.service_id, {
    package_id: pack.package_id,
    agreed_total: '500.00',
    status: 'Confirmed',
    event_start_datetime: '9101-01-01 10:00:00',
    event_end_datetime: '9101-01-01 11:00:00',
  });
  const item = (await request(`api/bookingItems.php?booking_id=${created.booking_id}`)).data[0];
  await request(`api/bookingItems.php?do=update&id=${item.checklist_item_id}`, {
    booking_id: created.booking_id, quantity_released: 1, condition_out: 'Good',
  });
  const blocked = await request(`api/bookings.php?do=cancel&id=${created.booking_id}`, {
    cancellation_reason: 'Attempted before equipment recovery',
  }, 409);
  assert.equal(blocked.code, 'equipment_return_required');
  assert.match(blocked.error, /Record the returned quantity and condition/);
  assert.equal((await booking(created.booking_id)).status, 'Confirmed');
  assert.equal(sql(`SELECT quantity_released FROM booking_checklist_items WHERE checklist_item_id=${Number(item.checklist_item_id)}`), '1');

  await request(`api/bookingItems.php?do=update&id=${item.checklist_item_id}`, {
    booking_id: created.booking_id,
    quantity_released: 1,
    quantity_returned: 1,
    condition_out: 'Good',
    condition_in: 'Good',
  });
  const cancelled = (await request(`api/bookings.php?do=cancel&id=${created.booking_id}`, {
    cancellation_reason: 'Equipment recovered before cancellation',
  })).data;
  assert.equal(cancelled.status, 'Cancelled');
  assert.equal(sql(`SELECT CONCAT(quantity_released,'|',quantity_returned,'|',condition_in) FROM booking_checklist_items WHERE checklist_item_id=${Number(item.checklist_item_id)}`), '1|1|Good');
});

test('scenario 4: referenced packages cannot move services while unreferenced packages can', async () => {
  const serviceA = await createService('Package service A');
  const serviceB = await createService('Package service B');
  const referenced = await createPackage(serviceA.service_id, 'Referenced package', '200.00');
  const booked = await createBooking(serviceA.service_id, {
    package_id: referenced.package_id, agreed_total: '200.00',
  });
  const blocked = await request(`api/packages.php?do=update&id=${referenced.package_id}`, {
    service_id: serviceB.service_id,
  }, 409);
  assert.equal(blocked.code, 'package_service_locked');
  const packageAfter = (await request(`api/packages.php?do=get&id=${referenced.package_id}`)).data;
  const bookingAfter = await booking(booked.booking_id);
  assert.equal(Number(packageAfter.service_id), Number(serviceA.service_id));
  assert.equal(Number(bookingAfter.service_id), Number(serviceA.service_id));
  assert.equal(bookingAfter.package_name_snapshot, referenced.package_name);
  assert.equal(Number(bookingAfter.package_price_snapshot), 200);

  const unreferenced = await createPackage(serviceA.service_id, 'Unreferenced package', '300.00');
  const moved = (await request(`api/packages.php?do=update&id=${unreferenced.package_id}`, {
    service_id: serviceB.service_id,
  })).data;
  assert.equal(Number(moved.service_id), Number(serviceB.service_id));
});

test('scenario 5: Payments, Dashboard, and Reports align outstanding balances and exclude cancellations', async () => {
  const service = await createService('Balance alignment service');
  const baselineDashboard = (await request('api/reports.php?do=dashboard')).data;
  const baseline = Number(baselineDashboard.balances.outstanding_balances);
  const activeA = await createBooking(service.service_id, {
    agreed_total: '1000.00', event_start_datetime: '9102-01-01 10:00:00', event_end_datetime: '9102-01-01 11:00:00',
  });
  const activeB = await createBooking(service.service_id, {
    agreed_total: '500.00', event_start_datetime: '9102-01-02 10:00:00', event_end_datetime: '9102-01-02 11:00:00',
  });
  const cancelledC = await createBooking(service.service_id, {
    agreed_total: '700.00', event_start_datetime: '9102-01-03 10:00:00', event_end_datetime: '9102-01-03 11:00:00',
  });
  await request('api/payments.php?do=create', {
    booking_id: activeA.booking_id, amount: '800.00', payment_method: 'GCash', payment_date: '2026-10-03 10:00:00',
  }, 201);
  await request('api/payments.php?do=create', {
    booking_id: activeB.booking_id, amount: '100.00', payment_method: 'MariBank', payment_date: '2026-10-03 11:00:00',
  }, 201);
  await request(`api/bookings.php?do=cancel&id=${cancelledC.booking_id}`, {
    cancellation_reason: 'Cancelled balance exclusion fixture',
  });

  async function aligned(expectedDelta) {
    const bookings = (await request('api/bookings.php')).data;
    const paymentsViewTotal = bookings
      .filter(row => !['Cancelled', 'Rejected'].includes(row.status))
      .reduce((sum, row) => sum + Number(row.outstanding_balance), 0);
    const dashboard = (await request('api/reports.php?do=dashboard')).data;
    const report = (await request('api/reports.php?do=report&start=9102-01-01&end=9102-01-31')).data;
    const expected = baseline + expectedDelta;
    assert.equal(paymentsViewTotal, expected);
    assert.equal(Number(dashboard.balances.outstanding_balances), expected);
    assert.equal(Number(report.balances.outstanding_balances), expected);
  }

  await aligned(600);
  await request('api/payments.php?do=create', {
    booking_id: activeA.booking_id, amount: '200.00', payment_method: 'GCash', payment_date: '2026-10-04 10:00:00',
  }, 201);
  await aligned(400);
  await request(`api/bookings.php?do=cancel&id=${activeB.booking_id}`, {
    cancellation_reason: 'Remove remaining active balance fixture',
  });
  await aligned(0);

  const paymentsPage = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'admin', 'payments.html'), 'utf8');
  const dashboardPage = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'admin', 'dashboard.html'), 'utf8');
  const reportsPage = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'admin', 'reports.html'), 'utf8');
  assert.match(paymentsPage, /balanceBookings = bookings\.filter\(b => !\['Cancelled', 'Rejected'\]\.includes\(b\.status\)\)/);
  assert.match(dashboardPage, /stats\.balances\?\.outstanding_balances/);
  assert.match(reportsPage, /PaymentsHelper\.totalOutstanding\(bookings, pendingPaymentIndex\)/);
});

