---
title: "ITEM_RELEASES"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# ITEM_RELEASES

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Append-only equipment release events.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `release_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `booking_id` | `INT NOT NULL` |
| `released_by` | `VARCHAR(100)` |
| `notes` | `TEXT` |
| `released_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

## Keys and relationships

- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE ON UPDATE CASCADE`

- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE CASCADE ON UPDATE CASCADE)

## Runtime use

Source files that directly mention this table: [itemReleases.php](../../Backend/Files/itemReleases.php.md), [supporting_service.php](../../Backend/Files/supporting_service.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)
