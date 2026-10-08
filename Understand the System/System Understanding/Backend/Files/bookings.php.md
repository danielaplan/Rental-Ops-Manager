---
title: "bookings.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# bookings.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The booking record handler.** This file handles the main rental record: who is renting, what service/package they chose, and where and when the event happens.

**Where it lives:** `api/bookings.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana wants karaoke on October 20 from 2 PM to 6 PM. Staff enter her contact, event details and chosen package.

## What happens

1. Identify or create the customer record.
2. Check the event time, chosen package, price and relevant karaoke conflicts.
3. Save the booking and link it to the staff account that created it.

## Key points

A new booking starts unpaid. Equipment assignment and payment recording are separate actions. Completion checks are not enforced on every booking-edit path.

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/bookings.php`

Creates, lists, updates, and deletes the central rental booking record.

### Routes or callable helpers

GET all (default), GET ?do=get&id=...; POST create, update&id=..., delete&id=....

### Access

Reads unauthenticated; writes require an owner or staff session.

### Inputs

Create: customer_id or customer_name and contact/contact_number; event_date, start_time, end_time; service_ids array; optional package_id, addon_ids, discount, fees, location/event_location, status and descriptive fields. Update preserves omitted values. See BOOKINGS for the full record.

### How it works

bookingRow() joins customer name/contact and decodes selections. entityId() accepts numeric or prefixed IDs. Writes start a transaction and lock SERVICES id 1. Customer lookup can reuse a contact or create a record. Strict same-day time validation requires start before end. The first service selection becomes service_id; a missing package selects the first package for that service. calculateBookingTotals() supplies prices. checkSlot() rejects overlapping blocking karaoke slots with 409. New bookings set created_by from session and payment summary to zero/Unpaid; deletes cascade to children.

### Current limits and details

Not a full status-transition state machine: arbitrary status strings are possible, and updates may accept amount_paid/payment_status rather than recompute them. There is no overnight interval support. See implementation gaps; direct writes and sync are not identical.

**2026-10-08 fix:** the equipment-completion validation (returned_qty >= expected_qty, no condition_in = missing) now runs unconditionally whenever status === 'completed'. The previous `$expectedTotal > 0` gate that let a direct completed update bypass inspection was removed.

### Functions defined

`bookingRow()`, `entityId()`, `checkSlot()`.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md), [booking_pricing.php](booking_pricing.php.md)

Tables: [BOOKINGS](../../Database/Tables/BOOKINGS.md), [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [PACKAGES](../../Database/Tables/PACKAGES.md), [ADDONS](../../Database/Tables/ADDONS.md), [USERS](../../Database/Tables/USERS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/bookings.php](<../../../../api/bookings.php>)

## Continue reading

[Previous file: booking_pricing.php](booking_pricing.php.md) · [Next file: categories.php](categories.php.md) · [Back to Start Here](../../Start%20Here.md)
