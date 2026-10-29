const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Only disposable databases created by this process may be changed or dropped.
const database = `akad_migration_gap_${process.pid}_${Date.now()}`;
assert.match(database, /^akad_migration_gap_\d+_\d+$/);
const php = process.env.PHP_BINARY || 'C:\\xampp\\php\\php.exe';
const env = { ...process.env, AKAD_DB_NAME: database };
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'akad-migration-gap-'));
const resolutionFile = path.join(directory, 'resolutions.json');
const connect = `$p=new PDO('mysql:host='.(getenv('AKAD_DB_HOST')?:'localhost').';port='.(getenv('AKAD_DB_PORT')?:'3306').';charset=utf8mb4',getenv('AKAD_DB_USER')?:'root',getenv('AKAD_DB_PASS')?:'',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);`;
function command(args, input) {
  const result = spawnSync(php, args, { cwd: path.resolve(__dirname, '..'), env, encoding: 'utf8', input });
  if (result.error) throw result.error;
  return result;
}
function sql(code) {
  const result = command(['-r', `${connect}$database=getenv('AKAD_DB_NAME');if(!preg_match('/^akad_migration_gap_[0-9]+_[0-9]+$/',$database))throw new Exception('Unsafe test database');${code}`]);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
function migrate(apply = false) {
  return command(['db/migrations/20261015_revised_backend.php', `--resolutions=${resolutionFile}`,
    ...(apply ? ['--apply', '--backup-verified', '--maintenance'] : [])]);
}
function resolutions(value) { fs.writeFileSync(resolutionFile, JSON.stringify(value)); }
const mapping = {
  bookings: { 1: { package_name_snapshot: 'Synthetic historic package', package_price_snapshot: '100.00', evidence: 'Synthetic fixture contract' } },
  payments: { 1: { payment_type: 'Down payment', evidence: 'Synthetic fixture receipt' },
    2: { payment_type: 'Balance', evidence: 'Synthetic receipt with unknown recorder' } },
  deposits: { 1: { refund_status: 'Held', evidence: 'Synthetic fixture deposit ledger' } },
};
try {
  sql(`$p->exec('CREATE DATABASE '.$database);`);
  sql(`$p->exec('USE '.$database);$schema=file_get_contents('db/schema.sql');$schema=preg_replace('/CREATE DATABASE[^;]*;|USE akad_rentals;/','',$schema);$p->exec($schema);`);
  sql(`$p->exec('USE '.$database);
    $p->exec("INSERT INTO users(user_id,full_name,role,username,account_status,is_primary_owner,password_hash) VALUES(1,'Synthetic owner','owner','synthetic_primary','Active',1,'unused'),(2,'Synthetic second owner','owner','synthetic_secondary','Active',0,'unused'),(3,'Synthetic historical staff','staff','synthetic_staff','Inactive',0,'unused'),(4,'Synthetic former owner','owner','synthetic_former','Inactive',0,'unused')");
    $p->exec("INSERT INTO customers(customer_id,full_name) VALUES(1,'Synthetic customer')");
    $p->exec("INSERT INTO services(service_id,service_name) VALUES(1,'Synthetic service')");
    $p->exec("INSERT INTO packages(package_id,service_id,package_name,price) VALUES(1,1,'Mutable catalogue name',200)");
    $p->exec("INSERT INTO bookings(booking_id,customer_id,service_id,package_id,created_by,event_date,start_time,end_time,status,total,amount_paid,service_ids) VALUES(1,1,1,1,1,'2035-01-01','10:00','12:00','pending',100,30,'[1]')");
    $p->exec("INSERT INTO payments(payment_id,booking_id,amount,payment_method,payment_status,recorded_by,recorded_at) VALUES(1,1,20,'gcash','paid',3,'2025-01-01 08:00:00'),(2,1,10,'maribank','paid',NULL,NULL)");
    $p->exec("INSERT INTO deposits(deposit_id,booking_id,amount_held,recorded_by) VALUES(1,1,50,3)");`);
  resolutions(mapping);
  let result = migrate();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(JSON.parse(result.stdout).mode, 'dry-run');
  assert.equal(sql(`$p->exec('USE '.$database);echo $p->query('SELECT COUNT(*) FROM schema_migrations')->fetchColumn();`), '0');

  for (const override of [{ username: 'changed_primary' }, { account_status: 'Inactive' }, { is_primary_owner: 0 }]) {
    resolutions({ ...mapping, users: { 1: override } });
    result = migrate();
    assert.equal(result.status, 2, result.stdout + result.stderr);
    assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'users' && e.issue.includes('owner-supplied evidence')));
  }
  resolutions({ ...mapping, bookings: { 1: { ...mapping.bookings[1], evidence: '  ' } } });
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'bookings' && e.issue.includes('evidence-backed')));
  resolutions({ ...mapping, bookings: { 1: { ...mapping.bookings[1], package_price_snapshot: '-1.00' } } });
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.issue.includes('negative')));
  resolutions({ ...mapping, deposits: { 1: { ...mapping.deposits[1], recorded_by: 999 } } });
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'deposits' && e.issue.includes('historical identity')));

  resolutions(mapping);
  sql(`$p->exec('USE '.$database);
    $p->exec("INSERT INTO rental_items(rental_item_id,service_id,name) VALUES(1,1,'Synthetic item')");
    $p->exec("INSERT INTO equipment_checklist(checklist_id,booking_id,rental_item_id,item_name,expected_qty,returned_qty) VALUES(1,1,1,'Synthetic item',1,1)");`);
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'equipment_checklist' && e.issue.includes('release quantity')));
  sql(`$p->exec('USE '.$database);$p->exec("INSERT INTO booking_items(booking_item_id,booking_id,rental_item_id,name,expected_qty,released_qty,returned_qty) VALUES(1,1,1,'Synthetic item',1,0,1)");`);
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'booking_items' && e.issue.includes('returned <= released <= expected')));
  sql(`$p->exec('USE '.$database);$p->exec('UPDATE booking_items SET released_qty=2 WHERE booking_item_id=1');`);
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'booking_items' && e.issue.includes('returned <= released <= expected')));
  sql(`$p->exec('USE '.$database);$p->exec('ALTER TABLE booking_items MODIFY released_qty INT NULL');$p->exec('UPDATE booking_items SET released_qty=NULL WHERE booking_item_id=1');`);
  result = migrate();
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.ok(JSON.parse(result.stdout).exceptions.some(e => e.table === 'booking_items' && e.issue.includes('returned <= released <= expected')));
  sql(`$p->exec('USE '.$database);$p->exec('UPDATE booking_items SET released_qty=1 WHERE booking_item_id=1');`);
  result = migrate();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  result = migrate(true);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const records = JSON.parse(sql(`$p->exec('USE '.$database);echo json_encode(['payment'=>$p->query('SELECT recorded_by,recorded_at,provenance FROM payments WHERE payment_id=1')->fetch(),'unknown'=>$p->query('SELECT recorded_by,recorded_at,provenance FROM payments WHERE payment_id=2')->fetch(),'deposit'=>$p->query('SELECT recorded_by,provenance FROM deposits WHERE deposit_id=1')->fetch(),'staff'=>$p->query('SELECT account_status FROM users WHERE user_id=3')->fetchColumn(),'former_owner'=>$p->query('SELECT account_status FROM users WHERE user_id=4')->fetchColumn()]);`));
  assert.equal(Number(records.payment.recorded_by), 3);
  assert.equal(records.payment.recorded_at, '2025-01-01 08:00:00');
  assert.equal(records.payment.provenance, 'legacy-evidenced');
  assert.equal(Number(records.deposit.recorded_by), 3);
  assert.equal(records.deposit.provenance, 'legacy-evidenced');
  assert.equal(records.staff, 'Inactive');
  assert.equal(records.former_owner, 'Inactive');
  assert.deepEqual(records.unknown, { recorded_by: null, recorded_at: null, provenance: 'legacy-unknown' });
  result = migrate(true);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(JSON.parse(result.stdout).already_applied, true);
  const checklist = JSON.parse(sql(`$p->exec('USE '.$database);echo json_encode($p->query('SELECT expected_quantity,quantity_released,quantity_returned FROM booking_checklist_items WHERE legacy_checklist_id=1')->fetch());`));
  assert.deepEqual(Object.values(checklist).map(Number), [1, 1, 1]);
  console.log('PASS migration preserves historical attribution/checklist quantities, rejects unsupported evidence and invalid bounds, and reruns safely on an isolated synthetic database');
} finally {
  sql(`$p->exec('DROP DATABASE IF EXISTS '.$database);`);
  fs.rmSync(directory, { recursive: true, force: true });
}
