---
title: "gallery.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# gallery.php

**Location:** `api/gallery.php`

Image/content records. image is text; this script does not implement a file upload processor.

## Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

## Access

Reads are unauthenticated. Every POST requires owner via authWrite().

## Inputs

Primary key: image_id. Accepted JSON fields: title, image, featured. Create defaults: featured=0.

## How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Image/content records. image is text; this script does not implement a file upload processor.

## Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

## Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/GALLERY|GALLERY]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/gallery.php](<../../../../api/gallery.php>)

Return to [[System Understanding/Start Here|Start Here]].
