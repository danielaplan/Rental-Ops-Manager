---
title: "Cash Payment Method"
date: 2026-10-30
tags:
  - development-journal
  - payments
  - offline-sync
status: implemented-local-verification
---

# Cash Payment Method

## Finding

The local sample cache contained a Cash payment, but the admin choices, PHP payment service, offline validation, and database enum accepted only GCash and MariBank. A Cash selection therefore could not be saved reliably across direct and synchronized workflows.

## Change

- Added Cash to the shared admin payment-method list and payment-history label normalization.
- Cash selections now force the payment status to Completed in the shared frontend helper, offline queue path, correction form, and PHP service.
- The booking payment form disables its status selector and explains the automatic Completed status while Cash is selected.
- Added Cash to the clean-install schema and supplied a separate, operator-run enum migration for existing installations. The migration was created but not executed.
- Updated the payment workflow, PAYMENTS table reference, and project index.

## Verification

- Payment helper tests passed 3/3, including a Pending Cash request being normalized to Completed.
- Focused frontend API and booking-flow tests passed 20/20, including offline Cash outbox normalization.
- The complete frontend regression selection passed 57/57.
- The isolated PHP/MySQL finance test passed against a runner-owned synthetic database and confirmed that the server stores Cash as Completed. The synthetic database was removed after the run.
- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.
- `git diff --check` passed.

This work does not prove production deployment or client acceptance. Existing installations require an authorized schema migration before the new option is deployed.
