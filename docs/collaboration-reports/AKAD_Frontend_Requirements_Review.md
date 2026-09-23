# AKAD frontend developer handoff

Updated: September 24, 2026.

Audience: frontend developer. Scope: frontend only.

Complete the staff interface using HTML, CSS, JavaScript, Bootstrap, and jQuery. Use local sample data and clearly labeled mock responses to demonstrate interface behavior. Use localStorage/IndexedDB for supported local drafts and offline entries.

**Responsibility boundary:** The project owner handles the database, PHP/backend implementation, and connecting the frontend to live APIs. The frontend developer delivers screens, styling, interactions, client-side validation, local draft behavior, and mock-data demonstrations. Live API integration and backend testing are not part of the frontend developer's assignment or completion criteria.

Throughout this handoff, saves and responses mean local demo records or mock responses. Demo authentication, availability, payments, and sync results must be clearly identified as simulations.

Payments are recorded after staff receive them externally. Build payment-entry and tracking controls; payment-gateway integration and automatic transfers are outside this work.

## Work order and task status

Start with P1, then P2. P3 is lower-priority workflow completion. All frontend tasks can be demonstrated without a running backend.

- **Action required:** the inspected frontend needs the change described.
- **Corrected in source — retest:** the old defect's code has changed; run regression checks before closing it.
- **Needs clarification:** obtain missing business content or UI decisions from the project owner; continue independent frontend work.

These assessments are based on source inspection on September 23, 2026. The September 24 revision changes assignment scope; it is not a new source or browser audit. Browser results from the September 18 review are historical observations, not fresh test results. The old coverage totals are retired because some findings have changed.

## P1 — Fix existing interactions and frontend data states

### FE-01 — Validate booking times and confirmation

**Status:** Action required. **Screens:** Manual Booking and Booking Details.

**Evidence:** In [manual-booking.html](../../admin/manual-booking.html), the time warning does not independently prevent submission through `createManualBooking()`. In [bookings.html](../../admin/bookings.html), the status-save handler calls `API.updateBooking()` without an availability check.

**Action:** Validate dates/times at submission. Reject equal or reversed times in the current single-date form. Provide a date/time/location edit flow using the same validation. Build pending, accepted, and conflict feedback for creating, confirming, re-confirming, and rescheduling using mock outcomes. Preserve input on rejection. Ask the project owner for intended overnight/whole-day form behavior before extending the current form.

**Acceptance:** Invalid ranges cannot submit. Simulated conflicts display a clear error and leave the last saved local record unchanged. A rejected edit retains the draft. Demonstrate each booking action with accepted and rejected mock outcomes.

### FE-02 — Restore saved return inspections

**Status:** Action required. **Screen:** Booking Details > Return Inspection.

**Evidence:** [inventory.js](../../js/inventory.js), `renderChecklist()`, defaults to expected quantity, Good, and empty notes despite saved return fields.

**Action:** Repopulate saved quantities, conditions, and notes. Preserve zero as a saved value; apply defaults only to unrecorded fields. Make quantity shortfalls visible.

**Acceptance:** Save zero returned, Missing, and a note; reopen/reload and verify all values. Saving again without edits preserves the exception. Repeat with a partial return.

### FE-03 — Display calculated payment status

**Status:** Action required for the interface; calculation corrected in source — retest. **Screens:** Booking Details and Payments.

**Evidence:** [api.js](../../js/api.js) now recalculates payment status on booking updates. [bookings.html](../../admin/bookings.html) still offers an editable payment-status selector.

**Action:** Replace that selector with a read-only value and stop submitting manual payment-status overrides. Refresh history, balance, and status after successful payment saves. Keep booking status separate.

Use consistent sample balances and status values in the demo. Financial enforcement is outside this frontend assignment.

**Acceptance:** Staff cannot mark an unpaid booking Fully Paid using a selector. Verify zero, partial, and full payments. A failed payment save leaves saved totals unchanged. Do not assign the old override-calculation bug as an untouched task.

### FE-04 — Build asynchronous mock data handling

**Status:** Action required. **Screens:** All staff screens.

**Evidence:** [api.js](../../js/api.js) currently returns synchronous values from [storage.js](../../js/storage.js). Page callers consume those values immediately.

**Action:** Centralize asynchronous mock data access in `js/api.js` and update callers to await mock responses. Add loading, empty, success, validation-error, conflict, and connection-error states. Prevent duplicate clicks while saving. Preserve input on failure, restore retry controls, and show demo success only after mock acceptance. Keep fixtures and scenario controls separate from screen rendering. No live requests or endpoint connection are required.

