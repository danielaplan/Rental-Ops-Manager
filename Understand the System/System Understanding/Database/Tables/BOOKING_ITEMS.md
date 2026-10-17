---
title: "BOOKING_ITEMS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# BOOKING_ITEMS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Legacy booking-equipment assignment structure; revised flow uses BOOKING_CHECKLIST_ITEMS.

**Status:** legacy compatibility table; the revised package-snapshot workflow uses `BOOKING_CHECKLIST_ITEMS`.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `booking_item_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `booking_id` | `INT NOT NULL` |
| `rental_item_id` | `INT` |
| `service_id` | `INT` |
| `name` | `VARCHAR(100) NOT NULL` |
| `expected_qty` | `INT NOT NULL DEFAULT 0` |
| `released_qty` | `INT NOT NULL DEFAULT 0` |
| `returned_qty` | `INT NOT NULL DEFAULT 0` |
| `required` | `TINYINT(1) NOT NULL DEFAULT 0` |
| `checked_released` | `TINYINT(1) NOT NULL DEFAULT 0` |
| `condition` | `VARCHAR(100)` |
| `notes` | `TEXT` |

## Keys and relationships

- `UNIQUE KEY uq_booking_item (booking_id, rental_item_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE`
- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE SET NULL ON UPDATE CASCADE`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE CASCADE ON UPDATE CASCADE)
- `rental_item_id` → [RENTAL_ITEMS](RENTAL_ITEMS.md).`rental_item_id` (ON DELETE SET NULL ON UPDATE CASCADE)
- `service_id` → [SERVICES](SERVICES.md).`service_id` (ON DELETE SET NULL ON UPDATE CASCADE)

## Runtime use

Source files that directly mention this table: [crud.php](../../Backend/Files/crud.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
