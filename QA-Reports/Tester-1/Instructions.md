# Tester 1 — Booking Creation and Editing

Read the [common instructions](../README.md) first. Record every result in the [Tester 1 report](Report.md); do not edit this instruction file while testing.

## Scenario 1 — Basic new Karaoke booking

**Purpose:** Verify the simplest valid manual booking persists accurately.

**Book:** `T1 Ana Basic`, `09171000101`; January 4, 2027, 10:00 AM–12:00 PM; Birthday Party; 30 guests; `T1 Basic Venue`; JBL Karaoke Rental → Karaoke Setup — 12 Hours; no add-ons; ₱0 discount; ₱0 fees; agreed total ₱999; preparation/travel 0/0.

**Steps:** Create as Pending. Record its reference. Refresh Bookings, reopen it, and compare Details, Calendar, and Customers.

**Expected:** Exactly one customer and booking exist. Package snapshot, ₱999 total, Pending status, schedule, and venue match everywhere.

## Scenario 2 — Reuse an existing customer

**Book:** Reuse `T1 Ana Basic`; January 6, 2027, 1:00–3:00 PM; Karaoke Setup — 24 Hours; agreed total ₱1,499.

**Steps:** Select Ana from Existing Customer. Save, refresh, reopen, then inspect Customers.

**Expected:** One Ana customer has two bookings. Booking 2 retains the 24-hour package and ₱1,499 total.

## Scenario 3 — Sweet Corner add-on calculation

**Book:** `T1 Bea Sweet`, `09171000103`; January 8, 2027, 10:00 AM–1:00 PM; Sweet Corner Setup → Sweet Corner Set A ₱250; Donut Wall Display ₱50; 4 Rectangular Lace Serving Trays ₱30; total ₱330.

**Steps:** Confirm only matching packages/add-ons appear. Save, refresh, and reopen Details.

**Expected:** Subtotal ₱250, add-ons ₱80, and total ₱330 persist with both add-on names.

## Scenario 4 — Balloon package isolation

**Book:** `T1 Carlo Balloon`, `09171000104`; January 10, 2027, 2:00–5:00 PM; Balloon Decoration → Package A ₱2,799.

**Steps:** Inspect the package list. Save as Pending, confirm, refresh, and reopen.

**Expected:** Karaoke and Sweet Corner packages never appear. Package A and ₱2,799 persist; status remains Confirmed.

## Scenario 5 — Package-free negotiated booking

**Book:** `T1 Dina Negotiated`, `09171000105`; January 12, 2027, 9:00–11:00 AM; JBL Karaoke Rental → No package; agreed total ₱1,250.

**Steps:** Save as Pending, refresh, reopen Details and Checklist & Release.

**Expected:** ₱1,250 persists. No package snapshot or package checklist is silently attached.

## Scenario 6 — Discounts, fees, and active add-ons

**Book:** `T1 Eli Pricing`, `09171000106`; January 14, 2027, 4:00–6:00 PM; Karaoke Setup — 12 Hours ₱999; Wireless Microphone ₱200; Microphone Stand ₱100; discount ₱50; fee ₱25; total ₱1,274.

**Steps:** Check the displayed formula. Confirm inactive add-ons are absent. Save, refresh, and reopen.

**Expected:** ₱999 + ₱300 − ₱50 + ₱25 = ₱1,274. Only selected active add-ons persist.

## Scenario 7 — Event-date promotion eligibility

**Setup:** Create active Karaoke package `TEMP QA T1 PROMO`, price ₱800, promotion January 15–17, 2027.

**Book:** `T1 Faye Promo`, `09171000107`; initially January 16, 2027, 10:00 AM–12:00 PM.

**Steps:** Verify promotion appears on January 16. Change to January 18 and verify it disappears. Return to January 16, select it, save, refresh, and reopen. Deactivate the temporary package.

**Expected:** Eligibility follows event date; saved booking retains the ₱800 snapshot after deactivation.

## Scenario 8 — Edit every Pending commercial field

