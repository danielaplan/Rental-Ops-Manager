---
title: "GALLERY"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# GALLERY

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Image-record information.** Each record stores an image value, optional title and featured flag.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `GALLERY` is the label used by the code.

## Example

An owner adds a titled gallery image record.

## Main fields

title describes it; image stores the image value as text; featured marks whether it is featured.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [System Overview](../../System%20Overview.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Image text and featured metadata.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `image_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `title` | `VARCHAR(150)` | `Nullable; implicit NULL default` | Optional gallery image title. |
| `image` | `TEXT` | `NOT NULL` | Image value stored as text. |
| `featured` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | Boolean-style featured flag. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- Primary key declared in the column definition: `image_id`.


Parent tables: None.

Child tables: None.

### Where it is used

[gallery.php](../../Backend/Files/gallery.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Not a file-upload table with a dedicated backend media pipeline.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: EQUIPMENT_CHECKLIST](EQUIPMENT_CHECKLIST.md) · [Next table: ITEM_HISTORY](ITEM_HISTORY.md) · [Back to Start Here](../../Start%20Here.md)
