---
title: "BOOKINGS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# BOOKINGS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Central rental record, snapshots, blocked interval, lifecycle, totals, and release fields.

**Status:** current schema table.

## Ana example

Ana’s row keeps her event, blocked interval, snapshots, agreed total, status, and release facts.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `booking_id` | `INT NOT NULL AUTO_INCREMENT` |
| `customer_id` | `INT NOT NULL` |
| `service_id` | `INT NOT NULL` |
| `package_id` | `INT NULL` |
| `created_by` | `INT NOT NULL` |
| `event_date` | `DATE NOT NULL` |
| `start_time` | `TIME NOT NULL` |
| `end_time` | `TIME NOT NULL` |
| `event_location` | `VARCHAR(255)` |
| `status` | `VARCHAR(30) NOT NULL DEFAULT 'pending'` |
| `sync_status` | `ENUM('synced','pending_sync') NOT NULL DEFAULT 'pending_sync'` |
| `service_ids` | `JSON NULL` |
| `addon_ids` | `JSON NULL` |
| `discount` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `fees` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `subtotal` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `addons_total` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `total` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `amount_paid` | `DECIMAL(10,2) NOT NULL DEFAULT 0` |
| `payment_status` | `VARCHAR(20) NOT NULL DEFAULT 'Unpaid'` |
| `source` | `VARCHAR(50)` |
| `guests` | `INT` |
| `event_type` | `VARCHAR(100)` |
| `special_requests` | `TEXT` |
| `email` | `VARCHAR(255)` |
| `customer_type` | `VARCHAR(100)` |
| `booking_reference` | `VARCHAR(50) NULL` |
| `event_start_datetime` | `DATETIME NULL` |
| `event_end_datetime` | `DATETIME NULL` |
| `preparation_minutes` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `travel_minutes` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `blocked_start_datetime` | `DATETIME NULL` |
| `blocked_end_datetime` | `DATETIME NULL` |
| `theme_notes` | `TEXT` |
| `package_name_snapshot` | `VARCHAR(100) NULL` |
| `package_price_snapshot` | `DECIMAL(10,2) NULL` |
| `agreed_total` | `DECIMAL(10,2) NOT NULL DEFAULT 0.00` |
| `cancellation_reason` | `TEXT` |
| `awaiting_completion_at` | `DATETIME NULL` |
| `completed_at` | `DATETIME NULL` |
| `released_by` | `INT NULL` |
| `review_notes` | `TEXT` |
| `created_at` | `DATETIME NULL` |
| `updated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

## Keys and relationships

- `PRIMARY KEY (booking_id)`
- `UNIQUE KEY uq_bookings_reference (booking_reference)`
- `KEY idx_bookings_blocked (service_id, status, blocked_start_datetime, blocked_end_datetime)`
- `FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (package_id) REFERENCES PACKAGES(package_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE RESTRICT`

- `customer_id` → [CUSTOMERS](CUSTOMERS.md).`customer_id` (ON UPDATE CASCADE ON DELETE RESTRICT)
- `service_id` → [SERVICES](SERVICES.md).`service_id` (ON UPDATE CASCADE ON DELETE RESTRICT)
- `package_id` → [PACKAGES](PACKAGES.md).`package_id` (ON UPDATE CASCADE ON DELETE RESTRICT)
- `created_by` → [USERS](USERS.md).`user_id` (ON UPDATE CASCADE ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [availabilityBlocks.php](../../Backend/Files/availabilityBlocks.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [crud.php](../../Backend/Files/crud.php.md), [customers.php](../../Backend/Files/customers.php.md), [domain.php](../../Backend/Files/domain.php.md), [notifications.php](../../Backend/Files/notifications.php.md), [payment_service.php](../../Backend/Files/payment_service.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
