---
title: Rental-Ops-Manager Memory Index
date: 2026-10-16
tags:
  - rental-ops-manager
  - akad
  - memory
  - index
aliases:
  - Memory Index
  - Project Memory
  - Vault Index
status: active
---

## Awaiting Payment implementation — 2026-10-16

Owner-approved policy: completed return review releases service availability; an outstanding rental balance moves the booking to `Awaiting Payment`, and only completed payments covering `agreed_total` allow `Completed`. Implemented across shared direct/offline release, edit locks, notifications, reports, admin labels and tests. Latest full non-migration evidence: `tests/acceptance-results/1792150756830-33488/summary.json`, synthetic DB `akad_verify_plan_1792150757195_24148`; 9 backend/sync files, 17 offline checks, 36 frontend tests, syntax and diff passed. The clean-data decision below makes legacy migration unnecessary; deployment/production/device acceptance and deferred blockouts remain open.

## Clean-data deployment decision — 2026-10-16

The user confirmed that the database and all 51 worksheet findings contain sample/test data only; there are no real historical business records to migrate. Those findings are **Not Applicable** and do not block backend completion or clean deployment. Initialize production from the reviewed clean schema and exclude sample bookings, payments, checklist rows and test credentials. Older memory statements requiring owner evidence for the 51 rows are superseded. Deployment/production/device acceptance remains open and FR-10 blockouts remain deferred.

Controlling implementation assumption: every repository database, fixture, worksheet row, account, booking, payment and checklist value is synthetic test data and has no real-business or legal-data significance. The developer may implement and test all work within the user-supplied implementation scope without additional data-owner authorization. Continue preserving existing user work, offline sync and the explicit FR-10 deferral.

## Current backend source confirmation — 2026-10-16

Re-scanned the B1–B6 backend implementation and fixed one customer CRUD/schema mismatch: removed unsupported `notes` from the writable customer definition because the clean schema has no such column. Added a regression. Full non-migration acceptance passed on synthetic `akad_verify_plan_1792128884100_5244`: nine backend/sync files, 17 offline checks, 35 frontend regressions, syntax and diff checks. Evidence is `tests/acceptance-results/1792128883458-17748/summary.json`. The later Awaiting Payment run above supersedes this evidence. The 51 historical findings, migration/deployment/production gates and deferred blockouts remain open.

## Synthetic owner walkthrough run — 2026-10-16

W01–W12 passed on isolated `akad_verify_plan_1792046564392_28220`; the user explicitly authorized Codex to perform W11/W12 as delegated reviewer. Offline creation/reload/reconnect, second-owner visibility, stale-edit retention, keyboard use and 390×844 layout were verified. Fixed the discovered location-conflict recovery gap in `js/sync-ui.js`; all 35 frontend tests and syntax checks passed afterward. On 2026-10-16, the user confirmed owner approval of all implemented/tested changes and later selected the Awaiting Payment policy recorded above. No operational access, migration/dry run, historical resolution, or blockout work occurred; the walkthrough server was stopped. See `Implementation/Backend-Owner-Walkthrough-2026-10-15.md` and linked evidence.

## Consolidated verification completed — 2026-10-15

Nine backend/sync files passed together on isolated `akad_verify_plan_1792046383527_34548` (17 offline checks), plus 34 frontend regressions and syntax/diff checks. No new application defects reproduced. Reproduce with `rtk proxy node tests/run_backend_acceptance.cjs`; logs and final-code hashes are separate from older evidence. Migration execution and legacy blockout tests were excluded. Report and owner walkthrough are in `Implementation/Backend-Consolidated-Verification-2026-10-15.md` and `Implementation/Backend-Owner-Walkthrough-2026-10-15.md`. Separate synthetic owner fixture database: `akad_verify_plan_1792046564392_28220`; owner approval of implemented/tested changes was recorded on 2026-10-16 and setup servers stopped. External evidence checklist covers all 51 worksheet findings with blank decisions/evidence, unchanged worksheet. No operational DB access, migration or dry run. Next: source evidence; production acceptance remains open.

## Completion roadmap requested — 2026-10-15

