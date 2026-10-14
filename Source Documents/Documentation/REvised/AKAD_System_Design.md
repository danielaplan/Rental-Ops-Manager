SAD 101 · SYSTEMS ANALYSIS AND DESIGN

# System Design — Tech Stack, Database Schema & Architecture

Client: AKAD Sweet Party Rentals

Companion document to AKAD Requirements Analysis and Documentation. It translates the requirements (FR-01 to FR-17 and NFR-01 to NFR-04) into a technical design for an online-only, owner-focused initial release, following the revised project proposal. Design choices that go beyond what the owner stated in the interview are labeled "proposed" and depend on client approval of the matching requirement.

Prepared by: RJDM Collective — Aplan, Manansala, Cruz, Estapia

## 1. PROPOSED TECHNOLOGY STACK

The stack follows the proposal (Section 7.2) and supports FR-05 and FR-17 (calendar and refresh), NFR-01 (desktop and smartphone screens), NFR-02 (three-second response target), and NFR-03 (security safeguards), while keeping the database relational. Offline recording and synchronization are deferred (DEF-01) and are not part of this stack.

| Layer | Technology | Role in the System |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript, Bootstrap, jQuery | Responsive owner interface: customer and package screens, booking forms, the consolidated calendar and availability view, conflict warnings, payment and deposit records, equipment checklists, notifications, and reports. Bootstrap supports desktop, laptop, and smartphone layouts. jQuery handles DOM updates and AJAX requests. |
| Backend | PHP | Server-side business rules: authentication and sessions, booking management, same-service overlap detection using event, preparation, travel, and availability-block intervals, owner-authorized overlaps, payment and deposit calculations, Awaiting Completion processing and service release, notifications, reporting, and audit logging. |
| Database | MySQL | Centralized relational storage for users, customers, services, packages, bookings, availability blocks, conflict overrides, payments, deposits and deductions, checklist templates and booking checklists, delivery details, notifications, and audit logs. |
| Security and transport | HTTPS, PHP password hashing, authenticated sessions | Supports NFR-03: encrypted browser-to-server traffic, hashed passwords, authenticated sessions, server-side input validation, and failed-login protection. |

Note: PHP and MySQL provide a widely supported, relational, and practical environment for the requirements. AJAX requests through jQuery let the browser communicate with the PHP backend without full page reloads. The initial release operates online only. Browser-based offline storage and automatic synchronization are deferred pending a separate client assessment.

## 2. DATABASE SCHEMA — ENTITY SUMMARY

Sixteen entities support the active requirements. The Entity Relationship Diagram in Section 3 shows the attributes and relationships. The table below summarizes each entity's key fields, purpose, and the requirements it supports. Fields marked "proposed" support requirements that await client approval.

