# Rental Ops Manager — local tester setup

This repository contains a PHP/MySQL backend. The admin login sends its credentials to `api/auth.php`, which checks the MySQL `USERS` table and creates a database-backed session. Opening the HTML file directly, or serving the repository as static files only, cannot complete that login.

## Start the application locally

1. Install/start a PHP server with the PDO MySQL extension and a MySQL-compatible server (for example, Apache and MySQL from XAMPP). Keep MySQL running while testing.
2. Import `db/schema.sql`, then `db/seed.sql`, into the same MySQL server. The scripts create/use the `akad_rentals` database. `seed.sql` also creates the `SESSIONS` table required by login.
3. Run PHP from the repository root. With XAMPP on Windows, a PowerShell example is:

   ```powershell
   C:\xampp\php\php.exe -S 127.0.0.1:8000 -t .
   ```

   Alternatively, place the repository under a PHP-enabled Apache document root and open it through that server. The site URL must reach PHP files under `/api/`.
4. Open `http://127.0.0.1:8000/admin/login.html` (or the equivalent URL on the PHP host).

The seeded **demo owner** account is contact number `0917-123-4567` with password `password`. Enter both values on the login form; its fields are intentionally blank. The other seeded users are staff accounts. These are test credentials; replace them before a non-test deployment. An existing database may contain different account details if it was changed after seeding.

The backend defaults to MySQL host `localhost`, database `akad_rentals`, user `root`, and an empty password. If the tester's database differs, set `AKAD_DB_HOST`, `AKAD_DB_NAME`, `AKAD_DB_USER`, and `AKAD_DB_PASS` in the PHP server environment before starting it. The SQL scripts themselves select `akad_rentals`, so a different database name requires importing them for that database as well.

## If login fails

| Result | Check |
|---|---|
| Browser cannot reach `api/auth.php`, or receives HTML instead of JSON | Open the site through a PHP-enabled server, not as `file://` or a static-only host. |
| `Database unavailable` / HTTP 500 | Start MySQL, confirm the database was imported, and check the database settings used by PHP. |
| `Invalid credentials` / HTTP 401 | Confirm the account exists in the database the PHP server uses, and use the current account password. The seed demo password is `password`. |
| Login succeeds but later requests fail | Keep PHP/MySQL running and check that requests reach the same server/database. |

On case-sensitive MySQL hosts, also check table-name casing: the SQL scripts declare uppercase table names while PHP queries use lowercase names. This repository was verified in a local Windows/MariaDB environment; a fresh deployment on a case-sensitive host may need a naming fix before login or other API requests work.

The seeded data is for testing. Re-importing `seed.sql` updates rows with matching IDs, including demo user hashes and bookings; do not rerun it against operational data without reviewing its effects.

For a guided explanation of the backend and database, open [System Understanding — Start Here](<Rentals ops(Third year)/System Understanding/Start Here.md>).
