# Shared Manual QA Catalog Baseline — 2026-10-21

## What changed

- Extended `db/seed.sql` with the 15 reviewed synthetic rental items and 9 gallery records already present in the local development catalog.
- Kept temporary, inactive test-only, customer, booking, payment, deposit, delivery, notification, audit, and other transactional records out of the shared baseline.
- Narrowly allowed the nine approved gallery assets under `uploads/gallery/` through `.gitignore`; ordinary runtime gallery uploads remain ignored.
- Added separate, complete setup guides under each tester folder with that tester's exact database, Git branch, scenarios, reporting flow, evidence rules, and handoff commands. Kept the root simultaneous-testing page as a short coordinator overview.
- Clarified that database creation and baseline verification run in Windows PowerShell from the repository root after MySQL is started, and that Steps 2 and 3 must use the same PowerShell session.

## Why

Four testers need identical catalog and image data while keeping their bookings and results isolated. The previous seed reproduced the active services, packages, add-ons, and checklist templates but omitted rental items and gallery rows, and the matching image files were ignored by Git.

## Verification

- Current-source inspection: compared the local `akad_rentals` catalog against `db/seed.sql` without reading customer or booking details.
- Filesystem inspection: all nine gallery records pointed to existing local files before they were admitted to the baseline.
- Isolated database verification: loaded the revised schema and seed into disposable database `akad_verify_catalog_20261021`; verified 2 users, 3 services, 12 packages, 10 add-ons, 12 checklist templates, 15 rental items, and 9 gallery records, with 0 customers, 0 bookings, and 0 payments. The disposable database was removed afterward.
- Markdown links and whitespace: checked after the documentation update.

## Boundaries

- The existing `akad_rentals` database was not modified.
- No customer, booking, payment, deposit, delivery, notification, or audit data was copied.
- No migration, deployment, commit, push, browser test, physical-device test, production check, or client acceptance was performed.
