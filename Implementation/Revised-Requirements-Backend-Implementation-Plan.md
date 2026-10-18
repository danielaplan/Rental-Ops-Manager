# Revised Requirements — Backend and Database Implementation Plan

## Purpose

This plan aligns the PHP API and MySQL database with the revised requirements in `Source Documents/Documentation/REvised`. It covers schema migration, authentication, business rules, reporting, auditability, testing, and the disposition of the deferred offline-sync backend.

## Awaiting Payment workflow completion — 2026-10-16

The owner-approved policy is now implemented as one shared direct/offline workflow. A reviewed post-event booking with complete return inspection releases service availability immediately. If completed rental payments are below the agreed total, the booking moves from `Awaiting Completion` to `Awaiting Payment`, retains the exact balance and review audit, and creates persistent owner action notifications. It cannot become `Completed` while that balance remains. After completed payments cover the agreed total, the owner completes it; the completion time/audit are written and the payment notifications resolve. Checklist edits and ordinary booking edits remain closed after service release.

The admin booking view labels both stages and blocks completion with the exact remaining amount. Dashboard/report counts expose `Awaiting Payment`; upcoming availability lists exclude it because service capacity has already been released. Offline replay uses the same backend transition and preserves its APIs/settings.

Focused booking, finance, offline and frontend checks passed, followed by the complete non-migration acceptance runner on fresh synthetic database `akad_verify_plan_1792150757195_24148`: all nine backend/sync files, all 17 offline checks, all 36 frontend tests, syntax checks and `git diff --check`. Evidence: [acceptance summary](../tests/acceptance-results/1792150756830-33488/summary.json). No migration, operational database access, operational dry run, deferred blockout execution, production hosting test or physical-device acceptance occurred.

## Clean-data deployment clarification — 2026-10-16

The user confirmed that this project has contained sample/test data from the beginning and has no real historical business records to migrate. The earlier 51-row migration worksheet and preflight results describe disposable sample data. They do not require owner evidence and are not a deployment blocker. This clarification supersedes every older statement in this plan that calls those 51 rows operational findings or requires their resolution.

For deployment, initialize a clean database from the reviewed schema and create the intended production owner accounts through the approved setup process. Do not copy sample bookings, payments, checklist quantities or test credentials into production. The legacy migration utility remains available only if a real legacy source is introduced later; using it would require a new evidence review and separate authorization.

## Current-code confirmation pass — 2026-10-16

Re-read the B1–B6 plan rows against the current schema, migration source, API entry points, shared booking/availability/payment/deposit/checklist/catalog/supporting services, sync replay, reports, scheduled reconciler and focused tests. The authorized runtime backend rows have corresponding code paths; B1-05/B3-06 internal availability blockouts remain deliberately deferred. Direct and offline writes share the authoritative services, so offline sync remains intact.

The scan found one additional customer CRUD mismatch: `customerCrudDefinition()` advertised a `notes` write although the clean `customers` table has no such column. A payload containing that field could fail with an SQL error. The unsupported field was removed from the writable definition and a regression now verifies that an otherwise valid customer payload containing the legacy extra field succeeds without attempting to write a nonexistent column.

After the fix, the earlier complete non-migration acceptance runner passed on fresh synthetic database `akad_verify_plan_1792128884100_5244`. The Awaiting Payment completion run above supersedes it for the current code state. Migration execution, operational data, deferred blockouts, production hosting/performance and physical-device acceptance remain excluded.

## Roadmap progress: consolidated runtime verification — 2026-10-15

Completed the consolidated automated portion of step 1: nine runtime backend/sync files passed together (17 offline checks included), all 34 frontend regressions passed, syntax and diff checks passed, and source hashes stayed unchanged during the run. Test database: `akad_verify_plan_1792046383527_34548`. No new application defect reproduced. Added a reproducible acceptance runner, explicit deferred-blockout test exclusion and isolated offline-result output. No operational database access, migration or dry run occurred.

Step 2's technical scenarios are executed: [owner walkthrough](Backend-Owner-Walkthrough-2026-10-15.md) W01–W12 passed on separate synthetic `akad_verify_plan_1792046564392_28220`. The user authorized Codex to perform W11/W12 as delegated reviewer while the owners were unavailable. W11 verified offline creation/reload/reconnect, one accepted booking/payment and second-owner visibility. W12 verified stale-edit retention, keyboard operation and a 390×844 viewport. It exposed and closed a location-conflict recovery gap in `js/sync-ui.js`; all 35 frontend regressions and syntax checks passed afterward. On 2026-10-16, the user confirmed owner approval of every implemented and tested change and then selected the Awaiting Payment policy. The later automated completion run verifies that policy. The walkthrough server was stopped.

Historical record: an evidence checklist was prepared before the user clarified that all 51 worksheet rows were sample data. That checklist is obsolete for the clean deployment and requires no completion.

