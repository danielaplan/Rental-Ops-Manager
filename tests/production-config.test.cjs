const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const php = process.env.AKAD_TEST_PHP || (process.platform === 'win32' ? 'C:/xampp/php/php.exe' : 'php');
const bootstrap = "require 'api/config.php'; echo 'BOOTED';";

function boot(overrides) {
  const env = { ...process.env, ...overrides };
  return spawnSync(php, ['-r', bootstrap], { cwd: root, env, encoding: 'utf8' });
}

test('production bootstrap fails closed when required configuration is absent', () => {
  const result = boot({ AKAD_ENV: 'production', AKAD_DB_HOST: '', AKAD_DB_NAME: '', AKAD_DB_USER: '', AKAD_DB_PASS: '', AKAD_ALLOWED_ORIGINS: '' });
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /Production configuration is incomplete/);
});

test('production bootstrap accepts complete environment configuration', () => {
  const result = boot({
    AKAD_ENV: 'production', AKAD_DB_HOST: 'db.example.test', AKAD_DB_NAME: 'akad_production',
    AKAD_DB_USER: 'akad_owner', AKAD_DB_PASS: 'test-only-password', AKAD_ALLOWED_ORIGINS: 'https://app.example.test'
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.stdout, 'BOOTED');
});
