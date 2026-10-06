---
title: "deposits.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# deposits.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The refundable-deposit handler.** This file lets the system read or save the deposit held for equipment or cleaning, separately from rental payments.

**Where it lives:** `api/deposits.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana has a ₱350 deposit. A ₱50 cleaning deduction with a reason leaves a calculated refund of ₱300.

## What happens

1. Find the deposit using its booking number.
2. Send new amounts to the deposit-checking helper.
3. Return the saved deposit and calculated refundable amount.

## Key points

One current deposit summary is stored per booking. A calculated refund does not prove money has been sent back.

Read [Payments and Deposits](../../Workflows/Payments%20and%20Deposits.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/deposits.php`

Reads or saves the refundable deposit for a booking.

### Routes or callable helpers

GET ?do=get&booking_id=...; POST ?do=upsert.

### Access

Reads unauthenticated; upsert requires any authenticated owner/staff.

### Inputs

booking_id, amount_held, deduction_amount (default 0), deduction_reason.

### How it works

Delegates writes to saveDeposit(). Read/write responses add refund_amount = held - deduction; absent deposit returns null. Upsert replaces the one current deposit record per booking.

### Current limits and details

refund_amount is computed, not a database column. refund_status describes the calculated refund category; this is not proof of a money transfer.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md), [deposit_service.php](deposit_service.php.md)

Tables: [DEPOSITS](../../Database/Tables/DEPOSITS.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/deposits.php](<../../../../api/deposits.php>)

## Continue reading

[Previous file: deposit_service.php](deposit_service.php.md) · [Next file: equipment.php](equipment.php.md) · [Back to Start Here](../../Start%20Here.md)
