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

## Overview

**Explicit equipment event entries.** Each record stores an equipment action that somebody or a caller explicitly logged.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `ITEM_HISTORY` is the label used by the code.

## Example

A microphone condition change can have a history entry when one is written.

## Main fields

action explains the event; qty is its quantity; event_date is its timestamp.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Equipment Release and Return]] for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Explicit equipment action log retaining nullable booking/item references.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

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

### Keys and relationships

- Primary key declared in the column definition: `history_id`.

- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE SET NULL ON UPDATE CASCADE`

Parent tables: [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]] via `rental_item_id`, [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/itemHistory.php|itemHistory.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

Deletion sets references NULL to preserve history. Not a complete automatic audit of every write.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
