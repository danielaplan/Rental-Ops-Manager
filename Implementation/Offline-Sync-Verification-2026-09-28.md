# Offline, synchronization, device access, and performance report

Date: 2026-09-28. Authorized by the user: implement the remaining engineering work, verify it, report results, and update Markdown documentation and project memory.

## Requirements and current status

| Requirement | Documentation says | Result |
|---|---|---|
| NFR-01 | Offline create/update bookings, deposits, equipment checklists; Pending Sync; automatic upload within 30 seconds of reconnect; visibility on another device; conflict review | Implemented. Fourteen live PHP/MySQL integration checks passed. A real browser workflow also passed with the test backend stopped and restored. Evidence is bounded to the environments below. |
| NFR-02 | Desktop/laptop and smartphone access | Forms checked at 375 × 812, 812 × 375, and 1366 × 900. No document overflow, unlabeled visible form controls, or clipped return controls in the final return-form checks. Physical smartphone testing remains an acceptance task. |
| NFR-03 | Two owners and one staff member can use the system without extensive training | Clear save feedback, retained drafts, labeled controls, conflict editing, and responsive return forms implemented. Actual owner/staff usability acceptance remains pending; automated checks cannot establish this. |
| NFR-04 | Responsive during monthly peak periods | Synthetic benchmark completed with 10,000 bookings and three parallel readers. No formal numeric threshold is specified in the requirements. Production hosting, actual peak traffic, and phone performance require their own measurement. |

Source: `Documentation/AKAD_Requirements_Analysis_Documentation.md`, requirements table and NFR-01 acceptance criteria. Earlier statements that all offline/runtime acceptance was complete are superseded by this evidence and its limits.

## Changes delivered

- `js/sync.js`: persistent operations stored independently, unique operation IDs, booking reference mapping, authenticated account ownership, automatic startup/reconnect/focus/15-second retry, acknowledgement-based removal, and retained conflicts/failed dependencies. Immutable receipts prevent repeated bookings and payments after lost responses.
- `api/sync.php` and `api/sync_state.php`: transactional acknowledgements, replay validation, server reference resolution, stale booking conflict detection, and serialized karaoke availability checks shared with direct booking writes.
- `js/storage.js`: IndexedDB stores full server snapshots by user. Local storage holds a bounded snapshot plus pending drafts. This fixes the storage quota failure discovered when loading 10,000 bookings. Storage failure produces an error instead of silently claiming a save.
- `sw.js`, `js/offline.js`, and `vendor/`: cache 46 staff app files, including pinned Bootstrap, jQuery, Chart.js, icons, and fonts. API responses and writes use the network. Native page navigation works from the cached shell when the backend is unavailable.
- `js/sync-ui.js`: Pending Sync count, offline setup readiness, retry controls, and editable booking dates/times for conflicts. Unsynced drafts are retained for review.
- Manual booking: actual service/package pricing, time-range checks, preserved form drafts, accessible errors, and admin-entered negotiated down payments. New bookings start Pending.
- Booking detail: negotiated deposit, deduction reason, computed refund, server-calculated payment status, and saved return quantities/conditions/notes. A saved zero quantity remains zero after reload. Incomplete inspections cannot mark the booking Completed.
- Calendar/table: date indexing, accessible calendar actions, working expansion for additional events, 50-row booking pagination, and filter preservation during refresh. Return controls adapt to phone layouts.
- Authentication: offline entry uses an existing authenticated session; the former fake offline login path was removed. PHP enforces write authorization.

Down payments and refundable deposits have no fixed amount or mandatory ₱1,000 minimum. Admins record the amount negotiated by the owner and client, separately for each booking. Deposit deductions cannot exceed the held amount and require a reason.

## Verification evidence

### Live integration — 14 checks passed

`tests/offline-sync-results.json` records the results from two independent storage clients connected to two PHP processes and a real MariaDB database:

1. Offline booking, deposit, payment, and checklist survive reload.
2. Reconnect uploads the queued entries within 30 seconds with correct database links.
3. Another independent client retrieves accepted records and negotiated amounts.
4. Conflicting bookings and dependent checklists remain saved through reload and can be corrected/retried.
5. Lost server responses do not duplicate bookings or payments.
6. Stale booking edits require review instead of overwriting another device.
7. Other services do not block karaoke; reversed time ranges are rejected.
8. Negotiated deposit bounds and deduction reasons are enforced.
9. Complete saved returns can finalize.
10. Another signed-in user cannot upload the first user's outbox.
11. Simultaneous karaoke confirmations across two PHP processes yield one success and one conflict.
12. The online event automatically uploads an offline draft.
13. The periodic retry uploads when the backend returns without an online event.
14. An incomplete inspection cannot finalize the return.

