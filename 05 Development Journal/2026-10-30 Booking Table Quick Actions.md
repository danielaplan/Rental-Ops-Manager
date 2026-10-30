---
title: "Booking Table Quick Actions"
date: 2026-10-30
tags:
  - development-journal
  - bookings
  - payments
  - admin-ui
status: implemented-local-verification
---

# Booking Table Quick Actions

## Finding

Routine booking work required opening the large detail modal before reaching status or payment controls. The View action also repeated both an eye icon and a text label in every row.

## Change

- Retained the accessible eye icon and restored its View text label after owner review.
- Restored the original visible Payment and Status badges, with a separate compact dropdown beside each description.
- Enlarged the dropdown targets so the visible Payment or Status text and its surrounding badge open the menu, rather than requiring the small chevron to be clicked.
- Reduced the badge padding after owner review while keeping the full text-and-chevron area clickable.
- After explicit owner approval, exposed every non-cancelled operational status in the compact dropdown: Pending, Confirmed, Awaiting Completion, Awaiting Payment, and Completed.
- Added an authenticated, audited direct status action to the booking API and offline outbox. Confirmation continues to reject current scheduling conflicts, while cancellation remains in its reason-required workflow.
- Added Payment actions for a partial payment, the exact remaining balance, returning to Unpaid through audited corrections, and payment history. They reuse the existing payment tab, validation, balance checks, audit behavior, and offline synchronization.
- Kept quick status actions operable for Pending Sync bookings so additional valid changes can follow the existing outbox sequence; lifecycle-controlled choices remain unavailable until their conditions are satisfied.
- Added a visual summary above Record Payment showing the booking total, accepted paid amount, and current balance, plus a live post-payment balance preview for Completed payments.
- Simplified Record Payment by removing routine Status, Payment Type, and Reference inputs. New entries submit as Completed and let the server derive Down payment versus Balance.
- Removed the redundant calculated Payment Status field from the detail modal.
- Replaced the table status action menu with an inline status selector that saves the selected operational status without opening the detail modal.
- Restored the established color coding on the inline table and detail status selectors while keeping their dropdown behavior and readable white option list.
- Matched the table Status control to the compact colored Payment dropdown. The full status text opens the list, and selecting a different status updates the shared system record.

## Verification

- Focused booking and offline API tests passed 22/22, including manual status replay.
- The broader local selection passed 63 tests. Two environment-dependent scripts did not execute: one requires an isolated-database name and one requires its local verification server.
- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.
- `git diff --check` passed.
- The isolated MySQL API lifecycle simulation could not run inside the sandbox (`ERROR 2002` / socket `10013`). Its outside-sandbox run was not authorized, so direct database persistence remains unverified in this pass.

This is local source and synthetic frontend verification, not physical-device, production, or client acceptance.
