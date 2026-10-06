---
title: "crud.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# crud.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The reusable record handler.** CRUD means create, read, update and delete. This helper supplies those common actions so simple catalog files can share the same routine.

**Where it lives:** `api/crud.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

An owner adds an extra microphone to the catalog. The add-ons file tells this helper which fields and table it may use.

## What happens

1. Receive the table and allowed fields from another backend file.
2. Carry out the requested add, view, edit or delete action.
3. Return the saved record or an error.

## Key points

Sharing this routine does not mean every type of record has the same business rules. Some creation defaults override the supplied values; exact details are below.

Read [Backend Overview](../Backend%20Overview.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/crud.php`

Reusable CRUD dispatcher for simple tables, plus the owner-only write guard.

### Routes or callable helpers

tableCrud(): all, forService, forBooking, get; POST create, update, delete. authWrite(): owner check.

### Access

The caller must invoke authWrite(); tableCrud() does not authenticate by itself.

### Inputs

Table name, primary-key name, allowed fields, creation defaults, optional filters argument. HTTP id, service_id, booking_id, and JSON fields.

### How it works

Selects all rows by descending primary key, optionally filters by service/booking, fetches a record, or inserts/updates/deletes allowed fields using prepared values. Creates return 201; missing records 404; missing fields 400. Table/column names come from code allowlists.

### Current limits and details

The filters argument is unused. List/get branches do not restrict HTTP method. PHP array union $defaults + $vals gives defaults precedence on create: supplied values for defaulted fields are overridden. Update accepts those fields. Required fields and many domain rules rely on database constraints.

### Functions defined

`tableCrud()`, `authWrite()`.

### Connections

Includes: [config.php](config.php.md), [auth.php](auth.php.md)

Tables: Shared infrastructure; table depends on caller.

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/crud.php](<../../../../api/crud.php>)

## Continue reading

[Previous file: config.php](config.php.md) · [Next file: customers.php](customers.php.md) · [Back to Start Here](../../Start%20Here.md)
