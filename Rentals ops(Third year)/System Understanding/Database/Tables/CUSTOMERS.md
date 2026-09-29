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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Renter contact records.** Each record describes someone renting a service. A customer can be linked to more than one booking.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `CUSTOMERS` is the label used by the code.

## Example

Ana’s name and contact are saved here, and her booking uses that customer reference.

## Main fields

full_name and contact_number describe the renter; customer_id identifies the record.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

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

Child tables: [BOOKINGS](BOOKINGS.md) via `customer_id`

### Where it is used

[customers.php](../../Backend/Files/customers.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

contact_number is not UNIQUE. Booking creation may reuse a contact; name/contact edits affect shared customer data.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: CATEGORIES](CATEGORIES.md) · [Next table: DELIVERY](DELIVERY.md) · [Back to Start Here](../../Start%20Here.md)
