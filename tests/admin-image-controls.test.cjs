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

test('admin sidebar uses a persistent manual collapse control', () => {
  const source = read('js/admin.js');
  const styles = read('css/admin.css');

  assert.match(source, /function bindAdminSidebarSizeToggle\(\)/);
  assert.match(source, /function toggleAdminSidebarSize\(\)/);
  assert.match(source, /akad_admin_sidebar_expanded/);
  assert.doesNotMatch(source, /addEventListener\('pointerenter'/);
  assert.doesNotMatch(source, /addEventListener\('pointerleave'/);
  assert.match(styles, /\.admin-sidebar-edge-toggle\s*\{/);
  assert.match(source, /classList\?\.toggle\('admin-sidebar-expanded', expanded\)/);
  assert.match(styles, /\.admin-body\.admin-sidebar-expanded \.admin-main\s*\{/);
  assert.match(styles, /transition:\s*margin-left \.34s cubic-bezier/);
  assert.match(styles, /\.admin-sidebar:not\(\.is-expanded\) \.nav-link i\s*\{[^}]*width:\s*32px;[^}]*height:\s*32px/s);
  assert.match(styles, /\.admin-sidebar\.is-expanded \.nav-label\s*\{[^}]*color:\s*#fff7ec/s);
});
