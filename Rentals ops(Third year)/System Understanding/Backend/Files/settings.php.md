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

## Overview

**The application-settings handler.** This file reads or replaces the saved settings object for the application.

**Where it lives:** `api/settings.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

An owner saves application preferences; later requests can read the stored settings.

## What happens

1. Read the public application settings record.
2. Allow the owner to replace its saved contents.
3. Keep internal synchronization history in a separate reserved record.

## Key points

An update replaces the complete settings object. This file does not define how unfinished screens use each setting.

Read [[System Understanding/System Overview]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/settings.php`

Reads/replaces the application settings object.

### Routes or callable helpers

GET get (default); POST ?do=update.

### Access

Read unauthenticated; update owner only.

### Inputs

JSON object representing the whole settings payload.

### How it works

Reads settings at settings_id=1, decoding JSON; absent row returns an empty object. Update upserts row 1 and returns the body. Does not merge omitted keys.

### Current limits and details

APP_SETTINGS row 2 is private sync state and is not exposed by this settings route.

### Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/APP_SETTINGS|APP_SETTINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/settings.php](<../../../../api/settings.php>)

Return to [[System Understanding/Start Here|Start Here]].
