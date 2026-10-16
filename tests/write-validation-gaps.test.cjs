const assert = require('node:assert/strict');
const { test } = require('node:test');

assert.match(process.env.AKAD_TEST_DB_NAME || '', /^akad_verify_plan_\d+_\d+$/);
const base = process.env.AKAD_TEST_BASE_URL;
assert.match(base || '', /^http:\/\/127\.0\.0\.1:\d+\/$/);

async function client() {
  let token;
  async function request(path, body, status = 200) {
    const response = await fetch(new URL(path, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result.data;
  }
  token = (await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).session_token;
  return request;
}

test('sync rejects non-text deduction reasons atomically and permits a corrected retry', async () => {
  const request = await client();
  const booking = await request('api/bookings.php?do=create', {
    customer_name: 'Validation fixture', contact: 'TEST-VALIDATION', service_id: 1,
    event_start_datetime: '9091-01-01 10:00:00', event_end_datetime: '9091-01-01 12:00:00',
    event_location: 'Synthetic venue', status: 'Pending', agreed_total: '100.00',
  }, 201);
  const operation = {
    client_id: `validation-deposit-${Date.now()}`, entity: 'deposits', action: 'upsert',
    data: { booking_id: booking.booking_id, amount_held: '20.00', deduction_amount: '5.00' },
  };
  for (const reason of [[], {}, true, 123, '   ']) {
    const result = await request('api/sync.php?do=commit', { queue: [{ ...operation, data: { ...operation.data, deduction_reason: reason } }] });
    assert.equal(result.failed.length, 1, JSON.stringify(result));
    assert.equal(result.committed.length, 0);
    assert.equal(await request(`api/deposits.php?booking_id=${booking.booking_id}`), null);
  }
  operation.data.deduction_reason = 'Synthetic cleaning charge';
  const saved = await request('api/sync.php?do=commit', { queue: [operation] });
  assert.equal(saved.failed.length, 0);
  assert.equal(saved.committed[0].data.deductions[0].reason, operation.data.deduction_reason);
  assert.deepEqual(await request('api/sync.php?do=commit', { queue: [operation] }), saved);
});

test('direct and sync history reject invalid booking links without appending rows', async () => {
  const request = await client();
  const path = 'api/itemHistory.php?rental_item_id=1';
  const before = await request(path);
  const data = { rental_item_id: 1, action: 'Updated', qty: 0, condition: 'Good' };
  for (const booking_id of ['bad', 0, -1, 1.5, true, false, [], {}]) {
    await request('api/itemHistory.php?do=create', { ...data, booking_id }, 400);
    const result = await request('api/sync.php?do=commit', { queue: [{
      client_id: `validation-history-${Date.now()}-${JSON.stringify(booking_id)}`,
      entity: 'itemHistory', action: 'create', data: { ...data, booking_id },
    }] });
    assert.equal(result.failed.length, 1, JSON.stringify(result));
    assert.equal(result.committed.length, 0);
  }
  assert.deepEqual(await request(path), before);
  // Inventory-only history legitimately has no booking.
  for (const body of [data, { ...data, booking_id: null }]) {
    assert.equal((await request('api/itemHistory.php?do=create', body, 201)).booking_id, null);
  }
});
