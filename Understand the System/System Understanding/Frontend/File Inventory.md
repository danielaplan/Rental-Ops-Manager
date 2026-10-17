---
title: "Frontend File Inventory"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Frontend File Inventory

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Admin screens

- [addons.html](../../../admin/addons.html)
- [audit.html](../../../admin/audit.html)
- [bookings.html](../../../admin/bookings.html)
- [calendar.html](../../../admin/calendar.html)
- [categories.html](../../../admin/categories.html)
- [content.html](../../../admin/content.html)
- [customers.html](../../../admin/customers.html)
- [dashboard.html](../../../admin/dashboard.html)
- [gallery.html](../../../admin/gallery.html)
- [inventory.html](../../../admin/inventory.html)
- [login.html](../../../admin/login.html)
- [manual-booking.html](../../../admin/manual-booking.html)
- [owners.html](../../../admin/owners.html)
- [packages.html](../../../admin/packages.html)
- [payments.html](../../../admin/payments.html)
- [reports.html](../../../admin/reports.html)
- [services.html](../../../admin/services.html)
- [settings.html](../../../admin/settings.html)

## JavaScript

- [admin.js](../../../js/admin.js)
- [api.js](../../../js/api.js)
- [app.js](../../../js/app.js)
- [bookings.js](../../../js/bookings.js)
- [calendar.js](../../../js/calendar.js)
- [config.js](../../../js/config.js)
- [customers.js](../../../js/customers.js)
- [inventory.js](../../../js/inventory.js)
- [offline.js](../../../js/offline.js)
- [payments.js](../../../js/payments.js)
- [services.js](../../../js/services.js)
- [storage.js](../../../js/storage.js)
- [sync-ui.js](../../../js/sync-ui.js)
- [sync.js](../../../js/sync.js)

## Styling

- [admin.css](../../../css/admin.css) — admin layout/components.
- [responsive.css](../../../css/responsive.css) — responsive adjustments.
- [style.css](../../../css/style.css) — shared/public styling.

`js/api.js` is the API mapping layer. Feature scripts should call it instead of constructing inconsistent requests. `js/config.js` supplies runtime configuration; `admin.js` supplies shared admin/session behavior; page-specific files manage their screens.


## Technical navigation

[Frontend Overview](Overview.md) · [Frontend Current Status](Current%20Status.md) · [Start Here](../Start%20Here.md)
