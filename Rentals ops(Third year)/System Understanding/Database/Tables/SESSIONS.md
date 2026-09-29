---
title: "SESSIONS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# SESSIONS

Database-backed login tokens and expiration timestamps.

**Definition:** `db/seed.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

## Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `session_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `user_id` | `INT` | `NOT NULL` | Account reference. |
| `session_token` | `VARCHAR(64)` | `NOT NULL` | Unique 64-character login bearer token. |
| `created_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Session creation time. |
| `expires_at` | `DATETIME` | `NOT NULL` | Session validity cutoff extended on authenticated use. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

## Keys and relationships

- `PRIMARY KEY (session_id)`
- `UNIQUE KEY uq_sessions_token (session_token)`
- `KEY idx_sessions_user (user_id)`
- `CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE CASCADE`

Parent tables: [[System Understanding/Database/Tables/USERS|USERS]] via `user_id`

Child tables: None.

## Where it is used

[[System Understanding/Backend/Files/auth.php|auth.php]]. Relevant read/write behavior is explained in each file note.

## Important behavior

Created in seed.sql, not schema.sql. Expired sessions remain stored until explicitly cleaned; currentSession only rejects expired tokens.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/seed.sql](<../../../../db/seed.sql>)

Return to [[System Understanding/Start Here|Start Here]].
