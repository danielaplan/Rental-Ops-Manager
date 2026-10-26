# Tester 3 QA Report

Follow the [Tester 3 setup](Setup.md), [scenario instructions](Instructions.md), [common instructions](../README.md), and [screenshot naming rules](Evidence/README.md). Edit only this report and files under `Evidence/`.

## Test setup

- **Tester:** Codex (simulated QA run)
- **Test date:** 2026-10-26
- **Laptop / browser:** Windows / ChatGPT in-app browser (Chromium; version not exposed)
- **QA database:** `akad_rentals_qa_t3`
- **Database baseline:** Git commit `a7bd4b9149f05815a2fdbf3033e4c57830c277bf`; required baseline row counts verified before testing

## Results

For every row:

- Replace `YYYY-MM-DD` with the date you ran that scenario.
- Enter `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` under **Result**.
- After saving, open **Bookings** and copy the visible Booking ID from the first column or booking-detail title. Enter `N/A` if no booking was created.
- Under **Notes / Bug ID**, briefly explain the result. For a failure, include its Bug ID, such as `T3-BUG-01 — Payment total was incorrect`.

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T3-S21-2026-10-26 | PASS | 1 | Partial payment left ₱599, then the second Completed payment produced ₱0 balance and Fully Paid after refresh, with no duplicate records. |
| T3-S22-2026-10-26 | PASS | 2 | Pending and Failed payments remained in history without reducing the ₱999 balance; the Completed ₱999 payment cleared it. |
| T3-S23-2026-10-26 | PASS | 3 | Correction persisted as ₱450 with ₱549 balance; the original amount, corrected amount, and reason were audited against one payment record. |
| T3-S24-2026-10-26 | PASS | 4 | Zero, negative, and blank-reason correction attempts made no change; one valid ₱275 correction persisted. |
| T3-S25-2026-10-26 | PASS | 5 | Rental paid remained ₱500 with ₱499 balance while the ₱500 held deposit stayed separate after reopen. |
| T3-S26-2026-10-26 | PASS | 6 | The ₱200 deduction persisted; a further ₱101 was rejected because only ₱100 remained refundable. |
| T3-S27-2026-10-26 | PASS | 7 | One ₱375 refund persisted; refund and deduction actions were disabled afterward, preventing duplicate or post-refund changes. |
| T3-S28-2026-10-26 | PASS | 8 | The deduction reduced refundable deposit to ₱400 without changing rental paid ₱500 or rental balance ₱499; audit entries remained distinct. |
| T3-S29-2026-10-26 | PASS | 9 | All three delivery arrangements persisted after reopen, and the rental total remained ₱250. |
| T3-S30-2026-10-26 | FAIL | 10 | T3-BUG-01 — Reports showed zero deposits and deductions while Details and Audit showed ₱400 held, ₱75 deducted, and ₱325 refundable. |
| T3-S49-2026-10-26 | FAIL | 11 | T3-BUG-02 — A future-dated Completed payment was accepted and audited; an overlong reference was queued instead of receiving a useful validation error. |
| T3-S50-2026-10-26 | FAIL | 12 | T3-BUG-03 — A ₱100 payment was accepted after ₱900 on a ₱999 booking, producing ₱1,000 paid with a zero balance. |
| T3-S51-2026-10-26 | PASS | 14 | Awaiting Completion changed to Awaiting Payment with ₱600 due, then to Completed exactly once after final payment; audit and notification state updated. |
| T3-S52-2026-10-26 | FAIL | 13 | T3-BUG-04 — Report date filters, revenue, deposit/deduction totals, and package popularity disagreed with the source booking and payment records. |

## Problems found

If there are no application bugs, delete the example below. For every bug, copy the example once and replace the heading and blank fields.

| Field | What to enter |
| --- | --- |
| **Scenario / Booking ID** | Copy the scenario number from `Instructions.md`. After saving, find the Booking ID in the first column of **Bookings** or in the booking-detail title. Example: `Scenario 21 / Booking 16`. Use `N/A` if no booking was created. |
| **Severity** | `Critical` for data loss, security exposure, or a major money error; `High` when a main workflow cannot continue safely; `Medium` when a workaround exists or screens materially disagree; `Low` for wording, layout, or another minor issue. Judge impact, not repair difficulty. |
| **What happened** | Describe the actual incorrect behavior, affected data or status, exact error message, and whether it remained after refresh or reopen. Do not write only “It did not work.” |
| **Expected** | Copy or summarize what the scenario's **Expected** section says should have happened. |
| **How to reproduce** | Write numbered steps with the starting condition, test data, controls used, save/refresh actions, and the exact step where the problem appears. Another tester should be able to repeat it without asking questions. |
| **Retest needed** | Enter `Yes` when the scenario must be run again after a fix. Enter `No` only when no repair verification is required. |

Save screenshots only in [`Evidence/`](Evidence/README.md). For a bug, use `T3-S<scenario>-BUG-<number>-<description>-<image-number>.png`, such as `T3-S21-BUG-01-payment-total-incorrect-01.png`. Do not paste or link the screenshot in this report.