**Book initially:** `T1 Gio Edit`, `09171000108`; January 18, 2027, 10:00 AM–12:00 PM; Karaoke Setup — 12 Hours; ₱999.

**Modify before confirmation:** Existing Tester 1 customer; Sweet Corner Set A + Donut Wall; January 19, 1:00–4:00 PM; `T1 Updated Venue`; preparation/travel 15/20; discount ₱10; fee ₱5; total ₱295.

**Steps:** Save edits, refresh, and reopen. Confirm, reopen the editor, and inspect editable fields.

**Expected:** Every change persists. After confirmation, customer, service, package, add-ons, discount, fees, and total are locked; scheduling follows approved rescheduling rules.

## Scenario 9 — Invalid schedule and field limits

**Attempt:** `T1 Hana Limits`, `09171000109`; January 20, 2027; Karaoke Setup — 12 Hours.

**Steps:** Try equal and reversed times. Try name over 100 characters, contact over 20, email over 100, and location over 255. Check Bookings, Customers, and Pending Sync. Correct all values and save once.

**Expected:** Each invalid attempt shows a useful error and creates no partial data or sync entry. Corrected data creates exactly one booking.

## Scenario 10 — Complete customer and event details

**Book:** `T1 Ivy Details`, `09171000110`, `ivy.t1@example.test`; Returning client; January 22, 2027, 3:00–6:00 PM; Reunion; 42 guests; `T1 Full Details Venue`; JBL Speaker 520 Only — 12 Hours; special request `Ground-floor setup`; theme note `Blue and silver`.

**Steps:** Save, reopen Details, refresh, and reopen again. Compare Customers and Calendar.

**Expected:** Every supplied field remains consistent. Theme notes and special requests remain distinct.

## Scenario 41 — Different services at the same time

**Purpose:** Verify conflict rules do not incorrectly block unrelated services.

**Book:** Create and confirm `T1 Jona Cross Service`, `09171000111`, January 24, 2027, 2:00–4:00 PM, Karaoke Setup — 12 Hours. Create `T1 Kara Cross Service`, `09171000112`, at the exact same time using Sweet Corner Set A.

**Steps:** Check availability for the second booking, save it as Pending, confirm it, refresh, and compare Calendar and both booking records.

**Expected:** The second booking is allowed without a same-service conflict approval. Both references appear independently with the correct service and package.

## Scenario 42 — Package checklist snapshot after template change

**Purpose:** Verify an existing booking keeps its historical checklist snapshot.

**Setup:** Create `TEMP QA T1 SNAPSHOT` package with two fictional checklist items. Book `T1 Lani Snapshot`, `09171000113`, January 26, 2027, using that package.

**Steps:** Record the booking checklist. Change the package template by renaming one item, changing a quantity, and adding an item. Refresh the existing booking, then create a second booking with the updated package. Restore/deactivate the temporary package.

**Expected:** The first booking keeps the original item names and quantities. Only the second booking receives the updated template. Neither checklist contains duplicates.

## Scenario 43 — Repeated submission does not duplicate a booking

**Purpose:** Test rapid double-click, refresh, and uncertain-response behavior.

**Book:** `T1 Mika Duplicate Submit`, `09171000114`; January 28, 2027, 10:00 AM–12:00 PM; Sweet Corner Set A.

**Steps:** Double-click the final Save control rapidly. If the UI permits, repeat once under a throttled connection. Wait, then search Bookings and Customers before taking any other action.

**Expected:** Exactly one customer and one booking are created. The Save control prevents repeat submission or the server safely treats the repeated request as one operation.

## Scenario 44 — Session expiry during save

**Purpose:** Verify authorization failure does not create partial data or falsely report success.

**Attempt:** Prepare a valid manual booking named `T1 Nori Expired Session` for January 30, 2027 without saving it.

**Steps:** In a safe test environment, let the session expire or sign out in another tab. Submit the prepared booking. Sign back in and inspect Bookings, Customers, Pending Sync, and Audit History.

**Expected:** The UI clearly requires sign-in. No partial customer, booking, checklist, or misleading success message exists. If the operation is queued offline, it is visibly identified and requires valid authentication before replay.

