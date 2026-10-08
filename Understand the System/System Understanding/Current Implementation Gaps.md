---
title: "Current Implementation Gaps"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Current Implementation Gaps

**Navigate:** [Start Here](Start%20Here.md) · [Reading order](Start%20Here.md#recommended-reading-order) · [Backend files](Backend/File%20Inventory.md) · [Database tables](Database/Database%20Overview.md) · [Glossary](Glossary.md)

## Why this page matters

This page distinguishes current behavior from intended features. A gap is a difference, limitation or unfinished implementation detail.

## Key limitations

- The intended tool is for staff/owners, but some current data-reading requests do not require login.
- The dedicated return action checks full returns, but another booking-edit path can set Completed without that check.
- Rental payments and refunds are recorded/calculated; the backend does not move the money through payment providers.
- Price calculations use one primary service/package. Multiple service selections do not mean full multi-service pricing is implemented.
- Reports use event-date booking summaries; some inventory figures are placeholders.
- Offline drafts need server acceptance. Different save paths have some different permission/checking rules.
- Service/date blockouts remain skipped, and frontend documentation is deferred.

## How to word documentation responsibly

Prefer “The return-completion action checks the saved inspection” to “Every completed booking is guaranteed to have a full inspection.” The first sentence names the checked behavior; the second overstates it.

Use the exact findings below when checking a technical claim. A developer should review explanations affected by these gaps. This page records source-inspection findings, not newly fixed behavior or new test failures.

## Technical details

This section records exact file behavior, field names and implementation details.

These findings come from source inspection on 2026-09-29. They are explanation limits and possible follow-up work, not changes made by this guide or a claim that existing tests failed. They help the next person distinguish intended rules from what every code path currently enforces.

| Area | Current behavior / limitation | Source |
|---|---|---|
| Read access | Most business/catalog reads are unauthenticated; reports and me require a session. Internal-tool intent does not itself protect these reads. | auth.php and endpoint branches |
| Logout | Header-only fallback expects a token field absent from currentSession's selected row; JSON body token is needed. | auth.php |
| Create defaults | **Fixed 2026-10-08:** Generic CRUD now uses `$vals + $defaults` — submitted values take precedence; defaults fill only missing fields. Previously `$defaults + $vals` gave defaults precedence. | crud.php |
| Validation / errors | Many generic CRUD fields rely on MySQL constraints; no central JSON exception handler. Negative rental payment amounts are not explicitly rejected. | config.php, crud.php, payments.php, sync.php |
| Role parity | Sync generic operations for equipment/bookingItems/itemReleases/itemHistory allow authenticated staff; direct manual CRUD often requires owner. | sync.php vs direct endpoints |
| Sync slot change | Sync slotChanged includes date/time/status but not service_id. Switching only primary service to karaoke with unchanged slot/status can miss overlap checking. | sync.php |
| Completion bypass | **Fixed 2026-10-08:** Equipment-completion validation now runs unconditionally whenever status === 'completed' (removed $expectedTotal > 0 gate). finalizeReturn enforces full returned inspection; bookings update path now also requires inspection. | bookings.php, sync.php, equipment_service.php |
| Multi-service selections | JSON arrays exist, but first service/one package controls pricing and overlap. Do not explain this as complete multi-service booking pricing. | bookings.php, booking_pricing.php |
| Payment summary | Booking update accepts amount_paid/payment_status; reports trust summary. Not every edit reconciles with payment rows. Direct create-payment retries lack replay protection. | bookings.php, payments.php, reports.php |
| Money categories | Deposit held/deduction/refund is a summary calculation, not actual gateway/refund execution; no itemized deduction ledger. Delivery fee is not automatically in rental total. | deposit_service.php, delivery.php |
| Checklist generation | Replaces assignments, lacks booking/item uniqueness and does not filter catalog status or reserve stock. Nullable/unlinked items can obstruct complete inspections. | bookingItems.php, schema.sql |
| Reporting | Event-date/booking-summary revenue; inventory zeros on dashboard; global damaged/missing count despite date filters. | reports.php |
| Replay state | One growing JSON receipt row serializes commits; no retention policy. Whole batch is not atomic. | sync.php, sync_state.php |
| Stale checking | _base covers selected booking fields only. Other fields/entities lack this stale-edit detection. | sync.php |
| Sync markers | BOOKINGS.sync_status is not consistently advanced by these paths; use receipts/outbox acknowledgements to explain synchronization. | bookings.php, sync.php, schema.sql |
| Setup | Sessions are in seed.sql; bare CREATE INDEX reruns may fail; seeds overwrite demo values; CREATE IF NOT EXISTS is not migration management. | schema.sql, seed.sql |
| Host portability | PHP lowercase table names vs uppercase declarations require host case-setting review. | SQL scripts and API SQL |
| Cardinality | Official design says one-to-many deposits/delivery; current unique booking keys implement zero-or-one. | System Design vs schema.sql |
| Catalog linkage | CATEGORIES has no relationship to SERVICES; JSON selections have no SQL foreign keys. | schema.sql |
| Scope / deferred work | FR-10 blockouts absent and explicitly skipped. Frontend remains unfinished and its full guide is deferred. Content/gallery support does not prove alignment with the internal-only requirement. | requirements, current user scope, vault decisions |

No fixed minimum for down payment or held deposit is a current approved decision, not a gap. Existing focused runtime evidence remains valid within the documented test scope; it does not certify every path above.

See [File Inventory](Backend/File%20Inventory.md) and [Supporting Files and Evidence](Backend/Supporting%20Files%20and%20Evidence.md).

## Source files

- [api/auth.php](<../../api/auth.php>)
- [api/crud.php](<../../api/crud.php>)
- [api/bookings.php](<../../api/bookings.php>)
- [api/sync.php](<../../api/sync.php>)
- [api/payments.php](<../../api/payments.php>)
- [api/equipment_service.php](<../../api/equipment_service.php>)
- [api/reports.php](<../../api/reports.php>)
- [db/schema.sql](<../../db/schema.sql>)
- [db/seed.sql](<../../db/seed.sql>)
- [Documentation/AKAD_System_Design.md](<../../Documentation/AKAD_System_Design.md>)

## Continue reading

[Previous: Reports](Workflows/Reports.md) · [Back to Start Here](Start%20Here.md)
