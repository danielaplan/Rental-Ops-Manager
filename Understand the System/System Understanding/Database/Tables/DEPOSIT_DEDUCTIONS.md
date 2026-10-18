---
title: "DEPOSIT_DEDUCTIONS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# DEPOSIT_DEDUCTIONS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Itemized reductions from a held deposit.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `deduction_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `deposit_id` | `INT NOT NULL` |
| `affected_item` | `VARCHAR(255) NOT NULL` |
| `reason` | `TEXT NOT NULL` |
| `amount` | `DECIMAL(10,2) NOT NULL` |
| `recorded_by` | `INT NULL` |
| `recorded_at` | `DATETIME NULL` |
| `provenance` | `VARCHAR(30) NOT NULL DEFAULT 'owner'` |
| `legacy_deposit_id` | `INT NULL` |

## Keys and relationships

- `UNIQUE KEY uq_deduction_legacy (legacy_deposit_id)`
- `FOREIGN KEY (deposit_id) REFERENCES DEPOSITS(deposit_id) ON DELETE RESTRICT`
- `FOREIGN KEY (recorded_by) REFERENCES USERS(user_id) ON DELETE RESTRICT`

- `deposit_id` → [DEPOSITS](DEPOSITS.md).`deposit_id` (ON DELETE RESTRICT)
- `recorded_by` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [deposit_service.php](../../Backend/Files/deposit_service.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
