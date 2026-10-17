---
title: "crud.php"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# crud.php

**Guide:** [Backend Overview](../Backend%20Overview.md) · [API Reference](../API%20Reference.md) · [File Inventory](../File%20Inventory.md) · [Start Here](../../Start%20Here.md)

## What is this file?

Allowlisted generic table CRUD shared by small catalog endpoints and sync. It is a **HTTP endpoint** at `api/crud.php`.

## Why it exists

It keeps this responsibility in one backend location so direct callers and, where applicable, offline replay can apply the same rule.

## Ana example

During Ana’s rental, this component supports the connected catalog, financial, equipment, content, or audit operation.

## Observed interface and access

- **Interface:** tableCrudSave(), tableCrud(), authWrite().
- **Access:** Reads may be public only when a definition explicitly allows it; direct writes require owner.
- **Functions declared here:** `tableCrudSave()`, `tableCrud()`, `authWrite()`.

## Connections

- Includes: [config.php](config.php.md), [auth.php](auth.php.md), [domain.php](domain.php.md).
- Tables named directly: [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [RENTAL_ITEMS](../../Database/Tables/RENTAL_ITEMS.md), [PACKAGES](../../Database/Tables/PACKAGES.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md), [EQUIPMENT_CHECKLIST](../../Database/Tables/EQUIPMENT_CHECKLIST.md), [BOOKING_ITEMS](../../Database/Tables/BOOKING_ITEMS.md), [ITEM_HISTORY](../../Database/Tables/ITEM_HISTORY.md), [BOOKING_CHECKLIST_ITEMS](../../Database/Tables/BOOKING_CHECKLIST_ITEMS.md).

## Important rules and limitations

Validation and transaction behavior is defined by current source and its shared dependencies. Do not infer product readiness from the file’s presence.

## Source

[api/crud.php](../../../../api/crud.php)


## Technical navigation

[Return to the Backend File Inventory](../File%20Inventory.md) · [Review the API Reference](../API%20Reference.md) · [Return to Start Here](../../Start%20Here.md)
