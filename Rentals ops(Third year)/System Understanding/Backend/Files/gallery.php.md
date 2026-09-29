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

## Overview

**The gallery-record handler.** This file stores image references or image text plus titles and featured flags.

**Where it lives:** `api/gallery.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

An owner adds a gallery record with a title and image value.

## What happens

1. Receive the allowed image-record fields.
2. Use the shared record handler to add, read, edit or remove them.
3. Return the record.

## Key points

It stores information about images; it does not itself implement a file-upload service.

Read [[System Understanding/System Overview]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/gallery.php`

Image/content records. image is text; this script does not implement a file upload processor.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: image_id. Accepted JSON fields: title, image, featured. Create defaults: featured=0.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Image/content records. image is text; this script does not implement a file upload processor.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/GALLERY|GALLERY]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/gallery.php](<../../../../api/gallery.php>)

Return to [[System Understanding/Start Here|Start Here]].
