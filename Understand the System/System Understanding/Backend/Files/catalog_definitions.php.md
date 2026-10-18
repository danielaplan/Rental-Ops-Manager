---
title: "catalog_definitions.php"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# catalog_definitions.php

**Guide:** [Backend Overview](../Backend%20Overview.md) · [API Reference](../API%20Reference.md) · [File Inventory](../File%20Inventory.md) · [Start Here](../../Start%20Here.md)

## What is this file?

Shared CRUD definitions and validation for catalog/customer entities. It is a **shared helper/service** at `api/catalog_definitions.php`.

## Why it exists

It keeps this responsibility in one backend location so direct callers and, where applicable, offline replay can apply the same rule.

## Ana example

During Ana’s rental, this component supports the connected catalog, financial, equipment, content, or audit operation.

## Observed interface and access

- **Interface:** Definition helpers for services, packages, add-ons, gallery, rental items, categories, customers.
- **Access:** Used by direct and sync dispatchers.
- **Functions declared here:** `serviceCrudDefinition()`, `packageCrudDefinition()`, `addonCrudDefinition()`, `galleryCrudDefinition()`, `rentalItemCrudDefinition()`, `categoryCrudDefinition()`, `customerCrudDefinition()`.

## Connections

- Includes: [crud.php](crud.php.md).
- Tables named directly: [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [CATEGORIES](../../Database/Tables/CATEGORIES.md), [ADDONS](../../Database/Tables/ADDONS.md), [RENTAL_ITEMS](../../Database/Tables/RENTAL_ITEMS.md), [GALLERY](../../Database/Tables/GALLERY.md), [PACKAGES](../../Database/Tables/PACKAGES.md).

## Important rules and limitations

Validation and transaction behavior is defined by current source and its shared dependencies. Do not infer product readiness from the file’s presence.

## Source

[api/catalog_definitions.php](../../../../api/catalog_definitions.php)


## Technical navigation

[Return to the Backend File Inventory](../File%20Inventory.md) · [Review the API Reference](../API%20Reference.md) · [Return to Start Here](../../Start%20Here.md)
