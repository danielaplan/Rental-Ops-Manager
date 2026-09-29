---
title: "USERS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# USERS

## In plain language

**Staff and owner accounts.** Each record describes a person who can sign in, their account role and the password-checking information.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `USERS` is the label used by the code.

## Example

The staff member creating Ana’s booking has an account here. Ana’s renter details belong in CUSTOMERS.

## Details to recognize first

full_name is the account name; role is owner or staff; user_id is its reference number.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Login and Authentication]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

Owner/staff accounts. Customers do not log in through this table.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `user_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Human name; USERS account name or CUSTOMERS renter name. |
| `role` | `ENUM('owner','staff')` | `NOT NULL DEFAULT 'staff'` | Account permission group: owner or staff. |
| `contact_number` | `VARCHAR(20)` | `Nullable; implicit NULL default` | Contact number; account login identifier in USERS. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Password verifier generated/checked through PHP password functions; not plaintext. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (user_id)`

Parent tables: None.

Child tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `created_by`, [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]] via `checked_by`, [[System Understanding/Database/Tables/SESSIONS|SESSIONS]] via `user_id`

### Where it is used

[[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/equipment.php|equipment.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

No account registration/user-management endpoint exists. Contact number is not UNIQUE in the schema; login selects the first matching account.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
