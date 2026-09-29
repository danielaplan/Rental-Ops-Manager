---
title: "SERVICES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# SERVICES

The service catalog: seed id 1 Karaoke, id 2 Sweet Corner, id 3 Balloon Decoration.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `service_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `service_name` | `VARCHAR(50)` | `NOT NULL` | Display name of the service. |
| `description` | `TEXT` | `Nullable; implicit NULL default` | Free-text catalog explanation. |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Active'` | Catalog activation/status label. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (service_id)`

Parent tables: None.

Child tables: [[System Understanding/Database/Tables/ADDONS|ADDONS]] via `service_id`, [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]] via `service_id`, [[System Understanding/Database/Tables/PACKAGES|PACKAGES]] via `service_id`, [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `service_id`, [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]] via `service_id`

## Where it is used

[[System Understanding/Backend/Files/services.php|services.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Karaoke scheduling and locking depend on service_id=1. No category_id relationship exists.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
