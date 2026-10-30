const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function createHarness() {
  const values = new Map();
  const requests = [];
  const collections = {
    services: [{
      service_id: 'SVC-001', name: 'Karaoke Rental', status: 'Active',
      image: 'cached-service.jpg'
    }],
    bookingItems: [
      { booking_item_id: 'BI-001', booking_id: 'BK-001', rental_item_id: 'RI-001', name: 'Speaker' },
      { booking_item_id: 'BI-002', booking_id: 'BK-002', rental_item_id: 'RI-002', name: 'Microphone' }
    ],
    bookings: [],
    categories: [],
    addons: [],
    customers: [],
    payments: [],
    rentalItems: [],
    gallery: [],
    packages: [],
    deposits: [],
    delivery: [],
    itemReleases: [],
    itemHistory: [
      { history_id: 'HIST-002', rental_item_id: 'RI-002', action: 'Adjusted' }
    ]
  };

  const session = {
    session_token: 'test-token',
    user: { user_id: 7, role: 'owner' }
  };

  const localStorage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };

  const STORAGE_KEYS = {
    services: 'er_services', categories: 'er_categories', addons: 'er_addons',
    bookings: 'er_bookings', bookingItems: 'er_booking_items', customers: 'er_customers',
    payments: 'er_payments', packages: 'er_packages', deposits: 'er_deposits',
    delivery: 'er_delivery', gallery: 'er_gallery', rentalItems: 'er_rental_items',
    itemReleases: 'er_item_releases', itemHistory: 'er_item_history',
    websiteContent: 'er_website_content', settings: 'er_settings',
    adminSession: 'er_admin_session'
  };

  const STORAGE = {
    memory: collections,
    _get(key, fallback) {
      if (key === STORAGE_KEYS.adminSession) return session;
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    },
    _set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    },
    getAll(collection) { return collections[collection] || []; },
    saveAll(collection, rows) { collections[collection] = rows; this.memory[collection] = rows; return true; },
    setOne(collection, value) { collections[collection] = value; return true; },
    nextId(prefix, rows) { return prefix + String(rows.length + 1).padStart(3, '0'); },
    nextBookingId() { return 'BK-2026-0001'; },
    restoreCache() { return Promise.resolve(); },
    saveCache() { return Promise.resolve(); }
  };

  const serverRows = {
    services: [{ service_id: 1, service_name: 'Karaoke Rental', status: 'Active' }],
    bookingItems: [{
      booking_item_id: 1, booking_id: 1, rental_item_id: 1,
      service_id: 1, name: 'Speaker'
    }],
    itemHistory: [{
      history_id: 1, rental_item_id: 1, booking_id: 1,
      action: 'Returned', qty: 1, condition: 'Good'
    }]
  };

  const fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('/api/sync.php')) {
      const queue = JSON.parse(options.body).queue;
      const failed = queue.filter(operation => operation.entity === 'payments' && String(operation.data.amount) === '13.37');
      const accepted = queue.filter(operation => !failed.includes(operation));
      const acknowledgementData = new Map();
      for (const operation of accepted) {
        if (operation.entity === 'bookings' && operation.action === 'create') {
          serverRows.bookings = [{ ...operation.data, booking_id: 42, id: 42, agreed_total: operation.data.agreed_total || operation.data.total || 100, completed_payments: 0 }];
        }
        if (operation.entity === 'payments' && operation.action === 'create') {
          serverRows.payments = [{ ...operation.data, payment_id: 84, booking_id: 42, payment_method: operation.data.payment_method || operation.data.method }];
        }
        if (operation.entity === 'deposits') {
          if (operation.action === 'upsert') serverRows.deposits = [{ ...operation.data, deposit_id: 9, refund_status: 'Held', refund_date: null, deductions: [], deduction_amount: 0, refund_amount: Number(operation.data.amount_held) }];
          if (operation.action === 'deduct') {
            const deposit = serverRows.deposits[0];
            deposit.deductions.push({ deduction_id: 10, affected_item: operation.data.affected_item, reason: operation.data.reason, amount: Number(operation.data.amount) });
            deposit.deduction_amount += Number(operation.data.amount);
            deposit.refund_amount = Number(deposit.amount_held) - deposit.deduction_amount;
          }
          if (operation.action === 'refund') Object.assign(serverRows.deposits[0], { refund_status: 'Refunded', refund_date: '2026-10-29 12:00:00' });
          acknowledgementData.set(operation.client_id, JSON.parse(JSON.stringify(serverRows.deposits[0])));
        }
      }
      return {
        ok: true,
        text: async () => JSON.stringify({
          ok: true,
          data: {
            committed: accepted.map(operation => ({
              client_id: operation.client_id,
              server_id: operation.action === 'create' ? (operation.entity === 'payments' ? 84 : 42) : undefined,
              data: acknowledgementData.get(operation.client_id)
            })),
            conflicts: [],
            failed: failed.map(operation => ({ client_id: operation.client_id, reason: 'Synthetic rejected payment amount.' }))
          }
        }),
        json: async () => ({
          ok: true,
          data: {
            committed: accepted.map(operation => ({
              client_id: operation.client_id,
              server_id: operation.action === 'create' ? (operation.entity === 'payments' ? 84 : 42) : undefined,
              data: acknowledgementData.get(operation.client_id)
            })),
            conflicts: [],
            failed: failed.map(operation => ({ client_id: operation.client_id, reason: 'Synthetic rejected payment amount.' }))
          }
        })
      };
    }
    const entity = Object.keys(serverRows).find(name => String(url).includes(`/${name}.php`));
    return {
      ok: true,
      text: async () => JSON.stringify({ ok: true, data: entity ? serverRows[entity] : [] }),
      json: async () => ({ ok: true, data: entity ? serverRows[entity] : [] })
    };
  };

  let uuidSequence = 0;
  const context = {
    console,
    URL,
    Promise,
    Map,
    Set,
    Date,
    JSON,
    Number,
    String,
    Array,
    Object,
    Error,
    TextEncoder,
    AbortSignal: { timeout() { return undefined; } },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    structuredClone: global.structuredClone,
    crypto: { randomUUID: () => `uuid-${++uuidSequence}` },
    localStorage,
    STORAGE,
    STORAGE_KEYS,
    fetch,
    navigator: { onLine: true },
    document: { currentScript: { src: 'http://localhost/js/sync.js' }, hidden: false },
    window: {
      dispatchEvent() {},
      addEventListener() {},
      setTimeout() {},
      setInterval() {}
    }
  };
  context.globalThis = context;
  vm.createContext(context);

  const apiSource = fs.readFileSync(path.join(root, 'js', 'api.js'), 'utf8');
  vm.runInContext(`${apiSource}\nglobalThis.API = API;`, context, { filename: 'js/api.js' });
  const syncSource = fs.readFileSync(path.join(root, 'js', 'sync.js'), 'utf8');
  vm.runInContext(syncSource, context, { filename: 'js/sync.js' });

  return { context, requests, collections, values };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

