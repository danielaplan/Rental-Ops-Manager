# AKAD frontend developer handoff

Updated: September 23, 2026.

Audience: frontend developer. Backend partner: PHP/MySQL developer.

Complete the staff interface using HTML, CSS, JavaScript, Bootstrap, and jQuery. Communicate with PHP through asynchronous AJAX requests. The backend owns MySQL persistence, authentication, authorization, final financial calculations, and scheduling enforcement. Use localStorage/IndexedDB for supported offline entries.

Payments are recorded after staff receive them externally. Build payment-entry and tracking controls; payment-gateway integration and automatic transfers are outside this work.

## Work order and task status

Start with P1, then P2. P3 is lower-priority workflow completion. Begin API coordination early so both developers can work in parallel.

- **Action required:** the inspected frontend needs the change described.
- **Corrected in source — retest:** the old defect's code has changed; run regression checks before closing it.
- **Shared integration work:** frontend work needs agreed backend behavior before end-to-end completion.
- **Needs clarification:** obtain the rule or interface decision from the backend partner before implementing that dependent behavior.

These assessments are based on source inspection on September 23, 2026. Browser results from the September 18 review are historical observations, not fresh test results. No new browser or backend acceptance tests were run for this handoff. The old coverage totals are retired because some findings have changed.

## P1 — Fix existing interactions and prepare integration

### FE-01 — Validate booking times and confirmation

**Status:** Action required; shared integration work. **Screens:** Manual Booking and Booking Details.

**Evidence:** In [manual-booking.html](../../admin/manual-booking.html), the time warning does not independently prevent submission through `createManualBooking()`. In [bookings.html](../../admin/bookings.html), the status-save handler calls `API.updateBooking()` without an availability check.

**Action:** Validate dates/times at submission. Reject equal or reversed times in the current single-date form. Request availability validation when creating, confirming, re-confirming, or rescheduling a booking. Provide a date/time/location edit flow using the same validation. Display rejected saves without losing entered values or claiming success.

**Backend dependency:** PHP validates again and prevents conflicts during the save, including concurrent requests. A successful preliminary availability check is insufficient. Obtain scheduling rules per service; do not apply the single-karaoke-unit rule to every service. Coordinate overnight/whole-day behavior before extending the current form.

**Acceptance:** Invalid ranges cannot submit. Cancel A, reserve its slot with B, then re-confirm A: display the backend conflict and leave A unconfirmed. A rejected edit retains the draft and last saved record.

### FE-02 — Restore saved return inspections

**Status:** Action required. **Screen:** Booking Details > Return Inspection.

**Evidence:** [inventory.js](../../js/inventory.js), `renderChecklist()`, defaults to expected quantity, Good, and empty notes despite saved return fields.

**Action:** Repopulate saved quantities, conditions, and notes. Preserve zero as a saved value; apply defaults only to unrecorded fields. Make quantity shortfalls visible.

**Backend dependency:** Agree on checklist identifiers, inspection fields, allowed conditions, and how quantity shortfalls affect inventory status.

**Acceptance:** Save zero returned, Missing, and a note; reopen/reload and verify all values. Saving again without edits preserves the exception. Repeat with a partial return.

### FE-03 — Display calculated payment status

**Status:** Action required for the interface; calculation corrected in source — retest. **Screens:** Booking Details and Payments.

**Evidence:** [api.js](../../js/api.js) now recalculates payment status on booking updates. [bookings.html](../../admin/bookings.html) still offers an editable payment-status selector.

**Action:** Replace that selector with a read-only value and stop submitting manual payment-status overrides. Refresh history, balance, and status after successful payment saves. Keep booking status separate.

**Backend dependency:** Use authoritative balances and payment status returned by PHP; agree on status values.

**Acceptance:** Staff cannot mark an unpaid booking Fully Paid using a selector. Verify zero, partial, and full payments. A failed payment save leaves saved totals unchanged. Do not assign the old override-calculation bug as an untouched task.

