---
title: "SCHEMA_MIGRATIONS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# SCHEMA_MIGRATIONS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Receipts for applied schema migrations.

**Status:** migration tooling, not ordinary rental workflow data.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `migration_key` | `VARCHAR(80) NOT NULL PRIMARY KEY` |
| `applied_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `summary` | `JSON NOT NULL` |

## Keys and relationships

- No additional key declaration beyond the column definitions.

- No foreign keys are declared for this table.

## Runtime use

No PHP API file directly names this table; it may be used by SQL setup or migration tooling.

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
