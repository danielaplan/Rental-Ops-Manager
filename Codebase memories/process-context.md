## Latest session — 2026-10-06: Authentication fixes and local dev setup

The user reported a Vercel deployment error: `"Failed to execute 'json' on 'Response': Unexpected end of JSON input"` on the admin login page. Root cause confirmed: Vercel is a static-only host and does not execute PHP; `api/auth.php` was returning an empty/HTML response, causing `response.json()` to throw. This is a deployment architecture mismatch — the PHP backend cannot run on Vercel. No backend or deployment change was made.

The user then shifted focus to making local login work correctly. A full audit of `js/admin.js` and `admin/login.html` identified six authentication issues, all authorized and fixed:

- **Issue 1 (login.html):** Visiting the login page auto-redirected to dashboard if any localStorage session existed, skipping the form entirely. Fixed: now calls `AdminAuth.verifyWithServer()` first; redirects only if PHP confirms the token.
- **Issue 2 (login.html):** Blank contact-number field silently fell back to `"admin"`. Fixed: fallback removed; explicit empty-check added.
- **Issue 3 (admin.js):** `isLoggedIn()` was purely localStorage-based — never called PHP. Fixed: new `async verifyWithServer()` method pings `GET /api/auth.php?do=me` with the Bearer token.
- **Issue 4 (admin.js):** `requireLogin()` used the same localStorage-only check on every admin page. Fixed: now `async`, `await`ed in `initAdminChrome`, and calls `verifyWithServer()` after the fast local check.
- **Issue 5 (admin.js):** `logout()` only cleared localStorage; the session row stayed alive in MySQL. Fixed: now `async`, calls `POST /api/auth.php?do=logout` before removing localStorage.
- **Issue 6 (admin.js):** `!s.expiresAt` short-circuit meant sessions without an `expiresAt` field were valid forever. Fixed: `expiresAt` is now required and must be in the future.

Files changed: `js/admin.js` (AdminAuth object rewritten; `requireLogin` and logout now async), `admin/login.html` (server-verification redirect, username fallback removed). No backend PHP was changed. README.md was rewritten with a 4-step local testing guide including exact PowerShell commands, copy-paste credentials, troubleshooting table, and quick test checklist. DB schema and seed were confirmed already imported. PHP dev server confirmed running at `127.0.0.1:8000` during the session. No files were staged, committed, or pushed.

FR-10 blockouts remain skipped. All prior session decisions remain in effect.

## Latest frontend work and evidence — 2026-10-02

The user requested a comparison of the afternoon GitHub commit `e5f3b1f` with the frontend handoff, then authorized focused testing and a fix for stale booking pagination. The tracked [frontend requirements review](../docs/collaboration-reports/AKAD_Frontend_Requirements_Review.md) is the detailed collaborator report. Its October 2 update records the commit review, developer work list, browser results, and remaining acceptance limits. The user owns overall acceptance; a later request authorized the assistant to run this focused smoke test.

The commit moved deposit and delivery controls into the Details tab, mounted booking pagination at `.table-wrap`, disabled Inactive during service creation, and escaped identified status/booking-ID output. Browser/PHP/MySQL checks passed for seeded owner login, page 2 and back with 63 isolated bookings, Details-tab visibility, one deposit/delivery save and reload, Active service create followed by Inactive edit and reload, and literal rendering of special characters in a service row. The test found that a no-match search kept stale pagination. A local one-line fix in `admin/bookings.html` removes `#bookingPagination` on empty results; a browser check with 12 bookings confirmed it disappears and returns when the search is cleared. The temporary test database and PHP server were removed.

The raw `<?php` / JSON parse error on another developer's laptop indicates PHP was not executing there; the local PHP endpoint and seeded login worked, but that other laptop was not tested. Non-JSON login feedback remains a frontend task. The generic CRUD create-default precedence and the booking Completed-status bypass remain owner/backend dependencies. Phone, keyboard, offline/failure, role, broader rendering, and performance acceptance remain open. FR-10 blockouts remain skipped. The scoped frontend fix was explicitly authorized by the user; the earlier September 28 frontend boundary was not blanket authorization for other features. No files were staged, committed, or pushed by the assistant.

## Latest session decision ? 2026-09-28: FR-10 remains skipped

The user ended the session and explicitly instructed that FR-10 internal blockouts remain skipped. This supersedes the earlier request to implement them and the subsequent backend-only scope. Do not begin blockout implementation until the user explicitly reauthorizes it. The user's frontend boundary also remains in effect: do not change frontend code without new authorization.

