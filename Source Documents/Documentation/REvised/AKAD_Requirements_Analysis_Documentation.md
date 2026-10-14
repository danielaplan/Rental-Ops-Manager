SAD 101 · SYSTEMS ANALYSIS AND DESIGN

# Requirements Analysis and Documentation

Client: AKAD Sweet Party Rentals

Evidence basis: stakeholder interview conducted August 20, 2026 with the owner of AKAD Sweet Party Rentals (Interview Guide, Q1–Q24).

Scope basis: the revised project proposal (RJDM Collective). The proposal defines the intended project scope. Where it goes beyond what the owner stated in the interview, the additional detail is a proposed refinement that remains pending client approval and is labeled as such throughout this document.

Prepared by: RJDM Collective — Aplan, Manansala, Cruz, Estapia

### Validation status key

| Status label | Meaning |
| --- | --- |
| Confirmed in interview | The owner stated the need directly in the interview. The interview question is cited. |
| Partly confirmed; refinement pending client approval | The core need was stated in the interview. The detailed rules, fields, or values were added by the project team and still require owner approval. |
| Proposed refinement — pending client approval | Introduced by the proposal or the project team. The interview does not state it. It is not a confirmed client requirement until the owner-partners approve it. |
| Technical safeguard — pending client acknowledgment | Needed for correct, secure, or auditable implementation. The owner should be informed and should acknowledge it. |
| Proposed target — pending validation | A measurable target suggested by the project team for owner validation. |

## 1. INTERVIEW FINDINGS SUMMARY

This section separates what the owner actually said (Section 1.1) from how the project team interpreted unclear answers (Section 1.2) and from refinements that the proposal adds and that await client approval (Section 1.3).

### 1.1 Confirmed interview findings

