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
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            committed: queue.map(operation => ({
              client_id: operation.client_id,
              server_id: operation.action === 'create' ? 42 : undefined
            })),
            conflicts: [],
            failed: []
          }
        })
      };
    }
    const entity = Object.keys(serverRows).find(name => String(url).includes(`/${name}.php`));
    return {
      ok: true,
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

test('writes resolve to a pending local draft and enqueue an authenticated sync operation', async () => {
  const { context } = createHarness();

  const createdPromise = context.API.createService({ name: 'Sweet Corner', description: 'Desserts' });
  assert.equal(typeof createdPromise.then, 'function', 'API.createService() must return a Promise');
  const created = await createdPromise;

  assert.equal(created.pending_sync, true);
  assert.match(created.service_id, /^LOCAL-services-/);

  const queue = context.API.getSyncQueue();
  assert.equal(queue.length, 1);
  assert.equal(queue[0].entity, 'services');
  assert.equal(queue[0].action, 'create');
  assert.equal(queue[0].owner_id, 7);
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

test('item history writes resolve to a pending draft with an addressable queue entry', async () => {
  const { context } = createHarness();

  const created = await context.API.logItemHistory({
    rental_item_id: 'RI-001', booking_id: 'BK-001',
    action: 'Returned', qty: 1, condition: 'Good'
  });

  assert.ok(created, 'API.logItemHistory() must return the local history row');
  assert.equal(created.pending_sync, true);
  assert.match(created.history_id, /^LOCAL-itemHistory-/);
  const operation = context.API.getSyncQueue().find(item => item.entity === 'itemHistory');
  assert.equal(operation.local_id, created.history_id);
});

test('item history reads refresh only the requested item and retain pending history', async () => {
  const { context, requests, collections } = createHarness();
  const pending = await context.API.logItemHistory({
    rental_item_id: 'RI-001', booking_id: 'BK-001',
    action: 'Inspected offline', qty: 1, condition: 'Good'
  });

  const history = await context.API.getItemHistory('RI-001');

  assert.equal(Array.isArray(history), true);
  assert.ok(history.some(row => row.history_id === pending.history_id));
  await settle();

  assert.ok(requests.some(request => request.url.includes('/api/itemHistory.php?do=forItem&rental_item_id=1')));
  assert.ok(collections.itemHistory.some(row => row.rental_item_id === 'RI-002'));
  assert.ok(collections.itemHistory.some(row => row.history_id === pending.history_id && row.pending_sync));
  assert.ok(collections.itemHistory.some(row => row.rental_item_id === 'RI-001' && row.action === 'Returned'));
});

test('release and return side effects enqueue their local item history rows', async () => {
  const { context, collections } = createHarness();

  await context.API.recordRelease('BK-001', 'Owner', 'Released offline');
  await context.API.recordReturn('BK-001', 'Owner', [{
    rental_item_id: 'RI-001', returned_qty: 1, condition: 'Good'
  }], 'Returned offline');

  const histories = collections.itemHistory.filter(row => row.rental_item_id === 'RI-001');
  assert.ok(histories.some(row => row.action === 'Released' && row.pending_sync));
  assert.ok(histories.some(row => row.action === 'Returned' && row.pending_sync));

  const historyOperations = context.API.getSyncQueue().filter(item => item.entity === 'itemHistory');
  assert.equal(historyOperations.length, 2);
  assert.ok(historyOperations.every(item => item.local_id));
  assert.equal(new Set(historyOperations.map(item => item.local_id)).size, 2);
  assert.ok(context.API.getSyncQueue().some(item => item.entity === 'itemReleases'));
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

test('flush removes acknowledged operations and records temporary-to-server ID aliases', async () => {
  const { context, values } = createHarness();
  const created = await context.API.createService({ name: 'Queued service' });

  const result = await context.API.flushSyncQueue();

  assert.equal(result.failed.length, 0);
  assert.equal(context.API.getSyncQueue().length, 0);
  const aliases = JSON.parse(values.get('er_sync_ids'));
  assert.equal(aliases[`services:${created.service_id}`], 42);
});

test('the facade exposes methods required by current pages and the sync UI', () => {
  const { context } = createHarness();
  const required = [
    'getItemHistory', 'getBooking', 'getPaymentsForBooking', 'getSettings',
    'getWebsiteContent', 'refreshSharedData', 'flushSyncQueue', 'savedMessage',
    'getDeposit', 'upsertDeposit', 'getDelivery', 'upsertDelivery', 'finalizeReturn'
  ];

  for (const name of required) {
    assert.equal(typeof context.API[name], 'function', `API.${name} must exist`);
  }
});