### FE-04 — Connect asynchronous data access

**Status:** Shared integration work. **Screens:** All staff screens.

**Evidence:** [api.js](../../js/api.js) currently returns synchronous values from [storage.js](../../js/storage.js). Page callers consume those values immediately.

**Action:** Centralize request handling in `js/api.js` and update callers to await responses. Add loading, empty, success, validation-error, and connection-error states. Prevent duplicate clicks while saving. Preserve input on failure, restore retry controls, and show success only after acceptance. Use clearly identified mocks behind the same agreed interface while endpoints are being built.

**Backend dependency:** Obtain endpoint URLs, methods, payloads, error examples, and session behavior. Agree on duplicate protection for retries; disabling a button alone cannot prevent duplicate server writes.

**Acceptance:** Test delayed/failing mock responses, retained input, and duplicate clicks, then repeat against PHP. Test a timeout after a possible server save using the agreed retry behavior.

### FE-05 — Keep booking entry internal and align staff access

**Status:** Action required; shared integration work. **Screens:** Homepage, Login, and staff navigation.

**Evidence:** [app.js](../../js/app.js) creates bookings from public submissions. [login.html](../../admin/login.html) uses demo authentication. [config.js](../../js/config.js) and [storage.js](../../js/storage.js) retain Fiesta & Co. defaults and customer-account terminology.

**Action:** Remove public submission paths that create bookings; retain staff booking entry. Apply supplied AKAD branding and remove Guest / Registered account controls from the rental workflow. Connect login/logout and handle invalid credentials, expired sessions, and access-denied responses. Any retained brochure content must not create bookings.

**Backend dependency:** PHP verifies credentials and authorizes protected operations. Confirm login fields/roles and obtain real business details. Hiding controls or setting a localStorage flag is not access control.

**Acceptance:** Public controls cannot submit bookings. Authorized staff can create them. Invalid credentials and expired sessions produce clear feedback without false save success.

## P2 — Complete staff workflows and shared capabilities

### FE-06 — Select a service and its package

**Status:** Action required; shared integration work. **Screens:** Manual Booking and Booking Details/edit.

**Evidence:** [manual-booking.html](../../admin/manual-booking.html) submits multiple `service_ids` and generic add-ons; no fixed-package selector exists.

**Action:** Support one service and one associated package per booking. Filter packages by service, clear incompatible selections, and show the package and price in summaries/details. Generic add-ons must not substitute for packages. Handle empty/failed catalog loads.

**Backend dependency:** Obtain confirmed package names/prices, catalog responses, identifiers, and booking payloads. Agree on handling existing multi-service prototype records; do not silently discard selections or rewrite records.

**Acceptance:** A package from another service cannot be submitted. Saved details display the returned service/package and amounts. Catalog failures preserve the draft and offer retry.

### FE-07 — Record down payments and payment history

**Status:** Action required; shared integration work; rules need clarification. **Screens:** Manual Booking, Booking Details, and Payments.

**Evidence:** Payment entry/history exists, but reservation/down payments are not explicitly distinguished from balance payments. Manual creation currently confirms bookings with zero payment.

**Action:** Add an explicit down-payment/reservation-fee classification using the agreed payload. Show amount, accepted method, payment date, and purpose in history. Validate inputs and display returned balances/statuses. Use the method list agreed with the backend partner.

**Backend dependency:** Confirm accepted payment methods, classification, and the P1,000 minimum down-payment rule, including exceptions and when confirmation requires it. Agree on excessive/invalid amount handling. Recording a method does not verify a wallet transaction.

**Acceptance:** Down payments and balance payments are distinguishable. Invalid amounts show clear errors. Failed saves do not alter history or balances. Confirmation follows the agreed payment rule.

### FE-08 — Add deposit and delivery controls

**Status:** Action required; shared integration work. **Screens:** Manual Booking and Booking Details/Return Inspection.

