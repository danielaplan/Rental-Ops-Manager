---
title: "PAYMENTS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# PAYMENTS

## In plain language

**Rental-money entries.** Each record is one payment toward a booking. Several payments can belong to the same booking.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `PAYMENTS` is the label used by the code.

## Example

Ana pays ₱250 now and can pay more toward the remaining rental balance later.

## Details to recognize first

booking_id identifies the rental; amount records this payment; payment_date records its time.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Payments and Deposits]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/payments.php|payments.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

PAYMENTS.payment_status is the per-record enum. BOOKINGS.payment_status is a separate aggregate string. Deposits are stored separately.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
