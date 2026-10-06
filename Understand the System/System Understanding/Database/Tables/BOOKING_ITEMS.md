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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The equipment assigned to one rental.** Each record describes an assigned item and its expected, released and returned quantities.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `BOOKING_ITEMS` is the label used by the code.

## Example

Ana’s list expects two microphones and later records how many actually came back.

## Main fields

expected_qty is the expected count; released_qty and returned_qty record progress; booking_id connects the rental.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Per-booking equipment assignment snapshot and release/return progress.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

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

### Keys and relationships

- Primary key declared in the column definition: `booking_item_id`.

- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE SET NULL ON UPDATE CASCADE`

Parent tables: [BOOKINGS](BOOKINGS.md) via `booking_id`, [RENTAL_ITEMS](RENTAL_ITEMS.md) via `rental_item_id`, [SERVICES](SERVICES.md) via `service_id`

Child tables: None.

### Where it is used

[bookingItems.php](../../Backend/Files/bookingItems.php.md), [equipment_service.php](../../Backend/Files/equipment_service.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Separate from EQUIPMENT_CHECKLIST: assignment/release vs saved inspection. Generation replaces these rows. No UNIQUE booking+item key.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: BOOKINGS](BOOKINGS.md) · [Next table: CATEGORIES](CATEGORIES.md) · [Back to Start Here](../../Start%20Here.md)
