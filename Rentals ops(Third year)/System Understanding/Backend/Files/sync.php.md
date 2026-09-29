---
title: "sync.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# sync.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The offline-change receiver.** Synchronization means bringing changes stored on a device into the shared database once the server is reachable.

**Where it lives:** `api/sync.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Staff save Ana’s supported booking changes during an outage. Later, this file checks and accepts them, or returns a problem for review.

## What happens

1. Check the logged-in account and each queued action.
2. Check whether an action already succeeded and whether its data is valid.
3. Save accepted changes and return separate lists of accepted, conflicting and failed actions.

## Key points

A successful batch reply can still contain rejected actions. The server checks each action separately; it does not accept the whole batch as one unit.

Read [Offline Synchronization](../../Workflows/Offline%20Synchronization.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/sync.php`

Validates and commits offline operations with per-operation receipts.

### Routes or callable helpers

GET ?do=queue returns {queue: []}; POST ?do=commit accepts {queue: [...]}.

### Access

Commit requires session. Owner-only entity group: services, categories, addons, packages, customers, rentalItems, gallery, settings, websiteContent. Other supported operations accept owner/staff. Queue GET unauthenticated.

### Inputs

At most 100 operations. Each needs client_id string <=128 characters, entity, action, data object; optional owner_id must match signed-in user; local_id for created-record mapping. Booking update _base enables stale checks.

### How it works

Initializes APP_SETTINGS row 2. For each operation hashes original entity/action/data/local_id, starts a transaction, locks ledger, checks receipt, resolves references and dispatches business changes. Replay of identical client ID+hash returns stored acknowledgement; changed payload with acknowledged ID fails. Booking paths lock service 1, validate dates/prices and check slots/stale fields. Payments, deposits, delivery, generation, inspection, completion, JSON configuration and allowed CRUD have specialized branches. Saves receipt and commits; failure rolls back only that operation. Returns committed/conflicts/failed arrays.

### Current limits and details

A batch is not one all-or-nothing transaction. HTTP 200 ok:true can contain failed/conflicting operations. Sync role/validation rules differ from direct endpoints; service-only changes do not trigger slotChanged. GET queue is not the device outbox. See sync reference and gaps.

### Functions defined

`syncId()`.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md), [equipment_service.php](equipment_service.php.md), [booking_pricing.php](booking_pricing.php.md), [sync_state.php](sync_state.php.md), [deposit_service.php](deposit_service.php.md)

Tables: [APP_SETTINGS](../../Database/Tables/APP_SETTINGS.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md), [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [PACKAGES](../../Database/Tables/PACKAGES.md), [ADDONS](../../Database/Tables/ADDONS.md), [PAYMENTS](../../Database/Tables/PAYMENTS.md), [DEPOSITS](../../Database/Tables/DEPOSITS.md), [DELIVERY](../../Database/Tables/DELIVERY.md), [BOOKING_ITEMS](../../Database/Tables/BOOKING_ITEMS.md), [RENTAL_ITEMS](../../Database/Tables/RENTAL_ITEMS.md), [EQUIPMENT_CHECKLIST](../../Database/Tables/EQUIPMENT_CHECKLIST.md), [CATEGORIES](../../Database/Tables/CATEGORIES.md), [GALLERY](../../Database/Tables/GALLERY.md), [WEBSITE_CONTENT](../../Database/Tables/WEBSITE_CONTENT.md), [ITEM_RELEASES](../../Database/Tables/ITEM_RELEASES.md), [ITEM_HISTORY](../../Database/Tables/ITEM_HISTORY.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/sync.php](<../../../../api/sync.php>)

## Continue reading

[Previous file: settings.php](settings.php.md) · [Next file: sync_state.php](sync_state.php.md) · [Back to Start Here](../../Start%20Here.md)
