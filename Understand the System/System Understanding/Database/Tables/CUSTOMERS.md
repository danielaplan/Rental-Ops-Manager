---
title: "CUSTOMERS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# CUSTOMERS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

People and contact details linked to bookings.

**Status:** current schema table.

## Ana example

Ana has one row that bookings reference.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `customer_id` | `INT NOT NULL AUTO_INCREMENT` |
| `full_name` | `VARCHAR(100) NOT NULL` |
| `contact_number` | `VARCHAR(20)` |
| `messenger_handle` | `VARCHAR(100)` |

## Keys and relationships

- `PRIMARY KEY (customer_id)`

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [availability_service.php](../../Backend/Files/availability_service.php.md), [booking_service.php](../../Backend/Files/booking_service.php.md), [bookings.php](../../Backend/Files/bookings.php.md), [catalog_definitions.php](../../Backend/Files/catalog_definitions.php.md), [crud.php](../../Backend/Files/crud.php.md), [customers.php](../../Backend/Files/customers.php.md), [reports.php](../../Backend/Files/reports.php.md), [sync.php](../../Backend/Files/sync.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
