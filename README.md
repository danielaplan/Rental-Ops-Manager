# Rental Ops Manager

Owner-facing operations system for AKAD Sweet Party Rentals. It manages bookings, availability, packages, payments, deposits, equipment, delivery, reports, audit history, and offline synchronization.

All included accounts and records are synthetic development data.

---

## ⚡ Quick Start (Get it running in 5 minutes)

> **You only need 2 things installed: XAMPP and Git.**

### Step 1 — Install XAMPP

Download and install XAMPP from https://www.apachefriends.org/download.html

- Choose a version with **PHP 8.2 or higher**
- Install to the default location: `C:\xampp`
- If you install somewhere else, replace `C:\xampp` with your path in the commands below

### Step 2 — Clone the repository

```powershell
git clone https://github.com/danielaplan/Rental-Ops-Manager.git
cd Rental-Ops-Manager
```

> 💡 **Tip:** Clone into a path without spaces (e.g., `C:\Projects\Rental-Ops-Manager`). Paths with spaces can cause issues with MySQL's `source` command in Step 4.

### Step 3 — Start MySQL

1. Open the **XAMPP Control Panel** (search "XAMPP" in Start Menu)
2. Click **Start** next to **MySQL**
3. Wait until it turns green

> ⚠️ You do NOT need to start Apache. We use PHP's built-in server instead.

### Step 4 — Create the database (first time only)

Open **PowerShell**, navigate to the project folder, and run:

```powershell
cd C:\path\to\Rental-Ops-Manager

& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "source $((Resolve-Path 'db\schema.sql').Path.Replace('\','/'))"

& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "source $((Resolve-Path 'db\seed.sql').Path.Replace('\','/'))"
```

✅ You only run this once. Do not run it again or it will cause duplicate data errors.

### Step 5 — Start the server

```powershell
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t .
```

**Keep this terminal window open.** Closing it stops the server.

### Step 6 — Open in your browser

| Page | URL |
|------|-----|
| Public site (client side) | http://127.0.0.1:8000/ |
| Admin panel (owner side) | http://127.0.0.1:8000/admin/login.html |

> 🚫 **Do NOT double-click the HTML files to open them.** You must use the URLs above. Opening files directly (via `file://`) will break login, APIs, and everything else.

### Step 7 — Log in

| Account | Contact number | Password |
|---------|---------------|----------|
| Primary owner | `0917-123-4567` | `password` |
| Second owner | `0918-222-3333` | `password` |

---

## 🔧 Everyday Use (after first-time setup)

Every time you want to work on the project:

1. Open **XAMPP Control Panel** → Start **MySQL**
2. Open **PowerShell** in the project folder
3. Run:
   ```powershell
   & 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t .
   ```
4. Open http://127.0.0.1:8000/ in your browser

That's it!

---

## 📱 Android App

The native Android project is under [`android/`](android/). It uses Java activities, fragments, and XML layouts, and is developed separately from the existing browser frontend while remaining in this repository. See the [Android project README](android/README.md) for its screens and current integration boundary.

Four-developer branch assignments and pull-request rules are documented in the [Android Team Workflow](android/TEAM_WORKFLOW.md).

### Switch to the existing Android branch

If the repository is already cloned but this is the first time using the Android branch, open PowerShell in the repository root and run:

```powershell
git fetch origin
git switch --track origin/android/initial-project
```

This creates a local `android/initial-project` branch that tracks the existing branch on GitHub. Do not run `git switch -c` for this step because the branch already exists remotely.

On later sessions, switch to it and download its latest commits with:

```powershell
git switch android/initial-project
git pull --ff-only
```

Before switching, run `git status --short`. Commit or safely set aside unfinished work first; do not discard another developer's changes.

To open it:

1. Start Android Studio.
2. Select **Open**.
3. Choose the `Rental-Ops-Manager\android` folder.
4. Wait for Gradle synchronization, then run the `app` configuration on an emulator or Android device.

Run its local unit tests from PowerShell:

```powershell
cd android
.\gradlew.bat test
```

The imported Android UI currently uses in-memory sample data and is not connected to the PHP API. When local API integration is added, the Android Emulator must use `http://10.0.2.2:8000/api/` to reach the PHP server running at `127.0.0.1:8000` on the development computer. Never connect the Android app directly to MySQL or commit `android/local.properties`, build output, credentials, or signing keys.

---

## ❓ Common Problems and Fixes

| Problem | What's happening | Fix |
|---------|-----------------|-----|
| **"Connection refused" in browser** | PHP server is not running | Run the start command from Step 5 and keep the terminal open |
| **Page loads but nothing works / blank page** | You opened the HTML file directly | Use `http://127.0.0.1:8000/` — not `file://` |
| **Database error on startup** | MySQL is not running | Open XAMPP Control Panel and start MySQL |
| **Database error: "table doesn't exist"** | Database was never created | Run the two commands from Step 4 |
| **Login fails** | Wrong credentials or database not seeded | Make sure you ran the seed command and use contact number `0917-123-4567` with password `password` |
| **"Port 8000 already in use"** | Another PHP server is still running | Close the other terminal, or use a different port: `& 'C:\xampp\php\php.exe' -S 127.0.0.1:9000 -t .` |
| **API returns HTML instead of data** | PHP server started from wrong folder | Make sure you `cd` into the project folder before running the start command |
| **Commands fail / "not recognized"** | XAMPP installed in a different location | Replace `C:\xampp` with your actual XAMPP path |

