# Tester 2 QA Report

Follow the [Tester 2 setup](Setup.md), [scenario instructions](Instructions.md), [common instructions](../README.md), and [screenshot naming rules](Evidence/README.md). Edit only this report and files under `Evidence/`.

## Test setup

- **Tester:** <!-- Enter your full name. -->
- **Test date:** <!-- Enter YYYY-MM-DD, for example 2026-10-21. -->
- **Laptop / browser:** <!-- Example: Windows 11 laptop / Chrome 141. -->
- **QA database:** <!-- Must be akad_rentals_qa_t2. -->
- **Database baseline:** <!-- Enter the baseline filename or Git commit used before testing. -->

## Results

For every row:

- Replace `YYYY-MM-DD` with the date you ran that scenario.
- Enter `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` under **Result**.
- After saving, open **Bookings** and copy the visible Booking ID from the first column or booking-detail title. Enter `N/A` if no booking was created.
- Under **Notes / Bug ID**, briefly explain the result. For a failure, include its Bug ID, such as `T2-BUG-01 — Conflict approval failed`.

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T2-S11-YYYY-MM-DD |  |  |  |
| T2-S12-YYYY-MM-DD |  |  |  |
| T2-S13-YYYY-MM-DD |  |  |  |
| T2-S14-YYYY-MM-DD |  |  |  |
| T2-S15-YYYY-MM-DD |  |  |  |
| T2-S16-YYYY-MM-DD |  |  |  |
| T2-S17-YYYY-MM-DD |  |  |  |
| T2-S18-YYYY-MM-DD |  |  |  |
| T2-S19-YYYY-MM-DD |  |  |  |
| T2-S20-YYYY-MM-DD |  |  |  |
| T2-S45-YYYY-MM-DD |  |  |  |
| T2-S46-YYYY-MM-DD |  |  |  |
| T2-S47-YYYY-MM-DD |  |  |  |
| T2-S48-YYYY-MM-DD |  |  |  |

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

### T2-BUG-01 — Short issue

- **Scenario / Booking ID:**
- **Severity:**
- **What happened:**
- **Expected:**
- **How to reproduce:**
- **Retest needed:**

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** <!-- Enter four totals, for example 12 / 1 / 1 / 0. -->
- **Bugs requiring retest:** <!-- List Bug IDs or enter None. -->
- **Overall result:** <!-- Write one sentence describing whether the tested workflow is usable and what remains unresolved. -->

## Handoff

- [ ] Temporary test records were restored.
- [ ] FAIL and BLOCKED results have evidence.
- [ ] This report and the `Evidence/` files were committed and pushed.
