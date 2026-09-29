---
title: "config.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# config.php

## Overview

**The shared setup.** This file gives the backend the basic tools it needs to answer a request and connect to the database. A database is the organized collection of saved records.

**Where it lives:** `api/config.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

When staff save Ana’s booking, the booking file uses this setup to reach the saved records and send back a result.

## What happens

1. Choose the database connection settings.
2. Provide helpers that read incoming information and format the reply.
3. Let the file handling the booking decide which business rules to apply.

## Key points

This is supporting code, so staff do not use it as a booking feature.

Read [[System Understanding/Backend/Request Lifecycle]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/config.php`

Shared request bootstrap and MySQL connection helpers.

### Routes or callable helpers

Included by endpoint scripts; it is not a business endpoint. OPTIONS requests terminate here.

### Access

No authentication here. Endpoint scripts decide access.

### Inputs

AKAD_DB_HOST, AKAD_DB_NAME, AKAD_DB_USER, AKAD_DB_PASS environment variables. Defaults: localhost, akad_rentals, root, empty password; charset utf8mb4.

### How it works

Sets JSON/CORS headers. db() caches one PDO connection within a request, uses exceptions, associative rows, and native prepared statements. sendJson() sets the HTTP status, encodes JSON, then exits. readJsonBody() decodes a JSON object/array, otherwise returns an empty array. input() checks JSON, POST, GET; requireField(), asInt(), asDecimal(), asDate(), asTime() are conversion helpers.

### Current limits and details

asDecimal() formats numeric input but does not reject negative values itself. asTime() checks format rather than clock bounds; bookings use a stricter regex. Database connection errors become a JSON 500; other SQL errors are not centrally wrapped.

### Functions defined

`db()`, `sendJson()`, `readJsonBody()`, `input()`, `requireField()`, `asInt()`, `asDecimal()`, `asDate()`, `asTime()`.

### Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: Shared infrastructure; table depends on caller.

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/config.php](<../../../../api/config.php>)

Return to [[System Understanding/Start Here|Start Here]].
