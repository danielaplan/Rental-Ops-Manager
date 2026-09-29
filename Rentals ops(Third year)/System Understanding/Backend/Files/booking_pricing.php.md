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

**Location:** `api/booking_pricing.php`

Shared price calculation for direct and synchronized bookings.

## Routes or callable helpers

calculateBookingTotals(PDO, serviceId, packageId, addonIds, discount, fees); helper only.

## Access

Caller handles authentication.

## Inputs

Service/package IDs, add-on IDs, non-negative discount and fees.

## How it works

Checks that package and each distinct add-on belong to the chosen service. Parses numeric/prefixed add-on IDs; deduplicates selections. Converts current catalog prices and adjustments to cents, computes max(package + add-ons - discount + fees, 0), then returns two-decimal strings for subtotal, addons_total, total. Client subtotal/total is not authoritative.

## Current limits and details

Only the primary service/package is priced. Catalog status is not checked for Active. Add-ons have no selected quantity. Updating a booking can reprice using current catalog prices.

## Functions defined

`calculateBookingTotals()`.

## Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: [[System Understanding/Database/Tables/PACKAGES|PACKAGES]], [[System Understanding/Database/Tables/ADDONS|ADDONS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/booking_pricing.php](<../../../../api/booking_pricing.php>)

Return to [[System Understanding/Start Here|Start Here]].
