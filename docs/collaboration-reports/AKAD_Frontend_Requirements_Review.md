# AKAD frontend requirements review

Review date: September 18, 2026.

**Documentation revision:** 2026-09-18.1

**Status:** Review complete; identified application changes remain unimplemented. Documentation consistency updated on September 18, 2026.

## Assessment

The current frontend is a working local prototype, but it does not yet satisfy the client's documented requirements. It has useful booking, calendar, payment, inventory, customer, and reporting screens. Several required workflows are absent, and some existing workflows produce incorrect results.

This review focuses on what staff can see and do in the frontend. Central storage, authentication, multi-user conflict enforcement, and synchronization are identified as dependencies rather than treated as features that frontend changes alone can complete.

## Document ownership and current status

The [requirements baseline](../../AKAD_Requirements_Analysis_Documentation.md) defines the client's requested behavior. This report is the canonical implementation assessment and work order for collaborators. Local project memory mirrors this assessment; it is excluded from Git and is not required to understand this report.

Current coverage: 7 Partial, 5 Missing, 2 Unverified, and 1 Scope conflict. These are review classifications, not acceptance-test passes.

The user authorized documentation review, local organization, and consistency updates. Client acceptance and authorization to implement these findings have not been recorded. Staging, committing, and pushing remain manual user actions. Updating this report does not mean the reported defects have been fixed.

Prior project memory records Node.js with Express and Supabase/PostgreSQL as the target architecture. The inspected implementation is HTML/CSS/JavaScript with browser localStorage and mock authentication. References to future PHP endpoints in code comments do not establish an implemented PHP backend or supersede the recorded design direction. Backend setup and the authentication approach remain to be confirmed for implementation.

## Sources and verification

- Requirement baseline: [AKAD_Requirements_Analysis_Documentation.md](../../AKAD_Requirements_Analysis_Documentation.md), especially the MoSCoW table and formal acceptance criteria.
- Context: the existing requirements review, approval record, ideas document, and project memory in the AKAD folder.
- Implementation: the public homepage, admin booking and calendar pages, dashboard/reports, shared JavaScript, storage definitions, and admin styles.
- Browser checks: local preview, demo login, manual booking submission, booking details, return inspection, and a 375 x 812 phone viewport.
- Isolated JavaScript checks: ordinary overlapping booking detection; re-confirming a cancelled booking; monthly date conversion; unpaid booking contribution to the revenue calculation. These checks used temporary in-memory records.

Browser tests created one clearly named REVIEW TEST booking and recorded a return in the local preview's browser storage. They did not change repository source files, any central database, or GitHub. The initial review added this report; subsequent documentation work moved it into docs/collaboration-reports and synchronized related Markdown documents. No application source changes were made. The review is not a full acceptance, security, performance, or cross-device test.

## Requirement coverage

“Partial” means a relevant interface exists but the documented workflow is incomplete or has a verified defect. “Missing” means the required frontend workflow was not found. No percentage is assigned because requirements have different priorities and acceptance conditions.

