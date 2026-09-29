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

## Overview

**Saved content information.** The main record stores a complete structured content object supplied by the owner.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `WEBSITE_CONTENT` is the label used by the code.

## Example

An owner saves content text for later reading by the application.

## Main fields

content_id identifies the record; content holds the supplied object.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/System Overview]] for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

A JSON content document at content_id=1.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `content_id` | `INT` | `NOT NULL PRIMARY KEY DEFAULT 1` | Unique identifier for this table row. |
| `content` | `JSON` | `NOT NULL` | Whole website content JSON object. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- Primary key declared in the column definition: `content_id`.


Parent tables: None.

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/websiteContent.php|websiteContent.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

Updates replace the whole payload; its JSON keys are not constrained by schema.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
