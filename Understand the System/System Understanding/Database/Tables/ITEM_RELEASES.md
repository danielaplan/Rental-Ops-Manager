---
title: "ITEM_RELEASES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# ITEM_RELEASES

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Equipment handover events.** Each record stores release information for a booking, including the person’s name and remarks.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `ITEM_RELEASES` is the label used by the code.

## Example

Staff save a release note when Ana’s equipment leaves.

## Main fields

released_by is a written name, not an account link; released_at is the time; booking_id identifies the rental.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Explicit release-event metadata linked to a booking.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `release_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL` | Parent booking reference. |
| `released_by` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Free-text releasing person, not an account FK. |
| `notes` | `TEXT` | `Nullable; implicit NULL default` | Free-text record remarks. |
| `released_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Release timestamp. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- Primary key declared in the column definition: `release_id`.

- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE`

Parent tables: [BOOKINGS](BOOKINGS.md) via `booking_id`

Child tables: None.

### Where it is used

[itemReleases.php](../../Backend/Files/itemReleases.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

released_by is text, not a USERS foreign key. A release row does not itself change booking/item status.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: ITEM_HISTORY](ITEM_HISTORY.md) · [Next table: PACKAGES](PACKAGES.md) · [Back to Start Here](../../Start%20Here.md)