Exact results, exclusions, environment and reproducible commands: [consolidated report](Backend-Consolidated-Verification-2026-10-15.md). Migration tests were not run and deferred blockouts were not exercised. Historical evidence, performance, deployment and production acceptance remain open. Next: collect source evidence without operational migration work.

## Ordered completion roadmap — 2026-10-15

This is a plan, not new approval to access an operational database, execute a migration/dry run, deploy, or change business policy. Preserve the current worktree and offline APIs/settings. Legacy internal blockouts remain excluded. Completion must be supported by evidence, not assumed from passing a subset of tests.

| Order | Work and plan coverage | Responsibility / prerequisite | Exit evidence |
| --- | --- | --- | --- |
| 1 — Verify the current backend together | Inventory the current file state and map every authorized B1–B6 behavior to tests. Run all applicable runtime suites on a fresh synthetic schema: revised backend, auth, catalog, booking lifecycle, finance, sync, offline, write-validation, history-template, frontend contract/async/direct/public, and syntax. Explicitly exclude deferred blockout acceptance. Keep generated results separate from existing evidence. Fix reproduced in-scope defects, then rerun affected tests and the final integrated set. | Implementation work can proceed within existing safe backend scope; no operational connections or migration invocation. | One dated report for the same final code state, exact commands/database/environment, pass/fail/skip counts, remaining defects and limits. No unexplained skips or unresolved acceptance-blocking code defects. Earlier suite results alone do not satisfy this gate. |
| 2 — Confirm intended business behavior | Walk the two owners through customer/booking creation, conflict approval, cancellation retention, payments/deposits, checklist release/return, post-event completion, reports, and offline reconnect/retry on synthetic records. Record package, checklist, report and payment-completion decisions without inventing policy. | Owner participation and decisions. Can be prepared alongside step 1. | Recorded acceptance or explicit corrections for each workflow; approved corrections implemented and tested. This permits the limited claim: authorized runtime backend implementation is verified in the tested environment. |
| 3 — Historical evidence | **Not applicable for the current deployment.** The worksheet contains sample/test data only. Retain it as obsolete test evidence; do not copy its rows into production. | User confirmed there are no real historical business records to migrate. | Clean deployment contains no sample bookings, payments or checklist history. |
| 4 — Legacy conversion work | **Not applicable for the current deployment.** Keep the guarded migration utility for possible future legacy imports. | Reopen only if a real legacy source is introduced and separately approved. | No migration or resolution JSON is required for the clean installation. |
| 5 — Verify the deployment candidate | Prepare PHP/MySQL hosting, HTTPS, allowed origins, environment configuration and scheduler setup in an isolated staging environment with synthetic data. Test actual scheduler execution, two-client conflicts, failure recovery, offline replay, and representative 10,000-booking performance on that hosting stack. Check booking-list size and receipt growth; implement optimizations only if the measured acceptance criteria require them, preserving retry safety. Run owner/device/calendar timing and overlap-marker acceptance. | Owner selects/provides deployment target; obtain applicable deployment access/approval. Can proceed alongside historical resolution without operational data. | Recorded hosting/security/scheduler/performance and device/workflow results. Meet the plan's 95%-within-three-seconds booking/availability target; agree any unspecified workload/timing thresholds before evaluating them. Staging results are not proof of production acceptance. |
| 6 — Clean staging verification | Initialize the reviewed schema on an isolated staging database without sample transactions or test credentials. Verify environment configuration, owner setup and rollback. | Deployment target and access. | Clean schema, production-safe accounts and repeatable setup are verified. |
| 7 — Separately authorized deployment | Present the exact release, target database, backup/restore evidence, maintenance window, offline-queue handling, verification steps and rollback plan. Obtain deployment authorization, then initialize the clean database and register the production scheduler. | Steps 1, 2, 5 and 6 complete; explicit deployment authorization. | Owner login, API security, money/checklists, scheduler, reports and offline synchronization verified on the deployed version; rollback remains available. |
| 8 — Close acceptance and hand over | Record owner acceptance, deployment verification, operational monitoring/recovery instructions and any accepted limitations. Update every matrix row with evidence and final disposition. Keep deferred blockouts explicitly excluded. | Successful step 7 and owner sign-off. | Final signed acceptance record. Only now describe the authorized backend as implemented, deployed and accepted for operational use. |

### Completion claims and stop conditions

- After steps 1–2: **Runtime backend implementation verified in the tested environment; deployment acceptance remains pending.**
- After steps 3–5: **Clean deployment candidate prepared and verified to the documented extent; staging and deployment still require approval.**
- After steps 6–8: **Authorized backend scope implemented, migrated, deployed and accepted**, only when the listed evidence actually exists.
- The sample worksheet does not block deployment. If a real legacy source is introduced later, evidence and separate migration authorization become required. Failed tests or reconciliation block the affected acceptance gate.

