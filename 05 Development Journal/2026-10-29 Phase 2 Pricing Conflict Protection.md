# Phase 2 Pricing Conflict Protection

Date: 2026-10-29

## What changed

- Extended queued booking `_base` snapshots to service, package, add-ons, discount, fees, agreed total, preparation, and travel allowances.
- Extended server stale checks to those fields under the existing booking transaction and lock.
- Normalized currency values and local/server catalog references before comparison to avoid false conflicts caused by formatting differences.
- Reused the existing stale-conflict response and sync-panel comparison, which retains the draft and displays previous, server, and local values.

## What was achieved

- An older offline pricing edit cannot silently overwrite a newer accepted edit.
- A mismatch is classified as a visible `stale` conflict and requires an explicit owner retry after review.
- Unchanged equivalent prices such as `10`, `10.0`, and `10.00` compare as the same cent value.

## Verification performed

- Focused frontend/API-contract and booking-flow simulation: 22/22 passed.
- Repository syntax checks passed for PHP, JavaScript, the service worker, test scripts, and admin inline scripts.
- Added a two-device database regression: one device accepts a newer price, the older queued edit must conflict, and the newer server price must remain unchanged.

## Not done / blocker

- The isolated two-device database scenario could not execute because local MySQL refused the connection (`ERROR 2002`, Windows socket error `10013`). No development or production database was accessed.
- No physical browser/device test, deployment, migration, client acceptance, commit, or push was performed.
