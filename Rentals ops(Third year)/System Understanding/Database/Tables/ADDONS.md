---
title: "ADDONS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# ADDONS

Separately priced optional extras belonging to one service.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `addon_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Label of this category, extra, item or checklist snapshot. |
| `price` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Current catalog price used by booking pricing. |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Active'` | Catalog activation/status label. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT ON UPDATE CASCADE`

Parent tables: [[System Understanding/Database/Tables/SERVICES|SERVICES]] via `service_id`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/addons.php|addons.php]], [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Booking add-on selections live in BOOKINGS.addon_ids JSON, not a join table; JSON values have no foreign-key validation at database level.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
