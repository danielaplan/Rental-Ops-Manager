# AKAD frontend requirements review and developer handoff

Updated: September 30, 2026. Source review of merged `main` at `cf29fd1`; earlier findings are superseded where they differ below.

## Purpose and assignment boundary

Complete the internal staff interface using HTML, CSS, JavaScript, Bootstrap, and jQuery. This document is the current frontend work list, including remaining defects, missing workflows, completed work to preserve, and acceptance checks.

**Frontend developer:** screens, styling, interactions, accessible forms, client validation, retained drafts, loading/error feedback, and frontend regression checks. The project owner handles database/PHP changes and live API integration and backend verification. Coordinate interface contracts with the owner; identify dependency gaps instead of inventing backend behavior. Labeled fixtures may demonstrate missing interfaces, but do not replace existing live authentication or synchronization with mock implementations.

**Scope decision:** FR-10 blockouts remain **skipped**, including their frontend. This document does not assign blockout implementation. The September 30 update changes documentation only; it does not certify or alter application behavior.

Payments are recorded after staff receive them externally. Payment gateways, transfers, and automatic verification are outside scope. Down payments and refundable deposits are separate amounts negotiated by the owner and client under admin control. **Neither has a fixed amount or a mandatory ₱1,000 minimum.**

## Sources and evidence limits

- [Official requirements](../../Documentation/AKAD_Requirements_Analysis_Documentation.md): FR-01–10, NFR-01–04, WONT-01.
- [Implementation and verification report](../../Implementation/Offline-Sync-Verification-2026-09-28.md): engineering changes, passed focused checks, and limitations.
- [Integration results](../../tests/offline-sync-results.json): 14 live PHP/MySQL checks.
- [Browser outage results](../../tests/browser-outage-results.json) and [layout results](../../tests/browser-layout-results.json): focused browser workflow and viewport checks.

This update inspected source after the frontend merge; it did not run a new browser or live PHP/MySQL regression suite. Earlier September 28 results establish selected workflows only. The source review confirms that controls and handlers exist, not that every save, reload, conflict, role, or device path passes. Physical phones, all screens, full keyboard behavior, production peak load, and two-owner/one-staff usability are not certified.

## Work order

| Task | Priority | Current status | Requirements |
|---|---|---|---|
| FE-01 Booking validation and edit/confirmation feedback | P1 | Event edit form and local conflict feedback implemented; verify server rejection/retry behavior | FR-01, FR-03 |
| FE-02 Restore return inspections | Preserve | Implemented; focused persistence checks passed | FR-09 |
| FE-03 Calculated payment status | Preserve/P1 | Read-only status implemented; validate pending/failed/duplicate payments and refresh | FR-04 |
| FE-04 Screen loading, refresh, errors, and truthful saves | P1 | More pages now refresh and show pending/error states; audit every screen and failure path | FR-01–09, NFR-01 |
| FE-05 Internal scope, branding, and staff access | P1 | Public booking creation removed; AKAD titles and real login exist; audit content, roles, and auth errors | WONT-01, NFR-03 |
| FE-06 Service/package selection and display | P1 | Selector and `package_name` detail display implemented; verify catalogs and reload | FR-01, FR-05 |
| FE-07 Negotiated payments and history | P1 | Down-payment entry and GCash/MariBank choices implemented; verify history and failures | FR-04 |
| FE-08 Deposit and delivery workflows | P1 | Deposit and delivery controls plus local/sync adapter implemented; verify persistence and refund status | FR-06, FR-08 |
| FE-09 Calendar navigation and freshness | P2 | Labels/expansion/refresh implemented; complete regression and feedback | FR-02, FR-03 |
| FE-10 Phone and keyboard accessibility | P2 | Return layout checks passed; full interface/device audit remains | NFR-02, NFR-03 |
| FE-11 Reporting definitions and freshness | P2 | Event-date basis labeled and refresh handling added; validate figures, states, and owner definitions | FR-07 |
| FE-12 Offline and conflict feedback | P1/Preserve | Real queue/cache/sync and read-error display implemented; complete stale-record comparison and coverage | NFR-01 |
| FE-13 Service/date blockouts | Skipped | Explicitly deferred; do not implement | FR-10 |
| FE-14 Catalog/settings field contracts | P1 | Service form narrowed to supported fields; inventory and verify remaining screens | Supporting workflows |
| FE-15 Safe rendering of user-entered values | P1 | Escaping added in key views; complete text, attribute, and URL audit | All relevant screens |
| FE-16 Draft recovery and save consistency | P2 | Add-on draft restoration and partial-payment recovery added; test failure/reload paths | FR-01, NFR-01 |
| FE-17 Frontend performance | P2 | Pagination/date indexing implemented; broader measurement remains | NFR-04 |

