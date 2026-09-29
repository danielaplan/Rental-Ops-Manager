---
title: "APP_SETTINGS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# APP_SETTINGS

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Settings and accepted-sync memory.** Record 1 stores application settings. Reserved record 2 remembers accepted offline actions and their real record numbers.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `APP_SETTINGS` is the label used by the code.

## Example

Record 2 helps recognize a repeated queued payment for Ana, so the same accepted action is not saved again.

## Main fields

settings_id selects the record; settings contains the structured information stored inside it.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Offline Synchronization](../../Workflows/Offline%20Synchronization.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

JSON configuration row 1 and reserved sync-state row 2.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `settings_id` | `INT` | `NOT NULL PRIMARY KEY DEFAULT 1` | Unique identifier for this table row. |
| `settings` | `JSON` | `NOT NULL` | Configuration JSON (row 1) or receipt/ID-map JSON (row 2). |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- Primary key declared in the column definition: `settings_id`.


Parent tables: None.

Child tables: None.

### Where it is used

[settings.php](../../Backend/Files/settings.php.md), [sync_state.php](../../Backend/Files/sync_state.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Row 1 stores settings; row 2 stores receipts and ids, initialized on commit. This internal state is not a new table. See Offline Synchronization.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: ADDONS](ADDONS.md) · [Next table: BOOKINGS](BOOKINGS.md) · [Back to Start Here](../../Start%20Here.md)
