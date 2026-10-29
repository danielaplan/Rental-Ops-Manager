const assert = require('node:assert/strict');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const database = process.env.AKAD_TEST_DB_NAME || '';
assert.match(database,/^akad_verify_plan_\d+_\d+$/,'Use tests/run_revised_backend.cjs to own an isolated synthetic database.');
const bases = [process.env.AKAD_TEST_BASE_URL,process.env.AKAD_TEST_BASE_URL_2];
assert.ok(bases.every(base=>/^http:\/\/127\.0\.0\.1:\d+\/$/.test(base || '')));
function sql(statement) {
  const result = spawnSync(process.env.AKAD_TEST_MYSQL || 'C:/xampp/mysql/bin/mysql.exe',[
    '--host',process.env.AKAD_DB_HOST || 'localhost','--port',process.env.AKAD_DB_PORT || '3306','--user',process.env.AKAD_DB_USER || 'root','--batch','--skip-column-names',database,
  ],{input:statement,encoding:'utf8',windowsHide:true,env:{...process.env,MYSQL_PWD:process.env.AKAD_DB_PASS || ''}});
  assert.ifError(result.error);
  assert.equal(result.status,0,result.stderr);
  return result.stdout.trim();
}
async function request(url,{token,body,server=0} = {}) {
  const response = await fetch(new URL(url,bases[server]),{
    method:body ? 'POST' : 'GET',headers:{...(token ? {Authorization:`Bearer ${token}`} : {}),...(body ? {'Content-Type':'application/json'} : {})},
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  return {status:response.status,data:await response.json()};
}
async function login(password='password',server=0) {return request('api/auth.php',{body:{username:'juan',password},server});}
function tokenOf(result) {assert.equal(result.status,200,JSON.stringify(result.data));return result.data.data.session_token;}
async function rejected(token) {assert.equal((await request('api/auth.php?do=me',{token})).status,401);}

(async()=>{
  const primary = tokenOf(await request('api/auth.php',{body:{contact_number:'TEST-OWNER',password:'OfflineTest!2026'}}));
  const secondary = tokenOf(await login());
  assert.equal((await request('api/owners.php',{token:secondary})).status,403);
  assert.equal((await request('api/owners.php?do=deactivate&id=1',{token:primary,body:{}})).status,400);
  assert.equal((await request('api/owners.php?do=create',{token:primary,body:{username:'third',full_name:'Third owner',password:'password'}})).status,409);
  assert.equal((await request('api/auth.php?do=logout',{token:secondary,body:{}})).status,200);
  await rejected(secondary);
  const expired = tokenOf(await login());
  assert.match(expired,/^[a-f0-9]{64}$/);
  sql(`UPDATE sessions SET expires_at='2000-01-01 00:00:00' WHERE session_token='${expired}';`);
  await rejected(expired);
  assert.equal(sql(`SELECT expires_at FROM sessions WHERE session_token='${expired}';`),'2000-01-01 00:00:00','Expired token must not be refreshed');

  const devices = [tokenOf(await login()),tokenOf(await login('password',1))];
  assert.equal((await request('api/owners.php?do=deactivate&id=2',{token:primary,body:{}})).status,200);
  for(const token of devices) await rejected(token);
  const inactive = await login();
  const unknown = await request('api/auth.php',{body:{username:'missing-owner',password:'password'}});
  assert.equal(inactive.status,401); assert.equal(unknown.status,401); assert.deepEqual(inactive.data,unknown.data);
  assert.equal((await request('api/owners.php?do=reactivate&id=2',{token:primary,body:{}})).status,200);
  for(const token of devices) await rejected(token);
  const resetDevices = [tokenOf(await login()),tokenOf(await login('password',1))];
  assert.equal((await request('api/owners.php?do=resetPassword&id=2',{token:primary,body:{password:'NewPassword!2026'}})).status,200);
  for(const token of resetDevices) await rejected(token);
  assert.equal((await login()).status,401);
  tokenOf(await login('NewPassword!2026'));

  await request('api/owners.php?do=resetPassword&id=2',{token:primary,body:{password:'password'}});
  const failures = await Promise.all(Array.from({length:10},(_,i)=>login('wrong-password',i%2)));
  assert.ok(failures.every(result=>result.status===401));
  assert.equal(sql('SELECT failed_login_count FROM users WHERE user_id=2;'),'5','Concurrent attempts stop incrementing once lockout is active');
  assert.equal((await login()).status,401);
  sql('UPDATE users SET locked_until=DATE_SUB(NOW(),INTERVAL 1 MINUTE) WHERE user_id=2;');
  tokenOf(await login());
  assert.equal(sql('SELECT CONCAT(failed_login_count,":",locked_until IS NULL) FROM users WHERE user_id=2;'),'0:1');

  for(let i=0;i<3;i++) {
    const [racedLogin,reset] = await Promise.all([
      login('password',1),
      request('api/owners.php?do=resetPassword&id=2',{token:primary,body:{password:'NewPassword!2026'}}),
    ]);
    assert.equal(reset.status,200,JSON.stringify(reset));
    assert.ok([200,401].includes(racedLogin.status));
    if(racedLogin.status===200) await rejected(racedLogin.data.data.session_token);
    assert.equal((await login()).status,401,'Old credentials cannot issue a session after reset');
    await request('api/owners.php?do=resetPassword&id=2',{token:primary,body:{password:'password'}});
  }
  // CGI executes the real HTTP bootstrap without connecting to any database.
  const cgi = process.env.AKAD_TEST_PHP_CGI || path.join(path.dirname(process.env.AKAD_TEST_PHP || 'C:/xampp/php/php.exe'),'php-cgi.exe');
  function config(https,origin) {
    const result=spawnSync(cgi,['-f',path.resolve('api/config.php')],{encoding:'utf8',windowsHide:true,env:{...process.env,
       AKAD_ENV:'production',AKAD_DB_HOST:'db.example.test',AKAD_DB_NAME:'akad_production',AKAD_DB_USER:'akad_owner',AKAD_DB_PASS:'test-only-password',AKAD_ALLOWED_ORIGINS:'https://approved.example',REQUEST_METHOD:'GET',REDIRECT_STATUS:'200',
      SCRIPT_FILENAME:path.resolve('api/config.php'),HTTPS:https,HTTP_ORIGIN:origin,
    }});
    assert.ifError(result.error);assert.equal(result.status,0,result.stderr);return result.stdout;
  }
  assert.match(config('off','https://approved.example'),/403 Forbidden[\s\S]*HTTPS is required/);
  assert.match(config('on','https://unapproved.example'),/403 Forbidden[\s\S]*Origin is not allowed/);
  const approved=config('on','https://approved.example');
  assert.match(approved,/Access-Control-Allow-Origin: https:\/\/approved.example/i);
  assert.ok(!/403 Forbidden/.test(approved));
  assert.ok(!/Access-Control-Allow-Origin: \*/i.test(approved));
  console.log('PASS auth multi-device revocation, expiry, parallel lockout/reset race, primary permissions, production HTTPS/CORS bootstrap');
})().catch(error=>{console.error(error);process.exitCode=1;});
