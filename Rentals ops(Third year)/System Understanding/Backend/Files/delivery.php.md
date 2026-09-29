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

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

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

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/DELIVERY|DELIVERY]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/delivery.php](<../../../../api/delivery.php>)

Return to [[System Understanding/Start Here|Start Here]].
