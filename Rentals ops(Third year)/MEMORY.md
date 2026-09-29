---
title: Rental-Ops-Manager Memory Index
date: 2026-09-28
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

The user authorized a teaching/handover guide for the current backend and database. Frontend documentation is deferred because the frontend is unfinished. Entry point: [[System Understanding/Start Here|System Understanding — Start Here]]. The guide covers all 26 PHP files, 19 SQL-defined tables (including SESSIONS in seed.sql), API contracts, workflows, source fingerprints and implementation gaps. It describes source behavior without changing application code or claiming new runtime acceptance. FR-10 remains skipped.
