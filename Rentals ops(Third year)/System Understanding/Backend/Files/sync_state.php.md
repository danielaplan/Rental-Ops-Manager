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

**Location:** `api/sync_state.php`

Receipt ledger and temporary-to-server ID mapping for replay safety.

## Routes or callable helpers

syncState(), syncReference(), saveSyncReceipt(); helper only.

## Access

Caller scopes keys by authenticated user_id.

## Inputs

APP_SETTINGS row 2 JSON with receipts and ids. Operation client_id, payload hash, acknowledgement, optional local_id.

## How it works

Locks row 2 FOR UPDATE and loads JSON state. Keys receipts as user_id:client_id and ID mappings as user_id:entity:local_id. Resolves LOCAL- references only after a related create is acknowledged; accepts numeric and supported prefixed numeric identifiers. Stores acknowledgement+hash and mapping in the same transaction as business changes.

## Current limits and details

Receipt retention is unbounded and all commits share this locked JSON row. Losing/pruning receipts can remove replay protection. Server ID maps are user-scoped; they are not ordinary database foreign keys.

## Functions defined

`syncState()`, `syncReference()`, `saveSyncReceipt()`.

## Connections

Includes: No include dependencies; the caller supplies shared helpers/connection.

Tables: [[System Understanding/Database/Tables/APP_SETTINGS|APP_SETTINGS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/sync_state.php](<../../../../api/sync_state.php>)

Return to [[System Understanding/Start Here|Start Here]].
