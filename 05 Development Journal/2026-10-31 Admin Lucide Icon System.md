# Admin Lucide Icon System — 2026-10-31

## What changed

- Added the pinned, locally hosted Lucide 1.65.0 browser bundle and ISC license.
- Added a shared admin adapter that maps existing Bootstrap icon markers to Lucide SVG icons.
- Added mutation-based rendering so icons inserted later by tables, modals, notifications, and synchronization states also use Lucide.
- Added shared SVG sizing for navigation, buttons, and dashboard metrics.
- Added the Lucide bundle to the offline application shell and advanced the service-worker cache version.

## Scope

Only the authenticated admin interface and admin login use the adapter. Public website markup and behavior are unchanged. Business logic, API behavior, stored data, and permissions are unchanged.

## Verification performed

- `node --test tests/admin-lucide-icons.test.cjs tests/admin-image-controls.test.cjs tests/admin-shell-polish.test.cjs tests/admin-dashboard-ux.test.cjs tests/frontend-async-workflows.test.cjs`
- `node tests/check_syntax.cjs`
- `git diff --check`
- Local Brave review: Dashboard rendered 37 Lucide SVGs, including 18 sidebar and 9 metric icons, with no Bootstrap fallbacks. The dynamically rendered Bookings view rendered 44 Lucide SVGs, including 15 table/action icons, with no Bootstrap fallbacks.

Physical-device, production, assistive-technology, and client-acceptance checks remain outside this local pass. The earlier mobile sidebar layout was not re-run because this pass changed icon rendering rather than drawer behavior.
