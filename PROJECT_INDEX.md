# Rental-Ops-Manager Project Index

Shared navigation for OpenAI Codex, Claude Code, GitHub Copilot, developers, and reviewers. Use this index to find the smallest relevant set of documentation, source, and tests; verify behavior in current source before changing it.

Assistant instructions: [Codex](AGENTS.md) · [Claude Code](CLAUDE.md) · [GitHub Copilot](.github/copilot-instructions.md)

**Verified worktree base:** Git commit `b430ca7b5299eb7db57c663f8b3501e7c388da7f` on 2026-10-18. Recheck current source whenever implementation details matter.

## 1. Project Overview

Rental-Ops-Manager is the owner-facing operations system for AKAD Sweet Party Rentals. It manages catalog data, customers, bookings and availability, money, equipment release/return, delivery, reporting, audit history, website content, and offline replay. The application is a PHP 8.2+/PDO MySQL backend with HTML/CSS/vanilla JavaScript frontends, browser storage/service-worker support, and Node/Python verification tools.

All repository accounts, fixtures, and records are synthetic development data. Local evidence is not production, physical-device, or client acceptance.

## 2. Quick Navigation

| Need | Start here |
| --- | --- |
| Beginner-friendly system understanding | [Start Here](<Understand the System/System Understanding/Start Here.md>) |
| Technical system understanding | [System Overview](<Understand the System/System Understanding/System Overview.md>) |
| Current implementation gaps | [Current Implementation Gaps](<Understand the System/System Understanding/Current Implementation Gaps.md>) |
| Project memory | [Project Memory Index](.project-memory/MEMORY.md) |
| Approved requirements and decisions | [Approved Decisions](.project-memory/AKAD_Approval.md) · [Requirements Changes](.project-memory/AKAD_Requirements_Changes.md) |
| Official requirements and design | [Requirements Analysis](<Source Documents/Documentation/REvised/AKAD_Requirements_Analysis_Documentation.md>) · [System Design](<Source Documents/Documentation/REvised/AKAD_System_Design.md>) |
| Implementation plans/status | [Backend Plan](Implementation/Revised-Requirements-Backend-Implementation-Plan.md) · [Backend Requirement Matrix](Implementation/Backend-Requirement-Matrix.md) · [Frontend Plan](Implementation/Revised-Requirements-Frontend-Implementation-Plan.md) |
| Backend API reference | [API Reference](<Understand the System/System Understanding/Backend/API Reference.md>) · [`api/`](api/) |
| Database overview | [Database Overview](<Understand the System/System Understanding/Database/Database Overview.md>) · [`db/schema.sql`](db/schema.sql) |
| Frontend overview | [Frontend Overview](<Understand the System/System Understanding/Frontend/Overview.md>) · [File Inventory](<Understand the System/System Understanding/Frontend/File Inventory.md>) |
| Tests and verification | [`README.md`](README.md#run-tests) · [Consolidated Verification](Implementation/Backend-Consolidated-Verification-2026-10-15.md) · [`tests/`](tests/) |
| Manual booking browser QA | [Common Instructions and Tester Files](QA-Reports/README.md) · [Final Hostinger Testing](QA-Reports/Final-Hostinger-Testing/README.md) · [Simultaneous Setup](QA-Reports/Simultaneous-Testing-Setup.md) · [Consolidated Report](QA-Reports/Consolidated-Report.md) |

## 3. Feature-to-Code Mapping

Database names below refer to definitions in [`db/schema.sql`](db/schema.sql). Documentation is orientation; source and tests decide current behavior.

| Feature | Frontend | Backend | Database | Documentation | Tests |
| --- | --- | --- | --- | --- | --- |
| Authentication | [`admin/login.html`](admin/login.html), [`js/api.js`](js/api.js), [`js/admin.js`](js/admin.js) | [`api/auth.php`](api/auth.php), [`api/config.php`](api/config.php) | `USERS`, `SESSIONS` | [Login workflow](<Understand the System/System Understanding/Workflows/Login and Authentication.md>) | [`auth-plan-gaps.test.cjs`](tests/auth-plan-gaps.test.cjs), [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs) |
| Customers | [`admin/customers.html`](admin/customers.html), [`js/customers.js`](js/customers.js) | [`api/customers.php`](api/customers.php) | `CUSTOMERS` | [API Reference](<Understand the System/System Understanding/Backend/API Reference.md>) | [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs), [`offline-sync.test.cjs`](tests/offline-sync.test.cjs) |
| Bookings and pricing | [`admin/manual-booking.html`](admin/manual-booking.html), [`admin/bookings.html`](admin/bookings.html), [`js/bookings.js`](js/bookings.js) | [`api/bookings.php`](api/bookings.php), [`api/booking_service.php`](api/booking_service.php), [`api/booking_pricing.php`](api/booking_pricing.php) | `BOOKINGS`, `BOOKING_CONFLICT_OVERRIDES` | [Booking and Pricing](<Understand the System/System Understanding/Workflows/Booking and Pricing.md>) | [`booking-plan-gaps.test.cjs`](tests/booking-plan-gaps.test.cjs), [`fixed-bug-scenarios.test.cjs`](tests/fixed-bug-scenarios.test.cjs), [`booking-flow-frontend-regressions.test.cjs`](tests/booking-flow-frontend-regressions.test.cjs), [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs) |
| Availability and conflicts | [`admin/calendar.html`](admin/calendar.html), [`js/calendar.js`](js/calendar.js) | [`api/availability_service.php`](api/availability_service.php), [`api/bookings.php`](api/bookings.php) | `BOOKINGS`, `BOOKING_CONFLICT_OVERRIDES`; `AVAILABILITY_BLOCKS` is deferred | [Availability and Conflicts](<Understand the System/System Understanding/Workflows/Availability and Conflicts.md>) | [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs), [`frontend-async-workflows.test.cjs`](tests/frontend-async-workflows.test.cjs) |
| Payments | [`admin/payments.html`](admin/payments.html), [`js/payments.js`](js/payments.js) | [`api/payments.php`](api/payments.php), [`api/payment_service.php`](api/payment_service.php) | `PAYMENTS` | [Payments and Deposits](<Understand the System/System Understanding/Workflows/Payments and Deposits.md>) | [`finance-plan-gaps.test.cjs`](tests/finance-plan-gaps.test.cjs), [`fixed-bug-scenarios.test.cjs`](tests/fixed-bug-scenarios.test.cjs), [`offline-sync.test.cjs`](tests/offline-sync.test.cjs), [`booking-flow-frontend-regressions.test.cjs`](tests/booking-flow-frontend-regressions.test.cjs) |
| Deposits and deductions | [`admin/bookings.html`](admin/bookings.html), [`js/api.js`](js/api.js) | [`api/deposits.php`](api/deposits.php), [`api/deposit_service.php`](api/deposit_service.php) | `DEPOSITS`, `DEPOSIT_DEDUCTIONS` | [Payments and Deposits](<Understand the System/System Understanding/Workflows/Payments and Deposits.md>) | [`finance-plan-gaps.test.cjs`](tests/finance-plan-gaps.test.cjs), [`write-validation-gaps.test.cjs`](tests/write-validation-gaps.test.cjs) |
| Equipment, checklists, release, and return | [`admin/inventory.html`](admin/inventory.html), [`admin/bookings.html`](admin/bookings.html), [`js/inventory.js`](js/inventory.js) | [`api/equipment.php`](api/equipment.php), [`api/equipment_service.php`](api/equipment_service.php), [`api/checklist_service.php`](api/checklist_service.php), [`api/booking_service.php`](api/booking_service.php), [`api/bookingItems.php`](api/bookingItems.php), [`api/itemReleases.php`](api/itemReleases.php), [`api/itemHistory.php`](api/itemHistory.php) | `RENTAL_ITEMS`, `BOOKING_CHECKLIST_ITEMS`, `ITEM_RELEASES`, `ITEM_HISTORY`; legacy `BOOKING_ITEMS`, `EQUIPMENT_CHECKLIST` | [Equipment Release and Return](<Understand the System/System Understanding/Workflows/Equipment Release and Return.md>) | [`history-template-gaps.test.cjs`](tests/history-template-gaps.test.cjs), [`booking-plan-gaps.test.cjs`](tests/booking-plan-gaps.test.cjs), [`offline-sync.test.cjs`](tests/offline-sync.test.cjs), [`booking-flow-frontend-regressions.test.cjs`](tests/booking-flow-frontend-regressions.test.cjs) |
| Delivery | [`admin/bookings.html`](admin/bookings.html), [`js/api.js`](js/api.js) | [`api/delivery.php`](api/delivery.php), [`api/supporting_service.php`](api/supporting_service.php) | `DELIVERY` | [Booking and Pricing](<Understand the System/System Understanding/Workflows/Booking and Pricing.md>) | [`catalog-plan-gaps.test.cjs`](tests/catalog-plan-gaps.test.cjs), [`sync-plan-gaps.test.cjs`](tests/sync-plan-gaps.test.cjs) |
| Catalog and checklist templates | [`admin/services.html`](admin/services.html), [`admin/packages.html`](admin/packages.html), [`admin/addons.html`](admin/addons.html), [`admin/categories.html`](admin/categories.html), [`admin/inventory.html`](admin/inventory.html) | [`api/services.php`](api/services.php), [`api/packages.php`](api/packages.php), [`api/catalog_definitions.php`](api/catalog_definitions.php), [`api/addons.php`](api/addons.php), [`api/categories.php`](api/categories.php), [`api/rentalItems.php`](api/rentalItems.php), [`api/checklistTemplates.php`](api/checklistTemplates.php) | `SERVICES`, `PACKAGES`, `ADDONS`, `CATEGORIES`, `RENTAL_ITEMS`, `CHECKLIST_TEMPLATES`, `CHECKLIST_TEMPLATE_ITEMS` | [Backend File Inventory](<Understand the System/System Understanding/Backend/File Inventory.md>) | [`catalog-plan-gaps.test.cjs`](tests/catalog-plan-gaps.test.cjs), [`history-template-gaps.test.cjs`](tests/history-template-gaps.test.cjs) |
| Offline synchronization | [`js/offline.js`](js/offline.js), [`js/storage.js`](js/storage.js), [`js/sync.js`](js/sync.js), [`js/sync-ui.js`](js/sync-ui.js), [`sw.js`](sw.js) | [`api/sync.php`](api/sync.php), [`api/sync_state.php`](api/sync_state.php), shared domain services | `APP_SETTINGS` plus synced feature tables | [Offline Synchronization](<Understand the System/System Understanding/Workflows/Offline Synchronization.md>) | [`offline-sync.test.cjs`](tests/offline-sync.test.cjs), [`sync-plan-gaps.test.cjs`](tests/sync-plan-gaps.test.cjs), [`frontend-api-contract.test.cjs`](tests/frontend-api-contract.test.cjs) |
| Reports and dashboard | [`admin/dashboard.html`](admin/dashboard.html), [`admin/reports.html`](admin/reports.html), [`js/admin.js`](js/admin.js), [`js/payments.js`](js/payments.js) | [`api/reports.php`](api/reports.php) | Read models over bookings, payments, deposits, equipment, and related tables | [Reports](<Understand the System/System Understanding/Workflows/Reports.md>) | [`finance-plan-gaps.test.cjs`](tests/finance-plan-gaps.test.cjs), [`frontend-api-direct.test.cjs`](tests/frontend-api-direct.test.cjs), [`frontend-api-contract.test.cjs`](tests/frontend-api-contract.test.cjs) |
| Owner management | [`admin/owners.html`](admin/owners.html) | [`api/owners.php`](api/owners.php), [`api/auth.php`](api/auth.php) | `USERS`, `SESSIONS` | [Login workflow](<Understand the System/System Understanding/Workflows/Login and Authentication.md>) | [`auth-plan-gaps.test.cjs`](tests/auth-plan-gaps.test.cjs), [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs) |
| Notifications and audit history | [`admin/dashboard.html`](admin/dashboard.html), [`admin/audit.html`](admin/audit.html) | [`api/notifications.php`](api/notifications.php), [`api/audit.php`](api/audit.php), [`api/domain.php`](api/domain.php) | `NOTIFICATIONS`, `AUDIT_LOGS` | [Reports](<Understand the System/System Understanding/Workflows/Reports.md>) | [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs), [`sync-plan-gaps.test.cjs`](tests/sync-plan-gaps.test.cjs) |
| Website content and gallery | [`index.html`](index.html), [`admin/content.html`](admin/content.html), [`admin/gallery.html`](admin/gallery.html), [`js/app.js`](js/app.js) | [`api/websiteContent.php`](api/websiteContent.php), [`api/gallery.php`](api/gallery.php), [`api/gallery-upload.php`](api/gallery-upload.php) | `WEBSITE_CONTENT`, `GALLERY` | [Frontend Overview](<Understand the System/System Understanding/Frontend/Overview.md>) | [`public-site-data.test.cjs`](tests/public-site-data.test.cjs), [`frontend-api-contract.test.cjs`](tests/frontend-api-contract.test.cjs) |
| Settings | [`admin/settings.html`](admin/settings.html) | [`api/settings.php`](api/settings.php) | `APP_SETTINGS` | [API Reference](<Understand the System/System Understanding/Backend/API Reference.md>) | [`backend-revised-requirements.test.cjs`](tests/backend-revised-requirements.test.cjs) |

Website image controls: `js/admin.js` supplies `attachAdminImageUpload` to Services, Website Content, and Settings. Each preview has a top-right × that cancels a newly uploaded replacement or clears the current image for removal when the form is saved. They reuse `API.uploadGalleryImage`; service image references live in Website Content `service_images` keyed by permanent frontend service IDs. `js/app.js` renders these on service cards/details and renders the configured logo. New services must finish syncing before image assignment. Gallery cards use the same top-right × with the existing confirmed deletion workflow.

Public booking inquiries: `index.html#how` explains the Facebook-message process; `js/app.js` connects its message button to Website Content `contact_facebook`. Owners edit this in `admin/content.html` using the existing Facebook booking / Messenger field; no new endpoint or database field.

Contact image: `admin/content.html` provides a Contact Section Image URL/upload control, stored as Website Content `contact_image`; `js/app.js` gives it precedence over the existing matching-Gallery/default fallback. Uses the existing upload endpoint and Website Content JSON without a schema change.

## 4. Business Workflow Index

| Workflow | Human-readable explanation | Primary source entry points |
| --- | --- | --- |
| Sign in and session validation | [Login and Authentication](<Understand the System/System Understanding/Workflows/Login and Authentication.md>) | [`admin/login.html`](admin/login.html), [`api/auth.php`](api/auth.php), [`api/config.php`](api/config.php) |
| Create, price, and update a rental | [Booking and Pricing](<Understand the System/System Understanding/Workflows/Booking and Pricing.md>) | [`admin/manual-booking.html`](admin/manual-booking.html), [`api/booking_service.php`](api/booking_service.php), [`api/booking_pricing.php`](api/booking_pricing.php) |
| Check schedule conflicts | [Availability and Conflicts](<Understand the System/System Understanding/Workflows/Availability and Conflicts.md>) | [`js/calendar.js`](js/calendar.js), [`api/availability_service.php`](api/availability_service.php) |
| Record payments, deposits, deductions, and refunds | [Payments and Deposits](<Understand the System/System Understanding/Workflows/Payments and Deposits.md>) | [`js/payments.js`](js/payments.js), [`api/payment_service.php`](api/payment_service.php), [`api/deposit_service.php`](api/deposit_service.php) |
| Prepare, release, inspect, and complete a rental | [Equipment Release and Return](<Understand the System/System Understanding/Workflows/Equipment Release and Return.md>) · [Post-event Completion](<Understand the System/System Understanding/Workflows/Post-event Completion.md>) | [`api/equipment_service.php`](api/equipment_service.php), [`api/checklist_service.php`](api/checklist_service.php), [`api/booking_service.php`](api/booking_service.php) |
| Work offline and replay changes | [Offline Synchronization](<Understand the System/System Understanding/Workflows/Offline Synchronization.md>) | [`js/sync.js`](js/sync.js), [`js/sync-ui.js`](js/sync-ui.js), [`api/sync.php`](api/sync.php) |
| Review operational and financial figures | [Reports](<Understand the System/System Understanding/Workflows/Reports.md>) | [`admin/reports.html`](admin/reports.html), [`api/reports.php`](api/reports.php) |

## 5. Database Navigation

- Structural source of truth: [`db/schema.sql`](db/schema.sql); synthetic setup data: [`db/seed.sql`](db/seed.sql).
- Table purpose and grouped navigation: [Database Overview](<Understand the System/System Understanding/Database/Database Overview.md>).
- Relationships and cardinality: [Table Relationships](<Understand the System/System Understanding/Database/Table Relationships.md>).
- Column-level reference: [`Understand the System/System Understanding/Database/Tables/`](<Understand the System/System Understanding/Database/Tables/>).
- Setup and schema verification: [Schema and Seed Setup](<Understand the System/System Understanding/Database/Schema and Seed Setup.md>).
- Guarded legacy migration reference: [Backend Migration](Implementation/Backend-Migration.md) and [`db/migrations/20261015_revised_backend.php`](db/migrations/20261015_revised_backend.php). The current approved deployment path is clean initialization; do not run the migration during ordinary setup.

## 6. Approved Decisions and Requirements

Use this precedence when sources differ:

1. [Approved Decisions](.project-memory/AKAD_Approval.md) and [Requirements Changes](.project-memory/AKAD_Requirements_Changes.md) define later owner-approved scope and supersessions.
2. [Revised Requirements Analysis](<Source Documents/Documentation/REvised/AKAD_Requirements_Analysis_Documentation.md>) and [System Design](<Source Documents/Documentation/REvised/AKAD_System_Design.md>) are the official requirements/design baseline.
3. [Backend Requirement Matrix](Implementation/Backend-Requirement-Matrix.md) records current scoped implementation status and evidence; verify important claims against source and current tests.
4. Implementation plans describe intended or completed work but are not approval records and do not prove runtime behavior.
5. The proposal is contextual: [Revised Rentals Proposal](<Source Documents/Documentation/REvised/AKAD_REVISED_Rentals_Proposal___RJDM_Collective.md>). Do not treat proposal text or AI assumptions as later approval.

Current controlling decisions include online-first operation with offline recovery limited to booking, checklist, and return-inspection drafts; owner-only authenticated operation; clean production initialization from the reviewed schema; the approved `Awaiting Payment` lifecycle; and deferred FR-10 internal availability blockouts. Preserve historical records when documenting a changed decision; never silently rewrite approval history.

## 7. Testing and Verification

Prerequisites and local setup are in [`README.md`](README.md). Start MySQL before database-backed suites; Node.js 20+ and PHP 8.2+ are required. Do not point isolated runners at the normal development database.

| Scope | Command | Notes |
| --- | --- | --- |
| Isolated current acceptance | `node tests/run_backend_acceptance.cjs` | Creates its own synthetic database and owned PHP servers; excludes migration and deferred blockout execution. |
| Focused safeguard unit tests | `node tests/run_revised_backend.cjs test_fixes.php` | Four direct shared-service validations; refuses normal database names and rolls back every test. |
| Booking lifecycle integration | `node tests/run_revised_backend.cjs test_booking_flow.php` | Walks Pending → Confirmed → Awaiting Completion → Completed and rolls back its realistic fixture transaction. |
| Frontend-only regression | `node --test tests/public-site-data.test.cjs tests/frontend-api-contract.test.cjs tests/frontend-async-workflows.test.cjs tests/frontend-api-direct.test.cjs tests/booking-flow-frontend-regressions.test.cjs` | Harness/contract evidence, not physical-browser acceptance. |
| Audit History rendering | `node --test tests/audit-history-rendering.test.cjs` | Covers readable labels and timestamps, collapsed JSON details, escaping, and plain-text fallback. |
| Syntax | `node tests/check_syntax.cjs` | Checks PHP, JavaScript, service worker, test scripts, and admin inline scripts without requiring Python on PATH. |
| Historical migration regression | `node tests/migration-plan-gaps.test.cjs` | Synthetic and guarded; not part of normal setup or production authorization. |
| Whitespace | `git diff --check` | Run after edits. |

Test presence or an older result file is not a current pass. Report exactly what ran and distinguish source inspection, synthetic tests, browser checks, physical-device checks, production checks, and client acceptance.

## 8. Known Limitations

Use [Current Implementation Gaps](<Understand the System/System Understanding/Current Implementation Gaps.md>) for current source/scope limitations and [Deployment and Limitations](<Understand the System/System Understanding/Deployment and Limitations.md>) for operational gates. The [Consolidated Verification](Implementation/Backend-Consolidated-Verification-2026-10-15.md) explains the boundaries of the latest recorded local evidence.

Do not activate deferred internal availability blockouts, treat repository fixtures as production data, or infer production/device/client readiness from local synthetic results.

## 9. Index Maintenance

During an AI-assisted development task:

1. Identify changed source and affected callers, tests, schema, and workflows.
2. Update only Second Brain pages whose behavior claims became inaccurate; preserve Ana's example, plain-language lessons, Mermaid diagrams, Previous/Next Lesson links, and Back to Start Here navigation.
3. Update this index only when entry points, file locations, dependencies, feature relationships, test commands, or authority boundaries change.
4. Record approved business decisions in project memory only when the user has approved them; retain the earlier decision as history.
5. Verify local links and current source/tests, then report documentation changes with implementation results.

Formatting-only or behavior-neutral refactors normally need no documentation rewrite. These instructions apply while an agent is actively working; they do not monitor external changes automatically.
