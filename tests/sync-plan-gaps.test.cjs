const assert = require('node:assert/strict');
const { test } = require('node:test');

const database = process.env.AKAD_TEST_DB_NAME;
const base = process.env.AKAD_TEST_BASE_URL;

test('offline replay accepts recovery drafts and rejects authoritative operations', {
  skip: !database || !base ? 'Use tests/run_revised_backend.cjs for an isolated synthetic target.' : false,
}, async () => {
  assert.match(database, /^akad_verify_plan_[a-zA-Z0-9_]+$/);
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));

  let token;
  let sequence = 0;
  async function request(endpoint, body) {
    const response = await fetch(new URL(endpoint, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.equal(response.ok, true, JSON.stringify(result));
    return result.data;
  }
  const commit = (entity, action, data) => request('api/sync.php?do=commit', {
    queue: [{ client_id: `limited-sync-${Date.now()}-${++sequence}`, entity, action, data }],
  });

  token = (await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).session_token;

  const booking = await commit('bookings', 'create', {
    customer_name: 'Limited offline fixture', contact: `L${Date.now()}`, service_ids: [1],
    event_start_datetime: '9088-04-01 10:00:00', event_end_datetime: '9088-04-01 12:00:00',
    event_location: 'Synthetic venue', status: 'Pending', agreed_total: '100.00',
  });
  assert.equal(booking.committed.length, 1, JSON.stringify(booking));
  assert.equal(booking.failed.length, 0, JSON.stringify(booking));

  for (const [entity, action, data] of [
    ['bookings', 'update', { id: booking.committed[0].server_id, status: 'Confirmed' }],
    ['bookings', 'delete', { id: booking.committed[0].server_id, cancellation_reason: 'Synthetic' }],
    ['payments', 'create', { booking_id: booking.committed[0].server_id, amount: '10.00' }],
    ['deposits', 'upsert', { booking_id: booking.committed[0].server_id, amount_held: '10.00' }],
    ['delivery', 'upsert', { booking_id: booking.committed[0].server_id, delivery_method: 'self_pickup', delivery_fee: 0, fee_shouldered_by: 'Customer' }],
    ['equipment', 'finalizeReturn', { booking_id: booking.committed[0].server_id }],
    ['services', 'create', { service_name: 'Must stay online' }],
    ['settings', 'update', { business_name: 'Must stay online' }],
  ]) {
    const result = await commit(entity, action, data);
    assert.equal(result.committed.length, 0, `${entity}/${action} was incorrectly accepted`);
    assert.equal(result.conflicts.length, 0, JSON.stringify(result));
    assert.equal(result.failed.length, 1, JSON.stringify(result));
    assert.match(result.failed[0].reason, /requires an internet connection/);
  }

  const saved = await request(`api/bookings.php?do=get&id=${booking.committed[0].server_id}`);
  assert.equal(saved.status, 'Pending');
});
