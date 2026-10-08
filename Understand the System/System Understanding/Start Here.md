---
title: "System Understanding — Start Here"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# System Understanding — Start Here

**Navigate:** [Start Here](Start%20Here.md) · [Reading order](Start%20Here.md#recommended-reading-order) · [Backend files](Backend/File%20Inventory.md) · [Database tables](Database/Database%20Overview.md) · [Glossary](Glossary.md)

## Purpose of this guide

This guide introduces the system’s backend and database, starting with an overview and progressing to technical details.

It explains each part’s purpose, the information it handles, and its connections to the rest of the system.

## How to read each note

Each note begins with an overview and example. The **Technical details** section provides exact field names, code behavior and storage rules.

The navigation bar links to the reading order, file inventory, table overview and glossary. Previous/Next links follow the main reading sequence; file and table references have their own alphabetical sequence.

File notes explain server instructions. Table notes explain saved information. Workflow notes explain how several parts work together. A filename is a location in the project, not a screen the user operates.

## Recommended reading order

1. [System Overview](System%20Overview.md) — understand the purpose and follow the example customer, Ana.
2. [Backend Overview](Backend/Backend%20Overview.md) and [Request Lifecycle](Backend/Request%20Lifecycle.md) — trace what happens behind an action.
3. [Database Overview](Database/Database%20Overview.md) and [Table Relationships](Database/Table%20Relationships.md) — follow the connections between saved records.
4. [Login and Authentication](Workflows/Login%20and%20Authentication.md) — understand staff access.
5. [Booking and Pricing](Workflows/Booking%20and%20Pricing.md) — follow a rental from details to calculated price.
6. [Payments and Deposits](Workflows/Payments%20and%20Deposits.md) — separate rental money from held refundable money.
7. [Equipment Release and Return](Workflows/Equipment%20Release%20and%20Return.md) — follow the assigned items and return inspection.
8. [Offline Synchronization](Workflows/Offline%20Synchronization.md) — trace how a local draft becomes a shared record.
9. [Reports](Workflows/Reports.md) — understand what the summaries count.
10. [Frontend Overview](Frontend/Overview.md) — understand the staff interface and how it connects to the backend.
11. [Frontend Current Status](Frontend/Current%20Status.md) — check what is implemented and what still needs acceptance testing.
12. [Current Implementation Gaps](Current%20Implementation%20Gaps.md) — check the limits before describing a feature as complete.

[Glossary](Glossary.md) defines terms used throughout the guide. Linked file and table notes provide references for specific topics, including all 26 PHP files, 127 database columns, and the full frontend file inventory.

## Documentation checklist

For each topic, document its purpose, the information supplied by staff, the records saved or results returned, and current limits or unfinished work. Link technical claims to the relevant file or table note and include technical review.

For example: “The booking record connects the customer, event and chosen service. Its number lets the system find related payments and equipment records.”

## Where to look up details

- [File Inventory](Backend/File%20Inventory.md) and [API Reference](Backend/API%20Reference.md) — locate specific files and requests.
- [Schema and Seed Setup](Database/Schema%20and%20Seed%20Setup.md) — understand how the initial database is prepared.
- [Supporting Files and Evidence](Backend/Supporting%20Files%20and%20Evidence.md) — find existing verification and its limits.
- [Documentation Maintenance](Documentation%20Maintenance.md) and [Source Snapshot](Source%20Snapshot.md) — keep the explanations tied to the code they describe.

## Scope and authority

This guide describes the reviewed implementation, including its gaps. The official requirements and design in `Documentation/` describe intended scope; these notes do not change them. Previously recorded tests are evidence within their recorded environments, not proof that every feature is finished.

Frontend documentation is documented in `System Understanding/Frontend/` (Overview, Current Status, File Inventory). FR-10 service/date blockouts remain skipped. Code and database behavior are unchanged by this guide revision. Every filename and folder name is retained.

Related memory: [MEMORY](../MEMORY.md), [AKAD Project State Engine](../AKAD%20Project%20State%20Engine.md), [AKAD Requirements Analysis Changes](../AKAD%20Requirements%20Analysis%20Changes.md), [AKAD Requirements Analysis Ideas and Concepts](../AKAD%20Requirements%20Analysis%20Ideas%20and%20Concepts.md), [AKAD Requirements Analysis Approval](../AKAD%20Requirements%20Analysis%20Approval.md).

## Source files

- [Documentation/AKAD_Requirements_Analysis_Documentation.md](<../../Documentation/AKAD_Requirements_Analysis_Documentation.md>)
- [Documentation/AKAD_System_Design.md](<../../Documentation/AKAD_System_Design.md>)
- [Implementation/Offline-Sync-Verification-2026-09-28.md](<../../Implementation/Offline-Sync-Verification-2026-09-28.md>)

## Continue reading

[Next: System Overview](System%20Overview.md) · [Back to Start Here](Start%20Here.md)
