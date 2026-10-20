# Manual Booking QA — Common Instructions

## Purpose

This folder divides a complete booking-process audit among four testers. Each tester has a separate instruction file, report, evidence folder, Git branch, and local QA database. All four testers may run simultaneously after completing the [Simultaneous Testing Setup](Simultaneous-Testing-Setup.md). There is no shared live database. The goal is to test booking creation through scheduling, payments, equipment release, return inspection, completion, notifications, reporting, audit history, and offline synchronization.

This is a manual browser test plan. Do not change application code while executing it. Use fictional data only.

## Read this first

Read these common rules, open only your tester's instruction file, complete its scenarios from top to bottom, and record each result in your separate report immediately after the test.

### Quick navigation

| Tester | Start here | Scenario instructions | Finish here |
| --- | --- | --- | --- |
| Tester 1 | [Complete setup](Tester-1/Setup.md) | [Scenarios 1–10 and 41–44](Tester-1/Instructions.md) | [Report](Tester-1/Report.md) |
| Tester 2 | [Complete setup](Tester-2/Setup.md) | [Scenarios 11–20 and 45–48](Tester-2/Instructions.md) | [Report](Tester-2/Report.md) |
| Tester 3 | [Complete setup](Tester-3/Setup.md) | [Scenarios 21–30 and 49–52](Tester-3/Instructions.md) | [Report](Tester-3/Report.md) |
| Tester 4 | [Complete setup](Tester-4/Setup.md) | [Scenarios 31–40 and 53–55](Tester-4/Instructions.md) | [Report](Tester-4/Report.md) |

### Meaning of each outcome

| Outcome | Use it when |
| --- | --- |
| **PASS** | The actual result matches every expected result after refresh/reopen. |
| **FAIL** | The application behaves incorrectly, loses data, duplicates data, or shows inconsistent screens. |
| **BLOCKED** | A setup or earlier failure prevents the scenario from reaching the behavior being tested. |
| **NOT RUN** | The scenario was intentionally not attempted. State why. |

### How to complete the report

Each result uses a Test ID made from the tester, scenario, and test date:

```text
T<tester>-S<scenario>-<YYYY-MM-DD>
```

Example: `T1-S03-2026-10-21` means Tester 1, Scenario 3, tested on October 21, 2026.

