---
title: "ITEM_HISTORY"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# ITEM_HISTORY

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Append-only equipment movement/condition history.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `history_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `rental_item_id` | `INT` |
| `booking_id` | `INT` |
| `action` | `VARCHAR(40) NOT NULL` |
| `qty` | `INT NOT NULL DEFAULT 0` |
| `condition` | `VARCHAR(100)` |
| `event_date` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

## Keys and relationships

- `FOREIGN KEY (rental_item_id) REFERENCES RENTAL_ITEMS(rental_item_id) ON DELETE SET NULL ON UPDATE CASCADE`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE SET NULL ON UPDATE CASCADE`

- `rental_item_id` → [RENTAL_ITEMS](RENTAL_ITEMS.md).`rental_item_id` (ON DELETE SET NULL ON UPDATE CASCADE)
- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE SET NULL ON UPDATE CASCADE)

## Runtime use

Source files that directly mention this table: [crud.php](../../Backend/Files/crud.php.md), [itemHistory.php](../../Backend/Files/itemHistory.php.md), [supporting_service.php](../../Backend/Files/supporting_service.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
