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

The source scripts define 19 tables. [[System Understanding/Database/Table Relationships]] explains their connections, and the linked table notes describe each table’s fields and role in its workflow.

## Technical details

This section records exact file behavior, field names and implementation details.

MySQL is the central shared record store. `api/config.php` chooses the database connection; default name is `akad_rentals`. PDO queries use prepared values. The schema uses InnoDB, utf8mb4 and utf8mb4_unicode_ci.

The checked-in scripts define 18 tables in schema.sql and SESSIONS in seed.sql: **19 tables total**. No PHP CREATE TABLE statement is used for an additional runtime table; sync initializes a reserved row in APP_SETTINGS. A live deployment may differ, so this inventory is based on checked-in definitions, not a live schema audit.

| Table | Purpose | Defined in |
|---|---|---|
| [[System Understanding/Database/Tables/USERS\|USERS]] | Owner/staff accounts. Customers do not log in through this table. | `db/schema.sql` |
| [[System Understanding/Database/Tables/CUSTOMERS\|CUSTOMERS]] | People renting services; one customer can have many bookings. | `db/schema.sql` |
| [[System Understanding/Database/Tables/SERVICES\|SERVICES]] | The service catalog: seed id 1 Karaoke, id 2 Sweet Corner, id 3 Balloon Decoration. | `db/schema.sql` |
| [[System Understanding/Database/Tables/CATEGORIES\|CATEGORIES]] | Independent category labels. | `db/schema.sql` |
| [[System Understanding/Database/Tables/ADDONS\|ADDONS]] | Separately priced optional extras belonging to one service. | `db/schema.sql` |
| [[System Understanding/Database/Tables/RENTAL_ITEMS\|RENTAL_ITEMS]] | Reusable item catalog by service, used as the template for booking checklists. | `db/schema.sql` |
| [[System Understanding/Database/Tables/GALLERY\|GALLERY]] | Image text and featured metadata. | `db/schema.sql` |
| [[System Understanding/Database/Tables/WEBSITE_CONTENT\|WEBSITE_CONTENT]] | A JSON content document at content_id=1. | `db/schema.sql` |
| [[System Understanding/Database/Tables/APP_SETTINGS\|APP_SETTINGS]] | JSON configuration row 1 and reserved sync-state row 2. | `db/schema.sql` |
| [[System Understanding/Database/Tables/PACKAGES\|PACKAGES]] | Fixed price choices belonging to a service. | `db/schema.sql` |
| [[System Understanding/Database/Tables/BOOKINGS\|BOOKINGS]] | Central rental record linking customer, primary service/package, and creating account. | `db/schema.sql` |
| [[System Understanding/Database/Tables/PAYMENTS\|PAYMENTS]] | One row per rental payment; many payments can belong to a booking. | `db/schema.sql` |
| [[System Understanding/Database/Tables/DEPOSITS\|DEPOSITS]] | One current refundable deposit summary per booking. | `db/schema.sql` |
| [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST\|EQUIPMENT_CHECKLIST]] | Saved inspection rows: outgoing/incoming condition, return result and inspecting user. | `db/schema.sql` |
| [[System Understanding/Database/Tables/BOOKING_ITEMS\|BOOKING_ITEMS]] | Per-booking equipment assignment snapshot and release/return progress. | `db/schema.sql` |
| [[System Understanding/Database/Tables/ITEM_RELEASES\|ITEM_RELEASES]] | Explicit release-event metadata linked to a booking. | `db/schema.sql` |
| [[System Understanding/Database/Tables/ITEM_HISTORY\|ITEM_HISTORY]] | Explicit equipment action log retaining nullable booking/item references. | `db/schema.sql` |
| [[System Understanding/Database/Tables/DELIVERY\|DELIVERY]] | One current delivery arrangement per booking. | `db/schema.sql` |
| [[System Understanding/Database/Tables/SESSIONS\|SESSIONS]] | Database-backed login tokens and expiration timestamps. | `db/seed.sql` |

### How to read a table note

Each note has a column dictionary, exact type/default/nullability declarations, keys, parent/child links, API consumers and behavioral caveats. A foreign key protects record references, but does not implement a business workflow. A JSON column validates JSON structure at the storage level, not references inside it.

See [[System Understanding/Database/Table Relationships]], [[System Understanding/Database/Schema and Seed Setup]] and [[System Understanding/Glossary]].

## Source files

- [db/schema.sql](<../../../db/schema.sql>)
- [db/seed.sql](<../../../db/seed.sql>)
- [api/config.php](<../../../api/config.php>)
- [api/sync.php](<../../../api/sync.php>)

Return to [[System Understanding/Start Here|Start Here]].
