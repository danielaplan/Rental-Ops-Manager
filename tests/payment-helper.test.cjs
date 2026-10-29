const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'js', 'payments.js'), 'utf8');

function loadPaymentsHelper(createPayment) {
  const context = { API: { createPayment, getSyncQueue: () => [], getPayments: async () => [] }, Map, Number, String, Date };
  context.globalThis = context;
  vm.runInNewContext(`${source}\nglobalThis.__paymentsHelper = PaymentsHelper;`, context);
  return context.__paymentsHelper;
}

test('recordPayment supplies a valid local timestamp when the caller omits payment_date', async () => {
  let payload;
  const helper = loadPaymentsHelper(async value => { payload = value; return value; });

  await helper.recordPayment(12, 200, 'GCash', 'Manual booking down payment');

  assert.equal(payload.booking_id, 12);
  assert.equal(payload.amount, 200);
  assert.match(payload.payment_date, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
});

test('recordPayment preserves an explicitly supplied payment_date', async () => {
  let payload;
  const helper = loadPaymentsHelper(async value => { payload = value; return value; });

  await helper.recordPayment(12, 200, 'GCash', '', { payment_date: '2026-10-27 09:00:00' });

  assert.equal(payload.payment_date, '2026-10-27 09:00:00');
});

test('recordPayment rejects excessive precision before calling the API', async () => {
  let calls = 0;
  const helper = loadPaymentsHelper(async value => { calls += 1; return value; });

  assert.equal(await helper.recordPayment(12, '10.001', 'GCash', ''), null);
  assert.equal(calls, 0);
});

test('remaining balance uses integer cents for exact fractional payments', async () => {
  const helper = loadPaymentsHelper(async value => value);
  const pending = new Map();

  assert.equal(await helper.remainingBalance({ id: 12, total: '0.30', amount_paid: '0.10' }, pending), 0.2);
  assert.equal(await helper.paymentStatus({ id: 12, total: '0.30', amount_paid: '0.30' }, pending), 'Fully Paid');
});
