---
title: "auth.php"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# auth.php

**Guide:** [Backend Overview](../Backend%20Overview.md) · [API Reference](../API%20Reference.md) · [File Inventory](../File%20Inventory.md) · [Start Here](../../Start%20Here.md)

## What is this file?

Login, logout, current-session, and authentication helpers. It is a **HTTP endpoint** at `api/auth.php`.

## Why it exists

It keeps this responsibility in one backend location so direct callers and, where applicable, offline replay can apply the same rule.

## Ana example

During Ana’s rental, this component proves the request belongs to an active owner.

## Observed interface and access

- **Interface:** POST login; POST ?do=logout; GET ?do=me.
- **Access:** Login is public; me/protected helpers require an active owner.
- **Functions declared here:** `hashPassword()`, `verifyPassword()`, `sessionToken()`, `currentSession()`, `requireAuth()`, `requireRole()`, `createSession()`.

## Connections

- Includes: [config.php](config.php.md), [domain.php](domain.php.md).
- Tables named directly: [USERS](../../Database/Tables/USERS.md), [SESSIONS](../../Database/Tables/SESSIONS.md).

## Important rules and limitations

Validation and transaction behavior is defined by current source and its shared dependencies. Do not infer product readiness from the file’s presence.

## Source

[api/auth.php](../../../../api/auth.php)


## Technical navigation

[Return to the Backend File Inventory](../File%20Inventory.md) · [Review the API Reference](../API%20Reference.md) · [Return to Start Here](../../Start%20Here.md)