| Entity | Key Fields | Purpose | Requirements |
| --- | --- | --- | --- |
| USERS | user_id (PK), full_name, username, password_hash, account_status, is_primary_owner, failed_login_count, locked_until, created_at | Authenticated owner accounts. One primary owner can administer the other owner account. Staff accounts are not part of the initial release. | FR-01, NFR-03 |
| CUSTOMERS | customer_id (PK), full_name, contact_number, messenger_handle, notes, created_at | People renting AKAD's services, with their booking histories. | FR-02 |
| SERVICES | service_id (PK), service_name, description, default_preparation_minutes, default_travel_minutes, status | The three confirmed services: JBL Karaoke Rental, Sweet Corner Setup, Balloon Decoration, with owner-controlled default allowances. | FR-05, FR-16 |
| PACKAGES | package_id (PK), service_id (FK), package_name, description, inclusions, price, duration_minutes, requires_deposit, deposit_amount, is_promotional, promotion_start_date, promotion_end_date, status, created_at, updated_at | Regular and promotional packages under any service. Inactive or expired packages cannot be selected for new bookings but stay in historical records. | FR-03 |
| AVAILABILITY_BLOCKS | block_id (PK), service_id (FK, nullable), start_datetime, end_datetime, reason, created_by (FK), status, created_at | Periods when a service is unavailable. A null service applies to all services. Blocks are deactivated without deleting history. | FR-06, FR-08 |
| BOOKINGS | booking_id (PK), booking_reference, customer_id (FK), service_id (FK), package_id (FK, nullable), created_by (FK), event_start_datetime, event_end_datetime, preparation_minutes, travel_minutes, blocked_start_datetime, blocked_end_datetime, event_location, theme_notes, package_name_snapshot, package_price_snapshot, agreed_total, status, cancellation_reason, awaiting_completion_at, completed_at, released_by (FK), review_notes, created_at, updated_at | Central record of every rental. Each booking is for one service, with an optional package. The blocked interval extends the event interval by preparation and travel time. Package name and price are snapshots. Post-event fields record the review and the owner who released the service. | FR-04, FR-06, FR-13, FR-16 |
| BOOKING_CONFLICT_OVERRIDES | override_id (PK), booking_id (FK), conflicting_booking_id (FK), approved_by (FK), reason, approved_at | One record per conflicting booking that the owner deliberately authorizes, with the required reason, approving owner, and time. | FR-07 |
| PAYMENTS | payment_id (PK), booking_id (FK), amount, payment_type, payment_method, payment_status, payment_date, payment_reference, recorded_by (FK), recorded_at | Multiple payments per booking through GCash or MariBank, with an optional external reference. | FR-09, FR-14 |
| DEPOSITS | deposit_id (PK), booking_id (FK, unique), amount_held, refund_status, refund_date, recorded_by (FK), created_at, updated_at | Optional refundable deposit per booking. The refundable balance is calculated and not stored. | FR-10 |
| DEPOSIT_DEDUCTIONS | deduction_id (PK), deposit_id (FK), affected_item, reason, amount, recorded_by (FK), recorded_at | Multiple itemized deductions for uncleaned, missing, or damaged items. | FR-10 |
| CHECKLIST_TEMPLATES | template_id (PK), package_id (FK), template_name, status | Reusable equipment checklist templates attached to packages. | FR-11 |
| CHECKLIST_TEMPLATE_ITEMS | template_item_id (PK), template_id (FK), item_name, expected_quantity | Items belonging to a checklist template. | FR-11 |
| BOOKING_CHECKLIST_ITEMS | checklist_item_id (PK), booking_id (FK), item_name_snapshot, expected_quantity, quantity_released, quantity_returned, condition_out, condition_in, return_status, checked_by (FK), checked_at | Booking-specific checklist copied from the template, so recorded items and conditions are preserved if the template changes. | FR-11, FR-13 |
| DELIVERY | delivery_id (PK), booking_id (FK, unique), delivery_method, delivery_fee, fee_shouldered_by, delivery_notes, created_at | Delivery method (self-pickup, Lalamove, or owner-delivered), fee, fee responsibility, and notes. | FR-12 |
| NOTIFICATIONS | notification_id (PK), user_id (FK), booking_id (FK), notification_type, message, requires_action, created_at, resolved_at | Persistent action-required notices, including Awaiting Completion reminders that stay until the owner completes the review and releases the service. | FR-13 |
| AUDIT_LOGS | audit_id (PK), user_id (FK), action, record_type, record_id, description, created_at | Audit history of sensitive owner actions. | FR-15 |

## 3. DATABASE DESIGN

### 3.1 Entity-Relationship Diagram

BOOKINGS is the central entity. It links a customer, the selected service and optional package, the owner who created it, and its payments, optional deposit, booking checklist, optional delivery record, notifications, and conflict overrides. Because one booking may conflict with more than one existing booking, overlap approvals are stored in their own table. The diagram is shown in full on the next page.

![AKAD entity relationship diagram](AKAD_ERD_final_revised.png)

Figure 1. AKAD Operations and Booking Management System — Entity Relationship Diagram. Cardinality: 1 = one, M = many, 0..1 = zero or one. PK = primary key, FK = foreign key. All created_by, recorded_by, checked_by, approved_by, released_by and user_id foreign keys reference USERS.user_id. BOOKING_CONFLICT_OVERRIDES references BOOKINGS twice (booking_id and conflicting_booking_id).

