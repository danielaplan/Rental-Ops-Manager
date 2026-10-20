# Backend requirement implementation and evidence

Completion pass: 2026-10-15. This matrix supplements the revised backend plan and supersedes older blanket completion claims. **Implemented** describes repository code; **locally verified** describes only the synthetic environment below. Neither means operational migration, client acceptance, or production readiness.

## Awaiting Payment policy completion — 2026-10-16

The approved unpaid-balance policy is implemented across the shared release service, direct API, offline sync, notifications, reports, admin labels and tests. Complete return review releases service capacity. An unpaid booking becomes `Awaiting Payment`, remains incomplete, and shows the exact balance/action notice. Only completed rental payments covering the agreed total permit the later `Completed` transition. The complete non-migration runner passed on synthetic `akad_verify_plan_1792150757195_24148`: 9 backend/sync test files, 17/17 offline checks, 36/36 frontend tests, syntax and diff checks. [Evidence](../tests/acceptance-results/1792150756830-33488/summary.json).

## Clean-data deployment clarification — 2026-10-16

The user confirmed that all existing records are sample/test data and no real legacy business history needs migration. The 51 worksheet findings are therefore **Not Applicable** to the clean deployment path and no longer block backend completion or deployment preparation. Older matrix text treating them as operational findings is superseded. B0 migration rows apply only if a real legacy source is later introduced; the current path is a clean schema initialization with production-safe account setup.

## Current-code confirmation — 2026-10-16

Re-scanned the schema, migration source, API entry points, shared services, sync replay, reports, scheduled reconciler and focused tests for every B1–B6 row. One customer CRUD/schema mismatch was fixed by removing the nonexistent `notes` column from the writable customer definition; a regression covers a valid payload containing that legacy extra field. B1-05/B3-06 remain deferred by decision. B3-08 now includes the approved Awaiting Payment workflow described above.

The final code state passed `tests/run_backend_acceptance.cjs` on synthetic `akad_verify_plan_1792150757195_24148`: nine backend/sync files, 17/17 offline checks, 36/36 frontend regressions, syntax and diff checks. [Fresh summary and SHA-256 source manifest](../tests/acceptance-results/1792150756830-33488/summary.json). The runner did not execute a migration or access an operational database.

## Latest consolidated verification — 2026-10-15

[Consolidated report](Backend-Consolidated-Verification-2026-10-15.md): all nine applicable backend/sync files passed together on `akad_verify_plan_1792046383527_34548`, including all 17 offline checks, followed by all 34 frontend regressions, syntax and diff checks. No final failures or unexplained test skips. The deferred blockout subsection was explicitly excluded; migration tests were not executed because they apply a migration. A 97-file source hash manifest confirms the tested code stayed unchanged during execution. No new application defect reproduced; only test orchestration/scope/output handling changed in this pass.

Reproduce with `rtk proxy node tests/run_backend_acceptance.cjs`. Each run creates isolated synthetic schema/seed and owned PHP servers, stores separate evidence, and never invokes a migration or operational server. [Raw summary and hashes](../tests/acceptance-results/1792046382055-36320/summary.json).

[Owner walkthrough](Backend-Owner-Walkthrough-2026-10-15.md) W01–W12 passed on separate synthetic database `akad_verify_plan_1792046564392_28220`. The user authorized Codex to perform W11/W12 as delegated technical reviewer. Browser outage/reload/reconnect created exactly one booking/payment; a second authenticated owner could read it. A stale location edit was retained as a conflict, reviewed and retried. The recovery UI initially omitted location, so `js/sync-ui.js` now shows the previous/server/local location and includes the reviewed location in retry. All 35 frontend regressions and syntax checks passed after the fix. The 390×844 layout and keyboard disclosure were usable. On 2026-10-16, the user confirmed owner approval of all implemented/tested changes and later selected the Awaiting Payment policy; the current completion run verifies that policy separately. The walkthrough server was stopped.

Historical record: the external checklist covered the 51 sample worksheet rows before their status was clarified. It is obsolete for the clean deployment and is not an outstanding acceptance item.

## Scope decisions

- Keep approved offline recording, sync APIs/settings, receipts, local-ID mapping, retained conflicts, and retry behavior.
- Legacy FR-10 internal blockouts remain deferred, including their revised-plan counterparts B1-05/B3-06. Existing draft schema/API/tests are historical artifacts, not authorization to activate or extend the feature. Revised FR-10 deposits/deductions remain approved financial work.
- No legacy migration is required for the current clean-data deployment. The 51-row sample worksheet is retained only as obsolete test evidence.
- The existing migration worksheet is outside the repository at `C:\Users\acer\Desktop\akad-rentals-migration-resolution-worksheet.csv`. Owner evidence is required before supported JSON resolutions and a zero-exception dry run. See [Backend-Migration.md](Backend-Migration.md).

