// Own the synthetic database and PHP processes; never reuse an operational server.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const php = process.env.AKAD_TEST_PHP || 'C:/xampp/php/php.exe';
const mysql = process.env.AKAD_TEST_MYSQL || 'C:/xampp/mysql/bin/mysql.exe';
const database = `akad_verify_plan_${Date.now()}_${process.pid}`;
const children = [];
function sql(input) {
  const result = spawnSync(mysql, ['--host', process.env.AKAD_DB_HOST || 'localhost', '--user', process.env.AKAD_DB_USER || 'root', '--default-character-set=utf8mb4'], {
    input, encoding: 'utf8', env: {...process.env, MYSQL_PWD: process.env.AKAD_DB_PASS || ''}, maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
}
function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer(); server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
  });
}
async function server(env) {
  const port = await freePort();
  const child = spawn(php, ['-S', `127.0.0.1:${port}`, '-t', root], {cwd: root, env, windowsHide: true, stdio: ['ignore','ignore','pipe']});
  children.push(child);
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('PHP startup timed out: '+output)), 10000);
    child.once('error', e => { clearTimeout(timeout); reject(e); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error('PHP exited during startup: '+code+' '+output)); });
    child.stderr.on('data', data => {
      output += data.toString();
      if (output.includes('Development Server') && output.includes('started')) { clearTimeout(timeout); resolve(); }
    });
  });
  return `http://127.0.0.1:${port}/`;
}
async function main() {
  sql(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  for (const file of ['db/schema.sql','db/seed.sql']) sql(fs.readFileSync(path.join(root,file),'utf8').replaceAll('akad_rentals',database));
  const hash = spawnSync(php,['-r',"echo password_hash('OfflineTest!2026',PASSWORD_DEFAULT);"],{encoding:'utf8',windowsHide:true});
  if (hash.error || hash.status !== 0) throw hash.error || new Error(hash.stderr);
  sql(`USE \`${database}\`; UPDATE users SET contact_number='TEST-OWNER',password_hash='${hash.stdout.trim()}' WHERE user_id=1;
    INSERT INTO rental_items(rental_item_id,service_id,name,quantity,required,tracking,status,\`condition\`) VALUES(1,1,'Test speaker',2,1,'quantity','Available','Good')
    ON DUPLICATE KEY UPDATE service_id=VALUES(service_id),name=VALUES(name),quantity=VALUES(quantity),required=VALUES(required),tracking=VALUES(tracking),status=VALUES(status),\`condition\`=VALUES(\`condition\`);`);
  const env={...process.env,AKAD_DB_NAME:database,AKAD_ENV:'test',AKAD_TEST_DB_NAME:database};
  env.AKAD_TEST_BASE_URL=await server(env); env.AKAD_TEST_BASE_URL_2=await server(env);
  console.log(`Synthetic database: ${database}; servers: ${env.AKAD_TEST_BASE_URL}, ${env.AKAD_TEST_BASE_URL_2}`);
  const files=process.argv.slice(2);
  if (!files.length) throw new Error('Supply the focused test file(s) to run.');
  for (const file of files) {
    // Keep draining PHP's log pipe while the test runs; a blocked pipe stalls the server.
    await new Promise((resolve,reject)=>{
      const test=spawn(process.execPath,[file],{cwd:root,env,stdio:'inherit',windowsHide:true});
      test.once('error',reject);
      test.once('exit',code=>code===0?resolve():reject(new Error(`${file} failed (${code})`)));
    });
  }
  console.log(`PASS ${files.length} test file(s). Synthetic database retained for inspection: ${database}`);
}
main().catch(error=>{ console.error(error); process.exitCode=1; }).finally(()=>{ for(const child of children) child.kill(); });
