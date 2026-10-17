---
title: "Backend File Inventory"
date: 2026-10-17
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Backend File Inventory

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend files](File%20Inventory.md) · [Database tables](../Database/Database%20Overview.md) · [Glossary](../Glossary.md)

## How to use this list

This is a directory of the backend files already explained in the guide. Each file name is clickable and opens its own plain-language explanation.

Files are organized by responsibility. For example, Ana’s rental price is explained in [booking_pricing.php](Files/booking_pricing.php.md); saved rental payments are explained in [payments.php](Files/payments.php.md).

The list includes helper files as well as request handlers. A helper performs a job for another file; it may not offer a staff-facing action by itself.

## Technical details

This section records exact file behavior, field names and implementation details.

Every PHP file present in the api/ directory is listed below. Helper files are included because endpoints depend on them.

| File | Purpose |
|---|---|
| [addons.php](Files/addons.php.md) | Optional extras priced under a service. |
| [auth.php](Files/auth.php.md) | Authenticates owners/staff and issues database-backed sessions. |
| [bookingItems.php](Files/bookingItems.php.md) | Maintains the equipment checklist snapshot assigned to a booking. |
| [booking_pricing.php](Files/booking_pricing.php.md) | Shared price calculation for direct and synchronized bookings. |
| [bookings.php](Files/bookings.php.md) | Creates, lists, updates, and deletes the central rental booking record. |
| [categories.php](Files/categories.php.md) | Standalone category labels; there is no category foreign key in SERVICES. |
| [config.php](Files/config.php.md) | Shared request bootstrap and MySQL connection helpers. |
| [crud.php](Files/crud.php.md) | Reusable CRUD dispatcher for simple tables, plus the owner-only write guard. |
| [customers.php](Files/customers.php.md) | Customer contact directory. Additional ?do=search&q=... matches name/contact using LIKE. |
| [delivery.php](Files/delivery.php.md) | Stores the latest delivery arrangement for a booking. |
| [deposit_service.php](Files/deposit_service.php.md) | Shared deposit validation and calculation. |
| [deposits.php](Files/deposits.php.md) | Reads or saves the refundable deposit for a booking. |
| [equipment.php](Files/equipment.php.md) | HTTP routes for return inspections and finalizing returns. |
| [equipment_service.php](Files/equipment_service.php.md) | Shared atomic return inspection and guarded completion. |
| [gallery.php](Files/gallery.php.md) | Image/content records. image is text; this script does not implement a file upload processor. |
| [itemHistory.php](Files/itemHistory.php.md) | Reads and appends equipment history entries. |
| [itemReleases.php](Files/itemReleases.php.md) | Records a release event; this endpoint does not itself update item quantities or booking status. |
| [packages.php](Files/packages.php.md) | Fixed-price packages under a service. Supplied service_id on create/update is checked for existence. |
| [payments.php](Files/payments.php.md) | Records rental payments and updates the booking payment summary. |
| [rentalItems.php](Files/rentalItems.php.md) | Reusable equipment catalog used to generate booking checklists. |
| [reports.php](Files/reports.php.md) | Calculates dashboard and booking/date-range report summaries. |
| [services.php](Files/services.php.md) | Catalog of the three service lines. |
| [settings.php](Files/settings.php.md) | Reads/replaces the application settings object. |
| [sync.php](Files/sync.php.md) | Validates and commits offline operations with per-operation receipts. |
| [sync_state.php](Files/sync_state.php.md) | Receipt ledger and temporary-to-server ID mapping for replay safety. |
| [websiteContent.php](Files/websiteContent.php.md) | Reads/replaces the website content object. |
| [audit.php](Files/audit.php.md) | Audit logging and compliance tracking. |
| [availability_service.php](Files/availability_service.php.md) | Shared service for checking resource availability and conflicts. |
| [availabilityBlocks.php](Files/availabilityBlocks.php.md) | Manages time-based availability blocks for resources. |
| [booking_items_service.php](Files/booking_items_service.php.md) | Shared service for managing booking-item relationships and operations. |
| [booking_service.php](Files/booking_service.php.md) | Shared service for core booking lifecycle operations and workflow coordination. |
| [catalog_definitions.php](Files/catalog_definitions.php.md) | Defines and manages service catalog structures and pricing rules. |
| [checklist_service.php](Files/checklist_service.php.md) | Shared service for equipment checklist generation and validation. |
| [checklistTemplates.php](Files/checklistTemplates.php.md) | Manages equipment checklist templates and standard configurations. |
| [domain.php](Files/domain.php.md) | Handles domain-specific business rules and validation logic. |
| [gallery-upload.php](Files/gallery-upload.php.md) | Specialized handler for gallery content uploads and processing. |
| [notifications.php](Files/notifications.php.md) | Manages system notifications, alerts, and communication templates. |
| [owners.php](Files/owners.php.md) | Manages owner profiles, preferences, and account-level settings. |
| [payment_service.php](Files/payment_service.php.md) | Shared service for payment processing, validation, and financial operations. |
| [supporting_service.php](Files/supporting_service.php.md) | Provides shared utility functions and cross-cutting concerns support. |

## Continue reading

[Back to Start Here](../Start%20Here.md)