The periodic callback is exercised directly in the integration harness. The actual browser outage test below additionally exercises the real automatic timer.

### Actual browser outage workflow

In Brave, against isolated test port 8017, stopped only the test PHP process. Using the 375-pixel staff form, created a booking with a ₱250 down payment, held a ₱350 deposit, deducted ₱50 with a reason, and saved returned quantity 0 / Missing with inspection notes. Five operations remained Pending Sync. Navigated to the cached staff page while the backend was still stopped: the booking, deposit, zero quantity, and notes remained available.

Restarted the same test backend. The queue automatically became empty without clicking Sync now. Database inspection confirmed exactly one booking, ₱250 paid, ₱300 refundable, and preserved missing-item notes. The booking was not Completed. Results: `tests/browser-outage-results.json`.

Final return-form DOM diagnostics in the fixture reported 11 visible controls, no unlabeled controls, no clipped return controls, and document width matching the viewport at all three tested sizes. Manual booking at 375 pixels also passed labels/width checks. Fixture: `tests/browser-verification.html`; recorded results: `tests/browser-layout-results.json`.

### Synthetic load measurements

Environment: local Windows PHP built-in server and MariaDB, 10,000 synthetic bookings, three parallel readers, 15 requests per endpoint. These are API response measurements, not total page rendering times.

| Endpoint | Median | p95 | Maximum |
|---|---:|---:|---:|
| Bookings/all | 713 ms | 999 ms | 1,009 ms |
| Dashboard | 122 ms | 194 ms | 211 ms |
| Monthly report | 125 ms | 207 ms | 224 ms |

The bookings response is approximately 10.4 MB. Full periodic reads remain a bandwidth/scaling limit; server pagination or incremental changes are appropriate follow-up work for a larger deployment. The script's two-second comparison is illustrative, not an approved acceptance threshold. Raw results: `tests/performance-results.json`.

Syntax checks passed for PHP, JavaScript, the service worker, and admin inline scripts (`tests/check_syntax.py`).

## Operating conditions and remaining acceptance

- Open the app online first, sign in, and wait for “Offline pages are ready on this device.” Service workers require HTTPS in deployment; localhost is supported for development. First-time offline login is unavailable.
- The local cache contains previously downloaded data; uncached records cannot be retrieved offline. Offline means local staff entry and cached navigation, not remote database/report execution.
- The 30-second reconnect evidence applies to the tested small queues with a reachable, valid authenticated server. Offline, expired sessions, retained business conflicts, browser background suspension, or sufficiently large queues cannot guarantee that duration. No silently discarded changes are claimed.
- Two independent clients/origins simulate devices. Actual phone hardware and network conditions still require verification.
- For NFR-03, each of the two owners and the staff member should independently create a manual booking, record negotiated amounts, save a return inspection, and resolve a conflict. Record assistance needed and their acceptance; no usability sign-off is fabricated here.
- For NFR-04, agree on representative peak workload and an acceptable response target, then measure the intended hosting environment.
- Existing `app_settings` row 2 is reserved for internal sync receipts and local-to-server ID mappings; public settings remain row 1. No new schema table was added for this work. The receipt ledger grows and serializes commits; monitor its size and establish retention/archival before high-volume production usage without removing replay protection prematurely.
- Browser storage remains finite and can be cleared by the user/browser. A device backup/export and production recovery policy are separate deployment concerns.
- FR-10 blockouts remain skipped pending the separate user decision. Branding, public/customer portal scope, delivery UI, and other catalog screens are not newly certified by these focused checks.

## Test isolation and rerun

Test data is in `akad_verify_20260928`; the production database was not modified by verification. Test servers bind only to 127.0.0.1 on ports 8017 and 8018. Credentials in test files belong solely to the synthetic owner fixture. Do not deploy `tests/` or expose the fixture credentials as production credentials.

Use `rtk proxy python tests/start_verification.py` to provision/start when the test ports are free. Then run `rtk proxy node tests/offline-sync.test.cjs`, `rtk proxy python tests/performance.py`, and `rtk proxy python tests/check_syntax.py`. Use `tests/control_verification_server.py` for the recorded test processes. `tests/check_browser_results.py` validates the recorded browser outage workflow after entering that fixture data. Keep synthetic data and measured results separate from production records.

Final syntax and Git whitespace checks passed. Both owned test PHP servers were stopped after verification; the synthetic database and result files are retained for review. No files were staged, committed, or pushed.


## Latest session decision ? 2026-09-28: FR-10 remains skipped

The user explicitly confirmed FR-10 blockouts remain skipped at session close. The earlier implementation request is superseded. No FR-10 implementation was made. Resume only after explicit user reauthorization; frontend changes also require new authorization. The requirements definition and Could priority remain unchanged.
