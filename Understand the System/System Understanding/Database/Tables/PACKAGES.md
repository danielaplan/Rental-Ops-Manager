---
title: "PACKAGES"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# PACKAGES

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Priced service packages, promotions, deposit requirements, and lifecycle status.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `package_id` | `INT NOT NULL AUTO_INCREMENT` |
| `service_id` | `INT NOT NULL` |
| `package_name` | `VARCHAR(100) NOT NULL` |
| `price` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `description` | `TEXT` |
| `inclusions` | `TEXT` |
| `duration_minutes` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `requires_deposit` | `TINYINT(1) NOT NULL DEFAULT 0` |
| `deposit_amount` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `is_promotional` | `TINYINT(1) NOT NULL DEFAULT 0` |
| `promotion_start_date` | `DATE NULL` |
| `promotion_end_date` | `DATE NULL` |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'Active'` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

## Keys and relationships

- `PRIMARY KEY (package_id)`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`

- `service_id` → [SERVICES](SERVICES.md).`service_id` (ON UPDATE CASCADE ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [booking_pricing.php](../../Backend/Files/booking_pricing.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [catalog_definitions.php](../../Backend/Files/catalog_definitions.php.md), [checklistTemplates.php](../../Backend/Files/checklistTemplates.php.md), [crud.php](../../Backend/Files/crud.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
