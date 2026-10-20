---
title: "API Reference"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# API Reference

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Contract

Requests use JSON unless an upload is multipart. Successful responses normally use `{ "ok": true, "data": ... }`; failures use `{ "ok": false, "error": "...", "code": "..." }` with an appropriate HTTP status. Protected requests send `Authorization: Bearer <token>`. Query parameter `do` selects an action; IDs may be numeric or supported UI-prefixed values where `entityId()`/`serverId()` is used.

## Endpoint inventory

| File | Observed actions | Purpose |
| --- | --- | --- |
| [addons.php](Files/addons.php.md) | GET all/get/forService; POST create/update/delete. | Public reads; owner-authenticated writes. |
| [audit.php](Files/audit.php.md) | GET with after_id and limit. | Authenticated owner. |
| [auth.php](Files/auth.php.md) | POST login; POST ?do=logout; GET ?do=me. | Login is public; me/protected helpers require an active owner. |
| [availabilityBlocks.php](Files/availabilityBlocks.php.md) | GET all/get; POST create/update/deactivate/reactivate. Product use remains deferred. | Authenticated; writes enforce owner role. |
| [booking_items_service.php](Files/booking_items_service.php.md) | ensureBookingItems(). | Caller-controlled. |
| [booking_pricing.php](Files/booking_pricing.php.md) | calculateBookingTotals(). | Caller-controlled. |
| [booking_service.php](Files/booking_service.php.md) | bookingView(), bookingRow(), entityId(), saveBooking(). | Caller supplies authenticated owner. |
| [bookingItems.php](Files/bookingItems.php.md) | GET forBooking; POST generate/update. | Authenticated owner. |
| [bookings.php](Files/bookings.php.md) | GET availability/all/get; POST create/update/cancel/delete/release/complete. | Authenticated owner. |
| [categories.php](Files/categories.php.md) | Generic all/get/create/update/delete. | Authenticated reads and owner writes. |
| [checklist_service.php](Files/checklist_service.php.md) | checklistRows(), copyBookingChecklist(), updateChecklistItem(). | Caller-controlled. |
| [checklistTemplates.php](Files/checklistTemplates.php.md) | GET all; POST create/update/delete. | Authenticated owner. |
| [config.php](Files/config.php.md) | db(), sendJson(), readJsonBody(), input(), requireField(), asInt(), asDecimal(), asDate(), asTime(). | Loaded by API files. |
| [crud.php](Files/crud.php.md) | tableCrudSave(), tableCrud(), authWrite(). | Reads may be public only when a definition explicitly allows it; direct writes require owner. |
| [customers.php](Files/customers.php.md) | GET all/get/search/history; POST create/update/delete. | Authenticated owner. |
| [delivery.php](Files/delivery.php.md) | GET get; POST upsert. | Authenticated owner. |
| [deposit_service.php](Files/deposit_service.php.md) | depositView(), addDepositDeduction(), saveDeposit(). | Caller-controlled. |
| [deposits.php](Files/deposits.php.md) | GET get; POST create/upsert/deduct/refund. | Authenticated owner. |
| [domain.php](Files/domain.php.md) | domainFail(), domainTransaction(), moneyCents(), centsDecimal(), auditWrite(), lockBooking(). | Shared helper. |
| [equipment_service.php](Files/equipment_service.php.md) | saveReturnInspection(), finalizeBookingReturn(); return history is written in the inspection transaction. | Caller supplies authenticated owner. |
| [equipment.php](Files/equipment.php.md) | GET checklist data; POST inspect/finalizeReturn. | Authenticated owner. |
| [gallery-upload.php](Files/gallery-upload.php.md) | POST upload. | Owner role required. |
| [gallery.php](Files/gallery.php.md) | Generic all/get/create/update/delete. | Public reads; owner-authenticated writes. |
| [itemHistory.php](Files/itemHistory.php.md) | GET forItem; POST create. | Authenticated owner. |
| [itemReleases.php](Files/itemReleases.php.md) | GET all/forBooking/get; POST create for one completed outgoing checklist on a Confirmed booking. | Authenticated owner; release history is written in the same transaction. |
| [notifications.php](Files/notifications.php.md) | GET all/unresolved. Resolution is workflow-controlled. | Authenticated owner. |
| [owners.php](Files/owners.php.md) | GET all; POST create/deactivate/reactivate/resetPassword. | Authenticated; primary-owner restrictions apply. |
| [packages.php](Files/packages.php.md) | Generic all/get/create/update/delete. | Public reads; owner-authenticated writes. |
| [payment_service.php](Files/payment_service.php.md) | savePayment(). | Caller supplies authenticated owner. |
| [payments.php](Files/payments.php.md) | GET all with optional booking filter; POST create/update. Updates require a correction reason and are audited. | Authenticated owner. |
| [rentalItems.php](Files/rentalItems.php.md) | Generic all/get/forService/create/update/delete. | Authenticated reads and owner writes. |
| [reports.php](Files/reports.php.md) | GET dashboard/report/upcoming/cancellations/overlaps. | Authenticated owner. |
| [services.php](Files/services.php.md) | Generic all/get/create/update/delete. | Public reads; owner-authenticated writes. |
| [settings.php](Files/settings.php.md) | GET get; POST update. | Authenticated read; owner write. |
| [supporting_service.php](Files/supporting_service.php.md) | saveDelivery(), saveItemHistory(), saveItemRelease(). | Caller supplies authenticated owner. |
| [sync_state.php](Files/sync_state.php.md) | syncState(), syncReference(), saveSyncReceipt(). | Scoped by authenticated owner in sync transactions. |
| [sync.php](Files/sync.php.md) | GET queue placeholder; POST commit up to 100 operations, including audited payment updates. | Authenticated owner. |
| [websiteContent.php](Files/websiteContent.php.md) | GET get; POST update. | Public read; owner write. |

## Conflict and retry responses

Booking conflicts use HTTP 409 and include current booking/block details. Sync commit itself returns HTTP success with three arrays—`committed`, `conflicts`, and `failed`—because each operation is handled separately. Callers must inspect those arrays.

## Public reads

Current source intentionally allows public reads for services, packages, add-ons, gallery, and website content. Other internal records require authentication. This is a source fact, not a statement that a public booking workflow is approved.

## Source

[js/api.js](../../../js/api.js) · [api directory](../../../api/config.php)


## Technical navigation

[Backend Overview](Backend%20Overview.md) · [Backend File Inventory](File%20Inventory.md) · [Start Here](../Start%20Here.md)
