# Final Hostinger Testing — Final Scenarios

	Complete these scenarios in order. Record every result in [Report.md](Report.md). Screenshots are required for FAIL and BLOCKED outcomes.

## F01 — Hosting, HTTPS, and owner sign-in

**Use:** The deployed Hostinger URL and an authorized owner account.

**Steps:**

1. Open the public site using `https://`.
2. Try the equivalent `http://` address; it must redirect to HTTPS or be unavailable.
3. Sign in through the owner login page, refresh Dashboard, then sign out and sign in again.
4. Confirm the browser never shows a certificate warning, mixed-content warning, PHP warning, or database error.

**Expected:** HTTPS is enforced, authentication works, and protected admin pages require a valid owner session.

## F02 — Public catalog and gallery

**Steps:**

1. Open the public website in a private/incognito window.
2. Confirm services, packages, gallery, and business content load.
3. Sign in as owner and upload one approved non-sensitive image under 5 MB.
4. Confirm the uploaded image appears where expected, then remove/archive it only if the owner approves cleanup.

**Expected:** Public content loads without admin data; gallery upload works without exposing an error, executable file, or a broken image.

## F03 — Create, refresh, and reuse customer bookings

**Use:** A and B from [Sample Data](Sample-Data.md).

**Steps:**

1. Create A as Pending. Record its Booking ID.
2. Refresh Bookings, reopen A, and compare customer, package, total, schedule, venue, and status with Calendar and Customers.
3. Create a second booking for A on a different free date/time, selecting the existing customer instead of creating another customer.
4. Create B as a separate customer booking.

**Expected:** Each booking exists once, A has one customer profile with two bookings, and values match across screens after refresh.

## F04 — Availability, conflict approval, and cancellation

**Use:** C, D, and H.

**Steps:**

1. Confirm C.
2. Create D as Pending, then remain on **Admin → Bookings** and open D's booking details.
3. In **Details → Booking Status**, choose **Confirmed** and select **Save Booking**. The server must show the conflicting booking instead of confirming silently.
4. In the conflict-approval panel that appears below the status controls, enter `HST FINAL — approved test overlap`, then select **Approve listed overlaps and confirm**. This approval must be performed while online.
5. Refresh Details, Calendar, and Audit History for C and D.
6. Create H, add its ₱200 payment, then cancel it using the stated test reason.
7. Attempt a new same-service booking in H’s old interval.

**Expected:** The conflict cannot confirm silently; approved conflict evidence is recorded; cancellation retains payment/audit history and releases the cancelled interval.

## F05 — Payments and overpayment boundary

**Use:** E and the amounts in [Sample Data](Sample-Data.md).

**Steps:**

1. Create and confirm E.
2. Record the ₱400 Completed payment. Refresh and verify the balance is ₱599.
3. Record the exact ₱599 Completed payment. Refresh and verify the balance is ₱0.
4. Attempt one additional Completed ₱1 payment.
5. Compare Details, Payments, Dashboard, Reports, and Audit History.

**Expected:** Partial and full payments calculate correctly. The ₱1 overpayment is rejected and creates no payment or revenue record.

## F06 — Held deposit, deduction, and refund

**Use:** F and the amounts in [Sample Data](Sample-Data.md).

**Steps:**

1. Create F and record the completed rental payment and held deposit.
2. Add the ₱100 deduction with a fictional affected item and the supplied reason.
3. Refund exactly ₱200. Try to refund again.
4. Refresh Details, Payments/Deposits, Reports, and Audit History.

**Expected:** Rental balance and deposit balance stay separate. Only the remaining deposit is refundable; the second refund is rejected or safely ignored.

## F07 — Delivery details stay separate from rental total

**Use:** G.

**Steps:**

1. Create G.
2. Save a delivery arrangement with a method, responsibility, fee, and note such as `HST FINAL delivery test`.
3. Reopen and change all four values once.
4. Refresh and compare Details and Audit History.

**Expected:** Delivery details persist, but the delivery fee does not silently change the agreed rental total.

## F08 — Validation and duplicate-submit protection

**Use:** a new fictional customer named `HST FINAL Validation`.

**Steps:**