Start with end-to-end verification of the newly added booking edit, delivery, payment, package, draft, and refresh paths. Fix failures found there, complete the field-contract and save/error audits, then finish device, accessibility, reporting, and performance acceptance. Preserve implemented controls rather than rebuilding them because an earlier review called them missing.

## P1 — Complete missing workflows and correct misleading states

### FE-01 — Booking validation, editing, and confirmation

**Implemented in source:** [manual-booking.html](../../admin/manual-booking.html) validates time order at submission and requires one service/package. New bookings start Pending. [bookings.html](../../admin/bookings.html) now has an ordinary date/time/location edit form with required-field, time-order, local conflict, inline-error, and duplicate-click handling. The sync panel separately offers date/time edits for rejected drafts.

**Remaining work:** Exercise edit, confirm, reschedule, rejection, retry, reload, and offline paths against the PHP API. Verify that rejected input stays editable, the server's conflict reason is actionable, and a local Pending Sync edit never appears accepted prematurely. Check focus and announcements in both edit and status controls. If overnight/multi-day scheduling is proposed, obtain a business decision before extending the current single-date form.

**Acceptance:** Equal/reversed times cannot submit. Date/time/location edits retain rejected input. Confirming/rescheduling a conflicting karaoke booking gives an actionable reason and review/retry path. A local Pending Sync draft may remain changed while the accepted server record is unchanged; do not treat it as silently accepted. Other service lines must not be blocked by karaoke overlap rules.

### FE-03 — Preserve calculated payment status; complete validation

**Already delivered:** Booking detail has read-only calculated payment status and no manual payment-status override. Preserve that behavior.

**Remaining work:** Review all payment entry points for finite positive amounts, useful field errors, repeated clicks, and storage failures. Verify the newly added pending-payment labels and refreshed history, paid amount, balance, and status against accepted data. Coordinate rejected-payment reconciliation with the integration owner; an optimistic local total must not appear as an accepted receipt.

**Acceptance:** Unpaid cannot be changed to Fully Paid through a selector. Verify zero, partial, full, invalid, failed, pending, and repeated-click cases. Booking status remains independent of payment status.

### FE-04 — Loading, refresh, errors, and truthful save feedback

**Implemented in source:** [sync.js](../../js/sync.js) keeps synchronous cached API values and performs background reads. [sync-ui.js](../../js/sync-ui.js) now handles data-change rendering for more staff screens, including dashboard/reports, and displays `api-read-error` in the sync panel. Catalog handlers use the pending-save message rather than claiming server acceptance from a local mutation.

**Remaining work:** Audit each staff screen for initial-loading, empty, stale/offline, validation, access-denied, read-failure, storage-failure, and retry states. Verify background rerender preserves filters, page, selected month, and unsaved form input. Deduplicate repeated submissions on every mutation path. Keep “Saved on this device — Pending Sync” until acknowledgement; never imply server acceptance from a local return value.

**Architecture constraint:** Do not convert every cached `API.*` method into a promise or remove the existing outbox as the old handoff proposed. Use the existing `API.ready`, data-change/error events, and operation state; coordinate any adapter changes with the owner.

**Acceptance:** Cold-cache, delayed, empty, failed, offline, unauthorized, and successful loads are distinguishable. A record received in the background appears without navigating away. Pending and failed saves retain input and expose retry. Repeated clicks produce one intended mutation.

### FE-05 — Internal booking scope, branding, and staff access

**Implemented in source:** [index.html](../../index.html) and [app.js](../../js/app.js) no longer expose a public booking submission path. [config.js](../../js/config.js) and [login.html](../../admin/login.html) use AKAD titles. [admin.js](../../js/admin.js) signs in through PHP and uses a cached authenticated session for offline entry. Some prototype/customer-account terms and historical content may still need review.

**Remaining work:** Audit all public links and scripts to ensure no alternate customer booking path remains. Confirm owner-approved logo, contact details, service wording, and brochure content; do not invent content. Remove remaining customer-account terminology from staff workflows without deleting historical records. Test invalid credentials, expired session, first-use offline login, access denial, and owner/staff catalog visibility. Coordinate server session revocation with the owner: current logout clears the local marker.

