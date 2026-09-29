---
title: "rentalItems.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# rentalItems.php

**Location:** `api/rentalItems.php`

Reusable equipment catalog used to generate booking checklists.

## Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

## Access

Reads are unauthenticated. Every POST requires owner via authWrite().

## Inputs

Primary key: rental_item_id. Accepted JSON fields: service_id, name, quantity, item_code, required, tracking, status, condition, notes. Create defaults: quantity=1; required=0; tracking=quantity; status=Available; condition=Good.

## How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Reusable equipment catalog used to generate booking checklists.

## Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

## Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/rentalItems.php](<../../../../api/rentalItems.php>)

Return to [[System Understanding/Start Here|Start Here]].
