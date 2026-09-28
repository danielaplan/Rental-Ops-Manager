# AKAD frontend requirements review and developer handoff

Updated: September 28, 2026. Current source review; earlier September 18–24 findings are superseded where they differ below.

## Purpose and assignment boundary

Complete the internal staff interface using HTML, CSS, JavaScript, Bootstrap, and jQuery. This document is the current frontend work list, including remaining defects, missing workflows, completed work to preserve, and acceptance checks.

**Frontend developer:** screens, styling, interactions, accessible forms, client validation, retained drafts, loading/error feedback, and frontend regression checks. The project owner handles database/PHP changes and live API integration and backend verification. Coordinate interface contracts with the owner; identify dependency gaps instead of inventing backend behavior. Labeled fixtures may demonstrate missing interfaces, but do not replace existing live authentication or synchronization with mock implementations.

**Current authorization:** this handoff is documentation. The user instructed that frontend code must not be changed in this session. FR-10 blockouts remain **skipped**, including their frontend. This document does not authorize blockout implementation.

Payments are recorded after staff receive them externally. Payment gateways, transfers, and automatic verification are outside scope. Down payments and refundable deposits are separate amounts negotiated by the owner and client under admin control. **Neither has a fixed amount or a mandatory ₱1,000 minimum.**

## Sources and evidence limits

- [Official requirements](../../Documentation/AKAD_Requirements_Analysis_Documentation.md): FR-01–10, NFR-01–04, WONT-01.
- [Implementation and verification report](../../Implementation/Offline-Sync-Verification-2026-09-28.md): engineering changes, passed focused checks, and limitations.
- [Integration results](../../tests/offline-sync-results.json): 14 live PHP/MySQL checks.
- [Browser outage results](../../tests/browser-outage-results.json) and [layout results](../../tests/browser-layout-results.json): focused browser workflow and viewport checks.

This update inspected source; it did not run a new browser regression suite. Earlier September 28 results establish selected workflows only. Physical phones, all screens, full keyboard behavior, production peak load, and two-owner/one-staff usability are not certified.

## Work order

| Task | Priority | Current status | Requirements |
|---|---|---|---|
| FE-01 Booking validation and edit/confirmation feedback | P1 | Submission validation implemented; edit and conflict UX need completion | FR-01, FR-03 |
| FE-02 Restore return inspections | Preserve | Implemented; focused persistence checks passed | FR-09 |
| FE-03 Calculated payment status | Preserve/P1 | Read-only status implemented; refresh and amount validation need review | FR-04 |
| FE-04 Screen loading, refresh, errors, and truthful saves | P1 | Partially implemented; remaining screens need attention | FR-01–09, NFR-01 |
| FE-05 Internal scope, branding, and staff access | P1 | Public prototype paths/branding remain; real login already exists | WONT-01, NFR-03 |
| FE-06 Service/package selection and display | P1 | Selector implemented; detail mapping and catalog states need correction | FR-01, FR-05 |
| FE-07 Negotiated payments and history | P1 | Initial down-payment entry exists; labels/purpose/validation need alignment | FR-04 |
| FE-08 Deposit and delivery workflows | P1 | Deposit controls implemented; delivery controls missing | FR-06, FR-08 |
| FE-09 Calendar navigation and freshness | P2 | Labels/expansion/refresh implemented; complete regression and feedback | FR-02, FR-03 |
| FE-10 Phone and keyboard accessibility | P2 | Return layout checks passed; full interface/device audit remains | NFR-02, NFR-03 |
| FE-11 Reporting definitions and freshness | P2 | Local reports exist; definitions, refresh, and states need attention | FR-07 |
| FE-12 Offline and conflict feedback | P1/Preserve | Real queue/cache/sync implemented; error visibility and screen coverage remain | NFR-01 |
| FE-13 Service/date blockouts | Skipped | Explicitly deferred; do not implement | FR-10 |
| FE-14 Catalog/settings field contracts | P1 | Some screen fields exceed backend persistence contracts | Supporting workflows |
| FE-15 Safe rendering of user-entered values | P1 | Unescaped HTML interpolation remains | All relevant screens |
| FE-16 Draft recovery and save consistency | P2 | Manual draft support exists; additions and failure recovery need review | FR-01, NFR-01 |
| FE-17 Frontend performance | P2 | Pagination/date indexing implemented; broader measurement remains | NFR-04 |

Start with delivery, package display, save/error feedback, and field-contract issues. Complete the scope/branding cleanup and then the device, accessibility, reporting, and regression work. Do not redo passed work solely because the old review called it missing.

## P1 — Complete missing workflows and correct misleading states

### FE-01 — Booking validation, editing, and confirmation

**Evidence:** [manual-booking.html](../../admin/manual-booking.html) validates time order at submission and requires one service/package. New bookings start Pending. [bookings.html](../../admin/bookings.html) offers status changes but no normal date/time/location edit form. The sync panel provides date/time edits for rejected drafts.

