---
title: "RENTAL_ITEMS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# RENTAL_ITEMS

## Overview

**The reusable equipment list.** Each record is an equipment template under a service, used to build booking-specific item lists.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `RENTAL_ITEMS` is the label used by the code.

## Example

A microphone template supplies its name and quantity when Ana’s assigned list is generated.

## Main fields

name identifies the item; quantity supplies the copied expected count; service_id links it to a service.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Equipment Release and Return]] for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Reusable item catalog by service, used as the template for booking checklists.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `rental_item_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Label of this category, extra, item or checklist snapshot. |
| `quantity` | `INT` | `NOT NULL DEFAULT 1` | Catalog quantity copied as expected booking quantity. |
| `item_code` | `VARCHAR(50)` | `Nullable; implicit NULL default` | Optional equipment identifier. |
| `required` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | Whether this item is marked required (boolean-style flag). |
| `tracking` | `VARCHAR(30)` | `NOT NULL DEFAULT 'quantity'` | Catalog tracking label; no database enum. |
| `status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'Available'` | Catalog availability label; no stock automation. |
| `condition` | `VARCHAR(100)` | `NOT NULL DEFAULT 'Good'` | Catalog condition or saved booking-item return condition, depending on table. |
| `notes` | `TEXT` | `Nullable; implicit NULL default` | Free-text record remarks. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- Primary key declared in the column definition: `rental_item_id`.

- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT ON UPDATE CASCADE`

Parent tables: [[System Understanding/Database/Tables/SERVICES|SERVICES]] via `service_id`

Child tables: [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]] via `rental_item_id`, [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]] via `rental_item_id`, [[System Understanding/Database/Tables/ITEM_HISTORY|ITEM_HISTORY]] via `rental_item_id`

### Where it is used

[[System Understanding/Backend/Files/rentalItems.php|rentalItems.php]], [[System Understanding/Backend/Files/bookingItems.php|bookingItems.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

quantity is copied to expected_qty during generation. These endpoints do not maintain a physical stock-reservation ledger.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