| Requirement | Priority | Frontend assessment | Evidence and remaining work |
|---|---|---|---|
| FR-01: Record customer, contact, event date/location, and service | Must | Partial | Manual Booking captures the required information and creates a record. However, an end time earlier than the start time can still be submitted. The current details screen offers status changes but no date/location correction or rescheduling form. Editing is relevant to the update workflow in NFR-01; it is not an additional explicit FR-01 acceptance criterion. |
| FR-02: One calendar for all service lines, live for connected staff | Must | Partial | Bookings share one calendar and the popup contains service/time/status details. Calendar chips show only customer names and use status colors, with no service legend. Only three bookings per day are shown; the '+ more' text has no action to reveal the others. No live updates between devices exist. |
| FR-03: Prevent overlapping karaoke bookings | Must | Partial | Ordinary overlap checking works in the create form. Quick Status Update can re-confirm a cancelled booking without checking whether another karaoke booking now occupies the slot. Shared conflict enforcement also requires a central backend. |
| FR-04: Down payment/reservation fee amount and status | Must | Partial | Amount Paid Now, payment history, balances, and payment statuses exist. There is no explicit reservation-fee classification or minimum-payment confirmation rule. The form confirms a booking with zero payment. Maya, mentioned in the interview, is absent from the payment-method choices. |
| FR-05: Fixed Sweet Corner packages | Should | Missing | Sweet Corner is a single service with one price. Generic service add-ons do not implement a fixed package selector with the client's package definitions. |
| FR-06: Refundable deposit, deductions, reason, and refund calculation | Should | Missing | There are no deposit, deduction, mandatory reason, or refundable-balance controls. Return conditions do not provide a deposit/refund workflow. |
| FR-07: Most-booked service, monthly income, upcoming bookings | Should | Partial | Popular-service charts and upcoming bookings exist. A six-month revenue chart also exists on the dashboard, but it counts the full booking total when the amount paid is zero and can assign the wrong month in the Philippines timezone. The Reports page has aggregate totals, status/popularity charts, and damaged/missing items. |
| FR-08: Delivery method and who pays the delivery fee | Should | Missing | There are no structured choices for self-pickup, Lalamove, owner delivery, or renter-paid versus included delivery. A generic Additional Fees field does not capture those distinctions. |
| FR-09: Per-rental equipment return checklist | Could | Partial | Release and return checklists exist. After recording a missing item with zero returned, the return form immediately displays the expected quantity and Good again. Saved notes are not repopulated either. |
| FR-10: Internally mark a service/date unavailable | Could | Missing | There is no service/date blockout form with a reason and period. Switching a service inactive is not equivalent to blocking a particular date or time. |
| NFR-01: Offline entry, Pending Sync, automatic sync, conflict review | Must | Missing | Local browser storage exists. No Pending Sync badges, durable operation queue, reconnect sync, or conflict review screen were found. Dependencies such as jQuery and Bootstrap load from external sites, and no service-worker cache was found, so a reliable offline reload is not established. Backend work is needed for the complete requirement. |
| NFR-02: Desktop and smartphone access | Should | Partial | Responsive layout and mobile navigation exist. At 375 x 812, return-inspection condition and notes fields overflow horizontally, making the workflow awkward on a phone. Other device sizes and workflows remain unverified. |
| NFR-03: Owners and staff can use it without extensive training | Could | Unverified | Client testing is still needed. Customer account terminology and public website administration add complexity to an internal staff tool. Some form labels are not associated with their fields, and calendar chips are clickable divs without native keyboard controls. |
| NFR-04: Responsive during peak periods | Could | Unverified | No representative peak-volume or performance test was performed. A quick demo with seeded records does not establish this requirement. |
| WONT-01: No public customer self-service booking portal | Won't | Scope conflict | The public homepage contains Inquire / Book and Submit Inquiry controls; submitting calls API.createBooking and creates a Pending booking. Staff confirmation is still required, but this is a public customer submission flow and conflicts with the document's explicit internal-only direction unless the client approves an inquiry-only exception. |

## Verified problems in existing workflows

### 1. An invalid time range can become a confirmed booking

In the local browser preview, a karaoke booking for September 18, 2099 with a 3:00 PM start and 2:00 PM end displayed a warning but still saved as Confirmed. It also had zero payment.

The time warning returns without disabling submission, and the submit handler does not independently reject the reversed range. Correct validation must run when submitting as well as when changing fields.

