# Revised Requirements — Backend and Database Implementation Plan

## Purpose

This plan aligns the PHP API and MySQL database with the revised requirements in `Source Documents/Documentation/REvised`. It covers schema migration, authentication, business rules, reporting, auditability, testing, and removal of the deferred offline-sync backend.

## Assumptions

- The initial release is an online-only internal system for two owner-partners.
- Staff and customer accounts are outside the initial scope.
- Existing operational records must be migrated without losing history.
- Server-side rules are authoritative.
- Expected load is two concurrent owners and approximately 10,000 historical bookings.

## Recommended implementation order

1. Back up the existing database and create an incremental migration.
2. Implement the revised schema and migrate existing records.
3. Secure authentication and all internal API endpoints.
4. Implement booking lifecycle and availability rules.
5. Implement payments, deposits, checklists, delivery, notifications, and auditing.
6. Correct reporting queries.
7. Remove the deferred synchronization backend.
8. Run acceptance, security, concurrency, and performance tests.

## Phase B0 — Migration safety

| ID | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- |
| B0-01 | P0 | Create a dated database backup before applying schema changes. | Deployment procedure | The database can be restored successfully into a separate test database. |
| B0-02 | P0 | Add an incremental migration instead of relying only on schema recreation. | `db/migrations/` | The migration works on a populated legacy database and on a clean database. Re-running it does not corrupt data. |
| B0-03 | P0 | Map legacy booking statuses and fields into the revised model. | Migration script | Existing bookings receive valid revised statuses without losing linked financial or checklist records. |
| B0-04 | P0 | Add a documented rollback procedure. | `Implementation/` | A failed deployment can return to the backed-up database and previous application version. |

## Phase B1 — Revised database schema

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B1-01 | FR-01, NFR-03 | P0 | Replace the owner/staff model with individual owner accounts. Add username, account status, primary-owner flag, failed-login count, lockout time, and timestamps. | `db/schema.sql`, migration, `db/seed.sql` | The initial database contains two owner accounts, no staff account, and exactly one primary owner. |
| B1-02 | FR-16 | P0 | Add default preparation and travel minutes to services. | `db/schema.sql`, migration | Values default to zero, reject negatives, and do not retroactively change existing bookings. |
| B1-03 | FR-03 | P0 | Expand packages with description, inclusions, duration, deposit settings, promotion dates, status, and timestamps. | `db/schema.sql`, migration | Regular and promotional packages are fully represented and inactive packages remain in history. |
| B1-04 | FR-04, FR-06, FR-13, NFR-04 | P0 | Revise bookings with a unique reference, nullable package, event datetimes, copied allowances, blocked interval, theme notes, package snapshots, agreed total, cancellation reason, Awaiting Completion fields, release fields, and timestamps. | `db/schema.sql`, migration | Existing bookings migrate successfully; new package-free bookings are valid; booking references are unique. |
| B1-05 | FR-08 | P0 | Add `AVAILABILITY_BLOCKS`. | `db/schema.sql`, migration | A block can target one service or all services and can be deactivated without deletion. |
| B1-06 | FR-07 | P0 | Add `BOOKING_CONFLICT_OVERRIDES`. | `db/schema.sql`, migration | Each approved conflict stores both bookings, approving owner, reason, and timestamp. |
| B1-07 | FR-09 | P0 | Expand payments with type, method, status, date, optional reference, recording owner, and recorded time. | `db/schema.sql`, migration | Every payment has a valid booking and recording owner; GCash and MariBank remain distinct. |
| B1-08 | FR-10 | P0 | Add `DEPOSIT_DEDUCTIONS` and revise deposits to store the held amount and refund state. | `db/schema.sql`, migration | A deposit retains multiple itemized deductions without overwriting earlier entries. |
| B1-09 | FR-11 | P1 | Add checklist templates, template items, and booking checklist items. | `db/schema.sql`, migration | Booking checklist rows remain unchanged after their source template is edited. |
| B1-10 | FR-12 | P1 | Add delivery notes and revised fee-responsibility values. | `db/schema.sql`, migration | Customer, Included in package, and Owner responsibilities are supported. |
| B1-11 | FR-13 | P0 | Add persistent notifications. | `db/schema.sql`, migration | An action-required notification remains unresolved until its workflow completes. |
| B1-12 | FR-15 | P0 | Add append-only audit logs. | `db/schema.sql`, migration | Audit records can be created and viewed but not edited or deleted through the API. |
| B1-13 | NFR-02 | P1 | Add indexes for blocked-interval lookups, payment-date reports, unresolved notifications, and audit queries. | `db/schema.sql`, migration | Normal availability and monthly-report queries use indexes. |

