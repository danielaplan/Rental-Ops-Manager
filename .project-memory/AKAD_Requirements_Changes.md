---
name: akad-requirements-analysis-changes
description: Documenting the gap analysis between AKAD requirements and current Rental-Ops-Manager implementation
metadata:
  node_type: memory
  type: project
  originSessionId: 029bc4ed-f6f8-48e9-afa4-819cfc579d61
  modified: 2026-10-30
---

## Manual booking status overrides approved — 2026-10-30

The owner explicitly approved making `Pending`, `Confirmed`, `Awaiting Completion`, `Awaiting Payment`, and `Completed` manually selectable from the booking status dropdown for convenience, even when the ordinary return-inspection or full-payment lifecycle is incomplete. This supersedes the earlier restriction that `Awaiting Payment` and `Completed` could only be produced by post-event release/finalization. Manual overrides remain authenticated, audited, synchronized, and subject to availability conflict checks when entering `Confirmed`. Payment status remains derived independently from Completed payment records, so a booking may intentionally be `Confirmed` and `Unpaid`.

## Awaiting Payment workflow implemented — 2026-10-16

Added the approved two-stage post-event completion workflow. Complete return review releases service capacity. If completed rental payments are below `agreed_total`, the booking becomes `Awaiting Payment`, keeps an actionable owner notification and exact balance, rejects checklist/ordinary booking edits, and rejects completion. Once completed payments cover the total, an owner completion action records `Completed`, time and audit and resolves the notice. Direct API and offline replay use the same service. Dashboard/report counts and admin labels expose the state; upcoming availability excludes released bookings.

Focused booking/finance/offline/frontend checks and the complete non-migration acceptance run passed on synthetic `akad_verify_plan_1792150757195_24148`: 9 backend/sync files, 17 offline checks, 36 frontend tests, syntax and diff checks. Evidence: `tests/acceptance-results/1792150756830-33488/summary.json`. No operational database or migration was used. The clean-data clarification below removes the sample worksheet as a blocker; deployment/production/device gates and deferred blockouts remain open.

## Sample-data migration status correction — 2026-10-16

The user confirmed that all existing rows are sample/test data and no real historical business records need conversion. The 51 migration worksheet findings are now **Not Applicable**, not pending owner evidence. Clean deployment must initialize the reviewed schema without copying sample transactions or test credentials. Migration safeguards remain code-tested for possible future use, but running the legacy migration is unnecessary for the current deployment. Production hosting/device acceptance and deferred blockouts remain open.

All data-handling decisions for continued implementation must use this controlling assumption: repository databases, fixtures, worksheets, accounts, bookings, payments and checklists are synthetic test material with no real-business or legal-data implications. Code changes and synthetic verification within the approved implementation scope may proceed without additional owner-data authorization.

## Current backend source confirmation — 2026-10-16

Re-scanned every B1–B6 plan area across schema, migration source, direct APIs, shared domain services, sync replay, reports, reconciler and tests. Found one customer CRUD/schema mismatch: the writable definition accepted `notes`, but the clean `customers` table has no such column. Removed the unsupported field and added a catalog regression. The earlier complete non-migration acceptance runner passed on synthetic `akad_verify_plan_1792128884100_5244`; the Awaiting Payment run above is now the current evidence. The 51 historical findings, migration/deployment/production gates and deferred blockouts remain unchanged.

## Synthetic owner-walkthrough execution — 2026-10-16

Executed W01–W10 against the prepared isolated database `akad_verify_plan_1792046564392_28220`; all ten passed. The user then explicitly authorized Codex to execute W11/W12 as delegated reviewer because the owners were unavailable. Both passed: offline creation survived reload and synchronized once; the second owner could read it; stale edits were retained for review; keyboard and 390×844 layout checks passed. W12 exposed a missing location field in conflict recovery, fixed in `js/sync-ui.js` with a focused regression. All 35 frontend tests and syntax checks passed afterward. Evidence is linked from `Implementation/Backend-Owner-Walkthrough-2026-10-15.md`. On 2026-10-16, the user confirmed owner approval of all implemented/tested changes and later selected the Awaiting Payment policy recorded above. No operational database, migration/dry run, historical finding, or deferred blockout was touched. The walkthrough server was stopped.

