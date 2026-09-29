---
title: "customers.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# customers.php

## Overview

**The renter-directory handler.** This file keeps contact details for people who rent services.

**Where it lives:** `api/customers.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

Ana’s name and contact are stored once and can be linked to her booking.

## What happens

1. Save or retrieve customer contact records.
2. Search names or contact numbers.
3. Allow an owner to maintain the customer directory.

## Key points

Customer records are not owner/staff login accounts. Booking creation has its own customer-handling path.

Read [[System Understanding/Workflows/Booking and Pricing]] for the wider story. Definitions are available in [[System Understanding/Glossary]].

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/customers.php`

Customer contact directory. Additional ?do=search&q=... matches name/contact using LIKE.

### Routes or callable helpers

Shared CRUD: GET ?do=all (also the default GET), ?do=get&id=...; ?do=forService&service_id=... or ?do=forBooking&booking_id=... where the table has that column; POST ?do=create, ?do=update&id=..., ?do=delete&id=....

### Access

Reads are unauthenticated. Every POST requires owner via authWrite().

### Inputs

Primary key: customer_id. Accepted JSON fields: full_name, contact_number, messenger_handle. Create defaults: none.

### How it works

Includes crud.php and dispatches tableCrud() with a fixed table/field allowlist. Customer contact directory. Additional ?do=search&q=... matches name/contact using LIKE.

### Current limits and details

Only use filters that correspond to actual columns. See crud.php for default precedence and limited field validation. Foreign-key constraints can reject referenced deletions.

### Connections

Includes: [[System Understanding/Backend/Files/crud.php|crud.php]]

Tables: [[System Understanding/Database/Tables/CUSTOMERS|CUSTOMERS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/customers.php](<../../../../api/customers.php>)

Return to [[System Understanding/Start Here|Start Here]].
