---
title: "System Understanding — Start Here"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# System Understanding — Start Here

**Guide:** [Start Here](Start%20Here.md) · [System Overview](System%20Overview.md) · [Glossary](Glossary.md) · [Known Limits](Current%20Implementation%20Gaps.md)

## What this guide teaches

Rental-Ops-Manager helps AKAD's owners manage customers, services, packages, bookings, availability, payments, refundable deposits, delivery, equipment returns, reports, and audit history. It also keeps supported work in a local queue during an outage and asks the server to accept it later.

The guide starts with what an owner sees, then explains the browser, PHP API, and MySQL database behind each action. The fictional customer **Ana** appears throughout so that one rental can be followed from booking to final payment.

## Recommended learning path

1. [System Overview](System%20Overview.md) — see the whole application in one picture.
2. [Login and owner management](Workflows/Login%20and%20Authentication.md) — understand access, sessions, lockout, and account controls.
3. [Booking and pricing](Workflows/Booking%20and%20Pricing.md) — create Ana's booking and preserve its agreed details.
4. [Availability and conflicts](Workflows/Availability%20and%20Conflicts.md) — understand blocked intervals and approved overlaps.
5. [Payments and deposits](Workflows/Payments%20and%20Deposits.md) — separate rental income from refundable money.
6. [Equipment release and return](Workflows/Equipment%20Release%20and%20Return.md) — follow package templates and booking snapshots.
7. [Post-event completion](Workflows/Post-event%20Completion.md) — follow Confirmed → Awaiting Completion → Awaiting Payment or Completed.
8. [Offline synchronization](Workflows/Offline%20Synchronization.md) — see how queued operations are accepted, retried, or retained for review.
9. [Reports and audit history](Workflows/Reports.md) — understand each metric and its date basis.
10. [Frontend Overview](Frontend/Overview.md), [Backend Overview](Backend/Backend%20Overview.md), and [Database Overview](Database/Database%20Overview.md) — move from user concepts to implementation detail.
11. [Deployment and Limitations](Deployment%20and%20Limitations.md) and [Current Implementation Gaps](Current%20Implementation%20Gaps.md) — learn what local verification does and does not establish.

## How to read technical pages

- A **frontend** page explains browser screens and JavaScript.
- A **backend** page explains a PHP endpoint or shared service.
- A **table** page explains saved database records and exact schema definitions.
- A **workflow** connects all three layers around one owner task.

Source links are relative and work in GitHub and Obsidian. Terms are defined in the [Glossary](Glossary.md). The [API Reference](Backend/API%20Reference.md), [Backend File Inventory](Backend/File%20Inventory.md), and [Database Table Relationships](Database/Table%20Relationships.md) are lookup pages.

## Authority and evidence

Current source code and `db/schema.sql` establish implemented behavior. Revised requirements and `.project-memory/` explain intended or approved scope. `Implementation/Backend-Requirement-Matrix.md` separates implementation from local synthetic evidence, deployment work, and client acceptance. When these sources differ, this guide names the difference.

Baseline: Git commit `26791d46fabd9551c3ad53b4431afb594f38065b`, inspected on 2026-10-17. No application code, database, migration, test fixture, project-memory file, or official source document was changed by this guide update.

## Continue reading

[Next: System Overview](System%20Overview.md)
