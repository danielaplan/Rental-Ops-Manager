---
title: "Database Overview"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Database Overview

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## What the database does

MySQL/MariaDB is the shared record after the PHP backend accepts a request. It contains **29 tables** in the current clean schema. A table is like a structured ledger: each row describes one account, booking, payment, checklist item, or other record, and keys connect related rows.

## Ana's connected records

Ana has one `CUSTOMERS` row. Her `BOOKINGS` row points to that customer, one `SERVICES` row, an optional `PACKAGES` row, and the owner in `USERS`. Payments, a deposit, delivery, booking checklist items, notifications, conflict approvals, and audit history point back to the booking.

## Table groups

- **Accounts:** [USERS](Tables/USERS.md), [SESSIONS](Tables/SESSIONS.md)
- **Catalog/content:** [SERVICES](Tables/SERVICES.md), [PACKAGES](Tables/PACKAGES.md), [ADDONS](Tables/ADDONS.md), [CATEGORIES](Tables/CATEGORIES.md), [RENTAL_ITEMS](Tables/RENTAL_ITEMS.md), [CHECKLIST_TEMPLATES](Tables/CHECKLIST_TEMPLATES.md), [CHECKLIST_TEMPLATE_ITEMS](Tables/CHECKLIST_TEMPLATE_ITEMS.md), [GALLERY](Tables/GALLERY.md), [WEBSITE_CONTENT](Tables/WEBSITE_CONTENT.md), [APP_SETTINGS](Tables/APP_SETTINGS.md)
- **Rental operations:** [CUSTOMERS](Tables/CUSTOMERS.md), [BOOKINGS](Tables/BOOKINGS.md), [BOOKING_CHECKLIST_ITEMS](Tables/BOOKING_CHECKLIST_ITEMS.md), [PAYMENTS](Tables/PAYMENTS.md), [DEPOSITS](Tables/DEPOSITS.md), [DEPOSIT_DEDUCTIONS](Tables/DEPOSIT_DEDUCTIONS.md), [DELIVERY](Tables/DELIVERY.md), [NOTIFICATIONS](Tables/NOTIFICATIONS.md), [BOOKING_CONFLICT_OVERRIDES](Tables/BOOKING_CONFLICT_OVERRIDES.md), [ITEM_RELEASES](Tables/ITEM_RELEASES.md), [ITEM_HISTORY](Tables/ITEM_HISTORY.md), [AUDIT_LOGS](Tables/AUDIT_LOGS.md)
- **Deferred/legacy compatibility:** [AVAILABILITY_BLOCKS](Tables/AVAILABILITY_BLOCKS.md), [EQUIPMENT_CHECKLIST](Tables/EQUIPMENT_CHECKLIST.md), [BOOKING_ITEMS](Tables/BOOKING_ITEMS.md)
- **Migration tooling:** [MIGRATION_ARCHIVE](Tables/MIGRATION_ARCHIVE.md), [SCHEMA_MIGRATIONS](Tables/SCHEMA_MIGRATIONS.md)

## Important rules

Foreign keys prevent many broken relationships. Unique keys enforce one delivery and one deposit per booking, unique booking references, one legacy-linked migration/deduction record, and one notification type per recipient/booking. Transactions in shared services protect multi-row changes. `db/schema.sql` is the structural source of truth; PHP services establish how the structure is used.

The schema intentionally contains old and new structures during transition. Presence in the schema does not prove that a table is the primary current workflow. Read each table page’s status note.

## Related documentation

[Table Relationships](Table%20Relationships.md) · [Schema and Seed Setup](Schema%20and%20Seed%20Setup.md) · [Backend File Inventory](../Backend/File%20Inventory.md)


## Continue Your Learning

**You’ve learned:** how the system organizes customers, bookings, money, equipment, accounts, and history across 29 connected tables.

**Previous topic:** [Backend Overview](../Backend/Backend%20Overview.md)

**Next topic:** [API Reference](../Backend/API%20Reference.md)

**Why read this next?** The API reference shows the specific requests that connect the screens, backend rules, and stored records.

**Return to your learning dashboard:** [Start Here](../Start%20Here.md)
