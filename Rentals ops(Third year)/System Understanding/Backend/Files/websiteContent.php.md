---
title: "websiteContent.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# websiteContent.php

**Location:** `api/websiteContent.php`

Reads/replaces the website content object.

## Routes or callable helpers

GET get (default); POST ?do=update.

## Access

Read unauthenticated; update owner only.

## Inputs

JSON object representing the whole content payload.

## How it works

Reads content at content_id=1, decoding JSON; absent row returns an empty object. Update upserts row 1 and returns the body. Does not merge omitted keys.

## Current limits and details

Describes a backend content store; it does not establish that the unfinished frontend meets the internal-only scope.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/WEBSITE_CONTENT|WEBSITE_CONTENT]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/websiteContent.php](<../../../../api/websiteContent.php>)

Return to [[System Understanding/Start Here|Start Here]].
