---
title: "PAYMENTS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# PAYMENTS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Rental-payment events; only Completed rows count toward balances and revenue.

**Status:** current schema table.

## Ana example

Each recorded rental payment for Ana is a separate row.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `payment_id` | `INT NOT NULL AUTO_INCREMENT` |
| `booking_id` | `INT NOT NULL` |
| `amount` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `payment_method` | `ENUM('gcash','maribank') NOT NULL` |
| `payment_status` | `VARCHAR(20) NOT NULL DEFAULT 'Pending'` |
| `payment_date` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `notes` | `TEXT` |
| `payment_type` | `VARCHAR(30) NULL` |
| `payment_reference` | `VARCHAR(150) NULL` |
| `recorded_by` | `INT NULL` |
| `recorded_at` | `DATETIME NULL` |
| `provenance` | `VARCHAR(30) NOT NULL DEFAULT 'owner'` |

## Keys and relationships

- `PRIMARY KEY (payment_id)`
- `KEY idx_payments_date (payment_status, payment_date)`
- `FOREIGN KEY (recorded_by) REFERENCES USERS(user_id) ON DELETE RESTRICT`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

- `recorded_by` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)
- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON UPDATE CASCADE ON DELETE CASCADE)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [payment_service.php](../../Backend/Files/payment_service.php.md), [payments.php](../../Backend/Files/payments.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
