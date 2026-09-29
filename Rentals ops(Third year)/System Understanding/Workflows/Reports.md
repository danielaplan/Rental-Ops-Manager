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

reports.php requires authentication and uses SQL aggregation, rather than reading a browser's local drafts. Only accepted database records contribute.

Dashboard counts bookings/statuses, sums BOOKINGS.amount_paid as revenue, counts active services and joins customers for five upcoming nonterminal bookings. Its inventory metrics are currently placeholders set to zero.

The report route optionally filters by inclusive event_date start/end. It counts bookings and distinct customers, sums amount_paid, calculates outstanding balances using max(total-paid,0), and ranks primary service counts. Damaged/missing inspection rows are counted globally, outside that date filter.

For a booking scheduled in October whose payment was collected in September, an October event-date report can include that payment amount through the booking summary. This is not a September payment-date cash ledger. Deposits do not count as rental revenue in this implementation.

Invalid date filters are ignored after asDate() returns null. The route does not supply a dedicated payment-date report, CSV export or true inventory aggregation. Other devices see newly synced records after read/refresh; there is no server push channel in these PHP scripts.

See [[System Understanding/Backend/Files/reports.php|reports.php]], [[System Understanding/Database/Tables/BOOKINGS|BOOKINGS]] and [[System Understanding/Database/Tables/PAYMENTS|PAYMENTS]].

## Source files

- [api/reports.php](<../../../api/reports.php>)

Return to [[System Understanding/Start Here|Start Here]].