## Consolidated runtime verification and acceptance preparation — 2026-10-15

User authorized all applicable runtime regressions, defect fixes if needed, a consolidated report/matrix update, a synthetic owner walkthrough and a precise evidence checklist. All nine backend/sync files passed together on synthetic `akad_verify_plan_1792046383527_34548` (17 offline checks), plus 34 frontend tests, syntax and diff checks. No new application defect reproduced; only test orchestration changed. A 97-file source manifest confirms the code state stayed unchanged. Migration tests and legacy blockout checks were explicitly excluded, not marked passed. No operational database access or migration/dry run occurred.

Report: `Implementation/Backend-Consolidated-Verification-2026-10-15.md`. Walkthrough: `Implementation/Backend-Owner-Walkthrough-2026-10-15.md`, using separate API-verified synthetic `akad_verify_plan_1792046564392_28220`; owner approval of implemented/tested changes was recorded on 2026-10-16. All owned setup/test servers stopped. Evidence checklist: `C:\Users\acer\Desktop\akad-rentals-evidence-checklist-2026-10-15.md`; covers all 51 worksheet rows with blank decision/evidence fields, unchanged source worksheet and no invented records. Next is source collection. Operational migration, production/device/performance acceptance and separate authorization gates remain open.

## Latest history/template follow-up — 2026-10-15

Closed NFR-04/B4-06/B6-01 history-retention gap: rental-item deletion through direct or sync CRUD now rejects any item linked to item history or legacy/revised checklists. Referenced rows and item links stay unchanged; unused-item deletion and sync receipt replay still work. Closed B1-09/B4-04 malformed template name/list/quantity validation gaps with transactional rejection. No historical values were inferred or repaired.

Both new regression tests failed before fixes. Eight tests in five focused files passed afterward on synthetic `akad_verify_plan_1792045494512_37116`; PHP/JS/service-worker/admin-inline syntax and diff checks passed. See matrix for exact command. No operational DB access, dry run, or migration was performed. No frontend/schema/migration changes; earlier full offline/auth/finance/migration/performance evidence was not rerun. All 51 findings remain pending source evidence, with separate operational approval gates unchanged.

## Follow-up validation completion — 2026-10-15

Inspected the existing dirty worktree and matrix before edits. Closed additional B4-03/B4-06/B6-01 gaps: reject non-text offline deduction reasons; reject malformed supplied item-history booking links without dropping the association; validate sync reference types before string casting. Valid inventory-only history, offline receipts, corrected retries, and local-ID mapping remain supported. No frontend/schema/migration changes were needed.

New `tests/write-validation-gaps.test.cjs` reproduced both failures before the fixes. Four focused files passed afterward on synthetic `akad_verify_plan_1792044979583_38544`, including 17 offline checks; all 34 frontend regressions and syntax checks passed. Earlier migration/auth/catalog/lifecycle suites were not rerun. No operational DB access occurred. All 51 historical findings remain pending owner source evidence; explicit approval is required for operational preflight and separate authorization for application. See the updated matrix and migration guide. Production acceptance remains open; blockouts remain deferred.

## Latest requirement completion pass — 2026-10-15

Read current code and previous evidence before changing it. The full plan-row matrix is now `Implementation/Backend-Requirement-Matrix.md`, with explicit implemented, locally verified, deferred, and operationally blocked scope. This supersedes blanket completion claims and stale online-only/sync-removal tasks.

