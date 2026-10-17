# Rental Ops Manager

Owner-facing operations system for AKAD Sweet Party Rentals. It manages bookings, availability, packages, payments, deposits, equipment, delivery, reports, audit history, and offline synchronization.

All included accounts and records are synthetic development data.

## Local setup

### Requirements

- XAMPP with PHP 8.2+ and MySQL/MariaDB
- Git
- Node.js 20+ only when running tests

These commands assume XAMPP is installed in `C:\xampp`.

### 1. Open the project and start MySQL

Open the XAMPP Control Panel and start **MySQL**. Apache is not required.

Then open PowerShell in the repository:

```powershell
cd C:\path\to\Rental-Ops-Manager
```

### 2. Initialize the database once

Run these commands only for a new local setup:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root `
  -e "source $((Resolve-Path 'db\schema.sql').Path.Replace('\','/'))"

& 'C:\xampp\mysql\bin\mysql.exe' -u root `
  -e "source $((Resolve-Path 'db\seed.sql').Path.Replace('\','/'))"
```

Do not run `db/seed.sql` again on an existing database. It contains fixed synthetic IDs.

### 3. Start the application

```powershell
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t .
```

Keep the terminal open and visit:

- Admin: <http://127.0.0.1:8000/admin/login.html>
- Public site: <http://127.0.0.1:8000/>

Do not open the HTML files through `file://`. Authentication, APIs, and offline support require the PHP server.

### 4. Sign in

| Account | Contact number | Password |
| --- | --- | --- |
| Primary owner | `0917-123-4567` | `password` |
| Second owner | `0918-222-3333` | `password` |

Replace these synthetic credentials before deployment.

## Different local database credentials

The default connection is `localhost`, database `akad_rentals`, user `root`, with no password. Override it before starting PHP only when your local MySQL setup differs:

```powershell
$env:AKAD_DB_HOST = 'localhost'
$env:AKAD_DB_NAME = 'akad_rentals'
$env:AKAD_DB_USER = 'root'
$env:AKAD_DB_PASS = 'your-local-password'
```

## Run tests

Start MySQL, then run the isolated acceptance suite:

```powershell
node tests/run_backend_acceptance.cjs
```

The runner creates its own temporary synthetic database. It does not use or migrate the normal `akad_rentals` database.

Frontend-only checks:

```powershell
node --test tests/public-site-data.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs tests/frontend-api-direct.test.cjs
```

## Developer and AI workflow

Start with [PROJECT_INDEX.md](PROJECT_INDEX.md). It connects each feature to the relevant documentation, frontend, backend, database tables, and tests, so developers and AI assistants do not need to read the whole repository for every task.

Use this order:

1. Read `PROJECT_INDEX.md` and open only the files related to the task.
2. Check the relevant requirements and approved decisions.
3. Inspect the current source code before making changes—the index is a guide, not proof that the code is unchanged.
4. Run the relevant tests.
5. If application behavior changed, update only the affected Second Brain pages. Update `PROJECT_INDEX.md` when file locations, dependencies, workflows, or test commands change.

Codex follows [AGENTS.md](AGENTS.md), while Claude Code follows [CLAUDE.md](CLAUDE.md). Both use the same project index and approval boundaries. These tools update documentation only while actively working; they do not monitor the repository automatically.

## Common problems

| Problem | Fix |
| --- | --- |
| Database unavailable | Start MySQL and check the `AKAD_DB_*` values. |
| Port 8000 is already used | Stop the older PHP server or use another port. |
| Login fails | Run the seed once and use the contact number shown above. |
| API returns HTML | Start PHP from the repository root with `-t .`. |
| Offline mode is unavailable | Sign in online once and wait for offline preparation to finish. |
| Old JavaScript appears | Reload without cache and remove stale service workers for this local origin. |

## Development notes

- Preserve offline synchronization and its APIs.
- Legacy FR-10 internal availability blockouts remain deferred.
- Do not run `db/migrations/20261015_revised_backend.php` during normal local setup.
- Local synthetic tests do not prove production readiness or client acceptance.

Before changing requirements or implementation, read:

1. [.project-memory/AKAD_Requirements_Changes.md](.project-memory/AKAD_Requirements_Changes.md)
2. [.project-memory/AKAD_Approval.md](.project-memory/AKAD_Approval.md)
3. [Implementation/Revised-Requirements-Backend-Implementation-Plan.md](Implementation/Revised-Requirements-Backend-Implementation-Plan.md)
4. [Implementation/Backend-Requirement-Matrix.md](Implementation/Backend-Requirement-Matrix.md)
5. [Implementation/Revised-Requirements-Frontend-Implementation-Plan.md](Implementation/Revised-Requirements-Frontend-Implementation-Plan.md)
6. [Implementation/Backend-Migration.md](Implementation/Backend-Migration.md)

## Main folders

```text
admin/             Admin pages
api/               PHP endpoints and business rules
db/                Schema, seed, and guarded migration tools
Implementation/    Implementation plans and verification guides
js/                Frontend workflows and offline sync
tests/             Isolated backend and frontend tests
.project-memory/   Decisions, approvals, and handoff notes
```

Production deployment requires separate HTTPS, credentials, backups, scheduler, performance, device, offline, and owner-acceptance checks.
