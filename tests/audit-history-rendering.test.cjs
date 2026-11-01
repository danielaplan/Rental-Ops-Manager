const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const page = fs.readFileSync(path.resolve(__dirname, '..', 'admin', 'audit.html'), 'utf8');
const script = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(match => !/\bsrc\s*=/i.test(match[1]))
  .map(match => match[2])
  .join('\n');

function loadHelpers() {
  const escapeHtmlA = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const context = vm.createContext({ adminReady: () => {}, escapeHtmlA, String, Number, Array, Object, JSON });
  vm.runInContext(`${script}\nglobalThis.auditHelpers = { auditActionLabel, renderAuditDate, renderAuditDescription };`, context);
  return context.auditHelpers;
}

test('audit history renders readable labels and deterministic Manila timestamps', () => {
  const helpers = loadHelpers();
  assert.equal(helpers.auditActionLabel('template_create'), 'Template created');
  assert.equal(helpers.auditActionLabel('manual_release'), 'Manual release');
  assert.match(helpers.renderAuditDate('2026-10-30 16:52:30'), /Oct 30, 2026/);
  assert.match(helpers.renderAuditDate('2026-10-30 16:52:30'), /4:52:30 PM/);
});

test('audit history collapses escaped JSON details and preserves plain-text fallbacks', () => {
  const helpers = loadHelpers();
  const details = helpers.renderAuditDescription(JSON.stringify({
    package_id: 23,
    items: [{ item_name: '<script>alert(1)</script>', expected_quantity: 2 }],
    before: null,
    after: 'Active'
  }));
  assert.match(details, /<details class="audit-details">/);
  assert.match(details, /Package id/);
  assert.match(details, /Expected quantity/);
  assert.match(details, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(details, /<script>alert/);
  assert.equal(helpers.renderAuditDescription('Booking created.'), 'Booking created.');
  assert.equal(helpers.renderAuditDescription('{broken'), '{broken');
});
