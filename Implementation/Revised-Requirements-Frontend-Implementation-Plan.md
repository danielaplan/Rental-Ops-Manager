# Revised Requirements — Frontend Implementation Plan

## Purpose

This plan aligns the owner-facing HTML, CSS, and JavaScript interface with the revised requirements in `Source Documents/Documentation/REvised`. It covers authentication screens, services and packages, booking and availability workflows, payments and deposits, checklists, delivery, notifications, reports, auditing, responsive behavior, and preservation of the approved offline-sync workflow.

## Current implementation handoff — 2026-10-16

The revised backend implementation is complete and locally verified for the approved scope. Its latest isolated acceptance run passed all 9 backend/sync test files, all 17 offline integration checks, all 36 frontend regression tests, and the PHP/JavaScript/service-worker/admin-inline syntax checks. That evidence establishes the backend contract on synthetic data; it is not production deployment acceptance.

The frontend remains an active implementation. Do **not** mark this plan complete based on the backend result. Continue from the current dirty worktree without reverting unrelated changes.

### Controlling decisions

- Preserve offline sync, its APIs, local queue, replay behavior, conflict retention, settings, status controls, service worker, and tests. The former F7 removal work is superseded and must not be implemented.
- Keep legacy FR-10 internal availability blockouts deferred. Do not expose or extend the existing draft blockout API/UI.
- Implement the approved post-event policy: review and release service capacity after return; use `Awaiting Payment` while a rental balance remains; allow `Completed` only after completed rental payments fully cover the agreed total.
- Treat repository data, fixtures, accounts, bookings, payments, checklists, and migration worksheets as synthetic test material. Deploy from a clean reviewed schema rather than copying sample transactions or credentials.
- Do not describe local synthetic tests as production, hosting, device, or client acceptance.

### Current frontend status

| ID | Status | Current evidence and remaining work |
| --- | --- | --- |
| F1-01 | Implemented | Owner login labels and authentication request flow are present. |
| F1-02 | Implemented | Global unauthorized handling clears invalid sessions and returns to login. |
| F1-03 | In progress | `js/api.js` contains owner-account API methods, but `admin/owners.html` does not exist. Build the primary-owner-only page and verify session revocation behavior. |
| F1-04 | In progress | `js/admin.js` contains a notification-bell draft using `API.getNotifications()`. Verify rendering, action links, refresh, empty/error states, and resolution after workflow completion. |
| F1-05 | Partial | Existing navigation is responsive. New navigation/notification controls still need 375-pixel and keyboard verification. |
| F2-01 | In progress | Service allowance fields and API normalization are present as an unverified draft in `admin/services.html` and `js/api.js`. Finish validation and regression coverage. |
| F2-02 | In progress | Package CRUD methods are present in `js/api.js`, and navigation currently links to `admin/packages.html`, but that page does not exist. Build and test the page. |
| F2-03 | Missing UI | Add explicit Active, Inactive, Upcoming promotion, Active promotion, and Expired presentation. |
| F2-04 | In progress | Checklist-template API methods are present, but no package/template management page exists. Version changes by creating a new template and deactivating the old one; do not mutate historical booking snapshots. |
| F2-05 | Deferred | FR-10 internal availability blockouts remain outside the approved scope. |
| F3-01 | In progress | `admin/manual-booking.html` contains an unverified draft for optional package, theme notes, agreed total, and allowance overrides. Finish the flow and preserve offline drafts. |
| F3-02 | Partial | The manual-booking draft filters active/current promotional packages. Historical booking details still need to use stored package name/price snapshots instead of current package rows. |
| F3-03 | Partial | Backend cancellation is retained and requires a reason. Replace generic status editing with a dedicated cancellation dialog and remove any destructive booking-delete action. |
| F3-04 | Blocked integration draft | `js/api.js` currently calls `bookings.php?do=availability`, but the endpoint is not present in `api/bookings.php`. Add the smallest authenticated read-only preview endpoint using the existing availability service, then cover online and offline behavior. Final create/update remains authoritative. |
| F3-05 | In progress | `admin/manual-booking.html` contains an unverified conflict-review dialog draft. Complete current conflict details, exact conflict IDs, nonblank override reason, change/cancel paths, active-block rejection, and sync-conflict recovery. |
| F3-06 | Partial | Calendar displays booking/service/client/status data. Add approved-overlap distinction. Blockout display remains deferred with F2-05. |
| F3-07 | Implemented | Visible online pages refresh every 15 seconds and on focus/connectivity changes. |
| F3-08 | Partial | Existing booking UI is responsive, but the revised dialogs require the full viewport and keyboard pass. |
| F4-01 | In progress | `admin/bookings.html` and `js/payments.js` contain an unverified draft for type, status, date, and reference. Finish initialization, history display, offline replay compatibility, and tests. |
| F4-02 | Implemented | Balance and payment status are derived from accepted completed payments. Pending-sync amounts remain visibly excluded. |
| F4-03 | Missing UI | Backend itemized deductions are complete and `js/api.js` has draft deduction/refund methods. Replace the single deduction fields with an itemized list and refund action/status UI. |
| F4-04 | Implemented | Expected/released/returned quantities, conditions, required review, direct writes, and offline replay are integrated and tested. |
| F4-05 | Partial | Delivery method, fee, responsibility, and persistence exist. Expose and verify delivery notes consistently. |
| F4-06 | Partial | Existing tables have responsive behavior; revised payment/deduction/dialog surfaces still need final viewport verification. |
| F5-01 | Partial | `Awaiting Completion` and `Awaiting Payment` appear in dashboard/bookings/calendar. Verify the notification action link from every page. |
| F5-02 | Implemented | Guided post-event review and the approved `Awaiting Payment` branch are implemented. |
| F5-03 | Implemented | Manual release/completion is separate from ordinary editing and enforced by the backend. |
| F5-04 | Partial | Backend notification resolution is implemented. Finish and verify the frontend notification removal after confirmed completion. |
| F6-01 | Missing correction | `admin/reports.html` still says collected payments are grouped by event date. Change the label to payment-date revenue to match the backend. |
| F6-02 | Partial | Summary/status/popularity/damage output exists. Render the remaining backend lists and clearly label period versus lifetime totals. |
| F6-03 | In progress | `js/api.js` has an audit reader and navigation links to `admin/audit.html`, but the page does not exist. Build a read-only filterable page. |
| F6-04 | Partial | Reports are partly responsive. Complete this after the audit page and remaining report sections exist. |
| F7-01–F7-04 | Superseded | Do not remove or weaken offline sync. Replace Phase F7 with preservation and parity verification. |

