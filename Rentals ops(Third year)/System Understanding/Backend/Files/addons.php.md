---
title: "addons.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# addons.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The optional-extra handler.** This file manages separately priced extras belonging to a service.

**Where it lives:** `api/addons.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana adds an extra microphone priced at ₱300.

## What happens

1. Read extras and their service links.
2. Allow an owner to maintain their names, prices and status.
3. Provide selected extras to the booking price calculator.

## Key points

An extra is distinct from the base package and from the equipment list expected back.

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/addons.php`

Optional extras priced under a service.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: addon_id. Accepted JSON fields: service_id, name, price, status. Create defaults: status=Active.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Optional extras priced under a service.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [crud.php](crud.php.md)

Tables: [ADDONS](../../Database/Tables/ADDONS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/addons.php](<../../../../api/addons.php>)

## Continue reading

[Next file: auth.php](auth.php.md) · [Back to Start Here](../../Start%20Here.md)
