---
title: "Backend File Inventory"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Backend File Inventory

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

Every current PHP file in `api/` has a linked explanation below. The list is generated from the checkout, so helpers and endpoint files are both visible.

| File | Responsibility |
| --- | --- |
| [addons.php](Files/addons.php.md) | Add-on catalog endpoint. |
| [audit.php](Files/audit.php.md) | Read-only audit and migration-history endpoint. |
| [auth.php](Files/auth.php.md) | Login, logout, current-session, and authentication helpers. |
| [availability_service.php](Files/availability_service.php.md) | Shared blocked-interval, conflict, reconciliation, approval, and release logic. |
| [availabilityBlocks.php](Files/availabilityBlocks.php.md) | Draft availability-block endpoint retained in source. |
| [booking_items_service.php](Files/booking_items_service.php.md) | Compatibility helper that ensures booking checklist items. |
| [booking_pricing.php](Files/booking_pricing.php.md) | Authoritative package/add-on price calculation. |
| [booking_service.php](Files/booking_service.php.md) | Shared booking validation, snapshots, lifecycle, pricing, and conflict integration. |
| [bookingItems.php](Files/bookingItems.php.md) | Booking checklist read/generate/update endpoint. |
| [bookings.php](Files/bookings.php.md) | Direct booking and availability endpoint. |
| [catalog_definitions.php](Files/catalog_definitions.php.md) | Shared CRUD definitions and validation for catalog/customer entities. |
| [categories.php](Files/categories.php.md) | Category CRUD endpoint. |
| [checklist_service.php](Files/checklist_service.php.md) | Package-template copy and booking-checklist update logic. |
| [checklistTemplates.php](Files/checklistTemplates.php.md) | Versioned package checklist-template endpoint. |
| [config.php](Files/config.php.md) | Database, CORS/HTTPS bootstrap, JSON response, and scalar validation helpers. |
| [crud.php](Files/crud.php.md) | Allowlisted generic table CRUD shared by small catalog endpoints and sync. |
| [customers.php](Files/customers.php.md) | Customer CRUD, search, and booking history. |
| [delivery.php](Files/delivery.php.md) | One-per-booking delivery read/upsert endpoint. |
| [deposit_service.php](Files/deposit_service.php.md) | Deposit view, itemized deduction, and upsert validation. |
| [deposits.php](Files/deposits.php.md) | Deposit, deduction, and refund endpoint. |
| [domain.php](Files/domain.php.md) | Transactions, money conversion, audit writes, and booking locks. |
| [equipment_service.php](Files/equipment_service.php.md) | Return inspection and final review integration. |
| [equipment.php](Files/equipment.php.md) | Equipment inspection/final-return endpoint. |
| [gallery-upload.php](Files/gallery-upload.php.md) | Multipart gallery image upload. |
| [gallery.php](Files/gallery.php.md) | Gallery CRUD endpoint. |
| [itemHistory.php](Files/itemHistory.php.md) | Append-only equipment history endpoint. |
| [itemReleases.php](Files/itemReleases.php.md) | Append-only release-event endpoint. |
| [notifications.php](Files/notifications.php.md) | Persistent lifecycle notification reader. |
| [owners.php](Files/owners.php.md) | Primary-owner account administration. |
| [packages.php](Files/packages.php.md) | Package catalog endpoint. |
| [payment_service.php](Files/payment_service.php.md) | Rental-payment validation, correction, balance effects, and audit. |
| [payments.php](Files/payments.php.md) | Payment list/create/correction endpoint. |
| [rentalItems.php](Files/rentalItems.php.md) | Equipment catalog endpoint. |
| [reports.php](Files/reports.php.md) | Operational dashboard, dated reports, and inspectable detail lists. |
| [services.php](Files/services.php.md) | Service catalog/default-allowance endpoint. |
| [settings.php](Files/settings.php.md) | Application JSON settings endpoint for row 1. |
| [supporting_service.php](Files/supporting_service.php.md) | Shared delivery, item-history, and item-release writes. |
| [sync_state.php](Files/sync_state.php.md) | Offline receipt ledger and local-to-server ID mapping. |
| [sync.php](Files/sync.php.md) | Offline operation replay and per-operation acknowledgement. |
| [websiteContent.php](Files/websiteContent.php.md) | Editable site-content JSON endpoint. |

Count: **40 PHP files**. Baseline: `26791d46fabd9551c3ad53b4431afb594f38065b`.