## Evidence key

| Key | Artifact and scope |
| --- | --- |
| M | `tests/migration-plan-gaps.test.cjs`: creates its own synthetic legacy database; rejects unsupported/evidenceless/invalid conversions before DDL, preserves known identities/times/inactive users/quantities, dry-run/apply/rerun. Never applies to an operational database. |
| A | `tests/auth-plan-gaps.test.cjs`: multi-device logout, expiry, deactivation/reset revocation, lockout, parallel login/reset, primary permissions, and actual CGI production HTTPS/CORS bootstrap behavior. |
| C | `tests/catalog-plan-gaps.test.cjs`: service defaults/overrides, booking validation, package-free bookings, references, snapshots, promotion eligibility on create/edit/confirm, and cancellation retaining linked records/history. |
| L | `tests/booking-plan-gaps.test.cjs`: scheduled reconciler safety/idempotence, system audit and persistent notices, template snapshot retention, due-but-unreleased blocking, atomic review/release rollback and retry. |
| F | `tests/finance-plan-gaps.test.cjs`: payment types/status/date/reference/actor/corrections, deposit separation and malformed input, payment-date revenue, report definitions and filtered detail lists. |
| S | `tests/sync-plan-gaps.test.cjs`: direct-versus-sync conflict enforcement for all three services, allowances, optional package, eligibility, explicit overlap approval/markers, cancellation retention, payment metadata, delivery validation/notes, catalog archive/validation, immutable history, and receipt replay. |
| R | `tests/backend-revised-requirements.test.cjs`: protected/public API boundaries, immutable audit/notifications, direct concurrent confirmation and deduction/refund, and account administration. Existing availability-block checks exercise historical draft code only. |
| O | `tests/offline-sync.test.cjs`: 17 real PHP/MySQL checks with independent storage clients, reload/retry/lost responses/stale edits, package checklists, and post-event review. |
| UI | Public-site, frontend API contract, frontend async workflow, and frontend direct API suites: 34 automated regressions; no claim of physical-device or owner usability acceptance. |

## Review corrections

Latest follow-up (2026-10-15): fixed rental-item deletion that could null historical item links (NFR-04/B4-06/B6-01) and checklist-template text/list/quantity validation gaps (B1-09/B4-04). Shared direct/sync deletion now rejects references in `item_history`, `equipment_checklist`, `booking_items`, and `booking_checklist_items`, preserving their rows and links without a deletion audit. Unused items remain deletable; receipt replay is unchanged. Template validation rejects malformed writes atomically without inventing names or quantities.

`tests/history-template-gaps.test.cjs` reproduced both failures before the fixes. Eight tests across that file plus C, L, S, and `write-validation-gaps` passed without skips on isolated `akad_verify_plan_1792045494512_37116`; syntax and diff checks passed. Other suites retain earlier evidence only. No operational database access or migration/dry-run execution occurred.

Reproduce: `rtk proxy node tests/run_revised_backend.cjs tests/history-template-gaps.test.cjs tests/catalog-plan-gaps.test.cjs tests/booking-plan-gaps.test.cjs tests/sync-plan-gaps.test.cjs tests/write-validation-gaps.test.cjs`.

Follow-up on 2026-10-15: B4-03/B4-06/B6-01 had two additional validation gaps despite earlier happy-path coverage. `tests/write-validation-gaps.test.cjs` now covers malformed sync deduction reasons and malformed direct/sync history booking links, transaction rollback, corrected retry, and receipt replay. The corresponding shared paths reject malformed values; sync reference types are checked before string conversion. Both regressions failed before the fixes and passed afterward. Inventory-only history retains omitted/null booking support.

This follow-up passed four focused files (`write-validation-gaps`, S, F, O; all 17 offline checks), 34 UI regressions, and PHP/JS/service-worker/admin-inline syntax checks on isolated `akad_verify_plan_1792044979583_38544`. No operational database access or migration execution occurred. Other suites listed below retain their earlier evidence dates/results.

Reproduce: `rtk proxy node tests/run_revised_backend.cjs tests/write-validation-gaps.test.cjs tests/sync-plan-gaps.test.cjs tests/finance-plan-gaps.test.cjs tests/offline-sync.test.cjs`.

A post-implementation compatibility review found that the existing dashboard and reports pages still consume the prior flat report fields. `api/reports.php` now returns those fields alongside the new detailed metrics. The same review found that pending local payments were indexed under a stripped version of local booking IDs; `js/payments.js` now preserves the exact ID so queued payments remain excluded from accepted revenue until synchronization succeeds. Finance/report and frontend regressions cover both fixes.

## Plan rows

