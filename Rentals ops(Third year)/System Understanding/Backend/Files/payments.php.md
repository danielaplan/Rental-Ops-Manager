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

## Overview

**The rental payment recorder.** This file records money paid toward the rental and updates how much of the booking has been paid.

**Where it lives:** `api/payments.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana pays ₱250 toward the ₱2,750 rental. The payment is saved, the booking becomes Partial, and ₱2,500 remains.

## What happens

1. Save an individual payment record.
2. Increase the booking’s paid amount.
3. Calculate the booking’s Unpaid, Partial or Fully Paid label.

## Key points

Recording a payment does not transfer money through GCash or MariBank. Refundable deposits use a different record. Negative amounts are not explicitly rejected by this route today.

Read [[System Understanding/Workflows/Payments and Deposits]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/payments.php`

Records rental payments and updates the booking payment summary.

### Routes or callable helpers

GET all (default), optionally booking_id; POST ?do=create.

### Access

Reads unauthenticated; create requires any authenticated owner/staff.

### Inputs

booking_id, amount, payment_method, optional notes. Direct methods: gcash; maribank / bank transfer / other normalize to maribank.

### How it works

In one transaction inserts a paid PAYMENTS row and increments BOOKINGS.amount_paid. A SQL CASE derives Fully Paid / Partial / Unpaid using the stored total (or calculated fallback when total is zero). Returns the created payment with 201.

### Current limits and details

No edit/delete route or gateway integration. Amount validation is numeric formatting and permits negative amounts in current code. Direct cash is rejected, while sync cash normalizes to maribank. Direct POST has no replay receipt; lost-response retries can duplicate payments.

### Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/PAYMENTS|PAYMENTS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/payments.php](<../../../../api/payments.php>)

Return to [[System Understanding/Start Here|Start Here]].
