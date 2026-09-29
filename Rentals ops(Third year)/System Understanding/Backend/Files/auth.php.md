---
title: "auth.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# auth.php

**Navigate:** [Start Here](../../Start%20Here.md) · [Reading order](../../Start%20Here.md#recommended-reading-order) · [Backend files](../File%20Inventory.md) · [Database tables](../../Database/Database%20Overview.md) · [Glossary](../../Glossary.md)

## Overview

**The login checker.** This file checks owner/staff login details and gives a successful login a temporary session: permission to make protected requests for a period of time.

**Where it lives:** `api/auth.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

A staff member signs in before recording Ana’s payment. The payment request carries proof of that login.

## What happens

1. Find the account using its contact number.
2. Check its password and issue a temporary login token.
3. Check the token and account role when protected actions are requested.

## Key points

A customer record is separate from a staff account. The logout request needs the token in its message body with the current implementation.

Read [Login and Authentication](../../Workflows/Login%20and%20Authentication.md) for the wider story. Definitions are available in [Glossary](../../Glossary.md).

## Technical details

This section records exact file behavior, field names and implementation details.

**Location:** `api/auth.php`

Authenticates owners/staff and issues database-backed sessions.

### Routes or callable helpers

POST auth.php: login; POST ?do=logout: logout; GET ?do=me: current user.

### Access

Login accepts credentials; me requires a session. requireAuth() and requireRole() are reusable access checks.

### Inputs

Login: contact_number (or contact), password. Requests: Authorization: Bearer <token>; currentSession() also accepts session_token query parameter. Logout: session_token in JSON.

### How it works

Looks up USERS by contact number and verifies password_hash. Creates a 32-byte random token encoded as 64 hex characters. SESSIONS stores the token and 24-hour expiry. Each authenticated request extends expiry by 24 hours. Helpers execute without routing when included by another script; routing runs only when SCRIPT_NAME is auth.php.

### Current limits and details

The logout fallback reads session_token from currentSession(), but its SELECT does not return that field. Pass the token in the logout JSON body. Expired rows are rejected, not automatically deleted. The seed password comment is unverified; see the setup note.

### Functions defined

`hashPassword()`, `verifyPassword()`, `currentSession()`, `requireAuth()`, `requireRole()`, `createSession()`.

### Connections

Includes: [config.php](config.php.md)

Tables: [USERS](../../Database/Tables/USERS.md), [SESSIONS](../../Database/Tables/SESSIONS.md)

See [API Reference](../API%20Reference.md) and [Current Implementation Gaps](../../Current%20Implementation%20Gaps.md).

## Source files

- [api/auth.php](<../../../../api/auth.php>)

## Continue reading

[Previous file: addons.php](addons.php.md) · [Next file: bookingItems.php](bookingItems.php.md) · [Back to Start Here](../../Start%20Here.md)
