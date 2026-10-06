---
title: "delivery.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# delivery.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The delivery-arrangement handler.** This file records how equipment will travel and who shoulders the delivery fee.

**Where it lives:** `api/delivery.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana’s booking uses Lalamove and the renter shoulders the fee. Staff record that arrangement.

## What happens

1. Check the booking number and allowed delivery choices.
2. Save or replace the booking’s current delivery arrangement.
3. Return the saved method, charge and fee responsibility.

## Key points

It does not book a Lalamove driver or automatically add the fee to the rental price.

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/delivery.php`

Stores the latest delivery arrangement for a booking.

### Routes or callable helpers

GET ?do=get&booking_id=...; POST ?do=upsert.

### Access

Reads unauthenticated; upsert any session.

### Inputs

booking_id; delivery_method self_pickup / lalamove / owner_delivered; fee_shouldered_by renter / owner; delivery_fee default 0.

### How it works

Validates positive booking ID and enum values. INSERT ... ON DUPLICATE KEY UPDATE uses unique booking_id to replace arrangement. Returns a row or null.

### Current limits and details

Records logistics only, with no Lalamove integration. Fee is not automatically added to booking total, and this script does not explicitly reject negative/non-numeric fee values.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md)

Tables: [DELIVERY](../../Database/Tables/DELIVERY.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/delivery.php](<../../../../api/delivery.php>)

## Continue reading

[Previous file: customers.php](customers.php.md) · [Next file: deposit_service.php](deposit_service.php.md) · [Back to Start Here](../../Start%20Here.md)
