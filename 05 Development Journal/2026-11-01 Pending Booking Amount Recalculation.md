# 2026-11-01 — Pending Booking Amount Recalculation

## Problem

Production browser testing showed that changing a Pending booking's discount or fees did not update the editable agreed total. The owner had to calculate and enter the new total manually.

## Change

- Reused the established booking formula: package price + selected add-ons - discount + fees, never below zero.
- Recalculated the agreed-total field when the service, package, add-ons, discount, or fees change.
- Preserved the saved negotiated total when the editor first opens and kept the field editable for a later negotiated override.
- Normalized booking package IDs to the same `PKG-...` format used by package options so the saved package remains selected when the editor is reopened.
- Added focused regression coverage and updated the booking-pricing workflow guide.

## Verification

- `node --test tests/frontend-async-workflows.test.cjs` — 23 passed, 0 failed, including the new pending-booking pricing calculation case.
- `node --test tests/frontend-api-direct.test.cjs tests/frontend-async-workflows.test.cjs` — 31 passed, 0 failed, including saved-package selection normalization and pending-booking pricing recalculation.
- Production deployment and browser retesting were not performed as part of this change.
