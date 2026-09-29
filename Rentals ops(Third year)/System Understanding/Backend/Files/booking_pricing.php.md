---
title: "booking_pricing.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# booking_pricing.php

## In plain language

**The rental price calculator.** This helper calculates a booking’s rental price using saved package and extra prices, rather than trusting a total typed by the browser.

**Where it lives:** `api/booking_pricing.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana selects a ₱2,500 package and a ₱300 extra microphone, with a ₱100 discount and ₱50 fee. The total is ₱2,750.

## What happens

1. Check that the package and extras belong to the chosen service.
2. Add the package and selected extras, subtract the discount and add fees.
3. Return the total without letting it fall below zero.

## What the documentation team should remember

The refundable deposit is separate. Only the primary service/package is priced by this helper.

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

**Location:** `api/booking_pricing.php`

Shared price calculation for direct and synchronized bookings.

### Routes or callable helpers

calculateBookingTotals(PDO, serviceId, packageId, addonIds, discount, fees); helper only.

### Access

Caller handles authentication.

### Inputs

Service/package IDs, add-on IDs, non-negative discount and fees.

### How it works

Checks that package and each distinct add-on belong to the chosen service. Parses numeric/prefixed add-on IDs; deduplicates selections. Converts current catalog prices and adjustments to cents, computes max(package + add-ons - discount + fees, 0), then returns two-decimal strings for subtotal, addons_total, total. Client subtotal/total is not authoritative.

### Current limits and details

Only the primary service/package is priced. Catalog status is not checked for Active. Add-ons have no selected quantity. Updating a booking can reprice using current catalog prices.

### Functions defined

`calculateBookingTotals()`.

### Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: [[System Understanding/Database/Tables/PACKAGES|PACKAGES]], [[System Understanding/Database/Tables/ADDONS|ADDONS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/booking_pricing.php](<../../../../api/booking_pricing.php>)

Return to [[System Understanding/Start Here|Start Here]].
