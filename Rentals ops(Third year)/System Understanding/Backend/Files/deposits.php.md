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

**Location:** `api/deposits.php`

Reads or saves the refundable deposit for a booking.

## Routes or callable helpers

GET ?do=get&booking_id=...; POST ?do=upsert.

## Access

Reads unauthenticated; upsert requires any authenticated owner/staff.

## Inputs

booking_id, amount_held, deduction_amount (default 0), deduction_reason.

## How it works

Delegates writes to saveDeposit(). Read/write responses add refund_amount = held - deduction; absent deposit returns null. Upsert replaces the one current deposit record per booking.

## Current limits and details

refund_amount is computed, not a database column. refund_status describes the calculated refund category; this is not proof of a money transfer.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/deposit_service.php|deposit_service.php]]

Tables: [[System Understanding/Database/Tables/DEPOSITS|DEPOSITS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/deposits.php](<../../../../api/deposits.php>)

Return to [[System Understanding/Start Here|Start Here]].
