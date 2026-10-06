---
title: "PACKAGES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# PACKAGES

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**Fixed choices and prices.** Each record describes a package under one service.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `PACKAGES` is the label used by the code.

## Example

Ana’s karaoke package costs ₱2,500 in the example.

## Main fields

package_name describes the choice; price supplies its base price; service_id identifies the service.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

Fixed price choices belonging to a service.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `package_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `package_name` | `VARCHAR(100)` | `NOT NULL` | Display label of the package. |
| `price` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Current catalog price used by booking pricing. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (package_id)`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`

Parent tables: [SERVICES](SERVICES.md) via `service_id`

Child tables: [BOOKINGS](BOOKINGS.md) via `package_id`

### Where it is used

[packages.php](../../Backend/Files/packages.php.md), [booking_pricing.php](../../Backend/Files/booking_pricing.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Package/service compatibility is checked in pricing; separate booking foreign keys do not enforce that pairing alone.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: ITEM_RELEASES](ITEM_RELEASES.md) · [Next table: PAYMENTS](PAYMENTS.md) · [Back to Start Here](../../Start%20Here.md)
