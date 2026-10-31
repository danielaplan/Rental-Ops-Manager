const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const styles = fs.readFileSync(path.join(root, 'css', 'admin.css'), 'utf8');
const adminPages = fs.readdirSync(path.join(root, 'admin')).filter(file => file.endsWith('.html'));
const readPage = file => fs.readFileSync(path.join(root, 'admin', file), 'utf8');

test('shared admin typography keeps functional text readable', () => {
  assert.match(styles, /body\.admin-body\s*\{[^}]*font-size:\s*1rem[^}]*line-height:\s*1\.55/s);
  assert.match(styles, /\.admin-body \.form-label\s*\{[^}]*font-size:\s*\.94rem/s);
  assert.match(styles, /\.admin-body \.form-text\s*\{[^}]*font-size:\s*\.875rem/s);
  assert.match(styles, /table\.admin-table\s*\{[^}]*font-size:\s*0\.925rem/s);
  assert.match(styles, /\.admin-body \.badge\s*\{[^}]*font-size:\s*\.78rem/s);
  assert.doesNotMatch(styles, /font-size:\s*(?:8px|9px|10px|\.65rem)/);
});

test('all admin pages receive the versioned readability stylesheet', () => {
  adminPages.forEach(file => {
    assert.match(readPage(file), /css\/admin\.css\?v=20261031-readability-v1/, file);
  });
});

test('admin dialogs and workflow sections use navigable heading levels', () => {
  adminPages.forEach(file => assert.doesNotMatch(readPage(file), /<h5 class="modal-title/, file));
  assert.doesNotMatch(readPage('manual-booking.html'), /<h6 class="manual-section-title/);
  assert.match(readPage('manual-booking.html'), /<h2 class="manual-section-title">1\. Customer Details<\/h2>/);
});
