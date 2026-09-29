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

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

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

Read [Booking and Pricing](../../Workflows/Booking%20and%20Pricing.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

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

Includes: [crud.php](crud.php.md)

Tables: [CUSTOMERS](../../Database/Tables/CUSTOMERS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/customers.php](<../../../../api/customers.php>)

## Continue reading

[Previous file: crud.php](crud.php.md) · [Next file: delivery.php](delivery.php.md) · [Back to Start Here](../../Start%20Here.md)