Evidence: [manual-booking.html:239](../../event-rental/admin/manual-booking.html#L239), [submit handler:250](../../event-rental/admin/manual-booking.html#L250), [automatic confirmation:278](../../event-rental/admin/manual-booking.html#L278).

### 2. Quick confirmation bypasses karaoke availability

Reproduction: cancel booking A, create booking B in its old karaoke slot, then change A back to Confirmed through Quick Status Update. The handler calls updateBooking directly without an availability check. An isolated execution of the actual API implementation left two confirmed bookings in the same slot. Ordinary overlap checking correctly returned unavailable in a separate check.

Evidence: [status handler:249](../../event-rental/admin/bookings.html#L249), [updateBooking:273](../../event-rental/js/api.js#L273).

### 3. Return inspection hides saved exceptions

The browser check set Karaoke Machine returned quantity to 0, condition to Missing, and entered a note. After Complete Return Inspection, the booking became Completed but the visible form reset to quantity 1, Good, and an empty note. The handler saves the selected values, but rendering ignores those saved values. Saving again can therefore overwrite an exception with the defaults.

The return form should show the saved returned quantity, condition, and notes. Missing quantities should also be handled consistently: the current summary counts only explicitly selected Missing conditions, and inventory status depends on the condition rather than the quantity shortfall.

Evidence: [return renderer:29](../../event-rental/js/inventory.js#L29), [return save handler:295](../../event-rental/admin/bookings.html#L295).

### 4. Monthly income can include unpaid money and the wrong month

The dashboard's `amount_paid || total || 0` expression uses the full total when amount paid is zero. An unpaid P2,500 booking therefore contributes P2,500 to the chart even though the overall revenue total uses actual amount paid.

The month key is derived by converting local midnight on the first day to UTC. For Asia/Manila, September 1 at midnight becomes August 31 UTC, so the September label can retrieve August bookings. A date conversion check reproduced the August key.

There is also a business-definition choice to settle: income received in a month should normally be grouped by payment date, whereas this chart groups by event date. The requirement should specify whether it wants cash received or event-month revenue, and the labels and calculations should follow that definition.

Evidence: [dashboard month and revenue calculation:198](../../event-rental/admin/dashboard.html#L198), [report totals:421](../../event-rental/js/api.js#L421).

### 5. Payment status can contradict the recorded money

Quick Status Update allows staff to select Fully Paid without recording a corresponding payment or changing the balance. The API explicitly preserves that manually supplied status. For reliable reservation/payment tracking, status should be derived from recorded transactions or any override should follow a defined, auditable rule.

Evidence: [payment status handler:256](../../event-rental/admin/bookings.html#L256), [payment-status override:279](../../event-rental/js/api.js#L279).

### 6. Phone return inspection requires horizontal scrolling

At 375 x 812, the checklist rows extend past the visible modal width. Conditions are partly offscreen and notes require horizontal scrolling. Stack or wrap item controls on narrow screens and keep each quantity/condition/notes group visibly associated with its item.

Evidence: [fixed-width return controls:29](../../event-rental/js/inventory.js#L29), [non-wrapping checklist row:163](../../event-rental/css/admin.css#L163).

## Client-specific mismatches

- The seed data, page title, footer, and default admin branding use Fiesta & Co. rather than AKAD Sweet Party Rental's. These should be aligned before a client demonstration; current runtime settings may differ in another browser.
- The payment choices include Cash, GCash, Bank Transfer, and Other, but not the client's named Maya option.
- Guest / No Account and Registered customer choices imply an account model that is not needed by the documented internal workflow.
- The public inquiry flow exists even though the written scope excludes a public portal. A brochure-only website is a separate scope choice; the requirement conflict concerns customer submission/booking behavior.
- The login is explicitly a demo accepting any username/password. Real staff authentication remains necessary before production use, although implementing that is beyond a frontend-only feature review.

## Corrections to the September 15 assessment

These were errors in the historical September 15 assessment. The current local memory has been corrected to match this report; the notes below preserve why the classifications changed:

1. WONT-01 was marked correctly excluded. The current code contains a public inquiry form that creates Pending bookings, so that classification is incorrect for the present implementation. Evidence: [index.html:249](../../event-rental/index.html#L249), [app.js:265](../../event-rental/js/app.js#L265).
2. FR-03 should not be described as fully covered locally: status changes can bypass the create-form availability check.
3. FR-09 should remain partial until saved return results display correctly and the quantity/condition rules are tested.
4. A monthly trend chart already exists on the dashboard. The next task is to correct its calculation and clarify reporting definitions, not assume the entire monthly view is absent.

## Recommended frontend work order

1. Fix the existing time validation, confirmation availability check, payment-status consistency, and saved return-result display. Add the down-payment confirmation rule after confirming any permitted exceptions.
2. Align the public inquiry flow with the internal-only scope and replace demo branding with verified AKAD details.
3. Extend the booking form with fixed Sweet Corner package selection, explicit down-payment tracking, Maya, delivery method, and fee responsibility.
4. Add the refundable deposit, deduction amount, required reason, remaining refund, and refund-status workflow to booking details/return inspection.
5. Add internal service/date blockouts, visible service labels on the calendar, and an accessible way to show all bookings for a busy day.
6. Correct monthly income calculations and improve phone layouts and field labeling.
7. Add offline/pending-sync/conflict states alongside the central storage and synchronization implementation. Frontend mock states alone must not be marked as passing NFR-01.

The requirements document should continue to represent what the client needs. It should not be weakened merely to match the current prototype. Clarify the actual package names/prices, down-payment exceptions, delivery fees, reporting definition, and any inquiry-only scope exception with the client before final acceptance.

## Open decisions and future updates

- Confirm Sweet Corner package names/prices and any karaoke rental-duration tiers.
- The interview records a minimum P1,000 down payment. Confirm any permitted exceptions and when confirmation requires payment; do not silently treat the minimum as optional.
- Confirm deposit amounts, deduction/refund rules, delivery fee responsibility, and service/date blockout behavior.
- Define monthly income as cash received by payment date or another explicitly agreed measure. Correct both the unpaid-total fallback and local-month conversion.
- Keep WONT-01 internal-only unless the client explicitly approves an inquiry-only exception. No such approval is recorded.
- Resolve the Q23 camping-rentals ambiguity, budget, and formal sign-off authority.
- Confirm implementation setup and authentication against the recorded Node.js/Express and Supabase design direction.

For each future change, update the relevant row and evidence in this report first, then the local Changes, Ideas, and Approval memory files and the original AKAD handoff memory. Keep both Markdown requirements copies aligned when client requirements actually change. Preserve the requirement IDs and priorities; document client-approved scope changes explicitly. Use one documentation revision across that update and retain test limitations. This is a maintenance procedure, not an automatic synchronization service. DOCX files and diagrams are separate artifacts and were not revised in this Markdown update.