Immediate next action: prepare and verify a clean staging deployment using the reviewed schema, production-safe owner setup, HTTPS/origins, scheduler registration, representative performance and real-device offline checks. The Awaiting Payment policy is implemented and locally verified. Migration of the sample dataset is not required; deployment and production acceptance remain open.

## History retention and template validation follow-up — 2026-10-15

Inspected the current worktree and remaining gates before changes. Fixed an additional NFR-04/B4-06/B6-01 retention gap: direct and sync rental-item deletion now rejects items referenced by item history, legacy equipment/booking checklists, or revised booking checklists. The shared transaction uses current locking reads while holding the item lock. Historical links remain intact; unused items remain deletable and successful sync deletion receipts remain replayable. No schema or migration change was needed.

For B1-09/B4-04, checklist templates now reject non-text/oversized names, non-list item payloads, boolean/fractional/negative quantities, and quantities outside the existing unsigned integer column range. Invalid multi-item creation rolls back and invalid renaming preserves the prior template.

Both new tests in `tests/history-template-gaps.test.cjs` failed before the fixes. Afterward, eight tests across five focused files (`history-template-gaps`, `catalog-plan-gaps`, `booking-plan-gaps`, `sync-plan-gaps`, `write-validation-gaps`) passed without skips on synthetic `akad_verify_plan_1792045494512_37116`. PHP/JS/service-worker/admin-inline syntax and `git diff --check` passed. Existing unrelated work was preserved. No operational database access, migration, or dry run occurred; frontend, full offline, auth, finance, performance, and migration suites were not rerun in this pass.

The 51 historical findings still require owner-provided source evidence. All operational/deployment acceptance gates and separate migration authorization remain open; internal blockouts remain deferred and offline sync remains preserved.

## Follow-up validation fixes — 2026-10-15

Compared the remaining matrix gates with the shared write paths and tests. Fixed two additional code gaps under B4-03/B4-06/B6-01: sync deposit deductions now reject non-text reasons instead of casting them into invented text, and item-history writes reject malformed supplied booking IDs instead of silently storing a null link. Shared sync reference parsing also rejects arrays, objects, booleans, and fractional numeric values before string conversion, keeping validation responses valid JSON. Omitted/null history booking links remain supported for inventory-only events.

Both new regressions failed before the fixes. Afterward, `write-validation-gaps`, `sync-plan-gaps`, `finance-plan-gaps`, and `offline-sync` passed together on isolated `akad_verify_plan_1792044979583_38544` (including all 17 offline checks). All 34 frontend regressions and the PHP/JS/service-worker/admin-inline syntax checks passed. Tests verify rollback, corrected retry, receipt replay, and retained valid offline behavior. No operational database was accessed; no migration code/schema was changed. Earlier migration/auth/catalog/lifecycle evidence below was not rerun in this follow-up.

The 51 historical findings remain unresolved; no owner source evidence was supplied. Operational dry runs require explicit approval, and migration application requires separate authorization after evidence resolution and zero exceptions. Production/deployment/client acceptance gates remain open.

## Current completion pass — 2026-10-15

The latest user decisions override older online-only/removal wording: **preserve offline sync**, keep legacy **FR-10 internal blockouts deferred**, and **do not apply any migration to an operational database**. Revised FR-10 financial deposits/deductions are a separate requirement and remain in scope. Pre-existing availability-block draft files are not new approval to activate that feature; no blockout functionality was added in this pass.

Outstanding code gaps addressed in this pass:

- Sync now calls the same booking, payment, catalog, delivery, and history write helpers as direct APIs. It enforces all-service conflicts, copied allowances, optional packages, eligibility, snapshots, retained cancellation, payment dates/status/reference, and audit history while retaining per-operation receipts, local-ID mapping, stale-edit review, and retry behavior.
- Added the missing CLI scheduled reconciler; release inspection now uses shared condition validation and item audits. Conflict details include customer, service, and event schedule.
- Package eligibility is rechecked when rescheduling or confirming a pending booking. Service default limits agree with booking validation. Invalid booking text cannot become fabricated `Array` values.
- Reports expose upcoming/cancellation/overlap detail lists, use revised event datetimes for popularity, and explain selected-period versus lifetime metrics. Session checks re-read current account/session state after refreshing expiry.
- Migration preflight preserves known actors/times and inactive accounts, requires meaningful evidence for resolutions, rejects invalid snapshots and reverse checklist/release inconsistencies, and stops before DDL for unresolved records.

The row-by-row evidence and open acceptance gates are in [Backend-Requirement-Matrix.md](Backend-Requirement-Matrix.md). Focused suites use `tests/run_revised_backend.cjs`, which creates a new synthetic database and owns its PHP processes; it does not reuse operational servers. Local synthetic passes establish local behavior only.

