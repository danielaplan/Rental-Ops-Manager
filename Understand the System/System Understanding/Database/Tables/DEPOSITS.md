---
title: "DEPOSITS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# DEPOSITS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

One held refundable deposit per booking.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `deposit_id` | `INT NOT NULL AUTO_INCREMENT` |
| `booking_id` | `INT NOT NULL UNIQUE` |
| `amount_held` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `deduction_amount` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `deduction_reason` | `TEXT` |
| `refund_status` | `VARCHAR(20) NOT NULL DEFAULT 'Held'` |
| `refund_date` | `DATETIME NULL` |
| `recorded_by` | `INT NULL` |
| `provenance` | `VARCHAR(30) NOT NULL DEFAULT 'owner'` |
| `created_at` | `DATETIME NULL` |
| `updated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

## Keys and relationships

- `PRIMARY KEY (deposit_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON UPDATE CASCADE ON DELETE CASCADE)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [deposit_service.php](../../Backend/Files/deposit_service.php.md), [deposits.php](../../Backend/Files/deposits.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)
