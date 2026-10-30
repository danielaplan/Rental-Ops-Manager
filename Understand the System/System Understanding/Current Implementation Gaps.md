---
title: "Current Implementation Gaps"
date: 2026-10-29
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Current Implementation Gaps

**Guide:** [Start Here](Start%20Here.md) · [System Overview](System%20Overview.md) · [Glossary](Glossary.md) · [Known Limits](Current%20Implementation%20Gaps.md)

## Current limitations and deliberate scope

| Area | Current source/scope | Practical implication |
| --- | --- | --- |
| Availability blockouts | `AVAILABILITY_BLOCKS` and `availabilityBlocks.php` remain in the checkout, but owner-approved scope defers the feature. | Do not expose, extend, or describe it as active without renewed approval. |
| Roles | Schema still allows `staff`; session validation accepts only active `owner` accounts. | Current authenticated product is owner-only. |
| Public reads | Services, packages, add-ons, gallery, and website content have explicit public reads. | Internal business records remain protected; public catalog support does not authorize a public booking workflow. |
| Offline receipts | All receipts/ID maps share growing JSON in `APP_SETTINGS` row 2. | Sync commits serialize on one row and no retention policy exists. |
| Stale detection | Sync `_base` checks selected booking reservation fields. | It is not general conflict detection for every field/entity. |
| Accounting | The app records payments, refunds, deposits, and deductions. | It does not move money or replace formal accounting/reconciliation. |
| Reports | Revenue is Completed payments by payment date; outstanding balance is lifetime and excludes Cancelled bookings; compatibility damaged/missing is global; dashboard inventory is zero. | Date filters do not change the lifetime outstanding balance. Read returned metric definitions and do not overstate date filters. |
| Inventory | Checklists record expected/released/returned quantities. | They do not reserve or decrement a real-time stock pool. |
| Setup | Schema uses `IF NOT EXISTS` tables plus bare indexes; PHP/SQL table-name case differs. | Validate reruns and host configuration. |
| Deployment | TLS/origins, scheduler, representative performance, devices, backups, and client acceptance are external. | Local passing tests do not equal production readiness. |
| Legacy structures | `EQUIPMENT_CHECKLIST`, `BOOKING_ITEMS`, legacy booking columns, and migration tooling remain. | Use revised snapshot/service paths for current behavior; retain legacy records for compatibility/history. |

## Source/requirement contradictions

- Revised design text says online-only/offline deferred; the later owner decision now preserves limited recovery sync only for booking, checklist, and return-inspection drafts.
- Revised design includes internal availability blocks; the later owner decision defers activation even though draft schema/API artifacts remain.
- Revised design lists lifecycle states without Awaiting Payment; the later approved policy and current source add it after service release when rental balance remains.
- Older vault pages described approximately 19 tables, unauthenticated business reads, staff access, first-package defaults, one-service pricing gaps, destructive checklist regeneration, and event-date booking-summary revenue. Current source supersedes those descriptions.

## Possible application concerns recorded, not changed here

- `AVAILABILITY_BLOCKS` can be called directly despite the product decision to defer it; deployment/routing should ensure the unsupported feature is not exposed operationally.
- Dashboard inventory metrics remain placeholders and the report compatibility damaged/missing count is not period-filtered.
- The single-row sync receipt design needs a retention/scaling decision before high-volume production use.


## Technical navigation

[Deployment and Limitations](Deployment%20and%20Limitations.md) · [System Overview](System%20Overview.md) · [Start Here](Start%20Here.md)
