---
title: "BOOKINGS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# BOOKINGS

## In plain language

**The central rental record.** Each record brings together the renter, event, selected primary service/package and payment summary.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `BOOKINGS` is the label used by the code.

## Example

Ana’s karaoke booking has a date, time and location; its number links her payment, deposit and equipment records.

## Details to recognize first

booking_id is the booking number; customer_id links the renter; event_date schedules it; total and amount_paid summarize rental money.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Booking and Pricing]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

Central rental record linking customer, primary service/package, and creating account.

**Definition:** `db/schema.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `booking_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `customer_id` | `INT` | `NOT NULL` | Renter reference. |
| `service_id` | `INT` | `NOT NULL` | Service reference. |
| `package_id` | `INT` | `NOT NULL` | Package reference. |
| `created_by` | `INT` | `NOT NULL` | Foreign key to the account that created the booking. |
| `event_date` | `DATE` | `NOT NULL` | Scheduled event date, also the report date-filter basis. |
| `start_time` | `TIME` | `NOT NULL` | Same-day start time. |
| `end_time` | `TIME` | `NOT NULL` | Same-day end time; booking validation requires it after start. |
| `event_location` | `VARCHAR(255)` | `Nullable; implicit NULL default` | Venue/location text. |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | Booking state stored as text, normalized to lowercase by writes. |
| `sync_status` | `ENUM('synced','pending_sync')` | `NOT NULL DEFAULT 'pending_sync'` | Stored booking sync marker; distinct from device outbox/receipt state. |
| `service_ids` | `JSON` | `NULL` | JSON service selections; primary first service controls backend price/slot logic. |
| `addon_ids` | `JSON` | `NULL` | JSON selected add-on IDs; no SQL foreign keys inside this JSON. |
| `discount` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Amount subtracted from package + extras. |
| `fees` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Additional booking fees added to price. |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored base package price calculated by PHP. |
| `addons_total` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored sum of selected distinct extras. |
| `total` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored rental total, clamped to at least zero by pricing. |
| `amount_paid` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0` | Stored aggregate rental payments used by reports. |
| `payment_status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Unpaid'` | Aggregate Unpaid/Partial/Fully Paid label. |
| `source` | `VARCHAR(50)` | `Nullable; implicit NULL default` | Booking origin label. |
| `guests` | `INT` | `Nullable; implicit NULL default` | Optional guest count. |
| `event_type` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Optional event type. |
| `special_requests` | `TEXT` | `Nullable; implicit NULL default` | Optional customer requests. |
| `email` | `VARCHAR(255)` | `Nullable; implicit NULL default` | Optional booking contact email. |
| `customer_type` | `VARCHAR(100)` | `Nullable; implicit NULL default` | Optional descriptive customer classification. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (booking_id)`
- `FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (package_id) REFERENCES PACKAGES(package_id) ON UPDATE CASCADE ON DELETE RESTRICT`
- `FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE RESTRICT`

Additional indexes:

- `CREATE INDEX idx_bookings_event_date ON BOOKINGS(event_date);`
- `CREATE INDEX idx_bookings_status ON BOOKINGS(status);`
- `CREATE INDEX idx_bookings_service ON BOOKINGS(service_id);`

Parent tables: [[System Understanding/Database/Tables/CUSTOMERS|CUSTOMERS]] via `customer_id`, [[System Understanding/Database/Tables/SERVICES|SERVICES]] via `service_id`, [[System Understanding/Database/Tables/PACKAGES|PACKAGES]] via `package_id`, [[System Understanding/Database/Tables/USERS|USERS]] via `created_by`

Child tables: [[System Understanding/Database/Tables/PAYMENTS|PAYMENTS]] via `booking_id`, [[System Understanding/Database/Tables/DEPOSITS|DEPOSITS]] via `booking_id`, [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]] via `booking_id`, [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]] via `booking_id`, [[System Understanding/Database/Tables/ITEM_RELEASES|ITEM_RELEASES]] via `booking_id`, [[System Understanding/Database/Tables/ITEM_HISTORY|ITEM_HISTORY]] via `booking_id`, [[System Understanding/Database/Tables/DELIVERY|DELIVERY]] via `booking_id`

### Where it is used

[[System Understanding/Backend/Files/bookings.php|bookings.php]], [[System Understanding/Backend/Files/payments.php|payments.php]], [[System Understanding/Backend/Files/reports.php|reports.php]], [[System Understanding/Backend/Files/equipment_service.php|equipment_service.php]], [[System Understanding/Backend/Files/sync.php|sync.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

Primary service and package are relational, while service_ids/addon_ids are JSON selections. Only the first selected service is priced/scheduled. sync_status defaults to pending_sync and is not consistently changed by these write paths; receipt/outbox state is separate.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/schema.sql](<../../../../db/schema.sql>)

Return to [[System Understanding/Start Here|Start Here]].
