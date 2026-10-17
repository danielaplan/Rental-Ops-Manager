---
title: "GALLERY"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# GALLERY

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Saved gallery image metadata/content.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `image_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `title` | `VARCHAR(150)` |
| `image` | `TEXT NOT NULL` |
| `featured` | `TINYINT(1) NOT NULL DEFAULT 0` |

## Keys and relationships

- No additional key declaration beyond the column definitions.

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [catalog_definitions.php](../../Backend/Files/catalog_definitions.php.md), [gallery-upload.php](../../Backend/Files/gallery-upload.php.md), [gallery.php](../../Backend/Files/gallery.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
