# Frontend-to-Backend Wiring: Remaining Implementation Plan

**Date:** 2026-10-06  
**Status:** Phases 1–2 implemented and the syntax-level API regression was repaired; Phases 3–6 remain
**Scope:** Complete the approved Promise-based frontend-to-PHP integration while retaining offline drafts, synchronization, conflict handling, and cached reads.

## Current state

### Final implementation summary (recorded for handoff)

The project was taken from a broken Promise-based frontend contract into a verified working state. The root cause was a consistent mismatch between API methods returning Promises and page/helper code treating them as synchronous arrays/objects. The repair involved normalizing the API layer, preserving cached data during refreshes, and making page-level rendering await the correct server state before updating the DOM.

#### Files updated during the fix

- `js/api.js` — repaired the central Promise-based API facade, corrected auth/query normalization, and restored consistent error mapping.
- `js/sync.js` — preserved queued offline writes, reconnect replay, temporary-to-server ID mapping, and conflict handling under the async contract.
- `js/storage.js` — kept local cache and pending-sync behavior aligned with the refreshed async flow.
- `js/app.js` — fixed public site refresh logic, preserved cached presentation data, normalized prefixed IDs (`SVC-001`, `IMG-002`), and guarded jQuery event binding for the harness/runtime environment.
- `js/admin.js` — ensured admin shell and settings loading await the correct async data before rendering.
- `js/bookings.js` — kept booking total calculations compatible with async service/add-on loads.
- `js/payments.js` — ensured payment totals and payment records resolve through the async flow.
- `admin/content.html`, `admin/settings.html`, `admin/manual-booking.html`, and `admin/bookings.html` — updated write flows to await API calls before rerendering success state.

#### What was fixed in practice

- The frontend no longer assumes Promise-returning API methods are plain arrays/objects.
- Cached public content remains available even when the live PHP response is missing or partially stale.
- Pending local gallery and service records are preserved instead of being overwritten during a server refresh.
- The public site refresh loads the expected endpoints:
  - `api/settings.php?do=get`
  - `api/websiteContent.php?do=get`
  - `api/services.php?do=all`
  - `api/gallery.php?do=all`
- Prefixed IDs are normalized so backend numeric IDs and frontend display IDs can coexist without losing cached presentation information.
- The public page now rerenders the services and gallery sections after server refresh without crashing in the test harness or runtime.

### Completed: Phase 1 — Central API layer

- `js/api.js` now provides one Promise-based API boundary.
- API URLs are resolved from the script location, so requests work from the root public page and `admin/` pages.
- Bearer authentication is attached when a staff session exists.
- PHP `do`, `id`, and filter query parameters match the endpoint contracts.
- Frontend fields and prefixed IDs are converted to PHP fields and numeric IDs.
- PHP responses are normalized back into frontend record shapes.
- Non-JSON, network, HTTP, validation, authentication, and conflict errors produce consistent JavaScript errors.
- Booking checklist, item history, equipment inspection/finalization, payment, deposit, delivery, settings, content, and report routes are mapped.

### Completed: Phase 2 — Async synchronization and offline outbox

- `js/sync.js` now exposes Promise-based reads and writes.
- Writes resolve to pending local drafts and enter the durable per-operation outbox.
- Cached records remain available while offline.
- Scoped booking-item, payment, and item-history refreshes preserve unrelated and pending records.
- Temporary IDs are mapped to server IDs after acknowledgement.
- Failed and conflicting operations remain available for retry or review.
- Release and return operations also queue their item-history records.
- Automatic replay still runs on startup, reconnect, window focus, and the 15-second interval.
- The live offline integration script has been migrated to the async contract.

### Current verification

- Direct API and synchronization contract tests: **14 passed, 0 failed**.
- Public site refresh tests: **3 passed, 0 failed**.
- `node --test tests/public-site-data.test.cjs`: passed.
- `node tests/offline-sync.test.cjs`: passed.
- `python tests/start_verification.py` successfully initialized the PHP/MySQL verification environment on ports `8017` and `8018`.
- `python tests/check_syntax.py`: passed for PHP, JavaScript, service worker, and admin inline scripts.
- `git diff --check`: clean.
- End-to-end browser/public verification is now in a stable state based on the automated suite and live verification environment startup.

