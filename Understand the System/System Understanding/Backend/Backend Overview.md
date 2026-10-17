---
title: "Backend Overview"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Backend Overview

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Purpose

The PHP backend is the authority between browser input and the shared database. It authenticates owners, validates trust-boundary data, serializes competing reservation changes, calculates money, preserves history, writes audits, and returns JSON.

## Organization

- **Entrypoints** such as `bookings.php`, `payments.php`, and `reports.php` translate HTTP requests into operations.
- **Shared services** such as `booking_service.php`, `payment_service.php`, and `availability_service.php` hold rules used by direct requests and sync replay.
- **Infrastructure helpers** such as `config.php`, `auth.php`, `domain.php`, `crud.php`, and `sync_state.php` provide transport, validation, sessions, transactions, and receipts.

There are **40 PHP files** in `api/`. Read [File Inventory](File%20Inventory.md) for every file and [API Reference](API%20Reference.md) for routes.

## Request boundary

Internal business endpoints require a valid active-owner bearer token. Explicit public reads remain for service/package/add-on/gallery/site content data. Production mode requires HTTPS and an allowed origin. JSON errors include an HTTP status and machine-readable code where the domain layer is used.

## Direct and sync parity

Direct endpoints and `sync.php` call shared services for booking, payment, catalog, delivery, checklist/history, audit, conflict, and deposit behavior. Sync adds receipts, local-ID mapping, stale-field checks, and per-operation result groups; it does not replace server validation.

## Related documentation

[Request Lifecycle](Request%20Lifecycle.md) · [API Reference](API%20Reference.md) · [Offline Synchronization](../Workflows/Offline%20Synchronization.md)