1. Attempt equal start/end times and reversed times. Correct them.
2. Attempt one name or location longer than its visible field limit. Correct it.
3. Submit one valid booking once; do not intentionally spam a live production button.
4. If the response is slow or unclear, search Bookings and Customers before submitting again.

**Expected:** Invalid data creates no partial customer, booking, or pending-sync record. The valid booking is created exactly once.

## F09 — Checklist, release, return, and completion

**Use:** I. Only use a past date that the owner approves; never alter the server clock.

**Steps:**

1. Create and confirm I. Verify its checklist appears once with expected quantities.
2. Try releasing with one required condition or quantity incomplete, then complete all required fields and release once.
3. Open return review. Attempt a returned quantity above the released quantity; correct it.
4. Record condition and notes for every item, then finalize the review.

**Expected:** Invalid release/return attempts create no partial history. A valid release and return each create one correct history trail. If paid in full, the booking can reach Completed.

## F10 — Awaiting Payment after return review

**Use:** I if an unpaid balance remains, or a separate approved past-date record.

**Steps:**

1. Ensure the booking has completed return review but has a visible remaining rental balance.
2. Verify it becomes Awaiting Payment and creates the appropriate notification.
3. Record exactly the remaining Completed payment.
4. Complete the permitted final action and refresh all related screens.

**Expected:** Equipment is no longer blocked after return review; money remains outstanding until paid; the final payment and completion happen exactly once.

## F11 — Reports, audit history, and notifications

**Use:** Records A–I.

**Steps:**

1. Apply report date/status/service filters that include only the final-test records.
2. Compare collected revenue with the Completed rental payments only. Confirm deposits, deductions, and refunds remain separate.
3. Open each available notification and verify it opens the correct booking and tab.
4. Inspect Audit History for booking creation, conflict approval, payment, cancellation, release, return, and delivery actions.

**Expected:** Totals and records agree across source screens, reports, notifications, and audit history.

## F12 — Offline save and synchronization

**Use:** J, a physical phone or second supported browser, and a stable way to disconnect/reconnect that device.

**Steps:**

1. While signed in and fully loaded, disconnect only the testing device.
2. Create J once in **Manual Booking**. Enter an intended ₱400 down payment and select its method before saving.
3. Confirm J is an **Offline draft / Pending Sync**. Confirm the ₱400 is labelled as an intended payment reminder, is not present in payment history, and does not increase paid totals or revenue. Payment and other online-only controls must be disabled.
4. Reconnect. Wait for automatic synchronization, then select **Refresh data and sync** twice. Confirm J receives one official Booking ID and the reminder follows that booking.
5. While online, open J's **Payments** tab and record the ₱400 Completed payment once using reference `HST-F12-INTENT`.
6. Refresh, then inspect Bookings, Customers, Payments, Checklist, Dashboard/Reports, and Audit History.

**Expected:** The Pending unpaid booking draft reaches the server exactly once. Local and server IDs link correctly; no duplicate customer, booking, or checklist appears. The intended payment is never counted while offline; after it is recorded online exactly one accepted payment appears and the reminder clears.

## F13 — Backup, scheduler, and recovery check

**Owner/host task:** Do this with Hostinger backup tools or a documented staging copy, not by resetting the live database.

**Steps:**

1. Confirm a current database backup exists and that the owner knows how to request/perform a restore.
2. Confirm `scripts/reconcile_bookings.php` is scheduled with the explicit production database environment and its output/failures are monitored.
3. Verify the test record lifecycle still loads after the scheduled job runs.

**Expected:** Recovery and automatic booking reconciliation have a documented, working operational path.

## F14 — Final cleanup and sign-off

**Steps:**

1. Confirm all PASS/FAIL/BLOCKED/NOT RUN results are in [Report.md](Report.md).
2. Preserve evidence for every problem.
3. With owner approval, cancel/archive/remove only synthetic `HST FINAL` records according to the retained-history rules.
4. Confirm no synthetic booking still blocks a real customer date.
5. Obtain the owner’s written acceptance or list remaining blockers.

**Expected:** The live system has no accidental test availability block, and the final acceptance decision is recorded.

