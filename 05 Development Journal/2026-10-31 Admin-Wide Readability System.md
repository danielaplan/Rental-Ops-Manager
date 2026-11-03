# Admin-Wide Readability System — 2026-10-31

## What changed

- Established a 16-pixel admin body floor with a more comfortable line height.
- Increased navigation, dashboard caption, form-label, help-text, table, badge, receipt, calendar, and login microcopy sizes.
- Darkened secondary text through the existing muted token and kept numeric data tabular.
- Corrected dialog and workflow heading levels across Bookings, Calendar, Manual Booking, Add-ons, Categories, Gallery, Inventory, Owners, Packages, Reports, and Services.
- Versioned the shared admin stylesheet across every admin page so existing service-worker installations receive the readability update.

## Scope

The entire admin interface and admin login are included. Public/customer pages, stored data, APIs, permissions, booking rules, payment rules, synchronization, and owner workflows are unchanged.

## Verification performed

- `node --test tests/admin-readability.test.cjs tests/admin-shell-polish.test.cjs tests/admin-lucide-icons.test.cjs tests/admin-dashboard-ux.test.cjs tests/frontend-async-workflows.test.cjs` — 31 passed.
- `node tests/check_syntax.cjs` — PHP, JavaScript, service worker, tests, and admin inline scripts passed.
- `git diff --check` — passed for the scoped work; only unrelated pre-existing line-ending warnings were reported.
- Local Brave review confirmed the versioned readability stylesheet, 16px body text, 15.2px navigation, 15px dashboard subtitles, 14.8px table rows, 12.8px table headers, 15px form labels, 14px help text, five semantic Manual Booking section headings, and zero icon fallbacks.
- Final Impeccable type scan found no remaining tiny-text or heading-level issues. Its Inter warning is intentionally accepted because Inter is the established admin interface family; replacing it would be a separate identity redesign.

Representative dashboard, booking-table, and manual-form views were checked at the current desktop viewport. Physical-device, narrow-device, production, assistive-technology, and client-acceptance checks remain outside this local pass.
