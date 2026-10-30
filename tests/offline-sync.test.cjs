const assert = require('node:assert/strict');
const { test } = require('node:test');

const database = process.env.AKAD_TEST_DB_NAME || '';
const base = process.env.AKAD_TEST_BASE_URL || '';
assert.match(database, /^akad_verify_plan_\d+_\d+$/);
assert.match(base, /^http:\/\/127\.0\.0\.1:\d+\/$/);

async function client() {
  let token;
  async function request(path, body, expected = 200) {
    const response = await fetch(new URL(path, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.equal(response.status, expected, JSON.stringify(result));
    return result.data;
  }
  token = (await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).session_token;
  return request;
}

test('offline booking draft replays once and a conflicting draft is retained', async () => {
  const request = await client();
  let sequence = 0;
  const operation = data => ({
    client_id: `offline-booking-${Date.now()}-${++sequence}`,
    entity: 'bookings', action: 'create', data,
  });

  const firstOperation = operation({
    customer_name: 'Offline idempotency fixture', contact: `O${Date.now()}`, service_ids: [1],
    event_start_datetime: '9095-01-02 10:00:00', event_end_datetime: '9095-01-02 12:00:00',
    event_location: 'Synthetic offline venue', status: 'Pending', agreed_total: '100.00',
  });
  const first = await request('api/sync.php?do=commit', { queue: [firstOperation] });
  assert.equal(first.committed.length, 1, JSON.stringify(first));
  assert.equal(first.conflicts.length, 0, JSON.stringify(first));
  assert.deepEqual(await request('api/sync.php?do=commit', { queue: [firstOperation] }), first);

  const reserved = await request('api/bookings.php?do=create', {
    customer_name: 'Authoritative conflict fixture', contact: `A${Date.now()}`, service_ids: [1],
    event_start_datetime: '9095-01-01 10:00:00', event_end_datetime: '9095-01-01 12:00:00',
    event_location: 'Synthetic online venue', status: 'Confirmed', agreed_total: '100.00',
  }, 201);
  const conflictOperation = operation({
    customer_name: 'Offline conflict fixture', contact: `C${Date.now()}`, service_ids: [1],
    event_start_datetime: '9095-01-01 10:00:00', event_end_datetime: '9095-01-01 12:00:00',
    event_location: 'Synthetic offline venue', status: 'Pending', agreed_total: '100.00',
  });
  const conflict = await request('api/sync.php?do=commit', { queue: [conflictOperation] });
  assert.equal(conflict.committed.length, 0, JSON.stringify(conflict));
  assert.equal(conflict.conflicts.length, 1, JSON.stringify(conflict));
  assert.equal(conflict.conflicts[0].client_id, conflictOperation.client_id);
  assert.ok(conflict.conflicts[0].details.bookings.some(row => Number(row.booking_id) === Number(reserved.booking_id)));
});

test('offline payment replay is rejected without changing the booking', async () => {
  const request = await client();
  const booking = await request('api/bookings.php?do=create', {
    customer_name: 'Online-only payment fixture', contact: `P${Date.now()}`, service_id: 1,
    event_start_datetime: '9095-02-01 10:00:00', event_end_datetime: '9095-02-01 12:00:00',
    event_location: 'Synthetic venue', status: 'Pending', agreed_total: '100.00',
  }, 201);
  const result = await request('api/sync.php?do=commit', { queue: [{
    client_id: `offline-payment-${Date.now()}`, entity: 'payments', action: 'create',
    data: { booking_id: booking.booking_id, amount: '10.00', payment_method: 'Cash' },
  }] });
  assert.equal(result.committed.length, 0);
  assert.equal(result.failed.length, 1);
  assert.match(result.failed[0].reason, /requires an internet connection/);
  assert.equal((await request(`api/payments.php?booking_id=${booking.booking_id}`)).length, 0);
});
