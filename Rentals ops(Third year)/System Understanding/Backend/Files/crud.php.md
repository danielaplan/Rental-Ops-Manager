---
title: "crud.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# crud.php

**Location:** `api/crud.php`

Reusable CRUD dispatcher for simple tables, plus the owner-only write guard.

## Routes or callable helpers

tableCrud(): all, forService, forBooking, get; POST create, update, delete. authWrite(): owner check.

## Access

The caller must invoke authWrite(); tableCrud() does not authenticate by itself.

## Inputs

Table name, primary-key name, allowed fields, creation defaults, optional filters argument. HTTP id, service_id, booking_id, and JSON fields.

## How it works

Selects all rows by descending primary key, optionally filters by service/booking, fetches a record, or inserts/updates/deletes allowed fields using prepared values. Creates return 201; missing records 404; missing fields 400. Table/column names come from code allowlists.

## Current limits and details

The filters argument is unused. List/get branches do not restrict HTTP method. PHP array union $defaults + $vals gives defaults precedence on create: supplied values for defaulted fields are overridden. Update accepts those fields. Required fields and many domain rules rely on database constraints.

## Functions defined

`tableCrud()`, `authWrite()`.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: Shared infrastructure; table depends on caller.

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/crud.php](<../../../../api/crud.php>)

Return to [[System Understanding/Start Here|Start Here]].
