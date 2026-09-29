---
title: "CUSTOMERS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# CUSTOMERS

## Overview

**Renter contact records.** Each record describes someone renting a service. A customer can be linked to more than one booking.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `CUSTOMERS` is the label used by the code.

## Example

Ana’s name and contact are saved here, and her booking uses that customer reference.

## Main fields

full_name and contact_number describe the renter; customer_id identifies the record.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Booking and Pricing]] for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

People renting services; one customer can have many bookings.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `customer_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Human name; USERS account name or CUSTOMERS renter name. |
| `contact_number` | `VARCHAR(20)` | `Nullable; implicit NULL default` | Contact number; account login identifier in USERS. |
| `messenger_handle` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Customer contact metadata; booking routes sometimes write email here. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (customer_id)`

Parent tables: None.

Child tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] via `customer_id`

### Where it is used

[[System Understanding/Backend/Files/customers.php|customers.php]], [[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

contact_number is not UNIQUE. Booking creation may reuse a contact; name/contact edits affect shared customer data.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
