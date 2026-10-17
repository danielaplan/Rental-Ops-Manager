---
title: "MIGRATION_ARCHIVE"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# MIGRATION_ARCHIVE

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Migration-only archive of original source records and resolutions.

**Status:** migration tooling, not ordinary rental workflow data.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `archive_id` | `BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `migration_key` | `VARCHAR(80) NOT NULL` |
| `source_table` | `VARCHAR(64) NOT NULL` |
| `source_id` | `VARCHAR(100) NOT NULL` |
| `target_table` | `VARCHAR(64) NULL` |
| `target_id` | `VARCHAR(100) NULL` |
| `source_record` | `JSON NOT NULL` |
| `resolution` | `JSON NULL` |
| `imported_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

## Keys and relationships

- `UNIQUE KEY uq_archive_source (migration_key, source_table, source_id)`

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [audit.php](../../Backend/Files/audit.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
