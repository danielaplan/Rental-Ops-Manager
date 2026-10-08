---
title: "Frontend File Inventory"
date: 2026-10-08
tags:
  - akad
  - system-understanding
  - frontend
status: documented
---

# Frontend File Inventory

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend](../../Backend/File%20Inventory.md) · [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md) · [Glossary](../../Glossary.md)

## Purpose

This inventory lists the key frontend files and their responsibilities. Each file should be understood in context of how it connects to the backend API.

## File Organization

```
admin/          ← Bootstrap/jQuery admin UI pages
js/             ← Frontend logic (api.js, app.js, admin.js, sync.js, calendar.js)
css/            ← Stylesheets
```

## Key Files

| File | Responsibility |
|---|---|
| `js/api.js` | **API contract layer** — ~80 methods proxying all PHP endpoints. Handles auth tokens, field mapping, ID prefixing, response normalization |
| `js/app.js` | Initialization, page routing, shared event handling |
| `js/admin.js` | Admin chrome: sidebar, sync panel, login/logout, async error handling |
| `js/sync.js` | Offline queue, background refresh, conflict resolution |
| `js/sync-ui.js` | Sync panel UI rendering (data-change events, error display) |
| `js/calendar.js` | Calendar view with date indexing, keyboard-addressable buttons |
| `admin/manual-booking.html` | Main booking creation/edit form |
| `admin/bookings.html` | Booking list/view with pagination, status tabs |
| `admin/services.html` | Service/catalog management |
| `admin/settings.html` | App settings |
| `admin/content.html` | Website content |
| `admin/reports.html` | Reports dashboard |
| `admin/dashboard.html` | Dashboard view |
| `css/` | Stylesheets |

## How Frontend Connects to Backend

```
Staff browser
    ↓
js/app.js (initialization, page routing)
    ↓
js/api.js (request/normalize/payload)
    ↓
PHP API (api/*.php)
    ↓
MySQL
```

## How Frontend Talks to API

| Function | Purpose |
|---|---|
| `API.request(endpoint, options)` | Core fetch wrapper — handles URL, token, timeout, JSON parsing, error codes |
| `API.list(endpoint, entity, query)` | GET requests → normalize response |
| `API.create(endpoint, entity, data)` | POST create → payload mapping → normalize |
| `API.update(endpoint, entity, id, data)` | POST update → payload mapping → normalize |
| `API.remove(endpoint, id)` | POST delete |
| `API.normalize(entity, value)` | Converts server keys to UI keys (e.g., `service_id` → `SVC-001`) |
| `API.payload(entity, input)` | Converts UI keys to server keys (e.g., `name` → `service_name`) |

## ID Prefixes (Used in normalize/payload)

| Prefix | Entity | Example |
|---|---|---|
| `SVC-` | Services | `SVC-001` |
| `ADD-` | Add-ons | `ADD-001` |
| `CAT-` | Categories | `CAT-001` |
| `CUS-` | Customers | `CUS-001` |
| `PKG-` | Packages | `PKG-001` |
| `BI-` | Booking items | `BI-001` |
| `RI-` | Rental items | `RI-001` |
| `HIST-` | Item history | `HIST-001` |
| `REL-` | Item releases | `REL-001` |
| `PAY-` | Payments | `PAY-001` |
| `IMG-` | Gallery | `IMG-001` |
| `LOCAL-` | Local (pre-sync) records | `LOCAL-abc123` |

## Continue reading

[Previous: Current Status](Current%20Status.md) · [Next: Overview](Overview.md) · [Back to Start Here](../Start%20Here.md)