### 3.2 Design Notes

- Blocked interval (proposed, FR-06, FR-16): blocked start = event start − preparation minutes; blocked end = event end + travel minutes. Preparation and travel minutes default from SERVICES and can be overridden per booking. They are copied into BOOKINGS so later default changes do not alter existing bookings.

- What blocks a service (FR-06): only bookings with status Confirmed or Awaiting Completion, and active availability blocks, are compared. Pending bookings do not block, but the overlap check runs when a Pending booking is saved and again when it is confirmed. Different services are never compared with each other.

- Overrides (FR-07): each authorized overlap creates one BOOKING_CONFLICT_OVERRIDES record per conflicting booking, with the required reason, approving owner, and time. The booking stays visibly marked on the calendar.

- Snapshots (NFR-04): package name and price are copied into BOOKINGS, and checklist templates are copied into BOOKING_CHECKLIST_ITEMS, so later package changes do not alter existing bookings. When no package is selected, the snapshot fields are empty and the agreed total is entered by the owner.

- Derived values: outstanding balance = agreed total − completed booking payments. Refundable amount = amount held − sum of deposit deductions. Payment status (Unpaid, Partially Paid, Fully Paid) is derived from the outstanding balance. These values are calculated when needed and not stored, so they cannot disagree with the underlying records. A deduction that would exceed the amount held is rejected.

- Awaiting Completion (FR-13): when a booking's blocked end time is reached, its status changes to Awaiting Completion and awaiting_completion_at is set. Until the owner releases it, the booking blocks its service from its blocked start with no end time, so any overlapping booking is flagged as a conflict. The owner completes the post-event review (equipment return, deductions, outstanding payments, readiness), and the system records completed_at, released_by, and review_notes and sets the status to Completed. A related NOTIFICATIONS record with requires_action = true stays visible until resolved_at is set.

- Status transition (proposed): the change to Awaiting Completion runs from a scheduled PHP task and is also checked on each calendar request, so a service is never shown as available after its blocked end time passes without owner release. Hosting must support a scheduled task, or the on-request check serves as the fallback.

- Deposits: refundable deposits are excluded from collected revenue. Deductions are reported separately. How retained deductions appear in financial reports is an open item.

### 3.3 Controlled Values

The values below are used by the application. Values marked "proposed" are not stated by the owner and need approval.

| Field | Allowed values | Basis |
| --- | --- | --- |
| BOOKINGS.status | Pending, Confirmed, Awaiting Completion, Completed, Cancelled | Proposed; derived from the proposal's confirmation, completion, cancellation, and Awaiting Completion workflow |
| PAYMENTS.payment_method | GCash, MariBank | Confirmed (Q10). Other methods only if the owner approves |
| PAYMENTS.payment_type | Down payment, Balance (additional types only if approved) | Proposed; Q6 mentions the down payment |
| PAYMENTS.payment_status | Pending, Completed, Failed | Proposed; supports the collected-revenue definition |
| DELIVERY.delivery_method | Self-pickup, Lalamove, Owner-delivered | Confirmed (Q4, Q11) |
| DELIVERY.fee_shouldered_by | Customer, Included in package, Owner | Customer and included-in-package confirmed (Q11); Owner is proposed |
| DEPOSITS.refund_status | Held, Refunded | Proposed |
| USERS.account_status | Active, Inactive | Proposed; supports FR-01 |

## 4. SYSTEM ARCHITECTURE

### 4.1 Architecture Diagram

The system follows a three-tier web architecture: presentation layer, application layer, and data layer. The Owner accesses the responsive interface through a web browser. The PHP application processes authentication, bookings, availability checks, schedule-overlap approvals, payments, deposits, post-event status changes, notifications, reports, and audit records. MySQL stores the operational and historical data.

![AKAD system architecture](AKAD_Architecture_with_availability_blocks.png)

Figure 2. System Architecture Diagram

