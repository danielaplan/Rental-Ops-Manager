---
title: "itemReleases.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# itemReleases.php

**Location:** `api/itemReleases.php`

Records a release event; this endpoint does not itself update item quantities or booking status.

## Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

## Access

Reads are unauthenticated. Every POST requires owner via authWrite().

## Inputs

Primary key: release_id. Accepted JSON fields: booking_id, released_by, notes, released_at. Create defaults: none.

## How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Records a release event; this endpoint does not itself update item quantities or booking status.

## Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

## Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/ITEM_RELEASES|ITEM_RELEASES]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/itemReleases.php](<../../../../api/itemReleases.php>)

Return to [[System Understanding/Start Here|Start Here]].