**Acceptance:** Public controls cannot create local or live bookings. Staff booking entry remains available. Authentication is described accurately; first-time login requires connectivity. Expiry/access errors preserve pending records. Role visibility matches the server contract. No fabricated branding/contact content.

### FE-06 — Service/package selection and display

**Already delivered:** Manual booking supports one service radio and a service-filtered package selector, with package/add-on pricing. Do not rebuild it as a multiple-service form.

**Implemented in source:** Booking detail now uses `pack.package_name` in [bookings.html](../../admin/bookings.html), matching manual booking and the backend field. The earlier undefined-label defect is addressed in source.

**Remaining work:** Verify saved service/package and price after synchronization and reload. Complete catalog-loading/failure/retry states, clear incompatible selections, and preserve valid drafts. Confirm real Sweet Corner package content with the owner. Preserve historical multi-service prototype records and flag them for review rather than silently rewriting them. Package administration is additional scope unless the owner assigns it; the requirement is selection of fixed packages.

**Acceptance:** No undefined package labels. A package from another service cannot submit. Saved details match the selected package and amounts after reload. Empty/failed catalogs do not misleadingly imply no business packages or erase input.

### FE-07 — Negotiated payments, methods, and history

**Already delivered:** Manual booking has “Agreed down payment paid now” and records a payment with a negotiated-down-payment note. Neither down payment nor deposit has a mandatory minimum. A zero initial payment creates a Pending booking.

**Implemented in source:** [config.js](../../js/config.js) now offers GCash and MariBank, matching the method values accepted by [payments.php](../../api/payments.php). [payments.js](../../js/payments.js) shows payment notes and pending state. The earlier Cash/Bank Transfer/Other selector mismatch has been removed from the current staff form.

**Remaining work:** Confirm the GCash/MariBank wording with the owner, then verify selected method and payment notes after sync/reload. Distinguish down payment/reservation fee from balance payments in history, using the existing notes field unless the owner adds a structured purpose field. Verify amount, date, method, purpose, and pending state across accepted, failed, and offline records. Keep rental payments separate from deposits. Do not infer that selecting a method verifies an external transaction.

**Acceptance:** Agreed amounts below ₱1,000 are allowed. Payment purpose and accepted method remain clear after synchronization/reload. Invalid amounts show useful errors. Document any backend field/method changes as owner dependencies, not completed frontend fixes.

### FE-08 — Verify deposit and delivery workflows

**Already delivered:** Booking detail includes amount held, deduction, deduction reason, read-only refund preview, and local/sync deposit saving. Bounds and deduction reasons are validated; focused browser evidence confirmed ₱350 held − ₱50 deducted = ₱300 refundable.

**Remaining deposit work:** Show refund status and distinguish refundable amount from a refund actually released. Explain Pending Sync and server rejection. Repopulate accepted saved data without overwriting ongoing edits. Add deposit-at-creation entry only if needed by the agreed workflow; do not duplicate rental-payment entry.

**Implemented delivery workflow in source:** [bookings.html](../../admin/bookings.html) now has delivery method (self-pickup, Lalamove, owner-delivered), fee, and fee responsibility controls. [sync.js](../../js/sync.js) includes a delivery cache, API read, validation, and queued save using the backend `delivery_method`, `delivery_fee`, and `fee_shouldered_by` fields. This path still needs live save/reload, offline, conflict, and role/error checks.

**Acceptance:** Deduction above held amount or without a reason is rejected. Preview is not labeled as an executed refund. Delivery fields survive save/reload and remain separate from general pricing. Pending/failed delivery saves never claim acceptance. No payment/refund transfer is initiated.

### FE-12 — Preserve real offline sync; complete user feedback

**Already delivered:** Durable operation keys, account-bound queue, automatic sync/retry, acknowledgement-based removal, retained conflicts, IndexedDB snapshots, cached local assets, offline readiness indicator, a date/time conflict editor, and read-error display in the sync panel. Fourteen earlier integration checks and a focused browser outage workflow passed before the September 30 frontend merge.

