---
title: "Glossary"
date: 2026-10-08
tags:
  - akad
  - system-understanding
  - glossary
status: documented
---

# Glossary

This glossary defines terms used throughout the System Understanding guide. It helps both human readers and AI assistants maintain consistent terminology when referencing system components.

## Terminology

| Term | Definition | Context |
|------|------------|---------|
| **Frontend** | The staff/admin HTML/JS/Bootstrap interface that people interact with. Runs in the browser. Communicates with the backend via the API contract layer. | System Overview, Frontend Overview |
| **Backend** | The PHP API layer that processes requests, enforces business rules, and communicates with MySQL. Consists of 26 PHP files in `api/`. | System Overview, Backend Overview |
| **Database** | The MySQL relational store for all system data: bookings, payments, deposits, equipment, delivery, customers, services, packages, users, sessions. | System Overview, Database Overview |
| **API Contract Layer** | `js/api.js` — the promise-based frontend-to-backend mapping. Contains ~80 methods (`getCategories`, `createBooking`, `finalizeReturn`, etc.) that normalize field names, handle ID prefixing (`SVC-`, `ADD-`, etc.), and parse responses. This is the single source of truth for how the frontend talks to the backend. | Frontend/Current Status, Frontend/File Inventory |
| **Offline-First** | Design pattern where changes made without server connectivity are queued locally (IndexedDB/localStorage) and automatically synced when online. The system uses IndexedDB via the `er_sync_queue` storage key. | Frontend/Current Status, Workflows/Offline Synchronization |
| **Bearer Token** | Authentication token obtained from `api/auth.php` after login. Stored in localStorage under `er_admin_session`. Included in every API request via `Authorization: Bearer <token>` header. | Frontend/Current Status, Login & Authentication |
| **Current Implementation Gaps** | Known limitations and unfinished implementation details documented in `Current Implementation Gaps.md`. These are explained as differences between intended behavior and current source, not as new test failures. | Current Implementation Gaps.md |
| **Acceptance Testing** | Manual browser-based validation performed by the project owner. The frontend developer supplies implementation + expected results; the owner executes the tests and records results. This is the final verification step before a feature is considered complete. | Frontend/Current Status.md |
| **FR-10 Blockouts** | Internally mark a service/date as unavailable. Explicitly skipped per user decision (2026-09-28). No schema, endpoint, or frontend was implemented. | Throughout vault, FR-10 references |
| **Frontend Current Status** | A structured status table documenting what frontend features are complete, what backend dependencies were fixed, and what manual owner acceptance tests remain. Created 2026-10-08 as part of the vault enhancement. | Frontend/Current Status.md |
| **js/api.js** | The contract layer — maps UI actions to PHP endpoints. ~80 methods covering all PHP endpoints. Handles auth tokens, field mapping, ID prefixing, response normalization. | Frontend/Overview.md, Frontend/File Inventory.md |
| **Payload/Normalize** | Functions in `js/api.js` that convert between UI keys and server keys. `payload(entity, input)` converts UI → server keys. `normalize(entity, value)` converts server → UI keys. ID prefixing uses `SVC-`, `ADD-`, `CUS-`, `PAY-`, `PKG-`, `BI-`, `RI-`, `HIST-`, `REL-`. | Frontend/File Inventory.md |

## File Naming Conventions

| Pattern | Example | Meaning |
|---------|---------|---------|
| `Start Here.md` | Entry point for the guide | Always present, top-level navigation |
| `System Overview.md` | High-level purpose and architecture | One per guide section |
| `Current Status.md` | Implementation status as of a date | Dated (2026-10-08), shows ✅/🔄/⏸️ status |
| `File Inventory.md` | Lists key files and their responsibilities | Mirrors the backend structure for consistency |
| `Backend/Files/*.md` | Individual PHP file documentation | One per PHP API endpoint |
| `Database/Tables/*.md` | Table structure and field documentation | Mirrors the SQL schema |
| `Workflows/*.md` | How several parts work together | 7 workflows: Login, Booking, Payments, etc. |
| `Current Implementation Gaps.md` | Known limitations | Structured table of gaps with source references |
| `Frontend/Overview.md` | Frontend purpose and connectivity | NEW 2026-10-08 |
| `Frontend/Current Status.md` | Frontend feature status | NEW 2026-10-08 |
| `Frontend/File Inventory.md` | Frontend key files reference | NEW 2026-10-08 |

## Linking Conventions

| Link Type | Format | Example |
|-----------|--------|---------|
| **Same-note heading** | `[#Heading in same note]` | `[#Implementation Gaps](#current-implementation-gaps)` |
| **Same-note block** | `[#block-id]` | `[#key-points](#key-points)` |
| **Cross-note** | `[Display Text](../relative/path/file.md)` | `[Frontend Overview](../Frontend/Overview.md)` |
| **Same-vault** | `[Note Name](../../Start%20Here.md)` | `[System Overview](../../System%20Overview.md)` |
| **External docs** | `[Note Name](../../../../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md)` | Referencing the official requirements review |

## Status Indicators

Used consistently across all status tables:

| Symbol | Meaning |
|--------|---------|
| ✅ | **Complete** — implemented and verified |
| 🔄 | **In Progress** — work ongoing, owner acceptance testing pending |
| ⏸️ | **Skipped** — explicitly deferred per user decision |
| ❓ | **Unknown** — not yet assessed |

## How to Use This Glossary

1. **When writing a new note**: Add any new terms to this glossary
2. **When linking concepts**: Use the defined linking conventions
3. **When documenting status**: Use the status indicator symbols
4. **When naming files**: Follow the file naming conventions
5. **When an AI reads this**: It will recognize the patterns and understand the structure

---

*This glossary is maintained as part of the System Understanding guide. Add new terms as they are introduced in new notes or workflow documentation.*