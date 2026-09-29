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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Staff and owner accounts.** Each record describes a person who can sign in, their account role and the password-checking information.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `USERS` is the label used by the code.

## Example

The staff member creating Ana’s booking has an account here. Ana’s renter details belong in CUSTOMERS.

## Main fields

full_name is the account name; role is owner or staff; user_id is its reference number.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Login and Authentication](../../Workflows/Login%20and%20Authentication.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

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

Child tables: [BOOKINGS](BOOKINGS.md) via `created_by`, [EQUIPMENT_CHECKLIST](EQUIPMENT_CHECKLIST.md) via `checked_by`, [SESSIONS](SESSIONS.md) via `user_id`

### Where it is used

[auth.php](../../Backend/Files/auth.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [equipment.php](../../Backend/Files/equipment.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

No account registration/user-management endpoint exists. Contact number is not UNIQUE in the schema; login selects the first matching account.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: SESSIONS](SESSIONS.md) · [Next table: WEBSITE_CONTENT](WEBSITE_CONTENT.md) · [Back to Start Here](../../Start%20Here.md)