## Phase B2 — Authentication and API security

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B2-01 | NFR-03 | P0 | Require authentication on every internal read and write endpoint. Leave only approved public content endpoints anonymous. | `api/*.php` | Anonymous requests receive HTTP 401 and cannot read customer, booking, payment, deposit, delivery, checklist, report, notification, or audit data. |
| B2-02 | FR-01 | P0 | Change login to the approved owner credential and reject inactive accounts. | `api/auth.php` | Active owners can log in; unknown and inactive accounts receive the same generic failure response. |
| B2-03 | NFR-03 | P0 | Add atomic failed-login counting and temporary lockout. Reset counters after successful login. | `api/auth.php` | Repeated failures trigger lockout and parallel attempts cannot bypass it. |
| B2-04 | FR-01 | P1 | Add primary-owner account-administration endpoints. | New owner-account API | Only the primary owner can create, deactivate, reactivate, or reset the other owner account. |
| B2-05 | NFR-03 | P1 | Restrict production CORS and require HTTPS. | `api/config.php`, deployment configuration | Production accepts only approved origins and encrypted browser connections. |

## Phase B3 — Booking and availability rules

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B3-01 | FR-04 | P0 | Validate one customer, one service, optional eligible package, event interval, location, allowances, snapshots, and agreed total. | `api/bookings.php`, booking service | Reversed intervals fail; package-free bookings succeed; historical snapshots are preserved. |
| B3-02 | FR-04, NFR-04 | P0 | Replace booking deletion with retained cancellation and a required reason. | `api/bookings.php` | Cancellation preserves payments, deposits, delivery, checklists, status history, and audit records. |
| B3-03 | FR-06, FR-16 | P0 | Centralize blocked-interval calculation for all services. | New availability service | Blocked start and end correctly include copied preparation and travel allowances. |
| B3-04 | FR-06 | P0 | Check Confirmed and Awaiting Completion bookings plus active availability blocks inside a transaction. | Availability service, `api/bookings.php` | Concurrent confirmation requests cannot both reserve the same service and interval without an override. Different services may overlap. |
| B3-05 | FR-07 | P0 | Return conflict details and support an owner-approved overlap with a required reason. | Availability and override APIs | A blank reason is rejected; approval creates one immutable override per conflict. |
| B3-06 | FR-08 | P1 | Implement availability-block creation, update, activation, and deactivation. | New availability-block API | Active blocks prevent ordinary confirmation; inactive blocks remain in history. |
| B3-07 | FR-13 | P0 | Add an idempotent status reconciler that moves ended Confirmed bookings to Awaiting Completion and creates notifications. | Scheduled task and calendar API fallback | Repeated execution creates no duplicate notification and the booking continues blocking the service. |
| B3-08 | FR-13 | P0 | Implement post-event review and manual release as one transaction. | Booking, equipment, deposit, and notification services | Review data, deductions, readiness, owner, notes, completion time, notification resolution, and Completed status commit together. |

