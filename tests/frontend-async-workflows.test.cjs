const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

function harness(file, api = {}) {
  const nodes = new Map(), charts = [], ready = [];
  function node(key) {
    if (!nodes.has(key)) nodes.set(key, { value: '', text: '', html: '', props: {}, data: {} });
    return nodes.get(key);
  }
  function $(key) {
    if (typeof key === 'function') { ready.push(key); return; }
    const target = node(key);
    const chain = {
      length: 1,
      val(value) { if (!arguments.length) return target.value; target.value = value; return this; },
      text(value) { if (!arguments.length) return target.text; target.text = value; return this; },
      html(value) { if (!arguments.length) return target.html; target.html = value; return this; },
      empty() { target.html = ''; return this; },
      append(value) { target.html += value; return this; },
      prop(name, value) { if (arguments.length === 1) return target.props[name]; target.props[name] = value; return this; },
      data(name, value) { if (arguments.length === 1) return target.data[name]; target.data[name] = value; return this; },
      map() { return { get: () => key === '.js-m-service:checked' ? ['SVC-001'] : [] }; },
      on() { return this; }, onAdmin() { return this; }, off() { return this; },
      show() { return this; }, hide() { return this; }, trigger() { return this; },
      toggle() { return this; }, toggleClass() { return this; }, attr() { return this; },
      closest() { return this; }, find() { return this; }, filter() { return this; },
      each() { return this; }, addClass() { return this; }, removeClass() { return this; }
    };
    return chain;
  }
  $.fn = {};
  const alerts = [];
  class Chart {
    constructor(_element, options) { charts.push(options); }
    destroy() {}
    static getChart() { return null; }
  }
  const context = vm.createContext({
    console, $, Chart, Map, Set, Date, Promise, URL,
    API: api,
    adminReady: callback => ready.push(callback),
    initAdminChrome: async () => {},
    showAdminToast() {}, showFieldError() {}, clearFieldError() {},
    escapeHtmlA: value => String(value ?? ''), badgeStatus: value => value,
    CONFIG: { bookingStatusColors: {}, inventoryStatusColors: {}, paymentStatusColors: {} },
    STORAGE_KEYS: { adminSession: 'session' },
    STORAGE: { _get: () => ({ user: { user_id: 1 } }), getAll: () => [] },
    localStorage: { removeItem() {} }, navigator: { onLine: true },
    document: {
      getElementById: id => id === 'adminAsyncError' ? alerts[0] : { getContext: () => ({}) },
      createElement: () => ({ setAttribute() {} }),
      querySelector: () => ({ after: alert => alerts.push(alert) })
    },
    window: { location: { href: '' } },
    bootstrap: { Modal: class { show() {} } },
    BookingCalc: { formatCurrency: Number, formatDate: value => value, formatTime: value => value },
    PaymentsHelper: {
      pendingAmountsByBooking: async () => new Map(),
      acceptedAmountPaid: async booking => Number(booking.amount_paid || 0),
      remainingBalance: async booking => Number(booking.total || 0) - Number(booking.amount_paid || 0),
      paymentStatus: async () => 'Partial'
    }
  });
  function load(name) {
    let source = fs.readFileSync(path.join(root, name), 'utf8');
    if (name.endsWith('.html')) source = [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
      .filter(match => !match[1].includes('src=')).map(match => match[2]).join('\n');
    vm.runInContext(source, context, { filename: name });
  }
  if (file) load(file);
  return { context, node, charts, ready, alerts, load };
}

test('manual booking locks before availability and permits retry after a rejected read', async () => {
  const gate = deferred();
  let checks = 0, creates = 0;
  const h = harness('admin/manual-booking.html', {
    checkAvailability: () => { checks++; return gate.promise; },
    getPackages: async () => [{ package_id: 'PKG-001', price: 500 }], getAddons: async () => [],
    createBooking: async data => { creates++; assert.equal(data.package_id, 'PKG-001'); return { id: 'LOCAL-booking-1' }; },
    savedMessage: () => 'Pending Sync'
  });
  for (const [key, value] of Object.entries({ '#mPackage': 'PKG-001', '#mDate': '2026-10-10', '#mStart': '10:00', '#mEnd': '11:00', '#mCustName': 'Test', '#mCustContact': '123' })) h.node(key).value = value;
  const first = h.context.createManualBooking();
  await h.context.createManualBooking();
  assert.equal(checks, 1);
  assert.equal(h.node('#mSubmitBtn').props.disabled, true);
  gate.reject(new Error('Read unavailable'));
  await first;
  assert.equal(creates, 0);
  assert.equal(h.node('#mSubmitBtn').props.disabled, false);
  assert.equal(h.node('#mCustName').value, 'Test');
  assert.match(h.node('#manualSaveError').text, /Read unavailable/);
  h.context.API.checkAvailability = async () => ({ available: true });
  await h.context.createManualBooking();
  assert.equal(creates, 1);
  await h.context.createManualBooking();
  assert.equal(creates, 1);
});

test('manual initialization populates controls before restoring the saved draft', async () => {
  const gate = deferred(), order = [];
  const h = harness('admin/manual-booking.html', { refreshSharedData: async () => {} });
  h.context.populateForm = async () => { order.push('populate'); await gate.promise; order.push('populated'); };
  h.context.restoreManualDraft = async () => { order.push('restore'); };
  const initialization = h.ready[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(order, ['populate']);
  gate.resolve(); await initialization;
  assert.deepEqual(order, ['populate', 'populated', 'restore']);
});

test('availability ignores an older conflict after a newer date is available', async () => {
  const old = deferred(); let calls = 0;
  const h = harness('admin/manual-booking.html', { checkAvailability: () => ++calls === 1 ? old.promise : Promise.resolve({ available: true }) });
  for (const [key, value] of Object.entries({ '#mDate': '2026-10-10', '#mStart': '10:00', '#mEnd': '11:00' })) h.node(key).value = value;
  const first = h.context.checkAvailability();
  h.node('#mDate').value = '2026-10-11';
  await h.context.checkAvailability();
  old.resolve({ available: false }); await first;
  assert.equal(h.node('#mSubmitBtn').props.disabled, false);
  assert.match(h.node('#mAvailabilityStatus').html, /No conflict/);
});

test('calendar ignores an older month render that resolves last', async () => {
  const old = deferred(); let calls = 0;
  const h = harness('js/calendar.js', { getBookings: () => ++calls === 1 ? old.promise : Promise.resolve([]), getServices: async () => [] });
  const calendar = vm.runInContext('CalendarHelper', h.context);
  const first = calendar.render('#calendar');
  calendar.nextMonth(); await calendar.render('#calendar');
  const expected = h.node('#calendar').html;
  old.resolve([{ id: 1, event_date: '2000-01-01', customer_name: 'Old' }]); await first;
  assert.equal(h.node('#calendar').html, expected);
});

test('report keeps newest filters and renders numeric receipt totals', async () => {
  const old = deferred(); let calls = 0;
  const report = { total_bookings: 1, popular_services: [] };
  const h = harness('admin/reports.html', {
    getReportStats: () => ++calls === 1 ? old.promise : Promise.resolve(report),
    getBookings: async () => [{ id: 1, customer_name: 'Test', event_date: '2026-10-10', total: 500, amount_paid: 200 }],
    getPayments: async () => [], getRentalItems: async () => []
  });
  const first = h.context.renderReport('2020-01-01', '2020-12-31');
  await h.context.renderReport('2026-10-01', '2026-10-31');
  old.resolve(report); await first;
  assert.equal(h.node('#reportRangeLabel').text, '2026-10-01 – 2026-10-31');
  h.context.renderReportReceipt();
  assert.match(h.node('#reportReceiptBody').html, /<td>200<\/td>/);
  assert.doesNotMatch(h.node('#reportReceiptBody').html, /NaN|Promise/);
});

test('dashboard keeps the newest response and charts numeric accepted payments', async () => {
  const old = deferred(); let calls = 0;
  const stats = { total_bookings: 2, upcoming_bookings: [] };
  const h = harness('admin/dashboard.html', {
    getDashboardStats: () => ++calls === 1 ? old.promise : Promise.resolve(stats),
    getServices: async () => [], getRentalItems: async () => [],
    getBookings: async () => [{ id: 1, event_date: '2026-10-10', amount_paid: 200 }]
  });
  const first = h.context.renderDashboard();
  await h.context.renderDashboard();
  old.resolve({ ...stats, total_bookings: 99 }); await first;
  assert.equal(h.charts.length, 3);
  const revenue = h.charts[0].data.datasets[0].data;
  assert.ok(revenue.every(Number.isFinite));
  assert.equal(revenue.reduce((a, b) => a + b, 0), 200);
});

test('admin event boundary prevents repeat writes and reports rejection without clearing input', async () => {
  const gate = deferred(); let writes = 0;
  const h = harness('js/admin.js');
  const button = { id: 'save', disabled: false, matches: selector => selector !== 'form' };
  const handler = h.context.adminEventHandler(async () => { writes++; await gate.promise; });
  const event = { type: 'click', preventDefault() {} };
  const first = handler.call(button, event);
  await handler.call(button, event);
  assert.equal(writes, 1); assert.equal(button.disabled, true);
  gate.reject(new Error('Save rejected')); await first;
  assert.equal(button.disabled, false);
  assert.equal(h.alerts[0].textContent, 'Save rejected');
  assert.equal(h.alerts[0].hidden, false);
});

test('late checklist and payment history reads cannot overwrite another booking', async () => {
  const gate = deferred(); let current = true;
  const h = harness(null, { getBookingItems: () => gate.promise, getPayments: () => gate.promise });
  h.load('js/inventory.js'); h.load('js/payments.js');
  const first = vm.runInContext('InventoryHelper', h.context).renderChecklist(1, '#checklist', 'return', () => current);
  const second = vm.runInContext('PaymentsHelper', h.context).renderHistory(1, '#history', () => current);
  h.node('#checklist').html = 'New booking'; h.node('#history').html = 'New payments';
  current = false; gate.resolve([]); await Promise.all([first, second]);
  assert.equal(h.node('#checklist').html, 'New booking');
  assert.equal(h.node('#history').html, 'New payments');
});

test('booking details retain the newer booking when the older lookup resolves last', async () => {
  const old = deferred(); let shown = 0;
  const h = harness('admin/bookings.html', {
    getBooking: id => id === 1 ? old.promise : Promise.resolve({ id: 2, customer_name: 'New booking', total: 500 }),
    getServices: async () => [], getAddons: async () => [], getPackages: async () => [],
    getDeposit: async id => ({ booking_id: id }), refreshDeposit: async id => ({ booking_id: id }),
    getDelivery: async () => ({}), refreshDelivery: async () => ({}), getSyncQueue: () => []
  });
  h.context.InventoryHelper = { renderChecklist: async () => {} };
  h.context.PaymentsHelper.renderHistory = async () => {};
  h.context.bootstrap.Modal.getOrCreateInstance = () => ({ show: () => shown++ });
  const first = h.context.openBookingDetail(1);
  await h.context.openBookingDetail(2);
  old.resolve({ id: 1, customer_name: 'Old booking' }); await first;
  assert.equal(h.node('#dCustName').text, 'New booking');
  assert.equal(shown, 1);
});

test('a failed down payment does not permit creating the saved booking twice', async () => {
  let creates = 0;
  const h = harness('admin/manual-booking.html', {
    checkAvailability: async () => ({ available: true }),
    getPackages: async () => [{ package_id: 'PKG-001', price: 500 }], getAddons: async () => [],
    createBooking: async () => { creates++; return { id: 'LOCAL-booking-1' }; }
  });
  for (const [key, value] of Object.entries({ '#mPackage': 'PKG-001', '#mDate': '2026-10-10', '#mStart': '10:00', '#mEnd': '11:00', '#mAmountPaid': '100' })) h.node(key).value = value;
  h.context.PaymentsHelper.recordPayment = async () => { throw new Error('Payment failed'); };
  await h.context.createManualBooking();
  await h.context.createManualBooking();
  assert.equal(creates, 1);
  assert.equal(h.node('#mSubmitBtn').props.disabled, true);
  assert.match(h.node('#manualSaveError').html, /initial payment was not recorded/);
});

test('manual synchronization locks immediately and displays rejected refreshes', async () => {
  const gate = deferred(); let refreshes = 0, panel;
  const controls = new Map();
  function element(key) {
    if (!controls.has(key)) controls.set(key, {
      listeners: {}, addEventListener(type, callback) { this.listeners[type] = callback; },
      querySelector: element, after() {}
    });
    return controls.get(key);
  }
  const context = vm.createContext({
    API: { getSyncQueue: () => [], refreshSharedData: () => { refreshes++; return gate.promise; }, flushSyncQueue: async () => {} },
    escapeHtmlA: String, navigator: { onLine: true },
    document: {
      querySelector: selector => selector === '#syncPanel' ? panel : element(selector),
      querySelectorAll: () => [],
      createElement: () => (panel = element('#syncPanel')),
      addEventListener() {}, activeElement: null
    },
    window: { addEventListener() {} }
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/sync-ui.js'), 'utf8'), context);
  context.window.initSyncPanel();
  const first = element('#syncNow').listeners.click();
  await element('#syncNow').listeners.click();
  assert.equal(refreshes, 1);
  assert.equal(element('#syncNow').disabled, true);
  gate.reject(new Error('Refresh unavailable')); await first;
  assert.equal(element('#syncNow').disabled, false);
  assert.equal(element('#syncReadError').hidden, false);
  assert.equal(element('#syncReadError').textContent, 'Refresh unavailable');
});
