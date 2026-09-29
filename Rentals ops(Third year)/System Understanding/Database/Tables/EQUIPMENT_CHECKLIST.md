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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The saved return inspection.** Each record stores an item’s condition and return outcome, with the inspecting account.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `EQUIPMENT_CHECKLIST` is the label used by the code.

## Example

Staff record that Ana’s microphone returned in Good condition, or save a missing item and notes.

## Main fields

condition_in describes the return; returned_qty records the count; checked_by identifies the inspector.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Saved inspection rows: outgoing/incoming condition, return result and inspecting user.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

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

### Keys and relationships

- `PRIMARY KEY (checklist_id)`
- `UNIQUE KEY uq_equipment_booking_item (booking_id, rental_item_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON UPDATE CASCADE ON DELETE SET NULL`
- `FOREIGN KEY (checked_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE SET NULL`

Additional indexes:

- `CREATE INDEX idx_equipment_booking ON EQUIPMENT_CHECKLIST(booking_id);`

Parent tables: [BOOKINGS](BOOKINGS.md) via `booking_id`, [RENTAL_ITEMS](RENTAL_ITEMS.md) via `rental_item_id`, [USERS](USERS.md) via `checked_by`

Child tables: None.

### Where it is used

[equipment.php](../../Backend/Files/equipment.php.md), [equipment_service.php](../../Backend/Files/equipment_service.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Unique booking+item enables inspection upsert; nullable rental_item_id means the unique key does not prevent multiple NULL item rows. Full inspection requires all catalog-linked booking items.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: DEPOSITS](DEPOSITS.md) · [Next table: GALLERY](GALLERY.md) · [Back to Start Here](../../Start%20Here.md)
