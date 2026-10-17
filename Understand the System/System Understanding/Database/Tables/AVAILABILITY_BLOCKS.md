---
title: "AVAILABILITY_BLOCKS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# AVAILABILITY_BLOCKS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Draft internal blockout records; feature remains deferred by owner decision.

**Status:** structural/draft artifact; internal blockout functionality remains deferred.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `block_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `service_id` | `INT NULL` |
| `start_datetime` | `DATETIME NOT NULL` |
| `end_datetime` | `DATETIME NOT NULL` |
| `reason` | `TEXT NOT NULL` |
| `created_by` | `INT NOT NULL` |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'Active'` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

## Keys and relationships

- `KEY idx_blocks_interval (service_id, status, start_datetime, end_datetime)`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE RESTRICT`
- `FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON DELETE RESTRICT`

- `service_id` → [SERVICES](SERVICES.md).`service_id` (ON DELETE RESTRICT)
- `created_by` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [availabilityBlocks.php](../../Backend/Files/availabilityBlocks.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)
