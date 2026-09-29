---
title: "PACKAGES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# PACKAGES

## In plain language

**Fixed choices and prices.** Each record describes a package under one service.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `PACKAGES` is the label used by the code.

## Example

Ana’s karaoke package costs ₱2,500 in the example.

## Details to recognize first

package_name describes the choice; price supplies its base price; service_id identifies the service.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Booking and Pricing]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

Fixed price choices belonging to a service.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `package_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `package_name` | `VARCHAR(100)` | `NOT NULL` | Display label of the package. |
| `price` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Current catalog price used by booking pricing. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (package_id)`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`

Parent tables: [[System Understanding/Database/Tables/SERVICES|SERVICES]] via `service_id`

Child tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `package_id`

### Where it is used

[[System Understanding/Backend/Files/packages.php|packages.php]], [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

Package/service compatibility is checked in pricing; separate booking foreign keys do not enforce that pairing alone.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
