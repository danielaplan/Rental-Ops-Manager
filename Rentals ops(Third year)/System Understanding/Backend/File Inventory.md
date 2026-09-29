---
title: "Backend File Inventory"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Backend File Inventory

## How to use this list

This is a directory of the backend files already explained in the guide. Each file name is clickable and opens its own plain-language explanation.

Files are organized by responsibility. For example, Ana’s rental price is explained in [[System Understanding/Backend/Files/booking_pricing.php|booking_pricing.php]]; saved rental payments are explained in [[System Understanding/Backend/Files/payments.php|payments.php]].

The list includes helper files as well as request handlers. A helper performs a job for another file; it may not offer a staff-facing action by itself.

## Technical details

This section records exact file behavior, field names and implementation details.

Every PHP file present on the review date is listed below. Helpers are included because endpoints depend on them.

| File | Purpose |
|---|---|
| [[System Understanding/Backend/Files/addons.php\|addons.php]] | Optional extras priced under a service. |
| [[System Understanding/Backend/Files/auth.php\|auth.php]] | Authenticates owners/staff and issues database-backed sessions. |
| [[System Understanding/Backend/Files/bookingItems.php\|bookingItems.php]] | Maintains the equipment checklist snapshot assigned to a booking. |
| [[System Understanding/Backend/Files/booking_pricing.php\|booking_pricing.php]] | Shared price calculation for direct and synchronized bookings. |
| [[System Understanding/Backend/Files/bookings.php\|bookings.php]] | Creates, lists, updates, and deletes the central rental booking record. |
| [[System Understanding/Backend/Files/categories.php\|categories.php]] | Standalone category labels; there is no category foreign key in SERVICES. |
| [[System Understanding/Backend/Files/config.php\|config.php]] | Shared request bootstrap and MySQL connection helpers. |
| [[System Understanding/Backend/Files/crud.php\|crud.php]] | Reusable CRUD dispatcher for simple tables, plus the owner-only write guard. |
| [[System Understanding/Backend/Files/customers.php\|customers.php]] | Customer contact directory. Additional ?do=search&q=... matches name/contact using LIKE. |
| [[System Understanding/Backend/Files/delivery.php\|delivery.php]] | Stores the latest delivery arrangement for a booking. |
| [[System Understanding/Backend/Files/deposit_service.php\|deposit_service.php]] | Shared deposit validation and calculation. |
| [[System Understanding/Backend/Files/deposits.php\|deposits.php]] | Reads or saves the refundable deposit for a booking. |
| [[System Understanding/Backend/Files/equipment.php\|equipment.php]] | HTTP routes for return inspections and finalizing returns. |
| [[System Understanding/Backend/Files/equipment_service.php\|equipment_service.php]] | Shared atomic return inspection and guarded completion. |
| [[System Understanding/Backend/Files/gallery.php\|gallery.php]] | Image/content records. image is text; this script does not implement a file upload processor. |
| [[System Understanding/Backend/Files/itemHistory.php\|itemHistory.php]] | Reads and appends equipment history entries. |
| [[System Understanding/Backend/Files/itemReleases.php\|itemReleases.php]] | Records a release event; this endpoint does not itself update item quantities or booking status. |
| [[System Understanding/Backend/Files/packages.php\|packages.php]] | Fixed-price packages under a service. Supplied service_id on create/update is checked for existence. |
| [[System Understanding/Backend/Files/payments.php\|payments.php]] | Records rental payments and updates the booking payment summary. |
| [[System Understanding/Backend/Files/rentalItems.php\|rentalItems.php]] | Reusable equipment catalog used to generate booking checklists. |
| [[System Understanding/Backend/Files/reports.php\|reports.php]] | Calculates dashboard and booking/date-range report summaries. |
| [[System Understanding/Backend/Files/services.php\|services.php]] | Catalog of the three service lines. |
| [[System Understanding/Backend/Files/settings.php\|settings.php]] | Reads/replaces the application settings object. |
| [[System Understanding/Backend/Files/sync.php\|sync.php]] | Validates and commits offline operations with per-operation receipts. |
| [[System Understanding/Backend/Files/sync_state.php\|sync_state.php]] | Receipt ledger and temporary-to-server ID mapping for replay safety. |
| [[System Understanding/Backend/Files/websiteContent.php\|websiteContent.php]] | Reads/replaces the website content object. |
Return to [[System Understanding/Start Here|Start Here]].
