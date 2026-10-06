---
title: "packages.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# packages.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The fixed-package handler.** This file manages priced package choices belonging to a service.

**Where it lives:** `api/packages.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana selects a ₱2,500 karaoke package rather than entering an unrelated price.

## What happens

1. Link the package to a service.
2. Let an owner maintain the package name and price.
3. Provide those records to booking pricing.

## Key points

The price calculator checks that a selected package belongs to the booking’s primary service.

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/packages.php`

Fixed-price packages under a service. Supplied service_id on create/update is checked for existence.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: package_id. Accepted JSON fields: service_id, package_name, price. Create defaults: none.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Fixed-price packages under a service. Supplied service_id on create/update is checked for existence.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [crud.php](crud.php.md)

Tables: [PACKAGES](../../Database/Tables/PACKAGES.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/packages.php](<../../../../api/packages.php>)

## Continue reading

[Previous file: itemReleases.php](itemReleases.php.md) · [Next file: payments.php](payments.php.md) · [Back to Start Here](../../Start%20Here.md)
