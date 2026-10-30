---
title: "Manual Booking Form Simplification"
date: 2026-10-30
tags:
  - development-journal
  - bookings
  - admin-ui
status: implemented-local-verification
---

# Manual Booking Form Simplification

## Finding

The manual booking page asked for many optional customer and event fields during initial creation, making the main workflow feel crowded.

## Change

- Kept the essential customer name and contact fields.
- Kept schedule, location, service, package, add-ons, pricing, down payment, and payment method controls.
- Removed existing-customer selection, email, customer type, booking source, event type, guest count, special requests, theme/setup notes, and visible preparation/travel allowance inputs from this create screen.
- Preserved conflict accuracy by using the selected service’s configured preparation and travel defaults behind the scenes.
- Kept server validation, Pending creation, pricing, payment recording, saved drafts, and offline synchronization unchanged.

## Verification

- PHP, JavaScript, service-worker, test-script, and inline-admin syntax checks passed.
- Focused booking and asynchronous workflow tests passed 27/27.
- The standard frontend regression selection passed 57/57, and `git diff --check` passed.
- The tests cover service-default allowances, availability race handling, retry behavior, draft restoration, failed initial-payment protection, and the reduced field set.

This is local source and synthetic frontend verification, not physical-device, production, or client acceptance.
