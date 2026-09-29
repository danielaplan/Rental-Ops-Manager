---
title: "crud.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# crud.php

## In plain language

**The reusable record handler.** CRUD means create, read, update and delete. This helper supplies those common actions so simple catalog files can share the same routine.

**Where it lives:** `api/crud.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

An owner adds an extra microphone to the catalog. The add-ons file tells this helper which fields and table it may use.

## What happens

1. Receive the table and allowed fields from another backend file.
2. Carry out the requested add, view, edit or delete action.
3. Return the saved record or an error.

## What the documentation team should remember

Sharing this routine does not mean every type of record has the same business rules. Some creation defaults override the supplied values; exact details are below.

Read [[System Understanding/Backend/Backend Overview]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Includes: [[System Understanding/Backend/Files/config.php|config.php]], [[System Understanding/Backend/Files/auth.php|auth.php]]

Tables: Shared infrastructure; table depends on caller.

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/crud.php](<../../../../api/crud.php>)

Return to [[System Understanding/Start Here|Start Here]].
