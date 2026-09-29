---
title: "sync_state.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# sync_state.php

## In plain language

**The accepted-change memory.** This helper remembers which offline actions the server has accepted, so repeating the same action does not save it twice.

**Where it lives:** `api/sync_state.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

The server saves Ana’s payment, but the reply is lost. Retrying the same queued action returns its earlier result instead of charging the record twice.

## What happens

1. Look up the accepted-action record for the signed-in user.
2. Translate temporary device numbers into real database numbers when a prior create succeeded.
3. Save the acknowledgement alongside the business change.

## What the documentation team should remember

This protects the sync path, not every direct request. The accepted-action history grows and needs a future retention approach.

Read [[System Understanding/Workflows/Offline Synchronization]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

**Location:** `api/sync_state.php`

Receipt ledger and temporary-to-server ID mapping for replay safety.

### Routes or callable helpers

syncState(), syncReference(), saveSyncReceipt(); helper only.

### Access

Caller scopes keys by authenticated user_id.

### Inputs

APP_SETTINGS row 2 JSON with receipts and ids. Operation client_id, payload hash, acknowledgement, optional local_id.

### How it works

Locks row 2 FOR UPDATE and loads JSON state. Keys receipts as user_id:client_id and ID mappings as user_id:entity:local_id. Resolves LOCAL- references only after a related create is acknowledged; accepts numeric and supported prefixed numeric identifiers. Stores acknowledgement+hash and mapping in the same transaction as business changes.

### Current limits and details

Receipt retention is unbounded and all commits share this locked JSON row. Losing/pruning receipts can remove replay protection. Server ID maps are user-scoped; they are not ordinary database foreign keys.

### Functions defined

`syncState()`, `syncReference()`, `saveSyncReceipt()`.

### Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: [[System Understanding/Database/Tables/APP_SETTINGS|APP_SETTINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/sync_state.php](<../../../../api/sync_state.php>)

Return to [[System Understanding/Start Here|Start Here]].
