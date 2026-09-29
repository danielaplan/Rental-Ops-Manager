---
title: "BOOKING_ITEMS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# BOOKING_ITEMS

Per-booking equipment assignment snapshot and release/return progress.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `booking_item_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL` | Parent booking reference. |
| `rental_item_id` | `INT` | `Nullable; implicit NULL default` | Catalog item reference. |
| `service_id` | `INT` | `Nullable; implicit NULL default` | Service reference. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Label of this category, extra, item or checklist snapshot. |
| `expected_qty` | `INT` | `NOT NULL DEFAULT 0` | Quantity expected back for this booking item. |
| `released_qty` | `INT` | `NOT NULL DEFAULT 0` | Recorded outgoing quantity. |
| `returned_qty` | `INT` | `NOT NULL DEFAULT 0` | Saved returned quantity; zero is valid. |
| `required` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | Whether this item is marked required (boolean-style flag). |
| `checked_released` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | Boolean-style outgoing checklist flag. |
| `condition` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Catalog condition or saved booking-item return condition, depending on table. |
| `notes` | `TEXT` | `Nullable; implicit NULL default` | Free-text record remarks. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE SET NULL ON UPDATE CASCADE`

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`, [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]] via `rental_item_id`, [[System Understanding/Database/Tables/SERVICES|SERVICES]] via `service_id`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/bookingItems.php|bookingItems.php]], [[System Understanding/Backend/Files/equipment_service.php|equipment_service.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Separate from EQUIPMENT_CHECKLIST: assignment/release vs saved inspection. Generation replaces these rows. No UNIQUE booking+item key.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
