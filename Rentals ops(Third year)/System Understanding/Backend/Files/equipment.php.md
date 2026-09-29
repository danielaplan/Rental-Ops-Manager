---
title: "equipment.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# equipment.php

**Location:** `api/equipment.php`

HTTP routes for return inspections and finalizing returns.

## Routes or callable helpers

GET all (default), forBooking&booking_id=..., get&id=...; POST inspect, finalizeReturn; owner POST create/update/delete.

## Access

Reads unauthenticated. inspect/finalizeReturn any session. Manual CRUD owner only.

## Inputs

inspect: booking_id, items[{rental_item_id, returned_qty, condition, notes}]. finalizeReturn: booking_id. Manual CRUD accepts equipment checklist fields and validates quantities/status/condition.

## How it works

Delegates full inspection to saveReturnInspection() and finalization to finalizeBookingReturn(). Manual edits stamp checked_by on create or inspection-field update, reject returned > expected, and return 201 on create. Catches inspection/finalization failures as 400/500.

## Current limits and details

Full inspection workflow and manual row CRUD have different invariants. A row-by-row manual edit is not equivalent to a complete saved inspection; see the service helper.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/equipment_service.php|equipment_service.php]]

Tables: [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]], [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]], [[System Understanding/Database/Tables/USERS|USERS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/equipment.php](<../../../../api/equipment.php>)

Return to [[System Understanding/Start Here|Start Here]].