- Closed the sync rule bypass: replay now shares booking, payment, catalog, delivery, and append-only history services with direct writes. Receipts, local IDs, stale conflicts, retries, and offline workflows remain preserved.
- Added the missing scheduled CLI reconciler. Review/release uses shared checklist condition validation and item audits. Conflicts include client/service/event times; booking reads expose approved-overlap markers for both records.
- Recheck package eligibility on reschedule/pending confirmation, align service/booking allowance limits, reject malformed booking text, and preserve cancellation reasons and linked history.
- Added report detail lists/metric definitions and corrected current-session validation order. Migration preflight preserves known actors/times/inactive users, requires meaningful evidence, and rejects orphan/invalid checklist release quantities before DDL.
- Focused synthetic tests cover catalog/snapshots/cancellation, scheduler/release, finance/reporting, auth races/HTTPS/CORS bootstrap, and direct-versus-sync rule parity. Existing offline and frontend regressions are rerun with the isolated runner; exact commands/results belong in the matrix, not a production-readiness claim.
- The final review found two frontend integration regressions and fixed them: report API compatibility fields now match existing dashboard/report consumers, and queued-payment subtraction keys preserve full local booking IDs so offline payments remain unaccepted until sync. Focused report and frontend regressions pass.
- After those fixes, the complete seven-file backend/sync suite passed on isolated `akad_verify_plan_1792044208446_19208` (including 17 offline checks), the migration regression passed, all 34 frontend regressions passed, PHP lint passed for 42 files, and syntax/diff checks passed. No operational database was read or migrated in this pass.
- Initial completion-pass evidence, superseded by the post-review results above: seven backend/sync files passed together on `akad_verify_plan_1792042925602_16200` (17 offline checks included), separate migration regression passed, 33 frontend regressions passed, and syntax/diff checks passed. Fixed the test runner's synchronous-child log-pipe stall before the combined rerun. No focused integrations skipped.
- The external worksheet remains evidence-only. The last operational dry run had 51 findings; no operational database was read, migrated, or corrected during this pass. New safeguards can reveal further exceptions. Production migration, real TLS/origins/scheduling/performance, owner acceptance, and scoped frontend visual/timing acceptance remain open.
- Legacy FR-10 blockouts remain deferred. Existing availability-block draft artifacts/tests are not new feature authorization. Sync removal is superseded by the explicit preserve-sync decision.

## Earlier implementation and migration status — 2026-10-15

This update supersedes the October 8 evidence section and older completion claims below. The authoritative task-by-task status is in `Implementation/Revised-Requirements-Backend-Implementation-Plan.md`; the operator procedure is `Implementation/Backend-Migration.md`.

- Backend implementation and the specifically authorized frontend checklist/review integration were validated locally. The revised backend and offline-sync tests passed; offline-sync passed 17/17 checks. Public-site passed 5/5, frontend API contract 10/10, async workflows 13/13, and direct API 5/5. PHP syntax and changed JavaScript checks also passed.
- The frontend now caches package checklist templates for offline bookings, syncs package-template IDs and release quantities, and requires explicit service/payment/deposit review before final release.
- User decision: preserve offline sync. Do not remove the sync endpoints/settings or migrate the application to online-only unless the user changes that decision.
- A synthetic 10,000-booking performance test met the local under-three-second p95 threshold for measured booking/availability operations. The local booking-list response was about 20.2 MB; dashboard and monthly reports were about 1.4/1.5 KB. This local PHP built-in-server/MariaDB result is not production-hosting acceptance.
- User confirmed the backup/restore and maintenance prerequisites. A read-only dry run against configured `akad_rentals` found 51 unresolved migration exceptions (2 user-level, 15 booking-level, 4 payment-level, 30 booking-item/checklist discrepancies). Nothing was migrated or changed by that dry run. Resolve using source evidence and rerun with zero exceptions before applying.
- FR-10 internal blockouts remain deferred. Production performance acceptance and the full requirement matrix remain open. Do not describe the overall implementation or production cutover as complete.

## Current evidence — 2026-10-08 (backend fixes + FE verification)

Two backend bugs fixed and verified via PHP lint; PHP server + MySQL confirmed running locally for live testing:

