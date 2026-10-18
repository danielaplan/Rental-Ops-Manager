---
title: "AUDIT_LOGS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# AUDIT_LOGS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Append-only sensitive-action and status history.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `audit_id` | `BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY` |
| `user_id` | `INT NULL` |
| `action` | `VARCHAR(80) NOT NULL` |
| `record_type` | `VARCHAR(50) NOT NULL` |
| `record_id` | `INT NOT NULL` |
| `description` | `TEXT NOT NULL` |
| `old_status` | `VARCHAR(30) NULL` |
| `new_status` | `VARCHAR(30) NULL` |
| `origin` | `VARCHAR(20) NOT NULL DEFAULT 'owner'` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

## Keys and relationships

- `KEY idx_audit_record (record_type, record_id, created_at, audit_id)`
- `KEY idx_audit_actor (user_id, created_at)`
- `FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE RESTRICT`

- `user_id` → [USERS](USERS.md).`user_id` (ON DELETE RESTRICT)

## Runtime use

Source files that directly mention this table: [audit.php](../../Backend/Files/audit.php.md), [domain.php](../../Backend/Files/domain.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)


## Technical navigation

[Return to the Database Overview](../Database%20Overview.md) · [See Table Relationships](../Table%20Relationships.md) · [Return to Start Here](../../Start%20Here.md)
