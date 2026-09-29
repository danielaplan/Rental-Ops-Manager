---
title: "addons.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# addons.php

## In plain language

**The optional-extra handler.** This file manages separately priced extras belonging to a service.

**Where it lives:** `api/addons.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana adds an extra microphone priced at ₱300.

## What happens

1. Read extras and their service links.
2. Allow an owner to maintain their names, prices and status.
3. Provide selected extras to the booking price calculator.

## What the documentation team should remember

An extra is distinct from the base package and from the equipment list expected back.

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/ADDONS|ADDONS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/addons.php](<../../../../api/addons.php>)

Return to [[System Understanding/Start Here|Start Here]].
