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

## Overview

**The reusable-equipment catalog handler.** This file stores the equipment templates used when building a booking’s equipment list.

**Where it lives:** `api/rentalItems.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

A microphone entry belongs to karaoke and has a catalog quantity that can be copied into Ana’s assigned list.

## What happens

1. Keep item names, service links, quantities and descriptive fields.
2. Allow an owner to maintain the catalog.
3. Supply templates for booking-specific equipment lists.

## Key points

Catalog quantity is not automatically reduced when a booking is created or an item is released.

Read [[System Understanding/Workflows/Equipment Release and Return]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/rentalItems.php`

Reusable equipment catalog used to generate booking checklists.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: rental_item_id. Accepted JSON fields: service_id, name, quantity, item_code, required, tracking, status, condition, notes. Create defaults: quantity=1; required=0; tracking=quantity; status=Available; condition=Good.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Reusable equipment catalog used to generate booking checklists.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/rentalItems.php](<../../../../api/rentalItems.php>)

Return to [[System Understanding/Start Here|Start Here]].
