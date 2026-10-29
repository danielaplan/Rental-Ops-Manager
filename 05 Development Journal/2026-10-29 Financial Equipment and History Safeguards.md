# Financial, Equipment, and History Safeguards — 2026-10-29

This change closes five related integrity gaps found during the booking-core review.

- Booking updates now lock and sum Completed payment rows before accepting an agreed-total reduction.
- A payment correction that makes a reviewed Completed booking unpaid now moves it to Awaiting Payment in the same transaction, clears `completed_at`, preserves `released_by`, review notes, and checklist evidence, and reopens the owner notification with an audit transition.
- Cancellation now stops whenever checklist evidence shows released equipment that is unreturned, missing, or uninspected. The booking screen explains the required Return step, keeps an offline request active until server acceptance, and restores server state when an online request is rejected.
- Referenced packages cannot move to a different service. Package rows are locked consistently with booking creation so a concurrent catalog move cannot break a new booking.
- Payments, Dashboard, and Reports now share a lifetime outstanding-balance calculation that excludes Cancelled bookings and keeps pending-sync payments separate.

Focused regression coverage was added to `finance-plan-gaps.test.cjs`, `booking-plan-gaps.test.cjs`, `catalog-plan-gaps.test.cjs`, `frontend-api-contract.test.cjs`, and the frontend workflow harness.

Verification performed:

- `node tests/check_syntax.cjs` — passed.
- `node tests/run_revised_backend.cjs test_fixes.php test_booking_flow.php` — 4/4 direct validation tests and 1/1 lifecycle integration test passed against an isolated temporary MariaDB instance; each PHP test used transaction rollback.
- Affected finance, booking, catalog, and offline suites passed independently on fresh synthetic databases; offline replay passed 19/19 integration checks.
- `node tests/run_backend_acceptance.cjs` — consolidated non-migration acceptance passed all nine backend/sync suites, 19/19 offline checks, 54/54 frontend harness tests, syntax, and whitespace checks. Evidence was written under `tests/acceptance-results/1793269532066-15628/` (an intentionally ignored directory).
- `git diff --check` — passed after the source, test, and documentation updates.
- XAMPP's normal data directory remained unusable because `ibdata1` was not writable to the test process. Verification therefore used a separate temporary MariaDB data directory and port, never the normal development database. Eighteen runner-created synthetic databases and the temporary data directory were removed after verification.
- Playwright is not installed or configured in this repository. Frontend/offline evidence came from the established Node VM/contract harness and live two-server offline integration suite, not a physical browser.

Still required: manual browser/device and owner acceptance on a deployment-like environment. This entry is local synthetic evidence only; it is not production or client acceptance.
