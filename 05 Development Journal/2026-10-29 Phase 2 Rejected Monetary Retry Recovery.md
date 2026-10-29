---
title: "Phase 2 Rejected Monetary Retry Recovery"
date: 2026-10-29
tags:
  - development-journal
  - offline-sync
  - payments
status: implemented-local-verification
---

# Phase 2 Rejected Monetary Retry Recovery

## Finding

A rejected monetary operation stayed visible in the outbox, but the owner had no narrow way to correct its amount and retry it. Recreating the action was awkward and risked losing track of the original operation identity.

## Change

`js/sync.js` now validates a corrected payment or deposit amount, canonicalizes it to two-decimal currency, updates the matching Pending Sync cache row, and retries the existing queue entry with its original `client_id`. `js/sync-ui.js` presents that correction control only for failed or conflicted monetary operations. Other queued work is not removed.

The server endpoints and shared PHP services did not require a behavioral change: rejected operations have no stored receipt, while an already accepted `client_id` remains protected by the existing receipt and payload checks. Reusing the rejected operation identity therefore supplies the intended exactly-once boundary.

## Verification performed

- Synthetic frontend replay: forced a payment rejection, corrected `13.37` to `12.00`, and verified that the queue retained the same `client_id`.
- Reconnection replay: verified one acknowledged payment with its server ID.
- Empty follow-up flush: verified zero additional commits and exactly one matching payment.
- Focused Node tests: 28/28 passed.
- Broader frontend tests: 59/59 passed.
- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.

The database-backed replay was not executed because local MySQL still refuses the connection with `ERROR 2002` / Windows socket error `10013`. No development or production database was accessed.

## Status

Implemented and locally verified at the client replay boundary. Database-backed confirmation and physical-device/client acceptance remain pending.
