# Tester 4 QA Report

## Test setup

- **Tester:** Codex (simulated manual QA)
- **Test date:** 2026-10-26
- **Laptop / browser:** Windows / Codex in-app Chromium browser (version not exposed)
- **QA database:** `akad_rentals_qa_t4`
- **Database baseline:** Git commit `a7bd4b9149f05815a2fdbf3033e4c57830c277bf`; clean seed counts verified: users 2, services 3, packages 12, addons 10, rental items 15, gallery 9, customers 0, bookings 0, payments 0.

## Results

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T4-S31-2026-10-26 | PASS | 1 | Four checklist rows and quantities stayed unchanged after refresh/reopen; no duplicates or omissions. |
| T4-S32-2026-10-26 | FAIL | 2 | T4-BUG-01 — No outgoing-condition or quantity fields; release saved once but created no matching item history. |
| T4-S33-2026-10-26 | PASS | 3 | Pending release created no record; first valid release saved once and repeat did not duplicate it. |
| T4-S34-2026-10-26 | FAIL | 4 | T4-BUG-02 — No outgoing quantity control, preventing oversized/exact quantity validation. |
| T4-S35-2026-10-26 | PASS | 5 | Quantity 2 against released 1 was rejected without Returned history; corrected 1 persisted. |
| T4-S36-2026-10-26 | FAIL | 6 | T4-BUG-03 — Short return marked Good finalized and moved to Awaiting Payment. |
| T4-S37-2026-10-26 | PASS | 7 | Only allowed conditions were offered and saved on the correct rows after reopen. |
| T4-S38-2026-10-26 | PASS | 8 | Fully paid return review completed; booking and database refreshed as Completed with one ₱999 payment. |
| T4-S39-2026-10-26 | FAIL | 5, 6 | T4-BUG-04 — Correct notification URLs did not open the requested booking modal/tab. |
| T4-S40-2026-10-26 | PASS | 13 | Offline booking/payment replayed once: one customer, booking, payment, seven checklist rows, zero pending operations. |
| T4-S53-2026-10-26 | PASS | 9 | One notification survived reloads without duplication and updated after review; read state is unsupported by the schema. |
| T4-S54-2026-10-26 | FAIL | 10, 14, 15 | T4-BUG-05 — Valid and overlapping offline drafts both committed as ordinary Pending bookings; no actionable conflict remained. Invalid blank-location data was blocked locally. |
| T4-S55-2026-10-26 | PASS | 11 | Offline edit, ₱100 payment, ₱200 deposit, and delivery update synced once. Actions not yet permitted were visibly disabled. |

## Problems found

### T4-BUG-01 — Release omits required condition, quantity, and item history

- **Scenario / Booking ID:** Scenario 32 / Booking 2
- **Severity:** High
- **What happened:** Checklist & Release displayed only one checkbox per item, with no outgoing-condition selector or outgoing-quantity input. Confirming release created one `item_releases` row but zero matching `item_history` rows after refresh.
- **Expected:** Incomplete condition/quantity attempts must fail without history; a completed release must create exactly one release and matching item history.
- **How to reproduce:** 1. Create and confirm the specified Karaoke booking. 2. Open Checklist & Release. 3. Observe each row has only a checkbox. 4. Check all rows and confirm release. 5. Refresh and inspect records; one release exists but item history is absent.
- **Retest needed:** Yes

### T4-BUG-02 — Outgoing quantity cannot be entered or validated

- **Scenario / Booking ID:** Scenario 34 / Booking 4
- **Severity:** High
- **What happened:** Rows display `Expected 1` or `Expected 2`, but no editable outgoing quantity exists. Expected + 1 cannot be tested and the exact released quantity cannot be stored.
- **Expected:** Above-expected quantity must be rejected without history; exact expected quantity must save.
- **How to reproduce:** 1. Create and confirm the specified booking. 2. Open Checklist & Release. 3. Inspect every item row. 4. Observe quantity is display-only. 5. Refresh/reopen; inputs remain absent.
- **Retest needed:** Yes

### T4-BUG-03 — Short return marked Good can be finalized

- **Scenario / Booking ID:** Scenario 36 / Booking 6
- **Severity:** High
- **What happened:** A row expected two units but returned one with condition Good. Final review stayed available and moved the booking to Awaiting Payment while a quantity-shortfall warning remained visible.
- **Expected:** A short return cannot finalize as Good/Inspected; Missing condition and documentation must be required.
- **How to reproduce:** 1. Confirm/release the booking and move it to an approved past date. 2. Enter full quantities except enter 1 for a row expecting 2. 3. Choose Good. 4. Save and complete final review. 5. Refresh; status is Awaiting Payment despite the shortfall.
- **Retest needed:** Yes

### T4-BUG-04 — Notification deep link does not open target booking/tab

- **Scenario / Booking ID:** Scenario 39 / Bookings 5 and 6
- **Severity:** Medium
- **What happened:** Bell links contained `booking_id=5&tab=return` and `booking_id=6&tab=payments`. Clicking changed the URL, but no booking modal opened and no requested tab was selected.
- **Expected:** Each notification must open its own booking on Return Inspection or Payments with matching customer/status/message.
- **How to reproduce:** 1. Prepare separate Awaiting Completion and Awaiting Payment bookings. 2. Open the bell. 3. Click either notification. 4. Observe the correct query string. 5. Wait/refresh; the list remains with no target modal/tab.
- **Retest needed:** Yes

### T4-BUG-05 — Offline overlapping draft loses actionable conflict classification

- **Scenario / Booking ID:** Scenario 54 / Bookings 10, 14, and 15
- **Severity:** High
- **What happened:** Booking 10 was Confirmed for April 24, 2027, 8:00 AM–8:00 PM. Offline bookings 14 (valid) and 15 (same service/date/time as booking 10) both committed once as ordinary Pending bookings. After reconnect the app showed `0 Pending Sync`, with no committed/conflict/failed grouping or actionable conflict. Blank required location was correctly blocked locally before queueing.
- **Expected:** Valid work must commit once while conflicting/failed entries remain actionable; corrected retries must not replay successes or duplicate records.
- **How to reproduce:** 1. Confirm a Karaoke booking for April 24, 2027, 8:00 AM–8:00 PM. 2. Disconnect. 3. Queue one non-overlapping draft and one draft matching the confirmed service/date/time. 4. Attempt a blank-location draft. 5. Reconnect and reconcile. 6. Refresh twice; both queued drafts are normal Pending server bookings and zero conflict entries remain.
- **Retest needed:** Yes

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 8 / 5 / 0 / 0
- **Bugs requiring retest:** T4-BUG-01, T4-BUG-02, T4-BUG-03, T4-BUG-04, T4-BUG-05
- **Overall result:** Checklist persistence, return limits, completion, notification deduplication, and ordinary offline replay work, but release validation/history, short-return enforcement, notification navigation, and offline conflict handling remain unsafe.

## Handoff

- [x] Temporary test records were restored.
- [x] FAIL and BLOCKED results have evidence.
- [ ] This report and the `Evidence/` files were committed and pushed.
