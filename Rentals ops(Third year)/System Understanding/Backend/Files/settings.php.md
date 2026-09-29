---
title: "settings.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# settings.php

**Location:** `api/settings.php`

Reads/replaces the application settings object.

## Routes or callable helpers

GET get (default); POST ?do=update.

## Access

Read unauthenticated; update owner only.

## Inputs

JSON object representing the whole settings payload.

## How it works

Reads settings at settings_id=1, decoding JSON; absent row returns an empty object. Update upserts row 1 and returns the body. Does not merge omitted keys.

## Current limits and details

APP_SETTINGS row 2 is private sync state and is not exposed by this settings route.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/APP_SETTINGS|APP_SETTINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/settings.php](<../../../../api/settings.php>)

Return to [[System Understanding/Start Here|Start Here]].