The browser communicates with the PHP application through HTTPS requests. The application validates requests, applies business rules, and performs database transactions in MySQL, then returns results to the browser as JSON. The initial version operates online only. Offline recording and synchronization are excluded until the client separately approves them.

### 4.2 Proposed Design Decisions

| Decision | Description | Requirement |
| --- | --- | --- |
| Calendar refresh | While the owner is online, the calendar requests updated booking data from the PHP application at intervals of no more than 30 seconds, so changes made on one device appear on another without a full-page reload. This is a project team refinement and not an owner-stated need. | FR-17 (proposed) |
| Server-side validation | Conflict checks, balance and deduction calculations, and status changes run on the server and not only in the browser. | FR-06, FR-09, FR-10 |
| Scheduled status check | A scheduled PHP task moves ended bookings to Awaiting Completion and creates the notification. The same check runs on calendar requests. | FR-13 (proposed) |

## 5. REQUIREMENTS-TO-DESIGN TRACEABILITY

| Requirement | Design element | Entities |
| --- | --- | --- |
| FR-01 | PHP authentication, sessions, primary-owner account administration, failed-login lockout | USERS |
| FR-02 | Customer screens with search and booking history | CUSTOMERS, BOOKINGS |
| FR-03 | Package management with promotion periods and deposit requirements | PACKAGES |
| FR-04 | Booking forms, status workflow, snapshots, theme notes | BOOKINGS |
| FR-05, FR-17 | Consolidated calendar with periodic refresh | BOOKINGS, SERVICES, AVAILABILITY_BLOCKS |
| FR-06, FR-16 | Blocked-interval overlap check using default and per-booking allowances | BOOKINGS, SERVICES, AVAILABILITY_BLOCKS |
| FR-07 | Conflict screen and override with required reason | BOOKING_CONFLICT_OVERRIDES |
| FR-08 | Availability block management | AVAILABILITY_BLOCKS |
| FR-09 | Payment recording and balance calculation | PAYMENTS |
| FR-10 | Deposit and itemized deductions | DEPOSITS, DEPOSIT_DEDUCTIONS |
| FR-11 | Checklist templates copied into booking checklists | CHECKLIST_TEMPLATES, CHECKLIST_TEMPLATE_ITEMS, BOOKING_CHECKLIST_ITEMS |
| FR-12 | Delivery record | DELIVERY |
| FR-13 | Awaiting Completion status, persistent notification, post-event review, manual release | BOOKINGS, NOTIFICATIONS, BOOKING_CHECKLIST_ITEMS |
| FR-14 | Report queries (collected revenue, balances, deposits, deductions, overlaps, popularity) | PAYMENTS, DEPOSITS, DEPOSIT_DEDUCTIONS, BOOKINGS, BOOKING_CONFLICT_OVERRIDES |
| FR-15 | Audit logging of sensitive actions | AUDIT_LOGS |
| NFR-01 to NFR-04 | Bootstrap layout, indexed queries, HTTPS and password hashing, snapshot and history retention | All |

## 6. OPEN ITEMS BEFORE DEVELOPMENT

- Confirm the authentication approach (username and password, or a simple PIN) based on the owners' comfort with technology. NFR-03 requires hashed credentials and failed-login protection, which a short PIN would weaken.

- Confirm whether the existing staff member will need access in a later release, and which functions would be permitted, before any staff role is added to USERS (DEF-07).

- Confirm default preparation and travel allowances for each service (Q12 mentions 30-minute preparation at fast-food venues), and confirm whether Balloon Decoration is limited to one booking at a time (Q2).

- Confirm package, deposit, and down-payment rules (Q6, Q11, Q14), and obtain the owner's current equipment checklist format (Q15) for the template design.

- Confirm the cancellation rules for recorded payments and how retained deposit deductions appear in financial reports.

- Confirm hosting that supports HTTPS and, preferably, scheduled tasks before deployment (NFR-03, FR-13).

- Offline transaction recording and automatic synchronization remain deferred (DEF-01) and need a separate client assessment. If approved later, the transactions that must work offline and the synchronization and conflict-review rules must be defined and the design extended.
