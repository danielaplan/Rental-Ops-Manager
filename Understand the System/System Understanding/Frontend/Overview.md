---
title: "Frontend Overview"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Frontend Overview

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## What the frontend is for

The frontend is the owner’s browser interface: 18 admin HTML screens, 14 JavaScript files, and shared CSS. Screens collect input and show results; `js/api.js` is the main contract layer that converts UI IDs/fields, attaches the bearer token, sends requests, normalizes responses, and offers offline fallback for supported writes.

## Main owner journey

Login → dashboard/calendar → customer and booking → payment/deposit/delivery → equipment return and post-event review → reports/audit/settings. Catalog screens maintain services, packages, add-ons, rental items, categories, gallery, and editable content.

## Offline behavior

`offline.js`, `storage.js`, `sync.js`, and `sync-ui.js` retain supported operations, replay them, surface stale/conflict records, and let the owner review a retry. Server acceptance remains authoritative.

## Accessibility and responsive evidence

Existing focused browser checks include keyboard disclosure and a 390×844 layout in a synthetic walkthrough. That is bounded evidence, not complete physical-device, assistive-technology, or production acceptance.

## Related documentation

[Frontend File Inventory](File%20Inventory.md) · [Frontend Current Status](Current%20Status.md) · [API Reference](../Backend/API%20Reference.md)
