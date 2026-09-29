---
title: "PACKAGES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# PACKAGES

Fixed price choices belonging to a service.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `package_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `package_name` | `VARCHAR(100)` | `NOT NULL` | Display label of the package. |
| `price` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Current catalog price used by booking pricing. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (package_id)`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`

Parent tables: [[System Understanding/Database/Tables/SERVICES|SERVICES]] via `service_id`

Child tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `package_id`

## Where it is used

[[System Understanding/Backend/Files/packages.php|packages.php]], [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Package/service compatibility is checked in pricing; separate booking foreign keys do not enforce that pairing alone.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
