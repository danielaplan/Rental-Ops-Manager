const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('shared admin image previews can cancel replacements or clear saved images', () => {
  const source = read('js/admin.js');

  assert.match(source, /const cancelLabel = hasPendingImageChange \? 'Cancel image change' : 'Remove image'/);
  assert.match(source, /input\.value = wasPendingChange \? previousValue : ''/);
  assert.match(source, /Save the form to publish the removal/);
});

test('gallery cards expose a top-right confirmed image deletion control', () => {
  const gallery = read('admin/gallery.html');
  const styles = read('css/admin.css');

  assert.match(gallery, /gallery-admin-remove js-delete-img/);
  assert.match(gallery, /confirmDelete\('Delete this gallery image\?'/);
  assert.match(styles, /\.gallery-admin-card\s*\{[^}]*position:\s*relative/s);
  assert.match(styles, /\.gallery-admin-remove\s*\{[^}]*top:\s*8px;[^}]*right:\s*8px/s);
});

test('admin sidebar stays fully visible without a desktop collapse control', () => {
  const source = read('js/admin.js');
  const styles = read('css/admin.css');

  assert.doesNotMatch(source, /bindAdminSidebarSizeToggle|toggleAdminSidebarSize|akad_admin_sidebar_expanded/);
  assert.doesNotMatch(styles, /admin-sidebar-edge-toggle|admin-sidebar-collapsed-w|admin-sidebar-expanded/);
  assert.match(styles, /\.admin-sidebar\s*\{[^}]*width:\s*var\(--a-sidebar-w\)/s);
  assert.match(styles, /\.admin-main\s*\{[^}]*margin-left:\s*calc\(var\(--a-sidebar-w\)/s);
  assert.match(styles, /\.admin-sidebar \.nav-label\s*\{[^}]*color:\s*#fff7ec/s);
});
