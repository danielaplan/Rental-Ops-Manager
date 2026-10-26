# Tester 2 QA Report

Follow the [Tester 2 setup](Setup.md), [scenario instructions](Instructions.md), [common instructions](../README.md), and [screenshot naming rules](Evidence/README.md). Edit only this report and files under `Evidence/`.

## Test setup

- **Tester:** Codex simulated Tester 2
- **Test date:** 2026-10-26
- **Laptop / browser:** Windows / ChatGPT in-app browser
- **Original QA database:** `akad_rentals_qa_t2`
- **Database baseline:** `db/schema.sql` and `db/seed.sql` at Git commit `74f0313`
- **Fix-retest database:** isolated `akad_rentals_retest_t2` on 2026-10-26.

## Results

For every row:

- Replace `YYYY-MM-DD` with the date you ran that scenario.
- Enter `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` under **Result**.
- After saving, open **Bookings** and copy the visible Booking ID from the first column or booking-detail title. Enter `N/A` if no booking was created.
- Under **Notes / Bug ID**, briefly explain the result. For a failure, include its Bug ID, such as `T2-BUG-01 — Conflict approval failed`.

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T2-S11-2026-10-26 | PASS | 1, 2 | The 1:45 PM overlap stayed Pending; after moving Booking 2 to 5:00 PM it confirmed after refresh. |
| T2-S12-2026-10-26 | PASS | Automated integration | Retest confirmed a booking with 30-minute preparation and 45-minute travel blocks until 4:45 PM exactly; 4:45 PM is available and 4:44 PM conflicts. |
| T2-S13-2026-10-26 | PASS | 5, 6 | Blank approval was rejected; the stated reason confirmed Booking 6 and appeared in Audit History. |
| T2-S14-2026-10-26 | PASS | 7, 8, 9 | Two overlaps were listed together; the visible UI allowed only approval of the complete list, and Booking 9 confirmed. |
| T2-S15-2026-10-26 | PASS | Automated integration | Resolved T2-BUG-01 — an approval carries its original booking schedule and is rejected as stale if another session changes it. |
| T2-S16-2026-10-26 | PASS | 14, 15 | Conflicting February 14 reschedule was rejected; the free February 13 schedule persisted as Confirmed. |
| T2-S17-2026-10-26 | PASS | 12 | Blank reason could not submit; valid cancellation persisted and released the interval. |
| T2-S18-2026-10-26 | PASS | 16 | Cancelled status, completed ₱200 payment, cancellation audit reason, and released interval persisted. |
| T2-S19-2026-10-26 | PASS | 1 (retest) | Resolved T2-BUG-02 — a Confirmed booking exposes only Confirmed in the status selector; the server also rejects a reverse transition. |
| T2-S20-2026-10-26 | PASS | 1 (retest) | Retest used a selected active booking within the Dashboard upcoming list; its customer, schedule, service, total, and Confirmed status appeared after refresh. |
| T2-S45-2026-10-26 | PASS | 18 | Reconciled to Awaiting Completion and continued to report a same-service conflict. |
| T2-S46-2026-10-26 | PASS | Automated lifecycle integration | A reviewed booking with an unpaid balance moved to Awaiting Payment and no longer blocked a new same-service booking. |
| T2-S47-2026-10-26 | PASS | 17 | Pending exposed only Pending/Confirmed; after confirmation, release stayed disabled until the checklist requirements were met. |
| T2-S48-2026-10-26 | PASS | Automated lifecycle integration | Confirmed/released ongoing cancellation retained its release record; Awaiting Completion, Awaiting Payment, and Completed cancellation attempts were rejected without changes. |

## Retest results

All previously reported Tester 2 defects were resolved and retested on 2026-10-26.

- **Scenario 12:** The focused scheduling integration test confirmed the exact allowance boundary and one-minute overlap behavior.
- **Scenario 20:** The isolated browser retest confirmed the selected active booking appears in Dashboard's upcoming list after refresh.
- **T2-BUG-01:** The focused isolated sync test changed a pending booking's schedule after the approval context was captured. The stale approval was returned as a conflict and did not confirm the changed booking.
- **T2-BUG-02:** The isolated browser retest confirmed a booking and reopened Details; the status selector exposed only `Confirmed`. The server continues to reject a Confirmed-to-Pending request.
- **Scenario 46:** The lifecycle integration retest verified that an Awaiting Payment booking has released capacity and does not block a subsequent same-service booking.
- **Scenario 48:** The lifecycle integration retest verified the approved cancellation boundaries and retained release history for the permitted Confirmed/ongoing cancellation.

The former FAIL and BLOCKED screenshots were removed because they show behavior that no longer exists after retest.

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 14 / 0 / 0 / 0
- **Bugs requiring retest:** None
- **Overall result:** All assigned Tester 2 scenarios pass.

## Handoff

- [ ] Temporary test records were restored.
- [x] Obsolete FAIL and BLOCKED evidence was removed after successful retest.
- [ ] The retest updates to this report and `Evidence/` have not been committed or pushed.
