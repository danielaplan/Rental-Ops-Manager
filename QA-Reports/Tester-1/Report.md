# Tester 1 QA Report

## Test setup

- **Tester / date:** Codex browser simulation / 2026-10-26
- **Environment:** Windows, ChatGPT in-app browser, isolated database `akad_rentals_qa_t1`
- **Baseline:** Commit `74f0313e8166b92a48d408344dfdaeecf2d42153`; clean schema and seed counts verified before testing

## Results

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T1-S01-2026-10-26 | PASS | 1 | Customer, schedule, venue, package snapshot, ₱999 total, and Pending status persisted. |
| T1-S02-2026-10-26 | PASS | 2 | Existing Ana customer was reused without duplication. |
| T1-S03-2026-10-26 | PASS | 3 | Sweet Set A, two add-ons, ₱80 add-ons, and ₱330 total persisted. |
| T1-S04-2026-10-26 | FAIL | 4 | T1-BUG-01 — Confirmed remained Pending Sync; refresh/database remained Pending. |
| T1-S05-2026-10-26 | PASS | 5 | Package-free JBL booking persisted at ₱1,250 with a 0/0 checklist. |
| T1-S06-2026-10-26 | PASS | 6 | Both selected add-ons and the agreed pricing were accepted; the previously reported defect was not reproducible in the system. |
| T1-S07-2026-10-26 | PASS | 7 | Promo date filtering and ₱800 snapshot persistence passed; package was deactivated. |
| T1-S08-2026-10-26 | FAIL | 8 | T1-BUG-02 — Pending edit saved a mixture of old/new customer, package, add-on, and price values. |
| T1-S09-2026-10-26 | FAIL | 9 | T1-BUG-03 — Invalid times disabled submission without useful feedback; length checks passed. |
| T1-S10-2026-10-26 | PASS | 10 | Full customer/event fields, separate notes, package, schedule, and ₱699 total persisted. |
| T1-S41-2026-10-26 | FAIL | 11 / N/A | T1-BUG-04 — Second service showed No conflict but submission did nothing and created no Kara row. |
| T1-S42-2026-10-26 | FAIL | N/A | T1-BUG-05 — Two-item checklist submission closed, but package still showed No template. |
| T1-S43-2026-10-26 | FAIL | N/A | T1-BUG-07 — Rapid double-submit created zero Mika customers/bookings and showed no error. |
| T1-S44-2026-10-26 | FAIL | N/A | T1-BUG-06 — Expired-session submit created no partial data but showed no sign-in-required message. |

## Problems found

### T1-BUG-01 — Confirmation does not persist
- **Scenario / Booking ID:** Scenario 4 / Booking 4
- **Severity:** High
- **What happened:** Saving Confirmed displayed Confirmed plus Pending Sync; fresh UI/database still stored Pending.
- **Expected:** Confirmed persists after refresh.
- **How to reproduce:** Create Scenario 4, open Details, choose Confirmed, save, refresh, and inspect the stored status.
- **Retest needed:** Yes

### T1-BUG-02 — Pending edit is not atomic
- **Scenario / Booking ID:** Scenario 8 / Booking 8
- **Severity:** Critical
- **What happened:** The row kept Gio and ₱999; schedule/location changed; Details paired Sweet service with the old Karaoke package and displayed Donut Wall with ₱0 add-ons.
- **Expected:** Ana, Sweet Set A, Donut Wall, allowances, adjustments, and ₱295 persist together.
- **How to reproduce:** Create Scenario 8, apply every prescribed pending edit, save, and compare list/Details after reopen.
- **Retest needed:** Yes

### T1-BUG-03 — Invalid schedule lacks useful feedback
- **Scenario / Booking ID:** Scenario 9 / Booking 9 after correction
- **Severity:** Medium
- **What happened:** Equal/reversed times disabled Create Booking without schedule-specific guidance. No partial data was created; overlength messages worked.
- **Expected:** Each invalid schedule attempt shows a useful error and creates no partial record.
- **How to reproduce:** Enter Scenario 9; try 10:00–10:00 and 10:00–09:00; observe the disabled control and absent explanation.
- **Retest needed:** Yes

### T1-BUG-04 — Same-time second service cannot be saved
- **Scenario / Booking ID:** Scenario 41 / Booking 11 and N/A
- **Severity:** High
- **What happened:** Jona saved. Kara at the identical time on Sweet Corner displayed No conflict, but submission did nothing and created no row.
- **Expected:** Different services at the same time both save and can be confirmed independently.
- **How to reproduce:** Save Jona on Karaoke; enter Kara on Sweet Corner for the exact same time; submit and check Bookings/database.
- **Retest needed:** Yes

### T1-BUG-05 — Checklist version is not created
- **Scenario / Booking ID:** Scenario 42 / N/A
- **Severity:** High
- **What happened:** Creating a named two-item version closed the dialog, but TEMP QA T1 SNAPSHOT still showed No template.
- **Expected:** The active initial version is created so booking snapshots can be tested.
- **How to reproduce:** Create a package, choose New version, enter two named items/quantities, and create the version.
- **Retest needed:** Yes

### T1-BUG-06 — Expired-session submission lacks sign-in prompt
- **Scenario / Booking ID:** Scenario 44 / N/A
- **Severity:** High
- **What happened:** After session deletion, Create Booking left the populated form visible without an authentication message; no Nori rows were created.
- **Expected:** Clearly require sign-in and create no partial or misleading success state.
- **How to reproduce:** Prepare Scenario 44, expire the QA session, submit, and verify UI/database.
- **Retest needed:** Yes

### T1-BUG-07 — Rapid double-submit creates no booking
- **Scenario / Booking ID:** Scenario 43 / N/A
- **Severity:** High
- **What happened:** Double-clicking Create Booking left the valid form unchanged with no error; database counts were zero Mika customers and zero bookings.
- **Expected:** Exactly one customer and one booking are created.
- **How to reproduce:** Enter Scenario 43 with Sweet Set A and rapidly double-click Create Booking; inspect UI/database.
- **Retest needed:** Yes

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 7 / 7 / 0 / 0
- **Bugs requiring retest:** T1-BUG-01 through T1-BUG-07
- **Overall result:** Basic creation/readback paths worked, but status persistence, edit atomicity, add-on state, cross-service submission, checklist versioning, duplicate-submit handling, and expired-session feedback require repair.

## Handoff

- [x] Temporary packages were deactivated.
- [x] Every FAIL has screenshot evidence under `Evidence/`.
- [ ] Commit/push not performed because it was not explicitly authorized.
