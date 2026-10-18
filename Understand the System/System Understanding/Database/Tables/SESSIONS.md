---
title: "SESSIONS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# SESSIONS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Revocable owner bearer-token sessions.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `session_id` | `INT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `user_id` | `INT NOT NULL` |
| `session_token` | `VARCHAR(64) NOT NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `expires_at` | `DATETIME NOT NULL` |

## Keys and relationships

- `UNIQUE KEY uq_sessions_token (session_token)`
- `KEY idx_sessions_user (user_id)`
- `FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE`

- `user_id` → [USERS](USERS.md).`user_id` (ON DELETE CASCADE)

## Runtime use

Source files that directly mention this table: [auth.php](../../Backend/Files/auth.php.md), [owners.php](../../Backend/Files/owners.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