User requested a sequential plan to finish backend work and support an accurate completion claim. Added the ordered completion roadmap to `Implementation/Revised-Requirements-Backend-Implementation-Plan.md`: consolidated current-code verification; owner synthetic workflow acceptance; evidence resolution for 51 findings; reviewed conversion work and explicitly authorized rehearsal; staging/deployment validation; explicitly approved operational preflight; separately authorized cutover; final acceptance/handover. Runtime verification is distinct from complete migration/deployment acceptance. No tests, database access, migration, deployment or acceptance occurred during this planning update. Existing offline/blockout/evidence/authorization boundaries remain unchanged.

## Latest follow-up — 2026-10-15: History retention and templates

Protected rental-item history/checklist links against direct and offline deletion; unused-item deletion and receipts remain supported. Added template name/list/quantity validation that rejects malformed writes atomically. Two new tests failed before fixes; eight tests across five focused files passed afterward on synthetic `akad_verify_plan_1792045494512_37116`, plus syntax/diff checks. See the matrix for reproduction. No operational database access, dry run, or migration; no frontend/schema changes. All 51 findings remain pending owner evidence and separate migration authorization; production acceptance remains open. Offline sync preserved and internal blockouts deferred.

## Latest follow-up — 2026-10-15: Write validation gaps

Fixed malformed offline deposit deduction reasons and silently discarded item-history booking links; shared sync references now reject non-ID types before casting. New regression tests failed first, then passed with sync/finance/offline suites (17 offline checks) on isolated `akad_verify_plan_1792044979583_38544`. All 34 frontend regressions and syntax checks passed. See the plan/matrix for exact scope; other historical suite results were not rerun. Operational data was untouched. The 51 worksheet findings still need owner evidence; operational dry-run approval and later migration authorization are separate gates. Offline sync retained; blockouts deferred; production readiness unverified.

## Latest session — 2026-10-15: Requirement completion pass

User authorized parallel backend implementation review and focused tests using the revised plan plus latest decisions. Safe gaps closed: shared direct/sync booking/payment/catalog/delivery/history rules; scheduled reconciliation; shared release condition/audit validation; conflict client/service/schedule data and overlap markers; promotion rechecks; service allowance-limit consistency; report lists/definitions; session validation race; and stronger evidence/attribution/checklist migration preflight. Offline receipts/settings/retries and conflict drafts remain preserved.

Authoritative per-row status: `Implementation/Backend-Requirement-Matrix.md`. Test runner `tests/run_revised_backend.cjs` creates fresh synthetic `akad_verify_plan_*` databases with owned PHP processes/free ports. New focused suites cover catalog, booking lifecycle, finance, auth, sync, and migration. Local test results do not establish production readiness.

Initial completion-pass evidence (superseded by the post-review results below): seven backend/sync test files passed together on `akad_verify_plan_1792042925602_16200`, including 17 offline checks; separate synthetic migration regression passed; 33 frontend regressions and syntax/diff checks passed. No focused integrations skipped. The synthetic database is retained for inspection; runner-owned PHP processes were stopped.

Still blocked: owner evidence for the 51 last-known operational migration findings, then a zero-exception read-only rerun before proposing migration. No operational migration or historical correction authorized/performed. Production TLS/origins, scheduler registration, production performance, client/device/usability and remaining scoped frontend acceptance are external gates. Legacy FR-10 blockouts stay deferred; sync removal is superseded. Preserve existing uncommitted work; do not stage/commit/push.

## Earlier session — 2026-10-15: Revised backend implementation and checklist integration

Continued work on `Implementation/Revised-Requirements-Backend-Implementation-Plan.md`. Backend changes include internal API auth boundaries, availability-block and notification APIs, conflict-safe writes, payment compatibility, deposit locking/refund safeguards, report corrections, append-only history/release APIs, and migration mapping/foreign-key safeguards. Availability now treats due/unreleased bookings as open-ended blockers for future requests without rejecting unrelated historical intervals.

With the user's approval, aligned the frontend offline checklist with backend package templates: templates are cached, local booking checklists use the selected package's versioned items, sync transmits template/checklist identifiers and release quantities, and return inspection sends every row. Added an explicit post-event review form for service readiness, payments, deposits, and notes; sync/direct finalization carries those confirmations. Sync-created bookings now retain agreed totals and package snapshots.

