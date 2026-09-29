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

Image text and featured metadata.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `image_id` | `INT` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Unique identifier for this table row. |
| `title` | `VARCHAR(150)` | `Nullable; implicit NULL default` | Optional gallery image title. |
| `image` | `TEXT` | `NOT NULL` | Image value stored as text. |
| `featured` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | Boolean-style featured flag. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships



Parent tables: None.

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/gallery.php|gallery.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Not a file-upload table with a dedicated backend media pipeline.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
