# Tester 3 QA Report

Follow the [Tester 3 setup](Setup.md), [scenario instructions](Instructions.md), [common instructions](../README.md), and [screenshot naming rules](Evidence/README.md). Edit only this report and files under `Evidence/`.

## Test setup

- **Tester:** Codex (simulated QA run)
- **Test date:** 2026-10-26
- **Laptop / browser:** Windows / ChatGPT in-app browser (Chromium; version not exposed)
- **Original QA database:** `akad_rentals_qa_t3`
- **Database baseline:** Git commit `a7bd4b9149f05815a2fdbf3033e4c57830c277bf`; required baseline row counts verified before testing
- **Fix-retest database:** isolated `akad_rentals_retest_t3` on 2026-10-26.

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
| T3-S30-2026-10-26 | PASS | Automated integration | Resolved T3-BUG-01 — Reports now receive and display held-deposit, refundable, and deduction totals separately. |
| T3-S49-2026-10-26 | PASS | 1 (retest) | Resolved T3-BUG-02 — future payment dates and invalid references are rejected before they can be queued. |
| T3-S50-2026-10-26 | PASS | 1 (retest) | Resolved T3-BUG-03 — Completed payments above the remaining balance are rejected; the exact remaining payment is accepted. |
| T3-S51-2026-10-26 | PASS | 14 | Awaiting Completion changed to Awaiting Payment with ₱600 due, then to Completed exactly once after final payment; audit and notification state updated. |
| T3-S52-2026-10-26 | PASS | 1 (retest) | Resolved T3-BUG-04 — revenue remains filtered by Completed-payment date; selected event-date ranges show matching package popularity. |

## Retest results

All previously reported Tester 3 defects were resolved and retested on 2026-10-26.

- **T3-BUG-01:** The focused finance integration test confirmed the Reports response exposes deposits held, refundable balances, and deduction totals separately.
- **T3-BUG-02:** The isolated browser retest rejected a future payment date before it entered Pending Sync. The focused finance integration test also rejects future dates and 151-character references at the server boundary.
- **T3-BUG-03:** The user-approved policy is to reject a Completed payment above the remaining balance. The isolated browser retest rejected ₱11 after a ₱90 payment on a ₱100 booking before sync; the exact remaining amount passes the shared server rule.
- **T3-BUG-04:** The Reports page keeps server-calculated payment-date revenue instead of substituting booking-date payment totals. The isolated browser retest showed the booking package in the selected March 2027 range.

The obsolete failure screenshots were removed because they show behavior that no longer exists after retest.

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 14 / 0 / 0 / 0
- **Bugs requiring retest:** None
- **Overall result:** All assigned Tester 3 scenarios now pass, including payment validation boundaries, held-deposit/deduction reporting, payment-date revenue, and package popularity.

## Handoff

- [ ] The isolated retest database remains available for inspection.
- [x] Obsolete FAIL evidence was removed after successful retest.
- [ ] This report and the `Evidence/` files were committed and pushed.
