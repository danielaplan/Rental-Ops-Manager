---
name: akad-requirements-analysis-changes
description: Documenting the gap analysis between AKAD requirements and current Rental-Ops-Manager implementation
metadata:
  node_type: memory
  type: project
  originSessionId: 029bc4ed-f6f8-48e9-afa4-819cfc579d61
  modified: 2026-10-02
---

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
- Moved from "backend complete, frontend partial" to "backend fully complete with all critical fixes"
- All critical backend gaps closed: total auto-calc, status transition re-check, karaoke-only overlap, payment status logic, sync queue endpoint, delivery/package validation, equipment finalizeReturn
- Ready for frontend integration and runtime verification
