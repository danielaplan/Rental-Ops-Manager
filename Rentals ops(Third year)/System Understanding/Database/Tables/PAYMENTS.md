---
title: "PAYMENTS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# PAYMENTS

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Rental-money entries.** Each record is one payment toward a booking. Several payments can belong to the same booking.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `PAYMENTS` is the label used by the code.

## Example

Ana pays ₱250 now and can pay more toward the remaining rental balance later.

## Main fields

booking_id identifies the rental; amount records this payment; payment_date records its time.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Payments and Deposits](../../Workflows/Payments%20and%20Deposits.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

One row per rental payment; many payments can belong to a booking.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `payment_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL` | Parent booking reference. |
| `amount` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Recorded rental payment amount; not refundable deposit. |
| `payment_method` | `ENUM('gcash','maribank')` | `NOT NULL` | Stored gcash or maribank enum. |
| `payment_status` | `ENUM('paid','unpaid','partial')` | `NOT NULL DEFAULT 'unpaid'` | Status of this payment row; create writes paid. |
| `payment_date` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Payment timestamp, defaults to database current time. |
| `notes` | `TEXT` | `Nullable; implicit NULL default` | Free-text record remarks. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (payment_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

Additional indexes:

- `CREATE INDEX idx_payments_booking ON PAYMENTS(booking_id);`

Parent tables: [BOOKINGS](BOOKINGS.md) via `booking_id`

Child tables: None.

### Where it is used

[payments.php](../../Backend/Files/payments.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

PAYMENTS.payment_status is the per-record enum. BOOKINGS.payment_status is a separate aggregate string. Deposits are stored separately.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: PACKAGES](PACKAGES.md) · [Next table: RENTAL_ITEMS](RENTAL_ITEMS.md) · [Back to Start Here](../../Start%20Here.md)
