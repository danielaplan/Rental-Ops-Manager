---
title: "BOOKINGS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# BOOKINGS

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The central rental record.** Each record brings together the renter, event, selected primary service/package and payment summary.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `BOOKINGS` is the label used by the code.

## Example

Ana’s karaoke booking has a date, time and location; its number links her payment, deposit and equipment records.

## Main fields

booking_id is the booking number; customer_id links the renter; event_date schedules it; total and amount_paid summarize rental money.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Central rental record linking customer, primary service/package, and creating account.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `booking_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `customer_id` | `INT` | `NOT NULL` | Renter reference. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `package_id` | `INT` | `NOT NULL` | Package reference. |
| `created_by` | `INT` | `NOT NULL` | Foreign key to the account that created the booking. |
| `event_date` | `DATE` | `NOT NULL` | Scheduled event date, also the report date-filter basis. |
| `start_time` | `TIME` | `NOT NULL` | Same-day start time. |
| `end_time` | `TIME` | `NOT NULL` | Same-day end time; booking validation requires it after start. |
| `event_location` | `VARCHAR(255)` | `Nullable; implicit NULL default` | Venue/location text. |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | Booking state stored as text, normalized to lowercase by writes. |
| `sync_status` | `ENUM('synced','pending_sync')` | `NOT NULL DEFAULT 'pending_sync'` | Stored booking sync marker; distinct from device outbox/receipt state. |
| `service_ids` | `JSON` | `NULL` | JSON service selections; primary first service controls backend price/slot logic. |
| `addon_ids` | `JSON` | `NULL` | JSON selected add-on IDs; no SQL foreign keys inside this JSON. |
| `discount` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Amount subtracted from package + extras. |
| `fees` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Additional booking fees added to price. |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored base package price calculated by PHP. |
| `addons_total` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored sum of selected distinct extras. |
| `total` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored rental total, clamped to at least zero by pricing. |
| `amount_paid` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored aggregate rental payments used by reports. |
| `payment_status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Unpaid'` | Aggregate Unpaid/Partial/Fully Paid label. |
| `source` | `VARCHAR(50)` | `Nullable; implicit NULL default` | Booking origin label. |
| `guests` | `INT` | `Nullable; implicit NULL default` | Optional guest count. |
| `event_type` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Optional event type. |
| `special_requests` | `TEXT` | `Nullable; implicit NULL default` | Optional customer requests. |
| `email` | `VARCHAR(255)` | `Nullable; implicit NULL default` | Optional booking contact email. |
| `customer_type` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Optional descriptive customer classification. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (booking_id)`
- `FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (package_id) REFERENCES PACKAGES(package_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE RESTRICT`

Additional indexes:

- `CREATE INDEX idx_bookings_event_date ON BOOKINGS(event_date);`
- `CREATE INDEX idx_bookings_status ON BOOKINGS(status);`
- `CREATE INDEX idx_bookings_service ON BOOKINGS(service_id);`

Parent tables: [CUSTOMERS](CUSTOMERS.md) via `customer_id`, [SERVICES](SERVICES.md) via `service_id`, [PACKAGES](PACKAGES.md) via `package_id`, [USERS](USERS.md) via `created_by`

Child tables: [PAYMENTS](PAYMENTS.md) via `booking_id`, [DEPOSITS](DEPOSITS.md) via `booking_id`, [EQUIPMENT_CHECKLIST](EQUIPMENT_CHECKLIST.md) via `booking_id`, [BOOKING_ITEMS](BOOKING_ITEMS.md) via `booking_id`, [ITEM_RELEASES](ITEM_RELEASES.md) via `booking_id`, [ITEM_HISTORY](ITEM_HISTORY.md) via `booking_id`, [DELIVERY](DELIVERY.md) via `booking_id`

### Where it is used

[bookings.php](../../Backend/Files/bookings.php.md), [payments.php](../../Backend/Files/payments.php.md), [reports.php](../../Backend/Files/reports.php.md), [equipment_service.php](../../Backend/Files/equipment_service.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Primary service and package are relational, while service_ids/addon_ids are JSON selections. Only the first selected service is priced/scheduled. sync_status defaults to pending_sync and is not consistently changed by these write paths; receipt/outbox state is separate.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: APP_SETTINGS](APP_SETTINGS.md) · [Next table: BOOKING_ITEMS](BOOKING_ITEMS.md) · [Back to Start Here](../../Start%20Here.md)