### T3-BUG-01 — Deposit and deduction totals disagree across screens

- **Scenario / Booking ID:** Scenario 30 / Booking 10
- **Severity:** Medium
- **What happened:** After refresh, Booking Details and Audit History showed rental total ₱1,274, paid ₱1,274, balance ₱0, deposit ₱400, deduction ₱75, and refundable deposit ₱325. Reports instead showed Deposits held ₱0, Deductions 0 · ₱0, and Refunds available ₱0. The disagreement remained after reopening Reports.
- **Expected:** Rental payments, deposit, deduction, and refundable balance should remain distinct and show the same values in Details, Payments, Dashboard, Reports, and Audit History.
- **How to reproduce:**

  1. Create and confirm a ₱1,274 booking.
  2. Record Completed rental payments of ₱500 and ₱774.
  3. Record a held deposit of ₱400 and a deduction of ₱75.
  4. Refresh and confirm the correct values in Booking Details and Audit History.
  5. Open Reports and observe that all deposit and deduction totals are zero.

- **Retest needed:** Yes

### T3-BUG-02 — Future payment date is accepted

- **Scenario / Booking ID:** Scenario 49 / Booking 11
- **Severity:** High
- **What happened:** The application accepted a Completed ₱100 payment dated 2027-01-01 with reference `T3S49-FUTURE`, created payment record 14, added a `payment_recorded` audit entry, and changed financial data. An overlong 151-character reference was also shown as "Saved on this device. Pending Sync until accepted" instead of receiving a useful validation error. Supported GCash and MariBank payments with valid references and dates persisted correctly.
- **Expected:** Invalid or future payment dates and malformed or overlong references should show useful errors and must not create payments or change revenue.
- **How to reproduce:**

  1. Create and confirm a ₱1,500 booking.
  2. Record valid GCash and MariBank payments with distinct references and valid dates; verify they persist.
  3. Add a Completed ₱100 payment dated 2027-01-01 with reference `T3S49-FUTURE`.
  4. Save and refresh the booking.
  5. Observe that the future-dated payment persists in payment history and Audit History and changes the paid amount.
  6. Separately submit a payment with a 151-character reference and observe the pending-sync message instead of a validation error.

- **Retest needed:** Yes

### T3-BUG-03 — Completed payment can exceed the remaining balance

- **Scenario / Booking ID:** Scenario 50 / Booking 12
- **Severity:** High
- **What happened:** After a Completed ₱900 payment on a ₱999 booking, the application accepted another Completed ₱100. After refresh, Details showed Paid ₱1,000, Balance ₱0, and Fully Paid. Audit History retained both payments, so the paid total exceeded the booking total by ₱1 while the balance was clamped to zero.
- **Expected:** The application should enforce a clear overpayment policy. The exact remaining ₱99 should produce a zero balance, and an unexplained overpayment or contradictory financial state must not be created.
- **How to reproduce:**

  1. Create and confirm a ₱999 booking.
  2. Record a Completed payment of ₱900 and verify that ₱99 remains.
  3. Record another Completed payment of ₱100.
  4. Refresh Details and Audit History.
  5. Observe Paid ₱1,000, Balance ₱0, and two accepted payment records on a ₱999 booking.

- **Retest needed:** Yes

### T3-BUG-04 — Report filters and financial totals do not match source records

- **Scenario / Booking ID:** Scenario 52 / Booking 13
- **Severity:** High
- **What happened:** Filtering Reports to March 1–31, 2027 showed 13 bookings but Total Revenue ₱6,997 even though the Completed payment dates were in October 2026 and the page states that collected revenue uses Completed-payment dates. Reports also showed Deposits held ₱0, Refunds available ₱0, and Deductions 0 · ₱0 despite recorded deposits, deductions, and a refund. Package Popularity said there were no package bookings although the matching bookings had packages. The export comparison was not continued after the on-screen totals had already failed.
- **Expected:** Date, status, and service filters should include only matching records; collected revenue should use Completed payment dates; deposits and deductions should remain separate; package popularity and exports should agree with the filtered source records.
- **How to reproduce:**

  1. Use the Tester 3 records with March 2027 booking dates and October 2026 Completed payment dates, including held deposits, deductions, a refund, and package bookings.
  2. Open Reports and set the date range to 2027-03-01 through 2027-03-31.
  3. Apply the filter and compare the displayed booking count and revenue to booking and payment records.
  4. Compare the deposit, deduction, refund, and package-popularity sections to Booking Details and Audit History.
  5. Observe revenue attributed to the booking-date range, zero deposit/deduction/refund figures, and no package bookings.

- **Retest needed:** Yes

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 10 / 4 / 0 / 0
- **Bugs requiring retest:** T3-BUG-01, T3-BUG-02, T3-BUG-03, T3-BUG-04
- **Overall result:** Core payment, deposit, refund, delivery, and completion flows are usable, but payment validation boundaries and financial reporting require fixes and retesting.

## Handoff

- [ ] Temporary test records were restored.
- [x] FAIL and BLOCKED results have evidence.
- [ ] This report and the `Evidence/` files were committed and pushed.
