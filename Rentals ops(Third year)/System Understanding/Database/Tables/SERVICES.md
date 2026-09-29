---
title: "SERVICES"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# SERVICES

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../../Backend/File%20Inventory.md) · [Database tables](../Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The main offerings.** Each record names one service line. The initial catalog includes karaoke, Sweet Corner and balloon decoration.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `SERVICES` is the label used by the code.

## Example

Ana selects karaoke as her service.

## Main fields

service_name names the offering; service_id links packages, extras and bookings to it.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the workflow. The overview describes the table’s purpose and use. The column dictionary records exact field names and storage rules.

## Technical details

This section records exact file behavior, field names and implementation details.

The service catalog: seed id 1 Karaoke, id 2 Sweet Corner, id 3 Balloon Decoration.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `service_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `service_name` | `VARCHAR(50)` | `NOT NULL` | Display name of the service. |
| `description` | `TEXT` | `Nullable; implicit NULL default` | Free-text catalog explanation. |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Active'` | Catalog activation/status label. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (service_id)`

Parent tables: None.

Child tables: [ADDONS](ADDONS.md) via `service_id`, [RENTAL_ITEMS](RENTAL_ITEMS.md) via `service_id`, [PACKAGES](PACKAGES.md) via `service_id`, [BOOKINGS](BOOKINGS.md) via `service_id`, [BOOKING_ITEMS](BOOKING_ITEMS.md) via `service_id`

### Where it is used

[services.php](../../Backend/Files/services.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [booking_pricing.php](../../Backend/Files/booking_pricing.php.md), [sync.php](../../Backend/Files/sync.php.md). Relevant read/write behavior is explained in each file note.

### Important behavior

Karaoke scheduling and locking depend on service_id=1. No category_id relationship exists.

See [Table Relationships](../Table%20Relationships.md).

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

## Continue reading

[Previous table: RENTAL_ITEMS](RENTAL_ITEMS.md) · [Next table: SESSIONS](SESSIONS.md) · [Back to Start Here](../../Start%20Here.md)
