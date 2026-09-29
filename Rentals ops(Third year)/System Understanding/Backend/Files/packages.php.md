---
title: "packages.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# packages.php

## In plain language

**The fixed-package handler.** This file manages priced package choices belonging to a service.

**Where it lives:** `api/packages.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana selects a ₱2,500 karaoke package rather than entering an unrelated price.

## What happens

1. Link the package to a service.
2. Let an owner maintain the package name and price.
3. Provide those records to booking pricing.

## What the documentation team should remember

The price calculator checks that a selected package belongs to the booking’s primary service.

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/PACKAGES|PACKAGES]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/packages.php](<../../../../api/packages.php>)

Return to [[System Understanding/Start Here|Start Here]].
