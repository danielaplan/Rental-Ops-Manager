---
title: "Phase 4 Deposit Refund Investigation"
date: 2026-10-29
tags:
  - development-journal
  - deposits
  - offline-sync
status: implemented-local-verification
---

# Phase 4 Deposit Refund Investigation

## Discover and root cause

The refund API existed, but the reported interface problem was reproducible across three browser/cache boundaries:

1. The refund button required a server `deposit_id`, so it stayed disabled for a valid newly queued deposit.
2. The local cache changed to Refunded before the server accepted the queued operation.
3. A successful deposit acknowledgement was removed from the outbox without applying the server-returned `refund_status` and `refund_date` to the scoped deposit cache.

The direct and synchronization endpoints also duplicated the refund SQL and audit behavior, creating a parity risk.

## Plan and acceptance criteria

The dependency order was shared service, direct/sync callers, cache acknowledgement handling, UI state, then tests and documentation. Acceptance required a positive queued deposit to expose the existing refund control, one refund operation to enter the outbox, the UI to remain pending before acknowledgement, and the accepted server status/timestamp to replace the cached proposal without a duplicate refund.

No schema change or migration was required. Authentication, booking locking, cent validation, audit history, offline ordering, and receipt idempotency remained in scope.

## Implementation

- `api/deposit_service.php`: added shared `refundDeposit()` locking, eligibility validation, update, audit, idempotent reread, and authoritative return value.
- `api/deposits.php` and `api/sync.php`: both refund routes delegate to the shared service.
- `js/sync.js`: a refund remains `refund_pending` until acceptance, duplicate queued refunds are rejected, and accepted deposit data is merged into the matching scoped cache record.
- `admin/bookings.html`: the existing button supports a positive queued deposit, disables while a refund operation exists, and distinguishes Refund pending from Refunded.

`api/domain.php`, `api/payment_service.php`, `api/payments.php`, and `js/payments.js` were inspected but did not require refund-specific changes.

## Verification performed

- Focused synthetic lifecycle: queued deposit creation, deduction, and refund; before replay the deposit remained Held with `refund_pending`; after replay the outbox was empty and the cache contained the simulated server's Refunded status and refund date.
- UI/source contract: queued-deposit button eligibility, pending label, shared direct/sync service delegation, and acknowledgement merge.
- Current frontend regression suite: 63/63 passed.
- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.
- `git diff --check` passed.
- Direct and sync database assertions were added to `tests/finance-plan-gaps.test.cjs` with realistic booking/deposit foreign keys.

The requested workflow was followed through source, synthetic lifecycle, regression, and documentation stages. This repository has no configured Playwright, Composer, or PHPUnit project, so those commands were not replaced with invented scaffolding. The database assertions could not run because local MySQL rejects `127.0.0.1` with Windows socket error `10013`. No development or production database was accessed.

## Status

**Implemented and locally verified.** Database-backed execution, a real browser/Playwright run, physical-device testing, deployment verification, and client acceptance remain pending. “Verified and operational” is not yet supported by the evidence collected in this session.
