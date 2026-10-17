---
title: "WEBSITE_CONTENT"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# WEBSITE_CONTENT

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Single JSON document for editable site content.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `content_id` | `INT NOT NULL PRIMARY KEY DEFAULT 1` |
| `content` | `JSON NOT NULL` |

## Keys and relationships

- No additional key declaration beyond the column definitions.

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [sync.php](../../Backend/Files/sync.php.md), [websiteContent.php](../../Backend/Files/websiteContent.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
