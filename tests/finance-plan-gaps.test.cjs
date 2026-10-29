const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

// The runner owns these PHP processes and a freshly seeded synthetic database.
assert.match(process.env.AKAD_TEST_DB_NAME || '', /^akad_verify_plan_\d+_\d+$/,
  'Run through tests/run_revised_backend.cjs; never reuse an operational database.');
const base = process.env.AKAD_TEST_BASE_URL;
assert.ok(base && /^http:\/\/127\.0\.0\.1:\d+\/$/.test(base));
let token;
function sql(input) {
  const mysql = process.env.AKAD_TEST_MYSQL || 'C:/xampp/mysql/bin/mysql.exe';
  const result = spawnSync(mysql, ['--host', process.env.AKAD_DB_HOST || 'localhost', '--user', process.env.AKAD_DB_USER || 'root', '--default-character-set=utf8mb4'], {
    input, encoding: 'utf8', env: {...process.env, MYSQL_PWD: process.env.AKAD_DB_PASS || ''},
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
}
async function request(path, body, expected = 200, method = body ? 'POST' : 'GET') {
  const response = await fetch(new URL(path, base), {
    method,
    headers: {...(token ? {Authorization: `Bearer ${token}`} : {}), ...(body ? {'Content-Type':'application/json'} : {})},
    ...(body ? {body: JSON.stringify(body)} : {}),
  });
  const json = await response.json();
  assert.equal(response.status, expected, `${path}: ${JSON.stringify(json)}`);
  return json;
}

(async () => {
  const login = await request('api/auth.php', {contact_number:'TEST-OWNER',password:'OfflineTest!2026'});
  token = login.data.session_token;
  // Keep this report period independent of payments created by other suites
  // sharing the runner's synthetic database. It must remain in the past so
  // payment-date validation accepts the fixture.
  const start = '2001-08-01', end = start;
  const period = `start=${start}&end=${end}`;
  const baseline = (await request(`api/reports.php?do=report&${period}`)).data;
  const book = (extra = {}) => request('api/bookings.php?do=create', {
    customer_name:'Finance gap fixture',contact:`F${Date.now()}${Math.floor(Math.random()*1000)}`,
    service_id:1,package_id:1,event_date:start,start_time:'10:00',end_time:'11:00',
    location:'Synthetic test venue',status:'Pending',agreed_total:'500.00',...extra,
  },201);
  const booking = (await book()).data;
  const bid = Number(booking.booking_id);
  const createPayment = extra => request('api/payments.php?do=create', {
    booking_id:bid,amount:'125.00',payment_method:'GCash',payment_date:`${start} 00:00:00`,...extra,
  },201);
  const completed = (await createPayment()).data;
  assert.equal(Number(completed.recorded_by), Number(login.data.user.user_id));
  assert.equal(completed.provenance,'owner');
  assert.equal(completed.payment_reference,null);
  await createPayment({amount:'30.00',payment_status:'Pending',payment_method:'MariBank'});
  await createPayment({amount:'20.00',payment_status:'Failed'});
  await createPayment({amount:'50.00',payment_date:'2000-08-01 12:00:00'});
  await request('api/payments.php?do=create',{booking_id:bid,amount:1,payment_method:['GCash']},400);
  await request('api/payments.php?do=create',{booking_id:bid,amount:1,payment_method:'GCash',notes:[]},400);
  await request('api/payments.php?do=create',{booking_id:bid,amount:1,payment_method:'GCash',payment_date:'2099-01-01 12:00:00'},400);
  await request('api/payments.php?do=create',{booking_id:bid,amount:1,payment_method:'GCash',payment_reference:'X'.repeat(151)},400);
  await request(`api/payments.php?do=update&id=${completed.payment_id}`,{amount:999,correction_reason:[]},400);
  await request(`api/payments.php?do=update&id=${completed.payment_id}`,{booking_id:`${bid}.5`,correction_reason:'invalid booking'},400);
  await request(`api/payments.php?do=update&id=${completed.payment_id}`,{amount:'120.00',correction_reason:'Correct synthetic receipt'});
  await request('api/deposits.php?do=upsert',{booking_id:bid,amount_held:'100.00'});
  await request('api/deposits.php?do=deduct',{booking_id:bid,amount:10,affected_item:[],reason:'Invalid array'},400);
  await request('api/deposits.php?do=deduct',{booking_id:bid,amount:10,affected_item:'X'.repeat(256),reason:'Too long'},400);
  await request('api/deposits.php?do=deduct',{booking_id:bid,amount:10,affected_item:'Test cable',reason:'Synthetic damage'});
  const deposit = (await request(`api/deposits.php?do=get&booking_id=${bid}`)).data;
  assert.equal(deposit.deductions.length,1);
  assert.equal(Number(deposit.refund_amount),90);
  const report = (await request(`api/reports.php?do=report&${period}`)).data;
  assert.equal(Number(report.total_revenue_collected),Number(baseline.total_revenue_collected)+120,'Only corrected Completed payment within payment-date period contributes revenue');
  assert.equal(Number(report.total_bookings),Number(baseline.total_bookings)+1,'The legacy report booking count remains available to the reports page');
  assert.equal(Number(report.total_customers),Number(baseline.total_customers)+1);
  assert.equal(Number(report.balances.deposits_held),Number(baseline.balances.deposits_held)+100);
  assert.equal(Number(report.balances.total_deductions_amount),Number(baseline.balances.total_deductions_amount)+10);
  assert.ok(report.popularity.packages.length > 0);
  assert.equal(Number(report.pending),Number(baseline.pending)+1);
  assert.equal(Number(report.awaiting_payment),Number(baseline.awaiting_payment));
  assert.ok(Array.isArray(report.popular_services));
  assert.ok(report.popular_services.some(service=>service.name==='JBL Karaoke Rental' && Number(service.count)>=1));
  assert.equal(typeof report.damaged_or_missing,'number');
  assert.match(report.definitions.popularity,/including cancelled/);
  assert.match(report.definitions.completed_and_cancelled_totals,/Lifetime/);
  const dashboard = (await request('api/reports.php?do=dashboard')).data;
  assert.equal(typeof dashboard.total_bookings,'number');
  assert.equal(typeof dashboard.active_services,'number');
  assert.equal(typeof dashboard.awaiting_payment_bookings,'number');
  assert.ok(Array.isArray(dashboard.upcoming_bookings));
  const cancelled = (await book()).data;
  await request(`api/bookings.php?do=cancel&id=${cancelled.booking_id}`,{cancellation_reason:'Synthetic retained cancellation'});
  const cancelledRows = (await request(`api/reports.php?do=cancellations&${period}`)).data;
  assert.equal(cancelledRows.length,1);
  assert.equal(Number(cancelledRows[0].booking_id),Number(cancelled.booking_id));
  assert.equal(cancelledRows[0].cancellation_reason,'Synthetic retained cancellation');
  const upcoming = (await request(`api/reports.php?do=upcoming&${period}`)).data;
  assert.ok(upcoming.some(row=>Number(row.booking_id)===bid));
  assert.ok(!upcoming.some(row=>Number(row.booking_id)===Number(cancelled.booking_id)));
  const first = (await book({status:'Confirmed'})).data;
  const second = (await book({status:'Confirmed',approve_conflicts:true,
    conflicting_booking_ids:[Number(first.booking_id)],override_reason:'Synthetic approved overlap'})).data;
  const overlaps = (await request(`api/reports.php?do=overlaps&${period}`)).data;
  assert.ok(overlaps.some(row=>Number(row.booking_id)===Number(second.booking_id) && row.reason==='Synthetic approved overlap' && row.approving_owner));
  assert.equal((await request('api/reports.php?do=overlaps&start=2000-08-01&end=2000-08-31')).data.length,0);
  const overpayment = (await book({agreed_total:'100.00'})).data;
  await request('api/payments.php?do=create',{booking_id:overpayment.booking_id,amount:'90.00',payment_method:'GCash',payment_date:`${start} 00:00:00`},201);
  await request('api/payments.php?do=create',{booking_id:overpayment.booking_id,amount:'11.00',payment_method:'GCash',payment_date:`${start} 00:00:00`},400);
  await request('api/payments.php?do=create',{booking_id:overpayment.booking_id,amount:'10.00',payment_method:'GCash',payment_date:`${start} 00:00:00`},201);
  await request('api/payments.php?do=create',{booking_id:overpayment.booking_id,amount:'0.01',payment_method:'GCash',payment_date:`${start} 00:00:00`},400);
  const fractional = (await book({agreed_total:'0.10'})).data;
  await request('api/payments.php?do=create',{booking_id:fractional.booking_id,amount:'0.03',payment_method:'GCash',payment_date:`${start} 00:00:00`},201);
  await request('api/payments.php?do=create',{booking_id:fractional.booking_id,amount:'0.071',payment_method:'GCash',payment_date:`${start} 00:00:00`},400);
  await request('api/payments.php?do=create',{booking_id:fractional.booking_id,amount:'0.08',payment_method:'GCash',payment_date:`${start} 00:00:00`},400);
  await request('api/payments.php?do=create',{booking_id:fractional.booking_id,amount:'0.07',payment_method:'GCash',payment_date:`${start} 00:00:00`},201);
  const preciseDeposit = (await book()).data;
  await request('api/deposits.php?do=upsert',{booking_id:preciseDeposit.booking_id,amount_held:'0.00'},400);
  await request('api/deposits.php?do=upsert',{booking_id:preciseDeposit.booking_id,amount_held:'10.001'},400);
  await request('api/deposits.php?do=upsert',{booking_id:preciseDeposit.booking_id,amount_held:'10.00'});
  await request('api/deposits.php?do=deduct',{booking_id:preciseDeposit.booking_id,amount:'0.001',affected_item:'Test item',reason:'Invalid precision'},400);
  const legacyZero = (await book()).data;
  sql(`USE \`${process.env.AKAD_TEST_DB_NAME}\`; INSERT INTO deposits(booking_id,amount_held,refund_status,recorded_by,created_at,updated_at) VALUES(${Number(legacyZero.booking_id)},0.00,'Held',1,NOW(),NOW());`);
  const correctedZero = (await request('api/deposits.php?do=upsert',{booking_id:legacyZero.booking_id,amount_held:'75.00'})).data;
  assert.equal(Number(correctedZero.amount_held),75);
  await request('api/deposits.php?do=upsert',{booking_id:legacyZero.booking_id,amount_held:'80.00'},400);
  const replayZero = (await book()).data;
  sql(`USE \`${process.env.AKAD_TEST_DB_NAME}\`; INSERT INTO deposits(booking_id,amount_held,refund_status,recorded_by,created_at,updated_at) VALUES(${Number(replayZero.booking_id)},0.00,'Held',1,NOW(),NOW());`);
  const replay = await request('api/sync.php?do=commit',{queue:[{client_id:`zero-repair-${Date.now()}`,entity:'deposits',action:'upsert',data:{booking_id:replayZero.booking_id,amount_held:'60.00',deduction_amount:'0.00'}}]});
  assert.equal(replay.data.failed.length,0);
  assert.equal(Number(replay.data.committed[0].data.amount_held),60);
  const empty = (await request('api/reports.php?do=report&start=2000-09-01&end=2000-09-30')).data;
  assert.equal(Number(empty.total_revenue_collected),0);
  for (const kind of ['upcoming','cancellations','overlaps']) await request(`api/reports.php?do=${kind}&start=bad&end=${end}`,undefined,400);
  await request('api/reports.php?do=dashboard',{},405);
  console.log('PASS finance validation, retained report details, report definitions, and payment-date revenue');
})().catch(error=>{console.error(error);process.exitCode=1;});
