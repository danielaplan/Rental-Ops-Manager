---
title: "API Reference"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# API Reference

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend files](File%20Inventory.md) · [Database tables](../Database/Database%20Overview.md) · [Glossary](../Glossary.md)

## What this reference is for

An API is the agreed way the application asks the server to read information or perform an action. This page lists those requests for detailed checking; it is not a list of buttons a user must press.

## Request example

In `POST /api/deposits.php?do=upsert`, `api/deposits.php` identifies the receiving file. `do=upsert` selects the save-or-replace action. POST means information is being submitted. The booking number and amounts travel in the request message. The reply contains the saved result or a problem.

For Ana’s deposit, the message includes the booking number, held ₱350, deduction ₱50 and reason Cleaning. The returned calculated refund is ₱300. This records an amount; it does not transfer the money.

Read the relevant workflow first, then use the entries below to confirm request names, permitted accounts and accepted fields.

## Technical details

This section records exact file behavior, field names and implementation details.

Endpoints are relative to the project web root `/api/`. Query selectors use `?do=...`; do not assume REST PUT/DELETE routes from the CORS header. Fields and validation are in the linked notes.

| Endpoint | Routes / default | Access |
|---|---|---|
| [addons.php](Files/addons.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [auth.php](Files/auth.php.md) | POST auth.php: login; POST ?do=logout: logout; GET ?do=me: current user. | Login accepts credentials; me requires a session. requireAuth() and requireRole() are reusable access checks. |
| [bookingItems.php](Files/bookingItems.php.md) | GET forBooking (default) with booking_id; POST generate; POST create, update, delete (id in query where applicable). | Read unauthenticated; generate any session; manual CRUD owner only. |
| [bookings.php](Files/bookings.php.md) | GET all (default), GET ?do=get&id=...; POST create, update&id=..., delete&id=.... | Reads unauthenticated; writes require an owner or staff session. |
| [categories.php](Files/categories.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [customers.php](Files/customers.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [delivery.php](Files/delivery.php.md) | GET ?do=get&booking_id=...; POST ?do=upsert. | Reads unauthenticated; upsert any session. |
| [deposits.php](Files/deposits.php.md) | GET ?do=get&booking_id=...; POST ?do=upsert. | Reads unauthenticated; upsert requires any authenticated owner/staff. |
| [equipment.php](Files/equipment.php.md) | GET all (default), forBooking&booking_id=..., get&id=...; POST inspect, finalizeReturn; owner POST create/update/delete. | Reads unauthenticated. inspect/finalizeReturn any session. Manual CRUD owner only. |
| [gallery.php](Files/gallery.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [itemHistory.php](Files/itemHistory.php.md) | GET forItem (default) with rental_item_id; POST create. | Reads unauthenticated; create owner only. |
| [itemReleases.php](Files/itemReleases.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [packages.php](Files/packages.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [payments.php](Files/payments.php.md) | GET all (default), optionally booking_id; POST ?do=create. | Reads unauthenticated; create requires any authenticated owner/staff. |
| [rentalItems.php](Files/rentalItems.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [reports.php](Files/reports.php.md) | ?do=dashboard; ?do=report&start=YYYY-MM-DD&end=YYYY-MM-DD. Intended usage GET; script branches on do rather than method. | Any authenticated owner/staff, for every route. |
| [services.php](Files/services.php.md) | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [settings.php](Files/settings.php.md) | GET get (default); POST ?do=update. | Read unauthenticated; update owner only. |
| [sync.php](Files/sync.php.md) | GET ?do=queue returns {queue: []}; POST ?do=commit accepts {queue: [...]}. | Commit requires session. Owner-only entity group: services, categories, addons, packages, customers, rentalItems, gallery, settings, websiteContent. Other supported operations accept owner/staff. Queue GET unauthenticated. |
| [websiteContent.php](Files/websiteContent.php.md) | GET get (default); POST ?do=update. | Read unauthenticated; update owner only. |

### Direct write example

This is an illustrative request, not an executed operation. IDs must exist in the target database.

```http
POST /api/deposits.php?do=upsert
Authorization: Bearer <session token>
Content-Type: application/json

{"booking_id":42,"amount_held":350,"deduction_amount":50,"deduction_reason":"Cleaning"}
```

The response includes a refund_amount of 300.00. This saves a ledger value, not an actual bank refund. See [Payments and Deposits](../Workflows/Payments%20and%20Deposits.md).

### Field and ID conventions

Database primary keys are integers. Browser display IDs can be prefixed (for example SVC-001); only routes/helpers that explicitly parse these accept them. Most direct `id` query parameters use asInt(), so send numeric IDs. Sync resolves supported prefixed and LOCAL- references. JSON amounts may return as decimal strings through PDO, and boolean-like SQL columns are numeric flags.

## Source files

- [api/config.php](<../../../api/config.php>)
- [api/sync.php](<../../../api/sync.php>)

## Continue reading

[Back to Start Here](../Start%20Here.md)
