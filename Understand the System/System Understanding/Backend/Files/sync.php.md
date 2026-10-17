---
title: "sync.php"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# sync.php

**Guide:** [Backend Overview](../Backend%20Overview.md) · [API Reference](../API%20Reference.md) · [File Inventory](../File%20Inventory.md) · [Start Here](../../Start%20Here.md)

## What is this file?

Offline operation replay and per-operation acknowledgement. It is a **HTTP endpoint** at `api/sync.php`.

## Why it exists

It keeps this responsibility in one backend location so direct callers and, where applicable, offline replay can apply the same rule.

## Ana example

During Ana’s rental, this component supports the connected catalog, financial, equipment, content, or audit operation.

## Observed interface and access

- **Interface:** GET queue placeholder; POST commit up to 100 operations.
- **Access:** Authenticated owner.
- **Functions declared here:** `syncDepositUpsert()`.

## Connections

- Includes: [booking_service.php](booking_service.php.md), [equipment_service.php](equipment_service.php.md), [booking_items_service.php](booking_items_service.php.md), [payment_service.php](payment_service.php.md), [deposit_service.php](deposit_service.php.md), [supporting_service.php](supporting_service.php.md), [catalog_definitions.php](catalog_definitions.php.md), [sync_state.php](sync_state.php.md).
- Tables named directly: [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [CATEGORIES](../../Database/Tables/CATEGORIES.md), [ADDONS](../../Database/Tables/ADDONS.md), [GALLERY](../../Database/Tables/GALLERY.md), [WEBSITE_CONTENT](../../Database/Tables/WEBSITE_CONTENT.md), [APP_SETTINGS](../../Database/Tables/APP_SETTINGS.md), [PACKAGES](../../Database/Tables/PACKAGES.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md), [PAYMENTS](../../Database/Tables/PAYMENTS.md), [DEPOSITS](../../Database/Tables/DEPOSITS.md), [BOOKING_ITEMS](../../Database/Tables/BOOKING_ITEMS.md), [DELIVERY](../../Database/Tables/DELIVERY.md), [DEPOSIT_DEDUCTIONS](../../Database/Tables/DEPOSIT_DEDUCTIONS.md), [BOOKING_CHECKLIST_ITEMS](../../Database/Tables/BOOKING_CHECKLIST_ITEMS.md).

## Important rules and limitations

Validation and transaction behavior is defined by current source and its shared dependencies. Do not infer product readiness from the file’s presence.

## Source

[api/sync.php](../../../../api/sync.php)


## Technical navigation

[Return to the Backend File Inventory](../File%20Inventory.md) · [Review the API Reference](../API%20Reference.md) · [Return to Start Here](../../Start%20Here.md)
