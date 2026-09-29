---
title: "ITEM_RELEASES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# ITEM_RELEASES

## In plain language

**Equipment handover events.** Each record stores release information for a booking, including the person’s name and remarks.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `ITEM_RELEASES` is the label used by the code.

## Example

Staff save a release note when Ana’s equipment leaves.

## Details to recognize first

released_by is a written name, not an account link; released_at is the time; booking_id identifies the rental.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Equipment Release and Return]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/itemReleases.php|itemReleases.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

released_by is text, not a USERS foreign key. A release row does not itself change booking/item status.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
