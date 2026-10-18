const assert = require('node:assert/strict');

// The runner owns these PHP processes and a freshly seeded synthetic database.
assert.match(process.env.AKAD_TEST_DB_NAME || '', /^akad_verify_plan_\d+_\d+$/,
  'Run through tests/run_revised_backend.cjs; never reuse an operational database.');
const base = process.env.AKAD_TEST_BASE_URL;
assert.ok(base && /^http:\/\/127\.0\.0\.1:\d+\/$/.test(base));
let token;
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
  const year = 3000 + Math.floor(Math.random() * 5000);
  const start = `${year}-07-01`, end = `${year}-07-31`;
  const period = `start=${start}&end=${end}`;
  const book = (extra = {}) => request('api/bookings.php?do=create', {
    customer_name:'Finance gap fixture',contact:`F${Date.now()}${Math.floor(Math.random()*1000)}`,
    service_id:1,package_id:1,event_date:start,start_time:'10:00',end_time:'11:00',
    location:'Synthetic test venue',status:'Pending',agreed_total:'500.00',...extra,
  },201);
  const booking = (await book()).data;
  const bid = Number(booking.booking_id);
  const createPayment = extra => request('api/payments.php?do=create', {
    booking_id:bid,amount:'125.00',payment_method:'GCash',payment_date:`${start} 12:00:00`,...extra,
  },201);
  const completed = (await createPayment()).data;
  assert.equal(Number(completed.recorded_by), Number(login.data.user.user_id));
  assert.equal(completed.provenance,'owner');
  assert.equal(completed.payment_reference,null);
  await createPayment({amount:'30.00',payment_status:'Pending',payment_method:'MariBank'});
  await createPayment({amount:'20.00',payment_status:'Failed'});
  await createPayment({amount:'50.00',payment_date:`${year}-08-01 12:00:00`});
  await request('api/payments.php?do=create',{booking_id:bid,amount:1,payment_method:['GCash']},400);
  await request('api/payments.php?do=create',{booking_id:bid,amount:1,payment_method:'GCash',notes:[]},400);
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
  assert.equal(Number(report.total_revenue_collected),120,'Only corrected Completed payment within payment-date period contributes revenue');
  assert.equal(Number(report.total_bookings),1,'The legacy report booking count remains available to the reports page');
  assert.equal(Number(report.total_customers),1);
  assert.equal(Number(report.pending),1);
  assert.equal(Number(report.awaiting_payment),0);
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
  const cancelled = (await book({event_date:`${year}-07-02`})).data;
  await request(`api/bookings.php?do=cancel&id=${cancelled.booking_id}`,{cancellation_reason:'Synthetic retained cancellation'});
  const cancelledRows = (await request(`api/reports.php?do=cancellations&${period}`)).data;
  assert.equal(cancelledRows.length,1);
  assert.equal(Number(cancelledRows[0].booking_id),Number(cancelled.booking_id));
  assert.equal(cancelledRows[0].cancellation_reason,'Synthetic retained cancellation');
  const upcoming = (await request(`api/reports.php?do=upcoming&${period}`)).data;
  assert.ok(upcoming.some(row=>Number(row.booking_id)===bid));
  assert.ok(!upcoming.some(row=>Number(row.booking_id)===Number(cancelled.booking_id)));
  const first = (await book({event_date:`${year}-07-03`,status:'Confirmed'})).data;
  const second = (await book({event_date:`${year}-07-03`,status:'Confirmed',approve_conflicts:true,
    conflicting_booking_ids:[Number(first.booking_id)],override_reason:'Synthetic approved overlap'})).data;
  const overlaps = (await request(`api/reports.php?do=overlaps&${period}`)).data;
  assert.ok(overlaps.some(row=>Number(row.booking_id)===Number(second.booking_id) && row.reason==='Synthetic approved overlap' && row.approving_owner));
  assert.equal((await request(`api/reports.php?do=overlaps&start=${year}-08-01&end=${year}-08-31`)).data.length,0);
  const empty = (await request(`api/reports.php?do=report&start=${year}-09-01&end=${year}-09-30`)).data;
  assert.equal(Number(empty.total_revenue_collected),0);
  for (const kind of ['upcoming','cancellations','overlaps']) await request(`api/reports.php?do=${kind}&start=bad&end=${end}`,undefined,400);
  await request('api/reports.php?do=dashboard',{},405);
  console.log('PASS finance validation, retained report details, report definitions, and payment-date revenue');
})().catch(error=>{console.error(error);process.exitCode=1;});
