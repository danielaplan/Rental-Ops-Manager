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

There are 26 PHP files, including shared helpers. Workflow notes link to the files involved in each process. [[System Understanding/Backend/File Inventory]] lists every file and its responsibility.

Each file may have its own access rules. “Internal staff tool” is the intended scope, but current code does not require login for every read request. Check the exact behavior before making a claim about permissions.

## Technical details

This section records exact file behavior, field names and implementation details.

There are 26 PHP source files in `api/`: 20 HTTP endpoint files and six shared helper/bootstrap files (`config.php`, `crud.php`, `booking_pricing.php`, `deposit_service.php`, `equipment_service.php`, `sync_state.php`). `auth.php` is both an endpoint and a reusable authentication module.

| Area | Main files | Responsibility |
|---|---|---|
| Connection / shared CRUD | [[System Understanding/Backend/Files/config.php\|config.php]], [[System Understanding/Backend/Files/crud.php\|crud.php]] | PDO, request decoding, responses, allowed-field CRUD |
| Login | [[System Understanding/Backend/Files/auth.php\|auth.php]] | Credentials, tokens, owner/staff checks |
| Booking | [[System Understanding/Backend/Files/bookings.php\|bookings.php]], [[System Understanding/Backend/Files/booking_pricing.php\|booking_pricing.php]] | Customer/event linkage, price, karaoke slots |
| Finance | [[System Understanding/Backend/Files/payments.php\|payments.php]], [[System Understanding/Backend/Files/deposits.php\|deposits.php]], [[System Understanding/Backend/Files/deposit_service.php\|deposit_service.php]] | Rental payments and separate refundable deposit |
| Equipment | [[System Understanding/Backend/Files/bookingItems.php\|bookingItems.php]], [[System Understanding/Backend/Files/equipment.php\|equipment.php]], [[System Understanding/Backend/Files/equipment_service.php\|equipment_service.php]] | Assignment, inspection, guarded return completion |
| Logistics | [[System Understanding/Backend/Files/delivery.php\|delivery.php]], [[System Understanding/Backend/Files/itemReleases.php\|itemReleases.php]], [[System Understanding/Backend/Files/itemHistory.php\|itemHistory.php]] | Delivery and explicitly written release/history records |
| Catalog / content | Simple CRUD endpoints, settings and websiteContent | Owner-managed records and JSON documents |
| Reports | [[System Understanding/Backend/Files/reports.php\|reports.php]] | Summary queries |
| Offline replay | [[System Understanding/Backend/Files/sync.php\|sync.php]], [[System Understanding/Backend/Files/sync_state.php\|sync_state.php]] | Operation dispatch, references, receipts, conflicts |

Most reads do not require a session in current code. Writes usually require either any logged-in staff/owner or owner role; the exact rule appears in each file note. Reports require a session. Direct routes and sync implement some rules differently, so do not infer a route's permissions from its feature name.

Start with [[System Understanding/Backend/Request Lifecycle]], then use [[System Understanding/Backend/File Inventory]] for individual files.

## Source files

- [api/config.php](<../../../api/config.php>)
- [api/crud.php](<../../../api/crud.php>)
- [api/auth.php](<../../../api/auth.php>)
- [api/sync.php](<../../../api/sync.php>)

Return to [[System Understanding/Start Here|Start Here]].
