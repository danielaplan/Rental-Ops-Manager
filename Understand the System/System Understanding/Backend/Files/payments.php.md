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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

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

Read [Payments and Deposits](../../Workflows/Payments%20and%20Deposits.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

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

Includes: [config.php](config.php.md), [auth.php](auth.php.md)

Tables: [PAYMENTS](../../Database/Tables/PAYMENTS.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/payments.php](<../../../../api/payments.php>)

## Continue reading

[Previous file: packages.php](packages.php.md) · [Next file: rentalItems.php](rentalItems.php.md) · [Back to Start Here](../../Start%20Here.md)
