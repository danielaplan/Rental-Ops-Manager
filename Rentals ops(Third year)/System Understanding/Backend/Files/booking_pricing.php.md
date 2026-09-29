---
title: "booking_pricing.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# booking_pricing.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The rental price calculator.** This helper calculates a booking’s rental price using saved package and extra prices, rather than trusting a total typed by the browser.

**Where it lives:** `api/booking_pricing.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana selects a ₱2,500 package and a ₱300 extra microphone, with a ₱100 discount and ₱50 fee. The total is ₱2,750.

## What happens

1. Check that the package and extras belong to the chosen service.
2. Add the package and selected extras, subtract the discount and add fees.
3. Return the total without letting it fall below zero.

## Key points

The refundable deposit is separate. Only the primary service/package is priced by this helper.

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

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

Tables: [PACKAGES](../../Database/Tables/PACKAGES.md), [ADDONS](../../Database/Tables/ADDONS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/booking_pricing.php](<../../../../api/booking_pricing.php>)

## Continue reading

[Previous file: bookingItems.php](bookingItems.php.md) · [Next file: bookings.php](bookings.php.md) · [Back to Start Here](../../Start%20Here.md)
