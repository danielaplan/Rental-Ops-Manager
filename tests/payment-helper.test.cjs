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