| Plan item | Current implementation evidence | Remaining gate |
| --- | --- | --- |
| B0-01 | Timestamped backup/restore commands and separate restore target documented in `Backend-Migration.md`. | Operational backup/restore was previously attested by user; no artifact or new restore verified here. |
| B0-02 | Idempotent additive CLI migration, clean schema, migration receipt; M. | Operational application prohibited; MySQL DDL is not transactional. |
| B0-03 | Preflight exceptions, evidence gates, original-row archive/mapping, attribution and financial/quantity preservation; M. | **Not applicable to the current clean-data deployment.** Reassess only if a real legacy source is introduced. |
| B0-04 | Backup-based rollback and retained failed database procedure. | Actual operational recovery/cutover rehearsal not performed. |
| B1-01 | Owner schema/seed and `owners.php`; A, M. Known historical identities retained without staff login. | Individual operational identity resolutions remain blocked. |
| B1-02 | Service default columns and shared catalog validation; C, S. Limits align with booking allowances. | None identified in authorized local implementation. |
| B1-03 | Package metadata/defaults in schema and shared catalog definition; C, S. | Current implemented/tested package behavior was owner-approved on 2026-10-16. |
| B1-04 | Revised booking fields, optional package, generated unique reference and snapshots; C, S. | Historical snapshots/dates/statuses require owner evidence. |
| B1-05 | Existing availability-block draft retained. | **Deferred; no activation or new implementation approval.** |
| B1-06 | Per-conflict approval records, owner/reason/time, immutable API behavior; F, S. | Visual calendar treatment is frontend acceptance, outside this backend completion pass. |
| B1-07 | Revised payments and provenance; F, S, M. | Historical payment classifications/attribution evidence. |
| B1-08 | Itemized deductions and held/refund state; F, R, O, M. | Historical refunds/aggregate deduction evidence. |
| B1-09 | Templates, template items and copied booking snapshots; L, C, O. Item changes use retained template versions. | Current implemented/tested checklist behavior was owner-approved on 2026-10-16. |
| B1-10 | Revised delivery fields, responsibility and notes; shared direct/sync service; C, S. | No new delivery-pricing business rules inferred. |
| B1-11 | Persistent per-owner notifications, unique event key, workflow-only resolution; L, R. | Deploy scheduler after migration authorization. |
| B1-12 | Append-only audit/status history, explicit owner/system/migration origin; L, C, S, R, M. | Older unknown events remain labeled baselines, not reconstructed. |
| B1-13 | Booking interval, payment date, notification and audit indexes exist in schema/migration. Summary queries run on server; F. | Index selection and latency on representative production hosting/data unverified. |
| B2-01 | Internal endpoint authentication with explicit public-content exceptions; R and source review. | Production web-server configuration remains external. |
| B2-02 | Active-account/session validation, read after refresh; A. | None identified in authorized local implementation. |
| B2-03 | User-row serialized failures/lockout and successful-login reset; A. | None identified in authorized local implementation. |
| B2-04 | Primary-owner account administration, transactional multi-session revocation, serialized issuance; A. | Operational owner identity assignment requires evidence. |
| B2-05 | Production origin allowlist and HTTPS enforcement; A uses CGI requests. | Real TLS termination/origin deployment and hosting acceptance not verified. |
| B3-01 | Shared `booking_service.php` validation for direct/replay paths, copied allowances, totals/snapshots; C, S. | Unknown historical values remain migration blockers. |
| B3-02 | Delete is retained cancellation with reason, child rows/status audit preserved, retries idempotent; C, S. | Cancellation treatment of money is not invented; recorded finances remain retained. |
| B3-03 | Scheduled intervals preserved; due unreleased bookings have open effective end; L, C, S. | None identified in authorized local implementation. |
| B3-04 | Common service lock ordering/reconciliation before reservation mutation, all-service replay parity; R, L, S, O. | Production capacity/concurrency acceptance not established by local tests. |
| B3-05 | Conflict responses include client/service/event times; explicit approval/reason/each conflict required; markers returned for both bookings; S, F. | Frontend overlap presentation/owner procedure acceptance remains separate. |
| B3-06 | Existing internal blockout draft retained. | **Deferred; no activation or new implementation approval.** |
| B3-07 | Shared idempotent reconciler plus CLI `scripts/reconcile_bookings.php`, calendar/booking/notification fallback; L. | Operator scheduler registration after authorized migration. |
| B3-08 | Checklist review/deductions/release/status/notices/audit commit together using shared validation; unpaid reviewed bookings release service capacity into `Awaiting Payment`, and only full completed rental payment permits `Completed`; L, F, O. | Locally verified with direct and offline synthetic flows. Production/device acceptance remains open. |
| B3-09 | Authenticated allowance updates, default copying, zero overrides, unchanged historical bookings; C, S. | None identified in authorized local implementation. |
| B4-01 | Shared package metadata validation/archive and booking eligibility checks; C, S. | Current implemented/tested promotion/package behavior was owner-approved on 2026-10-16. |
| B4-02 | Shared payment service, derived balances, optional references, audited correction reason; F, S, R. | No new refund/overpayment policies invented. |
| B4-03 | Serialized held deposit/itemized deductions/refunds, nonnegative refundable balance; F, R, O, S. | Operational legacy refund evidence. |
| B4-04 | Versioned templates and transactional booking copies, shared inspected quantities/conditions; C, L, O. | Current implemented/tested checklist behavior was owner-approved on 2026-10-16. |
| B4-05 | Direct and replay delivery share methods, fee bounds, responsibilities, notes and audit; C, S. | Distance/routing/pricing expansion remains out of scope. |
| B4-06 | Shared audit writes for direct and replay booking/payment/catalog/delivery/history operations and automated lifecycle; C, L, F, S, A, R. | No claim of recovering unknown legacy history. |
| B5-01 | Completed payments by payment date; deposits/pending/failed excluded; F. | Production financial reconciliation remains owner acceptance. |
| B5-02 | Separately defined summaries plus inspectable upcoming/cancellation/overlap lists; F. | Lifetime versus period metrics explicitly labeled; no inferred cancellation-refund rules. |
| B5-03 | Service/package popularity by revised event dates, cancellation policy labeled; F. | Current implemented/tested report definitions were owner-approved on 2026-10-16; production reconciliation remains separate. |
| B6-01 | Removal superseded: sync retained and routed through shared authoritative helpers; S, O, UI. | No sync removal authorized. |
| B6-02 | Removal superseded: business settings row 1 and receipt/mapping row 2 retained; O, S and `sync_state.php`. | Existing unbounded JSON receipt growth remains a documented scaling limit. |