The user explicitly chose to preserve offline sync. Do not remove sync endpoints/settings or migrate to online-only unless the user changes that decision.

Validation on synthetic DB `akad_verify_20261015_suite`: revised backend acceptance passed; offline-sync integration passed 17/17; public-site 5/5; frontend API contract 10/10; async workflow 13/13; direct API 5/5. PHP lint passed for 37 API/migration files, and changed JS plus booking-page inline JS compiled. Synthetic migration reconciliation also verified users, bookings, payments, checklist mapping, and actor foreign key. A separate synthetic 10,000-booking benchmark met the local under-three-second p95 target for measured booking/availability requests; the booking-list response was about 20.2 MB, while dashboard and monthly report responses were about 1.4/1.5 KB. The benchmark used a local PHP built-in server and is not production-hosting acceptance. A read-only dry run against configured `akad_rentals` found 51 unresolved migration exceptions: 2 user-level, 15 booking-level, 4 payment-level, and 30 booking-item/checklist discrepancies. No database was modified by the dry run.

Still open: production migration needs evidence-backed resolutions for all 51 dry-run exceptions and a zero-exception rerun; production performance acceptance and the full requirement matrix remain open. The user confirmed backup/restore and maintenance prerequisites, but no migration was applied. B6 sync removal is deferred by the user's decision to preserve offline sync. FR-10 internal blockouts remain deferred. Do not claim overall plan completion until the remaining acceptance and production gates are addressed.

Post-completion Codex review found and fixed two integration regressions: retained the legacy flat report response fields alongside new summary metrics, and preserved exact local booking IDs when subtracting queued offline payments. After the fixes, seven backend/sync suites, the migration regression, all 34 frontend regressions, 42 PHP syntax checks, and diff checks passed on isolated synthetic test data. No operational database was read or migrated in this pass; see `Implementation/Backend-Requirement-Matrix.md`.

## Earlier session — 2026-10-15: Deposit refund balance audit and fix

Reviewed the deposit/refund balance logic and fixed the root cause behind negative refundable balances. Previously, a deposit could show a negative `refund_amount` when deductions exceeded the held amount, and the refund endpoint could still accept a refund even when no refundable balance remained.

Fixes applied:
- `api/deposit_service.php`: `refund_amount` is now clamped to zero in `depositView()`.
- `api/deposits.php`: refund processing now fails with a 409 if the refundable balance is zero or negative.
- `api/reports.php`: report totals now use the same non-negative calculation to avoid mismatched dashboard values.

Validation performed: PHP lint passed for the edited files; the focused JS verification suite passed with 33/33 tests green.

## Latest session — Oct 7 backend bug fixes + memory vault unified — 2026-10-08

Two backend bugs were fixed and verified via PHP lint:
1. **`api/crud.php` default-precedence bug — FIXED**: changed `$vals = $defaults + $vals` → `$vals = $vals + $defaults` so submitted values take precedence over defaults (defaults now fill only missing fields). Verified: create service with Inactive status persisted correctly.
2. **`api/bookings.php` Completed bypass — FIXED**: removed the `$expectedTotal > 0` gate around equipment-completion validation; the rule now runs unconditionally whenever `status === 'completed'`, enforcing the inspection requirement independently of the frontend. PHP lint passed. Live server test pending (PHP server + MySQL confirmed running locally).

Memory vault unified: `Codebase memories/` folder (duplicate with stale Oct 6 AKAD files) deleted; its updated content merged into `.project-memory/`. `.project-memory/` is now the single canonical decision cache (git-ignored, not in the unified Obsidian vault). `Understand the System/` and `Source Documents/` remain the vault's only memory-linked folders.

**Enhanced `Understand the System/` vault** — added `System Understanding/Frontend/` subfolder (2026-10-08) with `Overview.md`, `Current Status.md`, and `File Inventory.md`, making the vault a true second-brain for the entire system (frontend + backend + database). Updated `System Understanding/Start Here.md` to include frontend overview and current status in the reading order.