### Immediate developer continuation order

1. Stabilize the interrupted drafts before adding more UI: supply the missing authoritative availability preview endpoint, create the three pages currently referenced by navigation (`packages.html`, `owners.html`, and `audit.html`), and run syntax checks.
2. Finish F3 booking creation/conflict behavior end to end, including offline queue/replay and server rejection recovery.
3. Finish revised payment fields and itemized deposit deductions, including offline parity.
4. Complete notifications, historical package snapshots, dedicated cancellation, delivery notes, calendar overlap markers, and report/audit presentation.
5. Run the focused frontend tests, then the complete isolated acceptance runner. Update this table only from the final tested code state.

### Files containing unverified continuation drafts

- `js/api.js`
- `js/admin.js`
- `js/config.js`
- `js/payments.js`
- `admin/services.html`
- `admin/manual-booking.html`
- `admin/bookings.html`

These files contain edits started on 2026-10-16 that were interrupted before syntax or regression testing. Review them as incomplete work; do not treat the presence of a field, method, or navigation link as implementation evidence.

## Implementation progress — 2026-10-17

The interrupted drafts above have now been stabilized and verified. This section supersedes their earlier “unverified” labels while retaining the original handoff for history.

| Area | Status | Implemented and verified evidence |
| --- | --- | --- |
| F1 owner administration | Implemented | Added `admin/owners.html`; only the primary owner sees or can open it. It supports the two-owner limit, activation/deactivation, password reset, and communicates session revocation. |
| F1 notifications | Implemented, acceptance pending | The persistent bell loads unresolved action-required notifications on every admin page and links to the affected booking. Backend resolution is covered by the isolated suites; final owner interaction acceptance remains pending. |
| F2 services | Implemented | Preparation/travel defaults, non-negative inputs, status, save/reload, and regression coverage are present. |
| F2 packages and checklist templates | Implemented | Added `admin/packages.html` with revised package fields, regular/upcoming/active/expired promotion presentation, activation/deactivation, checklist version creation, old-version deactivation, and historical-version guidance. Live browser verification loaded all six synthetic packages. |
| F3 booking creation and availability | Implemented | Manual booking reuses existing customers, filters promotions by event date, preserves offline drafts, and saves overlaps as Pending. Pending bookings expose all mutable commercial terms; confirmation rechecks allowances and requires exact conflict IDs plus a reason. |
| F3 cancellation/history | Implemented | Removed Cancelled from generic status editing and added a dedicated required-reason cancellation dialog. Booking details prefer saved package name/price snapshots. |
| F3 calendar | Implemented | Approved overlaps now have a distinct warning border/icon and accessible label. Legacy internal blockouts remain deferred. |
| F4 payments | Implemented | Payment entry and history remain integrated; owners can correct a payment with a required audit reason through the same direct/offline server path. |
| F4 deposits/deductions | Implemented | Booking details render itemized deductions and refunds. The held amount locks after its first accepted or queued write; deduction and refund operations remain in the offline outbox and replay through shared backend rules. |
| F4 delivery | Implemented | Added delivery notes and explicit Customer, Included in package, and Owner fee responsibility values. |
| F5 post-event workflow | Implemented | Awaiting Completion review, service release, Awaiting Payment, full-payment completion, and notification resolution remain enforced by shared backend rules and covered by direct/offline tests. |
| F6 reports | Implemented | Corrected payment-date revenue wording and added visible period/lifetime operational totals plus package popularity. |
| F6 audit | Implemented | Added `admin/audit.html`, read-only filters for actor/action/record/date, actor names, and responsive table containment. Live verification displayed 19 synthetic audit entries. |
| F7 offline sync | Preserved | Existing service worker, cached reads, outbox, retry, conflict retention, receipts, mappings, and offline integration suite remain present. No online-only conversion was made. |

