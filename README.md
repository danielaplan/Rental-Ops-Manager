# AKAD Sweet Party Rentals — Local Dev & Testing Setup

> **Quick answer:** The admin login calls `api/auth.php` (PHP + MySQL).
> You **must** run the site through a PHP server — opening the HTML file directly or using Vercel static hosting will not work.

---

## Prerequisites

| Tool | What it is | Download |
|---|---|---|
| **XAMPP** | PHP + Apache + MySQL in one installer | https://www.apachefriends.org |
| A browser | Chrome or Brave recommended | — |

> Already have XAMPP? Skip to **Step 2**.

---

## Step 1 — Start XAMPP Services

1. Open **XAMPP Control Panel** (Run as Administrator).
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.
4. Both status lights should turn **green** before continuing.

---

## Step 2 — Import the Database

Open a **PowerShell** window and run these two commands one at a time:

```powershell
# 1. Create tables
C:\xampp\mysql\bin\mysql.exe -u root -e "source C:/Users/acer/Desktop/Rental-Ops-Manager/db/schema.sql"

# 2. Insert demo data (users, services, bookings, etc.)
C:\xampp\mysql\bin\mysql.exe -u root -e "source C:/Users/acer/Desktop/Rental-Ops-Manager/db/seed.sql"
```

Both commands should complete silently (no errors). If you see **"database already exists"** or **"Table already exists"** — that is fine, keep going.

> ⚠️ Only run `seed.sql` on a **test database**. Re-running it overwrites demo rows but will NOT touch rows you created manually.

---

## Step 3 — Start the PHP Server

Open a **new** PowerShell window (keep it open while testing) and run:

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t C:\Users\acer\Desktop\Rental-Ops-Manager
```

You should see output like:
```
PHP 8.x.x Development Server (http://127.0.0.1:8000) started
```

> Do **not** close this window — it is the backend.

---

## Step 4 — Open the Admin Login

In your browser, navigate to:

```
http://127.0.0.1:8000/admin/login.html
```

Enter the demo **owner** account:

| Field | Value |
|---|---|
| Contact number | `0917-123-4567` |
| Password | `password` |

Click **Log In** — you should land on the Dashboard.

### Other seeded accounts

| Name | Role | Contact | Password |
|---|---|---|---|
| Maria Santos | **owner** | `0917-123-4567` | `password` |
| Juan Dela Cruz | staff | `0918-222-3333` | `password` |
| Ana Cruz | staff | `0919-444-5555` | `password` |

> Staff accounts cannot access owner-only pages (Services, Categories, Add-ons, Gallery, Content, Settings).

---

## Troubleshooting Login

| Error you see | Cause | Fix |
|---|---|---|
| `"PHP is not running on this host"` | Opening `file://` or Vercel, not the PHP server | Use `http://127.0.0.1:8000/admin/login.html` |
| `"The server returned an invalid response"` | PHP server is not running | Run the Step 3 command and keep the window open |
| `"Database unavailable"` (HTTP 500) | MySQL is stopped or DB not imported | Start MySQL in XAMPP, re-run Step 2 |
| `"Invalid credentials"` (HTTP 401) | Wrong contact/password, or seed not run | Use `0917-123-4567` / `password`; re-run Step 2 |
| Page loads but API calls fail | PHP server was closed | Re-run the Step 3 command |
| CORS error in console | PHP server is on a different port | Make sure port is `8000` and you opened `http://127.0.0.1:8000` |

---

## Quick Test Checklist

After login succeeds, open these pages to confirm the full stack is working:

- [ ] **Dashboard** — shows booking stats (numbers from the DB, not zeros)
- [ ] **Bookings** — lists 3 seeded bookings (BK-001, BK-002, BK-003)
- [ ] **Services** — lists Karaoke Rental, Sweet Corner, Balloon Decoration
- [ ] **Settings** — loads without a "Database unavailable" banner

---

## Database Connection Settings

`api/config.php` reads these environment variables (falls back to XAMPP defaults):

| Env variable | Default | Change if needed |
|---|---|---|
| `AKAD_DB_HOST` | `localhost` | Different MySQL host |
| `AKAD_DB_NAME` | `akad_rentals` | Different database name |
| `AKAD_DB_USER` | `root` | MySQL username |
| `AKAD_DB_PASS` | *(empty)* | MySQL password |

To override, prepend them to the PHP server command:

```powershell
$env:AKAD_DB_PASS="mypassword"; C:\xampp\php\php.exe -S 127.0.0.1:8000 -t C:\Users\acer\Desktop\Rental-Ops-Manager
```

---

## Project Structure (quick reference)

```
/
├── admin/          Admin HTML pages (login, dashboard, bookings, ...)
├── api/            PHP endpoints (auth.php, bookings.php, ...)
├── db/
│   ├── schema.sql  Creates all tables
│   └── seed.sql    Inserts demo users, services, bookings
├── js/             Frontend JS (api.js, admin.js, ...)
├── css/            Stylesheets
└── index.html      Public-facing website
```

---

> **Note:** `api/*.php` requires a running PHP + MySQL server.
> Vercel (static-only hosting) cannot execute PHP — use it only for the public-facing `index.html` pages, not the admin backend.

