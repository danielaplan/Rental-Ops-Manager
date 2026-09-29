---
title: "Booking and Pricing"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Booking and Pricing

A booking ties together a renter, an event date/time/location, a primary service/package, prices and the staff account that created it. These are not separate disconnected calendar entries: the saved booking ID links finance, logistics and equipment.

## Direct create/update

1. Authenticate the writer and start a transaction. Lock service row 1 to serialize competing karaoke writes.
2. Resolve the customer. Direct create accepts an existing customer ID or name/contact; it may reuse a contact and update that customer.
3. Validate the date and same-day start/end times.
4. Resolve the first service and selected package. If omitted, choose the first package for the primary service.
5. When the primary service is id 1 and status is confirmed/reserved/preparing/released, test overlap with existing blocking karaoke bookings.
6. Validate package/add-ons against that service and calculate totals from current database prices.
7. Insert/update BOOKINGS and commit. New bookings start with amount_paid=0 and payment_status=Unpaid. Creation records the authenticated account as created_by.

## Price example

Suppose an existing package costs 2,500, selected distinct extras total 300, discount is 100 and fees are 50. The rental total is `max(2500 + 300 - 100 + 50, 0) = 2750`. A held deposit is separate and does not raise this rental total. Delivery fee is also not automatically copied into BOOKINGS.fees.

## Karaoke conflict rule

Intervals overlap when `existing.start_time < requested.end_time` and `existing.end_time > requested.start_time`, on the same event date and primary karaoke service. Adjacent intervals such as 14:00–16:00 and 16:00–18:00 do not overlap. Current code recognizes service id 1 as karaoke; pending bookings do not reserve the slot.

Direct overlap produces HTTP 409. Sync returns an item in conflicts instead, keeping the draft available for review. A sync service-only edit is a documented gap in overlap triggering. See [[System Understanding/Current Implementation Gaps]].

## Further operations

The direct booking endpoint does not automatically create its equipment assignment. The current browser sync adapter queues bookingItems.generate after a booking create; callers using direct HTTP must arrange checklist generation separately.

The intended lifecycle is reflected by labels such as pending, confirmed, preparing, released and completed, but BOOKINGS.status is a VARCHAR and booking writes do not enforce a full state machine. Guarded return completion is implemented through equipment.finalizeReturn; it is not a universal guard on every booking status update.

## Source files

- [api/bookings.php](<../../../api/bookings.php>)
- [api/booking_pricing.php](<../../../api/booking_pricing.php>)
- [api/sync.php](<../../../api/sync.php>)
- [js/sync.js](<../../../js/sync.js>)

Return to [[System Understanding/Start Here|Start Here]].
