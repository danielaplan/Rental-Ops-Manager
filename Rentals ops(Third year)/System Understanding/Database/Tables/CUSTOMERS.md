---
title: "CUSTOMERS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# CUSTOMERS

People renting services; one customer can have many bookings.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `customer_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Human name; USERS account name or CUSTOMERS renter name. |
| `contact_number` | `VARCHAR(20)` | `Nullable; implicit NULL default` | Contact number; account login identifier in USERS. |
| `messenger_handle` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Customer contact metadata; booking routes sometimes write email here. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (customer_id)`

Parent tables: None.

Child tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `customer_id`

## Where it is used

[[System Understanding/Backend/Files/customers.php|customers.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

contact_number is not UNIQUE. Booking creation may reuse a contact; name/contact edits affect shared customer data.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
