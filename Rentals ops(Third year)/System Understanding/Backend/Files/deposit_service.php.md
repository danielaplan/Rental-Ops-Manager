---
title: "deposit_service.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# deposit_service.php

**Location:** `api/deposit_service.php`

Shared deposit validation and calculation.

## Routes or callable helpers

saveDeposit(PDO, bookingId, body); helper only.

## Access

Caller authenticates.

## Inputs

Positive booking ID; numeric non-negative held/deducted amounts; nonblank reason when deduction > 0.

## How it works

Requires existing booking, deduction <= held. Upserts DEPOSITS by unique booking_id. Derives pending if held <= 0, full if deduction <= 0, partial if deduction < held, otherwise none; returns stored row plus refund_amount.

## Current limits and details

No fixed amount or minimum. One aggregate deduction and reason, not an itemized deduction ledger. The helper does not begin its own transaction; sync invokes it inside the operation transaction.

## Functions defined

`saveDeposit()`.

## Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: [[System Understanding/Database/Tables/DEPOSITS|DEPOSITS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/deposit_service.php](<../../../../api/deposit_service.php>)

Return to [[System Understanding/Start Here|Start Here]].
