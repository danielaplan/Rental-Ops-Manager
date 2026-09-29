---
title: "SESSIONS"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# SESSIONS

## In plain language

**Temporary login records.** Each record links a login token to a staff/owner account and an expiry time.

A database **table** is like a spreadsheet for one type of information. A **row** is one saved record. A **column** is one detail within that record. The name `SESSIONS` is the label used by the code.

## Example

The staff member handling Ana’s booking receives a token after signing in.

## Details to recognize first

user_id identifies the account; session_token is temporary proof of login; expires_at says when it stops being valid.

A number ending in `_id` usually identifies a record or points to another one. It lets the system connect records without repeating all their details. The exact relationships appear below.

## How to use this note

Read [[System Understanding/Workflows/Login and Authentication]] for the workflow. For your first pass, explain what this table stores and how it is used. Return to the column dictionary when you need an exact field name or storage rule.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

Database-backed login tokens and expiration timestamps.

**Definition:** `db/seed.sql`. Table names in SQL definitions are uppercase; PHP queries use lowercase. Case sensitivity depends on the MySQL host settings.

### Column dictionary

| Column | SQL type | Declaration rules | Meaning |
|---|---|---|---|
| `session_id` | `INT` | `NOT NULL AUTO_INCREMENT` | Unique identifier for this table row. |
| `user_id` | `INT` | `NOT NULL` | Account reference. |
| `session_token` | `VARCHAR(64)` | `NOT NULL` | Unique 64-character login bearer token. |
| `created_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Session creation time. |
| `expires_at` | `DATETIME` | `NOT NULL` | Session validity cutoff extended on authenticated use. |

Required/default/nullability rules above reproduce the declaration. Columns without NOT NULL are nullable unless a primary key makes them non-null. AUTO_INCREMENT means MySQL allocates the row ID.

### Keys and relationships

- `PRIMARY KEY (session_id)`
- `UNIQUE KEY uq_sessions_token (session_token)`
- `KEY idx_sessions_user (user_id)`
- `CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON UPDATE CASCADE ON DELETE CASCADE`

Parent tables: [[System Understanding/Database/Tables/USERS|USERS]] via `user_id`

Child tables: None.

### Where it is used

[[System Understanding/Backend/Files/auth.php|auth.php]]. Relevant read/write behavior is explained in each file note.

### Important behavior

Created in seed.sql, not schema.sql. Expired sessions remain stored until explicitly cleaned; currentSession only rejects expired tokens.

See [[System Understanding/Database/Table Relationships|Table Relationships]].

## Source files

- [db/seed.sql](<../../../../db/seed.sql>)

Return to [[System Understanding/Start Here|Start Here]].
