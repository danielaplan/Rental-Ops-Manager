---
title: "availability_service.php"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# availability_service.php

**Guide:** [Backend Overview](../Backend%20Overview.md) · [API Reference](../API%20Reference.md) · [File Inventory](../File%20Inventory.md) · [Start Here](../../Start%20Here.md)

## What is this file?

Shared blocked-interval, conflict, reconciliation, approval, and release logic. It is a **shared helper/service** at `api/availability_service.php`.

## Why it exists

It keeps this responsibility in one backend location so direct callers and, where applicable, offline replay can apply the same rule.

## Ana example

During Ana’s rental, this component supports the connected catalog, financial, equipment, content, or audit operation.

## Observed interface and access

- **Interface:** Helper functions; no standalone route.
- **Access:** Called by authenticated endpoints/jobs.
- **Functions declared here:** `bookingDatetime()`, `bookingMinutes()`, `blockedInterval()`, `lockServices()`, `reconcileBookings()`, `availabilityConflicts()`, `requireConflictApproval()`, `recordConflictApproval()`, `releaseBooking()`.

## Connections

- Includes: [domain.php](domain.php.md), [checklist_service.php](checklist_service.php.md), [deposit_service.php](deposit_service.php.md).
- Tables named directly: [USERS](../../Database/Tables/USERS.md), [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [BOOKINGS](../../Database/Tables/BOOKINGS.md), [PAYMENTS](../../Database/Tables/PAYMENTS.md), [DEPOSITS](../../Database/Tables/DEPOSITS.md), [AVAILABILITY_BLOCKS](../../Database/Tables/AVAILABILITY_BLOCKS.md), [BOOKING_CONFLICT_OVERRIDES](../../Database/Tables/BOOKING_CONFLICT_OVERRIDES.md), [BOOKING_CHECKLIST_ITEMS](../../Database/Tables/BOOKING_CHECKLIST_ITEMS.md), [NOTIFICATIONS](../../Database/Tables/NOTIFICATIONS.md).

## Important rules and limitations

Validation and transaction behavior is defined by current source and its shared dependencies. Do not infer product readiness from the file’s presence.

## Source

[api/availability_service.php](../../../../api/availability_service.php)
