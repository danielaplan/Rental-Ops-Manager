const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

test('public hero uses a layered frosted background with reduced-motion support', () => {
  const styles = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');

  assert.match(styles, /\.hero-image-wrap > img\s*\{[^}]*filter:\s*blur\(2\.2px\)/s);
  assert.match(styles, /\.hero-image-wrap::before\s*\{[^}]*radial-gradient[^}]*hero-glow-drift/s);
  assert.match(styles, /\.hero-image-wrap::after\s*\{[^}]*backdrop-filter:\s*blur\(1\.2px\)/s);
  assert.doesNotMatch(styles, /\.hero-copy::before\s*\{/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce[^}]*hero-image-wrap::before[^}]*animation:\s*none/s);
});
