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

[Back to Development Journal](README.md)
