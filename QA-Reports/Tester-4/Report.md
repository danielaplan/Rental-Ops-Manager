# Tester 4 QA Report

## Test setup

- **Tester:** Codex (simulated manual QA)
- **Test date:** 2026-10-26
- **Laptop / browser:** Windows / Codex in-app Chromium browser (version not exposed)
- **Original QA database:** `akad_rentals_qa_t4`
- **Database baseline:** Git commit `a7bd4b9149f05815a2fdbf3033e4c57830c277bf`; clean seed counts verified: users 2, services 3, packages 12, addons 10, rental items 15, gallery 9, customers 0, bookings 0, payments 0.
- **Fix-retest database:** isolated `akad_rentals_retest_t4` on 2026-10-26.

## Results

| Test ID | Result | Booking ID | Notes / Bug ID |
| --- | --- | --- | --- |
| T4-S31-2026-10-26 | PASS | 1 | Four checklist rows and quantities stayed unchanged after refresh/reopen; no duplicates or omissions. |
| T4-S32-2026-10-26 | PASS | 1 (retest) | Resolved T4-BUG-01 — each release row exposes outgoing quantity and condition. A complete release created 1 release record and 4 matching history records. |
| T4-S33-2026-10-26 | PASS | 3 | Pending release created no record; first valid release saved once and repeat did not duplicate it. |
| T4-S34-2026-10-26 | PASS | 1 (retest) | Resolved T4-BUG-02 — outgoing quantity is editable, bounded by the expected quantity, and required to match it before release. |
| T4-S35-2026-10-26 | PASS | 5 | Quantity 2 against released 1 was rejected without Returned history; corrected 1 persisted. |
| T4-S36-2026-10-26 | PASS | 1 (retest) | Resolved T4-BUG-03 — a short return marked Good was rejected; Missing and item notes are required. |
| T4-S37-2026-10-26 | PASS | 7 | Only allowed conditions were offered and saved on the correct rows after reopen. |
| T4-S38-2026-10-26 | PASS | 8 | Fully paid return review completed; booking and database refreshed as Completed with one ₱999 payment. |
| T4-S39-2026-10-26 | PASS | Automated regression | Resolved T4-BUG-04 — notification deep links open the requested booking and workflow tab without waiting for the table render. |
| T4-S40-2026-10-26 | PASS | 13 | Offline booking/payment replayed once: one customer, booking, payment, seven checklist rows, zero pending operations. |
| T4-S53-2026-10-26 | PASS | 9 | One notification survived reloads without duplication and updated after review; read state is unsupported by the schema. |
| T4-S54-2026-10-26 | PASS | Automated integration | Resolved T4-BUG-05 — an overlapping offline draft is retained as a conflict instead of committing as an ordinary Pending booking. |
| T4-S55-2026-10-26 | PASS | 11 | Offline edit, ₱100 payment, ₱200 deposit, and delivery update synced once. Actions not yet permitted were visibly disabled. |

## Retest results

All previously reported defects were resolved and retested on 2026-10-26.

- **T4-BUG-01 / T4-BUG-02:** The live isolated-browser retest showed quantity and condition controls for every release row. After complete release, the database contained 1 `item_releases` row, 4 `item_history` rows, and 0 incomplete checklist rows.
- **T4-BUG-03:** A live short return with condition `Good` was rejected with the required Missing-and-notes validation message.
- **T4-BUG-04:** The focused frontend regression suite verified that notification links open the matching booking modal and requested workflow tab.
- **T4-BUG-05:** The focused backend integration suite verified an overlapping offline draft returns a conflict and is not committed as a normal Pending booking.

The obsolete failure screenshots were removed because they represent behavior no longer present after the retest.

## Final summary

- **PASS / FAIL / BLOCKED / NOT RUN:** 13 / 0 / 0 / 0
- **Bugs requiring retest:** None
- **Overall result:** All assigned Tester 4 scenarios now pass, including release quantity/condition/history, short-return enforcement, notification navigation, and offline conflict handling.

## Handoff

- [x] Temporary test records were restored.
- [x] Obsolete FAIL evidence was removed after successful retest.
- [ ] This report and the `Evidence/` files were committed and pushed.
