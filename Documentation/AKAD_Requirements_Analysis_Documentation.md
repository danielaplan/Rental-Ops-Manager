# SAD 101 · Systems Analysis and Design

# Requirements Analysis & Documentation

**Client:** AKAD Sweet Party Rental's

*Basis: Findings from the stakeholder interview conducted August 20, 2026, with the AKAD Sweet Party Rental's owner.*

**Prepared by:** RJDM Collective — Aplan, Manansala, Cruz, Estapia

---

## 1. Interview Findings Summary

The interview confirmed AKAD Sweet Party Rental's operates three separate (not bundled) service lines: JBL Karaoke Rental, Sweet Corner Setup, and Balloon Decorations. The business started in July 2026 with the karaoke service. It is run by 2 owner-partners and 1 staff member, with deliveries handled via Lalamove, self-pickup, or the owners themselves.

Bookings are currently coordinated entirely through a Facebook Messenger group chat for transaction notes, and a manually-edited Canva graphic that is redesigned for every single booking change — a slow, error-prone process that is the clearest opportunity for a system to help. Despite this, the owner reports no double-bookings so far, largely because only one karaoke set is offered at a time.

Payments are collected via GCash or Maribank. The down payment and refundable deposit amounts are negotiated between the owner and client according to each booking's circumstances. The admin has full control to record the agreed amounts; neither has a fixed amount or a mandatory ₱1,000 minimum. Down payments are recorded separately from refundable deposits, which cover cleaning/damage charges — this came up specifically for the Sweet Corner setup, where items must be returned clean. The owner already uses an informal equipment checklist. The owner explicitly does not want a public customer-facing booking portal — the system should remain an internal admin tool — but does want a consolidated calendar view and automated reporting.

---

## 2. Categorized & Prioritized Requirements (MoSCoW)

Requirements are classified as Functional (specific system behavior) or Non-Functional (quality/constraint), then prioritized using MoSCoW based on how directly they address the pain points raised in the interview (manual Canva calendar editing, deposit/cleaning disputes, and the desire to avoid a public booking portal).