The Codex completion diff was independently reviewed. That review found two integration defects, both fixed: the report API now retains fields required by existing dashboard/report pages while adding detailed metrics, and pending offline-payment matching preserves full local booking IDs. After these fixes, all seven backend/sync test files passed together on isolated `akad_verify_plan_1792044208446_19208`, including 17 offline checks; the separate migration regression passed; and all 34 frontend regressions passed. PHP syntax passed for 42 files, changed JS syntax and `git diff --check` passed. No operational database was read or migrated in this pass.

Still blocked: the last operational read-only dry run had 51 unresolved findings; no new owner evidence was supplied and no operational dry run or apply was performed in this pass. New preflight safeguards may identify additional findings when the owner-approved resolutions are ready. Production TLS/origins, scheduler registration, real hosting performance, device/usability acceptance, and cutover remain unverified or unperformed.

## Earlier local evidence — 2026-10-15

The local backend implementation has been advanced through authentication, booking availability, notifications, payments/deposits, auditability, reporting, and migration safeguards. This is **not a production cutover or a claim that every plan acceptance criterion is complete**.

Implemented and verified locally:

- Internal APIs require authentication, with explicitly public service/package/add-on/gallery content. Availability-block and notification retrieval APIs are implemented.
- Availability conflict checks and concurrent booking/payment/deposit paths have direct integration coverage. Due-but-unreleased bookings block future intervals while historical non-overlapping dates remain valid. Item history and release APIs are append-only; sensitive operations are audited.
- Payment type can be derived for clients that omit it. Refundable balances cannot become negative, and refunds are rejected when nothing remains refundable.
- Reports separate pending/failed payments, calculate balances from completed payments, exclude cancelled bookings where appropriate, and validate date ranges.
- With explicit approval, the frontend now caches package checklist templates for offline use, builds offline checklists from the selected package, syncs release quantities and inspection rows by template item, and presents the required post-event owner review before final release. Sync-created bookings now retain agreed totals and package snapshots.
- Migration dry-run/apply/rerun and populated legacy mappings were exercised on synthetic databases. A populated fixture preserved owner/staff attribution, booking/payment values, checklist mappings, and a payment actor foreign key.
- The direct revised-backend acceptance test passes, including account deactivation/reactivation, session revocation, failed-login lockout, and primary-owner password-reset recovery. The offline-sync integration suite passes all 17 checks, including template-driven inspection and post-event review. Public-site (5), frontend API contract (10), async workflow (13), and direct API (5) regression checks also pass. PHP syntax passed for 37 API/migration files; changed JS and booking-page inline scripts compile.
- `Implementation/Backend-Migration.md` documents the operational backup, dry-run, apply, and recovery process.

Still incomplete or unverified:

- B6 offline-sync removal is deferred by explicit user decision: preserve offline sync. Keep its endpoints and settings while active workflows depend on them; do not migrate to online-only or remove sync unless the user changes this decision. The checklist compatibility issue is fixed and tested.
- Production migration/cutover is not performed. The user confirmed the backup/restore and maintenance prerequisites, but a read-only dry run against configured database `akad_rentals` returned 51 unresolved exceptions (2 user-level, 15 booking-level, 4 payment-level, and 30 booking-item/checklist discrepancies). Do not apply the migration until every item is resolved from operator-provided evidence and a rerun has zero exceptions.
- A 10,000-booking synthetic performance run met the under-three-second local p95 threshold: booking-list 2,880.70 ms; booking creation 183.92 ms; conflict detection 180.39 ms; availability-block creation 113.91 ms; dashboard 851.71 ms; monthly report 816.35 ms. The list response was about 20.2 MB, while the dashboard and monthly report responses were about 1.4 KB and 1.5 KB. This was measured on the local PHP built-in server/MariaDB with synthetic data and is not production-hosting acceptance. The full requirement matrix remains open.
- The earlier FR-10 internal-blockouts draft remains deferred. Integration tests used the synthetic database `akad_verify_20261015_suite`; no production database was migrated.

Performance evidence: isolated database `akad_perf_verify_20261015` contained 10,000 synthetic bookings, 10,000 payments, 1,000 deposits/deductions, 1,000 notifications, 1,000 audit rows, and 100 availability blocks. Each measured endpoint had 15 requests across five batches of three clients. Booking-list p50/p95 was 1,835.12/2,880.70 ms; dashboard 442.30/851.71 ms; monthly report 522.25/816.35 ms; active-block listing 30.46/54.46 ms; conflict detection 96.26/180.39 ms; booking creation 115.24/183.92 ms; and block creation 79.71/113.91 ms. The PHP built-in server serializes requests; these local measurements do not establish production concurrency or hosting performance.

