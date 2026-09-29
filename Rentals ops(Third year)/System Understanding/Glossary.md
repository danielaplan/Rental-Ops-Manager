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

## Core terms

| Word | Plain meaning | Example |
|---|---|---|
| System | The connected pages, server rules and saved records used to manage rentals | Record and track Ana’s rental |
| Frontend | The pages and controls people see | A staff form |
| Backend | Instructions running on the server behind the pages | Check a booking and calculate its price |
| Server | The computer/service answering application requests | Accept a submitted booking |
| Database | Organized shared storage | Saved customers and bookings |
| Table | A collection of one kind of saved information | PAYMENTS holds rental payment records |
| Row / record | One entry in a table | Ana’s individual payment |
| Column / field | One detail in a record | The payment amount |
| ID / reference number | A value identifying a record or linking to it | A payment points to its booking number |
| Request / response | A message asking for an action and the reply | Ask to save a deposit; receive its saved result |
| API | The agreed way application code asks the backend for information or actions | Submit booking details in an expected format |
| PHP | The language used for this backend’s instructions | bookings.php handles booking requests |
| SQL / MySQL | SQL asks for database actions; MySQL manages the storage | Read payments belonging to a booking |
| Workflow | The connected steps for one task | Create booking, record payment, inspect returns |
| Login session | Temporary permission associated with a signed-in account | Staff can make protected requests |
| Pending Sync | Stored on the device, awaiting acceptance into shared records | A supported offline draft |
| Acknowledgement | The server’s confirmation that an action succeeded | Remove an accepted action from the waiting list |

## Technical terms

These terms describe record structure and processing. A primary key is a record’s identifying value; a foreign key links a reference to another record. A transaction saves or cancels related changes together. An upsert saves a new record or updates matching saved information.

## Technical details

This section records exact file behavior, field names and implementation details.

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
