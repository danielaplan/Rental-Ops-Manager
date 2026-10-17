---
title: "CHECKLIST_TEMPLATES"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# CHECKLIST_TEMPLATES

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Versioned package checklist headers.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `template_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `package_id` | `INT NOT NULL` |
| `template_name` | `VARCHAR(150) NOT NULL` |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'Active'` |

## Keys and relationships

- `FOREIGN KEY (package_id) REFERENCES PACKAGES(package_id) ON DELETE RESTRICT`

- `package_id` → [PACKAGES](PACKAGES.md).`package_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [checklist_service.php](../../Backend/Files/checklist_service.php.md), [checklistTemplates.php](../../Backend/Files/checklistTemplates.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
