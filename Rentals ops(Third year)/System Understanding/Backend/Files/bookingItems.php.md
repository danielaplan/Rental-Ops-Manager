---
title: "bookingItems.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# bookingItems.php

**Location:** `api/bookingItems.php`

Maintains the equipment checklist snapshot assigned to a booking.

## Routes or callable helpers

GET forBooking (default) with booking_id; POST generate; POST create, update, delete (id in query where applicable).

## Access

Read unauthenticated; generate any session; manual CRUD owner only.

## Inputs

Generate: booking_id, service_ids array of numeric service IDs. Create uses BOOKING_ITEMS fields; update expected_qty, released_qty, returned_qty, required, checked_released, condition, notes by id or body booking_id+rental_item_id.

## How it works

generate deletes existing checklist rows and copies RENTAL_ITEMS for each service into BOOKING_ITEMS in one transaction. Initializes quantities/flags to zero except expected_qty from catalog quantity and required from catalog. Manual update preserves omitted fields; create requires booking and name.

## Current limits and details

Generate replaces saved release/return progress. No unique booking/item constraint here; duplicate selections can create duplicates. Generation does not filter inactive/unavailable items or decrement inventory. Nullable rental_item_id is allowed by schema, but complete return inspection requires valid catalog IDs.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]], [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/bookingItems.php](<../../../../api/bookingItems.php>)

Return to [[System Understanding/Start Here|Start Here]].