Still open (FE): FE-03/04, FE-07, FE-09-11, FE-16, FE-17 — all verified present in codebase; backend dependencies now fixed.

**js/api.js wiring is complete** — the fetch layer already proxies all PHP endpoints (~80 methods). Remaining work is owner acceptance testing (manual browser checks), not frontend code changes. Per the FE handoff: frontend developer supplies implementation + expected results; the project owner executes acceptance tests.

Manual acceptance tests to run (browser): FE-03/07 (negotiated payment/reload), FE-08 (deposit/delivery persistence), FE-09 (calendar expansion/multiple services), FE-10 (phone + keyboard-only), FE-11 (report figures vs fixture), FE-16 (draft recovery), FE-17 (timings). Automated suites already passed: 30 async tests, 14 live integration checks, outage workflow.

Reference: [Frontend Testing Checklist](../Implementation/Frontend-Testing-Checklist.md), [FE Requirements Review](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md).

Implemented frontend changes:

- Manual booking awaits form population before restoring drafts, guards duplicate submissions before the first awaited read, retains input on failure, preserves prefixed package IDs, and prevents duplicate booking creation after a dependent down-payment failure.
- Shared admin event/initialization handling catches asynchronous errors and guards save actions. Delete callbacks, sync retries, and scheduled rerenders await completion and display failures.
- Availability, package/add-on loading, calendar, booking lists/details/checklists, dashboard, and reports have stale-response protection. Dashboard charts and report receipts use resolved numeric payment amounts.
- Public refresh uses the central `API.refreshPublicData()` request/normalization path, preserves cached presentation fields and pending drafts, retains cached content on outages, and removes accepted records absent from a successful server response.
- Added `tests/frontend-async-workflows.test.cjs`, expanded public refresh tests, and updated the service-worker shell cache version.

Verification performed: **30 automated tests passed, 0 failed** across direct API, synchronization contract, public refresh, and frontend async workflow suites. PHP, JavaScript, service worker, and admin inline syntax checks passed; `git diff --check` passed. The isolated verification servers on ports 8017/8018 were unavailable, so no new live PHP/MySQL or browser acceptance run was performed. Historical live reports do not certify these new edits.

**Testing reminder remains outstanding:** use [Frontend Testing Checklist](../Implementation/Frontend-Testing-Checklist.md) for browser booking/payment/return workflows, failure and retry behavior, offline reload/reconnect, rapid selection changes, and mobile/keyboard checks. The reminder is recorded here and was included in the handoff; no scheduled notification was created. The [wiring plan](../Implementation/Frontend-Backend-Wiring-Remaining-Plan.md) now distinguishes this follow-up from its historical checklist. Do not describe the frontend or whole system as fully accepted until the remaining workflows pass.

Two backend issues confirmed and **fixed on 2026-10-08**:

1. `api/crud.php`: merged create values as `$defaults + $vals`, letting defaults (e.g. Active) override a submitted Inactive status. **FIXED**: `$vals = $vals + $defaults` — submitted values take precedence; defaults fill only missing fields.
2. `api/bookings.php`: a general update could set Completed without the dedicated return-finalization/inspection validation. **FIXED**: removed the `$expectedTotal > 0` gate; equipment-completion check now runs unconditionally whenever `status === 'completed'`, enforcing the rule independently of the frontend.

No staging, commits, pushes, or deployment were performed. FR-10 internal blockouts remain skipped. Earlier "backend fully complete," "runtime complete," and "frontend ~50%" statements below are historical and superseded by the scoped evidence above.

## Frontend review, smoke test, and pagination fix — 2026-10-02

The afternoon GitHub commit `e5f3b1f` addressed booking pagination placement, deposit/delivery tab placement, an Inactive-service-create workaround, and identified escaping examples. The tracked [frontend handoff](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md) now compares that commit with FE-01–FE-17 and records the remaining work. The user owns overall acceptance but authorized the assistant to run a focused smoke test and later to fix the no-match pagination bug.

