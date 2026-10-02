---
name: akad-requirements-analysis-changes
description: Documenting the gap analysis between AKAD requirements and current Rental-Ops-Manager implementation
metadata:
  node_type: memory
  type: project
  originSessionId: 029bc4ed-f6f8-48e9-afa4-819cfc579d61
  modified: 2026-10-02
---

## Frontend update — 2026-10-02

The current FE-01–FE-17 report is the [frontend developer handoff](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md). It compares commit `e5f3b1f` with the requirements and records focused browser/PHP/MySQL results. Pagination reached rows 51–63 and returned to rows 1–50. A no-match search exposed stale controls; the user-authorized local `admin/bookings.html` fix removed them, and a 12-booking browser check confirmed removal and restoration after clearing the search. One isolated deposit/delivery save/reload, Details-tab visibility, Active-service create/Inactive edit and reload, and literal special-character rendering passed. Seeded local owner login passed. The temporary database/server were removed.

These are selected results, not full frontend acceptance. The other developer's raw PHP login response still requires a PHP-enabled server on that laptop; its environment was not tested. CRUD create-default precedence, universal return-completion enforcement, non-JSON login guidance, and phone/offline/keyboard/performance checks remain open. FR-10 remains skipped. The older September 28 table below is historical.

## Current frontend gap review — 2026-09-30

The merged frontend at `cf29fd1` addresses several earlier gaps in source: booking event editing, public booking removal, AKAD titles, package-name display, GCash/MariBank selection, delivery controls with queued save, dashboard/report data-change refresh, read-error display, basic service-field contract, key output escaping, and add-on draft restoration. See the [frontend developer handoff](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md) for FE-01–FE-17 status, source links, remaining fixes, and acceptance checks. The historical table below is a September 28 snapshot; its “Missing,” “mock authentication,” and “Fiesta & Co.” frontend findings do not describe the current merged source.

The source review did not run new browser or live PHP/MySQL tests. Do not mark an FE item fully accepted solely because its form or handler exists. Backend persistence, role behavior, offline replay, reload, physical-device accessibility, and report definitions still need end-to-end verification. FR-10 remains skipped; negotiated down payments and deposits have no fixed or mandatory ₱1,000 minimum.

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

| Requirement                                                         | Priority | Frontend       | Backend (Sep 28)                                          |
| ------------------------------------------------------------------- | -------- | -------------- | --------------------------------------------------------- |
| FR-01: Record customer, contact, event date/location, service       | Must     | Partial        | ✅ API complete + auto-calc totals                         |
| FR-02: One calendar for all service lines, live for connected staff | Must     | Partial        | ✅ API provides data                                       |
| FR-03: Prevent overlapping karaoke bookings                         | Must     | Partial        | ✅ Server-side enforced (409) + status transition re-check |
| FR-04: Down payment/reservation fee amount and status               | Must     | Partial        | ✅ API + recompute + payment status logic                  |
| FR-05: Fixed Sweet Corner packages                                  | Should   | Missing        | ✅ API + packages table + service_id validation            |
| FR-06: Refundable deposit, deductions, reason, refund calc          | Should   | Missing        | ✅ API + refund_status                                     |
| FR-07: Most-booked service, monthly income, upcoming bookings       | Should   | Partial        | ✅ API (fixed revenue calc = Σ amount_paid)                |
| FR-08: Delivery method and who pays the delivery fee                | Should   | Missing        | ✅ API + enum validation + booking_id validation           |
| FR-09: Per-rental equipment return checklist                        | Could    | Partial        | ✅ API + finalizeReturn endpoint + completeness check      |
| FR-10: Internally mark a service/date unavailable                   | Could    | Missing        | ❌ Skipped                                                 |
| NFR-01: Offline entry, Pending Sync, auto sync, conflict review     | Must     | Missing        | ✅ API + queue + conflict detection + GET queue endpoint   |
| NFR-02: Desktop and smartphone access                               | Should   | Partial        | N/A                                                       |
| NFR-03: Usable without extensive training                           | Could    | Unverified     | N/A                                                       |
| NFR-04: Responsive during peak periods                              | Could    | Unverified     | N/A                                                       |
| WONT-01: No public customer self-service booking portal             | Won't    | Scope conflict | ✅ Auth on all endpoints                                   |

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
- Moved from "backend complete, frontend partial" to "backend fully complete with all critical fixes"
- All critical backend gaps closed: total auto-calc, status transition re-check, karaoke-only overlap, payment status logic, sync queue endpoint, delivery/package validation, equipment finalizeReturn
- Ready for frontend integration and runtime verification
