---
title: "Frontend Overview"
date: 2026-10-08
tags:
  - akad
  - system-understanding
  - frontend
status: documented
---

# Frontend Overview

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend](../Backend/Backend%20Overview.md) · [Current Implementation Gaps](../Current%20Implementation%20Gaps.md) · [Glossary](../Glossary.md)

## What the frontend is for

The frontend is the staff/admin interface — the pages and controls that people use to manage rentals. Staff enter booking details, view the calendar, process payments, handle deposits and deliveries, inspect equipment returns, and read reports.

## How it fits with the backend

The frontend **never** talks directly to MySQL. It communicates only through the PHP API via `js/api.js`:

```
Staff browser → js/app.js → js/api.js (request/normalize/payload) → PHP API → MySQL
```

| Part | Role |
|---|---|
| `admin/` (HTML pages) | The screens staff interact with |
| `js/api.js` | **The contract layer** — maps UI actions to PHP endpoints, handles auth tokens, normalizes data |
| `js/app.js` | Initialization, page routing, shared event handling |
| `js/admin.js` | Admin chrome (sidebar, sync panel, login/logout) |
| `js/sync.js` | Offline queue, background refresh, conflict resolution |
| `js/sync-ui.js` | Sync panel UI rendering |
| `js/calendar.js` | Calendar view with date indexing |
| `css/` | Stylesheets |

## Offline-first design

Changes made while offline are queued locally (IndexedDB/localStorage) and synced to the server when connectivity returns. The sync panel shows pending operations and conflicts.

## Authentication

Staff login through `admin/login.html` → `api/auth.php`. Bearer tokens stored in localStorage. Every API request includes the token in the `Authorization` header.

## Current status

See [Frontend Current Status](Current%20Status.md).

## Continue reading

[Previous: System Overview](../System%20Overview.md) · [Next: File Inventory](File%20Inventory.md) · [Back to Start Here](../Start%20Here.md)
