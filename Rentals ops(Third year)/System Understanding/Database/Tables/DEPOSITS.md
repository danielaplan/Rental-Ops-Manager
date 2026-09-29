---
title: "DEPOSITS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# DEPOSITS

## Overview

**The refundable-money summary.** Each booking can have one current deposit summary, separate from its rental payments.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `DEPOSITS` is the label used by the code.

## Example

Ana’s held ₱350 minus a ₱50 cleaning deduction leaves a calculated ₱300 refund.

## Main fields

amount_held is the deposit; deduction_amount reduces it; deduction_reason explains why. The refund amount is calculated, not stored as a column.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Payments and Deposits]] for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

One current refundable deposit summary per booking.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `deposit_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `booking_id` | `INT` | `NOT NULL UNIQUE` | Parent booking reference. |
| `amount_held` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Negotiated refundable deposit amount. |
| `deduction_amount` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Aggregate deduction from deposit. |
| `deduction_reason` | `TEXT` | `Nullable; implicit NULL default` | Reason required by service when deduction > 0. |
| `refund_status` | `ENUM('pending','partial','full','none')` | `NOT NULL DEFAULT 'pending'` | Calculated pending/full/partial/none refund category. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (deposit_id)`
- `FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON UPDATE CASCADE ON DELETE CASCADE`

Additional indexes:

- `CREATE INDEX idx_deposits_booking ON DEPOSITS(booking_id);`

Parent tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `booking_id`

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/deposits.php|deposits.php]], [[System Understanding/Backend/Files/deposit_service.php|deposit_service.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

UNIQUE booking_id means zero or one deposit, despite older design text describing one-to-many. refund_amount is computed by PHP and is not a column. No itemized deductions or refund transfer timestamp.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
