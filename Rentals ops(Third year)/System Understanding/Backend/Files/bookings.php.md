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

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

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

Not a status-transition state machine: arbitrary status strings and direct completed updates are possible. Updates may accept amount_paid/payment_status rather than recompute them. There is no overnight interval support. See implementation gaps; direct writes and sync are not identical.

### Functions defined

`bookingRow()`, `entityId()`, `checkSlot()`.

### Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]]

Tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]], [[System Understanding/Database/Tables/CUSTOMERS|CUSTOMERS]], [[System Understanding/Database/Tables/SERVICES|SERVICES]], [[System Understanding/Database/Tables/PACKAGES|PACKAGES]], [[System Understanding/Database/Tables/ADDONS|ADDONS]], [[System Understanding/Database/Tables/USERS|USERS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/bookings.php](<../../../../api/bookings.php>)

Return to [[System Understanding/Start Here|Start Here]].
