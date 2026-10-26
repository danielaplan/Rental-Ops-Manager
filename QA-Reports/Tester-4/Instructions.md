x# Tester 4 — Equipment, Returns, Notifications, and Synchronization

Complete [Tester 4 setup](Setup.md), then read the [common instructions](../README.md). Record every result in the [Tester 4 report](Report.md); do not edit this instruction file while testing.

## Scenario 31 — Checklist generation and persistence

**Book:** `T4 Dee Checklist`, `09174000101`; April 2, 2027; Karaoke Setup — 12 Hours; confirm.

**Steps:** Open Checklist & Release, record every item name/quantity, refresh, and reopen.

**Expected:** One stable checklist exists with no duplicated or missing rows; package snapshot matches Details.

## Scenario 32 — Release requires all conditions and quantities

**Book:** `T4 Emi Release`, `09174000102`; April 4; checklist-generating package; confirm.

**Steps:** Attempt release with one condition blank, then one quantity incomplete, then complete every row and release.

**Expected:** Incomplete attempts fail without history. Complete attempt records exactly one release and matching item history.

## Scenario 33 — Pending release and duplicate release prevention

**Book:** `T4 Finn Duplicate`, `09174000103`; April 6; Karaoke package.

**Steps:** Try release while Pending. Confirm, complete checklist, release once, then try again.

**Expected:** Pending release fails; first valid release succeeds; second is rejected without duplicate history.

## Scenario 34 — Outgoing quantity cannot exceed expected

**Book:** `T4 Gail Quantity`, `09174000104`; April 8; package with known checklist quantities; confirm.

**Steps:** Enter one more than expected for one item and try release. Correct to exact expected quantity and retry.

**Expected:** Oversized quantity is rejected with no release/history. Exact quantity saves.

## Scenario 35 — Return quantity cannot exceed released

**Book:** `T4 Hugo Return Limit`, `09174000105`; initially April 10; confirm, complete outgoing checklist, and release. Move event to an approved past test date to reach Awaiting Completion.

**Steps:** Enter returned quantity greater than released and try to save/finalize; then correct it.

**Expected:** Invalid return is rejected without partial Returned history. Corrected value persists.

## Scenario 36 — Short return must be Missing

**Book:** `T4 Isla Missing`, `09174000106`; April 12; release equipment and reach Return Inspection.

**Steps:** Return fewer units than released while status is Inspected. Attempt final review. Then mark Missing and add condition/notes.

**Expected:** Short return cannot finalize as merely Inspected. Missing documentation permits review when all other requirements pass.

## Scenario 37 — Allowed return conditions persist

**Book:** `T4 Jules Conditions`, `09174000107`; April 14; release and reach Return Inspection.

**Steps:** Use Good, Minor Damage, Damaged, Missing, and Unwashed where appropriate. Confirm invalid or Not Applicable values are absent. Refresh and reopen.

**Expected:** Only allowed values save; each condition remains attached to the correct item.

## Scenario 38 — Completed lifecycle with zero balance

**Book:** `T4 Kira Complete`, `09174000108`; initially April 16; agreed total and Completed payments equal; confirm, release, then move to an approved past test date.

**Steps:** Complete each return row, mark payment/deposit reviewed, add review note, and finalize. Refresh all related screens.

**Expected:** Booking becomes Completed, equipment/service is released, histories exist once, and reports reflect completion.

## Scenario 39 — Notification opens exact booking and tab

**Setup:** Produce one Awaiting Completion booking and one Awaiting Payment booking with different customers.

**Steps:** Open each bell notification separately.

**Expected:** Awaiting Completion opens its own reference on Return Inspection. Awaiting Payment opens its own reference on Payments. Customer, status, message, booking, and selected tab all match.

## Scenario 40 — Offline booking and payment replay without duplicates

**Book offline:** `T4 Mina Offline`, `09174000110`; April 20; Sweet Corner Set A; total ₱250; payment ₱250.

**Steps:** With the signed-in app loaded, disconnect. Create booking and payment once. Verify pending sync entries. Reconnect, Sync Now, wait, and Sync Now again. Refresh and inspect Booking, Customer, Payment, Checklist, and Audit History.

**Expected:** Exactly one server customer, booking, payment, checklist set, and applicable history exist. Local/server IDs link correctly and survive refresh.

## Scenario 53 — Notification persistence, read state, and deduplication

**Setup:** Create `T4 Nica Notification`, `09174000111`, in a state that generates an Awaiting Completion notification.

**Steps:** Reconcile/refresh repeatedly, close and reopen the browser, mark the notification read if supported, and refresh again. Complete the required action and inspect the bell and target booking.

**Expected:** One actionable notification exists per event, survives reload until handled, preserves supported read state, never duplicates on repeated reconciliation, and resolves or updates after completion.

## Scenario 54 — Offline conflict, partial batch, and retry

**Setup:** While online, create a Confirmed booking that will conflict with an offline draft. Prepare three offline operations: one valid booking, one conflicting confirmation/update, and one deliberately invalid operation using fictional `T4 Omar Sync Batch`, `09174000112` data.

**Steps:** Disconnect, queue each operation, reconnect, and run Sync Now. Record committed, conflict, and failed groups. Correct only the failed/conflicting data and retry twice.

**Expected:** Valid work commits once; conflict and failed entries remain clearly actionable; retry commits corrected work without replaying successful operations or creating duplicates. Counts and IDs survive reload.

## Scenario 55 — Offline updates across the remaining booking workflow

**Setup:** Create `T4 Pia Offline Extended`, `09174000113`, online and reach a state where the relevant actions are permitted.

**Steps:** In separate controlled offline cycles, queue a booking edit, payment correction, deposit/deduction action, delivery update, and checklist/return update. Reconnect after each cycle, sync twice, refresh, and compare every affected screen and Audit History.

**Expected:** Each supported offline action commits exactly once through the same validation rules as an online action. Unsupported actions are clearly blocked rather than silently lost. Money, status, checklist, history, and local/server IDs remain consistent.

