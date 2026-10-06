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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The full-return checker.** This helper checks an entire booking’s returned equipment together so an incomplete inspection is not partly saved.

**Where it lives:** `api/equipment_service.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

If Ana’s list expects two microphones but only one comes back, staff can save the missing quantity, but cannot complete through the return action.

## What happens

1. Check every assigned item appears once and returned quantities are valid.
2. Save quantities, conditions, notes and the inspecting staff account together.
3. Complete through this action only when all quantities are returned and none is marked Missing.

## Key points

Fully returned damaged items can complete. This helper does not automatically deduct a deposit or issue a refund.

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/equipment_service.php`

Shared atomic return inspection and guarded completion.

### Routes or callable helpers

saveReturnInspection(PDO, bookingId, items, checkedBy); finalizeBookingReturn(PDO, bookingId, checkedBy); helper only.

### Access

Caller supplies authenticated inspector ID.

### Inputs

Each booking item must appear exactly once with valid rental_item_id, returned_qty >= 0 and <= expected_qty; condition Good / Minor Damage / Damaged / Missing; string notes <= 2000 bytes.

### How it works

Checks booking and saved checklist; locks matching BOOKING_ITEMS rows. Updates returned quantity, condition and notes, then upserts EQUIPMENT_CHECKLIST by booking+item and stamps checked_by. Derives missing for Missing/short return, damaged for a Damage condition, otherwise inspected. Rejects incomplete/duplicate inspections. Starts/commits its own transaction only when caller has none. Finalization locks booking, reloads the saved inspection, validates it, rejects short/Missing returns and sets completed.

### Current limits and details

Damaged items may complete if all quantities are returned. Completion does not automatically refund deposits, settle payment, restore catalog stock or write history. Direct bookings.php can set completed without this guard.

### Functions defined

`saveReturnInspection()`, `finalizeBookingReturn()`.

### Connections

Includes: [config.php](config.php.md)

Tables: [BOOKINGS](../../Database/Tables/BOOKINGS.md), [BOOKING_ITEMS](../../Database/Tables/BOOKING_ITEMS.md), [EQUIPMENT_CHECKLIST](../../Database/Tables/EQUIPMENT_CHECKLIST.md), [USERS](../../Database/Tables/USERS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/equipment_service.php](<../../../../api/equipment_service.php>)

## Continue reading

[Previous file: equipment.php](equipment.php.md) · [Next file: gallery.php](gallery.php.md) · [Back to Start Here](../../Start%20Here.md)