The earlier 2026-10-15 deposit/refund audit is included in the implementation above: the backend no longer allows negative refundable balances or refunds when the refundable amount is exhausted.

## Assumptions

- The system is internal to two owner-partners and preserves approved offline recording and automatic sync.
- Staff and customer accounts are outside the initial scope.
- Existing operational records must be migrated without losing history.
- Server-side rules are authoritative.
- Expected load is two concurrent owners and approximately 10,000 historical bookings.

## Recommended implementation order

1. Back up the existing database and create an incremental migration.
2. Implement the revised schema and migrate existing records.
3. Secure authentication and all internal API endpoints.
4. Implement booking lifecycle and availability rules.
5. Implement payments, deposits, checklists, delivery, notifications, and auditing.
6. Correct reporting queries.
7. Preserve synchronization receipts/settings and enforce the same business rules on direct and replayed writes.
8. Run acceptance, security, concurrency, and performance tests.

## Phase B0 — Migration safety

| ID | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- |
| B0-01 | P0 | Create a dated database backup before applying schema changes. | Deployment procedure | The database can be restored successfully into a separate test database. |
| B0-02 | P0 | Add an incremental migration instead of relying only on schema recreation. | `db/migrations/` | The migration works on a populated legacy database and on a clean database. Re-running it does not corrupt data. |
| B0-03 | P0 | Implement and document the legacy mapping below, with a dry-run exception report and source-to-target record mapping. | Migration script, migration mapping document | Every source record is accounted for; booking links, financial totals, checklist quantities, and known attribution reconcile. Unresolved mappings stop cutover; reruns create no duplicate payments, deductions, or history entries. |
| B0-04 | P0 | Add a documented rollback procedure. | `Implementation/` | A failed deployment can return to the backed-up database and previous application version. |

### Required legacy mapping

Preserve original values and source identifiers in the migration record. Resolve ambiguous records against business evidence before cutover; do not guess missing historical facts.

| Legacy data | Required conversion and verification |
| --- | --- |
| Booking status and dates | Normalize case for Pending, Confirmed, Completed, and Cancelled. Explicitly review other values, including reserved, preparing, and released; released equipment is not evidence of completed post-event review. Preserve date/time values, document overnight and timezone handling, and reconcile ended, unreleased bookings with the Awaiting Completion rule. |
| Payment statuses and totals | Map `paid` collection rows to Completed, retaining their amount, method, and payment date. Review `unpaid` and `partial` against actual collection evidence; these legacy values are not equivalent to the new transaction states. Resolve missing payment types from evidence before cutover rather than inventing a type. Reconcile completed payment sums against legacy `amount_paid` and report discrepancies without creating balancing payments. Preserve legacy agreed totals rather than repricing from current packages. |
| Aggregate deposit deduction and refund state | Convert each positive `deduction_amount` into one explicitly labeled legacy aggregate deduction, preserving its amount and `deduction_reason`; do not invent itemization. Zero produces no deduction. Reconcile held and deductible totals, rejecting invalid amounts. Legacy `pending/partial/full/none` values do not prove money was refunded: the current helper derives them from amounts. Require refund evidence before mapping to Refunded, and resolve ambiguous cases before cutover. |
| Missing or historical actors | Preserve known actor identities and their provenance, including former staff attribution without granting staff access. Imported records with an unknown actor use a nullable actor reference and explicit legacy-unknown provenance; never attribute them to the migrating owner. New interactive records require the authenticated owner. Preserve known event times separately from import time; do not invent missing recording times. |
| Multiple services and linked records | Compare `service_id` with normalized `service_ids`. A matching singleton maps directly. Multiple or inconsistent services require a documented per-record resolution that preserves every service and linked payment, deposit, checklist, and release record. Never silently keep only the first service or duplicate financial amounts when splitting bookings. |
| Existing status history | Import recoverable transitions with their original provenance. If only the current status exists, create a labeled migration baseline with unknown prior status; do not fabricate earlier transitions or their actors/times. |

Retain an immutable migration archive for original records and any historical identity or fields that do not fit the revised operational schema. The archive must remain accessible to authenticated owners for historical inspection, not merely exist in a disposable backup. Clean-install seed data contains only the two active owner accounts; legacy attribution does not create additional login accounts.