**Remaining work:** Verify transport/read/storage/authentication feedback, including when the browser says Online but the server is unreachable. Give stale-edit conflicts enough current-server context to review before retrying; the queue retains `server_record`, but the editor still emphasizes date/time rather than showing a complete comparison. Review feedback for non-booking failures and dependent operations. Audit offline states on every screen, including the new delivery path. Do not overwrite edits during background refresh.

**Acceptance:** Entries remain Pending Sync until acknowledged. Conflicts and failed operations survive reload. Online-with-unreachable-server feedback is useful. Staff can tell what changed on another device before retrying a stale edit. No silent deletion of queued work. First-use offline/expired-session limitations are explained. Do not replace working uploads with simulated success or claim every queue/network meets the 30-second target from selected tests.

### FE-14 — Catalog/settings screen contracts

**Implemented in source:** [services.html](../../admin/services.html) now edits service name, description, and status, matching the fields persisted by [services.php](../../api/services.php). The earlier unsupported category/price/image/inclusions/featured service fields are no longer submitted by that form. Package pricing remains a separate contract.

**Remaining work:** Verify the simplified service form after live save/reload. Inventory every other editable screen field against its current backend contract: categories, add-ons, inventory, customers, gallery, website content, and settings. Identify unsupported fields in a contract checklist and coordinate whether to remove/disable them or have the owner extend persistence. Review identifier/type mappings, saved select values, Active/Inactive labels, refresh behavior, and deletion messages against actual database behavior.

**Acceptance:** Each field is either supported and verified after reload or explicitly identified as local/demo/unsupported. No success message falsely promises central persistence. Do not alter schema, add payment rules, or expand public-portal scope to satisfy a screen contract.

### FE-15 — Safely render user-entered values

**Implemented in source:** The shared escaping helper is now used for key booking-detail, calendar-peek, catalog-row, and payment-history text in [bookings.html](../../admin/bookings.html), [calendar.html](../../admin/calendar.html), and [payments.js](../../js/payments.js). This addresses the specific raw contact/location/name examples from the prior review; it is not a complete rendering audit.

**Remaining work:** Audit every remaining user-entered value in text, attributes, and URLs; fix any raw interpolation found. Review image/link URL handling separately. Preserve line breaks intentionally without inserting raw HTML. Include dialog close labels and icon-button names in the accessibility audit.

**Acceptance:** Names, notes, addresses, and catalog text containing quotes, angle brackets, ampersands, or markup render as text and do not execute. Approved image/link URLs render correctly; unsafe URLs are rejected according to the agreed policy.

## P2 — Complete interaction coverage and acceptance

### FE-02 — Return inspection persistence: preserve and expand regression

[inventory.js](../../js/inventory.js) restores saved quantities, conditions, and notes, including zero. Shortfalls are visible. Focused browser reload/sync checks confirmed zero/Missing/notes persisted, and backend integration rejected incomplete finalization.

**Remaining checks:** Partial quantities, damaged conditions, repeated saves without edits, multiple equipment rows, release/checklist actions, failed saves, and review by another connected client. Preserve saved exceptions. Do not list the old default-reset defect as untouched.

### FE-09 — Calendar navigation and freshness

[calendar.js](../../js/calendar.js) has service/status text, keyboard-addressable booking buttons, working additional-event expansion, and date indexing. `sync-ui.js` rerenders the calendar when data changes without changing its selected month.

**Remaining work/checks:** Verify five or more bookings on one date, all three services, preserved month, expand/collapse, focus after rerender, useful month-navigation/close labels, and failed-refresh feedback. Preserve the last available data and identify stale/offline state. Availability must remain based on accepted server decisions; local “Available” is provisional.

### FE-10 — Phone layouts and accessibility across all screens

Final return-form diagnostics passed at 375×812, 812×375, and 1366×900; manual booking also passed selected label/width checks. Those checks do not certify all pages or real devices.

**Remaining work:** Audit every staff page at those sizes and on physical phones. Check sidebar navigation, table columns/actions, modal scrolling, calendar readability, payment history, deposit/delivery controls, catalog forms, and reports. Verify keyboard-only completion, visible focus, modal focus/return, labels, icon-button names, error announcements, and usable touch targets. Do not rely on color alone.

**Acceptance:** Required controls remain reachable and readable without clipping. Staff can create a booking, save amounts, inspect items, and review a conflict using keyboard controls. Validate actual phone browsers and report the device/browser versions.

### FE-11 — Reports: definitions, freshness, and states