1. **`api/crud.php` default-precedence bug — FIXED**: `$vals = $defaults + $vals` → `$vals = $vals + $defaults`. Submitted values now take precedence; defaults fill only missing fields. Verified: create service with Inactive status persisted correctly.
2. **`api/bookings.php` Completed bypass — FIXED**: removed the `$expectedTotal > 0` gate. Equipment-completion validation now runs unconditionally whenever `status === 'completed'`, enforcing the inspection rule independently of the frontend.

FE items FE-03/04, FE-07, FE-09-11, FE-16, FE-17 all verified present in codebase (not yet live-tested). Backend dependencies are now closed.

## Current frontend evidence — 2026-10-02

The current tracked status is the [frontend requirements review](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md), updated after GitHub commit `e5f3b1f` and a focused browser/PHP/MySQL smoke test. The historical September 28 coverage table below is not the current frontend verdict.

- FE-17 / NFR-04: page 2 and back worked with 63 isolated bookings. A no-match search exposed stale pagination; the user-authorized local fix removes the controls in the empty branch. Browser verification with 12 bookings confirmed disappearance and restoration after clearing the search. Refresh/filter edge cases and frontend timing acceptance remain open.
- FE-08 / FR-06 and FR-08: deposit and delivery controls now live in Details. One isolated save/reload passed: ₱350 held, ₱50 deducted, ₱300 preview; Lalamove with ₱250 fee paid by AKAD. Phone, offline, failure, and refund-status checks remain open.
- FE-14/15: service creation is limited to Active as a frontend workaround. Active create and Inactive edit survived reload in the isolated database. Special characters rendered literally in a service row. Generic CRUD default precedence and the broader field/rendering audits remain open.
- FE-05: seeded owner login worked through local PHP/MySQL. The other developer's raw PHP response was a server-execution problem, not a credential mismatch; that laptop was not tested. Frontend guidance for non-JSON login responses remains open.
- FE-02 / FR-09: the ordinary booking status path can still set Completed without dedicated return-inspection validation. Owner/backend rule correction remains open.

The temporary smoke database and port-8020 PHP server were removed. These focused results do not certify full frontend, offline, device, usability, or production acceptance. FR-10 remains skipped.

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



**Backend Implementation Completed — September 28, 2026**

**Latest user decision — 2026-09-28 (FR-04 / FR-06):** Admins enter the down payment and refundable deposit amounts negotiated by the owner and client for each booking. Neither amount is fixed; no mandatory ₱1,000 minimum is to be imposed. This replaces the previous deferred minimum rule. Keep rental payments and refundable deposits separate. The official requirements introduction was updated with explicit user authorization on 2026-09-28 and now matches this decision. Source inspection found no fixed minimum enforcement; frontend controls must support negotiated amounts.

Completed gap analysis of AKAD Sweet Party Rental requirements documentation against current Rental-Ops-Manager implementation.

**Requirements Status (Backend vs Frontend):**

| Requirement                                                         | Priority | Frontend                                   | Backend (Sep 28)                                                                   |
| ------------------------------------------------------------------- | -------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| FR-01: Record customer, contact, event date/location, service       | Must     | Partial                                    | ✅ API complete + auto-calc totals                                                  |
| FR-02: One calendar for all service lines, live for connected staff | Must     | Partial                                    | ✅ API provides data                                                                |
| FR-03: Prevent overlapping karaoke bookings                         | Must     | Partial                                    | ✅ Server-side enforced (409) + status transition re-check                          |
| FR-04: Down payment/reservation fee amount and status               | Must     | Partial                                    | ✅ API + recompute + payment status logic                                           |
| FR-05: Fixed Sweet Corner packages                                  | Should   | Missing                                    | ✅ API + packages table + service_id validation                                     |
| FR-06: Refundable deposit, deductions, reason, refund calc          | Should   | Missing                                    | ✅ API + refund_status                                                              |
| FR-07: Most-booked service, monthly income, upcoming bookings       | Should   | Partial                                    | ✅ API (fixed revenue calc = Σ amount_paid)                                         |
| FR-08: Delivery method and who pays the delivery fee                | Should   | Missing                                    | ✅ API + enum validation + booking_id validation                                    |
| FR-09: Per-rental equipment return checklist                        | Could    | Partial                                    | ✅ API + finalizeReturn endpoint + completeness check                               |
| FR-10: Internally mark a service/date unavailable                   | Could    | Missing                                    | ❌ Skipped                                                                          |
| NFR-01: Offline entry, Pending Sync, auto sync, conflict review     | Must     | Implemented; focused runtime checks passed | Transactional commit/replay/conflict checks passed; see latest evidence and limits |
| NFR-02: Desktop and smartphone access                               | Should   | Partial                                    | N/A                                                                                |
| NFR-03: Usable without extensive training                           | Could    | Unverified                                 | N/A                                                                                |
| NFR-04: Responsive during peak periods                              | Could    | Unverified                                 | N/A                                                                                |
| WONT-01: No public customer self-service booking portal             | Won't    | Scope conflict                             | ✅ Auth on all endpoints                                                            |