## Phase B1 — Revised database schema

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B1-01 | FR-01, NFR-03 | P0 | Replace the owner/staff model with individual owner accounts. Add username, account status, primary-owner flag, failed-login count, lockout time, and timestamps. | `db/schema.sql`, migration, `db/seed.sql` | The initial database contains two owner accounts, no staff account, and exactly one primary owner. |
| B1-02 | FR-16 | P0 | Add default preparation and travel minutes to services. | `db/schema.sql`, migration | Values default to zero, reject negatives, and do not retroactively change existing bookings. |
| B1-03 | FR-03 | P0 | Expand packages with description, inclusions, duration, deposit settings, promotion dates, status, and timestamps. | `db/schema.sql`, migration | Regular and promotional packages are fully represented and inactive packages remain in history. |
| B1-04 | FR-04, FR-06, FR-13, NFR-04 | P0 | Revise bookings with a unique reference, nullable package, event datetimes, copied allowances, blocked interval, theme notes, package snapshots, agreed total, cancellation reason, Awaiting Completion fields, release fields, and timestamps. | `db/schema.sql`, migration | Existing bookings migrate successfully; new package-free bookings are valid; booking references are unique. |
| B1-05 | FR-08 / legacy FR-10 | Deferred | Availability-block schema/activation requires renewed approval. Existing draft artifacts are retained without extending their scope. | `db/schema.sql`, migration | Excluded from authorized completion; no new blockout implementation without an explicit user decision. |
| B1-06 | FR-07 | P0 | Add `BOOKING_CONFLICT_OVERRIDES`. | `db/schema.sql`, migration | Each approved conflict stores both bookings, approving owner, reason, and timestamp. |
| B1-07 | FR-09 | P0 | Expand payments with type, method, status, date, optional reference, recording owner, and recorded time. | `db/schema.sql`, migration | Every payment has a valid booking; new payments require the authenticated recording owner and time. Imported unknown attribution follows B0-03 and cannot be submitted through normal write APIs. GCash and MariBank remain distinct. |
| B1-08 | FR-10 | P0 | Add `DEPOSIT_DEDUCTIONS` and revise deposits to store the held amount and refund state. | `db/schema.sql`, migration | A deposit retains multiple itemized deductions without overwriting earlier entries. |
| B1-09 | FR-11 | P1 | Add checklist templates, template items, and booking checklist items. | `db/schema.sql`, migration | Booking checklist rows remain unchanged after their source template is edited. |
| B1-10 | FR-12 | P1 | Add delivery notes and revised fee-responsibility values. | `db/schema.sql`, migration | Customer, Included in package, and Owner responsibilities are supported. |
| B1-11 | FR-13 | P0 | Add persistent notifications. | `db/schema.sql`, migration | An action-required notification remains unresolved until its workflow completes. |
| B1-12 | FR-15, NFR-04 | P0 | Add append-only audit logs, including booking status history with booking ID, old status, new status, actor reference, origin (owner, system, or migration), and timestamp. | `db/schema.sql`, migration | Audit records can be created and viewed but not edited or deleted through the API. Owner actions require the authenticated actor; automated transitions and legacy-unknown imports have explicit provenance rather than a fictitious owner. Creation and migration baselines may have no prior status. |
| B1-13 | NFR-02 | P1 | Add indexes for blocked-interval lookups, payment-date reports, unresolved notifications, and audit queries. | `db/schema.sql`, migration | Normal availability and monthly-report queries use indexes. |

## Phase B2 — Authentication and API security

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B2-01 | NFR-03 | P0 | Require authentication on every internal read and write endpoint. Leave only approved public content endpoints anonymous. | `api/*.php` | Anonymous requests receive HTTP 401 and cannot read customer, booking, payment, deposit, delivery, checklist, report, notification, or audit data. |
| B2-02 | FR-01 | P0 | Change login to the approved owner credential and require an active account both at login and in shared session validation on every protected request. | `api/auth.php` (`currentSession`, `requireAuth`, login) | Active owners can log in; unknown and inactive accounts receive the same generic login failure. A previously issued token for an inactive account receives HTTP 401 and its expiry is not extended. |
| B2-03 | NFR-03 | P0 | Add atomic failed-login counting and temporary lockout. Reset counters after successful login. | `api/auth.php` | Repeated failures trigger lockout and parallel attempts cannot bypass it. |
| B2-04 | FR-01, NFR-03 | P0 | Add primary-owner account administration. Atomically revoke all target-owner sessions on deactivation or password reset; coordinate session issuance with these changes so a concurrent login cannot issue a surviving stale session. | New owner-account API, `api/auth.php`, sessions storage | Only the primary owner can create, deactivate, reactivate, or reset the other owner account. Old tokens fail on every device after deactivation/reset; reactivation does not restore revoked tokens. The owner must log in again with current credentials. |
| B2-05 | NFR-03 | P1 | Restrict production CORS and require HTTPS. | `api/config.php`, deployment configuration | Production accepts only approved origins and encrypted browser connections. |

