---
title: "reports.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# reports.php

**Location:** `api/reports.php`

Calculates dashboard and booking/date-range report summaries.

## Routes or callable helpers

?do=dashboard; ?do=report&start=YYYY-MM-DD&end=YYYY-MM-DD. Intended usage GET; script branches on do rather than method.

## Access

Any authenticated owner/staff, for every route.

## Inputs

Optional start/end interpreted as event-date bounds; invalid dates become absent filters.

## How it works

Dashboard: booking counts/status counts, summed amount_paid revenue, active services and next five nonterminal bookings. Report: distinct customers, status counts, amount_paid revenue, outstanding max(total-paid,0), popular primary services; includes damaged_or_missing equipment row count.

## Current limits and details

Revenue is based on BOOKINGS.amount_paid and event_date, not payment transaction dates. Dashboard inventory figures are hardcoded zero. Damaged/missing count is global even on a date-filtered report.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]], [[System Understanding/Database/Tables/CUSTOMERS|CUSTOMERS]], [[System Understanding/Database/Tables/SERVICES|SERVICES]], [[System Understanding/Database/Tables/EQUIPMENT_CHECKLIST|EQUIPMENT_CHECKLIST]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/reports.php](<../../../../api/reports.php>)

Return to [[System Understanding/Start Here|Start Here]].
