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

**Location:** `api/addons.php`

Optional extras priced under a service.

## Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

## Access

Reads are unauthenticated. Every POST requires owner via authWrite().

## Inputs

Primary key: addon_id. Accepted JSON fields: service_id, name, price, status. Create defaults: status=Active.

## How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Optional extras priced under a service.

## Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

## Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/ADDONS|ADDONS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/addons.php](<../../../../api/addons.php>)

Return to [[System Understanding/Start Here|Start Here]].
