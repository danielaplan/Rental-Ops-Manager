# Admin Notification Dependency Fix — 2026-10-31

## What changed

- Loaded the existing shared booking formatter before `admin.js` on Categories, Website Content, Gallery, and Settings.
- Added a regression check requiring every admin page with the notification top bar to load that dependency before the shared admin shell.

## Why

The shared notification menu formats booking amounts, dates, and times through `BookingCalc`. Pages that omitted `js/bookings.js` showed `Notifications unavailable: BookingCalc is not defined` even though their main page data still loaded.

## Verification performed

- `node --test tests/frontend-async-workflows.test.cjs` — 22/22 passed.
- `node tests/check_syntax.cjs` — PHP, JavaScript, service worker, test scripts, and admin inline scripts passed.
- `git diff --check` — passed.

## Production browser follow-up

- A Chrome hard reload cleared the stale `resolveServiceCategoryId` error on Categories.
- Categories then rendered all three rows, the notification button, and `Online · All changes synced` without the `BookingCalc` error.
- Gallery rendered its records, notification button, and synchronized status without the `BookingCalc` error.
- Gallery separately returned HTTP 404 for multiple `/uploads/gallery/*.jpg` files; the database records render, but the corresponding production image files are missing.
- Website Content and Settings were not verified because the production session expired and redirected to Login. No credentials were entered and no production records were changed.

No database, API, authentication, synchronization, or business-rule behavior changed.
