---
title: "CHECKLIST_TEMPLATE_ITEMS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# CHECKLIST_TEMPLATE_ITEMS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Expected item names and quantities inside a template.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `template_item_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `template_id` | `INT NOT NULL` |
| `item_name` | `VARCHAR(100) NOT NULL` |
| `expected_quantity` | `INT UNSIGNED NOT NULL DEFAULT 0` |

## Keys and relationships

- `FOREIGN KEY (template_id) REFERENCES CHECKLIST_TEMPLATES(template_id) ON DELETE RESTRICT`

- `template_id` → [CHECKLIST_TEMPLATES](CHECKLIST_TEMPLATES.md).`template_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [checklist_service.php](../../Backend/Files/checklist_service.php.md), [checklistTemplates.php](../../Backend/Files/checklistTemplates.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
