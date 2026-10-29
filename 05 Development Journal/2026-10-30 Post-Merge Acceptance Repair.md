# Post-Merge Acceptance Repair — 2026-10-30

## What happened

The first clean-database regression run failed while creating a package-backed booking. The checklist service read an inspection-notes column that existed in the guarded migration but was missing from the clean schema. Because clean deployment and the isolated test runners start from `db/schema.sql`, the mismatch caused a server error before most merged safeguards could be verified.

The same progressive test run found related merge drift: booking creation enforced the nonempty-checklist rule too early, confirmed bookings could not prepare outgoing checklist quantities, queued payments changed accepted totals before server acknowledgement, and the stale-conflict panel handled discard actions without rendering a discard button.

## Changes

- Added nullable checklist `notes` to the clean schema, matching the existing guarded migration.
- Restored package-free and no-template booking creation. A complete nonempty checklist is still required when equipment is actually released.
- Allowed checklist preparation on Confirmed bookings and locked outgoing quantities and conditions after an item-release record exists. Return inspection remains editable through the return workflow.
- Kept one shared cancellation-recovery guard and standardized the referenced-package rejection code as `package_service_locked`.
- Stopped queued payment create/correction operations from mutating accepted booking totals.
- Aligned local checklist creation with backend behavior, preserved exact booking/payment ID remapping, and rendered the existing stale-conflict discard action.
- Updated focused tests to use valid lifecycle state, accepted-versus-pending money semantics, and current shared contracts.

## Verification performed

- `node tests/run_revised_backend.cjs test_fixes.php test_booking_flow.php tests/fixed-bug-scenarios.test.cjs`
  - PHP safeguards: 6/6 passed.
  - Lifecycle: 1/1 passed.
  - Focused bug scenarios: 5/5 passed.
- `node tests/run_revised_backend.cjs tests/offline-sync.test.cjs tests/fixed-bug-scenarios.test.cjs`
  - Offline PHP/MySQL checks: 20/20 passed.
  - Focused bug scenarios: 5/5 passed.
- `node --test tests/booking-flow-frontend-regressions.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs tests/frontend-api-direct.test.cjs tests/payment-helper.test.cjs`
  - 58/58 passed.
- `node tests/run_backend_acceptance.cjs`
  - All ten backend/sync files passed.
  - All 20 offline integration checks passed.
  - All 5 focused bug scenarios passed.
  - All 65 frontend tests passed.
  - Syntax and whitespace checks passed.
  - Evidence: `tests/acceptance-results/1793302064773-5188/`.

All database-backed verification used runner-owned `akad_verify_plan_*` synthetic databases. No migration, normal development database, operational data, deployment, staging, production, physical-device, Hostinger, or client-acceptance check was performed.

[Back to Development Journal](README.md)
