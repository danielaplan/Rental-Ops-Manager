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

## Overview

**The release-event recorder.** This file records that equipment was released for a booking, with the releasing person’s name and notes.

**Where it lives:** `api/itemReleases.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Staff save a release note for Ana’s booking before the equipment leaves.

## What happens

1. Receive the booking link, releasing person and notes.
2. Save or retrieve the release record.
3. Keep the event available as part of the booking’s records.

## Key points

A release note alone does not change equipment quantities or the booking’s status.

Read [[System Understanding/Workflows/Equipment Release and Return]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/itemReleases.php`

Records a release event; this endpoint does not itself update item quantities or booking status.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: release_id. Accepted JSON fields: booking_id, released_by, notes, released_at. Create defaults: none.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Records a release event; this endpoint does not itself update item quantities or booking status.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/ITEM_RELEASES|ITEM_RELEASES]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/itemReleases.php](<../../../../api/itemReleases.php>)

Return to [[System Understanding/Start Here|Start Here]].
