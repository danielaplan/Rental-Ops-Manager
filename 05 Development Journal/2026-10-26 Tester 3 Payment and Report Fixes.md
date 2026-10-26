# Tester 3 Payment and Report Fixes — 2026-10-26

## What changed

- Added shared payment validation that rejects future payment dates and Completed payments greater than the remaining booking balance. The user approved the latter policy: no credit or refund-due balance is created implicitly.
- Added equivalent client-side validation before offline queuing, so invalid payment attempts display an error instead of becoming Pending Sync drafts.
- Restored the report response sections the Reports page consumes for balances, deposits, deductions, package popularity, booking totals, and approved overlaps.
- Kept Total Revenue based on the server's Completed-payment-date calculation; the Reports page no longer replaces it with a booking-date total.

## Verification performed

- `node tests/run_revised_backend.cjs tests/finance-plan-gaps.test.cjs` — passed against an isolated synthetic database. It covers future dates, reference length, overpayment rejection, exact-balance payment, deposits/deductions, payment-date revenue, and package popularity.
- `node --test tests/frontend-async-workflows.test.cjs tests/booking-flow-frontend-regressions.test.cjs` — 23 passed.
- `python tests/check_syntax.py` with the bundled Python runtime — passed.
- Live isolated-browser retest: a future payment and an over-balance payment were rejected before sync; a package booking appeared in the selected event-date range in Reports.
- `git diff --check` — passed.

## Boundaries

- All checks used isolated local synthetic data only. No migration, operational database change, commit, or push was performed.
