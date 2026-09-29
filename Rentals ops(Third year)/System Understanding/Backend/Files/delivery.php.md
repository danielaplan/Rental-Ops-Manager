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

**Location:** `api/delivery.php`

Stores the latest delivery arrangement for a booking.

## Routes or callable helpers

GET ?do=get&booking_id=...; POST ?do=upsert.

## Access

Reads unauthenticated; upsert any session.

## Inputs

booking_id; delivery_method self_pickup / lalamove / owner_delivered; fee_shouldered_by renter / owner; delivery_fee default 0.

## How it works

Validates positive booking ID and enum values. INSERT ... ON DUPLICATE KEY UPDATE uses unique booking_id to replace arrangement. Returns a row or null.

## Current limits and details

Records logistics only, with no Lalamove integration. Fee is not automatically added to booking total, and this script does not explicitly reject negative/non-numeric fee values.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/DELIVERY|DELIVERY]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/delivery.php](<../../../../api/delivery.php>)

Return to [[System Understanding/Start Here|Start Here]].
