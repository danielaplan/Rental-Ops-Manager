---
title: "categories.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# categories.php

**Location:** `api/categories.php`

Standalone category labels; there is no category foreign key in SERVICES.

## Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

## Access

Reads are unauthenticated. Every POST requires owner via authWrite().

## Inputs

Primary key: category_id. Accepted JSON fields: name, status. Create defaults: status=Active.

## How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Standalone category labels; there is no category foreign key in SERVICES.

## Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

## Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/CATEGORIES|CATEGORIES]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/categories.php](<../../../../api/categories.php>)

Return to [[System Understanding/Start Here|Start Here]].
