---
title: "sync_state.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# sync_state.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The accepted-change memory.** This helper remembers which offline actions the server has accepted, so repeating the same action does not save it twice.

**Where it lives:** `api/sync_state.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

The server saves Ana’s payment, but the reply is lost. Retrying the same queued action returns its earlier result instead of charging the record twice.

## What happens

1. Look up the accepted-action record for the signed-in user.
2. Translate temporary device numbers into real database numbers when a prior create succeeded.
3. Save the acknowledgement alongside the business change.

## Key points

This protects the sync path, not every direct request. The accepted-action history grows and needs a future retention approach.

Read [Offline Synchronization](../../Workflows/Offline%20Synchronization.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

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

Tables: [APP_SETTINGS](../../Database/Tables/APP_SETTINGS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/sync_state.php](<../../../../api/sync_state.php>)

## Continue reading

[Previous file: sync.php](sync.php.md) · [Next file: websiteContent.php](websiteContent.php.md) · [Back to Start Here](../../Start%20Here.md)
