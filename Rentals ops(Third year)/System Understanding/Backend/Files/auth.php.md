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

**Location:** `api/auth.php`

Authenticates owners/staff and issues database-backed sessions.

## Routes or callable helpers

POST auth.php: login; POST ?do=logout: logout; GET ?do=me: current user.

## Access

Login accepts credentials; me requires a session. requireAuth() and requireRole() are reusable access checks.

## Inputs

Login: contact_number (or contact), password. Requests: Authorization: Bearer <token>; currentSession() also accepts session_token query parameter. Logout: session_token in JSON.

## How it works

Looks up USERS by contact number and verifies password_hash. Creates a 32-byte random token encoded as 64 hex characters. SESSIONS stores the token and 24-hour expiry. Each authenticated request extends expiry by 24 hours. Helpers execute without routing when included by another script; routing runs only when SCRIPT_NAME is auth.php.

## Current limits and details

The logout fallback reads session_token from currentSession(), but its SELECT does not return that field. Pass the token in the logout JSON body. Expired rows are rejected, not automatically deleted. The seed password comment is unverified; see the setup note.

## Functions defined

`hashPassword()`, `verifyPassword()`, `currentSession()`, `requireAuth()`, `requireRole()`, `createSession()`.

## Connections

Includes: [[System Understanding/Backend/Files/config.php|config.php]]

Tables: [[System Understanding/Database/Tables/USERS|USERS]], [[System Understanding/Database/Tables/SESSIONS|SESSIONS]]

See [[System Understanding/Backend/API Reference|API Reference]] and [[System Understanding/Current Implementation Gaps|Current Implementation Gaps]].

## Source files

- [api/auth.php](<../../../../api/auth.php>)

Return to [[System Understanding/Start Here|Start Here]].