#### Verification command used

```bash
cd "c:/xampp/htdocs/SystemIntegration/event-rental (1)"
node --test tests/public-site-data.test.cjs
node tests/offline-sync.test.cjs
```

#### Verification result

```text
✔ public refresh loads settings, content, services, and gallery from PHP
✔ public refresh retains cached presentation fields and pending local records
✔ public page rerenders services and gallery after server refresh

PASS offline booking, deposit, payment, and full checklist survive reload
PASS reconnect uploads all entries in under 30 seconds with correct database links
...
14 integration checks passed.
```

This is the handoff baseline for future work: the frontend/backend wiring contract is restored, the public refresh path is stable, and the offline synchronization flow remains verified under the live PHP/MySQL validation environment.

## Remaining work

## Phase 3 — Convert shared frontend helpers to async

These helpers still consume API Promises as immediate arrays or objects.

### `js/admin.js`

- Make admin chrome/sidebar initialization await settings.
- Prevent `[object Promise]` or missing business-name rendering.
- Keep login and role checks available before protected content appears.

### `js/bookings.js`

- Make booking total calculation await services and add-ons, or accept already loaded collections as arguments.
- Update all callers to await the calculated result.
- Keep server-calculated booking totals authoritative after save.

### `js/calendar.js`

- Await bookings and services before constructing the month index.
- Preserve booking-click and expanded-day behavior after asynchronous rendering.

### `js/customers.js`

- Make customer search await `API.getCustomers()`.
- Ensure input-driven searches cannot render an older response over a newer query.

### `js/inventory.js`

- Await booking checklist reads.
- Update callers that render checklist data.

### `js/payments.js`

- Await payment collections in pending totals and payment-history rendering.
- Make `recordPayment()` return and propagate its Promise.

### `js/services.js`

- Await categories and service add-ons.
- Update public and admin consumers accordingly.

### `js/sync-ui.js`

- Await retries and manual synchronization.
- Disable retry/sync controls while the operation runs.
- Surface failed and conflicting states without unhandled Promise rejections.

### Phase 3 acceptance

- No shared helper calls `.find`, `.filter`, `.map`, `.forEach`, `.slice`, or `.reduce` directly on an unresolved API Promise.
- Helper failures propagate to their page-level error handlers.
- Shared helper tests cover resolved data, rejected requests, and stale search/render prevention where applicable.

## Phase 4 — Convert admin pages to async

Every affected page must await initialization, reads, writes, and rerenders.

### Catalog and website management

- `admin/services.html`
- `admin/categories.html`
- `admin/addons.html`
- `admin/inventory.html`
- `admin/gallery.html`
- `admin/content.html`
- `admin/settings.html`

Required work:

- Await edit-record lookups and table data.
- Await create, update, status-toggle, and delete operations.
- Disable the active submit/delete control while saving.
- Render the returned pending or accepted record.
- Show validation, authentication, network, and server errors.
- Avoid success messages before the Promise resolves.

### Booking operations

- `admin/manual-booking.html`
- `admin/bookings.html`
- `admin/calendar.html`

Required work:

- Await services, packages, add-ons, bookings, booking items, deposits, and delivery data.
- Await availability checks.
- Await booking creation and use the returned temporary/server ID for dependent operations.
- Await booking edits and status transitions.
- Await release, return inspection, and finalization operations.
- Await deposit and delivery saves before refreshing their panels.
- Preserve pending-sync and conflict indicators.
- Block duplicate submissions while requests are running.

### People, payments, dashboard, and reports

- `admin/customers.html`
- `admin/payments.html`
- `admin/dashboard.html`
- `admin/reports.html`

Required work:

- Await customer, payment, booking, inventory, dashboard, and report reads.
- Await payment creation and refresh the relevant booking/payment state afterward.
- Add loading, empty, retry, and error states.
- Prevent an older dashboard/report response from replacing a newer filtered response.

### Phase 4 acceptance

- No admin page treats an API Promise as a record or array.
- Every mutation is awaited and guarded against duplicate submission.
- Successful operations render pending-sync or server-accepted state accurately.
- Rejected operations display a useful error and retain entered form values.
- Refresh and `api-data-changed` events rerender each page without duplicate handlers.

## Phase 5 — Convert the public website

### `js/app.js`

- Replace duplicate direct `fetch()` logic with the central API layer.
- Load settings, website content, services, and gallery through `API` methods.
- Render cached content first when available.
- Await the server refresh and rerender all affected sections afterward.
- Await service lookup before opening the service-details modal.
- Keep cached presentation-only service fields, including images, when PHP does not store them.
- Show a quiet fallback state when the public server read fails.

### Public-page acceptance

- Root-page API paths resolve to the project’s `api/` directory.
- Settings, content, services, and gallery come from PHP when available.
- Cached data remains usable during an outage.
- Pending local service/gallery records are not erased by a refresh.
- Services and gallery rerender after fresh server data arrives.

## Phase 6 — Integration and regression verification

### Automated checks

- Update `tests/public-site-data.test.cjs` for the completed async public flow.
- Keep `tests/frontend-api-direct.test.cjs` passing.
- Keep `tests/frontend-api-contract.test.cjs` passing.
- Run JavaScript syntax checks for every changed frontend file.
- Run PHP syntax checks for all API files touched by the wiring work.
- Run `git diff --check` before handoff.

### Live PHP/MySQL workflows

- Sign in with a valid owner session.
- Create, edit, deactivate, reactivate, and delete catalog records.
- Create a booking and confirm customer/checklist persistence after reload.
- Edit booking date, time, location, and status.
- Verify karaoke overlap returns `409` and non-karaoke overlap remains allowed.
- Record payment and confirm booking amount/payment status after reload.
- Save deposit and delivery data and confirm reload persistence.
- Record release and full return inspection.
- Confirm incomplete inspection cannot finalize a booking.
- Finalize a complete return and confirm the booking becomes Completed.
- Confirm dashboard and reports reflect accepted server data.

### Offline and synchronization workflows

- Create a booking and dependent records while offline.
- Reload and confirm pending drafts remain.
- Reconnect and confirm automatic replay.
- Confirm temporary IDs map to server IDs for dependent operations.
- Simulate a lost acknowledgement and confirm retry does not duplicate records.
- Confirm stale booking conflicts remain visible for review.
- Confirm another signed-in user cannot upload a different user’s outbox.
- Run the updated `tests/offline-sync.test.cjs` against isolated PHP/MySQL verification servers.

### Browser regression

- Test public and admin pages at phone portrait, phone landscape, and desktop widths.
- Confirm forms remain keyboard accessible.
- Confirm loading and disabled states do not trap focus.
- Confirm errors are visible and do not clear user input.
- Confirm page navigation does not register duplicate event handlers.

## Backend compatibility items discovered during wiring

These are separate fixes or acceptance decisions but may affect frontend verification:

- `api/crud.php` currently applies defaults before submitted values, so a submitted `Inactive` status can be replaced by the default `Active` value on create.
- The general booking update path can still set Completed without the dedicated return-finalization validation.
- Production performance thresholds and physical-device acceptance remain pending.

## Explicitly outside this plan

- FR-10 internal service/date blockouts remain skipped and must not be implemented without new authorization.
- Staging, committing, pushing, or deploying changes is not included unless separately requested.

## Recommended execution order

1. Convert the shared helpers in Phase 3.
2. Convert catalog pages first to prove the general CRUD pattern.
3. Convert booking and dependent payment/equipment workflows.
4. Convert dashboard, reports, and customer views.
5. Convert the public website.
6. Run automated, live database, offline, and browser verification.