| ID | Requirement | Type | Priority | Source (Q#) |
|---|---|---|---|---|
| **FR-01** | Record a new booking (customer name, contact, event date, location, service line) for karaoke, sweet corner, or balloon decoration. | Functional | Must | Q1, Q6 |
| **FR-02** | Display a consolidated calendar showing all bookings across all three service lines in one view, updating live for all connected users. | Functional | Must | Q7, Q18 |
| **FR-03** | Prevent double-booking of the single karaoke set for an already-booked date/time slot. | Functional | Must | Q2, Q8, Q13 |
| **FR-04** | Record down payment / reservation fee amount and status per booking. | Functional | Must | Q6, Q10 |
| **FR-05** | Let staff select from fixed, premade Sweet Corner packages when creating a booking. | Functional | Should | Q9 |
| **FR-06** | Track a refundable equipment/cleaning deposit per booking, including deductions for uncleaned or damaged items. | Functional | Should | Q11, Q14 |
| **FR-07** | Generate automated reports (most-booked service, monthly income, upcoming bookings). | Functional | Should | Q19 |
| **FR-08** | Record delivery method (self-pickup, Lalamove, owner-delivered) and whether the fee is shouldered by the renter or included. | Functional | Should | Q11 |
| **FR-09** | Provide a digital equipment checklist per rental, checked off upon item return. | Functional | Could | Q15 |
| **FR-10** | Let staff mark a service/date as unavailable internally (no public customer-facing booking portal). | Functional | Could | Q17 |
| **NFR-01** | Support offline booking/checklist entry with automatic sync to the central database once internet connectivity returns. | Non-Functional | Must | Q7, Q22 |
| **NFR-02** | System accessible from both desktop/laptop and smartphone devices. | Non-Functional | Should | Q21 |
| **NFR-03** | System usable by 2 owner-partners and 1 staff member without extensive technical training. | Non-Functional | Could | Q4 |
| **NFR-04** | System remains responsive during monthly peak booking periods. | Non-Functional | Could | Q23 |
| **WONT-01** | Public customer-facing self-service online booking portal. | Functional | Won't | Q17 |

---

## 3. Formal Requirement Statements

The following core requirements are written in full "the system shall..." format with measurable acceptance criteria, following the REQ documentation standard covered in class.

**FR-02** — Type: Functional · Priority: Must
**Statement:** The system shall display a single calendar view showing all Karaoke, Sweet Corner, and Balloon Decoration bookings together, replacing the current manually-edited Canva calendar.
**Source:** Interview with AKAD Owner, 08/20/2026 — Q7, Q18
**Acceptance Criteria:** All bookings across the three service lines appear correctly on one calendar screen, with 100% of test bookings displaying the correct date, service type, and status.

**FR-03** — Type: Functional · Priority: Must
**Statement:** The system shall prevent staff from confirming a new karaoke booking on a date and time slot that is already reserved for the single available karaoke set.
**Source:** Interview with AKAD Owner, 08/20/2026 — Q2, Q8, Q13
**Acceptance Criteria:** The system blocks or flags 100% of attempted karaoke bookings that conflict with an existing confirmed karaoke booking on the same date/time.

**FR-06** — Type: Functional · Priority: Should
**Statement:** The system shall allow staff to record a refundable deposit per booking and apply a deduction with a stated reason (e.g., item returned unclean or damaged) before releasing the refund.
**Source:** Interview with AKAD Owner, 08/20/2026 — Q11, Q14
**Acceptance Criteria:** Staff can record a deposit amount, apply a deduction with a required reason field, and the system correctly calculates the final refundable amount for 100% of tested bookings.

**NFR-01** — Type: Non-Functional · Priority: Must
**Statement:** The system shall allow staff to create and update bookings, deposits, and equipment checklist entries while offline, storing changes locally on the device, and shall automatically synchronize all queued changes with the central database once internet connectivity is restored, without manual re-entry.
**Source:** Interview with AKAD Owner, 08/20/2026 — Q7, Q22
**Acceptance Criteria:**
1. An entry made offline is saved locally and labeled "Pending Sync."
2. Once online, 100% of queued changes upload automatically within 30 seconds with no manual re-entry.
3. Other devices reflect synced changes on next load/refresh.
4. Conflicting offline bookings (e.g., same karaoke date entered on two devices) are flagged for staff review during sync rather than silently overwritten.

---

## 4. Requirements Traceability Matrix (RTM)

Each requirement is linked back to its source in the interview to support validation and future impact analysis.

| Req. ID | Requirement Summary | Source | Test Case ID |
|---|---|---|---|
| **FR-01** | Create booking with customer & event details | Interview, AKAD Owner, 08/20/2026 | TC-01 |
| **FR-02** | Consolidated multi-service calendar view | Interview, AKAD Owner, Q7/Q18 | TC-02 |
| **FR-03** | Prevent karaoke double-booking | Interview, AKAD Owner, Q2/Q8/Q13 | TC-03 |
| **FR-04** | Record down payment / reservation fee | Interview, AKAD Owner, Q6/Q10 | TC-04 |
| **FR-05** | Select fixed Sweet Corner package | Interview, AKAD Owner, Q9 | TC-05 |
| **FR-06** | Track refundable deposit & deductions | Interview, AKAD Owner, Q11/Q14 | TC-06 |
| **FR-07** | Generate automated booking/income reports | Interview, AKAD Owner, Q19 | TC-07 |
| **FR-08** | Record delivery method & fee responsibility | Interview, AKAD Owner, Q11 | TC-08 |
| **FR-09** | Digital equipment checklist on return | Interview, AKAD Owner, Q15 | TC-09 |
| **FR-10** | Internal-only unavailability marking | Interview, AKAD Owner, Q17 | TC-10 |
| **NFR-01** | Offline booking/checklist entry with auto-sync | Interview, AKAD Owner, Q7/Q22 | TC-11 |
| **NFR-02** | Multi-device access (desktop + mobile) | Interview, AKAD Owner, Q21 | TC-12 |

---

## 5. Use Case Diagram

The diagram below models the primary interactions between the Staff/Owner (the system's only actor, per the interview finding that no public customer portal is wanted) and the core functions of the proposed AKAD Booking Management System.

![AKAD Booking Management System — Use Case Diagram](images/AKAD_UseCase.png)

The single actor, **Staff / Owner (Admin)**, connects to seven use cases inside the system boundary — confirming the interview finding that there is no separate customer-facing actor:

1. **Create Booking** — the entry point for FR-01, recording a new booking's customer, service, and event details.
2. **Check Calendar Availability** — supports FR-02 (the consolidated calendar) and feeds FR-03's double-booking check for the karaoke set.
3. **Record Payment / Deposit** — covers both FR-04 (down payment/reservation fee) and FR-06 (refundable deposit and deduction tracking) as one combined use case.
4. **Mark Service as Unavailable** — corresponds to FR-10, letting staff block a date/service internally without a public portal.
5. **Manage Equipment Checklist** — corresponds to FR-09, the digital checklist checked off on item return.
6. **Generate Report (Bookings / Income)** — corresponds to FR-07's automated reporting.
7. **Update Booking Status** — the ongoing lifecycle action (e.g., confirming, completing, or cancelling a booking) that keeps BOOKINGS.status current for the calendar and reports.

Notably, **Record Delivery Arrangement (FR-08)** isn't shown as its own use case here — it's likely intended to be folded into Create Booking or Update Booking Status rather than broken out separately, which is worth confirming with the team so the diagram and the requirements table stay aligned.

---

## 6. Notes & Open Items for Validation

- The owner did not name a specific improvement beyond "smoother transactions" (Q16) — worth probing further in a follow-up validation session once a prototype/mockup exists to react to.
- Q23 (peak season) answer referenced "camping rentals" and a summer peak, which doesn't match AKAD's three stated service lines — flagged for clarification with the owner rather than assumed.
- Budget and system sign-off authority were not covered in this round and should be confirmed before finalizing scope.
- This summary should be sent back to AKAD Sweet Party Rental's for validation before the Requirements Specification Document is finalized, per the Confirm/Follow-Up step of the interview process.


## Implementation verification update — 2026-09-28

User-authorized implementation and verification of NFR-01 through NFR-04 engineering work is recorded in [the implementation report](../Implementation/Offline-Sync-Verification-2026-09-28.md). NFR-01 focused live integration and browser outage checks passed; NFR-02 viewport checks passed. NFR-03 remains subject to actual owner/staff usability acceptance. NFR-04 has local synthetic benchmark evidence, with production workload and response targets still to be established. These statuses do not replace the acceptance criteria above or claim production/device/human acceptance.

Down payments and refundable deposits remain separate, negotiable amounts under admin control. FR-10 blockouts remain pending a separate decision.


## Latest session decision ? 2026-09-28: FR-10 remains skipped

The user explicitly confirmed FR-10 blockouts remain skipped at session close. The earlier implementation request is superseded. No FR-10 implementation was made. Resume only after explicit user reauthorization; frontend changes also require new authorization. The requirements definition and Could priority remain unchanged.
