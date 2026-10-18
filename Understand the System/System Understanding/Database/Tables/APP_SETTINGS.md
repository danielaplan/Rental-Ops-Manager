---
title: "APP_SETTINGS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# APP_SETTINGS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

JSON settings in row 1 and private sync receipts/ID maps in row 2.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `settings_id` | `INT NOT NULL PRIMARY KEY DEFAULT 1` |
| `settings` | `JSON NOT NULL` |

## Keys and relationships

- No additional key declaration beyond the column definitions.

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [settings.php](../../Backend/Files/settings.php.md), [sync_state.php](../../Backend/Files/sync_state.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
