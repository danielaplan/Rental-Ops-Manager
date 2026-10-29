const assert = require('node:assert/strict');
const { test } = require('node:test');
const database = process.env.AKAD_TEST_DB_NAME;
const base = process.env.AKAD_TEST_BASE_URL;

test('offline sync honors revised shared booking, financial, catalog, and history rules', {
  skip: !database || !base ? 'Use tests/run_revised_backend.cjs for an isolated synthetic target.' : false,
}, async () => {
  assert.match(database, /^akad_verify_plan_[a-zA-Z0-9_]+$/);
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
  let token;
  let sequence = 0;
  const prefix = 'plan-sync-' + Date.now() + '-';
  async function request(endpoint, body) {
    const response = await fetch(new URL(endpoint, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.equal(response.status, body === undefined ? 200 : (endpoint.includes('?do=create') && !endpoint.includes('sync.php') ? 201 : 200), JSON.stringify(result));
    return result.data;
  }
  const operation = (entity, action, data) => ({ client_id: prefix + ++sequence, entity, action, data });
  const commit = item => request('api/sync.php?do=commit', { queue: [item] });
  async function synced(entity, action, data) {
    const item = operation(entity, action, data);
    const result = await commit(item);
    assert.equal(result.failed.length, 0, JSON.stringify(result));
    assert.equal(result.conflicts.length, 0, JSON.stringify(result));
    assert.equal(result.committed.length, 1, JSON.stringify(result));
    return { item, ack: result.committed[0] };
  }
  async function rejected(entity, action, data) {
    const result = await commit(operation(entity, action, data));
    assert.equal(result.failed.length, 1, JSON.stringify(result));
    assert.equal(result.committed.length, 0);
    assert.equal(result.conflicts.length, 0);
  }
  token = (await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).session_token;
  await synced('services', 'update', { id: 2, default_preparation_minutes: 30, default_travel_minutes: 45 });
  const body = {
    customer_name: 'Service two sync fixture', contact: 'TEST-SYNC', service_ids: [2],
    event_start_datetime: '9088-01-01 10:00:00', event_end_datetime: '9088-01-01 12:00:00',
    event_location: 'Synthetic venue', status: 'Confirmed', agreed_total: '100.00',
  };
  const direct = await request('api/bookings.php?do=create', body);
  const exactBoundary = await request('api/bookings.php?do=availability&service_id=2&event_start_datetime=9088-01-01%2012%3A45%3A00&event_end_datetime=9088-01-01%2013%3A45%3A00');
  assert.equal(exactBoundary.available, true);
  const oneMinuteOverlap = await request('api/bookings.php?do=availability&service_id=2&event_start_datetime=9088-01-01%2012%3A44%3A00&event_end_datetime=9088-01-01%2013%3A44%3A00');
  assert.equal(oneMinuteOverlap.available, false);
  assert.ok(oneMinuteOverlap.conflicts.bookings.some(row => Number(row.booking_id) === Number(direct.booking_id)));
  const conflict = await commit(operation('bookings', 'create', body));
  assert.equal(conflict.conflicts.length, 1, JSON.stringify(conflict));
  assert.equal(conflict.committed.length, 0);
  const detail = conflict.conflicts[0].details.bookings.find(row => Number(row.booking_id) === Number(direct.booking_id));
  assert.ok(detail);
  assert.equal(detail.customer_name, body.customer_name);
  assert.ok(detail.service_name);
  assert.equal(detail.event_start_datetime, body.event_start_datetime);
  assert.equal(detail.event_end_datetime, body.event_end_datetime);
  const pendingOverlap = await commit(operation('bookings', 'create', { ...body, status: 'Pending' }));
  assert.equal(pendingOverlap.conflicts.length, 1, JSON.stringify(pendingOverlap));
  assert.equal(pendingOverlap.committed.length, 0);
  const staleTarget = await synced('bookings', 'create', { ...body, status: 'Pending', event_start_datetime: '9088-01-02 10:00:00', event_end_datetime: '9088-01-02 12:00:00' });
  const staleBookingId = staleTarget.ack.server_id;
  await synced('bookings', 'update', {
    id: staleBookingId, status: 'Pending', event_start_datetime: '9088-01-01 10:00:00', event_end_datetime: '9088-01-01 12:00:00', event_location: 'Conflicting synthetic venue',
  });
  const staleBase = await request(`api/bookings.php?do=get&id=${staleBookingId}`);
  await synced('bookings', 'update', {
    id: staleBookingId, status: 'Pending', event_start_datetime: '9088-01-02 10:00:00', event_end_datetime: '9088-01-02 12:00:00', event_location: 'Moved synthetic venue',
  });
  const staleApproval = await commit(operation('bookings', 'update', {
    id: staleBookingId, status: 'Confirmed', approve_conflicts: true, conflicting_booking_ids: [direct.booking_id], override_reason: 'Stale synthetic approval',
    approval_base: Object.fromEntries(['service_id','event_start_datetime','event_end_datetime','blocked_start_datetime','blocked_end_datetime','status'].map(field => [field, staleBase[field]])),
  }));
  assert.equal(staleApproval.conflicts.length, 1, JSON.stringify(staleApproval));
  assert.equal(staleApproval.conflicts[0].kind, 'stale');
  assert.equal((await request(`api/bookings.php?do=get&id=${staleBookingId}`)).status, 'Pending');
  const priceTarget = await synced('bookings', 'create', { ...body, status: 'Pending', event_start_datetime: '9088-02-02 10:00:00', event_end_datetime: '9088-02-02 12:00:00' });
  const priceBookingId = priceTarget.ack.server_id;
  const originalPrice = await request(`api/bookings.php?do=get&id=${priceBookingId}`);
  await synced('bookings', 'update', { id: priceBookingId, discount: '25.00', fees: '5.00', agreed_total: '480.00' });
  const stalePrice = await commit(operation('bookings', 'update', {
    id: priceBookingId, discount: '15.00', fees: '5.00', agreed_total: '490.00',
    _base: { discount: originalPrice.discount, fees: originalPrice.fees, agreed_total: originalPrice.agreed_total },
  }));
  assert.equal(stalePrice.conflicts.length, 1, JSON.stringify(stalePrice));
  assert.equal(stalePrice.conflicts[0].kind, 'stale');
  assert.equal(Number(stalePrice.conflicts[0].server_record.discount), 25);
  const retainedPrice = await request(`api/bookings.php?do=get&id=${priceBookingId}`);
  assert.equal(Number(retainedPrice.discount), 25);
  assert.equal(Number(retainedPrice.agreed_total), 480);
  const approved = await synced('bookings', 'create', {
    ...body, approve_conflicts: true, conflicting_booking_ids: [direct.booking_id], override_reason: 'Owner-approved synthetic overlap',
  });
  assert.equal(approved.ack.data.has_approved_overlap, true);
  assert.equal((await request(`api/bookings.php?do=get&id=${direct.booking_id}`)).has_approved_overlap, true);
  const calendarRows = await request('api/bookings.php?do=all');
  assert.equal(calendarRows.find(row => Number(row.booking_id) === Number(approved.ack.server_id)).has_approved_overlap, true);
  for (const sid of [1, 3]) {
    const fixture = { ...body, service_ids: [sid], event_start_datetime: '9088-03-01 10:00:00', event_end_datetime: '9088-03-01 12:00:00' };
    const existing = await request('api/bookings.php?do=create', fixture);
    const blocked = await commit(operation('bookings', 'create', fixture));
    assert.equal(blocked.conflicts.length, 1, JSON.stringify(blocked));
    assert.equal(Number(blocked.conflicts[0].details.bookings[0].booking_id), Number(existing.booking_id));
  }
  const created = await synced('bookings', 'create', {
    ...body, event_start_datetime: '9088-01-02 10:00:00', event_end_datetime: '9088-01-02 12:00:00', status: 'Pending',
  });
  const bid = created.ack.data.booking_id;
  assert.equal(created.ack.data.package_id, null);
  assert.equal(Number(created.ack.data.preparation_minutes), 30);
  assert.equal(Number(created.ack.data.travel_minutes), 45);
  assert.equal(created.ack.data.blocked_start_datetime, '9088-01-02 09:30:00');
  assert.equal(created.ack.data.blocked_end_datetime, '9088-01-02 12:45:00');
  assert.deepEqual((await commit(created.item)).committed[0], created.ack);
  const zero = await synced('bookings', 'create', {
    ...body, event_start_datetime: '9088-01-03 10:00:00', event_end_datetime: '9088-01-03 12:00:00',
    status: 'Pending', preparation_minutes: 0, travel_minutes: 0,
  });
  assert.equal(Number(zero.ack.data.preparation_minutes), 0);
  assert.equal(Number(zero.ack.data.travel_minutes), 0);
  await rejected('bookings', 'update', { id: bid, status: 'Completed' });
  await rejected('bookings', 'delete', { id: bid });
  await rejected('bookings', 'delete', { id: bid, cancellation_reason: ['invalid'] });
  assert.equal((await request(`api/bookings.php?do=get&id=${bid}`)).status, 'Pending');
  const promo = await synced('packages', 'create', {
    service_id: 2, package_name: 'Sync promotion fixture', price: '100.00', is_promotional: true,
    promotion_start_date: '9088-02-01', promotion_end_date: '9088-02-28',
  });
  const pid = promo.ack.data.package_id;
  await rejected('bookings', 'create', { ...body, package_id: pid, status: 'Pending' });

  const payment = await synced('payments', 'create', {
    booking_id: bid, amount: '10.00', payment_method: 'MariBank', payment_type: 'Down payment',
    payment_status: 'Pending', payment_date: '2026-10-01 13:14:15', payment_reference: 'PENDING-SYNC-REFERENCE',
  });
  assert.equal(payment.ack.data.payment_status, 'Pending');
  assert.equal(payment.ack.data.payment_date, '2026-10-01 13:14:15');
  assert.equal(payment.ack.data.payment_reference, 'PENDING-SYNC-REFERENCE');
  assert.deepEqual((await commit(payment.item)).committed[0], payment.ack);
  await synced('deposits', 'upsert', { booking_id: bid, amount_held: '15.00' });
  await synced('delivery', 'upsert', {
    booking_id: bid, delivery_method: 'owner_delivered', delivery_fee: '5.00', fee_shouldered_by: 'Customer', delivery_notes: 'Sync note survives',
  });
  await rejected('delivery', 'upsert', {
    booking_id: bid, delivery_method: 'owner_delivered', delivery_fee: '-1.00', fee_shouldered_by: 'Customer',
  });
  assert.equal((await request(`api/delivery.php?do=get&booking_id=${bid}`)).delivery_notes, 'Sync note survives');
  await synced('bookings', 'update', { id: bid, status: 'Confirmed' });
  const history = await synced('itemHistory', 'create', { booking_id: bid, rental_item_id: 1, action: 'Released', qty: 1, condition: 'Good' });
  const release = await synced('itemReleases', 'create', { booking_id: bid, released_by: 'Fixture owner', notes: 'Append-only fixture' });
  await rejected('itemHistory', 'delete', { id: history.ack.server_id });
  await rejected('itemReleases', 'delete', { id: release.ack.server_id });
  await rejected('bookingItems', 'delete', { booking_id: bid, id: 1 });
  const cancellation = await synced('bookings', 'delete', { id: bid, cancellation_reason: 'Owner approved cancellation' });
  assert.equal(cancellation.ack.data.status, 'Cancelled');
  assert.deepEqual((await commit(cancellation.item)).committed[0], cancellation.ack);
  assert.equal((await request(`api/payments.php?booking_id=${bid}`)).length, 1);
  assert.equal(Number((await request(`api/deposits.php?booking_id=${bid}`)).amount_held), 15);
  assert.equal((await request(`api/delivery.php?do=get&booking_id=${bid}`)).delivery_notes, 'Sync note survives');
  const audit = await request(`api/audit.php?booking_id=${bid}`);
  assert.deepEqual(audit.filter(row => row.new_status !== null).map(row => [row.old_status, row.new_status]), [[null, 'Pending'], ['Pending', 'Confirmed'], ['Confirmed', 'Cancelled']]);

  for (const value of [-1, 1.5, 'bad', 525601]) await rejected('services', 'update', { id: 2, default_preparation_minutes: value });
  const service = await synced('services', 'create', { service_name: 'Sync archive fixture ' + Date.now() });
  assert.equal(Number(service.ack.data.default_preparation_minutes), 0);
  assert.equal(Number(service.ack.data.default_travel_minutes), 0);
  await synced('services', 'delete', { id: service.ack.server_id });
  assert.equal((await request(`api/services.php?do=get&id=${service.ack.server_id}`)).status, 'Inactive');
  await synced('packages', 'delete', { id: pid });
  assert.equal((await request(`api/packages.php?do=get&id=${pid}`)).status, 'Inactive');
});
