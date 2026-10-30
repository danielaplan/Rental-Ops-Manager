# Online-First Offline Recovery — 2026-10-30

## Decision

The owner approved changing the broad offline outbox into limited recovery sync. A device may preserve a new booking draft, checklist generation/edit drafts, and a return-inspection draft. Money, accepted-booking changes and approvals, cancellation, release, final completion, delivery, catalog/inventory/gallery metadata, settings/content, and owner administration now require internet.

## Changes

- Reduced the browser outbox wrappers to the approved recovery operations while retaining automatic reconnect replay and manual **Refresh data and sync**.
- Added server-side replay allowlisting so an old or modified client cannot queue an authoritative online-only operation.
- Marked booking money, status/approval, cancellation, delivery, release, payment, and final-review controls as internet-required while offline.
- Replaced broad offline financial/catalog tests with limited-policy, idempotent booking replay, conflict-retention, and online-only rejection checks.
- Updated the approved-decision record, requirements changes, project index, and system-understanding pages.

## Verification performed

- `node tests/check_syntax.cjs` — passed.
- `node --test tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs` — 39/39 passed.
- `node --test tests/booking-flow-frontend-regressions.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs` — 46/46 passed.
- `node tests/run_revised_backend.cjs tests/sync-plan-gaps.test.cjs` — 1/1 passed on a runner-owned synthetic database.
- `node tests/run_revised_backend.cjs tests/write-validation-gaps.test.cjs tests/history-template-gaps.test.cjs tests/offline-sync.test.cjs` — focused backend policy/history/template checks passed after updating the conflict fixture to use an authoritative Confirmed overlap.

- `node tests/run_backend_acceptance.cjs` — all ten backend/sync files passed, both offline recovery checks passed, all five fixed-bug scenarios passed, all 64 frontend tests passed, and syntax/whitespace checks passed. Evidence: `tests/acceptance-results/1793329649432-2220/`.

## Boundaries

No schema migration, normal development database, operational data, Hostinger deployment, staging, production, physical-device, or client-acceptance check was performed. Existing untracked QA evidence was left untouched.

## Post-rebase completion

After rebasing this branch onto `origin/main`, the remaining implementation gaps were closed:

- Online booking creation now calls the authoritative booking endpoint first. Only an offline state or transport-level network failure creates a local draft; server validation errors do not enter the outbox.
- Offline booking drafts are forced to Pending with zero accepted payment and no conflict-approval payload. The sync endpoint independently rejects any modified or older client that attempts to replay Confirmed, paid, or conflict-approved booking creation.
- An entered down-payment amount survives a failed/offline create only as an intended-payment reminder. It follows the temporary booking ID to the accepted server ID, never affects revenue or payment history, and clears after an online payment is recorded.
- Catalog, inventory, gallery, package/template, website-content, settings, and owner write controls now visibly disable while offline. The service-worker cache version was bumped so existing devices receive the policy/UI changes.
- The final Hostinger guide now gives the exact Bookings-screen conflict-approval steps and tests the intended-payment boundary during F12.

Post-rebase frontend verification passed 69 focused tests plus repository syntax and whitespace checks. Because the normal XAMPP data directory could not start safely, a separate disposable MariaDB data directory was initialized on port 3317. Against that isolated instance, `sync-plan-gaps.test.cjs` and `offline-sync.test.cjs` passed all three live PHP/MySQL scenarios: Pending-only recovery, authoritative-operation rejection, exactly-once replay, retained overlap conflict, and rejected offline payment. The final focused frontend simulation passed 50/50 tests, followed by syntax and whitespace checks. The temporary server was stopped and its data directory removed; the normal XAMPP database was not used.

The first standard-XAMPP consolidated run exposed a PHP 8.0 runtime incompatibility in return inspection: string-key array unpacking in `equipment_service.php` produced HTTP 500. Replacing that expression with the equivalent `array_merge()` kept behavior unchanged while supporting the installed PHP 8.0.30 runtime. The focused booking lifecycle suite then passed 2/2.

Final non-migration acceptance passed with `passed: true` and `source_unchanged: true`: all ten backend/sync test files passed, including the two offline recovery checks and five fixed-bug scenarios; all 68 frontend tests passed; syntax and whitespace checks passed. Evidence: `tests/acceptance-results/1793337477627-5976/summary.json`. Deferred legacy blockouts, migration execution, operational data, manual physical-device/owner acceptance, and production performance remained excluded.

## Server-first checklist and inspection follow-up

A post-merge review found that checklist updates and return inspections still entered the outbox even while online. That allowed the direct release or final-review request to reach the server before its prerequisite data. The shared sync facade now sends checklist generation, checklist edits, and return inspection directly while online, waits for server confirmation, and uses the outbox only for an offline state, temporary local booking, or genuine network failure. Draft and server success messages now follow the actual save path.

Focused syntax and frontend verification passed 51/51 tests. Final non-migration acceptance passed all ten backend/sync files, both offline recovery checks, all five fixed-bug scenarios, all 69 frontend tests, and syntax/whitespace checks. Evidence: `tests/acceptance-results/1793340331130-25084/`. No schema or migration change was required.

[Back to Development Journal](README.md)
