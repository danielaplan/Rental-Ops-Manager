---
title: "Notification Status Synchronization"
date: 2026-10-30
tags:
  - development-journal
  - notifications
  - bookings
status: implemented-local-verification
---

# Notification Status Synchronization

## Finding

The manual booking-status override changed the booking but did not maintain its action-required notification. The topbar notification renderer also stopped immediately when a bell already existed, leaving its count and contents stale after an in-page status update.

## Change

- Manual `Awaiting Completion` and `Awaiting Payment` overrides now create or reactivate the corresponding notification for every active owner.
- Moving to another operational status resolves prior completion/payment action notifications.
- Reactivating a previously used status reopens the existing unique notification instead of silently leaving it resolved.
- The topbar bell now refreshes its existing container and is refreshed after quick or detail status changes.
- Status actions now await the outbox flush before reloading server notifications. While offline, a stale server notice is hidden when the matching booking has a pending local status that no longer requires it.
- Renamed the menu to “Bookings needing attention” and added a plain-language explanation that notifications identify return reviews or outstanding payments and disappear when resolved.
- Live browser simulation found legacy unresolved rows whose booking statuses no longer matched their notification type. Reading notifications now resolves those stale rows before returning the list.
- A paid Awaiting Payment booking now says “Payment complete — finish booking” and opens the return/completion tab instead of incorrectly asking the owner to collect ₱0.
- Notification links continue to open the matching booking and workflow tab.

## Verification

- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.
- Focused booking and asynchronous workflow tests passed 27/27.
- The standard frontend regression selection passed 57/57.
- `git diff --check` passed.
- Database notification lifecycle execution remains unverified because the isolated MySQL runner cannot connect inside the sandbox and an outside-sandbox database run is not authorized.

This is local source and synthetic frontend verification, not physical-device, production, or client acceptance.