Local PHP/MySQL owner login passed. An isolated browser/PHP/MySQL test with 63 bookings reached page 2 and back; booking Details controls hid and returned on tab switch; ₱350 deposit minus ₱50 deduction displayed ₱300 after reload; Lalamove with ₱250 fee and AKAD-paid responsibility survived reload; Active service creation and Inactive editing survived reload; service text with `<`, `&`, and quotes rendered literally. The test found stale pagination after a no-match search. The local `admin/bookings.html` fix removes the controls for empty results; a browser test with 12 bookings confirmed the controls disappear and return after clearing the search. The temporary database and test server were removed.

The other developer's raw `<?php`/JSON error indicates PHP was not executing on that laptop; this machine's login success does not verify the other setup. Non-JSON login feedback, the CRUD default-precedence bug, the general Completed-status bypass, and broader phone/offline/keyboard/performance checks remain open. FR-10 remains skipped. No assistant staging, commit, or push.

## Frontend handoff source verification — 2026-10-02

The [frontend requirements review](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md) was checked against current `main` (`6ff2b52`) and its cited result files. No new browser or live database suite ran, and application code was not changed. Four concrete source findings were added: booking rows are limited to 50 while pagination controls fail to mount (`.table-responsive` target versus `.table-wrap`); the general booking status path can set Completed without the dedicated return inspection check; generic CRUD create defaults override a submitted Inactive service status; and deposit/delivery controls sit outside the detail modal's tab panes. The 2026-09-28 verification report now clarifies the return and pagination claims. FR-10 remains skipped and the prior frontend code boundary remains in effect.

## Current frontend handoff — 2026-09-30

The merged frontend on `main` (`cf29fd1`, also pushed to `origin/main`) adds an ordinary booking event-edit form, removes public booking creation, applies AKAD page/login titles, displays `package_name` in booking details, restricts payment choices to GCash/MariBank, adds delivery controls with cache/queued save, refreshes dashboard/reports after data changes, surfaces read errors, narrows the service form to persisted fields, escapes key rendered values, and restores add-on draft selections. The seeded owner login fields are blank; testers enter contact `0917-123-4567` and password `password`. The root README has PHP/MySQL setup steps.

These are **source-code findings, not end-to-end acceptance**. The developer handoff is [AKAD Frontend Requirements Review](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md), updated with the remaining FE-01–FE-17 fixes and checks. Priorities include live booking-edit/delivery/payment/package save-and-reload tests; consistent loading, pending, error and retry states; field-contract and safe-rendering audits; full server-versus-local conflict review; report definitions; device/keyboard testing; and frontend performance measurements. Earlier statements that authentication is mock, public booking still exists, delivery controls are absent, or the frontend is simply “~50%” are historical and superseded. Completing frontend tasks alone does not certify the PHP API, MySQL persistence, or offline end-to-end flows. The September 30 review did not run a new browser or live database suite; MySQL was not running during the preceding merge validation. FR-10 remains skipped.

## Latest session decision ? 2026-09-28: FR-10 remains skipped

The user ended the session and explicitly instructed that FR-10 internal blockouts remain skipped. This supersedes the earlier request to implement them and the subsequent backend-only scope. Do not begin blockout implementation until the user explicitly reauthorizes it. The user's frontend boundary also remains in effect: do not change frontend code without new authorization.

No FR-10 database migration, schema addition, backend endpoint, synchronization handler, or frontend change was made during the blockout discussion. Inspection confirmed that pi/blockouts.php is absent and the schema/sync endpoint contain no blockouts implementation. The existing Implementation/Fix.md is a deferred draft with known corrections required; it is not an active execution instruction. Previously completed offline/payment/inspection work and its recorded evidence remain in place. No files were staged, committed, or pushed.



## Latest implementation and evidence — 2026-09-28

The user authorized offline/synchronization implementation, verification, reporting, and Markdown/memory updates. This section supersedes earlier blanket “fully complete”, mock-auth, ~50% adapter, and “all offline runtime acceptance passed” statements.

