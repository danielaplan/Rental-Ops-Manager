# Tester 3 — Payments, Deposits, and Delivery

Complete [Tester 3 setup](Setup.md), then read the [common instructions](../README.md). Record every result in the [Tester 3 report](Report.md); do not edit this instruction file while testing.

## Scenario 21 — Partial and full Completed payments

**Book:** `T3 Sam Payments`, `09173000101`; March 2, 2027; Karaoke Setup — 12 Hours; total ₱999; confirm.

**Steps:** Add Completed ₱400, verify ₱599 balance; add Completed ₱599; refresh Payments and Details.

**Expected:** Payment state moves Partially Paid → Fully Paid and totals agree everywhere without duplicates.

## Scenario 22 — Pending and Failed payments do not reduce balance

**Book:** `T3 Toni Status`, `09173000102`; March 4; ₱999 booking.

**Steps:** Record ₱300 Pending and ₱200 Failed. Verify balance, then record Completed ₱999.

**Expected:** Balance stays ₱999 until Completed payment, then becomes zero. History retains all states.

## Scenario 23 — Correct a Completed payment

**Book:** `T3 Uma Correction`, `09173000103`; March 6; total ₱999; record Completed ₱500.

**Steps:** Correct to ₱450 with reason `Entered wrong amount`; refresh Payments, Details, Reports, and Audit History.

**Expected:** Balance changes ₱499 → ₱549. Old/new amounts and reason are audited; no second payment is created.

## Scenario 24 — Invalid payment corrections

**Book:** `T3 Vic Invalid Correction`, `09173000104`; March 8; total ₱999; Completed payment ₱250.

**Steps:** Try correction amount 0, negative, and blank reason; reopen after each. Then submit ₱275 with a reason.

**Expected:** Invalid attempts change nothing. Valid correction persists once and updates balance.

## Scenario 25 — Held deposit remains separate

**Book:** `T3 Wes Deposit`, `09173000105`; March 10; total ₱999; Completed payment ₱500.

**Steps:** Record held deposit ₱500. Refresh and reopen Details and Payments.

**Expected:** Rental paid remains ₱500 and balance ₱499. Deposit shows ₱500 held separately.

## Scenario 26 — Deposit deduction limit

**Book:** `T3 Yara Deduction`, `09173000106`; March 12; held deposit ₱300.

**Steps:** Add ₱200 deduction with item/reason. Attempt another ₱101. Refresh.

**Expected:** First deduction persists; second fails because only ₱100 remains. Refundable amount remains ₱100.

## Scenario 27 — Refund only the remaining deposit

**Book:** `T3 Zane Refund`, `09173000107`; March 14; deposit ₱500; deduction ₱125.

**Steps:** Refund the ₱375 balance. Retry refund and attempt a later deduction.

**Expected:** One refund is recorded. Duplicate refund and post-refund deduction are rejected or idempotent.

## Scenario 28 — Damaged-item deduction relationship

**Book:** `T3 Ari Damage Money`, `09173000108`; March 16; Karaoke booking; deposit ₱500; Completed payment ₱500.

**Steps:** Record a ₱100 deduction named for a fictional damaged checklist item. Compare deposit, payment, balance, and audit entries.

**Expected:** Refundable deposit becomes ₱400 while rental balance remains based only on rental payments.

## Scenario 29 — Save every delivery arrangement

**Book:** `T3 Bo Delivery`, `09173000109`; March 18; Sweet Corner Set A; rental total ₱250.

**Steps:** Save and reopen Self-pickup/Customer/₱100, then Lalamove/Included/₱200, then Owner-delivered/Owner/₱300. Use distinct notes.

**Expected:** Each latest method, responsibility, fee, and note persists. Delivery fee never changes the ₱250 rental total.

## Scenario 30 — Financial cross-screen consistency

**Book:** `T3 Cy Finance`, `09173000110`; March 20; total ₱1,274; Completed payments ₱500 + ₱774; deposit ₱400; deduction ₱75.

**Steps:** Refresh and compare Details, Payments, Dashboard, Reports, and Audit History.

**Expected:** Rental total ₱1,274, paid ₱1,274, balance ₱0, deposit ₱400, deductions ₱75, and refundable ₱325 remain distinct and consistent.

## Scenario 49 — Payment methods, references, and dates

**Book:** `T3 Dana Payment Fields`, `09173000111`; March 22, 2027; total ₱1,500; confirm.

**Steps:** Record valid GCash and MariBank payments with distinct references and valid dates. Then attempt an unsupported method, malformed/overlong reference, duplicate reference where prohibited, missing required value, and an invalid or future payment date.

**Expected:** Supported valid payments persist with their exact method/reference/date. Invalid attempts show a useful error and create no payment or revenue change.

## Scenario 50 — Overpayment and remaining-balance boundary

**Book:** `T3 Enzo Overpayment`, `09173000112`; March 24, 2027; total ₱999; record Completed ₱900.

**Steps:** Attempt Completed payments of ₱100, ₱99, and then another positive amount after the balance reaches zero. Refresh after each accepted action.

**Expected:** The application consistently enforces its approved overpayment policy. It never produces an unexplained negative balance, duplicate revenue, or contradictory status. The exact remaining ₱99 payment produces zero balance.

## Scenario 51 — Awaiting Payment to Completed

**Purpose:** Cover the full post-event path when a balance remains after return review.

**Book:** `T3 Fia Awaiting Payment`, `09173000113`; approved past date; total ₱1,000; Completed payment ₱400; confirm and complete required release/return review.

**Steps:** Verify the booking becomes Awaiting Payment with ₱600 balance. Record Completed ₱600, use the supported completion action, then refresh Details, Payments, Dashboard, Reports, Notifications, and Audit History.

**Expected:** Review changes the status to Awaiting Payment, final payment makes balance zero, and completion changes it to Completed exactly once. Notification and reports update consistently.

## Scenario 52 — Report filters, totals, and export consistency

**Setup:** Use `T3 Gino Report`, `09173000114`, plus Tester 3 records containing Completed, Pending, and Failed payments, deposits, deductions, refunds, balances, cancellations, and completed bookings.

**Steps:** Apply relevant date/status/service filters. Compare on-screen totals to source booking/payment records. Export each available report and compare row count, references, amounts, statuses, and date range.

**Expected:** Filters include only matching records. Collected revenue counts only Completed rental payments; deposits/deductions remain separate. Exported and on-screen results agree.

