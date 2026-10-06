# AKAD Sweet Party Rentals — Local Setup and Testing Guide

This project runs with PHP and MySQL. The admin pages do not work if you open the `.html` files directly in the browser. You must run the project through a local PHP server and keep MySQL running in XAMPP.

> Quick answer: the admin login calls `api/auth.php`, which requires a live PHP backend and a MySQL database.

---

## What you need

- XAMPP installed with:
  - Apache
  - MySQL
  - PHP
- A browser such as Chrome or Brave
- The project folder on your machine

> If you already have XAMPP installed, skip to Step 2.

---

## Step 1 — Start XAMPP services

1. Open the XAMPP Control Panel.
2. Click Start next to Apache.
3. Click Start next to MySQL.
4. Make sure both show green.

If Apache or MySQL is not running, the site will not work properly.

---

## Step 2 — Locate your project folder

Find the project folder on your computer. The path usually looks like this:

```powershell
C:\Users\YourName\Desktop\Rental-Ops-Manager
```

If your folder is in a different location, replace the path below with your actual folder path.

---

## Step 3 — Import the database

Open PowerShell and run these commands one at a time.

### Option A: If you know your exact project path

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "source C:/Users/YourName/Desktop/Rental-Ops-Manager/db/schema.sql"
C:\xampp\mysql\bin\mysql.exe -u root -e "source C:/Users/YourName/Desktop/Rental-Ops-Manager/db/seed.sql"
```

### Option B: Use a variable for easier editing

```powershell
$projectPath = "C:\Users\YourName\Desktop\Rental-Ops-Manager"
C:\xampp\mysql\bin\mysql.exe -u root -e "source $projectPath/db/schema.sql"
C:\xampp\mysql\bin\mysql.exe -u root -e "source $projectPath/db/seed.sql"
```

### What happens here
- `schema.sql` creates the database tables.
- `seed.sql` inserts demo data such as users, services, and bookings.

> If you see messages like “database already exists” or “table already exists,” that is usually fine for local testing.

> Warning: Only run `seed.sql` on a test database. It resets demo data and may overwrite seeded rows.

---

## Step 4 — Start the PHP server

Open a new PowerShell window and keep it open while testing.

### Windows example using the full PHP path

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t C:\Users\YourName\Desktop\Rental-Ops-Manager
```

### Alternative: run from the project folder

```powershell
cd "C:\Users\YourName\Desktop\Rental-Ops-Manager"
php -S 127.0.0.1:8000
```

If `php` is not recognized, use the full path: `C:\xampp\php\php.exe`.

### What to expect

You should see output like this:

```text
PHP 8.x.x Development Server (http://127.0.0.1:8000) started
```

> Keep this terminal window open. It is the backend server for the project.

---

## Step 5 — Open the app in the browser

Visit:

```text
http://127.0.0.1:8000/admin/login.html
```

Do not open the HTML file directly from the File Explorer. Use the local web URL instead.

---

## Step 6 — Log in to the admin panel

Use the demo owner account:

| Field | Value |
|---|---|
| Contact number | `0917-123-4567` |
| Password | `password` |

After login, you should be taken to the dashboard.

### Other seeded accounts

| Name | Role | Contact | Password |
|---|---|---|---|
| Maria Santos | owner | `0917-123-4567` | `password` |
| Juan Dela Cruz | staff | `0918-222-3333` | `password` |
| Ana Cruz | staff | `0919-444-5555` | `password` |

> Staff accounts cannot access owner-only pages such as Services, Categories, Add-ons, Gallery, Content, and Settings.

---

## Quick verification checklist

After login, confirm the following:

- [ ] Dashboard loads and shows data from the database
- [ ] Bookings page loads with seeded entries
- [ ] Services page shows sample services
- [ ] Settings page opens without a database error banner

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `PHP is not running on this host` | You opened the file directly or used a static host | Open `http://127.0.0.1:8000/admin/login.html` |
| `The server returned an invalid response` | PHP server is not running | Start the PHP server again |
| `Database unavailable` | MySQL is stopped or DB was not imported | Start MySQL in XAMPP and import the SQL files |
| `Invalid credentials` | Wrong login info or seed file not imported | Use `0917-123-4567` and `password`; run the seed file again |
| API calls fail in the browser | PHP server was closed | Restart the PHP server |
| CORS error in console | Server is not running on the correct port | Use `127.0.0.1:8000` and keep the PHP server active |

---

## Database connection settings

The app reads database settings from `api/config.php`. It falls back to XAMPP defaults if no custom environment variables are set.

| Environment variable | Default value | Purpose |
|---|---|---|
| `AKAD_DB_HOST` | `localhost` | MySQL host |
| `AKAD_DB_NAME` | `akad_rentals` | Database name |
| `AKAD_DB_USER` | `root` | MySQL username |
| `AKAD_DB_PASS` | empty | MySQL password |

Example override:

```powershell
$env:AKAD_DB_PASS="mypassword"; C:\xampp\php\php.exe -S 127.0.0.1:8000 -t "C:\Users\YourName\Desktop\Rental-Ops-Manager"
```

---

## Project structure

```text
Rental-Ops-Manager/
├── admin/              Admin HTML pages
├── api/                PHP backend files
├── db/
│   ├── schema.sql      Creates the database tables
│   └── seed.sql        Inserts demo data
├── css/                CSS files
├── js/                 JavaScript files
├── index.html          Public-facing home page
├── README.md           Setup instructions
├── sw.js               Service worker file
└── ...
```

---

## Final note

This project requires:
- MySQL running in XAMPP
- A local PHP server running on `127.0.0.1:8000`
- Access through the browser using the URL above

Do not use a static-only host such as Vercel for the admin backend, because PHP files are not executed there.

---

## One-line summary

If you want the shortest possible setup, do this:

```powershell
# 1. Start Apache + MySQL in XAMPP
# 2. Import the database
C:\xampp\mysql\bin\mysql.exe -u root -e "source C:/Users/YourName/Desktop/Rental-Ops-Manager/db/schema.sql"
C:\xampp\mysql\bin\mysql.exe -u root -e "source C:/Users/YourName/Desktop/Rental-Ops-Manager/db/seed.sql"

# 3. Start the PHP server
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t C:\Users\YourName\Desktop\Rental-Ops-Manager

# 4. Open in browser
http://127.0.0.1:8000/admin/login.html
```

