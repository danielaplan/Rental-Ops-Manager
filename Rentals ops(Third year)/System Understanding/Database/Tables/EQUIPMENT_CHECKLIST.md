---
title: "EQUIPMENT_CHECKLIST"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# EQUIPMENT_CHECKLIST

Saved inspection rows: outgoing/incoming condition, return result and inspecting user.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `checklist_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL` | Parent booking reference. |
| `rental_item_id` | `INT` | `Nullable; implicit NULL default` | Catalog item reference. |
| `item_name` | `VARCHAR(100)` | `NOT NULL` | Saved equipment label. |
| `condition_out` | `VARCHAR(255)` | `Nullable; implicit NULL default` | Outgoing equipment condition text. |
| `condition_in` | `VARCHAR(255)` | `Nullable; implicit NULL default` | Saved incoming equipment condition. |
| `expected_qty` | `INT` | `NOT NULL DEFAULT 0` | Quantity expected back for this booking item. |
| `returned_qty` | `INT` | `NOT NULL DEFAULT 0` | Saved returned quantity; zero is valid. |
| `inspection_notes` | `TEXT` | `Nullable; implicit NULL default` | Saved return inspection remarks. |
| `return_status` | `ENUM('pending','inspected','damaged','missing')` | `NOT NULL DEFAULT 'pending'` | pending/inspected/damaged/missing inspection result. |
| `checked_by` | `INT` | `Nullable; implicit NULL default` | Nullable foreign key to inspecting account. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (checklist_id)`
- `UNIQUE KEY uq_equipment_booking_item (booking_id, rental_item_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON UPDATE CASCADE ON DELETE SET NULL`
- `FOREIGN KEY (checked_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE SET NULL`

Additional indexes:

- `CREATE INDEX idx_equipment_booking ON EQUIPMENT_CHECKLIST(booking_id);`

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`, [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]] via `rental_item_id`, [[System Understanding/Database/Tables/USERS|USERS]] via `checked_by`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/equipment.php|equipment.php]], [[System Understanding/Backend/Files/equipment_service.php|equipment_service.php]], [[System Understanding/Backend/Files/reports.php|reports.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Unique booking+item enables inspection upsert; nullable rental_item_id means the unique key does not prevent multiple NULL item rows. Full inspection requires all catalog-linked booking items.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