**Key Findings:**
- Earlier backend coverage summary; it did not establish frontend or full NFR-01 acceptance. See the latest evidence above.
- System has solid modular architecture: `api/config.php` → `api/crud.php` + specific endpoints → `js/api.js` fetch layer
- Schema extended with CATEGORIES, ADDONS, 14 new BOOKINGS columns, SESSIONS table
- `bookings.php` enforces FR-03 overlap check server-side (returns 409 conflict); karaoke-only; re-checks on status transition
- `payments.php` recomputes `amount_paid`/`payment_status` from recorded payments; handles total=0 fallback
- `sync.php` commits bookings, payments, deposits, delivery, equipment + CRUD entities; returns committed/conflicts/failed; GET queue endpoint added
- `equipment.php` adds `finalizeReturn` endpoint: verifies all items returned before marking booking completed
- `booking_pricing.php` centralizes total calculation (package + addons - discount + fees) in cents for precision
- Column/value counts verified: all INSERT lists match their CREATE TABLE schemas
- JS syntax checks pass: `node --check js/api.js` and `js/admin.js`

**Historical frontend gaps from the Sep 18 review (see latest updates above):**
- ~50% of `API.*` methods still use localStorage (rental items, gallery, settings, website content, booking items, releases, `getBooking`, `getPaymentsForBooking`, etc.)
- Time validation, confirmation availability check, payment-status consistency, return-result display need fixes
- Calendar visibility (service labels, '+ more' action), mobile layouts need work
- Default branding uses Fiesta & Co.; authentication is mock/localStorage

**Changes Made to Understanding:**
- Moved from "backend complete, frontend partial" to "backend fully complete with all critical fixes (Oct 8, 2026)"
- All critical backend gaps closed: total auto-calc, status transition re-check, karaoke-only overlap, payment status logic, sync queue endpoint, delivery/package validation, equipment finalizeReturn, CRUD default precedence fix, Completed bypass fix
- Ready for frontend integration and runtime verification (PHP server + MySQL confirmed running locally)
# Frontend implementation continuation — 2026-10-17

The user explicitly authorized continuing the revised frontend implementation. Added the missing authoritative booking availability preview endpoint and the missing package/checklist, primary-owner administration, and read-only audit pages. Completed dedicated reason-required cancellation, historical package snapshot display, delivery notes/responsibility values, calendar approved-overlap markers, itemized deposit deduction/refund UI, payment-date report wording, operational report totals, and package popularity. Offline sync and its UI/APIs remain present; legacy internal availability blockouts remain deferred.

The final isolated acceptance runner passed 9 backend/sync test files, 17 offline integration checks, 37 frontend regression tests, and all PHP/JavaScript/service-worker/admin-inline syntax checks. Evidence: `tests/acceptance-results/1792178839273-14600`. Live checks verified the new pages and 375×812 document containment. Itemized deduction and refund operations now remain in the offline outbox and replay through the shared backend rules. Local synthetic evidence is not production or owner acceptance.
