---
title: "ADDONS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# ADDONS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Optional priced extras belonging to a service.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `addon_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `service_id` | `INT NOT NULL` |
| `name` | `VARCHAR(100) NOT NULL` |
| `price` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'Active'` |

## Keys and relationships

- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT ON UPDATE CASCADE`

- `service_id` → [SERVICES](SERVICES.md).`service_id` (ON DELETE RESTRICT ON UPDATE CASCADE)

## Runtime use

Source files that directly mention this table: [booking_pricing.php](../../Backend/Files/booking_pricing.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [catalog_definitions.php](../../Backend/Files/catalog_definitions.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
