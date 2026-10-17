---
title: "BOOKING_CONFLICT_OVERRIDES"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# BOOKING_CONFLICT_OVERRIDES

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

One audit-like approval per deliberately accepted booking conflict.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `override_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `booking_id` | `INT NOT NULL` |
| `conflicting_booking_id` | `INT NOT NULL` |
| `approved_by` | `INT NOT NULL` |
| `reason` | `TEXT NOT NULL` |
| `approved_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

## Keys and relationships

- `KEY idx_override_booking (booking_id, conflicting_booking_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT`
- `FOREIGN KEY (conflicting_booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT`
- `FOREIGN KEY (approved_by) REFERENCES USERS(user_id) ON DELETE RESTRICT`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE RESTRICT)
- `conflicting_booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE RESTRICT)
- `approved_by` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [reports.php](../../Backend/Files/reports.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
