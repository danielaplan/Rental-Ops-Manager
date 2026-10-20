# Tester 2 — Scheduling, Conflicts, Statuses, and Cancellations

Read the [common instructions](../README.md) first. Record every result in the [Tester 2 report](Report.md); do not edit this instruction file while testing.

## Scenario 11 — Preparation and travel block availability

**Book:** `T2 Jon Allowance`, `09172000101`; February 2, 2027, 2:00–4:00 PM; Karaoke Setup — 12 Hours; preparation 30; travel 45; confirm.

**Steps:** Start another same-service booking at 1:45–2:15 PM. Try confirmation without approval. Move it to 5:00–6:00 PM and confirm.

**Expected:** First booking blocks 1:30–4:45 PM. Overlap warns and cannot confirm silently; free interval confirms.

## Scenario 12 — Exact adjacent boundary

**Book:** `T2 Kai Boundary A`, `09172000102`; February 4, 2027, 2:00–4:00 PM; preparation 30; travel 45; confirm.

**Steps:** Create `T2 Kai Boundary B`, `09172000103`, starting exactly 4:45 PM. Then change it to 4:44 PM.

**Expected:** 4:45 PM is available; 4:44 PM reports a one-minute overlap.

## Scenario 13 — Explicit single-conflict approval

**Book:** `T2 Lia Conflict A`, `09172000104`; February 6, 2:00–4:00 PM; confirm. Create `T2 Max Conflict B`, `09172000105`, same service/time.

**Steps:** Save B as Pending. Try confirming with no reason, then approve the listed overlap with `Owner approved separate equipment allocation`.

**Expected:** Blank reason fails. Correct conflicting reference is listed. Approval confirms and appears in Audit History.

## Scenario 14 — Approve all simultaneous conflicts

**Setup:** Create two Confirmed Karaoke bookings for February 8, 2:00–4:00 PM using approved overlap reasons.

**Book:** `T2 Nia Triple`, `09172000106`, same interval.

**Steps:** Attempt approval of only one displayed conflict, then approve the complete current list.

**Expected:** Partial approval fails. Full approval succeeds and Audit History identifies every overlap.

## Scenario 15 — Stale approval after schedule change

**Setup:** One Confirmed Karaoke booking on February 10, 2:00–4:00 PM. Start confirmation for an overlapping Pending booking.

**Steps:** After viewing the conflict, change the Pending booking to February 11 before submitting the old approval.

**Expected:** Old conflict list is rejected as stale. Free date confirms without obsolete approval.

## Scenario 16 — Reschedule Confirmed booking into conflict

**Book:** `T2 Olivia Reschedule`, `09172000107`, February 12, 2:00–4:00 PM; and another Confirmed Karaoke booking February 14, same time.

**Steps:** Reschedule Olivia to February 14. Save without approval, then provide an approval reason or choose a free interval.

**Expected:** Rescheduling rechecks allowances and never silently creates an unapproved overlap.

## Scenario 17 — Cancel Pending with required reason

**Book:** `T2 Paolo Cancel Pending`, `09172000108`; February 16, 10:00 AM–12:00 PM; leave Pending.

**Steps:** Cancel with blank reason, then with `Customer changed plans`. Refresh and test the same interval with a new draft.

**Expected:** Blank reason fails. Valid cancellation persists, remains in history, and releases availability.

## Scenario 18 — Cancel Confirmed and retain records

**Book:** `T2 Quinn Cancel Confirmed`, `09172000109`; February 18, 10:00 AM–12:00 PM; confirm and add a Completed ₱200 payment.

**Steps:** Cancel with `Event cancelled by customer`, refresh, inspect Payments, Audit History, and availability.

**Expected:** Booking stays Cancelled, payment remains linked, reason is audited, and schedule is free.

## Scenario 19 — Confirmed cannot return to Pending

**Book:** `T2 Rae Transition`, `09172000110`; February 20, 10:00 AM–12:00 PM; confirm.

**Steps:** Attempt to change it back to Pending through every visible status control; refresh.

**Expected:** Reverse transition is unavailable or rejected. Booking remains Confirmed; cancellation is the supported alternative.

## Scenario 20 — Cross-screen schedule consistency

**Use:** Any active Tester 2 booking; change its date to February 24, 2027, 3:00–5:00 PM with preparation/travel 20/30 under the permitted workflow.

**Steps:** Compare Bookings, Details, Calendar, availability warning, Dashboard, and Audit History after refresh.

**Expected:** All screens show the same reference, customer, schedule, status, and blocked interval. Old schedule no longer blocks availability.

## Scenario 45 — Overdue unreleased booking keeps blocking availability

**Purpose:** Verify equipment that has not been released back cannot be treated as available merely because the scheduled time passed.

**Setup:** Create and confirm `T2 Sela Overdue`, `09172000111`, for an approved past test interval using Karaoke. Do not complete release/return review.

**Steps:** Trigger normal reconciliation by opening Dashboard or Bookings. Attempt a new same-service booking whose blocked interval overlaps the overdue record.

**Expected:** The overdue booking becomes Awaiting Completion and continues to block the same service until the release workflow is completed.

## Scenario 46 — Released Awaiting Payment no longer blocks service

**Purpose:** Separate equipment availability from an unpaid financial balance.

**Setup:** Create `T2 Tomas Released Unpaid`, `09172000112`, for an approved past date. Confirm, release equipment, complete return review, but leave a rental balance so it becomes Awaiting Payment.

**Steps:** Attempt a new same-service booking for an interval that would have conflicted with the old booking. Refresh Calendar and Details.

**Expected:** The old booking remains Awaiting Payment, but its service/equipment is released and no longer blocks availability.

## Scenario 47 — Invalid status skips are rejected

**Purpose:** Ensure ordinary controls cannot bypass the approved lifecycle.

**Book:** `T2 Uli Status Guard`, `09172000113`; February 26, 2027; leave Pending.

**Steps:** Attempt every visible or editable path that could move Pending directly to Awaiting Completion, Awaiting Payment, or Completed. Confirm it normally, then attempt to skip the event/review requirements.

**Expected:** Invalid transitions are absent or rejected without partial review, release, payment, or history records. Only approved transitions remain possible.

## Scenario 48 — Cancellation restrictions across late lifecycle states

**Purpose:** Determine and verify cancellation behavior after operational work has begun.

**Setup:** Create separate synthetic bookings in Released/ongoing, Awaiting Completion, Awaiting Payment, and Completed states, using `T2 Vina Cancel State`, `09172000114`, as the base identity where permitted.

**Steps:** Attempt cancellation from each state. Refresh Booking Details, Payments, Checklist, Calendar, Reports, and Audit History after every attempt.

**Expected:** Only states permitted by the approved workflow can cancel. Rejected attempts make no changes. Any allowed cancellation preserves money, equipment, reason, and audit history consistently.

