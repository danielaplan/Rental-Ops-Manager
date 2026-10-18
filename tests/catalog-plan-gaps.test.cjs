const assert = require('node:assert/strict');
const { test } = require('node:test');
const database = process.env.AKAD_TEST_DB_NAME;
const base = process.env.AKAD_TEST_BASE_URL;

test('catalog defaults, booking snapshots, eligibility, and retained cancellation', {
  skip: !database || !base ? 'Use tests/run_revised_backend.cjs for a synthetic target.' : false,
}, async () => {
  assert.match(database, /^akad_verify_plan_[a-zA-Z0-9_]+$/);
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
  let token;
  async function request(endpoint, body) {
    const response = await fetch(new URL(endpoint, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, ...(await response.json()) };
  }
  async function saved(endpoint, body, status = 200) {
    const response = await request(endpoint, body);
    assert.equal(response.status, status, JSON.stringify(response));
    return response.data;
  }
  token = (await saved('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).session_token;
  const customer = await saved('api/customers.php?do=create', {
    full_name: 'Catalog customer ' + Date.now(), contact_number: 'CATALOG-CUSTOMER', notes: 'Unsupported legacy field',
  }, 201);
  assert.equal(customer.contact_number, 'CATALOG-CUSTOMER');
  const service = await saved('api/services.php?do=create', { service_name: 'Catalog fixture ' + Date.now() }, 201);
  const sid = service.service_id;
  assert.equal(Number(service.default_preparation_minutes), 0);
  assert.equal(Number(service.default_travel_minutes), 0);
  for (const value of [-1, 1.5, 'tomorrow', true, 525601]) {
    for (const field of ['default_preparation_minutes', 'default_travel_minutes']) {
      assert.equal((await request(`api/services.php?do=update&id=${sid}`, { [field]: value })).status, 400);
    }
  }
  await saved(`api/services.php?do=update&id=${sid}`, { default_preparation_minutes: 30, default_travel_minutes: 45 });
  const partial = await saved(`api/services.php?do=update&id=${sid}`, { default_travel_minutes: 60 });
  assert.equal(Number(partial.default_preparation_minutes), 30);
  assert.equal(Number(partial.default_travel_minutes), 60);
  const bookingBody = {
    customer_name: 'Catalog fixture', contact: 'TEST-CATALOG', service_id: sid,
    event_start_datetime: '9080-05-01 10:00:00', event_end_datetime: '9080-05-01 12:00:00',
    event_location: 'Synthetic venue', status: 'Pending', agreed_total: '123.45',
  };
  const create = body => saved('api/bookings.php?do=create', { ...bookingBody, ...body }, 201);
  const withoutPackage = await create({});
  assert.equal(withoutPackage.package_id, null);
  assert.equal(Number(withoutPackage.preparation_minutes), 30);
  assert.equal(Number(withoutPackage.travel_minutes), 60);
  assert.equal(withoutPackage.blocked_start_datetime, '9080-05-01 09:30:00');
  assert.equal(withoutPackage.blocked_end_datetime, '9080-05-01 13:00:00');
  await saved(`api/services.php?do=update&id=${sid}`, { default_preparation_minutes: 5 });
  const unchanged = await saved(`api/bookings.php?do=get&id=${withoutPackage.booking_id}`);
  assert.equal(Number(unchanged.preparation_minutes), 30);
  assert.equal(Number((await create({})).preparation_minutes), 5);
  const override = await create({ preparation_minutes: 0, travel_minutes: 0 });
  assert.equal(Number(override.preparation_minutes), 0);
  assert.equal(Number(override.travel_minutes), 0);
  assert.notEqual(override.booking_reference, withoutPackage.booking_reference);
  const defaults = await saved(`api/services.php?do=get&id=${sid}`);
  assert.equal(Number(defaults.default_preparation_minutes), 5);
  assert.equal(Number(defaults.default_travel_minutes), 60);
  for (const body of [
    { event_end_datetime: bookingBody.event_start_datetime },
    { event_end_datetime: '9080-05-01 09:00:00' },
    { event_start_datetime: '9080-02-30 10:00:00' },
    { event_location: ' ' }, { event_location: ['invalid'] }, { customer_name: ['invalid'] }, { theme_notes: ['invalid'] },
    { service_ids: [sid, sid] }, { service_ids: { service: sid } },
    { preparation_minutes: -1 }, { travel_minutes: 0.5 },
  ]) assert.equal((await request('api/bookings.php?do=create', { ...bookingBody, ...body })).status, 400, JSON.stringify(body));

  const pack = await saved('api/packages.php?do=create', {
    service_id: sid, package_name: 'Original agreement package', price: '200.00',
    description: 'Fixture', inclusions: 'Microphone', duration_minutes: 120,
    requires_deposit: true, deposit_amount: '15.00',
  }, 201);
  const pid = pack.package_id;
  await saved('api/checklistTemplates.php?do=create', { package_id: pid, template_name: 'Catalog fixture template', items: [{ item_name: 'Microphone', expected_quantity: 1 }] });
  const booked = await create({ package_id: pid, status: 'Confirmed' });
  await saved(`api/packages.php?do=update&id=${pid}`, { package_name: 'Current catalog title', price: '999.00', status: 'Inactive' });
  const historical = await saved(`api/bookings.php?do=update&id=${booked.booking_id}`, { theme_notes: 'Details only' });
  assert.equal(historical.package_name_snapshot, 'Original agreement package');
  assert.equal(Number(historical.package_price_snapshot), 200);
  assert.equal(Number(historical.agreed_total), 123.45);
  assert.equal((await request('api/bookings.php?do=create', { ...bookingBody, package_id: pid })).status, 400);
  const promo = await saved('api/packages.php?do=create', {
    service_id: sid, package_name: 'May promotion', price: '150.00', is_promotional: true,
    promotion_start_date: '9080-05-01', promotion_end_date: '9080-05-31',
  }, 201);
  assert.equal((await request('api/bookings.php?do=create', {
    ...bookingBody, package_id: promo.package_id, event_start_datetime: '9080-06-01 10:00:00', event_end_datetime: '9080-06-01 12:00:00',
  })).status, 400);
  const eligible = await create({ package_id: promo.package_id });
  assert.equal((await request(`api/bookings.php?do=update&id=${eligible.booking_id}`, {
    event_start_datetime: '9080-06-01 10:00:00', event_end_datetime: '9080-06-01 12:00:00',
  })).status, 400);
  await saved(`api/packages.php?do=update&id=${promo.package_id}`, { status: 'Inactive' });
  assert.equal((await request(`api/bookings.php?do=update&id=${eligible.booking_id}`, { status: 'Confirmed' })).status, 400);

  const bid = booked.booking_id;
  await saved('api/payments.php?do=create', { booking_id: bid, amount: '10.00', payment_method: 'GCash' }, 201);
  await saved('api/deposits.php?do=upsert', { booking_id: bid, amount_held: '15.00' });
  await saved('api/delivery.php?do=upsert', { booking_id: bid, delivery_method: 'owner_delivered', delivery_fee: '5.00', fee_shouldered_by: 'Customer', delivery_notes: 'Retain after cancellation' });
  assert.equal((await request(`api/bookings.php?do=delete&id=${bid}`, {})).status, 400);
  const cancelled = await saved(`api/bookings.php?do=delete&id=${bid}`, { cancellation_reason: 'Customer requested cancellation' });
  assert.equal(cancelled.status, 'Cancelled');
  assert.equal((await saved(`api/payments.php?booking_id=${bid}`)).length, 1);
  assert.equal(Number((await saved(`api/deposits.php?booking_id=${bid}`)).amount_held), 15);
  assert.equal((await saved(`api/delivery.php?do=get&booking_id=${bid}`)).delivery_notes, 'Retain after cancellation');
  assert.equal((await saved(`api/bookingItems.php?booking_id=${bid}`)).length, 1);
  const history = await saved(`api/audit.php?booking_id=${bid}`);
  assert.deepEqual(history.filter(row => row.new_status !== null).map(row => [row.old_status, row.new_status]), [[null, 'Confirmed'], ['Confirmed', 'Cancelled']]);
  await saved(`api/bookings.php?do=delete&id=${bid}`, { cancellation_reason: 'Retry' });
  const retried = await saved(`api/audit.php?booking_id=${bid}`);
  assert.equal(retried.filter(row => row.new_status === 'Cancelled').length, 1);
});
