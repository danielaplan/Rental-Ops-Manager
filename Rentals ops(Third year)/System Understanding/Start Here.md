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

## Purpose of this guide

This guide introduces the system’s backend and database, starting with an overview and progressing to technical details.

It explains each part’s purpose, the information it handles, and its connections to the rest of the system.

## How to read each note

Each note begins with an overview and example. The **Technical details** section provides exact field names, code behavior and storage rules.

File notes explain server instructions. Table notes explain saved information. Workflow notes explain how several parts work together. A filename is a location in the project, not a screen the user operates.

## Recommended reading order

1. [[System Understanding/System Overview]] — understand the purpose and follow the example customer, Ana.
2. [[System Understanding/Backend/Backend Overview]] and [[System Understanding/Backend/Request Lifecycle]] — trace what happens behind an action.
3. [[System Understanding/Database/Database Overview]] and [[System Understanding/Database/Table Relationships]] — follow the connections between saved records.
4. [[System Understanding/Workflows/Login and Authentication]] — understand staff access.
5. [[System Understanding/Workflows/Booking and Pricing]] — follow a rental from details to calculated price.
6. [[System Understanding/Workflows/Payments and Deposits]] — separate rental money from held refundable money.
7. [[System Understanding/Workflows/Equipment Release and Return]] — follow the assigned items and return inspection.
8. [[System Understanding/Workflows/Offline Synchronization]] — trace how a local draft becomes a shared record.
9. [[System Understanding/Workflows/Reports]] — understand what the summaries count.
10. [[System Understanding/Current Implementation Gaps]] — check the limits before describing a feature as complete.

[[System Understanding/Glossary]] defines terms used throughout the guide. Linked file and table notes provide references for specific topics, including all 26 PHP files and 127 database columns.

## Documentation checklist

For each topic, document its purpose, the information supplied by staff, the records saved or results returned, and current limits or unfinished work. Link technical claims to the relevant file or table note and include technical review.

For example: “The booking record connects the customer, event and chosen service. Its number lets the system find related payments and equipment records.”

## Where to look up details

- [[System Understanding/Backend/File Inventory]] and [[System Understanding/Backend/API Reference]] — locate specific files and requests.
- [[System Understanding/Database/Schema and Seed Setup]] — understand how the initial database is prepared.
- [[System Understanding/Backend/Supporting Files and Evidence]] — find existing verification and its limits.
- [[System Understanding/Documentation Maintenance]] and [[System Understanding/Source Snapshot]] — keep the explanations tied to the code they describe.

## Scope and authority

This guide describes the reviewed implementation, including its gaps. The official requirements and design in `Documentation/` describe intended scope; these notes do not change them. Previously recorded tests are evidence within their recorded environments, not proof that every feature is finished.

Frontend documentation is deferred. FR-10 service/date blockouts remain skipped. Code and database behavior are unchanged by this guide revision. Every filename and folder name is retained.

Related memory: [[MEMORY]], [[AKAD Project State Engine]], [[AKAD Requirements Analysis Changes]], [[AKAD Requirements Analysis Ideas and Concepts]], [[AKAD Requirements Analysis Approval]].

## Source files

- [Documentation/AKAD_Requirements_Analysis_Documentation.md](<../../Documentation/AKAD_Requirements_Analysis_Documentation.md>)
- [Documentation/AKAD_System_Design.md](<../../Documentation/AKAD_System_Design.md>)
- [Implementation/Offline-Sync-Verification-2026-09-28.md](<../../Implementation/Offline-Sync-Verification-2026-09-28.md>)
