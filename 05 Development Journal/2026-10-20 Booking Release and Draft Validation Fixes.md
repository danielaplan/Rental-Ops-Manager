# Booking Release and Draft Validation Fixes — 2026-10-20

## What changed

- Bound booking-detail input, modal lifecycle, and release-checkbox events to `#bookingDetailModal`, which actually contains those controls. Release checklist changes now save and update progress.
- Added booking text-limit validation at the shared offline-first write boundary before any local booking, customer, checklist, or sync operation is created.
- Added regression coverage for the modal event target and for atomic rejection of oversized booking text.

## Why

Browser Scenarios 1 and 9 found two defects. Release checkboxes toggled visually but remained at `0 / 4` because their delegated handler listened from an unrelated ancestor. Oversized booking fields bypassed HTML limits and were written locally before the server could reject them, leaving an invalid Offline draft and failed sync operations.

## Verification

- Local synthetic tests: `node --test tests/booking-flow-frontend-regressions.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs` — 36 passed.
- Syntax: `python tests/check_syntax.py` — passed for PHP, JavaScript, service worker, tests, and admin inline scripts.
- Whitespace: `git diff --check` — passed.
- Browser: Booking 1 progressed from `0 / 4` to `4 / 4`, enabled release, and submitted successfully. A read-only database check found one release row for Booking 1 recorded by `Codex QA`.
- Browser: a fresh oversized booking attempt stayed on Manual Booking with a clear validation error. The existing sync badge remained at two, so the rejected attempt created no new queue entry.

## Boundaries

- The previously retained invalid Offline draft and two failed operations were not deleted.
- The inactive-add-on forged-request subcase from Scenario 6 remains a separate API/security verification gap, not a confirmed UI defect.
- No migration, deployment, commit, push, or operational-data change was performed. Browser verification used only the local synthetic QA database.
