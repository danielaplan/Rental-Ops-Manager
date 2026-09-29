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

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

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

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/SERVICES|SERVICES]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/services.php](<../../../../api/services.php>)

Return to [[System Understanding/Start Here|Start Here]].
