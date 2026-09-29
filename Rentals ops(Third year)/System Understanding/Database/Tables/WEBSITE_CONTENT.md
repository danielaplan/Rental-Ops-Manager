---
title: "WEBSITE_CONTENT"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# WEBSITE_CONTENT

A JSON content document at content_id=1.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `content_id` | `INT` | `NOT NULL PRIMARY KEY DEFAULT 1` | Unique identifier for this table row. |
| `content` | `JSON` | `NOT NULL` | Whole website content JSON object. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships



Parent tables: None.

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/websiteContent.php|websiteContent.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Updates replace the whole payload; its JSON keys are not constrained by schema.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
