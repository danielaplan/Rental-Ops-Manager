---
title: Rental-Ops-Manager Memory Index
date: 2026-10-06
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

## Latest session — frontend branding/calendar/sync/catalog fixes and session close — 2026-10-07

The user authorized all remaining frontend fixes (FE-03 through FE-15) and this session completed the branding, calendar, sync, and catalog work. Codebase is clean: no `Fiesta & Co.` references remain in `js/` or `admin/`; PHP and JS syntax checks pass.

Implemented and verified this session:
- **FE-05** Branding: `Fiesta & Co.` removed from `js/admin.js:139`, `js/app.js:159`, `admin/settings.html:150`, `admin/content.html:155`; all fall back to `CONFIG.businessNameFallback` ("AKAD Sweet Party Rentals")
- **FE-06** Calendar: `js/calendar.js:43` "+X more" initial label changed to "Show more" to match the toggle text
- **FE-08** Payment/delivery/offline: `api/payments.php` finite+positive amount validation, `api/delivery.php` fee >= 0, contact/method normalization, offline sync queue validation
- **FE-12** Stale-edit comparison UI: `js/sync-ui.js:39-60` renders before/after/change table for conflict operations
- **FE-14/15** Catalog field contracts verified; `escapeHtmlA` on all user-entered text; gallery URLs restricted to HTTP(S)

Still open: FE-03/04, FE-07, FE-09/10/11, FE-16, FE-17. Backend-only dependencies: `api/crud.php` default-precedence bug and `api/bookings.php` general Completed-status bypass.

The user then shut down the session. No staging, commit, or push was performed.

Implemented frontend changes:

- Manual booking awaits form population before restoring drafts, guards duplicate submissions before the first awaited read, retains input on failure, preserves prefixed package IDs, and prevents duplicate booking creation after a dependent down-payment failure.
- Shared admin event/initialization handling catches asynchronous errors and guards save actions. Delete callbacks, sync retries, and scheduled rerenders await completion and display failures.
- Availability, package/add-on loading, calendar, booking lists/details/checklists, dashboard, and reports have stale-response protection. Dashboard charts and report receipts use resolved numeric payment amounts.
- Public refresh uses the central `API.refreshPublicData()` request/normalization path, preserves cached presentation fields and pending drafts, retains cached content on outages, and removes accepted records absent from a successful server response.
- Added `tests/frontend-async-workflows.test.cjs`, expanded public refresh tests, and updated the service-worker shell cache version.

Verification performed: **30 automated tests passed, 0 failed** across direct API, synchronization contract, public refresh, and frontend async workflow suites. PHP, JavaScript, service worker, and admin inline syntax checks passed; `git diff --check` passed. The isolated verification servers on ports 8017/8018 were unavailable, so no new live PHP/MySQL or browser acceptance run was performed. Historical live reports do not certify these new edits.

**Testing reminder remains outstanding:** use [Frontend Testing Checklist](../Implementation/Frontend-Testing-Checklist.md) for browser booking/payment/return workflows, failure and retry behavior, offline reload/reconnect, rapid selection changes, and mobile/keyboard checks. The reminder is recorded here and was included in the handoff; no scheduled notification was created. The [wiring plan](../Implementation/Frontend-Backend-Wiring-Remaining-Plan.md) now distinguishes this follow-up from its historical checklist. Do not describe the frontend or whole system as fully accepted until the remaining workflows pass.

Two confirmed backend issues remain **unfixed**:

1. `api/crud.php` merges create values as `$defaults + $vals`, allowing defaults such as Active to override a submitted Inactive status. Defaults should apply only to missing fields.
2. `api/bookings.php` allows a general update to set Completed without the dedicated return-finalization/inspection validation. The frontend blocks the normal direct transition, but the backend must enforce this rule independently.

No backend implementation changes, staging, commits, pushes, or deployment were performed in this frontend follow-up. FR-10 internal blockouts remain skipped. Earlier blanket “backend fully complete,” “runtime complete,” and “frontend ~50%” statements below are historical and superseded by the scoped evidence above.

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
