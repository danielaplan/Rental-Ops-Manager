# Admin Dashboard Information Hierarchy — 2026-10-30

## What changed

- Moved the current operational totals above historical charts so owners see actionable information first.
- Grouped the dashboard into named Operations, Performance, and Upcoming Bookings sections.
- Replaced inline chart sizing with shared responsive classes.
- Added text alternatives to the three charts and hid decorative icons from assistive technology.

## Scope

The change only affects dashboard presentation. Data requests, calculations, navigation, booking workflows, synchronization, and backend behavior are unchanged.

## Verification

- Source-level regression: `node --test tests/admin-dashboard-ux.test.cjs`
- Related frontend/admin regression: `node --test tests/admin-dashboard-ux.test.cjs tests/admin-image-controls.test.cjs tests/frontend-async-workflows.test.cjs` (`26` passed)
- Syntax check: `node tests/check_syntax.cjs`
- Whitespace check: `git diff --check`

Browser, assistive-technology, physical-device, production, and client-acceptance checks were not performed for this entry.