---

## 🔑 If Your MySQL Has a Password

The default setup uses MySQL user `root` with no password. If your XAMPP MySQL has a password set, run these before starting the server:

```powershell
$env:AKAD_DB_PASS = 'your-password-here'
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t .
```

All database connection overrides:

```powershell
$env:AKAD_DB_HOST = 'localhost'
$env:AKAD_DB_NAME = 'akad_rentals'
$env:AKAD_DB_USER = 'root'
$env:AKAD_DB_PASS = 'your-password-here'
```

**Using WAMP, Laragon, or standalone MySQL instead of XAMPP?** Set `AKAD_DB_HOST` to `127.0.0.1` (not `localhost`) and adjust the MySQL binary path in the commands above to match your installation.

---

## ✅ Verify Your Setup

After completing the Quick Start, run these checks to confirm everything is working:

| Check | Command | Expected |
|-------|---------|----------|
| PHP version | `& 'C:\xampp\php\php.exe' -v` | `PHP 8.2.x` or higher |
| PHP has pdo_mysql | `& 'C:\xampp\php\php.exe' -m` | Lists `pdo_mysql` |
| MySQL running | `& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SELECT 1"` | Returns `1` |
| Database exists | `& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SHOW DATABASES LIKE 'akad_rentals'"` | Shows `akad_rentals` |
| Seed data present | `& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "SELECT full_name FROM akad_rentals.USERS"` | `Maria Santos`, `Juan Dela Cruz` |
| Server starts | `& 'C:\xampp\php\php.exe' -S 127.0.0.1:8000 -t .` | `Listening on http://127.0.0.1:8000` |
| API responds | Open `http://127.0.0.1:8000/api/services.php` in browser | JSON with services list |
| Login works | Open `http://127.0.0.1:8000/admin/login.html`, use `0917-123-4567` / `password` | Redirects to dashboard |

---

## 🧪 Running Tests (optional)

Requires Node.js 20+. Start MySQL first.

**Backend tests:**
```powershell
node tests/run_backend_acceptance.cjs
```

**Frontend tests:**
```powershell
node --test tests/public-site-data.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs tests/frontend-api-direct.test.cjs
```

The backend test runner creates its own temporary database — it does not touch `akad_rentals`.

---

## 🤖 AI-Assisted Development

Start with [PROJECT_INDEX.md](PROJECT_INDEX.md). It maps each feature to its frontend, backend, database, and test files.

| Assistant | Repository instructions |
| --- | --- |
| OpenAI Codex | [AGENTS.md](AGENTS.md) |
| Claude Code | [CLAUDE.md](CLAUDE.md) |
| GitHub Copilot | [.github/copilot-instructions.md](.github/copilot-instructions.md) |

Workflow:

1. Read `PROJECT_INDEX.md` and open only the files related to the task.
2. Check the relevant requirements and approved decisions.
3. Inspect the current source code before making changes.
4. Run the relevant tests.
5. If application behavior changed, update the affected Second Brain pages and add a dated development-journal entry. Update `PROJECT_INDEX.md` when file locations, dependencies, workflows, or test commands change.

### Use GitHub Copilot in VS Code

1. Clone or pull the repository and open its root folder in VS Code.
2. Install or enable GitHub Copilot and open Copilot Chat or Agent mode.
3. Ensure repository custom instructions are enabled in the current VS Code/Copilot settings.
4. Ask: "Read the repository instructions and PROJECT_INDEX.md. Explain how you would find the relevant frontend, backend, and database files for a booking change, and which documentation you would update afterward. Do not modify files."
5. Expand the response's **References** list and confirm that `.github/copilot-instructions.md` is included.

Custom instructions guide supported Copilot interactions; they do not make ordinary inline suggestions update documentation automatically, independently monitor manual edits, or guarantee that documentation stays current.

---

## 📁 Main Folders

```text
admin/             Admin pages
api/               PHP endpoints and business rules
db/                Schema, seed, and guarded migration tools
Implementation/    Implementation plans and verification guides
js/                Frontend workflows and offline sync
tests/             Isolated backend and frontend tests
.project-memory/   Decisions, approvals, and handoff notes
```

---

## 📝 Development Notes

- Preserve offline synchronization and its APIs.
- Legacy FR-10 internal availability blockouts remain deferred.
- Do not run `db/migrations/20261015_revised_backend.php` during normal local setup.
- Local synthetic tests do not prove production readiness or client acceptance.
- Replace synthetic credentials before deployment.

Before changing requirements or implementation, read:

1. [.project-memory/AKAD_Requirements_Changes.md](.project-memory/AKAD_Requirements_Changes.md)
2. [.project-memory/AKAD_Approval.md](.project-memory/AKAD_Approval.md)
3. [Implementation/Revised-Requirements-Backend-Implementation-Plan.md](Implementation/Revised-Requirements-Backend-Implementation-Plan.md)
4. [Implementation/Backend-Requirement-Matrix.md](Implementation/Backend-Requirement-Matrix.md)
5. [Implementation/Revised-Requirements-Frontend-Implementation-Plan.md](Implementation/Revised-Requirements-Frontend-Implementation-Plan.md)
6. [Implementation/Backend-Migration.md](Implementation/Backend-Migration.md)

Production deployment requires separate HTTPS, credentials, backups, scheduler, performance, device, offline, and owner-acceptance checks.
