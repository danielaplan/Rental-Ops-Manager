const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const dashboard = fs.readFileSync(path.join(__dirname, '..', 'admin', 'dashboard.html'), 'utf8');
const adminCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'admin.css'), 'utf8');

test('dashboard prioritizes operational totals before trend charts', () => {
  assert.ok(dashboard.indexOf('id="statsRow"') < dashboard.indexOf('id="revenueChart"'));
  assert.ok(dashboard.indexOf('id="upcomingTitle"') < dashboard.indexOf('id="trendsTitle"'));
  assert.match(dashboard, /<section aria-labelledby="overviewTitle"/);
  assert.match(dashboard, /<section aria-labelledby="trendsTitle"/);
  assert.match(dashboard, /<section aria-labelledby="upcomingTitle"/);
});

test('dashboard charts and decorative icons expose suitable accessibility semantics', () => {
  assert.equal((dashboard.match(/<h3 class="panel-title/g) || []).length, 5);
  assert.doesNotMatch(dashboard, /<h5 class="panel-title/);
  for (const id of ['revenueChart', 'statusChart', 'servicesChart']) {
    assert.match(dashboard, new RegExp(`<canvas id="${id}" role="img" aria-label="[^"]+"`));
  }
  assert.match(dashboard, /class="bi \$\{c\.icon\}" aria-hidden="true"/);
});

test('dashboard uses balanced responsive grids without changing its chart surfaces', () => {
  assert.match(dashboard, /class="dashboard-metric-grid" id="statsRow"/);
  assert.match(dashboard, /class="dashboard-analytics-grid"/);
  assert.match(adminCss, /\.dashboard-metric-grid\s*\{[\s\S]*?grid-template-columns: repeat\(20, minmax\(0, 1fr\)\)/);
  assert.match(adminCss, /\.dashboard-analytics-grid\s*\{[\s\S]*?grid-template-columns: repeat\(12, minmax\(0, 1fr\)\)/);
  assert.match(adminCss, /@media \(max-width: 991\.98px\)[\s\S]*?\.dashboard-analytics-grid \{ grid-template-columns: 1fr; \}/);
});

test('inventory attention empty state keeps its status and explanation grouped', () => {
  assert.match(dashboard, /class="dashboard-attention-empty"/);
  assert.match(dashboard, /No inventory issues need attention/);
  assert.match(dashboard, /no damaged, missing, or maintenance items to review/i);
  assert.match(adminCss, /\.dashboard-attention-empty\s*\{[\s\S]*?margin: auto;/);
});