**Remaining work:** Provide an ordinary booking edit workflow for required event fields, using the same validation and preserved input. Distinguish a locally saved change from server acceptance. Explain a confirmation conflict without falsely presenting the booking as accepted. Replace blocking generic alerts with accessible inline errors. If overnight/multi-day scheduling is proposed, obtain a business decision before extending the current single-date form.

**Acceptance:** Equal/reversed times cannot submit. Date/time/location edits retain rejected input. Confirming/rescheduling a conflicting karaoke booking gives an actionable reason and review/retry path. A local Pending Sync draft may remain changed while the accepted server record is unchanged; do not treat it as silently accepted. Other service lines must not be blocked by karaoke overlap rules.

### FE-03 — Preserve calculated payment status; complete validation

**Already delivered:** Booking detail has read-only calculated payment status and no manual payment-status override. Preserve that behavior.

**Remaining work:** Review all payment entry points for finite positive amounts, useful field errors, repeated clicks, and storage failures. Refresh history, paid amount, balance, and status consistently when accepted data arrives. Show pending payments distinctly from accepted payments. Coordinate rejected-payment reconciliation with the integration owner; an optimistic local total must not appear as an accepted receipt.

**Acceptance:** Unpaid cannot be changed to Fully Paid through a selector. Verify zero, partial, full, invalid, failed, pending, and repeated-click cases. Booking status remains independent of payment status.

### FE-04 — Loading, refresh, errors, and truthful save feedback

**Evidence:** [sync.js](../../js/sync.js) keeps synchronous cached API values and performs background reads. [sync-ui.js](../../js/sync-ui.js) handles data-change rendering for calendar/bookings, but does not provide equivalent page refresh handling for every catalog/customer/payment/dashboard/report screen. It also does not display every `api-read-error` or stored synchronization transport error. Several catalog handlers still toast “added/updated/deleted” immediately after local mutation.

**Remaining work:** Add consistent initial-loading, empty, stale/offline, validation, access-denied, read-failure, storage-failure, and retry states. Rerender the relevant page after its background data arrives while preserving filters, page, selected month, and unsaved form input. Disable or otherwise deduplicate repeated submissions. Use “Saved on this device — Pending Sync” until acknowledgement; never imply server acceptance from a local return value.

**Architecture constraint:** Do not convert every cached `API.*` method into a promise or remove the existing outbox as the old handoff proposed. Use the existing `API.ready`, data-change/error events, and operation state; coordinate any adapter changes with the owner.

**Acceptance:** Cold-cache, delayed, empty, failed, offline, unauthorized, and successful loads are distinguishable. A record received in the background appears without navigating away. Pending and failed saves retain input and expose retry. Repeated clicks produce one intended mutation.

### FE-05 — Internal booking scope, branding, and staff access

**Evidence:** [index.html](../../index.html) still loads [app.js](../../js/app.js), which calls `API.createBooking()` for public submissions; it does not load the staff sync adapter. This is a public local prototype path, not evidence of live server booking. [config.js](../../js/config.js) retains “Fiesta & Co.” and [login.html](../../admin/login.html) retains that title. Guest/Registered customer-account terminology remains in manual booking.

**Already delivered:** [admin.js](../../js/admin.js) signs in through PHP and uses a cached authenticated session for offline entry. Login is no longer purely mock.

**Remaining work:** Remove public booking creation controls/handlers under WONT-01; retain only approved brochure content. Apply owner-supplied AKAD name, logo, contact details, service wording, and titles. Remove customer-account wording from the staff rental workflow without deleting historical records. Improve invalid-credentials, expired-session, offline-first-login, and access-denied feedback. Show owner-only catalog actions appropriately for roles. Coordinate server session revocation with the owner: current logout clears the local marker.

**Acceptance:** Public controls cannot create local or live bookings. Staff booking entry remains available. Authentication is described accurately; first-time login requires connectivity. Expiry/access errors preserve pending records. Role visibility matches the server contract. No fabricated branding/contact content.

### FE-06 — Service/package selection and display

**Already delivered:** Manual booking supports one service radio and a service-filtered package selector, with package/add-on pricing. Do not rebuild it as a multiple-service form.

**Evidence requiring correction:** Booking detail uses `pack.name`, while manual booking uses `package_name` and the backend package field is `package_name`. [sync.js](../../js/sync.js) does not normalize package names to `name`. This can display an undefined package label.

**Remaining work:** Align the package display contract; show saved service/package and price consistently. Add catalog-loading/failure/retry states, clear incompatible selections, and preserve valid drafts. Confirm real Sweet Corner package content with the owner. Preserve historical multi-service prototype records and flag them for review rather than silently rewriting them. Package administration is additional scope unless the owner assigns it; the requirement is selection of fixed packages.