- NFR-01: durable per-operation outbox, cached staff pages/assets, IndexedDB snapshots, automatic reconnect/startup/focus/15-second retry, transactional replay receipts, reference mapping, retained conflicts, and stale booking review implemented. Fourteen live PHP/MySQL integration checks passed. Actual Brave backend-outage workflow passed: five operations automatically committed once the test backend recovered, without duplicate records.
- FR-04/FR-06: admin-controlled owner/client negotiated amounts, no fixed or mandatory ₱1,000 minimum. Browser evidence: ₱250 down payment, ₱350 deposit, ₱50 deduction, ₱300 refund. Separate payment/deposit records.
- FR-09: saved returned quantity zero, Missing condition, and notes survive reload and sync; incomplete inspections cannot complete the booking.
- NFR-02: final return form checks passed at 375×812, 812×375, 1366×900 with labeled controls and no clipped return fields/document overflow. Physical smartphone acceptance is still pending.
- NFR-03: interaction/accessibility fixes delivered; real two-owner/one-staff usability acceptance remains pending.
- NFR-04: 10,000-booking synthetic load, three parallel readers: p95 bookings 999 ms, dashboard 194 ms, monthly report 207 ms. Local test environment only; production peak workload/threshold remains to be agreed and measured. No formal numeric threshold exists in the requirements.
- Full snapshots moved to IndexedDB after a browser localStorage quota failure during large-data checks. Bookings render 50 rows per page; calendar uses a date index. Full 10.4 MB periodic booking reads and unbounded sync receipt JSON remain documented scaling limits.
- Tests used only `akad_verify_20260928` and local ports 8017/8018. Verification did not alter production records. No staging/commit/push.
- FR-10 blockouts remain skipped pending a separate decision. Other frontend workflows are not automatically certified by these focused tests.

Offline setup requires an online authenticated session and cached app/data, HTTPS or localhost, and available browser storage. Thirty-second sync is evidenced for the tested small queues, not guaranteed for conflicts, expired authentication, background suspension, unreachable servers, or arbitrarily large queues.

Detailed authoritative implementation evidence: `Implementation/Offline-Sync-Verification-2026-09-28.md`. Raw results: `tests/offline-sync-results.json`, `tests/browser-outage-results.json`, `tests/performance-results.json`. Official requirements retain their priority and acceptance criteria.

## Historical notes (superseded where the latest section differs)



# Rental-Ops-Manager Memory Index