No FR-10 database migration, schema addition, backend endpoint, synchronization handler, or frontend change was made during the blockout discussion. Inspection confirmed that pi/blockouts.php is absent and the schema/sync endpoint contain no blockouts implementation. The existing Implementation/Fix.md is a deferred draft with known corrections required; it is not an active execution instruction. Previously completed offline/payment/inspection work and its recorded evidence remain in place. No files were staged, committed, or pushed.



## Latest implementation and evidence — 2026-09-28

The user authorized offline/synchronization implementation, verification, reporting, and Markdown/memory updates. This section supersedes earlier blanket “fully complete”, mock-auth, ~50% adapter, and “all offline runtime acceptance passed” statements.

- NFR-01: durable per-operation outbox, cached staff pages/assets, IndexedDB snapshots, automatic reconnect/startup/focus/15-second retry, transactional replay receipts, reference mapping, retained conflicts, and stale booking review implemented. Fourteen live PHP/MySQL integration checks passed. Actual Brave backend-outage workflow passed: five operations automatically committed once the test backend recovered, without duplicate records.
- FR-04/FR-06: admin-controlled owner/client negotiated amounts, no fixed or mandatory ₱1,000 minimum. Browser evidence: ₱250 down payment, ₱350 deposit, ₱50 deduction, ₱300 refund. Separate payment/deposit records.
- FR-09: saved returned quantity zero, Missing condition, and notes survive reload and sync; incomplete inspections cannot complete the booking.
- NFR-02: final return form checks passed at 375×812, 812×375, 1366×900 with labeled controls and no clipped return fields/document overflow. Physical smartphone acceptance is still pending.
- NFR-03: interaction/accessibility fixes delivered; real two-owner/one-staff usability acceptance remains pending.
- NFR-04: 10,000-booking synthetic load, three parallel readers: p95 bookings 999 ms, dashboard 194 ms, monthly report 207 ms. Local test environment only; production peak workload/threshold remains to be agreed and measured. No formal numeric threshold exists in the requirements.
- Full snapshots moved to IndexedDB after a browser localStorage quota failure during large-data checks. Bookings render 50 rows per page; calendar uses a date index. Full 10.4 MB periodic booking reads and unbounded sync receipt JSON remain documented scaling limits.
- Tests used only `akad_verify_20260928` and local ports 8017/8018. Verification did not alter production records. No staging/commit/push.
- FR-10 blockouts remain skipped pending a separate decision. Other frontend workflows are not automatically certified by these focused tests.

Offline setup requires an online authenticated session and cached app/data, HTTPS or localhost, and available browser storage. Thirty-second sync is evidenced for the tested small queues, not guaranteed for conflicts, expired authentication, background suspension, unreachable servers, or arbitrarily large queues.

Detailed authoritative implementation evidence: `Implementation/Offline-Sync-Verification-2026-09-28.md`. Raw results: `tests/offline-sync-results.json`, `tests/browser-outage-results.json`, `tests/performance-results.json`. Official requirements retain their priority and acceptance criteria.

## Historical notes (superseded where the latest section differs)

# Project Process Context

> **Purpose:** Establish the operating rules for all work, collaboration, and memory in the AKAD Rental-Ops-Manager code repository. This file defines the workflow so the work stays consistent, auditable, and scalable over time. It is the "tech lead" process document for the project.

---

## 1. Hierarchy of Authority (who decides what)

| Priority | Source | Git status | Role |
|---|---|---|---|
| **1st (Highest)** | `/Documentation/` | **Git-ignored** (private) | **Source of truth.** Final authority on all requirements, architecture, schema, UI behavior, and tests. Nothing else may override it. |
| **2nd** | `/.project-memory/` | **Git-ignored** (local cache) | **User decision cache.** Captures your real-time decisions, approvals, and clarifications. Used as a *cache* so the full codebase does not need to be re-read in every conversation. |
| **3rd** | Application source code (`event-rental/`, `db/`, `docs/`) | **Tracked** (committed by you) | Implementation result and evidence. Must match Documentation. The `docs/` folder contains assessment/review reports committed to the repo — they are **evidence, not source of truth.** |
| **4th** | Prior conversation history | Not in repo | Context only. Overrides nothing. |

**Key rule:** If a file in `/.project-memory/` conflicts with `/Documentation/`, the Documentation wins. Always.

---

## 2. User Role: Decision Author / Tech Lead

- You (the user) are the **decider.** When you give an instruction or make a call that changes architecture, scope, features, or process, it is **recorded in `/.project-memory/`.**
- You may change prior decisions. When you do, update `/.project-memory/` to reflect the new latest call.
- You may contradict prior documentation. If your decision conflicts with `/Documentation/`, a **conflict warning is triggered** (see Section 4) before any code changes proceed.

---

## 3. Project Memory: Your Living Cache

`/.project-memory/` contains plain Markdown files. Each file is one concern:

