# Phase 2 Confirmed Payment Totals

Date: 2026-10-29

## What changed

- Removed local booking-total mutations when a payment creation or correction is merely queued.
- `PaymentsHelper.acceptedAmountPaid` now reads the server-confirmed booking aggregate without subtracting or adding pending drafts.
- The Payments page calculates Total Collected from confirmed booking aggregates, while Pending Sync remains a separate figure.
- Pending create and correction amounts remain visible in the outbox/payment history without affecting revenue, balances, or payment status.

## What was achieved

- Refreshing while a payment is pending does not change the accepted amount.
- Disconnecting and correcting a payment leaves the previously confirmed total intact.
- Reconnection can change accepted totals only after the server accepts the operation and refreshed booking data is received.
- Integer-cent and overpayment protections from Phase 1 remain in place.

## Verification performed

- Focused payment/API/booking simulation: 25/25 passed.
- Broader frontend regression run: 56/56 passed.
- Repository syntax check passed for PHP, JavaScript, the service worker, test scripts, and admin inline scripts.
- The database-backed offline scenario was expanded to assert the total before correction, after offline refresh, and after replay.

## Not done / blocker

- The expanded database-backed reconnect assertion could not run because local MySQL remains unavailable (`ERROR 2002`, Windows socket error `10013`). No development or production database was accessed.
- No physical-browser outage test, device test, production check, client acceptance, deployment, migration, commit, or push was performed.