| Field | What to enter |
| --- | --- |
| **Test ID** | Replace `YYYY-MM-DD` with the actual test date. |
| **Result** | Enter exactly one: `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. |
| **Booking ID** | After saving, open **Bookings** and copy the number in the first column or the booking-detail title. Use `N/A` if no booking was created. For multiple bookings, separate the IDs with commas. |
| **Notes / Bug ID** | Enter a short observation or Bug ID such as `T1-BUG-01`. Use `None` when nothing needs to be added. Screenshots are identified by their filenames in the assigned `Evidence/` folder, not linked in the report. |

The Test ID does not replace the Booking ID. Copy the visible booking number—not the customer ID or payment reference. If an offline booking still shows `Offline draft`, record that text and replace it with the server Booking ID after synchronization.

Example rows:

```md
| T1-S01-2026-10-21 | PASS | 16 | Correct after refresh. |
| T1-S03-2026-10-21 | FAIL | 17 | T1-BUG-01 — Package missing after refresh. |
| T1-S09-2026-10-21 | PASS | N/A | Invalid attempt created no booking, as expected. |
| T2-S11-2026-10-22 | BLOCKED | N/A | MySQL was unavailable. |
```

Use Bug IDs such as `T1-BUG-01` or `T3-BUG-02`. Describe each application defect once under **Problems found** in the tester report. A setup blocker needs a note but not an application Bug ID.

### Simple working method

1. Read only one scenario.
2. Prepare the exact data written under **Book** or **Setup**.
3. Perform the **Steps** in order.
4. Refresh or reopen before comparing with **Expected**.
5. Fill in your tester report immediately.
6. If it failed, add a short row to your bug list and complete one detailed bug record.

### Severity guide

| Severity | Meaning |
| --- | --- |
| **Critical** | Data loss, security exposure, major financial error, or the complete booking flow cannot continue. |
| **High** | A main booking step fails and there is no safe practical workaround. |
| **Medium** | The feature works only with a workaround or screens show materially inconsistent information. |
| **Low** | Wording, layout, minor feedback, or another problem that does not stop the workflow. |

## Shared test instructions

1. Run the project locally on the current tester's laptop using that laptop's own XAMPP/MySQL installation and local application URL. Do not connect to another tester's laptop.
2. Sign in with an authorized synthetic owner account. Never record passwords, tokens, or real customer information.
3. Before each tester starts, import the agreed clean test-database baseline. Record the baseline file or Git commit and the starting counts for bookings, customers, payments, and pending-sync operations.
4. Run scenarios in order within your assigned section. Other testers may run simultaneously only in their own isolated database and Git branch.
5. After every save, refresh or leave and reopen the record. A success message alone is not a PASS.
6. Compare reference, customer, schedule, service, package, amount, payment state, booking status, and selected tab across every named screen.
7. Capture a screenshot for every FAIL or BLOCKED result without exposing credentials or tokens.
8. Do not retry a successful create action. If the response is unclear, search Bookings and Customers first to avoid duplicates.
9. Preserve failed records as evidence. Delete only when a scenario explicitly requires it.
10. Prefix temporary catalog records with `TEMP QA`, restore them before ending your session, and verify restoration.
11. Report network, PHP, MySQL, login, or environment failures as setup blockers unless the application handles the failure incorrectly.
12. Use only PASS, FAIL, BLOCKED, or NOT RUN. Record the visible Booking ID and actual result for every scenario.

## Tester assignments

| Tester | Scenarios | Contact range | Suggested dates | Primary focus |
| --- | ---: | --- | --- | --- |
| Tester 1 | 1–10 and 41–44 | `09171000101`–`09171000114` | January 4–30, 2027 | Creation, catalog, pricing, editing, validation |
| Tester 2 | 11–20 and 45–48 | `09172000101`–`09172000114` | February 2–28, 2027 | Availability, conflicts, status, cancellation |
| Tester 3 | 21–30 and 49–52 | `09173000101`–`09173000114` | March 2–28, 2027 | Payments, deposits, delivery, reporting |
| Tester 4 | 31–40 and 53–55 | `09174000101`–`09174000113` | April 2–26, 2027 | Checklist, release, return, notifications, offline sync |

Each tester uses an independent local database restored from the same clean baseline. Do not pass the previous tester's live MySQL data to the next tester and do not rely on records created by another tester. Dependencies inside a ten-scenario section are created by that same tester.

At the end of a session, the tester must:

1. Finish the summary and bug table in the assigned tester report.
2. Save evidence in that report's `Evidence/` folder.
3. Export a database copy only for defect evidence when needed; do not use it as the next tester's baseline.
4. Restore any `TEMP QA` catalog change.
5. Send the completed report and evidence to the coordinator.
6. Tell the coordinator that the tester branch is ready for review.

The coordinator combines the four reports after all four tester branches are ready. Cross-tester comparison uses the written reports and screenshots, not a shared live database.

## Tester files

The coordinator starts with the [Simultaneous Testing Overview](Simultaneous-Testing-Setup.md). Each tester starts with the `Setup.md` inside their own folder.

Each tester reads their own instructions and records environments, outcomes, Booking IDs, notes, bugs, and summaries only in their assigned report. Screenshots go only in the assigned `Evidence/` folder:

- Tester 1: [Setup](Tester-1/Setup.md) · [Instructions](Tester-1/Instructions.md) · [Report](Tester-1/Report.md)
- Tester 2: [Setup](Tester-2/Setup.md) · [Instructions](Tester-2/Instructions.md) · [Report](Tester-2/Report.md)
- Tester 3: [Setup](Tester-3/Setup.md) · [Instructions](Tester-3/Instructions.md) · [Report](Tester-3/Report.md)
- Tester 4: [Setup](Tester-4/Setup.md) · [Instructions](Tester-4/Instructions.md) · [Report](Tester-4/Report.md)
- Coordinator: [Consolidated Report](Consolidated-Report.md)

Each tester edits only their own report and `Evidence/` folder. The coordinator updates the consolidated report after all four handoffs.

