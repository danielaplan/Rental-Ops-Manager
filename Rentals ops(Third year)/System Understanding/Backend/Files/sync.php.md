---
title: "sync.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# sync.php

## In plain language

**The offline-change receiver.** Synchronization means bringing changes stored on a device into the shared database once the server is reachable.

**Where it lives:** `api/sync.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Staff save Ana’s supported booking changes during an outage. Later, this file checks and accepts them, or returns a problem for review.

## What happens

1. Check the logged-in account and each queued action.
2. Check whether an action already succeeded and whether its data is valid.
3. Save accepted changes and return separate lists of accepted, conflicting and failed actions.

## What the documentation team should remember

A successful batch reply can still contain rejected actions. The server checks each action separately; it does not accept the whole batch as one unit.

Read [[System Understanding/Workflows/Offline Synchronization]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]], [[System Understanding/Backend/Files/equipment_service.php|equipment_service.php]], [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]], [[System Understanding/Backend/Files/sync_state.php|sync_state.php]], [[System Understanding/Backend/Files/deposit_service.php|deposit_service.php]]

Tables: [[System Understanding/Database/Tables/APP_SETTINGS|APP_SETTINGS]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]], [[System Understanding/Database/Tables/CUSTOMERS|CUSTOMERS]], [[System Understanding/Database/Tables/SERVICES|SERVICES]], [[System Understanding/Database/Tables/PACKAGES|PACKAGES]], [[System Understanding/Database/Tables/ADDONS|ADDONS]], [[System Understanding/Database/Tables/PAYMENTS|PAYMENTS]], [[System Understanding/Database/Tables/DEPOSITS|DEPOSITS]], [[System Understanding/Database/Tables/DELIVERY|DELIVERY]], [[System Understanding/Database/Tables/BOOKING_ITEMS|BOOKING_ITEMS]], [[System Understanding/Database/Tables/RENTAL_ITEMS|RENTAL_ITEMS]], [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]], [[System Understanding/Database/Tables/CATEGORIES|CATEGORIES]], [[System Understanding/Database/Tables/GALLERY|GALLERY]], [[System Understanding/Database/Tables/WEBSITE_CONTENT|WEBSITE_CONTENT]], [[System Understanding/Database/Tables/ITEM_RELEASES|ITEM_RELEASES]], [[System Understanding/Database/Tables/ITEM_HISTORY|ITEM_HISTORY]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/sync.php](<../../../../api/sync.php>)

Return to [[System Understanding/Start Here|Start Here]].
