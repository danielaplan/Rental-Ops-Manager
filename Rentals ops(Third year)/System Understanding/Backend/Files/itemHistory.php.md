---
title: "itemHistory.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# itemHistory.php

**Location:** `api/itemHistory.php`

Reads and appends equipment history entries.

## Routes or callable helpers

GET forItem (default) with rental_item_id; POST create.

## Access

Reads unauthenticated; create owner only.

## Inputs

rental_item_id, booking_id, action (default Updated), qty (default 0), condition.

## How it works

Selects newest events first and aliases event_date to date. Creates a row with database timestamp and returns history_id with 201.

## Current limits and details

Entries are explicitly written. A generic rental-item update, release, or return does not automatically append server history.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/ITEM_HISTORY|ITEM_HISTORY]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/itemHistory.php](<../../../../api/itemHistory.php>)

Return to [[System Understanding/Start Here|Start Here]].
