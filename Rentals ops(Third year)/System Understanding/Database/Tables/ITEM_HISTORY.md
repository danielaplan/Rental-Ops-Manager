---
title: "ITEM_HISTORY"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# ITEM_HISTORY

Explicit equipment action log retaining nullable booking/item references.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `history_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `rental_item_id` | `INT` | `Nullable; implicit NULL default` | Catalog item reference. |
| `booking_id` | `INT` | `Nullable; implicit NULL default` | Parent booking reference. |
| `action` | `VARCHAR(40)` | `NOT NULL` | Equipment history action label. |
| `qty` | `INT` | `NOT NULL DEFAULT 0` | History quantity. |
| `condition` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Catalog condition or saved booking-item return condition, depending on table. |
| `event_date` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Equipment-history timestamp; defaults to database current time. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE SET NULL ON UPDATE CASCADE`

Parent tables: [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]] via `rental_item_id`, [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/itemHistory.php|itemHistory.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Deletion sets references NULL to preserve history. Not a complete automatic audit of every write.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
