const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function harness(responder) {
  const requests = [];
  const collections = {
    services: [{ service_id: 'SVC-001', name: 'Cached name', image: 'cached.jpg' }]
  };
  const STORAGE_KEYS = { adminSession: 'er_admin_session' };
  const STORAGE = {
    _get(key, fallback) {
      if (key === STORAGE_KEYS.adminSession) return { session_token: 'test-token', user: { user_id: 7 } };
      return fallback;
    },
    getAll(collection) { return collections[collection] || []; }
  };
  const fetch = async (url, options) => {
    const request = { url: String(url), options };
    requests.push(request);
    const answer = responder ? await responder(request) : { data: [] };
    const status = answer.status || 200;
    const body = answer.raw ?? JSON.stringify(answer.envelope || { ok: status < 400, data: answer.data });
    return { ok: status >= 200 && status < 300, status, text: async () => body };
  };
  const context = {
    console,
    URL,
    AbortSignal: { timeout() { return undefined; } },
    fetch,
    STORAGE,
    STORAGE_KEYS,
    document: { currentScript: { src: 'http://localhost/rental/js/api.js' } },
    window: { location: { href: 'http://localhost/rental/index.html' } }
  };
  context.globalThis = context;
  vm.createContext(context);
  const source = fs.readFileSync(path.join(root, 'js', 'api.js'), 'utf8');
  vm.runInContext(`${source}\nglobalThis.API = API;`, context, { filename: 'js/api.js' });
  return { API: context.API, requests };
}

test('reads use the script-relative API base, bearer auth, and frontend normalization', async () => {
  const { API, requests } = harness(() => ({
    data: [{ service_id: 1, service_name: 'Server Karaoke', status: 'Active' }]
  }));

  const services = await API.getServices();

  assert.equal(requests[0].url, 'http://localhost/rental/api/services.php?do=all');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-token');
  assert.deepEqual(
    { id: services[0].service_id, name: services[0].name, image: services[0].image },
    { id: 'SVC-001', name: 'Server Karaoke', image: 'cached.jpg' }
  );
});

test('CRUD writes use PHP action parameters, numeric IDs, and mapped fields', async () => {
  const { API, requests } = harness(request => {
    const url = new URL(request.url);
    if (url.searchParams.get('do') === 'delete') return { data: { deleted: true } };
    return { data: { service_id: 1, service_name: 'Updated', status: 'Active' } };
  });

  await API.createService({ name: 'New service', status: 'Active' });
  await API.updateService('SVC-001', { name: 'Updated' });
  await API.deleteService('SVC-001');

  assert.equal(requests[0].url, 'http://localhost/rental/api/services.php?do=create');
  assert.deepEqual(JSON.parse(requests[0].options.body), { service_name: 'New service', status: 'Active' });
  assert.equal(requests[1].url, 'http://localhost/rental/api/services.php?do=update&id=1');
  assert.deepEqual(JSON.parse(requests[1].options.body), { service_name: 'Updated' });
  assert.equal(requests[2].url, 'http://localhost/rental/api/services.php?do=delete&id=1');
  assert.equal(requests.every(request => request.options.headers.Authorization === 'Bearer test-token'), true);
});

test('special workflows target their actual PHP actions', async () => {
  const { API, requests } = harness(() => ({ data: {} }));

  await API.recordReturn('BK-001', 'Owner', [{ rental_item_id: 'RI-002', returned_qty: 1, condition: 'Good' }], 'Returned');
  await API.finalizeReturn('BK-001');
  await API.upsertDeposit('BK-001', { amount_held: 350, deduction_amount: 50, deduction_reason: 'Cleaning' });
  await API.upsertDelivery('BK-001', { delivery_method: 'lalamove', delivery_fee: 250, fee_shouldered_by: 'owner' });
  await API.getReportStats('2026-10-01', '2026-10-31');

  assert.equal(new URL(requests[0].url).searchParams.get('do'), 'inspect');
  assert.equal(new URL(requests[1].url).searchParams.get('do'), 'finalizeReturn');
  assert.equal(new URL(requests[2].url).searchParams.get('do'), 'upsert');
  assert.equal(new URL(requests[3].url).searchParams.get('do'), 'upsert');
  assert.equal(requests[4].url, 'http://localhost/rental/api/reports.php?do=report&start=2026-10-01&end=2026-10-31');
});

test('non-JSON and API errors produce useful typed errors', async () => {
  const invalid = harness(() => ({ status: 500, raw: '<?php error' }));
  await assert.rejects(invalid.API.getServices(), error => error.code === 'invalid_response' && error.status === 500);

  const rejected = harness(() => ({ status: 409, envelope: { ok: false, error: 'Time slot already booked.', code: 'conflict' } }));
  await assert.rejects(rejected.API.createBooking({}), error => error.code === 'conflict' && error.status === 409);
});
