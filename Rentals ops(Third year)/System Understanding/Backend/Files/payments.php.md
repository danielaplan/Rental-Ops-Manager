---
title: "payments.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# payments.php

**Location:** `api/payments.php`

Records rental payments and updates the booking payment summary.

## Routes or callable helpers

GET all (default), optionally booking_id; POST ?do=create.

## Access

Reads unauthenticated; create requires any authenticated owner/staff.

## Inputs

booking_id, amount, payment_method, optional notes. Direct methods: gcash; maribank / bank transfer / other normalize to maribank.

## How it works

In one transaction inserts a paid PAYMENTS row and increments BOOKINGS.amount_paid. A SQL CASE derives Fully Paid / Partial / Unpaid using the stored total (or calculated fallback when total is zero). Returns the created payment with 201.

## Current limits and details

No edit/delete route or gateway integration. Amount validation is numeric formatting and permits negative amounts in current code. Direct cash is rejected, while sync cash normalizes to maribank. Direct POST has no replay receipt; lost-response retries can duplicate payments.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/PAYMENTS|PAYMENTS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/payments.php](<../../../../api/payments.php>)

Return to [[System Understanding/Start Here|Start Here]].
