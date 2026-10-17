---
title: "DELIVERY"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# DELIVERY

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

One optional delivery arrangement per booking.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `delivery_id` | `INT NOT NULL AUTO_INCREMENT` |
| `booking_id` | `INT NOT NULL UNIQUE` |
| `delivery_method` | `ENUM('self_pickup','lalamove','owner_delivered') NOT NULL DEFAULT 'self_pickup'` |
| `delivery_fee` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `fee_shouldered_by` | `VARCHAR(30) NOT NULL DEFAULT 'Customer'` |
| `delivery_notes` | `TEXT` |
| `created_at` | `DATETIME NULL` |

## Keys and relationships

- `PRIMARY KEY (delivery_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON UPDATE CASCADE ON DELETE CASCADE)

## Runtime use

Source files that directly mention this table: [delivery.php](../../Backend/Files/delivery.php.md), [supporting_service.php](../../Backend/Files/supporting_service.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
