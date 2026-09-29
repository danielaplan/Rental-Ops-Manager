---
title: "deposits.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# deposits.php

## In plain language

**The refundable-deposit handler.** This file lets the system read or save the deposit held for equipment or cleaning, separately from rental payments.

**Where it lives:** `api/deposits.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana has a ₱350 deposit. A ₱50 cleaning deduction with a reason leaves a calculated refund of ₱300.

## What happens

1. Find the deposit using its booking number.
2. Send new amounts to the deposit-checking helper.
3. Return the saved deposit and calculated refundable amount.

## What the documentation team should remember

One current deposit summary is stored per booking. A calculated refund does not prove money has been sent back.

Read [[System Understanding/Workflows/Payments and Deposits]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/deposit_service.php|deposit_service.php]]

Tables: [[System Understanding/Database/Tables/DEPOSITS|DEPOSITS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/deposits.php](<../../../../api/deposits.php>)

Return to [[System Understanding/Start Here|Start Here]].
