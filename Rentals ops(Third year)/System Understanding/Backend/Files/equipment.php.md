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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The return-inspection entry point.** This file receives requests to save an equipment return inspection or complete a returned booking.

**Where it lives:** `api/equipment.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Staff count Ana’s returned equipment and record its condition and notes before requesting completion.

## What happens

1. Receive the booking number and inspected items.
2. Ask the equipment service helper to check and save the inspection.
3. Use the same helper for the guarded completion action.

## Key points

A missing item can be saved as missing, but the guarded completion action rejects incomplete returns. Manual item edits have different rules.

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/equipment.php`

HTTP routes for return inspections and finalizing returns.

### Routes or callable helpers

GET all (default), forBooking&booking_id=..., get&id=...; POST inspect, finalizeReturn; owner POST create/update/delete.

### Access

Reads unauthenticated. inspect/finalizeReturn any session. Manual CRUD owner only.

### Inputs

inspect: booking_id, items[{rental_item_id, returned_qty, condition, notes}]. finalizeReturn: booking_id. Manual CRUD accepts equipment checklist fields and validates quantities/status/condition.

### How it works

Delegates full inspection to saveReturnInspection() and finalization to finalizeBookingReturn(). Manual edits stamp checked_by on create or inspection-field update, reject returned > expected, and return 201 on create. Catches inspection/finalization failures as 400/500.

### Current limits and details

Full inspection workflow and manual row CRUD have different invariants. A row-by-row manual edit is not equivalent to a complete saved inspection; see the service helper.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md), [equipment_service.php](equipment_service.php.md)

Tables: [EQUIPMENT_CHECKLIST](../../Database/Tables/EQUIPMENT_CHECKLIST.md), [BOOKING_ITEMS](../../Database/Tables/BOOKING_ITEMS.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md), [USERS](../../Database/Tables/USERS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/equipment.php](<../../../../api/equipment.php>)

## Continue reading

[Previous file: deposits.php](deposits.php.md) · [Next file: equipment_service.php](equipment_service.php.md) · [Back to Start Here](../../Start%20Here.md)
