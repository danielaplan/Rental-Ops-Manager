# Tester 2 — Complete Setup and Testing Process

Use only this setup guide for Tester 2.

## Your assignment

- **Database:** `akad_rentals_qa_t2`
- **Git branch:** `qa/tester-2`
- **Scenarios:** 11–20 and 45–48
- **Instructions:** [Instructions.md](Instructions.md)
- **Report:** [Report.md](Report.md)
- **Screenshots:** [`Evidence/`](Evidence/README.md)

## Step 1 — Get the same project version

Open PowerShell in the repository folder. Get the starting commit ID from the coordinator.

```powershell
git pull --ff-only
git rev-parse HEAD
git switch -c qa/tester-2
```

If the branch already exists locally, run `git switch qa/tester-2` instead. Confirm that HEAD matches the coordinator's commit and record it under **Database baseline** in `Report.md`.

## Step 2 — Create your clean QA database

**Where to run this:** First, start **MySQL** using the XAMPP Control Panel or the MySQL Windows service. Then open **Windows PowerShell** in `C:\Users\<your-name>\Desktop\Rental-Ops-Manager` and paste the command block below. Do not paste it into phpMyAdmin, MySQL Workbench, the VS Code editor, or a browser.

This deletes and recreates only `akad_rentals_qa_t2`. Never replace it with `akad_rentals`.

```powershell
$qaDatabase = 'akad_rentals_qa_t2'
$mysqlClient = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'

if ($qaDatabase -ne 'akad_rentals_qa_t2') { throw 'Wrong Tester 2 QA database name.' }
if (-not (Test-Path -LiteralPath $mysqlClient)) { throw 'Set $mysqlClient to the mysql.exe installed on this laptop.' }

& $mysqlClient -u root -e "DROP DATABASE IF EXISTS $qaDatabase;"
$schemaSql = (Get-Content -Raw '.\db\schema.sql').Replace('akad_rentals', $qaDatabase)
$seedSql = (Get-Content -Raw '.\db\seed.sql').Replace('akad_rentals', $qaDatabase)
$schemaSql | & $mysqlClient -u root
$seedSql | & $mysqlClient -u root
```

If MySQL requires a password, use its secure prompt. Never store the password in Git or the report.

## Step 3 — Verify the clean baseline

**Where to run this:** Keep using the same **Windows PowerShell** window from Step 2. The `$qaDatabase` and `$mysqlClient` values were created there, so do not close that window before running this command.

```powershell
& $mysqlClient -u root -N -B -e "
SELECT 'users', COUNT(*) FROM $qaDatabase.users
UNION ALL SELECT 'services', COUNT(*) FROM $qaDatabase.services
UNION ALL SELECT 'packages', COUNT(*) FROM $qaDatabase.packages
UNION ALL SELECT 'addons', COUNT(*) FROM $qaDatabase.addons
UNION ALL SELECT 'rental_items', COUNT(*) FROM $qaDatabase.rental_items
UNION ALL SELECT 'gallery', COUNT(*) FROM $qaDatabase.gallery
UNION ALL SELECT 'customers', COUNT(*) FROM $qaDatabase.customers
UNION ALL SELECT 'bookings', COUNT(*) FROM $qaDatabase.bookings
UNION ALL SELECT 'payments', COUNT(*) FROM $qaDatabase.payments;"
```

Expected: users `2`, services `3`, packages `12`, addons `10`, rental items `15`, gallery `9`, customers `0`, bookings `0`, and payments `0`. If any count differs, stop and rerun Step 2.

## Step 4 — Start the application

```powershell
$env:AKAD_DB_NAME = 'akad_rentals_qa_t2'
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t .
```

Open `http://127.0.0.1:8000/admin/login.html`, not `file://`. Sign in with the synthetic owner listed in the root `README.md`. Confirm login works, packages/services load, gallery images appear, and Bookings is empty.

## Step 5 — Prepare your report

In [Report.md](Report.md), enter your name, date, laptop/browser, database `akad_rentals_qa_t2`, and starting commit. Edit only Tester 2's report and evidence folder.

## Step 6 — Run the assigned scenarios

1. Read the [common instructions](../README.md).
2. Open [Tester 2 instructions](Instructions.md).
3. Run Scenarios 11–20 and 45–48 from top to bottom.
4. Do not reset the database between scenarios.
5. Refresh or reopen after every save before deciding the result.
6. Immediately record the result, visible Booking ID, and note in [Report.md](Report.md).
7. Add one detailed bug record for every FAIL.
8. Save every FAIL or BLOCKED screenshot in `Evidence/` using the [filename rules](Evidence/README.md).
9. Restore or deactivate every `TEMP QA` catalog record before finishing.

Create all Tester 2 records yourself; do not wait for Tester 1 data.

## Step 7 — Handle a setup blocker

Do not begin Scenario 11 if MySQL, PHP, login, database creation, baseline counts, or catalog loading fails. Record Scenario 11 as `BLOCKED`, use Booking ID `N/A`, explain the setup problem, and save a BLOCKED screenshot. A setup problem normally has no application Bug ID.

## Step 8 — Final check and handoff

Confirm all assigned rows, bug records, evidence names, and temporary-data cleanup are complete.

```powershell
git status --short
git add 'QA-Reports/Tester-2/Report.md' 'QA-Reports/Tester-2/Evidence'
git commit -m 'Record Tester 2 manual QA results'
git push -u origin qa/tester-2
```

Tell the coordinator that `qa/tester-2` is ready. Do not commit another tester's files, force-push, or update the consolidated report.