> [!note] Vault Purpose
> This Obsidian vault (`Rentals ops(Third year)/`) stores the **project memory** for the AKAD Sweet Party Rental Operations & Booking Management System (Rental-Ops-Manager).
>
> Source: Global memory at `C:\Users\acer\.claude\projects\C--Users-acer-Desktop-Rental-Ops-Manager\memory\`

## Core Memory Notes

| Note | Description | Last Updated |
|------|-------------|--------------|
| [[AKAD Project State Engine]] | Official documentation authority, pre-flight workflow, four-part state response format | 2026-09-22 |
| [[AKAD Requirements Analysis Changes]] | Current coverage, gaps, and incomplete requirements (FR-01–10, NFR-01–04, WONT-01) | 2026-09-28 |
| [[AKAD Requirements Analysis Ideas and Concepts]] | Proposed architecture, design concepts, implementation principles, acceptance criteria | 2026-09-28 |
| [[AKAD Requirements Analysis Approval]] | Decisions, blockers, implementation sign-off status, FR-10 skip decision | 2026-09-28 |

## Project Status Summary (as of 2026-09-28)

> [!important] Latest Payment / Deposit Decision (2026-09-28)
> Admins control the down payment and refundable deposit amounts agreed by the owner and client per booking. Both are negotiable, with no fixed amount or mandatory ₱1,000 minimum. This replaces the earlier deferred-minimum decision. Payments and refundable deposits remain separate. Official Documentation was updated with explicit user authorization on 2026-09-28 to reflect this decision.

> [!success] Backend: **FULLY COMPLETE**
> - All 12 PHP API endpoints + 2 new files (`booking_pricing.php`, `finalizeReturn` endpoint) implemented and static-verified
> - Schema extended: CATEGORIES, ADDONS, 14 new BOOKINGS columns, SESSIONS table
> - Server-side business rules enforced (FR-03 overlap → 409, FR-06 deposit logic, auth, sync validation)
> - `js/api.js` fetch layer proxies ~50% of methods with Bearer auth + offline queue
> - **All 9 critical backend fixes applied (Sep 28)**: total auto-calc, status transition re-check, karaoke-only overlap, payment status logic, sync GET queue, delivery/package validation, equipment finalizeReturn
> - **Runtime verification complete**: live curl tests passed — FR-03 conflict (409), karaoke-only overlap, status transition re-check (409), payment recompute (Partial → Fully Paid), sync queue commit, sync conflict detection, equipment finalizeReturn

> [!warning] Frontend: **PARTIAL (~50%)**
> - ~50% of `API.*` methods still use localStorage
> - Calendar visibility, mobile layouts, payment-status consistency need fixes
> - Default branding uses Fiesta & Co.; auth is mock/localStorage

> [!success] Runtime Verification: **COMPLETE**
> - XAMPP (PHP/MySQL) running
> - All critical backend test cases passed via curl with Bearer token auth

## Quick Links

### Official Documentation (Source of Truth)
- `Documentation/AKAD_Requirements_Analysis_Documentation.md`
- `Documentation/AKAD_REVISED_Rentals_Proposal___RJDM_Collective.md`
- `Documentation/AKAD_System_Design.md`
- `Documentation/AKAD_ERD.png`

### Codebase Structure
- `api/` — 12 PHP endpoints + `booking_pricing.php` + `crud.php` + `config.php`
- `admin/` — Bootstrap/jQuery admin UI
- `js/` — Frontend logic (`api.js`, `storage.js`, `admin.js`)
- `db/` — `schema.sql` + `seed.sql`
- `css/` — Stylesheets

### Stack
PHP + MySQL + Bootstrap + jQuery + AJAX + localStorage/IndexedDB (offline queue)

## Tags

#akad #rental-ops-manager #requirements #architecture #approval #backend-complete #frontend-pending #runtime-verification-complete

---

> This index is auto-maintained. Update when memory files change.


## System understanding guide — 2026-09-29

The user authorized a system explanation and handover guide for the current backend and database. Frontend documentation is deferred because the frontend is unfinished. Entry point: [System Understanding — Start Here](System%20Understanding/Start%20Here.md). The guide covers all 26 PHP files, 19 SQL-defined tables (including SESSIONS in seed.sql), API contracts, workflows, source fingerprints and implementation gaps. It describes source behavior without changing application code or claiming new runtime acceptance. FR-10 remains skipped.


## Guide structure revision — 2026-09-29

The user requested a guide organized from system overviews and examples to detailed implementation references, with every existing filename and folder name retained. All 65 System Understanding notes follow that structure. Wording throughout the guide is neutral and does not characterize the audience’s knowledge or coding experience. The example follows Ana’s karaoke rental with a ₱2,750 rental total, ₱250 payment, separate ₱350 deposit and ₱50 deduction (₱300 calculated refund). Source/file/table coverage and links were checked; no application code or database behavior changed. Frontend documentation remains deferred. Entry: [Start Here](System%20Understanding/Start%20Here.md).


## Guide navigation update — 2026-09-29

The guide now uses relative Markdown note links with concise labels, navigation bars, and Previous/Next links for the main reading sequence and file/table references. Filenames and folders are retained. Entry: [Start Here](System%20Understanding/Start%20Here.md).

## Tester login setup — 2026-09-30

The seeded owner contact is `0917-123-4567`; the checked-in hash verifies with password `password`, not the old `demo123` comment/prefill. The login form and seed comments were aligned at that point, and a root README explains PHP/MySQL setup for repository testers. Login requires a PHP-enabled server and an initialized MySQL database; static-only hosting cannot execute `api/auth.php`. Existing database accounts may differ from the seed.

## Login merge resolution — 2026-09-30

During the merge of `origin/main` into local `main`, the single conflict in `admin/login.html` was resolved in favor of blank contact/password inputs and password-manager autocomplete. The seeded demo credentials remain documented in README and the setup note. The merge was completed as `cf29fd1` and pushed to `origin/main`; the working tree was clean at the September 30 source review. The incoming `event-rental/` copies and `stat` file were preserved because they were already in the teammate's remote commit.
