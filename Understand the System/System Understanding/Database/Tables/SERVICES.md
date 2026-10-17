---
title: "SERVICES"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# SERVICES

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Service catalog plus default preparation and travel allowances.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `service_id` | `INT NOT NULL AUTO_INCREMENT` |
| `service_name` | `VARCHAR(50) NOT NULL` |
| `description` | `TEXT` |
| `default_preparation_minutes` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `default_travel_minutes` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'Active'` |

## Keys and relationships

- `PRIMARY KEY (service_id)`

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [availabilityBlocks.php](../../Backend/Files/availabilityBlocks.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [catalog_definitions.php](../../Backend/Files/catalog_definitions.php.md), [crud.php](../../Backend/Files/crud.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)
