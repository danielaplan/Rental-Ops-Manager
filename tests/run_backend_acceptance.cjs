// Consolidated runtime verification only: never invokes migration scripts or existing servers.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tests', 'acceptance-results', `${Date.now()}-${process.pid}`);
fs.mkdirSync(output, { recursive: true });
const backend = [
  'backend-revised-requirements', 'catalog-plan-gaps', 'booking-plan-gaps', 'finance-plan-gaps',
  'auth-plan-gaps', 'sync-plan-gaps', 'write-validation-gaps', 'history-template-gaps', 'offline-sync',
].map(name => `tests/${name}.test.cjs`);
const frontend = ['public-site-data', 'frontend-api-contract', 'frontend-async-workflows', 'frontend-api-direct']
  .map(name => `tests/${name}.test.cjs`);
const env = { ...process.env, AKAD_TEST_EXCLUDE_DEFERRED_BLOCKOUTS: '1',
  AKAD_TEST_OFFLINE_RESULTS: path.join(output, 'offline-results.json') };
const summary = { started_at: new Date().toISOString(), output, backend, frontend, results: [],
  exclusions: ['migration execution (including synthetic migration regression)', 'legacy internal blockout draft',
    'operational database access', 'manual browser/device/owner acceptance', 'production/performance acceptance'] };
function hashes() {
  const result = {};
  function visit(relative) {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'acceptance-results') visit(file); }
      else if (/\.(php|js|cjs|py|sql|html)$/.test(entry.name)) {
        result[file.replaceAll('\\', '/')] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
      }
    }
  }
  for (const directory of ['api', 'js', 'admin', 'db', 'scripts', 'tests']) visit(directory);
  result['sw.js'] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'sw.js'))).digest('hex');
  return result;
}
function run(name, command, args) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const fd = fs.openSync(path.join(output, `${name}.log`), 'wx');
    const child = spawn(command, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
      fs.writeSync(fd, chunk); process.stdout.write(chunk);
    });
    child.once('error', error => { fs.closeSync(fd); reject(error); });
    child.once('close', code => {
      if (child.pid) fs.closeSync(fd);
      summary.results.push({ name, command, args, exit_code: code, elapsed_ms: Date.now() - started });
      resolve(code);
    });
  });
}
(async () => {
  console.log(`Acceptance evidence: ${output}`);
  summary.source_sha256 = hashes();
  await run('backend', process.execPath, ['tests/run_revised_backend.cjs', ...backend]);
  await run('frontend', process.execPath, ['--test', ...frontend]);
  await run('syntax', process.env.AKAD_TEST_PYTHON || 'python', ['tests/check_syntax.py']);
  await run('diff-check', 'git', ['diff', '--check']);
  assert.deepEqual(hashes(), summary.source_sha256, 'Source changed during acceptance; rerun on the final code.');
  summary.source_unchanged = true;
  summary.passed = summary.results.every(result => result.exit_code === 0);
  if (!summary.passed) process.exitCode = 1;
})().catch(error => { summary.error = String(error.stack || error); process.exitCode = 1; console.error(error); })
  .finally(() => {
    summary.finished_at = new Date().toISOString();
    fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`Evidence saved: ${output}`);
  });
