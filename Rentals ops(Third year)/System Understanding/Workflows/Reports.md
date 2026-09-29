---
title: "Reports"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Reports

## The purpose

Reports summarize accepted shared records so the owners can see bookings, recorded rental revenue and outstanding balances. Unsynced local drafts do not contribute yet.

## Follow Ana’s booking into a report

Ana’s event is in October. Her recorded ₱250 rental payment contributes through the booking’s paid summary when that booking is included in the event-date report. Her refundable deposit is separate from rental revenue.

1. The server reads accepted bookings and related records.
2. Where supported, it filters bookings by event date.
3. It counts bookings/customers, summarizes paid amounts and calculates remaining balances.
4. It returns figures that the application can display.

## What the figures do and do not mean

An October report here follows October events, even if money was collected earlier. It is not a payment-date cash ledger. Some dashboard inventory figures remain zero placeholders, and the damaged/missing count is global even when the booking report uses a date range.

## Key points

“These reports summarize the saved booking records, with event dates as the date-filter basis.” Explain that basis beside the figures rather than calling every number a complete accounting report.

See [[System Understanding/Backend/Files/reports.php|reports.php]] and [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]].

## Technical details

This section records exact file behavior, field names and implementation details.

reports.php requires authentication and uses SQL aggregation, rather than reading a browser's local drafts. Only accepted database records contribute.

Dashboard counts bookings/statuses, sums BOOKINGS.amount_paid as revenue, counts active services and joins customers for five upcoming nonterminal bookings. Its inventory metrics are currently placeholders set to zero.

The report route optionally filters by inclusive event_date start/end. It counts bookings and distinct customers, sums amount_paid, calculates outstanding balances using max(total-paid,0), and ranks primary service counts. Damaged/missing inspection rows are counted globally, outside that date filter.

For a booking scheduled in October whose payment was collected in September, an October event-date report can include that payment amount through the booking summary. This is not a September payment-date cash ledger. Deposits do not count as rental revenue in this implementation.

Invalid date filters are ignored after asDate() returns null. The route does not supply a dedicated payment-date report, CSV export or true inventory aggregation. Other devices see newly synced records after read/refresh; there is no server push channel in these PHP scripts.

See [[System Understanding/Backend/Files/reports.php|reports.php]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] and [[System Understanding/Database/Tables/PAYMENTS|PAYMENTS]].

## Source files

- [api/reports.php](<../../../api/reports.php>)

Return to [[System Understanding/Start Here|Start Here]].