## Phase B3 — Booking and availability rules

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B3-01 | FR-04 | P0 | Validate one customer, one service, optional eligible package, event interval, location, allowances, snapshots, and agreed total. | `api/bookings.php`, booking service | Reversed intervals fail; package-free bookings succeed; historical snapshots are preserved. |
| B3-02 | FR-04, NFR-04 | P0 | Replace booking deletion with retained cancellation and a required reason. | `api/bookings.php` | Cancellation preserves payments, deposits, delivery, checklists, status history, and audit records. |
| B3-03 | FR-06, FR-16 | P0 | Centralize blocked-interval calculation for all services: blocked start = event start minus preparation minutes; blocked end = event end plus travel minutes. Keep the scheduled blocked end for history, but treat Awaiting Completion and unreleased Confirmed bookings whose blocked end is at or before server time as having no effective end until manual release. | New availability service | Copied allowances determine the scheduled interval. An unreleased booking conflicts with future same-service intervals after its scheduled blocked end, regardless of whether its status has already been reconciled. |
| B3-04 | FR-06 | P0 | Check Confirmed and Awaiting Completion bookings plus active availability blocks inside a transaction. Reconcile due bookings before checking conflicts on booking creation, confirmation, and schedule/service/allowance edits, and before returning availability. Serialize competing reservations using a consistent service-row locking protocol shared by booking and availability-block writes. | Availability service, `api/bookings.php`, availability-block API | Concurrent confirmation requests cannot both reserve the same service and interval without an override. A due, unreleased Confirmed booking blocks with no effective end even when the scheduler has not run and no calendar is open. Different services may overlap. |
| B3-05 | FR-07 | P0 | Return conflict details and support an owner-approved overlap with a required reason. | Availability and override APIs | A blank reason is rejected; approval creates one immutable override per conflict. |
| B3-06 | FR-08 / legacy FR-10 | Deferred | Internal blockout creation/update/activation remains deferred; do not extend or activate the existing draft API without approval. | Existing draft `api/availabilityBlocks.php` | Excluded from current acceptance; pre-existing draft code/tests do not constitute scope approval. |
| B3-07 | FR-13 | P0 | Add an idempotent status reconciler that moves Confirmed bookings to Awaiting Completion when the blocked end is reached, and atomically writes status history and notifications. Invoke it from the scheduled task, calendar requests, and B3-04 availability/reservation paths. | Shared reconciler, scheduled task, calendar and booking APIs | The transition occurs at blocked end, including travel allowance, not at event end. Concurrent or repeated execution creates one transition entry and one notification per intended recipient; the booking blocks from its blocked start with no effective end until manual release. |
| B3-08 | FR-13 | P0 | Implement post-event review and manual service release as one transaction, with `Awaiting Payment` when completed rental payments remain below the agreed total. | Booking, equipment, payment, deposit, notification, report, UI, and sync services | Review data, deductions, readiness, owner and notes commit with service release. Unpaid bookings remain incomplete with exact-balance owner notices; only completed payments covering the agreed total allow the later audited `Completed` transition and notice resolution. |
| B3-09 | FR-16 | P0 | Expose service defaults through authenticated reads and owner updates, and copy defaults when creating a booking unless that booking supplies its own allowances. | `api/services.php`, `api/bookings.php`, availability service | Both `default_preparation_minutes` and `default_travel_minutes` round-trip as non-negative integers; invalid values are rejected and omitted update fields retain their values. Explicit zero is a valid booking override. Updating defaults affects subsequent bookings only, and a booking override never changes service defaults. |

## Phase B4 — Supporting business modules

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B4-01 | FR-03 | P1 | Implement full package CRUD and booking eligibility validation. | `api/packages.php`, pricing service | Inactive or out-of-period promotions cannot be selected for new bookings. |
| B4-02 | FR-09 | P0 | Implement payment recording and permitted correction rules. Derive balances from completed booking payments. | `api/payments.php`, payment service | Deposits are excluded; references are optional; every change records its owner. |
| B4-03 | FR-10 | P0 | Implement deposit creation, itemized deductions, refund processing, and refundable-balance calculation. | `api/deposits.php`, deposit service | A deduction transaction fails if total deductions would exceed the held amount. |
| B4-04 | FR-11 | P1 | Implement checklist-template CRUD and transactional copying to bookings. | Checklist APIs and services | A booking receives only the selected package template and keeps its snapshot. |
| B4-05 | FR-12 | P1 | Implement revised delivery validation and persistence. | `api/delivery.php` | Every method, fee, responsibility value, and note round-trips correctly. |
| B4-06 | FR-15, NFR-04 | P0 | Add audit writes inside every sensitive transaction. Use the same audit log for initial booking status and every successful status transition, including confirmation, automatic Awaiting Completion, cancellation, and completion/manual release. | Shared audit helper, booking service, reconciler, affected APIs | Status and history commit or roll back together. Each transition records old/new status, actor or automated origin, booking ID, and timestamp; retries and unchanged-status saves create no duplicate transition. Override, price change, payment change, deduction, refund, release, and account administration also create audit entries. Owners can retrieve a booking's ordered status history after cancellation or completion. |

