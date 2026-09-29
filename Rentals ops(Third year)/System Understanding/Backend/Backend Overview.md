---
title: "Backend Overview"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Backend Overview

**Navigate:** [Start Here](../Start%20Here.md) · [Reading order](../Start%20Here.md#recommended-reading-order) · [Backend files](File%20Inventory.md) · [Database tables](../Database/Database%20Overview.md) · [Glossary](../Glossary.md)

## Overview

The backend is the part that works behind the screens. It receives a request, checks what is allowed, reads or changes saved records, then sends a result back. This project uses PHP files as the server instructions.

For Ana’s booking, different files have different jobs: one checks staff login, another calculates the rental price, and another saves the booking. Shared helper files supply tools that several feature files need.

## The main responsibilities

| Responsibility | Question it answers |
|---|---|
| Login and permissions | Who is making the request, and may they do this? |
| Booking and pricing | Who is renting, when, and what is the price? |
| Money records | What rental payments and deposits were recorded? |
| Equipment and delivery | What is assigned, released, returned or transported? |
| Synchronization | Which device changes can be accepted into shared records? |
| Reporting | What do the saved records tell the owners? |

## File organization

There are 26 PHP files, including shared helpers. Workflow notes link to the files involved in each process. [File Inventory](File%20Inventory.md) lists every file and its responsibility.

Each file may have its own access rules. “Internal staff tool” is the intended scope, but current code does not require login for every read request. Check the exact behavior before making a claim about permissions.

## Technical details

This section records exact file behavior, field names and implementation details.

There are 26 PHP source files in `api/`: 20 HTTP endpoint files and six shared helper/bootstrap files (`config.php`, `crud.php`, `booking_pricing.php`, `deposit_service.php`, `equipment_service.php`, `sync_state.php`). `auth.php` is both an endpoint and a reusable authentication module.

| Area | Main files | Responsibility |
|---|---|---|
| Connection / shared CRUD | [config.php](Files/config.php.md), [crud.php](Files/crud.php.md) | PDO, request decoding, responses, allowed-field CRUD |
| Login | [auth.php](Files/auth.php.md) | Credentials, tokens, owner/staff checks |
| Booking | [bookings.php](Files/bookings.php.md), [booking_pricing.php](Files/booking_pricing.php.md) | Customer/event linkage, price, karaoke slots |
| Finance | [payments.php](Files/payments.php.md), [deposits.php](Files/deposits.php.md), [deposit_service.php](Files/deposit_service.php.md) | Rental payments and separate refundable deposit |
| Equipment | [bookingItems.php](Files/bookingItems.php.md), [equipment.php](Files/equipment.php.md), [equipment_service.php](Files/equipment_service.php.md) | Assignment, inspection, guarded return completion |
| Logistics | [delivery.php](Files/delivery.php.md), [itemReleases.php](Files/itemReleases.php.md), [itemHistory.php](Files/itemHistory.php.md) | Delivery and explicitly written release/history records |
| Catalog / content | Simple CRUD endpoints, settings and websiteContent | Owner-managed records and JSON documents |
| Reports | [reports.php](Files/reports.php.md) | Summary queries |
| Offline replay | [sync.php](Files/sync.php.md), [sync_state.php](Files/sync_state.php.md) | Operation dispatch, references, receipts, conflicts |

Most reads do not require a session in current code. Writes usually require either any logged-in staff/owner or owner role; the exact rule appears in each file note. Reports require a session. Direct routes and sync implement some rules differently, so do not infer a route's permissions from its feature name.

Start with [Request Lifecycle](Request%20Lifecycle.md), then use [File Inventory](File%20Inventory.md) for individual files.

## Source files

- [api/config.php](<../../../api/config.php>)
- [api/crud.php](<../../../api/crud.php>)
- [api/auth.php](<../../../api/auth.php>)
- [api/sync.php](<../../../api/sync.php>)

## Continue reading

[Previous: System Overview](../System%20Overview.md) · [Next: Request Lifecycle](Request%20Lifecycle.md) · [Back to Start Here](../Start%20Here.md)
