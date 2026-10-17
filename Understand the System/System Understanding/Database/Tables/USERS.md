---
title: "USERS"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# USERS

**Guide:** [Database Overview](../Database%20Overview.md) · [Relationships](../Table%20Relationships.md) · [Start Here](../../Start%20Here.md)

## What this table stores

Owner accounts, password hashes, lockout state, and primary-owner flag.

**Status:** current schema table.

## Ana example

When this table participates in Ana’s rental, its foreign keys connect the row to the relevant booking, catalog record, or owner.

## Column dictionary

| Column | Exact schema definition |
| --- | --- |
| `user_id` | `INT NOT NULL AUTO_INCREMENT` |
| `full_name` | `VARCHAR(100) NOT NULL` |
| `role` | `ENUM('owner','staff') NOT NULL DEFAULT 'owner'` |
| `username` | `VARCHAR(100) NULL` |
| `account_status` | `VARCHAR(20) NOT NULL DEFAULT 'Active'` |
| `is_primary_owner` | `TINYINT(1) NOT NULL DEFAULT 0` |
| `failed_login_count` | `INT UNSIGNED NOT NULL DEFAULT 0` |
| `locked_until` | `DATETIME NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |
| `contact_number` | `VARCHAR(20)` |
| `password_hash` | `VARCHAR(255) NOT NULL` |

## Keys and relationships

- `PRIMARY KEY (user_id)`
- `UNIQUE KEY uq_users_username (username)`

- No foreign keys are declared for this table.

## Runtime use

Source files that directly mention this table: [audit.php](../../Backend/Files/audit.php.md), [auth.php](../../Backend/Files/auth.php.md), [availability_service.php](../../Backend/Files/availability_service.php.md), [owners.php](../../Backend/Files/owners.php.md), [reports.php](../../Backend/Files/reports.php.md).

The PHP services can impose validation and workflow rules beyond these SQL definitions. Read the connected workflow before changing data directly.

## Source

[db/schema.sql](../../../../db/schema.sql)
