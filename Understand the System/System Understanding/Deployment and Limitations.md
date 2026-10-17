---
title: "Deployment and Limitations"
date: 2026-10-17
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
