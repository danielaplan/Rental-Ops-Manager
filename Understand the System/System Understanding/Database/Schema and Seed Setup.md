---
title: "Schema and Seed Setup"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Schema and Seed Setup

**Guide:** [Start Here](../Start%20Here.md) · [System Overview](../System%20Overview.md) · [Glossary](../Glossary.md) · [Known Limits](../Current%20Implementation%20Gaps.md)

## Purpose

`db/schema.sql` creates the clean database structure. `db/seed.sql` supplies development/demo data. `db/migrations/20261015_revised_backend.php` is an evidence-gated legacy conversion tool and is not needed for the current clean-data deployment decision.

## Safe setup model

Create a clean staging database from the reviewed schema, then create production owner credentials through a controlled setup process. Do not copy sample transactions or test credentials. The project-memory decision says existing repository records and the former 51-row worksheet are synthetic and Not Applicable to the clean deployment path.

## Rerun and deployment cautions

`CREATE TABLE IF NOT EXISTS` helps initial setup but is not a complete migration system. Bare `CREATE INDEX` statements can fail on rerun. Table-name case behavior differs across hosts. SQL files declare uppercase table names while PHP queries commonly use lowercase; validate the production MySQL/MariaDB setting. Backup/restore, TLS/origin configuration, scheduler registration, and production acceptance remain separate.

## Source files

- [db/schema.sql](../../../db/schema.sql)
- [db/seed.sql](../../../db/seed.sql)
- [migration guide](../../../Implementation/Backend-Migration.md)
- [requirement matrix](../../../Implementation/Backend-Requirement-Matrix.md)