Verification from the final code state:

- Complete final isolated acceptance run: 9 backend/sync test files passed, 17 offline integration checks passed, and 37 frontend regression tests passed.
- PHP, JavaScript, service worker, and every admin inline script passed syntax checks.
- Evidence directory: `tests/acceptance-results/1792178839273-14600` using synthetic database `akad_verify_plan_1792178839615_32200` on isolated ports 51926/51927.
- Focused and complete checks include the itemized deposit deduction/refund offline-outbox regression.
- Live browser checks: package, owner, audit, and booking pages had no document-level horizontal overflow at 375×812; package names/values and audit rows rendered from the local synthetic database.

Remaining acceptance and implementation work:

1. Perform the complete create/edit/deactivate/reset/cancel/deduct/refund interaction walkthrough on a disposable synthetic database. The current live browser pass was read-only to avoid changing the developer’s active sample records.
2. Run physical-phone, additional-browser, staging/hosting, deployment configuration, production workload, and owner acceptance. Local synthetic evidence does not establish those gates.
3. Keep FR-10 internal availability blockouts deferred unless separately reauthorized.

## Dependencies

- Backend authentication, revised schema, domain services, reports, notifications, audit, and offline replay contracts are implemented and locally verified.
- Server availability results are authoritative; the browser must not duplicate conflict rules.
- The revised payment, deposit, notification, report, and audit APIs must be defined before completing their screens.
- The interface must remain usable at representative desktop, laptop, and smartphone sizes.

## Recommended implementation order

1. Update shared API and authentication handling.
2. Add service defaults and package/checklist-template management. Keep availability blocks deferred.
3. Rebuild booking creation, conflict handling, cancellation, and calendar presentation.
4. Update payments, deposits, checklists, and delivery.
5. Add post-event review, notifications, reports, and audit history.
6. Verify direct/offline parity and preserve the sync interface.
7. Run responsive, accessibility, workflow, offline, and cross-device tests.

## Phase F1 — Authentication and application shell

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F1-01 | FR-01 | P0 | Update login labels and request fields for the approved owner credential. | `admin/login.html`, `js/admin.js` | Both owner accounts can log in with the approved credential format. |
| F1-02 | NFR-03 | P0 | Handle HTTP 401 globally and clear invalid local session data. | `js/api.js`, `js/admin.js` | A rejected or expired session returns to login and does not continue showing stale private screens. |
| F1-03 | FR-01 | P1 | Add primary-owner account administration. | New owner-account page, admin navigation | Only the primary owner sees the page and can perform authorized account actions. |
| F1-04 | FR-13 | P1 | Add a persistent action-required notification area. | Admin shell and dashboard | Unresolved Awaiting Completion notifications remain visible across admin pages. |
| F1-05 | NFR-01 | P1 | Ensure new navigation entries and notifications work on smartphone widths. | `css/admin.css`, `css/responsive.css` | Navigation and notification actions remain accessible at 375 pixels wide. |

