# Backend database migration procedure

> **Status update — 2026-10-16:** The user confirmed that every existing record is sample/test data and there is no real historical business database to preserve. This migration procedure and its 51-row worksheet are therefore **not applicable to the current deployment path**. Deploy from a clean reviewed schema and do not copy the sample dataset into production. Keep this procedure only as a guarded reference if a real legacy source is introduced later; do not run it for the current clean installation.

This procedure applies `db/migrations/20261015_revised_backend.php`. It is designed for Windows/XAMPP and assumes the application uses MySQL with `utf8mb4`. Do not run it against the production database until the owner-approved resolution file produces a dry-run report with no exceptions.

## Before migration

Current authorization boundary (2026-10-15): MySQL may remain running. Do not run even a read-only operational preflight without fresh explicit owner approval. Resolving the worksheet or reaching zero exceptions does not authorize application; the owner must separately authorize the operational migration. The commands below are an operator procedure, not permission to execute them.

1. Schedule downtime and stop the PHP application/API so no booking or payment can be written during the migration.
2. Confirm the target server and database. Store backups and resolution files outside the repository; neither belongs in source control.
3. Create a timestamped logical backup and confirm that the dump is non-empty:

   ```powershell
   $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
   $backup = "D:\RentalOpsBackups\akad_rentals-$stamp.sql"
   & 'C:\xampp\mysql\bin\mysqldump.exe' --single-transaction --routines --triggers --result-file=$backup -u root akad_rentals
   if ($LASTEXITCODE -ne 0 -or -not (Test-Path $backup) -or (Get-Item $backup).Length -eq 0) { throw 'Database backup was not created.' }
   ```

4. Restore that dump into a separate test database and verify that the restore completes before scheduling production work:

   ```powershell
   & 'C:\xampp\mysql\bin\mysql.exe' -u root -e 'CREATE DATABASE akad_rentals_restore_check CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
   Get-Content -Raw $backup | & 'C:\xampp\mysql\bin\mysql.exe' -u root akad_rentals_restore_check
   if ($LASTEXITCODE -ne 0) { throw 'Backup restore verification failed.' }
   ```

   Use a new restore-check database name if it already exists. Do not drop a database as part of this procedure.

## Dry run and data resolution

The latest read-only operational dry run reported **51 unresolved findings** (2 user, 15 booking, 4 payment, and 30 booking-item/checklist findings). No operational migration is authorized while these remain unresolved. The existing owner worksheet is `C:\Users\acer\Desktop\akad-rentals-migration-resolution-worksheet.csv`; keep it outside source control and enter decisions only with owner-supplied evidence. Leave unsupported values blank. The worksheet is a review record, not an input file: transfer only approved, evidenced decisions into the JSON format below. Do not fabricate historical actors, timestamps, snapshots, refunds, or quantities to make the report pass.

The migration is dry-run by default. Supply a JSON resolution file only for decisions supported by business records. The format is keyed by source table and source ID; for example:

```json
{
  "bookings": {
    "123": {
      "status": "Awaiting Completion",
      "event_start_datetime": "2026-11-04 09:00:00",
      "event_end_datetime": "2026-11-04 13:00:00",
      "evidence": "Approved event contract dated 2026-10-01"
    }
  }
}
```

The example is illustrative only; do not copy its values as a real resolution. The script reports unresolved statuses, dates, package snapshots, payment evidence/types, deposit refund evidence, multi-service links, and checklist quantities. Resolve each exception from source evidence; do not infer historical payment types, refunds, actors, or package snapshots. Do not proceed while the report has any exceptions.

Supported resolution fields are: users (`role`, `username`, `account_status`, `is_primary_owner`); bookings (`status`, event datetimes, `cancellation_reason`, package snapshots); payments (`payment_status`, `payment_type`, `recorded_by`, `recorded_at`); deposits (`refund_status`, `refund_date`, `recorded_by`). Each evidence reference must contain non-whitespace text. Known recording identities and payment recording times already present in the source are preserved; unknown values remain null with explicit legacy provenance. `recorded_by` must identify a preserved user, including historical inactive staff; retaining attribution does not grant that person login access.