[dashboard.html](../../admin/dashboard.html) and [reports.html](../../admin/reports.html) compute figures from cached booking data. The existing unpaid-total and local month-key corrections should be preserved. [sync-ui.js](../../js/sync-ui.js) now rerenders both pages on data-change events, and the report labels its current event-date grouping basis.

**Remaining work:** Verify metrics/charts refresh when accepted data arrives and cached/offline and pending figures remain distinct. Agree whether “monthly income” should continue as paid amounts grouped by event date or change to receipts by payment date, and agree the reporting window. Verify loading, empty, failed, date-range validation, and retry states. Preserve most-booked-service and upcoming-booking views. Coordinate authoritative report integration with the owner rather than assuming cached calculations equal backend report definitions.

**Acceptance:** Unpaid contributes zero receipts under the existing basis. Compare filters, counts, amounts, and labels with agreed fixtures; include Asia/Manila month boundaries and payment/event dates in different months. Repeated refresh does not duplicate charts or lose the chosen range. Empty ranges are clear. Printing/export, if retained, uses the same report data and readable layout.

### FE-16 — Draft recovery and save consistency

Manual booking saves a draft per signed-in user and now explicitly stores/restores selected add-on IDs. If the booking saves but its initial payment fails, the form shows the saved booking ID and directs staff to retry payment from that booking. The booking and initial payment remain separate operations, so this recovery path needs testing.

**Remaining work:** Test customer/event/service/package/add-on choices and agreed amounts through reload and recoverable errors. Verify the partial-payment recovery path prevents duplicate booking creation and allows the payment retry. Review all modal reset/close/reopen paths and catalog refreshes for accidental draft loss. Keep user drafts separate from disposable fixtures and other users' drafts.

**Acceptance:** A restored draft matches all selections and amounts. Validation/storage/catalog failures retain editable input. Partial saves expose the existing booking and a payment retry path. Successful completion clears only the relevant draft.

### FE-17 — Frontend performance

Booking pagination (50 rows) and calendar date indexing already exist. The earlier 10,000-booking measurements were API timings; they did not establish complete frontend rendering responsiveness.

**Remaining work:** Measure initial usable render, searching/filtering, pagination, calendar expansion, modal opening, and report generation with representative cached data. Avoid unbounded DOM rows and rebuilding expensive charts on every event. Document data size/device/browser and visible delays. Coordinate server pagination/incremental sync with the owner; the approximately 10.4 MB full bookings refresh is a backend/adapter scaling dependency.

**Acceptance:** Record measured interaction times against an owner-agreed target. Do not invent a formal peak-performance threshold or claim local API benchmarks certify production phones.

## FE-13 — FR-10 blockouts: skipped

The user explicitly confirmed blockouts remain skipped at session close on September 28. No blockout schema, endpoint, queue support, or frontend was implemented. [Fix.md](../../Implementation/Fix.md) is a deferred draft with corrections needed, not an active assignment. Do not add block controls, fake customer bookings, or unavailable-period simulations to this handoff's delivery scope without renewed authorization.

## Developer deliverables and completion checklist

- [ ] A field/contract inventory identifying supported fields and backend-owner dependencies.
- [ ] Delivery controls verified after live save/reload and offline sync, with saved-value and pending/error behavior.
- [ ] Package label and payment method verified after reload; complete safe-rendering and truthful-save audits.
- [ ] Cold-cache/background-refresh/error checks for every staff screen.
- [ ] Regression evidence for preserved booking, payment, deposit, calendar, return, login, and offline behavior.
- [ ] Phone/landscape/desktop and keyboard checks, with device/browser, date, results, and unresolved defects.
- [ ] Reporting assumptions and figures validated against agreed fixtures/owner definitions.
- [ ] Draft recovery, duplicate-click prevention, partial-save recovery, and stale-conflict review checks.
- [ ] Public booking removal verified under WONT-01; owner-approved AKAD branding and content checked throughout.
- [ ] Screen list, changed files, test steps, screenshots where useful, and unresolved content/contract decisions.
- [ ] FR-10 remains skipped; no fixed down-payment/deposit minimum or gateway functionality introduced.

Mark a frontend task complete only when its assigned interface behavior and regression checks pass. The frontend developer may demonstrate blocked integration dependencies with explicitly labeled fixtures; live API/schema/backend work remains the project owner's responsibility. Existing live flows must remain intact. Report actual owner/staff usability, physical-device acceptance, and production performance as pending until those checks are performed.