test('cached reads resolve through the async facade while sync.js refreshes with bearer auth', async () => {
  const { context, requests } = createHarness();

  const servicesPromise = context.API.getServices();
  assert.equal(typeof servicesPromise.then, 'function', 'API.getServices() must return a Promise');
  const services = await servicesPromise;

  assert.equal(Array.isArray(services), true);
  assert.equal(services[0].service_id, 'SVC-001');
  await settle();

  const refresh = requests.find(request => request.url.includes('/api/services.php?do=all'));
  assert.ok(refresh, 'sync.js should refresh services from the PHP endpoint');
  assert.equal(refresh.options.headers.Authorization, 'Bearer test-token');
});

test('server refresh preserves cached presentation fields that PHP does not store', async () => {
  const { context, collections } = createHarness();

  await context.API.getServices();

  assert.equal(collections.services[0].name, 'Karaoke Rental');
  assert.equal(collections.services[0].image, 'cached-service.jpg');
});

test('catalog writes require an internet connection and never enter the offline queue', async () => {
  const { context } = createHarness();
  context.navigator.onLine = false;

  await assert.rejects(context.API.createService({ name: 'Sweet Corner' }), /requires an internet connection/);
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('oversized booking text is rejected before creating a local draft or sync operation', async () => {
  const { context, collections } = createHarness();

  await assert.rejects(
    context.API.createBooking({
      customer_name: 'G'.repeat(101), contact: '0'.repeat(21),
      email: 'test@example.com', location: 'L'.repeat(256)
    }),
    /Customer name must be at most 100 characters/
  );

  assert.equal(collections.bookings.length, 0);
  assert.equal(collections.customers.length, 0);
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('booking edits require an internet connection and do not mutate cached pricing', async () => {
  const { context, collections } = createHarness();
  collections.bookings.push({
    id: 'BK-001', service_id: 1, service_ids: ['SVC-001'], package_id: 'PKG-001', addon_ids: ['ADD-001'],
    discount: 10, fees: 5, agreed_total: 495, status: 'Pending'
  });

  context.navigator.onLine = false;
  await assert.rejects(context.API.updateBooking('BK-001', {
    package_id: 'PKG-001', addon_ids: ['ADD-001'], discount: 20, fees: 5, agreed_total: 485
  }), /requires an internet connection/);
  assert.equal(collections.bookings[0].agreed_total, 495);
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('booking-scoped reads return cached rows and request the matching server collection', async () => {
  const { context, requests, collections } = createHarness();

  const items = await context.API.getBookingItems('BK-001');

  assert.equal(Array.isArray(items), true);
  assert.equal(items.length, 1);
  await settle();
  assert.ok(requests.some(request => request.url.includes('/api/bookingItems.php?do=forBooking&booking_id=1')));
  assert.ok(
    collections.bookingItems.some(item => item.booking_id === 'BK-002'),
    'refreshing one booking must not delete another booking\'s cached checklist'
  );
});

test('inventory history writes require an internet connection', async () => {
  const { context } = createHarness();
  context.navigator.onLine = false;

  await assert.rejects(context.API.logItemHistory({
    rental_item_id: 'RI-001', booking_id: 'BK-001',
    action: 'Returned', qty: 1, condition: 'Good'
  }), /requires an internet connection/);
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('item history reads still refresh the requested item', async () => {
  const { context, requests, collections } = createHarness();
  const history = await context.API.getItemHistory('RI-001');

  assert.equal(Array.isArray(history), true);
  await settle();

  assert.ok(requests.some(request => request.url.includes('/api/itemHistory.php?do=forItem&rental_item_id=1')));
  assert.ok(collections.itemHistory.some(row => row.rental_item_id === 'RI-002'));
  assert.ok(collections.itemHistory.some(row => row.rental_item_id === 'RI-001' && row.action === 'Returned'));
});

test('release requires internet while return inspection remains an offline draft', async () => {
  const { context } = createHarness();
  context.navigator.onLine = false;

  await assert.rejects(context.API.recordRelease('BK-001', 'Owner', 'Released offline'), /requires an internet connection/);
  await context.API.recordReturn('BK-001', 'Owner', [{
    booking_item_id: 'BI-001', rental_item_id: 'RI-001', returned_qty: 1, condition: 'Good'
  }], 'Returned offline');

  assert.equal(context.API.getSyncQueue().some(item => item.entity === 'itemReleases'), false);
  assert.ok(context.API.getSyncQueue().some(item => item.entity === 'equipment' && item.action === 'inspect'));
});

test('shared refresh includes every unscoped admin collection', async () => {
  const { context, requests } = createHarness();

  await context.API.refreshSharedData();

  for (const entity of [
    'services', 'categories', 'addons', 'rentalItems', 'bookings',
    'payments', 'customers', 'gallery', 'packages'
  ]) {
    assert.ok(
      requests.some(request => request.url.includes(`/api/${entity}.php?do=all`)),
      `refreshSharedData() must refresh ${entity}`
    );
  }
});

test('flush removes an acknowledged booking draft and records its server ID alias', async () => {
  const { context, values } = createHarness();
  const created = await context.API.createBooking({ customer_name: 'Queued booking', contact: 'TEST', service_id: 1 });

  const result = await context.API.flushSyncQueue();

  assert.equal(result.failed.length, 0);
  assert.equal(context.API.getSyncQueue().length, 0);
  const aliases = JSON.parse(values.get('er_sync_ids'));
  assert.equal(aliases[`bookings:${created.id}`], 42);
});

test('payments never enter the offline recovery queue', async () => {
  const { context } = createHarness();
  context.navigator.onLine = false;
  await assert.rejects(context.API.createPayment({ booking_id: 42, amount: 25, method: 'GCash' }), /requires an internet connection/);
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('the facade exposes methods required by current pages and the sync UI', () => {
  const { context } = createHarness();
  const required = [
    'getItemHistory', 'getBooking', 'getPaymentsForBooking', 'getSettings',
    'getWebsiteContent', 'refreshSharedData', 'flushSyncQueue', 'savedMessage',
    'requestBookingCancellation',
    'getDeposit', 'upsertDeposit', 'getDelivery', 'upsertDelivery', 'finalizeReturn'
  ];

  for (const name of required) {
    assert.equal(typeof context.API[name], 'function', `API.${name} must exist`);
  }
});

test('booking cancellation requires internet and leaves the cached booking unchanged', async () => {
  const { context, collections } = createHarness();
  collections.bookings.push({
    id: 'BK-001',
    status: 'Confirmed',
    pending_sync: false
  });
  context.navigator.onLine = false;

  await assert.rejects(context.API.requestBookingCancellation(
    'BK-001',
    'Customer requested cancellation'
  ), /requires an internet connection/);
  assert.equal(collections.bookings[0].status, 'Confirmed');
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('pending offline payments remain keyed by the exact local booking ID', async () => {
  const paymentsSource = fs.readFileSync(path.join(root, 'js', 'payments.js'), 'utf8');
  const pendingBookingId = 'LOCAL-bookings-uuid-123';
  const context = vm.createContext({
    API: {
      getSyncQueue: () => [{
        entity: 'payments',
        action: 'create',
        status: 'pending',
        data: { booking_id: pendingBookingId, amount: 250 }
      }],
      getPayments: async () => []
    },
    Map, Number, String, Math, Promise
  });
  vm.runInContext(`${paymentsSource}\nglobalThis.PaymentsHelper = PaymentsHelper;`, context);

  const pending = await context.PaymentsHelper.pendingAmountsByBooking();
  const accepted = await context.PaymentsHelper.acceptedAmountPaid(
    { id: pendingBookingId, amount_paid: 250 },
    pending
  );
  const outstanding = await context.PaymentsHelper.totalOutstanding([
    { id: 'active', status: 'Confirmed', total: 1000, amount_paid: 600 },
    { id: 'cancelled', status: 'Cancelled', total: 2000, amount_paid: 0 },
    { id: 'paid', status: 'Completed', total: 500, amount_paid: 500 },
  ], new Map());

  assert.equal(pending.get(pendingBookingId), 250);
  assert.equal(accepted, 0, 'queued local payments must not count as server-accepted revenue');
  assert.equal(outstanding, 400, 'cancelled bookings must not contribute to outstanding balances');
});

test('offline payment attempts do not mutate accepted booking totals', async () => {
  const { context, collections } = createHarness();
  collections.bookings.push({ id: 'BK-001', total: 500, amount_paid: 100, payment_status: 'Partially Paid' });
  collections.payments.push({ payment_id: 'PAY-001', booking_id: 'BK-001', amount: 100, method: 'GCash', payment_method: 'GCash', payment_status: 'Completed', payment_date: '2026-10-20 12:00:00' });
  context.navigator.onLine = false;

  await assert.rejects(context.API.createPayment({ booking_id: 'BK-001', amount: 50, method: 'GCash' }), /requires an internet connection/);
  assert.equal(collections.bookings[0].amount_paid, 100);
  assert.equal(collections.bookings[0].payment_status, 'Partially Paid');
});

test('deposit changes require internet and never enter the offline queue', async () => {
  const { context } = createHarness();
  context.navigator.onLine = false;

  await assert.rejects(context.API.upsertDeposit('BK-001', { amount_held: 350 }), /requires an internet connection/);
  await assert.rejects(context.API.addDepositDeduction('BK-001', { affected_item: 'Table cloth', reason: 'Stain', amount: 50 }), /requires an internet connection/);
  await assert.rejects(context.API.refundDeposit('BK-001'), /requires an internet connection/);
  assert.equal(context.API.getSyncQueue().length, 0);
});

test('delivery and final return approval require internet', async () => {
  const { context } = createHarness();
  context.navigator.onLine = false;

  await assert.rejects(context.API.upsertDelivery('BK-001', { delivery_method: 'self_pickup', delivery_fee: 0, fee_shouldered_by: 'renter' }), /requires an internet connection/);
  await assert.rejects(context.API.finalizeReturn('BK-001'), /requires an internet connection/);
  assert.equal(context.API.getSyncQueue().length, 0);
});
