---
title: "API Reference"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# API Reference

## What this reference is for

An API is the agreed way the application asks the server to read information or perform an action. This page lists those requests for detailed checking; it is not a list of buttons a user must press.

## Read one entry slowly

In `POST /api/deposits.php?do=upsert`, `api/deposits.php` identifies the receiving file. `do=upsert` selects the save-or-replace action. POST means information is being submitted. The booking number and amounts travel in the request message. The reply contains the saved result or a problem.

For Ana’s deposit, the message includes the booking number, held ₱350, deduction ₱50 and reason Cleaning. The returned calculated refund is ₱300. This records an amount; it does not transfer the money.

Read the relevant workflow first, then use the entries below to confirm request names, permitted accounts and accepted fields.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

Endpoints are relative to the project web root `/api/`. Query selectors use `?do=...`; do not assume REST PUT/DELETE routes from the CORS header. Fields and validation are in the linked notes.

| Endpoint | Routes / default | Access |
|---|---|---|
| [[System Understanding/Backend/Files/addons.php\|addons.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/auth.php\|auth.php]] | POST auth.php: login; POST ?do=logout: logout; GET ?do=me: current user. | Login accepts credentials; me requires a session. requireAuth() and requireRole() are reusable access checks. |
| [[System Understanding/Backend/Files/bookingItems.php\|bookingItems.php]] | GET forBooking (default) with booking_id; POST generate; POST create, update, delete (id in query where applicable). | Read unauthenticated; generate any session; manual CRUD owner only. |
| [[System Understanding/Backend/Files/bookings.php\|bookings.php]] | GET all (default), GET ?do=get&id=...; POST create, update&id=..., delete&id=.... | Reads unauthenticated; writes require an owner or staff session. |
| [[System Understanding/Backend/Files/categories.php\|categories.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/customers.php\|customers.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/delivery.php\|delivery.php]] | GET ?do=get&booking_id=...; POST ?do=upsert. | Reads unauthenticated; upsert any session. |
| [[System Understanding/Backend/Files/deposits.php\|deposits.php]] | GET ?do=get&booking_id=...; POST ?do=upsert. | Reads unauthenticated; upsert requires any authenticated owner/staff. |
| [[System Understanding/Backend/Files/equipment.php\|equipment.php]] | GET all (default), forBooking&booking_id=..., get&id=...; POST inspect, finalizeReturn; owner POST create/update/delete. | Reads unauthenticated. inspect/finalizeReturn any session. Manual CRUD owner only. |
| [[System Understanding/Backend/Files/gallery.php\|gallery.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/itemHistory.php\|itemHistory.php]] | GET forItem (default) with rental_item_id; POST create. | Reads unauthenticated; create owner only. |
| [[System Understanding/Backend/Files/itemReleases.php\|itemReleases.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/packages.php\|packages.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/payments.php\|payments.php]] | GET all (default), optionally booking_id; POST ?do=create. | Reads unauthenticated; create requires any authenticated owner/staff. |
| [[System Understanding/Backend/Files/rentalItems.php\|rentalItems.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/reports.php\|reports.php]] | ?do=dashboard; ?do=report&start=YYYY-MM-DD&end=YYYY-MM-DD. Intended usage GET; script branches on do rather than method. | Any authenticated owner/staff, for every route. |
| [[System Understanding/Backend/Files/services.php\|services.php]] | Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=.... | Reads are unauthenticated. Every POST requires owner via authWrite(). |
| [[System Understanding/Backend/Files/settings.php\|settings.php]] | GET get (default); POST ?do=update. | Read unauthenticated; update owner only. |
| [[System Understanding/Backend/Files/sync.php\|sync.php]] | GET ?do=queue returns {queue: []}; POST ?do=commit accepts {queue: [...]}. | Commit requires session. Owner-only entity group: services, categories, addons, packages, customers, rentalItems, gallery, settings, websiteContent. Other supported operations accept owner/staff. Queue GET unauthenticated. |
| [[System Understanding/Backend/Files/websiteContent.php\|websiteContent.php]] | GET get (default); POST ?do=update. | Read unauthenticated; update owner only. |

### Direct write example

This is an illustrative request, not an executed operation. IDs must exist in the target database.

```http
POST /api/deposits.php?do=upsert
Authorization: Bearer <session token>
Content-Type: application/json

{"booking_id":42,"amount_held":350,"deduction_amount":50,"deduction_reason":"Cleaning"}
```

The response includes a refund_amount of 300.00. This saves a ledger value, not an actual bank refund. See [[System Understanding/Workflows/Payments and Deposits]].

### Field and ID conventions

Database primary keys are integers. Browser display IDs can be prefixed (for example SVC-001); only routes/helpers that explicitly parse these accept them. Most direct `id` query parameters use asInt(), so send numeric IDs. Sync resolves supported prefixed and LOCAL- references. JSON amounts may return as decimal strings through PDO, and boolean-like SQL columns are numeric flags.

## Source files

- [api/config.php](<../../../api/config.php>)
- [api/sync.php](<../../../api/sync.php>)

Return to [[System Understanding/Start Here|Start Here]].
