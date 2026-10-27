# Final Hostinger Testing — Report

Deployed URL: https://akadrentals.uccit3b.com/admin/dashboard.html

Test date: October 27, 2026

**Coordinator:**

**Browser / device:**

**Production backup confirmed before test:** Yes / No

**Scheduler confirmed:** Yes / No

**Catalog differences from Sample Data:** None / describe here

| Test ID            | Result                   | Booking ID(s) | Notes / Bug ID                      |
| ------------------ | ------------------------ | ------------- | ----------------------------------- |
| HST-F01-2026-10-27 | WORKED                   | N/A           | Hosting, HTTPS, login               |
| HST-F02-2026-10-27 | WORKED                   | N/A           | Public catalog and gallery          |
| HST-F03-2026-10-27 | WORKED, HAS MINIMAL BUGS | 11 & 14       | Create and reuse customer           |
| HST-F04-2026-10-27 | WORKED                   | 15, 16 & 17   | Conflict and cancellation           |
| HST-F05-2026-10-27 | NEEDS FIXING             | 18            | Payments and overpayment            |
| HST-F06-2026-10-27 | NEEDS MINIMAL FIXING     | 19            | Deposit, deduction, refund          |
| HST-F07-2026-10-27 | WORKED                   | 20            | Delivery                            |
| HST-F08-YYYY-MM-DD |                          |               | Validation and duplicate prevention |
| HST-F09-YYYY-MM-DD |                          |               | Checklist, release, return          |
| HST-F10-YYYY-MM-DD |                          |               | Awaiting Payment lifecycle          |
| HST-F11-YYYY-MM-DD |                          |               | Reports, audit, notifications       |
| HST-F12-YYYY-MM-DD |                          |               | Offline synchronization             |
| HST-F13-YYYY-MM-DD |                          | N/A           | Backup and scheduler                |
| HST-F14-YYYY-MM-DD |                          | N/A           | Cleanup and sign-off                |

## Problems found

Delete this example if no problems are found. Copy it once for each defect.

### HST-BUG-ID11.1 — "Cancel" and "Save Booking" buttons not attached inside "Edit Pending Modal" under Bookings. 

- **Scenario / Booking ID:** `HST-F03-2026-10-27` / visible Booking ID
- **Severity:** Low
- **What happened:** None big, just the buttons not attached inside modal.
- **Expected:** Place buttons inside modal so the user isn't gonna have to scroll down more to see the buttons.
- **How to reproduce:** codex
- **Evidence filename:** [Evidence\Screenshot 2026-10-27 162837.png](C:\Xampp\htdocs\RentalsOps\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-ID11.1.png)
- **Retest needed:** Yes 

### HST-BUG-ID11.2 — Unmatched record from "Bookings" to "Customers". 

- **Scenario / Booking ID:** `HST-F03-2026-10-27` / visible Booking ID
- **Severity:** Medium
- **What happened:** Unmatched record from "Bookings" to "Customers". 
- **Expected:** Data should match to all records.
- **How to reproduce:** codex
- **Evidence filename:** [Evidence\Screenshot 2026-10-27 162837.png](C:\Xampp\htdocs\RentalsOps\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-ID11.2.png)
- **Retest needed:** Yes 

### HST-BUG-ID18 — Unmatched record from "Bookings" to "Customers". 

- **Scenario / Booking ID:** `HST-F05-2026-10-27` / visible Booking ID
- **Severity:** Medium
- **What happened:** Updated payment only saved locally but isn't generating IDs for "Payment" and "Booking" in Payments. P599 balance isn't verified on the "Outstanding Balance". Can't proceed to Steps 3-5.
- **Expected:** Data should match to all records.
- **How to reproduce:** codex
- **Evidence filename:** [[Evidence\Screenshot 2026-10-27 162837.png](C:\Xampp\htdocs\RentalsOps\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-ID11.2.png)]
- **Retest needed:** Yes 

### HST-BUG-ID19 — Disregarded refunding 200.

- **Scenario / Booking ID:** `HST-F06-2026-10-27` / visible Booking ID
- **Severity:** Medium
- **What happened:** unable to refund because its not in the default if the UI
- **Expected:** Data should match to all records.
- **How to reproduce:** codex
- **Evidence filename:** [[Evidence\Screenshot 2026-10-27 162837.png](C:\Xampp\htdocs\RentalsOps\Rental-Ops-Manager\QA-Reports\Final-Hostinger-Testing\Evidence\BUG-ID11.2.png)]
- **Retest needed:** Yes 


## Final decision

- **PASS / FAIL / BLOCKED / NOT RUN:**
- **Bugs requiring retest:** None / list IDs
- **Owner acceptance:** Accepted / Not accepted / Pending
- **Overall result:** One sentence: state whether the deployed Hostinger system can be used for real operations and what remains.

=======================================
