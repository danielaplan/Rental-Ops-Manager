const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const database = process.env.AKAD_TEST_DB_NAME || '';
const base = process.env.AKAD_TEST_BASE_URL || '';
assert.match(database, /^akad_verify_plan_\d+_\d+$/);
assert.match(base, /^http:\/\/127\.0\.0\.1:\d+\/$/);

function sql(statement) {
  const result = spawnSync(process.env.AKAD_TEST_MYSQL || 'C:/xampp/mysql/bin/mysql.exe', [
    '--host', process.env.AKAD_DB_HOST || 'localhost', '--port', process.env.AKAD_DB_PORT || '3306', '--user', process.env.AKAD_DB_USER || 'root',
    '--batch', '--skip-column-names', database,
  ], { input: statement, encoding: 'utf8', windowsHide: true,
    env: { ...process.env, MYSQL_PWD: process.env.AKAD_DB_PASS || '' } });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
async function client() {
  let token;
  async function request(path, body, expected = 200) {
    const response = await fetch(new URL(path, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.equal(response.status, expected, JSON.stringify(result));
    return result;
  }
  token = (await request('api/auth.php', { contact_number: 'TEST-OWNER', password: 'OfflineTest!2026' })).data.session_token;
  return request;
}

test('direct and offline rental deletion retain every historical item link', async () => {
  const request = await client();
  const booking = (await request('api/bookings.php?do=create', {
    customer_name: 'History fixture', contact: 'TEST-HISTORY', service_id: 1,
    event_start_datetime: '9092-01-01 10:00:00', event_end_datetime: '9092-01-01 12:00:00',
    event_location: 'Synthetic venue', status: 'Pending', agreed_total: '100.00',
  }, 201)).data;
  const bid = Number(booking.booking_id);
  for (const table of ['item_history', 'equipment_checklist', 'booking_items', 'booking_checklist_items']) {
    const item = (await request('api/rentalItems.php?do=create', { service_id: 1, name: `Retained ${table}` }, 201)).data;
    const id = Number(item.rental_item_id);
    const nameField = { item_history: 'action', equipment_checklist: 'item_name', booking_items: 'name', booking_checklist_items: 'item_name_snapshot' }[table];
    sql(`INSERT INTO ${table}(${nameField},booking_id,rental_item_id) VALUES('Historical fixture',${bid},${id});`);
    const before = sql(`SELECT * FROM ${table} WHERE rental_item_id=${id};`);
    const rejected = await request(`api/rentalItems.php?do=delete&id=${id}`, {}, 409);
    assert.equal(rejected.code, 'history_retained');
    const operation = { client_id: `retain-${table}-${Date.now()}`, entity: 'rentalItems', action: 'delete', data: { id } };
    for (let retry = 0; retry < 2; retry++) {
      const result = (await request('api/sync.php?do=commit', { queue: [operation] })).data;
      assert.equal(result.committed.length, 0);
      assert.equal(result.failed.length, 1);
      assert.match(result.failed[0].reason, /requires an internet connection/i);
    }
    assert.deepEqual((await request(`api/rentalItems.php?do=get&id=${id}`)).data, item);
    assert.equal(sql(`SELECT * FROM ${table} WHERE rental_item_id=${id};`), before);
    assert.equal(sql(`SELECT COUNT(*) FROM audit_logs WHERE record_type='rental_items' AND record_id=${id} AND action='delete';`), '0');
  }
  for (const mode of ['direct']) {
    const id = (await request('api/rentalItems.php?do=create', { service_id: 1, name: 'Unused item' }, 201)).data.rental_item_id;
    if (mode === 'direct') await request(`api/rentalItems.php?do=delete&id=${id}`, {});
    else {
      const operation = { client_id: `unused-${Date.now()}`, entity: 'rentalItems', action: 'delete', data: { id } };
      const first = await request('api/sync.php?do=commit', { queue: [operation] });
      assert.equal(first.data.committed.length, 1);
      assert.deepEqual(await request('api/sync.php?do=commit', { queue: [operation] }), first);
    }
    await request(`api/rentalItems.php?do=get&id=${id}`, undefined, 404);
  }
});

test('template validation rejects malformed text and quantities without partial writes', async () => {
  const request = await client();
  const pid = (await request('api/packages.php?do=create', { service_id: 1, package_name: 'Template validation fixture', price: '10.00' }, 201)).data.package_id;
  const valid = { package_id: pid, template_name: 'Valid template', items: [{ item_name: 'Speaker', expected_quantity: 1 }] };
  const invalid = [
    ...[[], {}, true, 7, ' ', 'X'.repeat(151)].map(template_name => ({ ...valid, template_name })),
    ...[[], {}, true, 7, ' ', 'X'.repeat(101)].map(item_name => ({ ...valid, items: [{ item_name, expected_quantity: 1 }] })),
    ...[true, false, -1, 1.5, 4294967296].map(expected_quantity => ({ ...valid, items: [{ item_name: 'Speaker', expected_quantity }] })),
    { ...valid, items: { first: valid.items[0] } },
    { ...valid, items: [valid.items[0], { item_name: [], expected_quantity: 1 }] },
  ];
  for (const body of invalid) {
    await request('api/checklistTemplates.php?do=create', body, 400);
    assert.equal(sql(`SELECT COUNT(*) FROM checklist_templates WHERE package_id=${Number(pid)};`), '0');
  }
  const saved = (await request('api/checklistTemplates.php?do=create', valid)).data;
  await request(`api/checklistTemplates.php?do=update&id=${saved.template_id}`, { template_name: [] }, 400);
  const retained = (await request(`api/checklistTemplates.php?id=${saved.template_id}`)).data;
  assert.equal(retained.template_name, valid.template_name);
  assert.equal(retained.items.length, 1);
  assert.equal(retained.items[0].item_name, 'Speaker');
});
