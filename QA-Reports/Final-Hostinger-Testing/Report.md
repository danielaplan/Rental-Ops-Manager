# Final Hostinger Testing — Report

Deployed URL: https://akadrentals.uccit3b.com/admin/dashboard.html

Test date: October 30, 2026

**Coordinator:**

**Browser / device:**

**Production backup confirmed before test:** Yes / No

**Scheduler confirmed:** Yes / No

**Catalog differences from Sample Data:** None / describe here

| Test ID            | Result                                                          | Booking ID(s)        | Notes / Bug ID                      |
| ------------------ | --------------------------------------------------------------- | -------------------- | ----------------------------------- |
| HST-F01-2026-10-30 | IMPLEMENTED                                                     | N/A                  | Hosting, HTTPS, login               |
| HST-F02-2026-10-30 | IMPLEMENTED                                                     | N/A                  | Public catalog and gallery          |
| HST-F03-2026-10-30 | CUS A WORKED, CUS B NEEDS FIXING                                | 26                   | Create and reuse customer           |
| HST-F04-2026-10-30 | SOME WORKED BUT "approved conflict evidence is recorded" DIDN'T | 28(C), 29(D) & 32(H) | Conflict and cancellation           |
| HST-F05-2026-10-30 |                                                                 | 33                   | Payments and overpayment            |
| HST-F06-2026-10-30 |                                                                 |                      | Deposit, deduction, refund          |
| HST-F07-2026-10-30 |                                                                 |                      | Delivery                            |
| HST-F08-YYYY-MM-DD |                                                                 |                      | Validation and duplicate prevention |
| HST-F09-YYYY-MM-DD |                                                                 |                      | Checklist, release, return          |
| HST-F10-YYYY-MM-DD |                                                                 |                      | Awaiting Payment lifecycle          |
| HST-F11-YYYY-MM-DD |                                                                 |                      | Reports, audit, notifications       |
| HST-F12-YYYY-MM-DD |                                                                 |                      | Offline synchronization             |
| HST-F13-YYYY-MM-DD |                                                                 | N/A                  | Backup and scheduler                |
| HST-F14-YYYY-MM-DD |                                                                 | N/A                  | Cleanup and sign-off                |

## Problems found

Delete this example if no problems are found. Copy it once for each defect.

### BUG-HST-F03 — "Authentication Required" Error after making a booking for HST FINAL Ben Reuse.

- **Scenario / Booking ID:** `HST-F03-2026-10-30` / visible Booking ID
- **Severity:** Medium
- **What happened:** Can't submit booking because its throwing "Authentication Required" Error.
- **Expected:** To be able to do booking without "Authentication Required" error.
- **How to reproduce:** ?
- **Evidence filename:** [C:\Xampp\htdocs\Rentals-Ops-FINAL\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-HST-F03.png](C:\Xampp\htdocs\Rentals-Ops-FINAL\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-HST-F03.png)
- **Retest needed:** Yes 

### BUG-HST-F04.1 — "Failed" Error still shows even tho there's no conflict in booking.

- **Scenario / Booking ID:** `HST-F04.1-2026-10-30` / visible Booking ID
- **Severity:** Medium
- **What happened:** Still shows an error for confirming a booking even tho theres no conflict with other bookings.
- **Expected:** To be able to do booking without error because there's no conflict in booking.
- **How to reproduce:** ?
- **Evidence filename:** [C:\Xampp\htdocs\Rentals-Ops-FINAL\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-HST-F04.png](C:\Xampp\htdocs\Rentals-Ops-FINAL\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-HST-F04.png)
- **Retest needed:** Yes 

### BUG-HST-F04.2 — No "Conflict-Approval Button" was shown to prevent same day booking.

- **Scenario / Booking ID:** `HST-F04.2-2026-10-30` / visible Booking ID
- **Severity:** Medium
- **What happened:** No "Conflict-Approval Button" was shown to prevent same day booking.
- **Expected:** To be able to do prevent double booking through "Conflict-Approval Button".
- **How to reproduce:** ?
- **Evidence filename:** [C:\Xampp\htdocs\Rentals-Ops-FINAL\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-HST-F04.png](C:\Xampp\htdocs\Rentals-Ops-FINAL\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-HST-F04.2.png)
- **Retest needed:** Yes 


## Final decision

- **PASS / FAIL / BLOCKED / NOT RUN:**
- **Bugs requiring retest:** None / list IDs
- **Owner acceptance:** Accepted / Not accepted / Pending
- **Overall result:** One sentence: state whether the deployed Hostinger system can be used for real operations and what remains.

=======================================
