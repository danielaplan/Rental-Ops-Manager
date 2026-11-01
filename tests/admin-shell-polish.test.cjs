const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const styles = fs.readFileSync(path.join(root, 'css', 'admin.css'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'admin', 'dashboard.html'), 'utf8');
const bookings = fs.readFileSync(path.join(root, 'admin', 'bookings.html'), 'utf8');

test('admin shell keeps product typography and full branding consistent', () => {
  assert.match(styles, /\.admin-topbar h1\s*\{[^}]*font-family:\s*'Inter'/s);
  assert.match(styles, /\.sidebar-brand-copy \.brand-name\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.doesNotMatch(styles, /-webkit-line-clamp/);
  assert.doesNotMatch(styles, /\.sidebar-brand-copy \.brand-name\s*\{[^}]*text-overflow:\s*ellipsis/s);
});

test('booking totals, states, and actions retain a clear scan hierarchy', () => {
  assert.match(bookings, /class="fw-bold booking-total-cell"/);
  assert.match(bookings, /class="booking-state-cell"/);
  assert.match(bookings, /class="btn btn-sm booking-view-btn js-view-booking"/);
  assert.match(bookings, /aria-label="View booking \$\{escapeHtmlA\(b\.id\)\} details"/);
  assert.match(styles, /\.booking-state-cell \.badge\s*\{[^}]*border-radius:\s*6px/s);
  assert.match(styles, /\.booking-view-btn:focus-visible/);
});

test('admin data surfaces retain scanability without decorative dashboard scaffolding', () => {
  assert.match(styles, /table\.admin-table thead\s*\{[^}]*position:\s*sticky/s);
  assert.match(styles, /font-variant-numeric:\s*tabular-nums/);
  assert.match(styles, /\.booking-table\s*\{[^}]*min-width:\s*980px/s);
  assert.doesNotMatch(dashboard, /dashboard-section-kicker/);
  assert.doesNotMatch(styles, /\.dashboard-stat-card::before/);
});
