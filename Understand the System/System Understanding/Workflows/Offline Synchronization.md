---
title: "Offline Synchronization"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Offline Synchronization

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Part A — Understanding the Feature

This first part uses everyday language. You can continue to the next lesson without studying the technical section.

### What is this feature?

Supported writes can be placed in a browser outbox while the PHP server is unreachable. Reconnection replays each operation to the authoritative backend.

### Why does the system need it?

A temporary outage should not discard the owner’s work, but local data must not silently overwrite newer server data or bypass business rules.

### Follow Ana’s fictional rental

An owner saves Ana’s booking while offline. The browser assigns a local ID and operation ID. After reconnection, the server validates the booking, maps the local ID to its database ID, and stores a receipt. If the reply is lost, retry returns the same acknowledgement instead of creating a duplicate.

### Step-by-step workflow

1. `js/api.js` detects a network failure for a supported write.
2. `js/offline.js`/`js/storage.js` retain an operation with `client_id`, entity, action, data, owner, and optional local ID.
3. `js/sync.js` sends up to 100 operations to `POST api/sync.php?do=commit`.
4. The server resolves local references and checks a per-owner receipt.
5. Each operation gets its own transaction and shared domain validation.
6. The reply separates committed, conflict, and failed operations.
7. Conflicts stay visible for owner review; a corrected retry receives a new operation ID.

The browser also caches every admin page and its local app assets after offline setup succeeds. This makes navigation possible during an outage, but it does not download fresh server data; supported offline work still needs an existing signed-in session and previously saved data.

### What Happens Behind the Scenes?

The receipt ledger and local-to-server ID map live in `APP_SETTINGS` row 2. Identical retries return the stored acknowledgement; reusing an accepted operation ID with changed data fails. Booking `_base` values detect stale edits for selected reservation fields.

### Visual explanation

```mermaid
sequenceDiagram
  participant B as Browser outbox
  participant S as sync.php
  participant R as Receipt ledger
  participant D as Domain service
  B->>S: queued operations
  S->>R: seen this owner and client ID?
  alt identical receipt exists
    R-->>S: prior acknowledgement
  else new operation
    S->>D: validate and transact
    D-->>S: record or conflict
    S->>R: save receipt and ID map
  end
  S-->>B: committed, conflicts, failed
```

The diagram shows a queued action reaching the server, being checked for an earlier receipt, and then being accepted or returned for review.

### Important things to remember

- A successful HTTP response may still contain conflicts or failures.
- The batch is not atomic; one failed operation does not roll back accepted neighbors.
- Stale detection covers selected booking fields, not every entity or field.
- One growing JSON receipt row serializes commits and has no retention policy.
- Offline UI evidence is synthetic/local; real device, quota, network, and multi-user acceptance remain deployment checks.
- Offline sync is approved and retained even though an older revised design document described online-only scope.

### Remember This

The offline queue is a waiting list, not the shared database. A queued change becomes official only after the server validates and accepts it.

## Part B — Technical Explanation

This section names the files, routes, tables, and validation rules. Beginner readers may skip it and continue to the next lesson.

### Technical details

`api/sync.php`, `api/sync_state.php`, shared `*_service.php` files; `js/sync.js`, `js/offline.js`, `js/storage.js`, `js/sync-ui.js`. Storage: browser local data plus `APP_SETTINGS.settings_id=2`.

### Technical references

[sync.php](../Backend/Files/sync.php.md) · [sync_state.php](../Backend/Files/sync_state.php.md) · [APP_SETTINGS](../Database/Tables/APP_SETTINGS.md)


## Continue Your Learning

**You’ve learned:** the difference between saving a change temporarily on one device and having the shared server accept it.

**Previous lesson:** [Post-event Completion](Post-event%20Completion.md)

**Next lesson:** [Reports and Audit History](Reports.md)

**Why read this next?** Once records are accepted by the shared system, the next lesson explains how owners turn them into useful summaries and history.

**Return to your learning dashboard:** [Start Here](../Start%20Here.md)
