---
name: akad-requirements-analysis-ideas-concepts
description: Key ideas and concepts from AKAD requirements analysis and proposed solutions
metadata:
  node_type: memory
  type: reference
  originSessionId: 029bc4ed-f6f8-48e9-afa4-819cfc579d61
  modified: 2026-09-28T05:57:05.326Z
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



**Key Ideas from Analysis — Backend Fully Implemented Sep 28, 2026**

## Core Concepts (Implemented)

### 1. Validate every path that can confirm a booking ✅
Check valid start/end times at submission and recheck resource availability when creating, confirming, or reactivating a booking. Re-confirming a cancelled booking must not bypass the single-karaoke-set rule. Future central enforcement must also handle simultaneous and offline submissions.
**✅ Backend: `bookings.php checkSlot()` returns 409 on overlap; `sync.php` validates before commit; status transition re-check added.**

### 2. Preserve the existing application layers ✅
The prototype separates browser persistence in `js/storage.js`, data operations in `js/api.js`, shared helpers, and page forms. Put reusable rules in the data layer and expose clear errors in forms rather than maintaining inconsistent page-only checks.
**Architecture decision (2026-09-22):** The user changed the target stack from Node.js/Express/Supabase/PostgreSQL to **PHP, MySQL, Bootstrap, jQuery, and AJAX with browser localStorage/IndexedDB for offline queueing**, per Documentation/AKAD_System_Design.md and Documentation/AKAD_REVISED_Rentals_Proposal___RJDM_Collective.md. The `/Documentation/` folder is the authoritative source of truth for all implementation decisions. Prior references to Node.js/Express/Supabase/PostgreSQL are superseded.
**✅ Backend implemented per this architecture.**

### 3. Separate payment, deposit, and refund concepts ✅
Distinguish service total, reservation/down payment, later payments, refundable deposit, deductions, and refund status. User decision (2026-09-28): the admin records down payment and deposit amounts negotiated by the owner and client; neither has a fixed amount or a mandatory ₱1,000 minimum. This supersedes the earlier deferred-minimum decision. The official requirements introduction was updated with explicit user authorization on 2026-09-28 to reflect this decision. Payment methods per Documentation/AKAD_System_Design.md are GCash and MariBank.
Derive payment status from recorded transactions or define an auditable exception. Do not allow Fully Paid to contradict the balance. Deposit deductions require a reason; calculate the remaining refundable amount separately from service income.
**✅ Backend: `payments.php` recomputes amount_paid/payment_status with total fallback; `deposits.php` computes refund_status (pending/full/partial/none).**

### 4. Make return inspection reflect saved records ✅
Render saved returned quantities, conditions, and notes instead of resetting to full quantity and Good. Use consistent shortfall rules for missing-item counts and inventory availability. Make repeated completion safe and keep the original inspection visible for review.
**✅ Backend: `equipment.php` saves return_status; `finalizeReturn` verifies all items returned before completing booking.**

### 5. Model packages, delivery, and unavailable periods explicitly ✅/❌
Add configurable fixed Sweet Corner packages after the client confirms their definitions/prices. Capture self-pickup, Lalamove, or owner delivery and whether the renter pays the fee or it is included. Generic add-ons/fees do not replace these fields.
**✅ Backend: `packages.php` with service_id validation, `delivery.php` with enum validation + booking_id validation.**
Add service/date/time blockouts with a reason. Include them in availability checking and show them on the internal calendar.
**Note:** On 2026-09-22 the user indicated FR-10 blockouts may not be necessary; the official documentation still lists FR-10 as a "Could" priority.
**❌ Skipped — no BLOCKOUTS table or endpoint.** Implement only if confirmed as requirement.

### 6. Improve calendar visibility and mobile interaction (Frontend)
Show service context, time, customer, and status. Make every day's bookings accessible through an actionable '+ more' control or another day view. Use keyboard-accessible booking controls and associated input labels.
At phone widths, wrap or stack return quantities, conditions, and notes. A tested mobile menu alone does not establish the usability of all workflows.

