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

**Location:** `api/packages.php`

Fixed-price packages under a service. Supplied service_id on create/update is checked for existence.

## Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

## Access

Reads are unauthenticated. Every POST requires owner via authWrite().

## Inputs

Primary key: package_id. Accepted JSON fields: service_id, package_name, price. Create defaults: none.

## How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Fixed-price packages under a service. Supplied service_id on create/update is checked for existence.

## Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

## Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/PACKAGES|PACKAGES]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/packages.php](<../../../../api/packages.php>)

Return to [[System Understanding/Start Here|Start Here]].
