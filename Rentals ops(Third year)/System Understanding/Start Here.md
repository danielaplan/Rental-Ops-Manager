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

This guide explains the existing PHP backend and MySQL database for AKAD Sweet Party Rental Operations & Booking Management System. It is written for someone joining the project who needs to understand what each part does, where it lives, and how data moves.

> [!note] Scope and review date
> Reviewed on 2026-09-29 against source files. Frontend documentation is deferred until the frontend is finished. Browser files are mentioned only to explain the server boundary and offline protocol. This guide is a source-based explanation, not new runtime certification or approval of all backend behavior.

## Recommended reading order

1. [[System Understanding/System Overview]] — purpose, layers and vocabulary.
2. [[System Understanding/Backend/Backend Overview]] and [[System Understanding/Backend/Request Lifecycle]] — PHP entry points, shared helpers and HTTP/JSON.
3. [[System Understanding/Database/Database Overview]] and [[System Understanding/Database/Table Relationships]] — how records connect.
4. [[System Understanding/Workflows/Booking and Pricing]] — a concrete transaction from input to saved record.
5. [[System Understanding/Workflows/Payments and Deposits]], [[System Understanding/Workflows/Equipment Release and Return]] and [[System Understanding/Workflows/Offline Synchronization]].
6. [[System Understanding/Backend/API Reference]] — route catalog and accepted fields in the linked file notes.
7. [[System Understanding/Current Implementation Gaps]] — limits and differences to keep in mind when explaining the system.

## Reference indexes

- [[System Understanding/Backend/File Inventory]] — every PHP file, including helpers.
- [[System Understanding/Database/Database Overview]] — every table and its purpose.
- [[System Understanding/Database/Schema and Seed Setup]] — database creation, seed data and sessions.
- [[System Understanding/Backend/Supporting Files and Evidence]] — related SQL, tests and integration files.
- [[System Understanding/Workflows/Login and Authentication]] and [[System Understanding/Workflows/Reports]].
- [[System Understanding/Glossary]] and [[System Understanding/Documentation Maintenance]].

## Authority and evidence

Official requirements/design remain in the repository's `Documentation/` folder. These notes describe the current implementation and explicitly flag mismatches; they do not revise requirements. Existing project memory records decisions, including negotiable payments/deposits and the skipped FR-10 blockouts. Some older memory paragraphs are marked historical and contain superseded completion claims.

Related vault notes: [[MEMORY]], [[AKAD Project State Engine]], [[AKAD Requirements Analysis Changes]], [[AKAD Requirements Analysis Ideas and Concepts]], [[AKAD Requirements Analysis Approval]].

No frontend or backend behavior is changed by this documentation. FR-10 has no blockout table/endpoint and remains skipped.

## Source files

- [Documentation/AKAD_Requirements_Analysis_Documentation.md](<../../Documentation/AKAD_Requirements_Analysis_Documentation.md>)
- [Documentation/AKAD_System_Design.md](<../../Documentation/AKAD_System_Design.md>)
- [Implementation/Offline-Sync-Verification-2026-09-28.md](<../../Implementation/Offline-Sync-Verification-2026-09-28.md>)
