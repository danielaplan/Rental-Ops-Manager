---
title: "Database Overview"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Database Overview

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend files](../Backend/File%20Inventory.md) · [Database tables](Database%20Overview.md) · [Glossary](../Glossary.md)

## Overview

The database is the shared organized storage for accepted records. Think of it as a collection of connected spreadsheets: customers in one table, bookings in another, payments in another. MySQL is the software that manages this storage.

Each table stores one kind of information. A row is one record; a column is one detail, such as a customer name or event date. Reference numbers connect the records.

## Example: Ana’s records

Ana’s contact details are in CUSTOMERS. Her event details are in BOOKINGS. Her ₱250 rental payment is in PAYMENTS. Her held ₱350 deposit is in DEPOSITS. The payment and deposit each refer to the booking number, so the system can find the right rental without copying every event detail into each record.

## Table groups

| Group | What it keeps |
|---|---|
| People and login | Customers, staff/owner accounts and temporary logins |
| Catalog | Services, packages, extras, categories and equipment templates |
| Rental records | Bookings, rental payments, deposits and delivery |
| Equipment records | Assigned items, saved inspections, release events and history |
| Supporting information | Settings, accepted-sync memory, content and image records |

The source scripts define 19 tables. [Table Relationships](Table%20Relationships.md) explains their connections, and the linked table notes describe each table’s fields and role in its workflow.

## Technical details

This section records exact file behavior, field names and implementation details.

MySQL is the central shared record store. `api/config.php` chooses the database connection; default name is `akad_rentals`. PDO queries use prepared values. The schema uses InnoDB, utf8mb4 and utf8mb4_unicode_ci.

The checked-in scripts define 18 tables in schema.sql and SESSIONS in seed.sql: **19 tables total**. No PHP CREATE TABLE statement is used for an additional runtime table; sync initializes a reserved row in APP_SETTINGS. A live deployment may differ, so this inventory is based on checked-in definitions, not a live schema audit.

| Table | Purpose | Defined in |
|---|---|---|
| [USERS](Tables/USERS.md) | Owner/staff accounts. Customers do not log in through this table. | `db/schema.sql` |
| [CUSTOMERS](Tables/CUSTOMERS.md) | People renting services; one customer can have many bookings. | `db/schema.sql` |
| [SERVICES](Tables/SERVICES.md) | The service catalog: seed id 1 Karaoke, id 2 Sweet Corner, id 3 Balloon Decoration. | `db/schema.sql` |
| [CATEGORIES](Tables/CATEGORIES.md) | Independent category labels. | `db/schema.sql` |
| [ADDONS](Tables/ADDONS.md) | Separately priced optional extras belonging to one service. | `db/schema.sql` |
| [RENTAL_ITEMS](Tables/RENTAL_ITEMS.md) | Reusable item catalog by service, used as the template for booking checklists. | `db/schema.sql` |
| [GALLERY](Tables/GALLERY.md) | Image text and featured metadata. | `db/schema.sql` |
| [WEBSITE_CONTENT](Tables/WEBSITE_CONTENT.md) | A JSON content document at content_id=1. | `db/schema.sql` |
| [APP_SETTINGS](Tables/APP_SETTINGS.md) | JSON configuration row 1 and reserved sync-state row 2. | `db/schema.sql` |
| [PACKAGES](Tables/PACKAGES.md) | Fixed price choices belonging to a service. | `db/schema.sql` |
| [BOOKINGS](Tables/BOOKINGS.md) | Central rental record linking customer, primary service/package, and creating account. | `db/schema.sql` |
| [PAYMENTS](Tables/PAYMENTS.md) | One row per rental payment; many payments can belong to a booking. | `db/schema.sql` |
| [DEPOSITS](Tables/DEPOSITS.md) | One current refundable deposit summary per booking. | `db/schema.sql` |
| [EQUIPMENT_CHECKLIST](Tables/EQUIPMENT_CHECKLIST.md) | Saved inspection rows: outgoing/incoming condition, return result and inspecting user. | `db/schema.sql` |
| [BOOKING_ITEMS](Tables/BOOKING_ITEMS.md) | Per-booking equipment assignment snapshot and release/return progress. | `db/schema.sql` |
| [ITEM_RELEASES](Tables/ITEM_RELEASES.md) | Explicit release-event metadata linked to a booking. | `db/schema.sql` |
| [ITEM_HISTORY](Tables/ITEM_HISTORY.md) | Explicit equipment action log retaining nullable booking/item references. | `db/schema.sql` |
| [DELIVERY](Tables/DELIVERY.md) | One current delivery arrangement per booking. | `db/schema.sql` |
| [SESSIONS](Tables/SESSIONS.md) | Database-backed login tokens and expiration timestamps. | `db/seed.sql` |

### How to read a table note

Each note has a column dictionary, exact type/default/nullability declarations, keys, parent/child links, API consumers and behavioral caveats. A foreign key protects record references, but does not implement a business workflow. A JSON column validates JSON structure at the storage level, not references inside it.

See [Table Relationships](Table%20Relationships.md), [Schema and Seed Setup](Schema%20and%20Seed%20Setup.md) and [Glossary](../Glossary.md).

## Source files

- [db/schema.sql](<../../../db/schema.sql>)
- [db/seed.sql](<../../../db/seed.sql>)
- [api/config.php](<../../../api/config.php>)
- [api/sync.php](<../../../api/sync.php>)

## Continue reading

[Previous: Request Lifecycle](../Backend/Request%20Lifecycle.md) · [Next: Table Relationships](Table%20Relationships.md) · [Back to Start Here](../Start%20Here.md)
