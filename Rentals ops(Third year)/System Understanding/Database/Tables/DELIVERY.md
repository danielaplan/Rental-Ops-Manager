---
title: "DELIVERY"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# DELIVERY

## In plain language

**The transport arrangement.** Each booking can have one current record describing delivery and fee responsibility.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `DELIVERY` is the label used by the code.

## Example

Ana’s equipment travels by Lalamove and the renter shoulders the fee.

## Details to recognize first

delivery_method describes transport; delivery_fee records the charge; fee_shouldered_by records responsibility.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Booking and Pricing]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

One current delivery arrangement per booking.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `delivery_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL UNIQUE` | Parent booking reference. |
| `delivery_method` | `ENUM('self_pickup','lalamove','owner_delivered')` | `NOT NULL DEFAULT 'self_pickup'` | self_pickup/lalamove/owner_delivered transport choice. |
| `delivery_fee` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Recorded logistics charge. |
| `fee_shouldered_by` | `ENUM('renter','owner')` | `NOT NULL DEFAULT 'renter'` | renter/owner fee responsibility. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (delivery_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

Additional indexes:

- `CREATE INDEX idx_delivery_booking ON DELIVERY(booking_id);`

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/delivery.php|delivery.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

UNIQUE booking_id makes this zero-or-one, not many. Delivery fee is separate from BOOKINGS.fees unless caller coordinates it.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
