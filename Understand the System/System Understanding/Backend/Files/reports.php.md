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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The shared-record summary.** This file summarizes accepted database records into booking counts, revenue figures and other report values.

**Where it lives:** `api/reports.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

The owners look at October events and see Ana’s booking and its paid amount included in the summary.

## What happens

1. Read saved bookings and related information.
2. Apply event-date filters where the report supports them.
3. Calculate counts, paid amounts and outstanding balances.

## Key points

Income here follows event dates and booking paid summaries, not the dates money was collected. Some inventory figures remain placeholders.

Read [Reports](../../Workflows/Reports.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

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

Includes: [config.php](config.php.md), [auth.php](auth.php.md)

Tables: [BOOKINGS](../../Database/Tables/BOOKINGS.md), [CUSTOMERS](../../Database/Tables/CUSTOMERS.md), [SERVICES](../../Database/Tables/SERVICES.md), [EQUIPMENT_CHECKLIST](../../Database/Tables/EQUIPMENT_CHECKLIST.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/reports.php](<../../../../api/reports.php>)

## Continue reading

[Previous file: rentalItems.php](rentalItems.php.md) · [Next file: services.php](services.php.md) · [Back to Start Here](../../Start%20Here.md)