**Evidence:** Structured deposit/refund and delivery workflows are absent. Generic additional fees do not capture these details.

**Action:** Add amount held, deduction amount, required reason when deducting, refundable amount, and refund status. Separate deposits/refunds from rental payments. Add delivery method (self-pickup, Lalamove, owner-delivered), fee, and fee responsibility. Repopulate saved values. Display backend-calculated refunds; reconcile any local preview with the save response.

**Backend dependency:** Agree on record shape, support for multiple deposit/delivery records, deduction/refund rules, and renter-paid versus included-fee mapping.

**Acceptance:** Reject deductions without reasons or above the held amount. Valid deductions show the returned refund. Delivery fields survive reload. Failed saves do not claim success.

### FE-09 — Complete calendar navigation and refresh

**Status:** Action required; shared integration work. **Screen:** Calendar.

**Evidence:** [calendar.js](../../js/calendar.js) shows customer-only chips, limits days to three visible bookings, and renders inactive '+ more' text. Data is local without server refresh.

**Action:** Show service/status details using text as well as color. Make '+ more' open every booking for that day. Use keyboard-accessible controls. Add periodic AJAX refresh without resetting the selected month or issuing overlapping refresh requests; indicate refresh failures.

**Backend dependency:** Agree on response fields, filters, visible statuses, refresh interval, and refresh behavior after edits/sync.

**Acceptance:** A five-booking day exposes all five. Keyboard controls work. Failed refresh preserves the last successful view. Changes from another staff session appear within the agreed interval after integration.

### FE-10 — Improve phone layouts and accessibility

**Status:** Action required; fresh browser testing needed. **Screens:** Staff forms, calendar, and booking modal.

**Evidence:** [inventory.js](../../js/inventory.js) uses fixed-width controls and [admin.css](../../css/admin.css) has non-wrapping checklist rows. The September 18 review reported overflow at 375 x 812; this has not been retested.

**Action:** Stack/wrap each item's return controls on narrow screens. Associate field labels, quantities, conditions, and notes clearly. Provide keyboard actions, visible focus, and field-level errors. Keep input after validation failure.

**Backend dependency:** Agree on error keys so server validation maps to the correct fields.

**Acceptance:** At 375 x 812, phone landscape, and desktop widths, staff can inspect/save items without clipped controls. Complete booking/calendar actions by keyboard and verify useful focus behavior around dialogs and errors.

### FE-11 — Finish reporting and regression checks

**Status:** Corrected in source — retest; reporting definition needs clarification. **Screens:** Dashboard and Reports.

**Evidence:** [dashboard.html](../../admin/dashboard.html) now uses a local `monthKey()` and sums `amount_paid` without the full-total fallback. It still groups by event date and anchors the six-month window to the latest booking month when records exist.

**Action:** Preserve those fixes. Confirm the meaning of monthly income and the intended reporting window. Show backend report data with matching filters, labels, currency, loading, empty, and error states. Retain most-booked-service and upcoming-booking views.

**Backend dependency:** Agree on payment-date versus event-date reporting, included statuses, date range, and treatment of deposits/refunds. Obtain aggregate responses instead of independently redefining totals in each screen.

**Acceptance:** An unpaid booking contributes zero receipts. Test a month boundary in Asia/Manila and payment/event dates in different months. Compare displayed values with backend results, including an empty period. Do not list the corrected month-shift/unpaid-total bugs as unchanged defects.

### FE-12 — Support offline entry and sync feedback

**Status:** Shared integration work. **Screens:** Booking entry/edit, deposits, checklist, and sync/conflict feedback.

**Evidence:** Local storage exists, but no durable operation queue, reconnect sync, or conflict-review workflow was found. Core assets depend on external hosts.

**Action:** Persist supported offline changes across reloads. Provide offline, Pending Sync, syncing, synced, failed, and conflict states. Retry automatically after reconnection and retain rejected/conflicting changes for review. Coordinate local asset availability so supported screens reopen offline after setup.

