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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The saved-content handler.** This file stores and retrieves the application’s website-content object.

**Where it lives:** `api/websiteContent.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

An owner saves content text, and the backend keeps the supplied object for later reading.

## What happens

1. Read the current saved content.
2. Allow the owner to replace the content object.
3. Return the saved result.

## Key points

This is backend storage support. It does not establish that a public booking portal is approved or that its screens are finished.

Read [System Overview](../../System%20Overview.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/websiteContent.php`

Reads/replaces the website content object.

### Routes or callable helpers

GET get (default); POST ?do=update.

### Access

Read unauthenticated; update owner only.

### Inputs

JSON object representing the whole content payload.

### How it works

Reads content at content_id=1, decoding JSON; absent row returns an empty object. Update upserts row 1 and returns the body. Does not merge omitted keys.

### Current limits and details

Describes a backend content store; it does not establish that the unfinished frontend meets the internal-only scope.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md)

Tables: [WEBSITE_CONTENT](../../Database/Tables/WEBSITE_CONTENT.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/websiteContent.php](<../../../../api/websiteContent.php>)

## Continue reading

[Previous file: sync_state.php](sync_state.php.md) · [Back to Start Here](../../Start%20Here.md)
