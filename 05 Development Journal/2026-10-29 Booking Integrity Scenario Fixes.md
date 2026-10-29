---
title: Booking Integrity Scenario Fixes
date: 2026-10-29
tags: [akad, bookings, payments, equipment, reports, testing]
---

# Booking Integrity Scenario Fixes

## What changed

Five acceptance scenarios exposed missing guards in the current `Rentals-Ops-FINAL` copy. The shared booking transaction now rejects an agreed total below Completed payments. Correcting a payment can reopen an underpaid Completed booking as Awaiting Payment while retaining return-review evidence and creating audit/notification evidence. Cancellation now waits until dispatched checklist items are returned, damaged, or documented missing. A package referenced by a booking cannot move to another service. Payments, Dashboard, Reports, and the backend balance model now exclude cancelled bookings consistently.

The changes remain shared by direct requests and offline replay because both routes call the same booking, payment, and catalog services. No schema migration was required.

## Verification

- `tests/fixed-bug-scenarios.test.cjs`: 5/5 synthetic lifecycle scenarios passed on `akad_verify_plan_1793285371905_14096`.
- Affected booking, catalog, and finance suites passed on a fresh synthetic database.
- Offline sync passed independently on `akad_verify_plan_1793285405696_4644`.
- Frontend contract/workflow regressions: 43/43 passed.
- PHP, JavaScript, service-worker, test, and inline-admin syntax passed.
- The final consolidated scenario execution passed 5/5 on `akad_verify_plan_1793285740061_10800`; evidence is under `tests/acceptance-results/1793285647988-3372`.
- Two broad acceptance runs each saw one unrelated intermittent empty MySQL CLI scalar read under sustained runner load. The history suite passed alone on `akad_verify_plan_1793285520666_6044`; the booking suite passed alone on `akad_verify_plan_1793285784633_15000`. All other consolidated suites passed.

These are local synthetic results. No normal development database, migration, deployment, physical browser/device, production, or client acceptance was used.

## Related guides

[Booking and Pricing](<../Understand the System/System Understanding/Workflows/Booking and Pricing.md>) · [Equipment Release and Return](<../Understand the System/System Understanding/Workflows/Equipment Release and Return.md>) · [Post-event Completion](<../Understand the System/System Understanding/Workflows/Post-event Completion.md>) · [Reports](<../Understand the System/System Understanding/Workflows/Reports.md>)

[Back to Development Journal](README.md)
