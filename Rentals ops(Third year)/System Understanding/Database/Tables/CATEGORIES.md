---
title: "CATEGORIES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# CATEGORIES

## Overview

**Standalone catalog labels.** Each record stores a category label. The current database has no saved link assigning a service to a category.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `CATEGORIES` is the label used by the code.

## Example

Entertainment is a label here, but the backend does not automatically connect it to karaoke.

## Main fields

name holds the label; status holds its status text.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Database/Table Relationships]] for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Independent category labels.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `category_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Label of this category, extra, item or checklist snapshot. |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Active'` | Catalog activation/status label. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- Primary key declared in the column definition: `category_id`.


Parent tables: None.

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/categories.php|categories.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

No foreign key connects this table to SERVICES or other catalog tables.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