| File | Contents |
|---|---|
| `AKAD_Approval.md` | Scope decisions, authorization boundaries, and approved architecture choices. |
| `AKAD_Requirements_Changes.md` | Coverage table mapping every requirement (FR-01…FR-10, NFR-01…NFR-04, WONT-01) to its implementation status. |
| `AKAD_Ideas_and_Concepts.md` | Proposed implementation guidance and concepts (not implemented code). |
| `process-context.md` | (This file.) Defines the project operating procedure. |

**These files are git-ignored** (see `.gitignore`). They exist locally for you and the assistant only. They do **not** live in the repo's Git history and will **not** be committed to GitHub.

**When you speak, the next conversation loads this folder** as a cache so it understands your decisions without re-reading the full application. To keep the cache accurate and authoritative, this folder is checked and updated before each new body of work.

---

## 4. Conflict Warning Protocol

When you (the user) make a decision that conflicts with `/Documentation/`:

1. **Stop before implementing.** Do not write code that contradicts the documentation without flagging the conflict first.
2. **Warn explicitly:** state the conflict by quoting the relevant documentation section and the proposed user decision.
3. **Present choices clearly:**
   - Update the documentation to match the new decision (requires your explicit "update Documentation: yes"), or
   - Proceed with the decision but log it as an out-of-spec deviation in project memory.
4. **Wait for your go-ahead** before resolving the conflict into code.

---

## 5. Standard Workflow Order

### Step 0: Establish / refresh context
- Load `/.project-memory/` (this cache).
- Confirm `/Documentation/` is the source of truth.

### Step 1: Scope the task
- Identify which requirement (FR-XX / NFR-XX / WONT-01) the task maps to.
- Check `AKAD_Requirements_Changes.md` for current coverage status (Missing / Partial / Unverified / Scope conflict / Accepted).

### Step 2: Confirm it is authorized
- Check `AKAD_Approval.md` for any authorization boundary that would block the task.
- If the task is a new feature or a change to an approved requirement, confirm the new scope with you first.

### Step 3: Design against Documentation
- Reference the relevant `/Documentation/` files for the technical spec.
- If the spec is ambiguous or missing (e.g., FR-10 blockouts), **flag the gap and ask for a decision** before designing or coding.

### Step 4: Implement
- Write code only in the agreed structure (`db/`, `event-rental/`, etc.).
- Keep each change scoped to one requirement where possible.

### Step 5: Update the cache
- Update the relevant `/.project-memory/` file to reflect what was done (coverage status, decisions, concepts).
- If a decision changed, note the new latest decision and the date.

### Step 6: Review for Documentation drift
- After implementation, check whether the code matches `/Documentation/`. If not, either fix the code (preferred) or update `/Documentation/` with your explicit permission.

---

## 6. Working Rules (do / don't)

### Do
- Do consult `/Documentation/` before asserting a fact about requirements, schema, or architecture.
- Do record your decisions in `/.project-memory/` so future sessions pick up without explanation.
- Do flag any Documentation conflict before implementing.
- Do keep `db/schema.sql` aligned with the nine-entity ERD in `Documentation/AKAD_System_Design.md`.
- Do commit manually (the assistant never stages, commits, or pushes).

### Don't
- Don't let a memory file override `/Documentation/`.
- Don't implement a feature unless it maps to at least one requirement, or you have explicitly approved the new scope.
- Don't treat localStorage prototype behavior as "passing acceptance." Frontend mocks must not be marked as fulfilling NFR-01 offline sync without a real sync layer.
- Don't invent undocumented schema tables. If the ERD has nine tables, the database has nine tables unless you add a tenth.
- Don't change `/Documentation/` without your explicit approval.

---

## 7. Git & Version Control

- `/.project-memory/` is git-ignored.
- `/Documentation/` is git-ignored (private client documentation).
- Application source (`event-rental/`, `db/`) is tracked and eligible for manual commits by you.
- `docs/collaboration-reports/` is tracked and intended for collaborator review.
- The assistant **does not stage, commit, or push**. You control all Git operations.

---

## 8. On "Where are we?" Answers

When asked for project status, respond using these four sections:

1. **Current Requirements Gap** — based on `AKAD_Requirements_Changes.md` coverage table.
2. **Proposed Architecture** — based on `AKAD_Approval.md` and `/Documentation/`.
3. **Approval & Readiness Status** — whether work is authorized to begin.
4. **Recommended Next Action** — the single most valuable thing to do next.

---

## 9. Revision History (this process file)

| Date | Change |
|---|---|
| 2026-09-22 | Initial version. Established Documentation-as-source-of-truth, user-decision cache model, conflict warning protocol, and standard workflow order. |

---

*This file is ignored by Git. The user retains manual control of staging, commits, and pushes.*
