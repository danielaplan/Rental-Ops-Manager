# AKAD Sweet Party Rentals — Admin Testing Setup

This guide sets up the project for **admin panel testing** only. Other developers can follow the same steps.

## Prerequisites

- [XAMPP](https://www.apachefriends.org/) installed (includes Apache, MySQL, PHP)
- A browser (Chrome or Brave recommended)
- This project folder on your machine

> **If you already have XAMPP installed, skip to "Start Services".**

---

## 1. Start XAMPP services

1. Open the XAMPP Control Panel.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.
4. Verify both show **green**.

*If either is red, the site will not work.*

---

## 2. Import the database

Run these PowerShell commands **one time only** (from the project folder):

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "source db/schema.sql"
C:\xampp\mysql\bin\mysql.exe -u root -e "source db/seed.sql"
```

- `schema.sql` creates the tables.
- `seed.sql` inserts demo data (users, services, bookings).
- It's fine if you see "table already exists" — re-running is safe for testing.

> **⚠️ Only run seed.sql on a test database.** It resets demo data.

---

## 3. Start the PHP server

Keep this terminal window open — it's the backend server.

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t .
```

*If `php` is not recognized, use the full path: `C:\xampp\php\php.exe`*

---

## 4. Log in to the admin panel

Visit:

```
http://127.0.0.1:8000/admin/login.html
```

### Demo test accounts (all use password: `password`)

| Role | Contact number | Permissions |
|---|---|---|
| **Owner** | `0917-123-4567` | Full access — all pages including Services, Categories, Add-ons, Gallery, Content, Settings |
| **Staff** | `0918-222-3333` | Limited — cannot access owner-only pages |
| **Staff** | `0919-444-5555` | Limited — cannot access owner-only pages |

> **Owner is the recommended account for full testing.**

---

## 5. What to confirm after login

- [ ] Dashboard loads with data from the database
- [ ] Bookings page shows seeded entries
- [ ] Services page shows sample services
- [ ] Settings page opens without a database error banner

> **Staff accounts** will be blocked from Services, Categories, Add-ons, Gallery, Content, and Settings pages.

---

## Quick checklist

| Step | Command |
|---|---|
| Start services | `net start mysql` & `net start apache` (in Windows services) |
| Import DB | `mysql -u root < db/schema.sql` then `mysql -u root < db/seed.sql` |
| Start server | `php -S 127.0.0.1:8000` (from project folder) |
| Admin URL | `http://127.0.0.1:8000/admin/login.html` |

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| PHP not running | Server not started or HTML opened directly | Use `http://127.0.0.1:8000/admin/login.html`, not a file URL |
| Server error | PHP server was closed | Restart: `C:\xampp\php\php.exe -S 127.0.0.1:8000 -t .` |
| Database unavailable | MySQL stopped or DB not imported | Start MySQL in XAMPP and re-import `db/seed.sql` |
| Invalid credentials | Wrong login or seed not imported | Use `0917-123-4567` / `password`; re-run seed.sql |
| CORS error | Server not running on correct port | Use `127.0.0.1:8000` and keep PHP server active |

---

## Database connection settings (optional overrides)

The app reads from `api/config.php`. XAMPP defaults are used unless you set env vars:

```powershell
$env:AKAD_DB_HOST="localhost"
$env:AKAD_DB_NAME="akad_rentals"
$env:AKAD_DB_USER="root"
# Leave AKAD_DB_PASS empty for no password
$env:AKAD_DB_PASS=""
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t .
```

---

## Project structure (relevant files)

```
Rental-Ops-Manager/
├── admin/           Admin HTML pages
├── api/             PHP backend files
├── db/
│   ├── schema.sql   Creates the database tables
│   └── seed.sql     Inserts demo data
├── css/             CSS files
├── js/              JavaScript files
├── index.html       Public-facing home page
├── README.md        This file
└── ...