**Acceptance:** Test successful, empty, delayed, and failing mock responses, retained input, retry controls, and duplicate clicks. Document how to select each scenario. Verify one mock save per user action despite repeated clicks.

### FE-05 — Keep booking entry internal and align staff access

**Status:** Action required. **Screens:** Homepage, Login, and staff navigation.

**Evidence:** [app.js](../../js/app.js) creates bookings from public submissions. [login.html](../../admin/login.html) uses demo authentication. [config.js](../../js/config.js) and [storage.js](../../js/storage.js) retain Fiesta & Co. defaults and customer-account terminology.

**Action:** Remove public submission paths that create bookings; retain staff booking entry. Apply supplied AKAD branding and remove Guest / Registered account controls from the rental workflow. Build login/logout interactions and invalid-credentials, expired-session, and access-denied feedback using labeled mock states. Any retained brochure content must not create bookings. Request missing branding, business details, and login field/role labels from the project owner.

**Acceptance:** Public controls cannot create local demo bookings. Demo staff navigation reaches booking entry. Simulated login errors and session expiry produce clear feedback without false save success. Demo access must not be described as secure authentication.

## P2 — Complete staff interface workflows

### FE-06 — Select a service and its package

**Status:** Action required. **Screens:** Manual Booking and Booking Details/edit.

**Evidence:** [manual-booking.html](../../admin/manual-booking.html) submits multiple `service_ids` and generic add-ons; no fixed-package selector exists.

**Action:** Support one service and one associated package per booking. Filter packages by service, clear incompatible selections, and show the package and price in summaries/details. Generic add-ons must not substitute for packages. Handle empty/failed catalog loads.

**Content needed:** Use owner-supplied package names/prices or clearly labeled sample values. Preserve existing multi-service prototype records and flag them for review; do not silently discard selections or rewrite records.

**Acceptance:** A package from another service cannot be submitted. Saved details display the returned service/package and amounts. Catalog failures preserve the draft and offer retry.

### FE-07 — Record down payments and payment history

**Status:** Action required; business rules need clarification. **Screens:** Manual Booking, Booking Details, and Payments.

**Evidence:** Payment entry/history exists, but reservation/down payments are not explicitly distinguished from balance payments. Manual creation currently confirms bookings with zero payment.

**Action:** Add an explicit down-payment/reservation-fee classification. Show amount, method, payment date, and purpose in history. Validate required inputs and numeric amounts, and display sample balances/statuses from mock results. Obtain method labels and intended confirmation UI behavior from the project owner. Keep the proposed PHP 1,000 minimum down-payment rule and exceptions marked Needs clarification until confirmed. Recording a method must not imply transaction verification.

**Acceptance:** Down payments and balance payments are distinguishable. Invalid inputs show field-level errors. Failed mock saves do not alter history or balances. Demonstrate confirmation-allowed and confirmation-rejected feedback using labeled mock scenarios.

### FE-08 — Add deposit and delivery controls

**Status:** Action required. **Screens:** Manual Booking and Booking Details/Return Inspection.

**Evidence:** Structured deposit/refund and delivery workflows are absent. Generic additional fees do not capture these details.

**Action:** Add amount held, deduction amount, required reason when deducting, read-only refundable amount, and refund status. Separate deposits/refunds from rental payments. Add delivery method (self-pickup, Lalamove, owner-delivered), fee, and fee responsibility. Repopulate locally saved values. Display consistent mock refund results and label any local calculation as a preview. Request missing status labels and fee-responsibility choices from the project owner.

**Acceptance:** Reject deductions without reasons or above the held amount. Valid deductions show the returned refund. Delivery fields survive reload. Failed saves do not claim success.

### FE-09 — Complete calendar navigation and refresh feedback

**Status:** Action required. **Screen:** Calendar.

**Evidence:** [calendar.js](../../js/calendar.js) shows customer-only chips, limits days to three visible bookings, and renders inactive '+ more' text. Data is local without server refresh.

**Action:** Show service/status details using text as well as color. Make '+ more' open every booking for that day. Use keyboard-accessible controls. Refresh from the mock data source without resetting the selected month or issuing overlapping operations; indicate mock refresh failures. Refresh the local view after accepted demo edits.

**Acceptance:** A five-booking sample day exposes all five. Keyboard controls work. Failed mock refresh preserves the last successful view. Changed sample data appears after refresh without resetting the selected month.

### FE-10 — Improve phone layouts and accessibility

**Status:** Action required; fresh browser testing needed. **Screens:** Staff forms, calendar, and booking modal.

**Evidence:** [inventory.js](../../js/inventory.js) uses fixed-width controls and [admin.css](../../css/admin.css) has non-wrapping checklist rows. The September 18 review reported overflow at 375 x 812; this has not been retested.

