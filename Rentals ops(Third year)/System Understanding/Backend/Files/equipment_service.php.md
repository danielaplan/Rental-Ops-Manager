---
title: "equipment_service.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# equipment_service.php

**Location:** `api/equipment_service.php`

Shared atomic return inspection and guarded completion.

## Routes or callable helpers

saveReturnInspection(PDO, bookingId, items, checkedBy); finalizeBookingReturn(PDO, bookingId, checkedBy); helper only.

## Access

Caller supplies authenticated inspector ID.

## Inputs

Each booking item must appear exactly once with valid rental_item_id, returned_qty >= 0 and <= expected_qty; condition Good / Minor Damage / Damaged / Missing; string notes <= 2000 bytes.

## How it works

Checks booking and saved checklist; locks matching BOOKING_ITEMS rows. Updates returned quantity, condition and notes, then upserts EQUIPMENT_CHECKLIST by booking+item and stamps checked_by. Derives missing for Missing/short return, damaged for a Damage condition, otherwise inspected. Rejects incomplete/duplicate inspections. Starts/commits its own transaction only when caller has none. Finalization locks booking, reloads the saved inspection, validates it, rejects short/Missing returns and sets completed.

## Current limits and details

Damaged items may complete if all quantities are returned. Completion does not automatically refund deposits, settle payment, restore catalog stock or write history. Direct bookings.php can set completed without this guard.

## Functions defined

`saveReturnInspection()`, `finalizeBookingReturn()`.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]]

Tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]], [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]], [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]], [[System Understanding/Database/Tables/USERS|USERS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/equipment_service.php](<../../../../api/equipment_service.php>)

Return to [[System Understanding/Start Here|Start Here]].