**Acceptance:** No undefined package labels. A package from another service cannot submit. Saved details match the selected package and amounts after reload. Empty/failed catalogs do not misleadingly imply no business packages or erase input.

### FE-07 — Negotiated payments, methods, and history

**Already delivered:** Manual booking has “Agreed down payment paid now” and records a payment with a negotiated-down-payment note. Neither down payment nor deposit has a mandatory minimum. A zero initial payment creates a Pending booking.

**Evidence:** [config.js](../../js/config.js) offers Cash, GCash, Bank Transfer, Other; official interview findings specify GCash/Maribank. Current sync maps several method labels, including Cash, to Maribank, while the direct payment endpoint differs. Method selection can therefore be displayed/persisted inconsistently.

**Remaining work:** Agree supported labels with the owner and align the frontend contract. Distinguish down payment/reservation fee from balance payments in history, using an agreed existing field such as notes unless the owner adds a structured purpose field. Show amount, date, method, purpose, and pending state. Keep rental payments separate from deposits. Do not infer that selecting a method verifies an external transaction.

**Acceptance:** Agreed amounts below ₱1,000 are allowed. Payment purpose and accepted method remain clear after synchronization/reload. Invalid amounts show useful errors. Document any backend field/method changes as owner dependencies, not completed frontend fixes.

### FE-08 — Preserve deposits; add delivery controls

**Already delivered:** Booking detail includes amount held, deduction, deduction reason, read-only refund preview, and local/sync deposit saving. Bounds and deduction reasons are validated; focused browser evidence confirmed ₱350 held − ₱50 deducted = ₱300 refundable.

**Remaining deposit work:** Show refund status and distinguish refundable amount from a refund actually released. Explain Pending Sync and server rejection. Repopulate accepted saved data without overwriting ongoing edits. Add deposit-at-creation entry only if needed by the agreed workflow; do not duplicate rental-payment entry.

**Missing delivery workflow:** No delivery controls or frontend delivery API methods were found in `admin/` or `js/`, although [delivery.php](../../api/delivery.php) supports the backend workflow. Add delivery method (self-pickup, Lalamove, owner-delivered), fee, and who pays/inclusion wording. The current backend uses `delivery_method`, `delivery_fee`, and `fee_shouldered_by` (`renter`/`owner`). Coordinate its frontend adapter and offline queue with the owner; generic Additional Fees is not delivery tracking.

**Acceptance:** Deduction above held amount or without a reason is rejected. Preview is not labeled as an executed refund. Delivery fields survive save/reload and remain separate from general pricing. Pending/failed delivery saves never claim acceptance. No payment/refund transfer is initiated.

### FE-12 — Preserve real offline sync; complete user feedback

**Already delivered:** Durable operation keys, account-bound queue, automatic sync/retry, acknowledgement-based removal, retained conflicts, IndexedDB snapshots, cached local assets, offline readiness indicator, and a date/time conflict editor. Fourteen integration checks and a focused real browser outage workflow passed.

**Remaining work:** Surface transport/read/storage/authentication failures clearly, including when the browser says Online but the server is unreachable. Give stale-edit conflicts enough current-server context to review before retrying; the queue retains `server_record`, but the editor currently emphasizes date/time rather than showing a complete comparison. Review feedback for non-booking failures and dependent operations. Audit offline states on remaining screens and coordinate delivery support. Do not overwrite edits during background refresh.

**Acceptance:** Entries remain Pending Sync until acknowledged. Conflicts and failed operations survive reload. Online-with-unreachable-server feedback is useful. Staff can tell what changed on another device before retrying a stale edit. No silent deletion of queued work. First-use offline/expired-session limitations are explained. Do not replace working uploads with simulated success or claim every queue/network meets the 30-second target from selected tests.

### FE-14 — Catalog/settings screen contracts

**Evidence:** [services.html](../../admin/services.html) submits category, generic service price, price label, image, inclusions, and featured fields. [services.php](../../api/services.php) and the service branch in `sync.php` persist only service name, description, and status. The form can therefore show fields as saved locally that are not persisted centrally. Service prices also differ conceptually from package pricing.

**Remaining work:** Inventory every editable screen field against its current backend contract: services, categories, add-ons, inventory, customers, gallery, website content, and settings. Identify unsupported fields in a contract checklist and coordinate whether to remove/disable them or have the owner extend persistence. Review identifier/type mappings, saved select values, Active/Inactive labels, and refresh behavior. Align deletion confirmations with actual database behavior; the service dialog currently promises records remain unlinked, which must be checked against owner-approved deletion semantics.

**Acceptance:** Each field is either supported and verified after reload or explicitly identified as local/demo/unsupported. No success message falsely promises central persistence. Do not alter schema, add payment rules, or expand public-portal scope to satisfy a screen contract.

