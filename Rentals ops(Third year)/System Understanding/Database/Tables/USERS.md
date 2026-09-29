---
title: "USERS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# USERS

Owner/staff accounts. Customers do not log in through this table.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `user_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Human name; USERS account name or CUSTOMERS renter name. |
| `role` | `ENUM('owner','staff')` | `NOT NULL DEFAULT 'staff'` | Account permission group: owner or staff. |
| `contact_number` | `VARCHAR(20)` | `Nullable; implicit NULL default` | Contact number; account login identifier in USERS. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Password verifier generated/checked through PHP password functions; not plaintext. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (user_id)`

Parent tables: None.

Child tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `created_by`, [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]] via `checked_by`, [[System Understanding/Database/Tables/SESSIONS|SESSIONS]] via `user_id`

## Where it is used

[[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/equipment.php|equipment.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

No account registration/user-management endpoint exists. Contact number is not UNIQUE in the schema; login selects the first matching account.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
