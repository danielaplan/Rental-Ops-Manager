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

JSON configuration row 1 and reserved sync-state row 2.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `settings_id` | `INT` | `NOT NULL PRIMARY KEY DEFAULT 1` | Unique identifier for this table row. |
| `settings` | `JSON` | `NOT NULL` | Configuration JSON (row 1) or receipt/ID-map JSON (row 2). |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships



Parent tables: None.

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/settings.php|settings.php]], [[System Understanding/Backend/Files/sync_state.php|sync_state.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Row 1 stores settings; row 2 stores receipts and ids, initialized on commit. This internal state is not a new table. See Offline Synchronization.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
