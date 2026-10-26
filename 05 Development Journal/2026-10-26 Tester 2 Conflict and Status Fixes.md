# Tester 2 Conflict and Status Fixes — 2026-10-26

## What changed

- Conflict approval now includes the booking's service, event interval, blocked interval, and status as an approval base. The server rejects the approval as stale if another session changes any of those values before submission.
- A Confirmed booking's detail selector now offers only `Confirmed`; the existing server rule remains authoritative and rejects a Confirmed-to-Pending transition.

## Verification performed

- `node tests/run_revised_backend.cjs tests/sync-plan-gaps.test.cjs` — passed against an isolated synthetic database, including the changed-schedule stale-approval case.
- `node --test tests/booking-flow-frontend-regressions.test.cjs tests/frontend-async-workflows.test.cjs` — 23 passed.
- `python tests/check_syntax.py` with the bundled Python runtime — passed.
- Live isolated-browser retest: after confirming a booking, reopening its Details showed that `Pending` was no longer an available status choice.
- `git diff --check` — passed.
- Final isolated lifecycle retest: an Awaiting Payment booking no longer blocked a new same-service booking; permitted Confirmed/ongoing cancellation retained its release record; Awaiting Completion, Awaiting Payment, and Completed cancellation attempts were rejected.

## Boundaries

- All verification used isolated local synthetic data. A final focused integration retest confirmed the exact 4:45 PM allowance boundary is free while 4:44 PM conflicts; the isolated browser retest confirmed a selected active booking appears in Dashboard's upcoming list. No migration, operational database change, commit, or push was performed.