Any supplied change to a source username, account status, primary-owner designation, or role requires owner-supplied evidence. Checklist migration requires one matching booking-item row for every equipment-checklist row and quantities satisfying `0 <= returned <= released <= expected`; missing release quantities stop the dry run before schema changes. Do not substitute zero for an unknown release quantity.

Multiple-service allocations and inconsistent booking-item/checklist quantities have no automatic resolution fields in this script. The owner must first supply the allocation or corrected quantities and supporting records; prepare a separately reviewed conversion for those records before rerunning the dry run. Editing worksheet status or adding unsupported JSON keys does not resolve these findings. Do not edit operational records, split bookings, duplicate payments, or guess which checklist quantity is correct as part of this procedure.

Run the dry run using the target connection settings:

```powershell
$env:AKAD_DB_HOST = 'localhost'
$env:AKAD_DB_NAME = 'akad_rentals'
$env:AKAD_DB_USER = 'root'
$env:AKAD_DB_PASS = ''
& 'C:\xampp\php\php.exe' db\migrations\20261015_revised_backend.php --resolutions='D:\RentalOpsBackups\akad-migration-resolutions.json' |
  Tee-Object -FilePath 'D:\RentalOpsBackups\akad-migration-dry-run.json'
if ($LASTEXITCODE -ne 0) { throw 'Migration dry run reported unresolved exceptions or failed.' }
```

Review and retain the report. A zero exit code is necessary but not sufficient: confirm the database name, row counts, financial reconciliations, and evidence references with the owner.

## Apply

Only after a verified backup restore, owner approval of all mapping decisions, a zero-exception dry run, and maintenance mode:

```powershell
& 'C:\xampp\php\php.exe' db\migrations\20261015_revised_backend.php `
  --apply --backup-verified --maintenance `
  --resolutions='D:\RentalOpsBackups\akad-migration-resolutions.json'
if ($LASTEXITCODE -ne 0) { throw 'Migration failed; follow the rollback procedure.' }
```

The two safety flags are operator attestations, not automatic checks. The migration takes an immutable source-row archive, records its completion in `schema_migrations`, clears existing sessions, and rejects unresolved mappings before applying. MySQL DDL commits independently of the data transaction, so a failed run can leave additive columns/tables behind; rerun only after reviewing the error and confirming the backup.

After application, verify the migration summary, compare source and target counts, recheck payment/deposit/checklist totals, confirm both active owner accounts and the single primary-owner flag, log in with both owners, and run the backend acceptance suite before reopening the application.

## Rollback

There is no reverse migration because the migration preserves legacy rows and may add schema objects and audit history. On any failed or rejected cutover:

1. Keep the application stopped and do not attempt an ad-hoc reverse `ALTER` or delete migration rows.
2. Preserve the failed database and migration report for diagnosis.
3. Restore the pre-migration backup into a separate database first and verify it. After validation, switch the application configuration back to the pre-migration database/schema and deploy the previous application version.
4. Verify owner login and representative booking/payment/deposit records on the restored version before reopening service.
5. Retain the failed database until the owner approves its disposal.

Do not reuse the original production database name for the restore until the restore has been validated and the cutover owner explicitly approves the switch.

## Deferred scope

FR-10 internal availability blockouts in the earlier blockout draft remain deferred. Pre-existing availability-block schema/code is not evidence of approval to activate that feature. The revised backend plan's financial deposit-deduction requirement is separate. Offline sync is preserved by explicit user decision: retain its APIs/settings and do not convert workflows to online-only without new authorization.

## Focused local regression

`rtk proxy node tests/migration-plan-gaps.test.cjs` creates and removes only its own uniquely named `akad_migration_gap_*` synthetic database. It checks evidence rejection, historical attribution retention, a write-free dry run, and an idempotent rerun. It does not read or migrate `akad_rentals`, resolve any of the 51 operational findings, or prove production readiness.
