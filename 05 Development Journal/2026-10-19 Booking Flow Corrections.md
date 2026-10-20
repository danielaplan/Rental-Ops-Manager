# 2026-10-19 — Booking flow corrections

## Outcome

The manual-booking, Pending-alteration, confirmation, payment, deposit, equipment release, return, and offline replay paths were corrected as one flow.

## What changed

- Manual booking can reuse an existing customer, uses the event date for promotion eligibility, and saves booking overlaps as Pending without pretending they were approved.
- Pending bookings can alter customer, service, package, add-ons, schedule allowances, discount, fees, and agreed total. Confirmation rechecks preparation/travel time and submits the exact current conflict IDs with a required reason.
- Payment corrections are available from payment history and replay offline through the shared audited backend path. The held deposit amount locks after its first accepted or queued write.
- Release now requires a Confirmed booking, a complete outgoing checklist, and no earlier release. Released/Returned item histories are written atomically by the server.
- Return conditions match server values, inactive add-ons are rejected during pricing, and booking text inputs are bounded at both UI and API boundaries.

## Verification

- Isolated synthetic acceptance passed all 9 backend test files and 18 offline integration checks using `akad_verify_plan_1792368076958_21372`.
- Frontend/source regressions passed 45 tests, including the new booking-flow suite.
- PHP, JavaScript, service-worker, and admin inline-script syntax checks passed.
- `git diff --check` remains nonzero only because the pre-existing user-owned file `this` has trailing whitespace at line 271; this change did not touch that file.

## Evidence boundary

This is local synthetic and source-level evidence. No normal development or production database, migration, deployment, physical device, production environment, or client acceptance was used.