## Phase F2 — Services, packages, and availability settings

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F2-01 | FR-16 | P0 | Add non-negative default preparation and travel allowances to service editing. | `admin/services.html`, `js/api.js` | Saved defaults reload correctly and clearly state that existing bookings are unchanged. |
| F2-02 | FR-03 | P1 | Add package management for regular and promotional packages. | New `admin/packages.html`, navigation, `js/api.js` | Owners can create, edit, activate, and deactivate all revised package fields. |
| F2-03 | FR-03 | P1 | Show package status and promotion validity clearly. | Package page | Active, inactive, upcoming, active-promotion, and expired states are distinguishable. |
| F2-04 | FR-11 | P1 | Add checklist-template editing within package management. | Package page/components | Template items and expected quantities can be added, edited, and deactivated. |
| F2-05 | FR-08 | Deferred | Do not activate or extend legacy internal availability blockouts. | Existing draft artifacts only | No blockout UI is exposed; reopen only after a separate owner decision. |

## Phase F3 — Booking workflow and calendar

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F3-01 | FR-04 | P0 | Change booking forms to one service, optional package, event start/end datetimes, location, theme notes, agreed total, and allowance overrides. | `admin/manual-booking.html`, `admin/bookings.html` | Required fields are clear and a package-free booking can be submitted. |
| F3-02 | FR-03, NFR-04 | P0 | Show only eligible packages for new bookings while displaying stored snapshots for historical bookings. | Booking pages | Inactive and expired packages cannot be selected but remain visible in old bookings. |
| F3-03 | FR-04 | P0 | Replace booking deletion with cancellation and a required-reason dialog. | `admin/bookings.html`, `js/api.js` | The interface offers no destructive deletion for an operational booking. |
| F3-04 | FR-06 | P0 | Replace browser conflict calculations with the authoritative availability endpoint. | `js/api.js`, booking pages | The preview and final save use the same server result. |
| F3-05 | FR-07 | P0 | Add a conflict dialog showing the affected booking, customer, service, and schedule, with change, cancel, and override choices. | Booking pages | Override remains disabled until the owner supplies a non-blank reason. |
| F3-06 | FR-05 | P1 | Update the consolidated calendar to show service, client, interval, status, and approved overlaps. | `admin/calendar.html`, `js/calendar.js` | All services appear together and approved overlaps are visibly distinct. Blockouts remain deferred. |
| F3-07 | FR-17 | P1 | Retain online automatic refresh at an interval of no more than 30 seconds. | Calendar/data refresh helper | A booking changed in another session appears without a full-page reload within 30 seconds. |
| F3-08 | NFR-01 | P1 | Make booking and conflict dialogs usable on phone screens. | Booking pages and responsive CSS | All controls are reachable without horizontal page scrolling. |

## Phase F4 — Payments, deposits, checklists, and delivery

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F4-01 | FR-09 | P0 | Expand payment entry with type, GCash/MariBank method, status, date, and optional reference. | `admin/payments.html`, `admin/bookings.html` | The form submits all revised payment fields and displays recording history. |
| F4-02 | FR-09 | P1 | Display derived outstanding balance and payment status instead of editable cached values. | Payment and booking pages | Displayed balance matches the server calculation after every payment. |
| F4-03 | FR-10 | P0 | Replace the single deduction fields with an itemized deduction list and refund summary. | `admin/bookings.html` | Owners can add multiple deductions and see held, deducted, and refundable totals. |
| F4-04 | FR-11 | P1 | Display booking checklist snapshots with expected, released, and returned quantities and outgoing/incoming conditions. | `admin/bookings.html`, checklist UI | Release and return cannot be finalized while required review data is missing. |
| F4-05 | FR-12 | P1 | Add delivery notes and revised fee-responsibility options. | `admin/bookings.html` | Self-pickup, Lalamove, and owner-delivered arrangements save all required fields. |
| F4-06 | NFR-01 | P1 | Make payment, deduction, checklist, and delivery tables responsive. | Admin and responsive CSS | Important actions remain visible at 375 pixels without clipping. |

