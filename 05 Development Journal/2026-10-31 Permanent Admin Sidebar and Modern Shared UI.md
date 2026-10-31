# Permanent Admin Sidebar and Modern Shared UI — 2026-10-31

## What changed

- Removed the desktop sidebar collapse control, saved collapse preference, icon-rail layout, and related transition styles.
- Made the desktop sidebar permanently full width with the logo, complete business name, section labels, navigation labels, and logout label visible.
- Preserved the existing mobile navigation drawer because a permanently visible 268px sidebar would block narrow screens.
- Refined the shared admin component layer used by all tabs: page headers, panels, forms, buttons, tabs, tables, modals, alerts, badges, synchronization details, checklist rows, and receipt summaries.
- Kept the established cream, warm-white, charcoal, green, bronze, and gold palette.

## Scope

This is a presentation and navigation-shell change. Authentication, permissions, business rules, forms, API calls, offline synchronization, and stored operational data are unchanged.

## Verification

- Focused source checks: `node --test tests/admin-image-controls.test.cjs tests/admin-shell-polish.test.cjs tests/admin-dashboard-ux.test.cjs`.
- Frontend regression: `node --test tests/frontend-async-workflows.test.cjs`.
- Syntax: `node tests/check_syntax.cjs`.
- Whitespace: `git diff --check`.
- Local browser: all 17 authenticated admin routes loaded with a verified 268px permanent sidebar and no collapse control. Fresh screenshots are under `UI-Screenshots/Admin-2026-10-31/Permanent-Sidebar-Modern/`.
- Responsive browser: dashboard checked at 390 × 844. The mobile drawer opened with the full brand and labels and the closed page had no document-level horizontal overflow.
- Dense-table browser check: bookings rendered 15 rows without document-level horizontal overflow; its intentional internal scroll preserves readable columns beside the permanent sidebar.
- Impeccable detector: no structural or accessibility defect was reported. Its remaining warnings identify the existing locally hosted Inter typeface as common; it was retained to avoid introducing an unrelated font dependency or changing the established visual identity.
- Result: 28 focused and frontend regression tests passed, followed by a successful full syntax check.

Physical-device, production, assistive-technology, and client-acceptance checks remain outside this local pass.
