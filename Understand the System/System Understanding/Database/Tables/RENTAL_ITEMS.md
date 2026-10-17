---
title: "RENTAL_ITEMS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# RENTAL_ITEMS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Equipment catalog used by history and checklist links.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `rental_item_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `service_id` | `INT NOT NULL` |
| `name` | `VARCHAR(100) NOT NULL` |
| `quantity` | `INT NOT NULL DEFAULT 1` |
| `item_code` | `VARCHAR(50)` |
| `required` | `TINYINT(1) NOT NULL DEFAULT 0` |
| `tracking` | `VARCHAR(30) NOT NULL DEFAULT 'quantity'` |
| `status` | `VARCHAR(40) NOT NULL DEFAULT 'Available'` |
| `condition` | `VARCHAR(100) NOT NULL DEFAULT 'Good'` |
| `notes` | `TEXT` |

## Keys and relationships

- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT ON UPDATE CASCADE`

- `service_id` → [SERVICES](SERVICES.md).`service_id` (ON DELETE RESTRICT ON UPDATE CASCADE)

## Runtime use

Source files that directly mention this table: [catalog_definitions.php](../../Backend/Files/catalog_definitions.php.md), [crud.php](../../Backend/Files/crud.php.md), [supporting_service.php](../../Backend/Files/supporting_service.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)