**Action:** Stack/wrap each item's return controls on narrow screens. Associate field labels, quantities, conditions, and notes clearly. Provide keyboard actions, visible focus, and field-level errors. Keep input after validation failure.

Map mock validation errors to the correct fields for demonstration.

**Acceptance:** At 375 x 812, phone landscape, and desktop widths, staff can inspect/save items without clipped controls. Complete booking/calendar actions by keyboard and verify useful focus behavior around dialogs and errors.

### FE-11 — Finish reporting and regression checks

**Status:** Corrected in source — retest; reporting definition needs clarification. **Screens:** Dashboard and Reports.

**Evidence:** [dashboard.html](../../admin/dashboard.html) now uses a local `monthKey()` and sums `amount_paid` without the full-total fallback. It still groups by event date and anchors the six-month window to the latest booking month when records exist.

**Action:** Preserve those fixes. Ask the project owner for the intended monthly-income label, date basis, and reporting window. Show sample report data with matching filters, labels, currency, loading, empty, and error states. Retain most-booked-service and upcoming-booking views. Document sample assumptions while definitions remain undecided.

**Acceptance:** An unpaid sample booking contributes zero receipts in the existing local calculation. Test a month boundary in Asia/Manila and samples with payment/event dates in different months. Compare displayed values with documented fixtures, including an empty period. Do not list the corrected month-shift/unpaid-total bugs as unchanged defects.

### FE-12 — Support local offline entry and demonstrate sync states

**Status:** Action required. **Screens:** Booking entry/edit, deposits, checklist, and sync/conflict feedback.

**Evidence:** Local storage exists, but no durable operation queue, reconnect sync, or conflict-review workflow was found. Core assets depend on external hosts.

**Action:** Persist supported local offline entries across reloads. Provide offline, Pending Sync, syncing, synced, failed, and conflict views through a clearly labeled sync demonstration. Add retry and conflict-review controls that retain entered values. Make required local assets available so supported screens reopen offline after setup. Real local entries remain Pending Sync while no live connection exists; simulated success must not relabel them as uploaded.

**Acceptance:** Create/update local bookings, deposits, and checklist entries offline and verify retention after reload. Reopen supported screens offline after setup. Use separate mock fixtures to demonstrate sync progress, success, failure, retry, and conflict views. Verify that actual local entries remain pending and conflicts retain entered values. Real uploads, reconnect synchronization, and two-device checks are outside this frontend assignment.

## P3 — Build unavailable-period controls

### FE-13 — Add service/date blockouts

**Status:** Action required. **Screens:** Calendar and staff availability controls.

**Evidence:** No dedicated blockout workflow exists. Deactivating a service is not date-specific availability management.

**Action:** Add service, unavailable period, and reason controls with client-side required-field and date/time validation. Distinguish blocks from customer bookings and provide local demo create/edit/remove actions. Show mock blocked-period conflict feedback. Do not create fake customer bookings to represent blocks. Obtain intended whole-day/timed form behavior from the project owner.

**Acceptance:** Create, reload, edit, and remove a local demo blockout. Verify distinct calendar styling and accessible labels. Simulated booking rejection preserves the draft and explains the conflict. Successful mock outcomes update the local view.

## Frontend handoff materials

- Document mock fixture fields, sample values, and how to run success/error scenarios.
- List implemented screens/controls, changed files, and browser test results.
- List unresolved business content/UI decisions and identify sample assumptions.
- Explain local draft storage, demo-data setup, and offline behavior.
- Keep real local drafts separate from disposable mock scenario data.

## Delivery and acceptance checklist

- [ ] P1 interactions fixed; existing calculation corrections regression-tested.
- [ ] Required forms display saved values and handle catalog failures, rejected input, and failed saves.
- [ ] Each finished task lists changed files, test steps/results, and remaining UI decisions.
- [ ] Mock-response checks cover success, empty data, delays, validation errors, conflicts, and session expiry.
- [ ] Phone and keyboard checks cover booking, calendar, payments, and returns.
- [ ] Dashboard/report values match documented sample fixtures and labels.
- [ ] Offline checks cover screen availability, reload retention, pending local entries, and simulated sync/conflict feedback.
- [ ] Demo behavior is clearly identified and does not claim real authentication, confirmed reservations, verified transactions, or server uploads.
- [ ] Owners/staff usability and representative-volume performance are reported as unverified until tested.

Mark a task **Frontend complete** when its UI, local behavior, and mock-response checks pass. Attach the test date and evidence. The project owner handles database work, backend implementation, live API connection, and integration testing separately; none is required for the frontend developer to complete this handoff.
