const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = 'http://127.0.0.1:8036/';

async function request(endpoint, { token, body } = {}) {
  const response = await fetch(new URL(endpoint, base), {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await response.json();
  assert.equal(response.ok, true, `${endpoint}: ${response.status} ${JSON.stringify(json)}`);
  return json.data;
}

(async () => {
  const session = await request('api/auth.php', {
    body: { username: 'juan', password: 'password' },
  });
  const before = await request('api/bookings.php?do=get&id=5', { token: session.session_token });
  assert.equal(before.event_location, 'SYNTHETIC offline venue');
  const updated = await request('api/bookings.php?do=update&id=5', {
    token: session.session_token,
    body: { location: 'SYNTHETIC client B accepted location' },
  });
  assert.equal(updated.event_location, 'SYNTHETIC client B accepted location');
  const evidence = {
    run_at: new Date().toISOString(),
    booking_id: 5,
    second_owner_id: session.user_id,
    before_location: before.event_location,
    accepted_location: updated.event_location,
  };
  fs.writeFileSync(path.join(__dirname, 'w12-second-client-update-2026-10-16.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