### 7. Correct existing reports before treating them as accepted ✅
Monthly trends, popular services, and upcoming bookings already exist. Remove the unpaid-total revenue fallback and build month keys consistently with the agreed business timezone. Define cash received by payment date versus event-month revenue explicitly. Do not describe a chart as missing when the real issue is incorrect calculation.
**✅ Backend: `reports.php` uses amount_paid (not total) for total_revenue.**

### 8. Implement offline behavior as a complete workflow ✅
NFR-01 requires local create/update operations, visible Pending Sync, automatic upload within 30 seconds after reconnect, other-device visibility on refresh, and staff review of conflicts. Plan a durable queue, acknowledgement/retry/version handling, conflict screens, and central API enforcement.
**✅ Backend: `sync.php` commits bookings/payments/deposits/delivery/equipment + CRUD; returns committed/conflicts/failed; GET `?do=queue` endpoint added. Frontend: `js/api.js` queues writes, retries on online event. Runtime verified.**
Browser localStorage alone does not implement synchronization. Plan reliable offline app loading as well: current externally hosted libraries and the absence of an app cache leave offline reload unverified.

---

## Proposed Solution Concepts (Backend Done, Frontend Remaining)

1. **Enhanced Booking Model** → ✅ Implemented in schema: `service_ids`, `addon_ids` JSON, `discount`, `fees`, `subtotal`, `addons_total`, `total`, `amount_paid`, `payment_status`, `source`, `guests`, `event_type`, `special_requests`, `email`, `customer_type`

2. **Offline Sync Manager** → ✅ Backend `sync.php` + Frontend queue in `js/api.js` (lines 493-650). GET queue endpoint added. Runtime verified.

3. **Package/Configuration System** → ✅ `packages` table + `packages.php` endpoint with service_id validation.

4. **Availability Enhancement** → ✅ Server-side overlap check in `bookings.php` + `sync.php`. Karaoke-only enforcement. Status transition re-check. ❌ FR-10 blockouts skipped.

5. **Reporting Completeness** → ✅ `reports.php` dashboard + report endpoints with correct revenue calculation.

6. **Equipment Return Finalization** → ✅ `finalizeReturn` endpoint verifies all booking_items returned before marking booking completed.

---

## Implementation Principles (Followed)

- Follow existing code patterns exactly (naming, structure, event handling)
- Maintain backward compatibility with existing data
- Use Bootstrap components consistently
- Keep changes focused and incremental
- Verify each requirement against its specific acceptance criteria
- **Server-side business rules, not client-side** (FR-03, FR-06, auth, sync validation all in PHP)
- **Cents-based currency arithmetic** in `booking_pricing.php` for precision

---

## Acceptance and Maintenance

TC-01 through TC-12 are acceptance targets; backend verification complete. **Backend static verification complete (Sep 28):** all 12 endpoints exist + new `booking_pricing.php` + `finalizeReturn` endpoint, schema/seed column counts match, JS syntax checks pass, fetch layer proxies ~50% of methods. **Runtime verification complete (Sep 28):** live curl tests with bearer token passed — FR-03 conflict test (409), karaoke-only overlap, status transition re-check (409), payment recompute test (Partial → Fully Paid), sync queue commit test, sync conflict detection test, equipment finalizeReturn test. Frontend recorded verification covers selected local browser flows, one phone viewport, and isolated logic checks. Client usability, peak-volume performance, full offline use, and multiple-device synchronization remain unverified.

Read the report's open decisions before planning dependent work. Preserve the client's requirements rather than weakening them to match the prototype. Update these concepts when the report's evidence or work order changes, using the same documentation revision. This is manual document maintenance, not automatic file synchronization.

This file is local memory excluded from Git. The user will commit the public report manually.