| Finding | Interview source |
| --- | --- |
| AKAD operates three separate service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration. The owner described them as separate services, not bundles. | Q1 |
| The business started in July 2026, with the karaoke service first. | Q3 |
| The business has two owner-partners and one staff member. Delivery is done by Lalamove, by the owners themselves, or customers sometimes collect items at the location. The interview does not say whether the staff member needs a system account or what that person would do in it. | Q4 |
| Customers are mostly birthdays, debuts, and weddings, with larger events also inquiring. Customers are reached through Messenger and phone calls. | Q5, Q6 |
| Current booking steps: contact through Messenger or call, then ask the event location (long distances can be a loss for AKAD), then ask the theme, then inform the customer about the down payment, with a figure of at least PHP 1,000 noted. | Q6 |
| Booking notes are kept in a Messenger group chat. The calendar is a Canva graphic that is edited manually after every booking change. | Q7 |
| The owner reports no double booking. Rentals have limited supply, so karaoke is rented one set at a time. The owner noted that a conflict can arise with the 12-hour package. | Q2, Q8, Q13 |
| Sweet Corner packages are premade with a fixed menu. | Q9 |
| Payments are made through GCash or MariBank. | Q10 |
| Delivery and setup involve a refundable deposit. The renter shoulders the delivery fee, while some packages already include transportation. AKAD can serve any location. | Q11 |
| The most stressful situations are events at fast-food venues (Jollibee and McDonald's), where only about 30 minutes of preparation time is available. | Q12 |
| Sweet Corner items that are returned unwashed are charged against the deposit. The owner uses an equipment checklist in a set format when items are rented out. | Q14, Q15 |
| The owner wants smooth transactions and did not name a specific improvement. | Q16 |
| The system should be primarily an internal admin tool. Unavailable rentals are currently posted on Facebook so customers can see them. | Q17 |
| The owner wants a single calendar of all bookings and automated report generation. | Q18, Q19 |
| The owner values originality and customization. | Q20 |
| Day-to-day devices are desktop/laptop and smartphone. An internet connection is available. | Q21, Q22 |
| No additional information was recorded for the closing question. | Q24 |

### 1.2 Interpretation notes for unclear answers

- Q2 and Q13 (one booking at a time): The notes say karaoke and Sweet Corner rentals are limited by supply, so they are booked one at a time. The same notes describe Balloon Decoration as "scheduling" and do not say how many balloon bookings can run at once. The proposal applies one booking at a time to all three services, so this is treated as a proposed rule for Balloon Decoration until the owner confirms it.

- Q6 ("download, atleast 1000"): Read as a down payment of at least PHP 1,000. Whether this is a fixed rule, and whether it applies to every service, is not confirmed.

- Q4 ("self service"): Read as owner-delivered. "Picked up at the location" is read as customer self-pickup.

- Q13 (12-hour package): Read as the situation where a booking occupies a service long enough to conflict with another. This supports time-interval booking rather than whole-day blocking, but the owner has not stated this rule.

- Q23 (peak season): The answer mentions camping rentals and a summer peak, which does not match AKAD's three confirmed services. It is flagged for clarification and not used as a requirement. Camping rentals remain out of scope.

### 1.3 Proposed refinements awaiting client approval

The following items come from the project proposal and the project team. They are not stated in the interview. They are included in the requirements so the design can proceed, and each must be approved by the owner-partners.

| Proposed refinement | Proposal reference | What the owner must confirm |
| --- | --- | --- |
| Owner-only access with one primary owner who can administer the other owner account | §2.5, §6.1 | Owner-only access, account administration, and whether the staff member needs access later |
| Preparation and travel allowances that extend an event into a blocked interval | §2.1, §6.1 | Default minutes per service, and the blocked-interval formula |
| Same-service conflict detection applied to all three services, including Balloon Decoration | §2.1, §6.1 | Whether Balloon Decoration is also limited to one booking at a time |
| Owner-approved overlap with a recorded reason | §6.1 | The approval procedure and what must be shown before approval |
| Owner-defined availability blocks | §2.3, §6.1 | Whether blocks are needed and how they are used |
| Owner control of regular and promotional packages for any service, with price snapshots in bookings | §2.3, §6.1 | Package rules, promotion periods, durations, deposit requirements |
| Multiple payments per booking with optional GCash/MariBank reference numbers | §2.3, §6.1 | Payment types and any minimum down payment |
| Multiple itemized deposit deductions for cleaning, missing, or damaged items | §2.3, §6.1 | Deposit amounts and which services require a deposit |
| Reusable checklist templates copied to booking-specific checklists | §6.1 | The owner's existing checklist format (Q15) |
| Awaiting Completion status, persistent notification, post-event review, and manual service release | §2.3, §6.1 | The review steps and the release rule |
| Audit history of sensitive owner actions | §6.1 | Acknowledgment of the audit scope |
| Report definitions (collected revenue, balances, deposits, deductions, overlaps) | §6.1 | Report list and the revenue definition |
| Calendar refresh within 30 seconds, three-second response target, and security safeguards | Not in the proposal; added by the project team | Acceptance of these technical targets |
| Optional theme/customization notes on a booking | Not in the proposal; suggested by Q6 and Q20 | Whether the owner wants this field |

Offline transaction recording and automatic synchronization are deferred pending a separate client assessment. They are not part of the initial baseline.

## 2. CATEGORIZED & PRIORITIZED REQUIREMENTS (MOSCOW)

Requirements are classified as Functional or Non-Functional and prioritized using MoSCoW. The validation status column uses the key defined at the start of this document.

| ID | Requirement | Type | Priority | Source | Validation status |
| --- | --- | --- | --- | --- | --- |
| FR-01 | The system shall authenticate each owner through an individual active account, provide logout and session controls, and allow the designated primary owner to administer the other owner account. | Functional | Must | Q4, Q17; Proposal §6.1 | Proposed refinement — pending client approval |
| FR-02 | The system shall allow the owner to create, update, search, and view customers and their booking histories. | Functional | Must | Q5–Q7 | Partly confirmed; refinement pending client approval |
| FR-03 | The system shall allow the owner to create, update, activate, and deactivate regular and promotional packages for any service. | Functional | Must | Q9; Proposal §6.1 | Partly confirmed; refinement pending client approval |
| FR-04 | The system shall allow the owner to create, edit, cancel, confirm, complete, and retain bookings, each for one service, with an optional package and optional theme/customization notes. | Functional | Must | Q1, Q6, Q7, Q20 | Partly confirmed; refinement pending client approval |
| FR-05 | The system shall display a consolidated calendar for JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration. | Functional | Must | Q7, Q18 | Confirmed in interview |
| FR-06 | The system shall detect overlapping bookings for the same service using event, preparation, travel, and availability-block intervals. | Functional | Must | Q2, Q8, Q12, Q13; Proposal §2.1 | Partly confirmed; refinement pending client approval |
| FR-07 | The system shall display the conflict details and allow an owner to authorize a detected overlap only after entering a reason. | Functional | Should | Proposal §6.1 | Proposed refinement — pending client approval |
| FR-08 | The system shall allow the owner to create, activate, and deactivate service availability blocks. | Functional | Should | Q17; Proposal §6.1 | Proposed refinement — pending client approval |
| FR-09 | The system shall record multiple payments for a booking, including amount, type, method, status, date, optional reference, and recording owner. | Functional | Must | Q6, Q10 | Partly confirmed; refinement pending client approval |
| FR-10 | The system shall record an optional refundable deposit and multiple itemized deductions. | Functional | Should | Q11, Q14 | Partly confirmed; refinement pending client approval |
| FR-11 | The system shall create reusable checklist templates and copy them into booking-specific equipment checklists. | Functional | Should | Q15 | Partly confirmed; refinement pending client approval |
| FR-12 | The system shall record delivery method, fee, fee responsibility, and delivery notes. | Functional | Should | Q4, Q11 | Confirmed in interview |
| FR-13 | The system shall place an ended booking in Awaiting Completion, keep the service unavailable, and notify the owner until post-event review and manual release are completed. | Functional | Must | Proposal §2.3, §6.1 | Proposed refinement — pending client approval |
| FR-14 | The system shall generate reports on collected revenue, balances, deposits, deductions, upcoming bookings, cancellations, overlaps, and frequently booked services or packages. | Functional | Should | Q19; Proposal §6.1 | Partly confirmed; refinement pending client approval |
| FR-15 | The system shall record sensitive owner actions in an audit history that owners can view. | Functional | Should | Proposal §6.1 | Technical safeguard — pending client acknowledgment |
| FR-16 | The system shall let the owner set default preparation and travel allowances for each service and override them for an individual booking. | Functional | Must | Q12; Proposal §2.1, §6.1 | Proposed refinement — pending client approval |
| FR-17 | The system shall refresh the calendar automatically at intervals of no more than 30 seconds while the owner is online. | Functional | Should | Project team refinement | Proposed refinement — pending client approval |
| NFR-01 | The system shall support desktop, laptop, and smartphone screens. | Non-Functional | Must | Q21 | Confirmed in interview |
| NFR-02 | Normal booking and availability operations shall respond within three seconds under expected owner usage and normal network conditions. | Non-Functional | Should | Project team target | Proposed target — pending validation |
| NFR-03 | The system shall use password hashing, authenticated sessions, HTTPS, server-side validation, and failed-login protection. | Non-Functional | Must | Security design | Technical safeguard — pending client acknowledgment |
| NFR-04 | The system shall retain historical booking, package-price, payment, deduction, checklist, status, override, and audit information. | Non-Functional | Must | Proposal §2.3, §5.2 | Technical safeguard — pending client acknowledgment |

### 2.1 Deferred Requirements

| ID | Deferred requirement | Reason |
| --- | --- | --- |
| DEF-01 | Offline transaction recording and automatic synchronization | Requires separate client assessment and significantly increases implementation complexity. The owner reported having an internet connection (Q22). |
| DEF-02 | Public customer-facing self-service booking portal | The owner described the system as primarily an internal admin tool (Q17). |
| DEF-03 | Automatic service release after an event | Owner post-event review and manual release are required (Proposal §2.3). |
| DEF-04 | Map-based routing, distance calculation, and delivery pricing | Delivery fees and travel allowances are entered manually. |
| DEF-05 | Serial-number-level equipment inventory | Package checklist templates and booking-specific checklists are sufficient for the initial release. |
| DEF-06 | Additional unconfirmed service lines (for example, camping rentals) | Only the three confirmed services are included (Q23 is unresolved). |
| DEF-07 | Staff accounts and staff permissions | Staff access is excluded unless the client later validates the responsibilities and permissions (Q4; Proposal §6.1). |

## 3. FORMAL REQUIREMENT STATEMENTS

Every active requirement has a measurable statement, source, priority, acceptance criteria, test case, and validation status. Requirements that originate from the proposal or the project team remain subject to owner sign-off.

### FR-01 — Type: Functional Priority: Must

Statement: The system shall authenticate each owner through an individual active account, provide logout and session controls, and allow the designated primary owner to administer the other owner account.

Source: Q4, Q17; Proposal §6.1

Acceptance Criteria: An active owner account with valid credentials can log in. Invalid or inactive credentials are rejected. Logging out ends the session. Only the primary owner can create, deactivate, or reset the other owner account. No staff or customer accounts exist in the initial release.

Test Case: TC-01

Validation Status: Proposed refinement — pending client approval

### FR-02 — Type: Functional Priority: Must

Statement: The system shall allow the owner to create, update, search, and view customers and their booking histories.

Source: Q5–Q7

Acceptance Criteria: The owner can create and update a customer (name, contact number, Messenger handle), find the customer through search, and view all bookings linked to that customer.

Test Case: TC-02

Validation Status: Partly confirmed; refinement pending client approval

### FR-03 — Type: Functional Priority: Must

Statement: The system shall allow the owner to create, update, activate, and deactivate regular and promotional packages for any service.

Source: Q9; Proposal §6.1

Acceptance Criteria: The owner can create a package containing a name, description, inclusions, price, duration, deposit requirement, promotion period, and status. An inactive package, or a promotional package outside its promotion period, cannot be selected for a new booking but remains visible in historical bookings.

Test Case: TC-03

Validation Status: Partly confirmed; refinement pending client approval

### FR-04 — Type: Functional Priority: Must

Statement: The system shall allow the owner to create, edit, cancel, confirm, complete, and retain bookings, each for one service, with an optional package and optional theme/customization notes.

Source: Q1, Q6, Q7, Q20

Acceptance Criteria: A booking cannot be saved without its customer, service, date, start time, end time, and location. A saved booking receives a unique reference and retains its package name, package price, and agreed total. Booking status is one of Pending, Confirmed, Awaiting Completion, Completed, or Cancelled. A cancelled booking stays in history with its reason. Payment status (Unpaid, Partially Paid, Fully Paid) is derived from the outstanding balance.

Test Case: TC-04

Validation Status: Partly confirmed; refinement pending client approval

### FR-05 — Type: Functional Priority: Must

Statement: The system shall display a consolidated calendar for JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decoration.

Source: Q7, Q18

Acceptance Criteria: All test bookings display the correct service, client, date, time, and status on one calendar. Approved overlaps are visibly marked.

Test Case: TC-05

Validation Status: Confirmed in interview

### FR-06 — Type: Functional Priority: Must

Statement: The system shall detect overlapping bookings for the same service using event, preparation, travel, and availability-block intervals.

Source: Q2, Q8, Q12, Q13; Proposal §2.1

Acceptance Criteria: Only Confirmed and Awaiting Completion bookings and active availability blocks block a service. A proposed same-service booking whose blocked interval overlaps any of them is identified as a conflict, including at the moment a Pending booking is confirmed. A booking for a different service remains permitted when that service has no conflict. An Awaiting Completion booking keeps blocking its service until the owner releases it.

Blocked start = Event start − Preparation minutes

Blocked end = Event end + Travel minutes

Test Case: TC-06

Validation Status: Partly confirmed; refinement pending client approval

### FR-07 — Type: Functional Priority: Should

Statement: The system shall display the conflict details and allow an owner to authorize a detected overlap only after entering a reason.

Source: Proposal §6.1

Acceptance Criteria: The conflict screen shows the affected booking, client, schedule, and service. The owner can change the schedule, cancel a booking, or authorize the overlap. The system does not authorize an overlap without a reason. A successful override records the affected bookings, approving owner, reason, and timestamp, and the overlap remains visibly marked.

Test Case: TC-07

Validation Status: Proposed refinement — pending client approval

### FR-08 — Type: Functional Priority: Should

Statement: The system shall allow the owner to create, activate, and deactivate service availability blocks.

Source: Q17; Proposal §6.1

Acceptance Criteria: An active block appears in the availability result and prevents ordinary booking confirmation for the affected service and interval. A block without a service applies to all services. A deactivated block no longer prevents confirmation but remains in history.

Test Case: TC-08

Validation Status: Proposed refinement — pending client approval

### FR-09 — Type: Functional Priority: Must

Statement: The system shall record multiple payments for a booking, including amount, type, method, status, date, optional reference, and recording owner.

Source: Q6, Q10

Acceptance Criteria: The owner can record multiple payments for one booking. Payment methods are GCash and MariBank. Completed booking payments reduce the outstanding balance. Payment references are optional. Refundable deposits are not counted as booking payments.

Outstanding balance = Agreed total − Completed booking payments

Test Case: TC-09

Validation Status: Partly confirmed; refinement pending client approval

### FR-10 — Type: Functional Priority: Should

Statement: The system shall record an optional refundable deposit and multiple itemized deductions.

Source: Q11, Q14

Acceptance Criteria: With test data of a PHP 1,000 deposit and deductions of PHP 100 and PHP 250, the system calculates a refundable amount of PHP 650. These figures are test data, not business rules. A deduction that would make total deductions exceed the amount held is rejected. Each deduction records the item or description, reason, amount, recording owner, and date.

Refundable amount = Deposit held − Total itemized deductions

Test Case: TC-10

Validation Status: Partly confirmed; refinement pending client approval

### FR-11 — Type: Functional Priority: Should

Statement: The system shall create reusable checklist templates and copy them into booking-specific equipment checklists.

Source: Q15

Acceptance Criteria: Selecting a package with a checklist template creates booking-specific items with expected, released, and returned quantities and release and return conditions. Changing the template afterward does not change a checklist already stored for a booking.

Test Case: TC-11

Validation Status: Partly confirmed; refinement pending client approval

### FR-12 — Type: Functional Priority: Should

Statement: The system shall record delivery method, fee, fee responsibility, and delivery notes.

Source: Q4, Q11

Acceptance Criteria: The owner can record self-pickup, Lalamove, or owner-delivered as the method, the fee, who is responsible (customer, included in package, or owner), and notes.

Test Case: TC-12

Validation Status: Confirmed in interview

### FR-13 — Type: Functional Priority: Must

Statement: The system shall place an ended booking in Awaiting Completion, keep the service unavailable, and notify the owner until post-event review and manual release are completed.

Source: Proposal §2.3, §6.1

Acceptance Criteria: When the blocked end time is reached, the booking moves to Awaiting Completion, the service remains unavailable, and an action-required notification appears and persists. The post-event review records equipment return, deductions, outstanding payments, and service readiness. The service becomes available only after the owner completes the review and manually releases it; the booking then becomes Completed.

Test Case: TC-13

Validation Status: Proposed refinement — pending client approval

### FR-14 — Type: Functional Priority: Should

Statement: The system shall generate reports on collected revenue, balances, deposits, deductions, upcoming bookings, cancellations, overlaps, and frequently booked services or packages.

Source: Q19; Proposal §6.1

Acceptance Criteria: Monthly Collected Revenue equals completed booking payments whose payment dates fall within the selected month. Pending payments, failed payments, unpaid balances, and refundable deposits are excluded. Deposits held and deductions are reported separately. The reports also list upcoming bookings, cancellations, approved overlaps, and the most frequently booked services and packages.

Test Case: TC-14

Validation Status: Partly confirmed; refinement pending client approval

### FR-15 — Type: Functional Priority: Should

Statement: The system shall record sensitive owner actions in an audit history that owners can view.

Source: Proposal §6.1

Acceptance Criteria: Booking cancellations, approved overlaps, package-price changes, payment changes, deposit deductions, refunds, post-event completion, service release, and owner-account changes record the owner, action, affected record, description, and timestamp. Audit entries cannot be edited or deleted through the system interface.

Test Case: TC-15

Validation Status: Technical safeguard — pending client acknowledgment

### FR-16 — Type: Functional Priority: Must

Statement: The system shall let the owner set default preparation and travel allowances for each service and override them for an individual booking.

Source: Q12; Proposal §2.1, §6.1

Acceptance Criteria: The owner can set default minutes per service. A new booking uses the service defaults, and the owner can override either value for that booking only. Allowances cannot be negative. Changing a default does not alter existing bookings.

Test Case: TC-20

Validation Status: Proposed refinement — pending client approval

### FR-17 — Type: Functional Priority: Should

Statement: The system shall refresh the calendar automatically at intervals of no more than 30 seconds while the owner is online.

Source: Project team refinement

Acceptance Criteria: A booking created or updated on one connected device appears on another connected device within 30 seconds without a full-page reload.

Test Case: TC-21

Validation Status: Proposed refinement — pending client approval

### NFR-01 — Type: Non-Functional Priority: Must

Statement: The system shall support desktop, laptop, and smartphone screens.

Source: Q21

Acceptance Criteria: Customer, package, booking, payment, deposit, checklist, notification, and report workflows remain usable at representative desktop and smartphone widths without inaccessible controls or horizontal page overflow.

Test Case: TC-16

Validation Status: Confirmed in interview

### NFR-02 — Type: Non-Functional Priority: Should

Statement: Normal booking and availability operations shall respond within three seconds under expected owner usage and normal network conditions.

Source: Project team target

Acceptance Criteria: At least 95% of measured normal booking and availability requests complete within three seconds under expected owner load and normal network conditions.

Test Case: TC-17

Validation Status: Proposed target — pending validation

### NFR-03 — Type: Non-Functional Priority: Must

Statement: The system shall use password hashing, authenticated sessions, HTTPS, server-side validation, and failed-login protection.

Source: Security design

Acceptance Criteria: Passwords are not stored in plain text, unauthenticated requests cannot reach protected functions, server inputs are validated, repeated failed logins are restricted, and the deployed system uses HTTPS.

Test Case: TC-18

Validation Status: Technical safeguard — pending client acknowledgment

### NFR-04 — Type: Non-Functional Priority: Must

Statement: The system shall retain historical booking, package-price, payment, deduction, checklist, status, override, and audit information.

Source: Proposal §2.3, §5.2

Acceptance Criteria: Changing or deactivating a package does not alter the package name, price, agreed total, checklist, payment, deposit, or status history stored in an existing booking.

Test Case: TC-19

Validation Status: Technical safeguard — pending client acknowledgment

## 4. REQUIREMENTS TRACEABILITY MATRIX (RTM)

Each requirement is linked to its interview source or documented rationale. Requirements that come from the proposal or from technical safeguards are identified with their validation status.

| Requirement ID | Requirement summary | Source | Validation status | Test case |
| --- | --- | --- | --- | --- |
| FR-01 | Owner authentication, logout, session control, owner-account administration | Q4, Q17; Proposal §6.1 | Proposed refinement — pending client approval | TC-01 |
| FR-02 | Customer records and booking history | Q5–Q7 | Partly confirmed; refinement pending client approval | TC-02 |
| FR-03 | Regular and promotional package management | Q9; Proposal §6.1 | Partly confirmed; refinement pending client approval | TC-03 |
| FR-04 | Booking lifecycle, statuses, and notes | Q1, Q6, Q7, Q20 | Partly confirmed; refinement pending client approval | TC-04 |
| FR-05 | Consolidated multi-service calendar | Q7, Q18 | Confirmed in interview | TC-05 |
| FR-06 | Same-service overlap detection with allowances and blocks | Q2, Q8, Q12, Q13; Proposal §2.1 | Partly confirmed; refinement pending client approval | TC-06 |
| FR-07 | Owner overlap authorization with required reason | Proposal §6.1 | Proposed refinement — pending client approval | TC-07 |
| FR-08 | Service availability blocks | Q17; Proposal §6.1 | Proposed refinement — pending client approval | TC-08 |
| FR-09 | Multiple booking payments and balance | Q6, Q10 | Partly confirmed; refinement pending client approval | TC-09 |
| FR-10 | Optional deposit and itemized deductions | Q11, Q14 | Partly confirmed; refinement pending client approval | TC-10 |
| FR-11 | Checklist templates copied to booking checklists | Q15 | Partly confirmed; refinement pending client approval | TC-11 |
| FR-12 | Delivery method, fee, and responsibility | Q4, Q11 | Confirmed in interview | TC-12 |
| FR-13 | Awaiting Completion, notification, manual release | Proposal §2.3, §6.1 | Proposed refinement — pending client approval | TC-13 |
| FR-14 | Revenue, balance, deposit, and booking reports | Q19; Proposal §6.1 | Partly confirmed; refinement pending client approval | TC-14 |
| FR-15 | Audit history of sensitive owner actions | Proposal §6.1 | Technical safeguard — pending client acknowledgment | TC-15 |
| FR-16 | Default and per-booking preparation and travel allowances | Q12; Proposal §2.1, §6.1 | Proposed refinement — pending client approval | TC-20 |
| FR-17 | Calendar auto-refresh within 30 seconds | Project team refinement | Proposed refinement — pending client approval | TC-21 |
| NFR-01 | Desktop and smartphone support | Q21 | Confirmed in interview | TC-16 |
| NFR-02 | Three-second response target | Project team target | Proposed target — pending validation | TC-17 |
| NFR-03 | Authentication and security safeguards | Security design | Technical safeguard — pending client acknowledgment | TC-18 |
| NFR-04 | Historical data retention | Proposal §2.3, §5.2 | Technical safeguard — pending client acknowledgment | TC-19 |

### 4.1 Proposal scope coverage

Every in-scope item in the project proposal (Section 6.1) maps to at least one requirement.

| Proposal in-scope item | Requirement(s) |
| --- | --- |
| User and Administrative Access | FR-01, NFR-03, DEF-07 |
| Customer Management | FR-02 |
| Booking Management | FR-04 |
| Package Management | FR-03 |
| Multi-service Calendar | FR-05, FR-17 |
| Payment Tracking | FR-09 |
| Deposit Management | FR-10 |
| Equipment Checklist Management | FR-11 |
| Delivery Management | FR-12 |
| Availability Management | FR-06, FR-08, FR-16 |
| Reporting | FR-14 |
| Conflict Override Management | FR-07 |
| Post-Event Review and Manual Release | FR-13 |
| Audit History | FR-15 |
| Responsive Access | NFR-01 |
| Centralized Database | NFR-04; see System Design |

## 5. USE CASE DIAGRAM

The diagram models the primary interactions between the authenticated Owner and the AKAD Operations and Booking Management System. The initial release provides no staff or customer accounts. Staff access remains subject to later client validation.

![AKAD owner use case diagram](AKAD_UseCase.png)

Figure 1. Owner use case diagram

## 6. NOTES & OPEN ITEMS FOR VALIDATION

- Present a prototype to the owner to validate that the workflow matches actual operations. The owner asked for smoother transactions (Q16) but did not name a specific change.

- Obtain written owner sign-off for owner-focused access, and confirm whether the existing staff member will need access later and for which functions.

- Confirm default preparation and travel allowances for each service. The owner raised the 30-minute preparation window at fast-food venues (Q12). Owners keep the ability to override defaults per booking.

- Confirm whether Balloon Decoration is limited to one booking at a time. The Q2 notes describe it as scheduling-based, while the proposal applies one booking at a time to all services.

- Confirm how the 12-hour karaoke package should block time (Q13), and confirm that bookings block time intervals and not entire days.

- Confirm package rules across all three services: promotional packages, durations, inclusions, and deposit requirements. Confirm whether refundable deposits apply only to Sweet Corner Setup (Q14) or to any package (Q11).

- Confirm whether the PHP 1,000 minimum down payment noted in Q6 is a fixed rule and which services it covers.

- Obtain the owner's current equipment checklist format (Q15) so the checklist templates follow it.

- Confirm the deliberate overlap-approval procedure and what the owner must see before approving an overlap.

- Confirm post-event review steps, whether a booking with an unpaid balance may be released, and the manual-release workflow.

- Confirm cancellation handling, including what happens to recorded down payments.

- Confirm how retained deposit deductions should appear in financial reports. The proposal excludes refundable deposits from collected revenue and reports deductions separately.

- Confirm delivery coverage, minimum booking requirements, distance charges, fee responsibility, and the rules for declining long-distance locations (Q6, Q11).

- Confirm whether theme and customization details (Q6, Q20) should be recorded on bookings, and whether event type should also be recorded.

- The owner currently posts unavailable rentals on Facebook (Q17). The system will not post automatically. Confirm that this remains a manual step.

- Q23 (peak season) referred to camping rentals and a summer peak, which does not match the three service lines. Clarify with the owner and do not assume. The peak season may affect the delivery deadline.

- Budget and system sign-off authority were not covered in the interview and must be confirmed before scope is finalized.

- Offline transaction recording and automatic synchronization remain deferred and need a separate client assessment before becoming active requirements.

- Submit this document to the owner-partners for validation and sign-off before database implementation and development are finalized.