## Phase B4 — Supporting business modules

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B4-01 | FR-03 | P1 | Implement full package CRUD and booking eligibility validation. | `api/packages.php`, pricing service | Inactive or out-of-period promotions cannot be selected for new bookings. |
| B4-02 | FR-09 | P0 | Implement payment recording and permitted correction rules. Derive balances from completed booking payments. | `api/payments.php`, payment service | Deposits are excluded; references are optional; every change records its owner. |
| B4-03 | FR-10 | P0 | Implement deposit creation, itemized deductions, refund processing, and refundable-balance calculation. | `api/deposits.php`, deposit service | A deduction transaction fails if total deductions would exceed the held amount. |
| B4-04 | FR-11 | P1 | Implement checklist-template CRUD and transactional copying to bookings. | Checklist APIs and services | A booking receives only the selected package template and keeps its snapshot. |
| B4-05 | FR-12 | P1 | Implement revised delivery validation and persistence. | `api/delivery.php` | Every method, fee, responsibility value, and note round-trips correctly. |
| B4-06 | FR-15 | P0 | Add audit writes inside every sensitive transaction. | Shared audit helper and affected APIs | Cancellation, override, price change, payment change, deduction, refund, completion, release, and account administration each create an audit entry. |

## Phase B5 — Reporting

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B5-01 | FR-14 | P0 | Calculate collected revenue from Completed payments filtered by payment date. | `api/reports.php` | Pending and failed payments, unpaid balances, and refundable deposits are excluded. |
| B5-02 | FR-14 | P1 | Add separate results for balances, deposits held, deductions, upcoming bookings, completed bookings, cancellations, and approved overlaps. | `api/reports.php` | Each report category has an independently testable query and definition. |
| B5-03 | FR-14 | P1 | Add service and package popularity reports. | `api/reports.php` | Counts use retained history and define whether cancelled bookings are excluded. |

## Phase B6 — Remove deferred backend scope

| ID | Requirement | Priority | Task | Main files | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| B6-01 | DEF-01 | P2 | Remove offline commit, receipt, local-ID mapping, and synchronization endpoints after direct APIs cover every workflow. | `api/sync.php`, `api/sync_state.php` | No active frontend code or test calls these endpoints. |
| B6-02 | DEF-01 | P2 | Remove synchronization state from application settings. | Migration and settings service | Application settings contain business settings only. |

## Backend test plan

| Area | Required tests |
| --- | --- |
| Authentication | Valid owner, invalid password, inactive owner, lockout, logout, expired token, primary-owner authorization, anonymous internal reads. |
| Booking | Required fields, optional package, unique reference, package snapshots, cancellation retention, and valid status transitions. |
| Availability | Every service, different-service overlap, allowance boundaries, active/inactive blocks, Awaiting Completion blocking, override reason, and concurrent confirmation. |
| Payments | Multiple payments, pending/failed exclusion, optional reference, derived balance, and recording owner. |
| Deposits | Multiple deductions, exact-full deduction, excessive deduction rejection, and refund calculation. |
| Checklists | Template copying, later template edits, release/return quantities, and missing or damaged conditions. |
| Post-event | Awaiting Completion transition, one persistent notification, review validation, manual release, and idempotent retry. |
| Reports | Payment-date revenue, balances, deposits, deductions, cancellations, overlaps, and service/package popularity. |
| Audit | Every sensitive action produces one immutable entry with the correct owner and record. |

## Performance and concurrency checks

- Seed about 10,000 historical bookings and representative payments, blocks, deductions, notifications, and audit rows.
- Measure booking creation, conflict detection, calendar queries, and monthly reports.
- At least 95% of normal booking and availability requests must finish within three seconds.
- Confirm that summarized report endpoints do not require the browser to download every booking.
- Run simultaneous confirmation tests for the same service and interval.

## Backend definition of done

- All backend portions of FR-01 through FR-17 and NFR-02 through NFR-04 pass their acceptance tests.
- Anonymous users cannot access internal records.
- Historical booking and financial records are retained.
- Same-service conflicts are enforced for all three services under concurrent use.
- Revenue reports use completed payment dates.
- Ended bookings remain unavailable until manual release.
- Audit entries are append-only and identify the acting owner.
- The legacy database can be migrated and restored using documented procedures.
- Offline recording and synchronization backend code is absent from the initial release.

