const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('admin loads a pinned local Lucide bundle and converts existing icon markup', () => {
  const source = read('js/admin-icons.js');
  const vendorPath = path.join(root, 'vendor', 'lucide-1.65.0.min.js');
  const pages = fs.readdirSync(path.join(root, 'admin')).filter(file => file.endsWith('.html'));

  assert.ok(fs.statSync(vendorPath).size > 400000);
  assert.match(source, /const ADMIN_LUCIDE_ICONS = Object\.freeze/);
  assert.match(source, /document\.querySelectorAll\('i\.bi'\)/);
  assert.match(source, /window\.lucide\.createIcons/);
  assert.match(source, /new MutationObserver/);
  pages.forEach(page => {
    const html = read(`admin/${page}`);
    assert.match(html, /vendor\/lucide-1\.65\.0\.min\.js/, `${page} should load Lucide`);
    assert.match(html, /js\/admin-icons\.js\?v=20261031-lucide-v2/, `${page} should load the adapter`);
  });
});

test('offline shell includes the pinned Lucide asset', () => {
  const serviceWorker = read('sw.js');
  assert.match(serviceWorker, /akad-shell-20261031-lucide-admin-icons-v2/);
  assert.match(serviceWorker, /vendor\/lucide-1\.65\.0\.min\.js/);
  assert.match(serviceWorker, /js\/admin-icons\.js/);
});