## Phase F5 — Post-event review and notifications

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F5-01 | FR-13 | P0 | Display Awaiting Completion consistently on dashboard, bookings, and calendar. | Dashboard, booking, and calendar pages | The status is visually distinct and includes an action-required link. |
| F5-02 | FR-13 | P0 | Add a guided post-event review for equipment, deductions, outstanding payments, readiness, and notes. | Booking details | Manual release remains disabled until all required review steps are complete. |
| F5-03 | FR-13 | P0 | Keep manual release separate from ordinary booking editing. | Booking details | A successful reviewed release changes the visible status to Completed when fully paid or Awaiting Payment when a rental balance remains. |
| F5-04 | FR-13 | P1 | Resolve the related notification after successful release. | Notification UI | The notification disappears only after the server confirms resolution. |

## Phase F6 — Reports and audit history

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F6-01 | FR-14 | P0 | Rebuild collected-revenue filters and labels around payment dates. | `admin/reports.html` | The interface no longer describes revenue as grouped by booking event date. |
| F6-02 | FR-14 | P1 | Add report sections for balances, deposits, deductions, upcoming and completed bookings, cancellations, overlaps, and popularity. | `admin/reports.html` | Every revised report result has a visible total or detailed list. |
| F6-03 | FR-15 | P1 | Add a read-only audit-history page with owner, action, record, and date filters. | New `admin/audit.html`, navigation | Audit entries are searchable and have no edit or delete controls. |
| F6-04 | NFR-01 | P1 | Use responsive cards or scroll-contained tables for large report and audit results. | Report/audit pages and CSS | Data remains readable and controls remain accessible at phone widths. |

## Phase F7 — Preserve offline synchronization

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F7-01 | Approved decision | P0 | Preserve offline scripts, service-worker registration, sync panels, pending-sync badges, and local outbox behavior. | `js/sync.js`, `js/sync-ui.js`, `js/offline.js`, `sw.js`, admin pages | Existing authenticated offline workflows remain available and visible. |
| F7-02 | Approved decision | P0 | Keep direct and replay writes on the same backend domain rules. | `js/api.js`, `api/sync.php`, shared backend services | Direct and replayed operations produce equivalent validation, audit, and business results. |
| F7-03 | FR-17 | P1 | Retain online refresh, retry, receipt, local-ID mapping, and visible conflict-recovery behavior. | Sync and refresh helpers | Reconnection uploads safely without duplicate accepted records or hidden rejected operations. |
| F7-04 | Approved decision | P0 | Retain and extend offline integration tests for every revised frontend workflow that can be queued. | `tests/` | The active suite proves persistence through reload, replay, idempotency, stale-conflict retention, and a second-device read. |

## Frontend test plan

| Area | Required tests |
| --- | --- |
| Authentication | Valid login, rejected login, expired session, inactive account message, primary-owner navigation, and global 401 handling. |
| Booking form | Required fields, optional package, allowance overrides, cancellation reason, and historical package snapshots. |
| Availability | Conflict details, blank override reason prevention, approved-overlap marker, authoritative online preview, and retained offline conflict review. Availability-block UI remains deferred. |
| Payments and deposits | Required payment fields, derived balance, multiple itemized deductions, and refundable amount. |
| Checklist and delivery | Complete release/return fields, delivery notes, and every fee-responsibility option. |
| Post-event | Persistent notification, guided review, release validation, status update, and notification resolution. |
| Reports and audit | Payment-date filtering, all report sections, audit filters, and read-only behavior. |
| Cross-device refresh | A change from a second authenticated session appears within 30 seconds. |

## Responsive and accessibility checks

- Test every revised workflow at 375×812, 812×375, and 1366×900.
- Confirm that forms, tables, dialogs, notifications, and navigation have no inaccessible controls or page-level horizontal overflow.
- Ensure every input has a visible label and validation errors are associated with the affected field.
- Verify keyboard access, focus placement after errors, dialog focus trapping, and visible focus indicators.
- Do not communicate booking status, conflicts, or payment state through color alone.
- Verify readable contrast for badges, warnings, disabled actions, charts, and mobile navigation.

## Frontend definition of done

- Every active requirement has a usable owner-facing workflow where a UI is required.
- Authentication failures and expired sessions do not expose cached private screens.
- Booking forms use the revised one-service model and optional packages.
- Conflict details and approved overlaps are clear and actionable; deferred blockouts are not activated.
- Awaiting Completion remains visible until return review releases service capacity; Awaiting Payment remains visible until completed rental payments cover the agreed total.
- Reports use server results and correct payment-date language.
- All revised workflows remain usable on desktop and representative smartphone widths.
- The calendar and notifications refresh within 30 seconds while online.
- Offline recording, synchronization, pending states, retries, and conflict recovery remain available and tested.

