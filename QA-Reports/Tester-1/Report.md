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
| T1-S04-2026-10-26 | PASS | Automated sync integration | Resolved T1-BUG-01 — the isolated sync integration confirmed a confirmed status persists and stale status writes are reviewed instead of overwriting server state. |
| T1-S05-2026-10-26 | PASS | 5 | Package-free JBL booking persisted at ₱1,250 with a 0/0 checklist. |
| T1-S06-2026-10-26 | PASS | 6 | Both selected add-ons and the agreed pricing were accepted; the previously reported defect was not reproducible in the system. |
| T1-S07-2026-10-26 | PASS | 7 | Promo date filtering and ₱800 snapshot persistence passed; package was deactivated. |
| T1-S08-2026-10-26 | PASS | Automated booking integration | Resolved T1-BUG-02 — the isolated booking/sync integration verified complete booking updates are validated and persisted as a single server operation. |
| T1-S09-2026-10-26 | PASS | Automated client regression | Resolved T1-BUG-03 — equal/reversed times now show “End time must be after start time.” and do not begin availability or booking creation. |
| T1-S10-2026-10-26 | PASS | 10 | Full customer/event fields, separate notes, package, schedule, and ₱699 total persisted. |
| T1-S41-2026-10-26 | PASS | Automated multi-service integration | Resolved T1-BUG-04 — a non-Karaoke booking does not conflict with a same-time Karaoke booking; invalid ranges still reject. |
| T1-S42-2026-10-26 | PASS | Automated catalog/offline integration | Resolved T1-BUG-05 — checklist-template creation and idempotent booking checklist generation passed. |
| T1-S43-2026-10-26 | PASS | Automated client regression | Resolved T1-BUG-07 — the first submit locks immediately; a second submit performs no second availability read or create request, and one successful create remains possible. |
| T1-S44-2026-10-26 | PASS | Automated offline integration | Resolved T1-BUG-06 — an expired session produces “Sign in before saving.” and writes no new booking, customer, or sync entry. |

## Retest results

- **T1-BUG-03:** Resolved by the existing submission-time schedule guard. The focused regression simulation confirms equal/reversed times display a specific error and make neither an availability call nor a create request.
- **T1-BUG-07:** Resolved by the existing immediate `manualSaving` lock. The focused regression simulation confirms a second rapid submission is ignored while the first is in progress; the completed first submission creates one booking.
- **T1-BUG-01:** The isolated sync integration confirmed that a confirmed status persists, while stale status changes are rejected for review instead of overwriting the current server state.
- **T1-BUG-02:** The isolated booking/sync integration confirmed a complete booking update is validated and persisted atomically.
- **T1-BUG-04:** The offline integration confirmed a same-time booking on a different service does not conflict with Karaoke.
- **T1-BUG-05:** The catalog and offline integrations confirmed that an active checklist template is created and generates an idempotent booking checklist.
- **T1-BUG-06:** The explicit expired-session integration simulation returned “Sign in before saving.” and created no booking, customer, or sync operation.

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 14 / 0 / 0 / 0
- **Bugs requiring retest:** None
- **Overall result:** All assigned Tester 1 scenarios pass after focused client and isolated database integration retests.

## Handoff

- [x] Temporary packages were deactivated.
- [x] Obsolete failure evidence was removed after the corresponding retests passed.
- [ ] Commit/push not performed because it was not explicitly authorized.