## Requirements not represented by a dedicated backend task

- FR-02: authenticated customer create/update/search/history implemented in `customers.php` and shared catalog validation; history links are preserved in cancellation/migration coverage. Full owner search/history usability is not certified by API tests.
- FR-05/FR-17: booking list supplies the consolidated calendar, derived payment state and approved-overlap marker. Existing sync refresh runs every 15 seconds while visible and connected; offline replay remains approved. Two-device automated sync coverage exists, but strict end-to-end calendar timing and visual marker acceptance are still frontend/deployment gates.
- NFR-02: historical 10,000-row synthetic results are retained in the main plan as local evidence only. No production performance claim or new production benchmark is made.
- NFR-03/NFR-04: authentication, validation, transport bootstrap, snapshots, provenance, financial retention and immutable history have focused local coverage above. Actual deployment and operational migration remain separate gates.

## Reproduce focused verification safely

The nine-file consolidated runtime run above is the latest verification of the final code. The following seven-file/migration results are retained historical evidence, not a new migration execution or instructions overriding current restrictions.

Latest final run after the report/payment compatibility corrections: **all seven backend/sync files passed** on isolated `akad_verify_plan_1792044208446_19208`, including all 17 offline checks. All focused integrations ran without skips. The separate migration regression passed; all 34 frontend facade/public/async regressions passed. PHP syntax passed for 42 files, changed JavaScript syntax checks and `git diff --check` passed. No operational database was accessed in this verification. This is local evidence only.

```powershell
rtk proxy node tests/run_revised_backend.cjs tests/backend-revised-requirements.test.cjs tests/catalog-plan-gaps.test.cjs tests/booking-plan-gaps.test.cjs tests/finance-plan-gaps.test.cjs tests/auth-plan-gaps.test.cjs tests/sync-plan-gaps.test.cjs tests/offline-sync.test.cjs
rtk proxy node tests/migration-plan-gaps.test.cjs
rtk node --test tests/public-site-data.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs tests/frontend-api-direct.test.cjs tests/booking-flow-frontend-regressions.test.cjs
rtk proxy python tests/check_syntax.py
```

The runner creates a fresh `akad_verify_plan_*` database, starts two PHP processes on free local ports, passes their URLs to each test, and stops those processes at completion. It retains that synthetic database for inspection and prints its exact name. The migration regression separately creates/removes only its own `akad_migration_gap_*` fixture. Do not substitute operational database names or run the old server setup against production. All test values are synthetic; no owner evidence is generated.

## Exact next action

Next, prepare a clean staging database from the reviewed schema without sample transactions or test credentials. Verify production origins/TLS, scheduler registration, performance, device/offline usability, backup/restore and client sign-off on the approved deployment target. Reopen the legacy evidence/migration process only if a real legacy source is introduced later.
