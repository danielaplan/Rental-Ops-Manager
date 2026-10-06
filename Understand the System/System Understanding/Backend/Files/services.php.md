---
title: "services.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# services.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The service-catalog handler.** This file manages the service lines offered by AKAD.

**Where it lives:** `api/services.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana chooses Karaoke Rental, one of the service entries alongside Sweet Corner and Balloon Decoration.

## What happens

1. Read the available service records.
2. Allow an owner to maintain names, descriptions and status.
3. Provide service records used by packages and bookings.

## Key points

A service describes an offering; a package describes a particular priced choice under that offering.

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/services.php`

Catalog of the three service lines.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: service_id. Accepted JSON fields: service_name, description, status. Create defaults: status=Active.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Catalog of the three service lines.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [crud.php](crud.php.md)

Tables: [SERVICES](../../Database/Tables/SERVICES.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/services.php](<../../../../api/services.php>)

## Continue reading

[Previous file: reports.php](reports.php.md) · [Next file: settings.php](settings.php.md) · [Back to Start Here](../../Start%20Here.md)
