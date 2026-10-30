# Final Hostinger Testing — Local Rehearsal (2026-10-30)

This report records a local rehearsal only. It is not Hostinger production acceptance evidence.

## Environment

- URL: `http://127.0.0.1:8019/`
- Dedicated database: `akad_rentals_final_qa`
- Database setup: current `db/schema.sql` followed by current `db/seed.sql`
- Normal local database protected: `akad_rentals` was not cleared or modified
- Initial clean counts: 2 users, 3 services, 12 packages, 10 add-ons, 15 rental items, 0 customers, 0 bookings, 0 payments

## Evidence summary

| Check | Result | Evidence |
| --- | --- | --- |
| Public and login pages | PASS locally | Both returned HTTP 200; the public page contained the expected AKAD title. |
| Owner sign-in | PASS locally | Signed in through the browser and reached Dashboard with zero bookings and synced status. |
| Manual booking A | PASS locally | Created `HST FINAL Ana Normal`, Booking 1, Pending, 2027-11-03 10:00–22:00, ₱999. |
| Existing-customer reuse | PASS locally | Booking 2 reused the same Ana customer record on 2027-11-04. |
| Separate customers | PASS locally | Ben and Cara were created as separate customers and bookings. |
| Duplicate/partial-write check after interrupted batch | PASS | Database contained exactly 3 customers and 4 bookings; no partial fifth booking existed. |
| Repository isolated acceptance | PASS | `node tests/run_backend_acceptance.cjs` exited 0. Backend suites, 20 offline/lifecycle integration checks, 65 frontend checks, and syntax checks passed. Evidence: `tests/acceptance-results/1793325571376-26816/`. |
| Exact merged regression command | FAIL | `node tests/run_revised_backend.cjs tests/merged-fixes-regression.test.cjs` expected HTTP 409 but received HTTP 400 at line 86 while changing `agreed_total` on a completed booking. The original create-booking 500 did not recur. |
| Offline save and Sync Now control | PASS locally with boundary | With the PHP server stopped, `HST FINAL Juno Offline Manual` appeared as one Offline draft with Pending Sync and two queued operations while the database still had zero matching records. On reconnection, automatic retry accepted it exactly once. `Sync Now` disabled while working and returned `Online · All changes synced` after each of two clicks. |
| Offline conflict synchronization | PASS locally | Booking 4 (`HST FINAL Cara Conflict A`) was confirmed on the server. An overlapping confirmed draft for `HST FINAL Dan Conflict Sync` was queued offline for 2027-11-07 14:30–16:30. Reconnection produced `0 pending · 1 conflicts · 1 need attention`; the booking draft and dependent checklist operation were retained. Two manual sync retries kept the conflict visible. The database still had one Cara booking and zero Dan customers/bookings. |

## Final-scenario boundary

| Scenario | Local rehearsal status | Reason |
| --- | --- | --- |
| F01 | NOT RUN as final acceptance | Local HTTP sign-in passed, but Hostinger HTTPS redirect, certificate, mixed-content, logout/relogin, and protected-route checks were not completed here. |
| F02 | NOT RUN | Public page loaded locally; private-window catalog review and gallery upload/remove were not performed. |
| F03 | NOT RUN as a complete scenario | Core create and customer-reuse behavior passed, but Calendar and Customers cross-screen comparison was not completed. |
| F04 | NOT RUN as a complete scenario | The local browser conflict-sync boundary passed: an overlapping confirmed offline draft was retained for explicit review and did not create a server customer or booking. Conflict approval, cancellation, Calendar, and Audit History steps were not completed. |
| F05–F11 | NOT RUN manually | Relevant backend/frontend automated checks passed, but the ordered browser lifecycle was not completed end to end. |
| F12 | NOT RUN as final acceptance | Local browser offline save, automatic replay, and the manual `Sync Now` control passed without duplicates. The required physical phone/second-browser disconnect and reconnect was not performed, and automatic retry uploaded the queued record before the manual button could be isolated as the uploader. |
| F13 | NOT RUN | Hostinger backup, scheduler, monitoring, and restore path require the hosting environment. |
| F14 | NOT RUN | Production cleanup and owner written sign-off require the owner and deployed Hostinger system. |

## Current isolated database state

- Customers: 4
- Bookings: 5
- Payments: 0
- Records use the `HST FINAL` prefix and remain available for inspection.

The synchronized Juno record has one customer, one booking, and seven generated checklist items. Screenshot: [manual-sync-pass-2026-10-30.png](manual-sync-pass-2026-10-30.png).

The overlapping Dan draft remains in the browser sync queue for correction, approval workflow, or explicit discard. It was not written to the server database. Screenshot: [offline-conflict-sync-pass-2026-10-30.png](offline-conflict-sync-pass-2026-10-30.png).

## Release decision

**Local final rehearsal: FAIL / incomplete.** The broad acceptance suite passed, but the exact merged regression has one status-code mismatch, and production-only/manual Hostinger scenarios remain unverified.
