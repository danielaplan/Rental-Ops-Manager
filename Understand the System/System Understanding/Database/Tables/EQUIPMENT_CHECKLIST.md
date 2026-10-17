---
title: "EQUIPMENT_CHECKLIST"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# EQUIPMENT_CHECKLIST

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Legacy checklist structure retained for transition compatibility.

**Status:** legacy compatibility table; the revised package-snapshot workflow uses `BOOKING_CHECKLIST_ITEMS`.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `checklist_id` | `INT NOT NULL AUTO_INCREMENT` |
| `booking_id` | `INT NOT NULL` |
| `rental_item_id` | `INT` |
| `item_name` | `VARCHAR(100) NOT NULL` |
| `condition_out` | `VARCHAR(255)` |
| `condition_in` | `VARCHAR(255)` |
| `expected_qty` | `INT NOT NULL DEFAULT 0` |
| `returned_qty` | `INT NOT NULL DEFAULT 0` |
| `inspection_notes` | `TEXT` |
| `return_status` | `ENUM('pending','inspected','damaged','missing') NOT NULL DEFAULT 'pending'` |
| `checked_by` | `INT` |

## Keys and relationships

- `PRIMARY KEY (checklist_id)`
- `UNIQUE KEY uq_equipment_booking_item (booking_id, rental_item_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON UPDATE CASCADE ON DELETE SET NULL`
- `FOREIGN KEY (checked_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE SET NULL`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON UPDATE CASCADE ON DELETE CASCADE)
- `rental_item_id` → [RENTAL_ITEMS](RENTAL_ITEMS.md).`rental_item_id` (ON UPDATE CASCADE ON DELETE SET NULL)
- `checked_by` → [USERS](USERS.md).`user_id` (ON UPDATE CASCADE ON DELETE SET NULL)

## Runtime use

Source files that directly mention this table: [crud.php](../../Backend/Files/crud.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
