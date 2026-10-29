const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function harness(responder) {
  const requests = [];
  class FormData {
    constructor() { this.fields = []; }
    append(name, value) { this.fields.push([name, value]); }
  }
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
    FormData,
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

test('direct customer summaries associate bookings by customer ID instead of shared phone', async () => {
  const { API } = harness(request => {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/customers.php')) return { data: [
      { customer_id: 1, full_name: 'Customer One', contact_number: '0917-SHARED' },
      { customer_id: 2, full_name: 'Customer Two', contact_number: '0917-SHARED' }
    ] };
    if (url.pathname.endsWith('/bookings.php')) return { data: [
      { booking_id: 10, customer_id: 1, customer_name: 'Customer One', contact: '0917-SHARED', amount_paid: 25 },
      { booking_id: 20, customer_id: 2, customer_name: 'Customer Two', contact: '0917-SHARED', amount_paid: 80 }
    ] };
    return { data: [] };
  });

  const summaries = await API.getCustomers();

  assert.deepEqual(JSON.parse(JSON.stringify(summaries.map(customer => [customer.name, customer.bookings_count, customer.total_spent]))), [
    ['Customer One', 1, 25],
    ['Customer Two', 1, 80]
  ]);
});

test('customer upsert uses an explicit customer ID and never selects by phone', async () => {
  const { API, requests } = harness(() => ({ data: { customer_id: 2, full_name: 'Customer Two', contact_number: '0917-SHARED' } }));

  await API.upsertCustomerFromBooking({ customer_id: 'CUS-002', customer_name: 'Customer Two', contact: '0917-SHARED' });
  await API.upsertCustomerFromBooking({ customer_name: 'New Customer', contact: '0917-SHARED' });

  assert.equal(requests[0].url, 'http://localhost/rental/api/customers.php?do=update&id=2');
  assert.equal(requests[1].url, 'http://localhost/rental/api/customers.php?do=create');
  assert.equal(requests.some(request => request.url.includes('do=search')), false);
});

test('special workflows target their actual PHP actions', async () => {
  const { API, requests } = harness(() => ({ data: {} }));

  await API.recordReturn('BK-001', 'Owner', [{ rental_item_id: 'RI-002', returned_qty: 1, condition: 'Good' }], 'Returned');
  await API.finalizeReturn('BK-001');
  await API.upsertDeposit('BK-001', { amount_held: 350, deduction_amount: 50, deduction_reason: 'Cleaning' });
  await API.upsertDelivery('BK-001', { delivery_method: 'lalamove', delivery_fee: 250, fee_shouldered_by: 'owner' });
  await API.updatePayment('PAY-003', { amount: 125, correction_reason: 'Correct receipt' });
  await API.getReportStats('2026-10-01', '2026-10-31');

  assert.equal(new URL(requests[0].url).searchParams.get('do'), 'inspect');
  assert.equal(new URL(requests[1].url).searchParams.get('do'), 'finalizeReturn');
  assert.equal(new URL(requests[2].url).searchParams.get('do'), 'upsert');
  assert.equal(new URL(requests[3].url).searchParams.get('do'), 'upsert');
  assert.equal(requests[4].url, 'http://localhost/rental/api/payments.php?do=update&id=3');
  assert.deepEqual(JSON.parse(requests[4].options.body), { amount: 125, correction_reason: 'Correct receipt' });
  assert.equal(requests[5].url, 'http://localhost/rental/api/reports.php?do=report&start=2026-10-01&end=2026-10-31');
});

test('gallery image uploads use authenticated multipart form data', async () => {
  const file = { name: 'party.webp', type: 'image/webp' };
  const { API, requests } = harness(() => ({ data: '/rental/uploads/gallery/saved.webp' }));

  const image = await API.uploadGalleryImage(file);

  assert.equal(image, '/rental/uploads/gallery/saved.webp');
  assert.equal(requests[0].url, 'http://localhost/rental/api/gallery-upload.php');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-token');
  assert.equal(requests[0].options.headers['Content-Type'], undefined);
  assert.deepEqual(requests[0].options.body.fields, [['image', file]]);
});

test('non-JSON and API errors produce useful typed errors', async () => {
  const invalid = harness(() => ({ status: 500, raw: '<?php error' }));
  await assert.rejects(invalid.API.getServices(), error => error.code === 'invalid_response' && error.status === 500);

  const rejected = harness(() => ({ status: 409, envelope: { ok: false, error: 'Time slot already booked.', code: 'conflict' } }));
  await assert.rejects(rejected.API.createBooking({}), error => error.code === 'conflict' && error.status === 409);
});
