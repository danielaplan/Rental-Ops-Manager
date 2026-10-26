---
title: "Deployment and Limitations"
date: 2026-10-18
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Deployment and Limitations

**Guide:** [Start Here](Start%20Here.md) · [System Overview](System%20Overview.md) · [Glossary](Glossary.md) · [Known Limits](Current%20Implementation%20Gaps.md)

## Runtime requirements

A web server with PHP/PDO MySQL, MySQL or MariaDB, HTTPS, writable upload storage where gallery uploads are enabled, and a browser capable of the application’s JavaScript/storage features. Production configuration supplies database credentials and allowed origins. A scheduler should run `scripts/reconcile_bookings.php`; request-time reconciliation is a fallback.

## Clean deployment path

The current decision is a clean schema initialization. Repository accounts, bookings, payments, checklists, databases, fixtures, and the 51-row worksheet are synthetic. Do not migrate them or deploy seed credentials. Reopen evidence-gated migration only if a real legacy source later appears.

## Before production acceptance

Verify backup and restore on the target, create production owners safely, enforce TLS and origins, register the scheduler, test table-name case behavior, use representative data for latency/capacity, reconcile report definitions with owner records, run real-device/offline/storage tests, and obtain client acceptance.

Local tests and the owner-approved synthetic walkthrough demonstrate behavior in those environments. They do not establish production readiness by themselves.

### Latest local verification — 2026-10-18

After starting local XAMPP MySQL, `node tests/run_backend_acceptance.cjs` passed all nine backend/sync test files, all 17 offline integration checks, all 37 frontend tests, syntax checks, and `git diff --check`. The runner used isolated synthetic database `akad_verify_plan_1792257592586_23952`; evidence is stored in `tests/acceptance-results/1792257592167-5292/`. Source hashes were unchanged.

This result verifies the current code in the local synthetic environment. It excluded migration execution, deferred internal availability blockouts, operational database access, manual device/owner acceptance, and production/performance acceptance.

## Client and domain deployment checklist

The application is a strong local release candidate, but uploading the repository to a domain is not the whole deployment. Complete these seven areas before the client uses it for real operations.

### 1. Prepare compatible hosting

Use hosting with PHP 8.2 or newer, PDO MySQL, MySQL or MariaDB, HTTPS, environment-variable configuration, writable `uploads/gallery/` storage, and cron or scheduled-task support.

### 2. Create a clean production database

Initialize the production database with `db/schema.sql`. Do not run the legacy migration for the current clean-data deployment. Do not import `db/seed.sql`: its accounts, passwords, bookings, and other records are synthetic test data.

### 3. Create real owner accounts

Create only the authorized production owners, using strong and unique passwords. Never deploy the sample accounts or the known development password.

### 4. Configure the production environment

Set `AKAD_ENV=production` and provide `AKAD_DB_HOST`, `AKAD_DB_NAME`, `AKAD_DB_USER`, and `AKAD_DB_PASS`. Set `AKAD_ALLOWED_ORIGINS` to the exact HTTPS domain or approved comma-separated domains. Keep credentials outside Git and documentation. Current source fails closed in production if any of those values is missing, rather than falling back to local XAMPP defaults.

### 5. Configure and protect the domain

Point DNS to the hosting server, install a valid TLS certificate, redirect HTTP to HTTPS, and ensure the web server tells PHP that the request is secure. Deploy an allowlisted application package where possible. Otherwise, retain the root `.htaccess` protections and verify that internal material such as `.git/`, `.project-memory/`, `Implementation/`, `Source Documents/`, `Understand the System/`, `QA-Reports/`, `db/`, `tests/`, `AGENTS.md`, `CLAUDE.md`, and `PROJECT_INDEX.md` returns 403 or 404 while the required application, admin, API, and upload paths remain available.

### 6. Register scheduled reconciliation

Run `scripts/reconcile_bookings.php` periodically with the same explicit production database environment. Capture its output, monitor failures, and verify that the job targets only the intended production database.

### 7. Verify before client acceptance

Create and restore a production backup, then test real owner login, booking, availability, payments, deposits and deductions, delivery, equipment return, reports, audit history, gallery uploads, logout, and password reset. Test offline save and reconnect on physical phones and another supported browser. Reconcile report totals with the client's expectations and obtain explicit client acceptance before calling the deployment complete.

The legacy migration becomes relevant only if a real historical database must be preserved later. It is not part of the current deployment path.


## Continue Your Learning

**You’ve learned:** which checks still belong to staging, production, devices, operations, and client acceptance.

**Previous topic:** [Reports and Audit History](Workflows/Reports.md)

**Next topic:** [Frontend Overview](Frontend/Overview.md)

**Why read this next?** The non-developer journey is complete. Continue only if you want to explore how the visible screens are built.

**Return to your learning dashboard:** [Start Here](Start%20Here.md)
