---
title: "BOOKING_CHECKLIST_ITEMS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# BOOKING_CHECKLIST_ITEMS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Booking-specific checklist snapshots and release/return inspection facts.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `checklist_item_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `booking_id` | `INT NOT NULL` |
| `template_item_id` | `INT NULL` |
| `rental_item_id` | `INT NULL` |
| `item_name_snapshot` | `VARCHAR(100) NOT NULL` |
| `expected_quantity` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `quantity_released` | `INT UNSIGNED NULL DEFAULT 0` |
| `quantity_returned` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `condition_out` | `VARCHAR(255) NULL` |
| `condition_in` | `VARCHAR(255) NULL` |
| `return_status` | `VARCHAR(30) NOT NULL DEFAULT 'pending'` |
| `checked_by` | `INT NULL` |
| `checked_at` | `DATETIME NULL` |
| `legacy_checklist_id` | `INT NULL` |

## Keys and relationships

- `UNIQUE KEY uq_checklist_legacy (legacy_checklist_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT`
- `FOREIGN KEY (template_item_id) REFERENCES CHECKLIST_TEMPLATE_ITEMS(template_item_id) ON DELETE RESTRICT`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE RESTRICT`
- `FOREIGN KEY (checked_by) REFERENCES USERS(user_id) ON DELETE RESTRICT`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE RESTRICT)
- `template_item_id` → [CHECKLIST_TEMPLATE_ITEMS](CHECKLIST_TEMPLATE_ITEMS.md).`template_item_id` (ON DELETE RESTRICT)
- `rental_item_id` → [RENTAL_ITEMS](RENTAL_ITEMS.md).`rental_item_id` (ON DELETE RESTRICT)
- `checked_by` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [bookingItems.php](../../Backend/Files/bookingItems.php.md), [checklist_service.php](../../Backend/Files/checklist_service.php.md), [crud.php](../../Backend/Files/crud.php.md), [equipment.php](../../Backend/Files/equipment.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
