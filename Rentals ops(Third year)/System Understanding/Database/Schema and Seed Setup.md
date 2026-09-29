---
title: "Schema and Seed Setup"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# Schema and Seed Setup

## What these files do

A **schema** describes how saved information is organized: table names, columns and relationship rules. A **seed** supplies starting/demo records so a developer can try the application.

In this project, schema.sql builds the main database structure. seed.sql adds demo records and also creates the SESSIONS table needed for login. The intended order is schema first, then seed.

## Example

The starting catalog includes karaoke, Sweet Corner and balloon decoration, with sample packages. Ana’s teaching example uses catalog choices to explain pricing; it does not add a real booking.

## What your team needs to know

Database setup is a developer task. These scripts are not daily staff actions. Re-running the seed can overwrite matching demo records, and the schema script is not a complete system for upgrading existing databases. Equipment catalog items also need to be supplied before meaningful assigned equipment lists can be generated.

For documentation, explain what each setup file provides and its order. Consult a developer before describing a command as safe for an existing live database.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

The initialization order is `db/schema.sql`, then `db/seed.sql`. This page explains the scripts; no database initialization was run while writing the guide.

1. schema.sql creates/selects `akad_rentals`, then defines 18 tables and reporting indexes.
2. seed.sql selects that database, creates SESSIONS, and inserts demo accounts, services, categories, add-ons, packages, customers, bookings and payments.
3. PHP must run behind a web server with PDO MySQL available. Database connection values come from AKAD_DB_HOST/NAME/USER/PASS or config.php defaults.
4. Login depends on SESSIONS, so schema.sql by itself is not the complete application setup.
5. The first sync commit inserts APP_SETTINGS row 2 if missing. Settings/content row 1 is created on the corresponding update if absent.

### Rerun behavior

CREATE TABLE IF NOT EXISTS does not migrate an existing table to a new definition. Schema indexes use bare CREATE INDEX, so rerunning against a schema with these indexes can fail with duplicate index names. Seed upserts prevent duplicate primary-key rows but overwrite matching demo records, including account hashes and booking values. Do not treat seed reruns as preserving live operational data.

RENTAL_ITEMS is not populated by seed.sql. A real catalog must be created before generating meaningful equipment assignments. The verification fixture adds its own rental item; that is not production seed data.

### Demo authentication caveat

The seed comments claim a demo password, but the checked-in hash must be verified with PHP password_verify() before advertising any password. This guide does not promise that comment is correct. The test provisioning script explicitly generates a separate password hash and replaces the synthetic owner's credentials.

### Deployment differences

SQL defines uppercase table names and PHP queries lowercase names. Verify MySQL table-name case behavior when moving from Windows to a case-sensitive host. SQL CREATE DATABASE/USE statements specify akad_rentals independently of PHP environment variables; selecting a different PHP DB name does not retarget those scripts automatically.

The isolated verification setup substitutes the database name with `akad_verify_20260928` and starts local PHP processes on ports 8017/8018. Its data, credentials and logs are test fixtures. See [[System Understanding/Backend/Supporting Files and Evidence]].

## Source files

- [db/schema.sql](<../../../db/schema.sql>)
- [db/seed.sql](<../../../db/seed.sql>)
- [api/config.php](<../../../api/config.php>)
- [tests/start_verification.py](<../../../tests/start_verification.py>)

Return to [[System Understanding/Start Here|Start Here]].
