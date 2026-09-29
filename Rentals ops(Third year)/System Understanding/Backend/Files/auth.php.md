---
title: "auth.php"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# auth.php

## In plain language

**The login checker.** This file checks owner/staff login details and gives a successful login a temporary session: permission to make protected requests for a period of time.

**Where it lives:** `api/auth.php`. A `.php` file contains instructions the server runs; it is not a screen the staff member reads.

## Example

A staff member signs in before recording Ana’s payment. The payment request carries proof of that login.

## What happens

1. Find the account using its contact number.
2. Check its password and issue a temporary login token.
3. Check the token and account role when protected actions are requested.

## What the documentation team should remember

A customer record is separate from a staff account. The logout request needs the token in its message body with the current implementation.

Read [[System Understanding/Workflows/Login and Authentication]] for the wider story. Use [[System Understanding/Glossary]] whenever a technical word below is unfamiliar.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

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

Includes: [[System Understanding/Backend/Files/config.php|config.php]]

Tables: [[System Understanding/Database/Tables/USERS|USERS]], [[System Understanding/Database/Tables/SESSIONS|SESSIONS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/auth.php](<../../../../api/auth.php>)

Return to [[System Understanding/Start Here|Start Here]].
