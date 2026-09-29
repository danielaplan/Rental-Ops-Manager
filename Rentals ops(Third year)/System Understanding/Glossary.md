---
title: "Glossary"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Glossary

| Term | Meaning in this system |
|---|---|
| Backend | PHP code receiving requests, enforcing rules and querying MySQL |
| Endpoint | PHP file exposed through HTTP, with do selecting an action |
| API | Request/response contract used by application code |
| PDO | PHP database interface used for the MySQL connection and prepared SQL |
| Prepared statement | SQL with separately bound values rather than inserted user text |
| JSON | Structured data format used for requests/responses and some SQL columns |
| Primary key (PK) | Unique row identifier |
| Foreign key (FK) | Database constraint referencing a parent record |
| AUTO_INCREMENT | MySQL assigns successive row IDs |
| Index | Lookup aid used by database queries; unique indexes also prevent duplicate key values |
| Nullable | Column can store NULL (absence), distinct from zero/empty string |
| Transaction | Group of changes committed together or rolled back |
| FOR UPDATE | Row lock held during a transaction to coordinate concurrent writes |
| Cascade / restrict / set null | Delete/update relationship rules: propagate, block, or remove the reference |
| Upsert | Insert a record or update it when a unique key already exists |
| Bearer token | Login credential sent with a request in Authorization |
| Session | Token associated with a user and expiration in SESSIONS |
| Role | owner or staff permission group |
| Outbox | Device operations waiting for server acknowledgement |
| LOCAL- ID | Temporary device identifier before MySQL supplies a real ID |
| Receipt | Server's saved acknowledgement/hash used to avoid replaying a committed operation |
| Idempotent replay | Retrying the same acknowledged operation does not perform the business write twice |
| Stale conflict | A draft was based on older server values and needs review |
| Slot conflict | Blocking karaoke event intervals overlap |
| Rental payment | Money applied toward rental total, stored in PAYMENTS |
| Refundable deposit | Separate held money with potential deductions, stored in DEPOSITS |
| Snapshot | Cached copy of shared records on the device |
| Source of truth | Official requirements/design control intended scope; current code demonstrates implementation |
| FR / NFR | Functional requirement / non-functional quality or constraint |

Return to [[System Understanding/Start Here|Start Here]].
