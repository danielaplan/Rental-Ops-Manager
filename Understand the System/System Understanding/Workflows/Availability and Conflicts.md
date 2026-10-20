---
title: "Availability and Conflicts"
date: 2026-10-19
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Availability and Conflicts

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Part A — Understanding the Feature

This first part uses everyday language. You can continue to the next lesson without studying the technical section.

### What is this feature?

Availability asks whether the same service is already reserved during a requested blocked interval. The blocked interval includes preparation before the event and travel after it.

### Why does the system need it?

Two owners or devices may attempt overlapping bookings. The server must make the final decision and keep deliberate exceptions visible.

### Follow Ana’s fictional rental

Ana’s event runs 2:00–6:00 PM, with 30 minutes of preparation and 45 minutes of travel. The service is blocked from 1:30–6:45 PM. A second confirmed booking for the same service during that period creates a conflict.

### Step-by-step workflow

1. Copy service defaults or accept valid per-booking allowance overrides.
2. Calculate blocked start and end.
3. Lock services in a consistent order and reconcile ended bookings.
4. Compare only the same service against Confirmed and Awaiting Completion bookings.
5. If conflicts exist, return their customer, service, and event details.
6. An owner may approve every booking conflict with one required reason; the server writes an override row and audit entry.
7. Manual entry may retain an overlapping booking as Pending; confirmation repeats the check with that booking's preparation and travel allowances.

### What Happens Behind the Scenes?

An unreleased booking whose blocked end has passed has no effective end for conflict checking: it keeps blocking future intervals until post-event release. After a complete review, `released_by` is set and capacity is released even if money remains outstanding.

### Visual explanation

```mermaid
flowchart TD
  I[Requested event interval] --> E[Add preparation and travel]
  E --> L[Lock services and reconcile]
  L --> C{Same-service overlap?}
  C -- No --> S[Save confirmation]
  C -- Yes --> R[Return current conflicts]
  R --> A{Owner approves every booking with reason?}
  A -- Yes --> O[Save override and audit]
  A -- No --> X[Reject with 409]
```

The diagram shows the normal save path and the extra review required when the same service is already reserved.

### Important things to remember

- Pending, Cancelled, Completed, and released Awaiting Payment bookings do not reserve capacity.
- Different services are not compared.
- Approval must name every current conflicting booking; stale approvals are rejected.
- The booking screen sends those exact conflict IDs and the owner's reason only when confirming.
- Active availability blocks cannot be overridden by this workflow.
- Internal blockouts are deferred by owner decision even though draft schema/API artifacts remain. The frontend does not present them as an active supported feature.

### Remember This

The system compares only bookings for the same service. An overdue rental keeps blocking that service until the owner completes the post-event release review.

## Part B — Technical Explanation

This section names the files, routes, tables, and validation rules. Beginner readers may skip it and continue to the next lesson.

### Technical details

`availability_service.php`: `blockedInterval()`, `reconcileBookings()`, `availabilityConflicts()`, `requireConflictApproval()`, `recordConflictApproval()`, `releaseBooking()`. Tables: `BOOKINGS`, `BOOKING_CONFLICT_OVERRIDES`; deferred artifact: `AVAILABILITY_BLOCKS`. Scheduler: `scripts/reconcile_bookings.php`.

### Technical references

[Post-event Completion](Post-event%20Completion.md) · [BOOKING_CONFLICT_OVERRIDES](../Database/Tables/BOOKING_CONFLICT_OVERRIDES.md) · [Current Implementation Gaps](../Current%20Implementation%20Gaps.md)


## Continue Your Learning

**You’ve learned:** why the system reserves preparation and travel time and how an owner deliberately approves an overlap.

**Previous lesson:** [Booking and Pricing](Booking%20and%20Pricing.md)

**Next lesson:** [Payments and Deposits](Payments%20and%20Deposits.md)

**Why read this next?** After Ana’s schedule is confirmed, the business needs to record what she pays and what she still owes.

**Return to your learning dashboard:** [Start Here](../Start%20Here.md)
