---
title: "DELIVERY"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# DELIVERY

One current delivery arrangement per booking.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `delivery_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL UNIQUE` | Parent booking reference. |
| `delivery_method` | `ENUM('self_pickup','lalamove','owner_delivered')` | `NOT NULL DEFAULT 'self_pickup'` | self_pickup/lalamove/owner_delivered transport choice. |
| `delivery_fee` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Recorded logistics charge. |
| `fee_shouldered_by` | `ENUM('renter','owner')` | `NOT NULL DEFAULT 'renter'` | renter/owner fee responsibility. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (delivery_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

Additional indexes:

- `CREATE INDEX idx_delivery_booking ON DELIVERY(booking_id);`

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/delivery.php|delivery.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

UNIQUE booking_id makes this zero-or-one, not many. Delivery fee is separate from BOOKINGS.fees unless caller coordinates it.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
