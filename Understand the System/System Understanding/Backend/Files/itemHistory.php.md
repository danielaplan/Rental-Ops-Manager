---
title: "itemHistory.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# itemHistory.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The item-history recorder.** This file records equipment actions that are explicitly logged and lets someone read those past entries.

**Where it lives:** `api/itemHistory.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Staff add a history entry for a microphone after noting its condition.

## What happens

1. Accept an item, action, quantity and optional booking link.
2. Store the event with a time.
3. Show the item’s newest history entries first.

## Key points

This is not an automatic record of every change in the system. Some changes have no history entry unless one is separately written.

Read [Equipment Release and Return](../../Workflows/Equipment%20Release%20and%20Return.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/itemHistory.php`

Reads and appends equipment history entries.

### Routes or callable helpers

GET forItem (default) with rental_item_id; POST create.

### Access

Reads unauthenticated; create owner only.

### Inputs

rental_item_id, booking_id, action (default Updated), qty (default 0), condition.

### How it works

Selects newest events first and aliases event_date to date. Creates a row with database timestamp and returns history_id with 201.

### Current limits and details

Entries are explicitly written. A generic rental-item update, release, or return does not automatically append server history.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md)

Tables: [ITEM_HISTORY](../../Database/Tables/ITEM_HISTORY.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/itemHistory.php](<../../../../api/itemHistory.php>)

## Continue reading

[Previous file: gallery.php](gallery.php.md) · [Next file: itemReleases.php](itemReleases.php.md) · [Back to Start Here](../../Start%20Here.md)
