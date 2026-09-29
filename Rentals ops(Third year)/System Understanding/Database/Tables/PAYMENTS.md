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

One row per rental payment; many payments can belong to a booking.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

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

## Keys and relationships

- `PRIMARY KEY (payment_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

Additional indexes:

- `CREATE INDEX idx_payments_booking ON PAYMENTS(booking_id);`

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/payments.php|payments.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

PAYMENTS.payment_status is the per-record enum. BOOKINGS.payment_status is a separate aggregate string. Deposits are stored separately.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
