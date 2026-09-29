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

## Overview

**The deposit rule checker.** This helper checks held and deducted amounts and works out how much is refundable.

**Where it lives:** `api/deposit_service.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

For Ana’s ₱350 deposit, a deduction of ₱50 needs a reason. A deduction of ₱400 is rejected because it exceeds the held amount.

## What happens

1. Check that the booking exists and amounts are not negative.
2. Require a reason for a positive deduction and keep it within the deposit.
3. Save the current summary and calculate the amount left.

## Key points

There is no fixed minimum deposit. The system stores one combined deduction and reason, rather than a separate row for each charge.

Read [[System Understanding/Workflows/Payments and Deposits]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/deposit_service.php`

Shared deposit validation and calculation.

### Routes or callable helpers

saveDeposit(PDO, bookingId, body); helper only.

### Access

Caller authenticates.

### Inputs

Positive booking ID; numeric non-negative held/deducted amounts; nonblank reason when deduction > 0.

### How it works

Requires existing booking, deduction <= held. Upserts DEPOSITS by unique booking_id. Derives pending if held <= 0, full if deduction <= 0, partial if deduction < held, otherwise none; returns stored row plus refund_amount.

### Current limits and details

No fixed amount or minimum. One aggregate deduction and reason, not an itemized deduction ledger. The helper does not begin its own transaction; sync invokes it inside the operation transaction.

### Functions defined

`saveDeposit()`.

### Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: [[System Understanding/Database/Tables/DEPOSITS|DEPOSITS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/deposit_service.php](<../../../../api/deposit_service.php>)

Return to [[System Understanding/Start Here|Start Here]].
