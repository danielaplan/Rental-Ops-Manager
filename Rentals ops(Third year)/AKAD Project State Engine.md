---
title: AKAD Project State Engine
date: 2026-09-22
tags:
  - akad
  - project-management
  - rental-ops-manager
  - documentation
aliases:
  - Project State Engine
  - AKAD State Engine
status: active
---

## Latest session decision ? 2026-09-28: FR-10 remains skipped

The user ended the session and explicitly instructed that FR-10 internal blockouts remain skipped. This supersedes the earlier request to implement them and the subsequent backend-only scope. Do not begin blockout implementation until the user explicitly reauthorizes it. The user's frontend boundary also remains in effect: do not change frontend code without new authorization.

No FR-10 database migration, schema addition, backend endpoint, synchronization handler, or frontend change was made during the blockout discussion. Inspection confirmed that pi/blockouts.php is absent and the schema/sync endpoint contain no blockouts implementation. The existing Implementation/Fix.md is a deferred draft with known corrections required; it is not an active execution instruction. Previously completed offline/payment/inspection work and its recorded evidence remain in place. No files were staged, committed, or pushed.



## Latest implementation and evidence — 2026-09-28

The user authorized offline/synchronization implementation, verification, reporting, and Markdown/memory updates. This section supersedes earlier blanket “fully complete”, mock-auth, ~50% adapter, and “all offline runtime acceptance passed” statements.

- NFR-01: durable per-operation outbox, cached staff pages/assets, IndexedDB snapshots, automatic reconnect/startup/focus/15-second retry, transactional replay receipts, reference mapping, retained conflicts, and stale booking review implemented. Fourteen live PHP/MySQL integration checks passed. Actual Brave backend-outage workflow passed: five operations automatically committed once the test backend recovered, without duplicate records.
- FR-04/FR-06: admin-controlled owner/client negotiated amounts, no fixed or mandatory ₱1,000 minimum. Browser evidence: ₱250 down payment, ₱350 deposit, ₱50 deduction, ₱300 refund. Separate payment/deposit records.
- FR-09: saved returned quantity zero, Missing condition, and notes survive reload and sync; incomplete inspections cannot complete the booking.
- NFR-02: final return form checks passed at 375×812, 812×375, 1366×900 with labeled controls and no clipped return fields/document overflow. Physical smartphone acceptance is still pending.
- NFR-03: interaction/accessibility fixes delivered; real two-owner/one-staff usability acceptance remains pending.
- NFR-04: 10,000-booking synthetic load, three parallel readers: p95 bookings 999 ms, dashboard 194 ms, monthly report 207 ms. Local test environment only; production peak workload/threshold remains to be agreed and measured. No formal numeric threshold exists in the requirements.
- Full snapshots moved to IndexedDB after a browser localStorage quota failure during large-data checks. Bookings render 50 rows per page; calendar uses a date index. Full 10.4 MB periodic booking reads and unbounded sync receipt JSON remain documented scaling limits.
- Tests used only `akad_verify_20260928` and local ports 8017/8018. Verification did not alter production records. No staging/commit/push.
- FR-10 blockouts remain skipped pending a separate decision. Other frontend workflows are not automatically certified by these focused tests.

Offline setup requires an online authenticated session and cached app/data, HTTPS or localhost, and available browser storage. Thirty-second sync is evidenced for the tested small queues, not guaranteed for conflicts, expired authentication, background suspension, unreachable servers, or arbitrarily large queues.

Detailed authoritative implementation evidence: `Implementation/Offline-Sync-Verification-2026-09-28.md`. Raw results: `tests/offline-sync-results.json`, `tests/browser-outage-results.json`, `tests/performance-results.json`. Official requirements retain their priority and acceptance criteria.

## Historical notes (superseded where the latest section differs)



# AKAD Project State Engine

> [!important] Official Documentation Authority
> The complete `/Documentation/` folder is the **official and controlling source of truth** for the AKAD codebase. Every implementation detail—including behavior, scope, data schema, architecture, UI workflows, tests, and supporting project documents—must conform to it.

## Required Tracking Files

Before answering project-state questions or generating/modifying code, always use these three tracking files:

| File | Purpose |
|------|---------|
| `AKAD_Requirements_Changes.md` | Current coverage, gaps, and incomplete requirements |
| `AKAD_Ideas_and_Concepts.md` | Proposed architecture and design concepts |
| `AKAD_Approval.md` | Decisions, blockers, and implementation sign-off status |

> [!note] Derivative Aids
> These tracking files are derivative aids: they may record gaps and plans, but they **cannot override the official documentation** in `/Documentation/`.

## Pre-Flight Workflow

1. Read relevant official files in `/Documentation/`
2. Audit requested feature against the changes file
3. Review the design file
4. Verify the approval file
5. If feature not explicitly approved → **stop and ask for confirmation**
6. After work, update tracking files when gaps, architecture, or approval status change

## Four-Part State Response Format

When asked "Where are we?", respond with:

1. **Current Requirements Gap**
2. **Proposed Architecture**
3. **Approval & Readiness Status**
4. **Recommended Next Action**

## Authoritative Documentation Files

- `Documentation/AKAD_Requirements_Analysis_Documentation.md`
- `Documentation/AKAD_REVISED_Rentals_Proposal___RJDM_Collective.md`
- `Documentation/AKAD_System_Design.md`
- `Documentation/AKAD_ERD.png`

## Stack Decision (2026-09-22)

User confirmed technology stack intentionally changed to:
- **PHP** + **MySQL** + **Bootstrap** + **jQuery** + **AJAX**
- Browser **localStorage/IndexedDB** for offline queueing
- Supersedes older Node.js/Express/Supabase/PostgreSQL references

## Conflict Resolution

If application code, root-level documentation, project memory, or tracking files conflict with `/Documentation/` → **Documentation wins** unless user explicitly approves revision.

## Related Notes

- [[AKAD Requirements Analysis Changes]]
- [[AKAD Requirements Analysis Ideas and Concepts]]
- [[AKAD Requirements Analysis Approval]]
- [[AKAD Requirements Analysis Documentation]]
- [[AKAD System Design]]
- [[AKAD Revised Rentals Proposal]]