### FE-15 — Safely render user-entered values

**Evidence:** The shared escaping helper handles quotes, but raw values are still interpolated into HTML in booking detail, calendar peek, catalog rows, and some payment output. Examples include contact/location/event text in `bookings.html` and customer/location text in `calendar.html`.

**Remaining work:** Use text setters or escaping consistently for text and attributes. Review image/link URL handling separately. Preserve line breaks intentionally without inserting raw HTML. Include dialog close labels and icon-button names in the accessibility audit.

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

[dashboard.html](../../admin/dashboard.html) and [reports.html](../../admin/reports.html) compute figures from cached booking data. The existing unpaid-total and local month-key corrections should be preserved. The dashboard/report pages are not covered by the same data-change rerender handler as calendar/bookings.

**Remaining work:** Refresh metrics/charts when accepted data arrives; identify cached/offline figures and pending local records. Agree whether “monthly income” means receipts by payment date or paid amounts grouped by event date, and agree the reporting window. Label the implemented basis accurately. Show loading, empty, failed, date-range validation, and retry states. Preserve most-booked-service and upcoming-booking views. Coordinate authoritative report integration with the owner rather than assuming cached calculations equal backend report definitions.

**Acceptance:** Unpaid contributes zero receipts under the existing basis. Compare filters, counts, amounts, and labels with agreed fixtures; include Asia/Manila month boundaries and payment/event dates in different months. Repeated refresh does not duplicate charts or lose the chosen range. Empty ranges are clear. Printing/export, if retained, uses the same report data and readable layout.

### FE-16 — Draft recovery and save consistency

Manual booking saves a draft per signed-in user, but dynamic add-on selections have no stable per-control draft IDs; review whether they actually restore. The current create flow records the booking and initial payment separately, so partial local failures need understandable recovery.

**Remaining work:** Preserve customer/event/service/package/add-on choices and agreed amounts through reload and recoverable errors. Prevent an initial-payment failure from encouraging duplicate booking creation. Review all modal reset/close/reopen paths and catalog refreshes for accidental draft loss. Keep user drafts separate from disposable fixtures and other users' drafts.

**Acceptance:** A restored draft matches all selections and amounts. Validation/storage/catalog failures retain editable input. Partial saves expose the existing booking and a payment retry path. Successful completion clears only the relevant draft.

### FE-17 — Frontend performance

Booking pagination (50 rows) and calendar date indexing already exist. The earlier 10,000-booking measurements were API timings; they did not establish complete frontend rendering responsiveness.

**Remaining work:** Measure initial usable render, searching/filtering, pagination, calendar expansion, modal opening, and report generation with representative cached data. Avoid unbounded DOM rows and rebuilding expensive charts on every event. Document data size/device/browser and visible delays. Coordinate server pagination/incremental sync with the owner; the approximately 10.4 MB full bookings refresh is a backend/adapter scaling dependency.

**Acceptance:** Record measured interaction times against an owner-agreed target. Do not invent a formal peak-performance threshold or claim local API benchmarks certify production phones.

## FE-13 — FR-10 blockouts: skipped

The user explicitly confirmed blockouts remain skipped at session close on September 28. No blockout schema, endpoint, queue support, or frontend was implemented. [Fix.md](../../Implementation/Fix.md) is a deferred draft with corrections needed, not an active assignment. Do not add block controls, fake customer bookings, or unavailable-period simulations to this handoff's delivery scope without renewed authorization.

## Developer deliverables and completion checklist

- [ ] A field/contract inventory identifying supported fields and backend-owner dependencies.
- [ ] Delivery controls and other assigned workflows, with saved-value and pending/error behavior.
- [ ] Package label correction, payment-method agreement, safe text rendering, and truthful save feedback.
- [ ] Cold-cache/background-refresh/error checks for every staff screen.
- [ ] Regression evidence for preserved booking, payment, deposit, calendar, return, login, and offline behavior.
- [ ] Phone/landscape/desktop and keyboard checks, with device/browser, date, results, and unresolved defects.
- [ ] Reporting assumptions and figures validated against agreed fixtures/owner definitions.
- [ ] Draft recovery, duplicate-click prevention, partial-save recovery, and stale-conflict review checks.
- [ ] Public booking paths removed under WONT-01 and approved AKAD branding applied.
- [ ] Screen list, changed files, test steps, screenshots where useful, and unresolved content/contract decisions.
- [ ] FR-10 remains skipped; no fixed down-payment/deposit minimum or gateway functionality introduced.

Mark a frontend task complete only when its assigned interface behavior and regression checks pass. The frontend developer may demonstrate blocked integration dependencies with explicitly labeled fixtures; live API/schema/backend work remains the project owner's responsibility. Existing live flows must remain intact. Report actual owner/staff usability, physical-device acceptance, and production performance as pending until those checks are performed.
