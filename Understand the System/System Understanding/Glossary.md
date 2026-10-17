---
title: "Glossary"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Glossary

**Guide:** [Start Here](Start%20Here.md) · [System Overview](System%20Overview.md) · [Glossary](Glossary.md) · [Known Limits](Current%20Implementation%20Gaps.md)

| Term | Meaning in this system |
| --- | --- |
| API | PHP endpoints that accept browser requests and return JSON. |
| Agreed total | Contractual rental total saved on the booking and used to derive the outstanding balance. |
| Audit log | Append-only record of a sensitive action, actor/system origin, affected record, and status change. |
| Awaiting Completion | The event interval ended, but owner review and manual service release are still required. Capacity remains blocked. |
| Awaiting Payment | Post-event review released capacity, but Completed rental payments do not yet cover the agreed total. |
| Bearer token | Random login token sent in the `Authorization` header. |
| Blocked interval | Event start minus preparation through event end plus travel. |
| Booking snapshot | Copied package/checklist facts that preserve the original agreement after catalog edits. |
| Conflict override | Owner-approved overlap with every current conflicting booking and a required reason. |
| Completed payment | A `PAYMENTS` row whose status is Completed; it counts toward balance and collected revenue. |
| Deferred | Present in plans or source artifacts but not approved as an active supported feature. |
| Deposit | Refundable held amount separate from rental revenue. |
| Direct API | Ordinary browser request to a specific endpoint rather than offline replay. |
| Domain service | Shared PHP code enforcing business rules for direct and sync paths. |
| Foreign key | Database rule connecting a child column to an existing parent row. |
| Idempotent replay | Retrying the same accepted offline operation returns its prior acknowledgement without duplicating the write. |
| Local ID | Temporary browser identifier mapped to a database ID after synchronization. |
| Notification | Persistent per-owner action notice resolved by its workflow. |
| Outstanding balance | Agreed total minus Completed rental payments, never below zero in displayed calculations. |
| Post-event release | Owner transaction that completes inspection/review and stops the booking from reserving service capacity. |
| Receipt | Server record of an accepted offline operation ID, payload hash, acknowledgement, and optional ID mapping. |
| Reconciliation | Process that moves ended Confirmed bookings to Awaiting Completion and creates notices. |
| Synthetic evidence | Tests using invented/local records; it is not production or client acceptance. |
| Transaction | Database unit that commits all related writes together or rolls them all back. |
