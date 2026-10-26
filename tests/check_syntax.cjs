const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const php = process.env.AKAD_TEST_PHP || (process.platform === 'win32' ? 'C:/xampp/php/php.exe' : 'php');
const failures = [];

function run(command, args, label, input) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', input });
  if (result.error || result.status !== 0) failures.push([label, result.error?.message || `${result.stdout}${result.stderr}`]);
}

for (const file of fs.readdirSync(path.join(root, 'api')).filter(name => name.endsWith('.php'))) {
  run(php, ['-l', path.join('api', file)], `api/${file}`);
}
for (const directory of ['js', 'tests']) {
  for (const file of fs.readdirSync(path.join(root, directory)).filter(name => name.endsWith('.js') || name.endsWith('.cjs'))) {
    run(process.execPath, ['--check', path.join(directory, file)], `${directory}/${file}`);
  }
}
run(process.execPath, ['--check', 'sw.js'], 'sw.js');
for (const file of fs.readdirSync(path.join(root, 'admin')).filter(name => name.endsWith('.html'))) {
  const source = fs.readFileSync(path.join(root, 'admin', file), 'utf8');
  for (const match of source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\bsrc\s*=/i.test(match[1]) && match[2].trim()) {
      run(process.execPath, ['-e', "new Function(require('node:fs').readFileSync(0,'utf8'));"], `${file} inline`, match[2]);
    }
  }
}

if (failures.length) {
  for (const [file, error] of failures) console.error(`${file}\n${error}`);
  process.exitCode = 1;
} else {
  console.log('PHP, JavaScript, service worker, test scripts, and all admin inline scripts passed syntax checks.');
}
