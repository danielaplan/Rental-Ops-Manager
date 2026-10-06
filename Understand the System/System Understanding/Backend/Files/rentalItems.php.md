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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

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

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

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

Includes: [crud.php](crud.php.md)

Tables: [RENTAL_ITEMS](../../Database/Tables/RENTAL_ITEMS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/rentalItems.php](<../../../../api/rentalItems.php>)

## Continue reading

[Previous file: payments.php](payments.php.md) · [Next file: reports.php](reports.php.md) · [Back to Start Here](../../Start%20Here.md)
