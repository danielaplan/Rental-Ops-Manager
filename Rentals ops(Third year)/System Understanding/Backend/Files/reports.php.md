---
title: "reports.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# reports.php

## In plain language

**The shared-record summary.** This file summarizes accepted database records into booking counts, revenue figures and other report values.

**Where it lives:** `api/reports.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

The owners look at October events and see Ana’s booking and its paid amount included in the summary.

## What happens

1. Read saved bookings and related information.
2. Apply event-date filters where the report supports them.
3. Calculate counts, paid amounts and outstanding balances.

## What the documentation team should remember

Income here follows event dates and booking paid summaries, not the dates money was collected. Some inventory figures remain placeholders.

Read [[System Understanding/Workflows/Reports]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

**Location:** `api/reports.php`

Calculates dashboard and booking/date-range report summaries.

### Routes or callable helpers

?do=dashboard; ?do=report&start=YYYY-MM-DD&end=YYYY-MM-DD. Intended usage GET; script branches on do rather than method.

### Access

Any authenticated owner/staff, for every route.

### Inputs

Optional start/end interpreted as event-date bounds; invalid dates become absent filters.

### How it works

Dashboard: booking counts/status counts, summed amount_paid revenue, active services and next five nonterminal bookings. Report: distinct customers, status counts, amount_paid revenue, outstanding max(total-paid,0), popular primary services; includes damaged_or_missing equipment row count.

### Current limits and details

Revenue is based on BOOKINGS.amount_paid and event_date, not payment transaction dates. Dashboard inventory figures are hardcoded zero. Damaged/missing count is global even on a date-filtered report.

### Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]], [[System Understanding/Database/Tables/CUSTOMERS|CUSTOMERS]], [[System Understanding/Database/Tables/SERVICES|SERVICES]], [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/reports.php](<../../../../api/reports.php>)

Return to [[System Understanding/Start Here|Start Here]].
