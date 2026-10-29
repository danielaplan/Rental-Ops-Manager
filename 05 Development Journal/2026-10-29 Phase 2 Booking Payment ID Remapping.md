# Phase 2 Booking and Payment ID Remapping

Date: 2026-10-29

## Confirmed cause

The server already returned and persisted correct booking/payment IDs. The client alias normalization then converted those acknowledged IDs back to their former `LOCAL-*` primary keys, leaving Hostinger-synchronized payment records displayed and cached with local IDs.

## What changed

- Acknowledged booking and payment rows now adopt the server primary key.
- Booking acknowledgement remaps cached dependent `booking_id` values and still-pending operation references.
- Server refresh no longer reverses acknowledged booking/payment IDs through the alias table.
- Alias records remain available for legitimate dependency resolution and lost-response recovery.
- Remapping is idempotent when the acknowledgement is processed once and when an already-empty outbox is flushed again.

## Verification performed

- Linked replay simulation created one local booking and one dependent payment, replayed them, and verified booking ID `42`, payment ID `84`, and payment booking link `42` with no `LOCAL-*` primary keys.
- A second flush returned zero new acknowledgements and did not create another payment.
- Focused payment, booking, and API-contract tests passed 27/27.
- Syntax checks passed for PHP, JavaScript, the service worker, test scripts, and admin inline scripts.
- The database-backed offline test now asserts the same linked-ID and exactly-once behavior against real API/database responses.

## Not done / blocker

- Local MySQL is still unavailable (`ERROR 2002`, Windows socket error `10013`), so the expanded database-backed replay test did not run in this session.
- No Hostinger/production mutation, deployment, migration, physical-device test, client acceptance, commit, or push was performed.
