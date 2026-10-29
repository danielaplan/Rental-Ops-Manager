---
title: "Phase 2 Stable Customer Booking Associations"
date: 2026-10-29
tags:
  - development-journal
  - customers
  - offline-sync
status: implemented-local-verification
---

# Phase 2 Stable Customer Booking Associations

## Finding

The database correctly linked each booking through `BOOKINGS.customer_id`, but several browser paths also treated a matching phone number or customer name as identity. Customers sharing contact details could therefore appear to share bookings and paid totals in cached customer summaries, booking editing, or the printable report.

## Change

- Direct customer summaries now match bookings only by `customer_id`.
- Customer upsert updates only an explicitly selected customer ID; otherwise it creates a customer instead of searching by phone.
- Each new offline customer receives a distinct temporary ID, which is attached to its cached booking even when another customer has the same phone.
- Booking acknowledgement adopts the server-returned customer ID for the cached booking and temporary customer.
- Pending-booking editing selects the customer by ID only.
- Printable report rows group by customer ID while continuing to display the customer name.

The PHP booking service, customer history endpoint, schema relationship, payment service, and deposit service already use the customer/booking primary-key relationship and did not require changes.

## Verification performed

- Offline-cache simulation created two distinct customers with the same phone, verified different customer IDs, and retained one booking and the correct paid total for each.
- Direct-API simulation returned two server customers sharing a phone and verified separate booking counts and paid totals by ID.
- Direct customer-upsert simulation verified explicit-ID update, ID-less creation, and no phone-search request.
- Focused frontend tests and the repository syntax check passed.

Database-backed replay was not executed because local MySQL still refuses the connection with `ERROR 2002` / Windows socket error `10013`. No development or production database was accessed.

## Status

Implemented and locally verified at the direct API and offline-cache boundaries. Database-backed replay, physical-device testing, and client acceptance remain pending.
