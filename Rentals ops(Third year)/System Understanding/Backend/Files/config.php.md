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

**Location:** `api/config.php`

Shared request bootstrap and MySQL connection helpers.

## Routes or callable helpers

Included by endpoint scripts; it is not a business endpoint. OPTIONS requests terminate here.

## Access

No authentication here. Endpoint scripts decide access.

## Inputs

AKAD_DB_HOST, AKAD_DB_NAME, AKAD_DB_USER, AKAD_DB_PASS environment variables. Defaults: localhost, akad_rentals, root, empty password; charset utf8mb4.

## How it works

Sets JSON/CORS headers. db() caches one PDO connection within a request, uses exceptions, associative rows, and native prepared statements. sendJson() sets the HTTP status, encodes JSON, then exits. readJsonBody() decodes a JSON object/array, otherwise returns an empty array. input() checks JSON, POST, GET; requireField(), asInt(), asDecimal(), asDate(), asTime() are conversion helpers.

## Current limits and details

asDecimal() formats numeric input but does not reject negative values itself. asTime() checks format rather than clock bounds; bookings use a stricter regex. Database connection errors become a JSON 500; other SQL errors are not centrally wrapped.

## Functions defined

`db()`, `sendJson()`, `readJsonBody()`, `input()`, `requireField()`, `asInt()`, `asDecimal()`, `asDate()`, `asTime()`.

## Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: Shared infrastructure; table depends on caller.

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/config.php](<../../../../api/config.php>)

Return to [[System Understanding/Start Here|Start Here]].
