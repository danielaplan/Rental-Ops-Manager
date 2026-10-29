---
title: "Revenue Period Display"
date: 2026-10-29
---

# Revenue Period Display

## Change

The reports page now keeps its summary statistics visible when the selected event-date period contains no bookings. This makes the Completed-payment revenue total visible when a payment date is in the period but its linked event date is outside it. Charts remain hidden when there are no event records to plot.

## Verification

- `node --test tests/frontend-async-workflows.test.cjs` passed, including the zero-event/payment-revenue simulation.
- `node tests/check_syntax.cjs` passed.
- `git diff --check` passed.
- The isolated database-backed finance suite could not start because the local MySQL client cannot load `caching_sha2_password.dll`; no normal development or operational database was used.

## Scope

No offline, service-worker, or booking-screen code was changed because the defect was isolated to the reports screen. Existing unrelated changes in `api/config.php` and `android/` were preserved.

