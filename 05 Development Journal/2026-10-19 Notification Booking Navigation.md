---
title: "2026-10-19 — Notification Booking Navigation"
date: 2026-10-19
tags:
  - akad
  - journal
  - notifications
  - frontend
status: verified-local
---

# Notification Booking Navigation

## What changed

Action-required notification links now use a normal page load so the selected booking opens reliably, including when the owner is already on the Bookings page or has previously visited it through the admin page cache. The requested booking detail and the bookings table also begin loading together, so the detail is no longer queued behind the full table render.

Each notification now shows a compact, consistent summary: booking reference, status, required action, outstanding balance when applicable, customer, service, and event schedule. Awaiting Completion notifications open the booking's Return Inspection tab; Awaiting Payment notifications open its Payments tab. The action label and destination are selected from the same notification-type mapping.

No notification lifecycle, authentication, database, offline synchronization, or booking business rule changed.

## Evidence and verification

- Source inspection covered the notification renderer and SPA interceptor in `js/admin.js`, booking query handling and detail loading in `admin/bookings.html`, and the notification reader in `api/notifications.php`.
- The focused frontend async regression tests cover the reliable-load marker, detail-before-table-wait ordering, notification-type destinations, and requested-tab activation.
- Isolated acceptance passed nine backend/sync test files, 17 offline integration checks, 39 frontend tests, and repository syntax checks using synthetic database `akad_verify_plan_1792366180536_13424`. Evidence is in `tests/acceptance-results/1792366180369-8228/`.
- Scoped whitespace validation passed for every file changed by this work. The whole-worktree check still reports pre-existing trailing whitespace in the user-owned `this` file, which was not modified.
- Browser, physical-device, production-performance, and client acceptance checks were not performed.

## Related documentation

- [Post-event Completion](<../Understand the System/System Understanding/Workflows/Post-event Completion.md>)
- [Project Index](<../PROJECT_INDEX.md>)
- [Development Journal](README.md)
