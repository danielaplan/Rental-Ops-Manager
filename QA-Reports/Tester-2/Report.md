# Tester 2 QA Report

Follow the [Tester 2 setup](Setup.md), [scenario instructions](Instructions.md), [common instructions](../README.md), and [screenshot naming rules](Evidence/README.md). Edit only this report and files under `Evidence/`.

## Test setup

- **Tester:** Codex simulated Tester 2
- **Test date:** 2026-10-26
- **Laptop / browser:** Windows / ChatGPT in-app browser
- **QA database:** `akad_rentals_qa_t2`
- **Database baseline:** `db/schema.sql` and `db/seed.sql` at Git commit `74f0313`

## Results

For every row:

- Replace `YYYY-MM-DD` with the date you ran that scenario.
- Enter `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` under **Result**.
- After saving, open **Bookings** and copy the visible Booking ID from the first column or booking-detail title. Enter `N/A` if no booking was created.
- Under **Notes / Bug ID**, briefly explain the result. For a failure, include its Bug ID, such as `T2-BUG-01 — Conflict approval failed`.

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T2-S11-2026-10-26 | PASS | 1, 2 | The 1:45 PM overlap stayed Pending; after moving Booking 2 to 5:00 PM it confirmed after refresh. |
| T2-S12-2026-10-26 | BLOCKED | 3, 4, 20, 21 | The original setup did not retain its 30/45-minute allowances; the corrective rerun then encountered a stale/self-conflict state, so the exact boundary could not be judged reliably. |
| T2-S13-2026-10-26 | PASS | 5, 6 | Blank approval was rejected; the stated reason confirmed Booking 6 and appeared in Audit History. |
| T2-S14-2026-10-26 | PASS | 7, 8, 9 | Two overlaps were listed together; the visible UI allowed only approval of the complete list, and Booking 9 confirmed. |
| T2-S15-2026-10-26 | FAIL | 10, 11 | T2-BUG-01 — An approval created for the February 10 conflict still confirmed Booking 11 after another tab moved it to February 11. |
| T2-S16-2026-10-26 | PASS | 14, 15 | Conflicting February 14 reschedule was rejected; the free February 13 schedule persisted as Confirmed. |
| T2-S17-2026-10-26 | PASS | 12 | Blank reason could not submit; valid cancellation persisted and released the interval. |
| T2-S18-2026-10-26 | PASS | 16 | Cancelled status, completed ₱200 payment, cancellation audit reason, and released interval persisted. |
| T2-S19-2026-10-26 | FAIL | 13 | T2-BUG-02 — Confirmed-to-Pending remained visible and produced a persistent Pending/Pending Sync state. |
| T2-S20-2026-10-26 | BLOCKED | 4 | Booking, Details, Calendar, and old availability were checked, but Dashboard exposes only the earliest upcoming rows and did not show Booking 4 for comparison. |
| T2-S45-2026-10-26 | PASS | 18 | Reconciled to Awaiting Completion and continued to report a same-service conflict. |
| T2-S46-2026-10-26 | NOT RUN | 19 | Release/return lifecycle setup was not completed in this simulation. |
| T2-S47-2026-10-26 | PASS | 17 | Pending exposed only Pending/Confirmed; after confirmation, release stayed disabled until the checklist requirements were met. |
| T2-S48-2026-10-26 | NOT RUN | N/A | The four required late-lifecycle setup states were not constructed in this simulation. |

## Problems found

If there are no application bugs, delete the example below. For every bug, copy the example once and replace the heading and blank fields.

| Field | What to enter |
| --- | --- |
| **Scenario / Booking ID** | Copy the scenario number from `Instructions.md`. After saving, find the Booking ID in the first column of **Bookings** or in the booking-detail title. Example: `Scenario 11 / Bookings 16 and 17`. Use `N/A` if no booking was created. |
| **Severity** | `Critical` for data loss, security exposure, or a major money error; `High` when a main workflow cannot continue safely; `Medium` when a workaround exists or screens materially disagree; `Low` for wording, layout, or another minor issue. Judge impact, not repair difficulty. |
| **What happened** | Describe the actual incorrect behavior, affected data or status, exact error message, and whether it remained after refresh or reopen. Do not write only “It did not work.” |
| **Expected** | Copy or summarize what the scenario's **Expected** section says should have happened. |
| **How to reproduce** | Write numbered steps with the starting condition, test data, controls used, save/refresh actions, and the exact step where the problem appears. Another tester should be able to repeat it without asking questions. |
| **Retest needed** | Enter `Yes` when the scenario must be run again after a fix. Enter `No` only when no repair verification is required. |

Save screenshots only in [`Evidence/`](Evidence/README.md). For a bug, use `T2-S<scenario>-BUG-<number>-<description>-<image-number>.png`, such as `T2-S11-BUG-01-conflict-approval-failed-01.png`. Do not paste or link the screenshot in this report.

### T2-BUG-01 — Stale overlap approval is accepted after schedule change

- **Scenario / Booking ID:** Scenario 15 / Bookings 10 and 11
- **Severity:** High
- **What happened:** One tab displayed the February 10 conflict approval for Booking 11. A second tab moved Booking 11 to the free February 11 date. Submitting the old approval in the first tab still confirmed the changed booking instead of rejecting the stale conflict list.
- **Expected:** The old approval must be rejected as stale. The free date may be confirmed only after the current schedule is reviewed.
- **How to reproduce:** 1. Confirm Booking 10 for February 10, 2:00–4:00 PM. 2. Create Booking 11 for the same service and time. 3. Attempt confirmation until the conflict approval appears. 4. In another tab, move Booking 11 to February 11 and save. 5. Return to the first tab and submit the old approval reason. 6. Refresh and observe Booking 11 is Confirmed.
- **Retest needed:** Yes

### T2-BUG-02 — Confirmed booking can enter Pending/Pending Sync

- **Scenario / Booking ID:** Scenario 19 / Booking 13
- **Severity:** High
- **What happened:** The status control still offered Pending for a Confirmed booking. Saving it changed the visible state to `Pending` with `Pending Sync`, and that state remained after repeated refresh instead of restoring Confirmed or showing a clear rejection.
- **Expected:** Pending must be unavailable or rejected, and the booking must remain Confirmed. Cancellation is the supported alternative.
- **How to reproduce:** 1. Create and confirm Booking 13. 2. Reopen it after refresh. 3. Select Pending in the status control. 4. Save and refresh repeatedly. 5. Observe `Pending` and `Pending Sync` instead of Confirmed.
- **Retest needed:** Yes

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 8 / 2 / 2 / 2
- **Bugs requiring retest:** T2-BUG-01, T2-BUG-02
- **Overall result:** Core conflict approval, cancellation, overdue blocking, and lifecycle guards worked in the tested paths, but stale approval and reverse status behavior require fixes; two scenarios were blocked and two late-lifecycle scenarios remain untested.

## Handoff

- [ ] Temporary test records were restored.
- [x] FAIL and BLOCKED results have evidence.
- [x] This report and the `Evidence/` files were committed and pushed.
