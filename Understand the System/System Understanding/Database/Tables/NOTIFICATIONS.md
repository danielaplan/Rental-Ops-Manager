---
title: "NOTIFICATIONS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# NOTIFICATIONS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Persistent owner action notices for lifecycle work.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `notification_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `user_id` | `INT NOT NULL` |
| `booking_id` | `INT NOT NULL` |
| `notification_type` | `VARCHAR(50) NOT NULL` |
| `message` | `TEXT NOT NULL` |
| `requires_action` | `TINYINT(1) NOT NULL DEFAULT 1` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `resolved_at` | `DATETIME NULL` |

## Keys and relationships

- `UNIQUE KEY uq_notification_recipient (user_id, booking_id, notification_type)`
- `KEY idx_notifications_unresolved (user_id, resolved_at, created_at)`
- `FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE RESTRICT`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE RESTRICT`

- `user_id` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)
- `booking_id` → [BOOKINGS](BOOKINGS.md).`booking_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [notifications.php](../../Backend/Files/notifications.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
