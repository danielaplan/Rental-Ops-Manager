# Revised Requirements — Frontend Implementation Plan

## Purpose

This plan aligns the owner-facing HTML, CSS, and JavaScript interface with the revised requirements in `Source Documents/Documentation/REvised`. It covers authentication screens, services and packages, booking and availability workflows, payments and deposits, checklists, delivery, notifications, reports, auditing, responsive behavior, and removal of the deferred offline interface.

## Dependencies

- Backend authentication and schema migration must be available before final frontend integration.
- Server availability results are authoritative; the browser must not duplicate conflict rules.
- The revised payment, deposit, notification, report, and audit APIs must be defined before completing their screens.
- The interface must remain usable at representative desktop, laptop, and smartphone sizes.

## Recommended implementation order

1. Update shared API and authentication handling.
2. Add service defaults, package management, and availability blocks.
3. Rebuild booking creation, conflict handling, cancellation, and calendar presentation.
4. Update payments, deposits, checklists, and delivery.
5. Add post-event review, notifications, reports, and audit history.
6. Remove offline-sync interface code.
7. Run responsive, accessibility, workflow, and cross-device tests.

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
| F2-05 | FR-08 | P1 | Add availability-block management. | Calendar panel or new availability page | Owners can create service-specific or all-service blocks and activate/deactivate them. |

## Phase F3 — Booking workflow and calendar

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F3-01 | FR-04 | P0 | Change booking forms to one service, optional package, event start/end datetimes, location, theme notes, agreed total, and allowance overrides. | `admin/manual-booking.html`, `admin/bookings.html` | Required fields are clear and a package-free booking can be submitted. |
| F3-02 | FR-03, NFR-04 | P0 | Show only eligible packages for new bookings while displaying stored snapshots for historical bookings. | Booking pages | Inactive and expired packages cannot be selected but remain visible in old bookings. |
| F3-03 | FR-04 | P0 | Replace booking deletion with cancellation and a required-reason dialog. | `admin/bookings.html`, `js/api.js` | The interface offers no destructive deletion for an operational booking. |
| F3-04 | FR-06 | P0 | Replace browser conflict calculations with the authoritative availability endpoint. | `js/api.js`, booking pages | The preview and final save use the same server result. |
| F3-05 | FR-07 | P0 | Add a conflict dialog showing the affected booking, customer, service, and schedule, with change, cancel, and override choices. | Booking pages | Override remains disabled until the owner supplies a non-blank reason. |
| F3-06 | FR-05 | P1 | Update the consolidated calendar to show service, client, interval, status, availability blocks, and approved overlaps. | `admin/calendar.html`, `js/calendar.js` | All services appear together and blocks and approved overlaps are visibly distinct. |
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
| F5-03 | FR-13 | P0 | Keep manual release separate from ordinary booking editing. | Booking details | Only a successful release response changes the visible status to Completed. |
| F5-04 | FR-13 | P1 | Resolve the related notification after successful release. | Notification UI | The notification disappears only after the server confirms resolution. |

## Phase F6 — Reports and audit history

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F6-01 | FR-14 | P0 | Rebuild collected-revenue filters and labels around payment dates. | `admin/reports.html` | The interface no longer describes revenue as grouped by booking event date. |
| F6-02 | FR-14 | P1 | Add report sections for balances, deposits, deductions, upcoming and completed bookings, cancellations, overlaps, and popularity. | `admin/reports.html` | Every revised report result has a visible total or detailed list. |
| F6-03 | FR-15 | P1 | Add a read-only audit-history page with owner, action, record, and date filters. | New `admin/audit.html`, navigation | Audit entries are searchable and have no edit or delete controls. |
| F6-04 | NFR-01 | P1 | Use responsive cards or scroll-contained tables for large report and audit results. | Report/audit pages and CSS | Data remains readable and controls remain accessible at phone widths. |

## Phase F7 — Remove deferred frontend scope

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| F7-01 | DEF-01 | P2 | Remove offline scripts, service-worker registration, sync panels, pending-sync badges, and local outbox behavior. | `js/sync.js`, `js/sync-ui.js`, `js/offline.js`, `sw.js`, admin pages | No page claims that business writes can be recorded offline. |
| F7-02 | DEF-01 | P2 | Replace cached writes with direct authenticated API calls and accurate success or failure messages. | `js/api.js`, admin pages | A success message appears only after the server accepts the write. |
| F7-03 | FR-17 | P2 | Retain only the small online refresh helper needed by calendar and notifications. | New or simplified refresh helper | Refresh code has no queue, conflict replay, receipt, or local-ID behavior. |
| F7-04 | DEF-01 | P2 | Remove obsolete offline tests and frontend fixtures after revised tests replace them. | `tests/` | The active test suite contains no deferred offline workflow expectations. |

## Frontend test plan

| Area | Required tests |
| --- | --- |
| Authentication | Valid login, rejected login, expired session, inactive account message, primary-owner navigation, and global 401 handling. |
| Booking form | Required fields, optional package, allowance overrides, cancellation reason, and historical package snapshots. |
| Availability | Conflict details, availability block display, blank override reason prevention, and approved-overlap marker. |
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
- Conflict details, availability blocks, and approved overlaps are clear and actionable.
- Awaiting Completion remains visible until the owner finishes review and manual release.
- Reports use server results and correct payment-date language.
- All revised workflows remain usable on desktop and representative smartphone widths.
- The calendar and notifications refresh within 30 seconds while online.
- Offline recording and synchronization controls are absent from the initial release.