**Backend dependency:** Agree on temporary IDs, operation IDs, queued-record dependencies, duplicate protection, session expiry, sync responses, and conflict resolution. A queued booking is not a server-confirmed reservation.

**Acceptance:** Create/update bookings, deposits, and checklist entries offline and verify retention after reload. With an available authenticated backend, valid queued changes upload automatically within 30 seconds of reconnection. Test two devices entering the same karaoke slot, retained conflicts, interrupted-response retries without duplication, and visibility on another session after refresh.

## P3 — Manage unavailable periods

### FE-13 — Add service/date blockouts

**Status:** Action required; shared integration work. **Screens:** Calendar and staff availability controls.

**Evidence:** No dedicated blockout workflow exists. Deactivating a service is not date-specific availability management.

**Action:** Add service, unavailable period, and reason controls. Distinguish blocks from customer bookings and provide API-permitted edit/remove actions. Show booking conflicts with blocked periods.

**Backend dependency:** Obtain blockout API/storage behavior, whole-day versus timed rules, permissions, and treatment of existing bookings. Do not create fake customer bookings to represent blocks.

**Acceptance:** Create, reload, edit, and remove a blockout. Reject a booking inside a blocked period. After removal, use the returned availability result.

## Frontend/backend agreement checklist

Complete each agreement before connecting its workflow. UI work can proceed with identified mock responses using the same agreed shape.

| Agreement | Frontend responsibility | Backend responsibility |
|---|---|---|
| Endpoints and lifecycle | Await responses, render states, use supplied methods/URLs | Supply endpoints and success/failure examples |
| Fields and IDs | Submit one service/package and map labels to agreed IDs | Define accepted fields, ID types, and validation |
| Status values | Use supported transitions; payment status is read-only | Return allowed transitions and calculated status |
| Date/time and money | Send agreed formats and use consistent labels | Define timezone, precision, parsing, and calculations |
| Saved results and errors | Render returned records, retain drafts, map field errors | Distinguish validation, conflict, session, and server errors |
| Authentication | Login/logout, expiry feedback, role-appropriate controls | Verify sessions and enforce authorization |
| Sync and retry | Preserve operation IDs and show retries/conflicts | Define duplicate protection and resolution behavior |
| Existing prototype records | Preserve records pending an agreed transition | Agree on import/migration or mock-data handling |

Do not assume every current option in `js/config.js` is accepted by PHP or that local IDs map directly to backend IDs. Do not invent endpoint URLs or silently translate unsupported statuses.

Resolve these with the backend partner: accepted payment methods, package names/prices, scheduling and blockout rules, down-payment exceptions, deposit/refund behavior, monthly-income definition, and login behavior. Keep the affected task marked Needs clarification until agreed; continue independent frontend work.

## Delivery and acceptance checklist

- [ ] P1 interactions fixed; existing calculation corrections regression-tested.
- [ ] Required forms display saved values and handle catalog failures, rejected input, and failed saves.
- [ ] Each finished task lists changed files, dependencies, test steps/results, and remaining decisions.
- [ ] Mock-response checks cover success, empty data, delays, validation errors, conflicts, and session expiry.
- [ ] Phone and keyboard checks cover booking, calendar, payments, and returns.
- [ ] PHP checks cover persistence after reload, authentication, final calculations, and duplicate-safe retry.
- [ ] Two-session checks cover simultaneous booking conflicts and calendar refresh.
- [ ] Offline checks cover reload retention, reconnect sync, rejected changes, and conflict review.
- [ ] Owners/staff usability and representative-volume performance are reported as unverified until tested.

Mark a task **Frontend ready** when its UI and mock-response checks pass. Mark it **Integrated** only after the PHP/MySQL workflow passes. Attach the test date and evidence, and distinguish unfinished backend dependencies from frontend defects.