## Phase B5 — Reporting

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B5-01 | FR-14 | P0 | Calculate collected revenue from Completed payments filtered by payment date. | `api/reports.php` | Pending and failed payments, unpaid balances, and refundable deposits are excluded. |
| B5-02 | FR-14 | P1 | Add separate results for balances, deposits held, deductions, upcoming bookings, completed bookings, cancellations, and approved overlaps. | `api/reports.php` | Each report category has an independently testable query and definition. |
| B5-03 | FR-14 | P1 | Add service and package popularity reports. | `api/reports.php` | Counts use retained history and define whether cancelled bookings are excluded. |

## Phase B6 — Preserve approved offline synchronization

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B6-01 | User decision: preserve sync | P0 | Retain offline commit, receipts, local-ID mapping, conflict review, and retries; replay through shared authoritative write helpers. The earlier removal task is superseded. | `api/sync.php`, `api/sync_state.php`, shared services | Offline recording/replay survives reload and lost responses; direct and sync writes enforce the same authorized rules. |
| B6-02 | User decision: preserve sync | P0 | Retain synchronization state separately from business settings. The earlier removal task is superseded. | Migration, `api/settings.php`, `api/sync_state.php` | Business settings remain in row 1 and durable receipts/local-ID mappings remain in reserved row 2. |

## Backend test plan

| Area | Required tests |
| --- | --- |
| Migration | Populated and clean databases, rerun safety, every documented legacy status, aggregate deductions, ambiguous refund states, unknown/former-staff actors, multi-service records, status baselines, and source-to-target financial/relationship reconciliation. Unresolved exceptions prevent cutover. |
| Authentication | Valid owner, invalid password, inactive owner, lockout, logout, expired token, primary-owner authorization, anonymous internal reads; tokens issued before deactivation/reset fail across devices, reactivation does not revive tokens, fresh login uses current credentials, and a concurrent login cannot survive revocation with stale credentials. |
| Booking | Required fields, optional package, unique reference, package snapshots, cancellation retention, and valid status transitions. |
| Service defaults | Authenticated reads/owner updates for both allowances, zero and positive integers, negative/fractional/non-numeric rejection, omitted update fields, default copying, explicit zero per-booking override, and unchanged existing bookings after a default update. |
| Availability | Every service, different-service overlap, exact blocked-end boundary, allowance boundaries, active/inactive blocks, override reason, and concurrent confirmation. An unreleased booking blocks a next-day booking; with the scheduler stopped and no calendar request, confirmation still detects the due booking. Schedule/service/allowance edits and concurrent block writes use the same conflict protection. |
| Payments | Multiple payments, pending/failed exclusion, optional reference, derived balance, and recording owner. |
| Deposits | Multiple deductions, exact-full deduction, excessive deduction rejection, and refund calculation. |
| Checklists | Template copying, later template edits, release/return quantities, and missing or damaged conditions. |
| Post-event | Transition at blocked end (not event end), persistent notification per intended recipient, review validation, manual release, availability restored after release subject to other conflicts, and idempotent concurrent retry. |
| Reports | Payment-date revenue, balances, deposits, deductions, cancellations, overlaps, and service/package popularity. |
| Audit | Every sensitive action produces an immutable entry with the correct actor/provenance and record. Initial status and every transition are retrievable in order; automated transitions identify system origin; rollback leaves neither a changed status nor an entry; retries/no-op saves add no duplicate; cancellation retains history; migration baselines do not invent prior events. |

## Performance and concurrency checks

- Seed about 10,000 historical bookings and representative payments, blocks, deductions, notifications, and audit rows.
- Measure booking creation, conflict detection, calendar queries, and monthly reports.
- At least 95% of normal booking and availability requests must finish within three seconds.
- Confirm that summarized report endpoints do not require the browser to download every booking.
- Run simultaneous confirmation tests for the same service and interval.

## Backend definition of done

- All authorized backend portions of FR-01 through FR-17 and NFR-02 through NFR-04 pass their acceptance tests; deferred internal blockouts remain excluded and external acceptance gates stay explicit.
- Anonymous users cannot access internal records.
- Historical booking and financial records are retained.
- Same-service conflicts are enforced for all three services under concurrent use.
- Revenue reports use completed payment dates.
- Ended, unreleased bookings block future same-service intervals even when the scheduled reconciler is delayed.
- Service defaults can be edited through the API without altering existing bookings.
- Deactivation and password reset revoke existing sessions; reactivation cannot revive them.
- Audit entries are append-only, identify the acting owner or explicit system/migration provenance, and retain every booking status transition atomically.
- Legacy mappings reconcile financial totals, linked records, and attribution without silent loss, invented actors, or unresolved conversion exceptions.
- The legacy database can be migrated and restored using documented procedures.
- Approved offline recording and synchronization remain operational and preserve the same server-side business rules and history as direct writes.
