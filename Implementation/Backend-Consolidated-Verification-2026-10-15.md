# Consolidated backend verification — 2026-10-15

## Awaiting Payment completion run — 2026-10-16

Implemented the owner-approved two-stage completion policy across the authoritative release service, retained booking/checklist rules, owner notifications, reports, admin UI and offline replay. A completed return review releases service availability into `Awaiting Payment` when rental money remains due. The booking stays incomplete and cannot be completed until completed payments cover the agreed total; a later owner action performs the audited `Completed` transition and resolves the notice.

Focused booking, finance, offline and frontend suites passed. The complete non-migration acceptance runner then passed on fresh synthetic database `akad_verify_plan_1792150757195_24148`: all 9 backend/sync files, 17/17 offline checks, 36/36 frontend tests, PHP/JavaScript/service-worker/admin-inline syntax, and `git diff --check`. Evidence and final source hashes: [summary](../tests/acceptance-results/1792150756830-33488/summary.json).

This run did not execute or apply a migration, access an operational database, exercise deferred internal blockouts, test production hosting/performance, or establish physical-device/client deployment acceptance. The user later confirmed that all 51 worksheet findings came from disposable sample data, so they are not historical-business blockers and require no owner evidence for the clean deployment path.

## Current-code source audit and rerun — 2026-10-16

Scanned the current B1–B6 implementation from schema through API/shared services, sync replay, scheduler and tests. Found and fixed one customer CRUD/schema mismatch: the writable definition included `notes`, which does not exist in the clean `customers` table. The unsupported field was removed and a focused regression was added.

The earlier complete non-migration acceptance runner passed on fresh synthetic database `akad_verify_plan_1792128884100_5244`. The 2026-10-16 Awaiting Payment run above is the latest evidence for the current code state. No migration, operational database access, deferred blockout execution, production hosting test or physical-device acceptance occurred.

## Walkthrough follow-up — 2026-10-16

With explicit delegated-review authorization, owner-walkthrough W11/W12 were executed against `akad_verify_plan_1792046564392_28220`. Offline creation/reload/reconnect produced exactly one booking and one completed payment, visible to the second authenticated owner. The stale two-client edit was retained as a conflict. That run exposed a missing event-location field in the recovery form; `js/sync-ui.js` now shows the previous/server/local location and sends the reviewed location on retry. A focused regression was added. All four frontend files passed with 35 tests, syntax checks passed, and the repaired flow completed in the browser with zero pending sync. See the [walkthrough and evidence](Backend-Owner-Walkthrough-2026-10-15.md).

The nine backend/sync suites below were not rerun for that frontend-only follow-up. Their 2026-10-15 evidence was superseded by the Awaiting Payment completion run above. On 2026-10-16, the user confirmed owner approval of all implemented/tested changes and selected the Awaiting Payment policy. Historical migration, deployment and production acceptance remain open.

## Result

The earlier consolidated pass verified all nine backend/sync files, 34 frontend automated regressions, syntax checks and the diff check on an isolated synthetic database. The Awaiting Payment completion run above is the latest current-code evidence. Both establish local regression evidence only, not historical-data correctness, migration completion or production readiness.

Run: 2026-10-15 14:39:42–14:40:52 Asia/Manila. The test database was `akad_verify_plan_1792046383527_34548`. Two owned PHP processes used loopback ports 53027/53039 and were stopped by the runner. The synthetic database is retained for inspection. No existing operational PHP server was reused and no operational database was accessed.

## Changes made for safe verification

- Added `tests/run_backend_acceptance.cjs`: a fixed runtime-suite list, separate timestamped logs/results, a final status summary and SHA-256 source manifest. It invokes no migration scripts and compares source hashes before/after execution.
- Added an explicit exclusion switch for the historical blockout subsection of the revised-backend test. The consolidated runner sets it; deferred blockout endpoints were not exercised or activated.
- Allowed the offline suite to write its results to a supplied path. Existing `tests/offline-sync-results.json` and older logs/results were not overwritten by this run.
- Prepared an independent synthetic owner walkthrough database and evidence checklist. Owner approval of the implemented/tested changes was recorded later on 2026-10-16; the fixtures do not resolve historical findings.

## Results by suite

| File / check | Result | Evidence scope |
| --- | --- | --- |
| `backend-revised-requirements.test.cjs` | PASS | Public/protected API boundaries, immutable audit/notifications/history, payment derivation, deduction/refund race, concurrent confirmations, account administration and reporting. Legacy blockout subsection explicitly excluded. |
| `catalog-plan-gaps.test.cjs` | PASS — 1 named test | Defaults, snapshots, eligibility, booking validation and retained cancellation. |
| `booking-plan-gaps.test.cjs` | PASS — 2 named tests | Scheduler refuses an implicit database before connecting; explicit synthetic reconciliation/release is atomic and idempotent. |
| `finance-plan-gaps.test.cjs` | PASS | Payment/deposit validation, payment-date revenue, compatibility fields and report details/definitions. |
| `auth-plan-gaps.test.cjs` | PASS | Multi-device revocation, expiry, lockout/reset races, permissions; CGI HTTPS/origin bootstrap checks without a database connection. |
| `sync-plan-gaps.test.cjs` | PASS — 1 named test | Direct/sync business-rule parity, conflicts, retained history and receipts. |
| `write-validation-gaps.test.cjs` | PASS — 2 named tests | Malformed deductions and booking links, rollback, corrected retry and receipt replay. |
| `history-template-gaps.test.cjs` | PASS — 2 named tests | Linked-item retention, safe unused-item deletion, template validation and rollback. |
| `offline-sync.test.cjs` | PASS — 17 integration checks | Live PHP/database with independent in-memory browser-storage clients, reload/reconnect, lost responses, stale drafts, ownership, concurrency, checklists and return review. |
| Four frontend test files | PASS — 34 tests | Public data, API contract/direct facade and async UI workflow regressions using harnesses. These are not physical-browser/device acceptance. |
| `check_syntax.py` | PASS | API PHP, JS, service worker, test `.cjs` files and admin inline scripts. |
| `git diff --check` | PASS | No whitespace errors. Git emitted informational LF/CRLF conversion warnings. |

Final failures: 0. Named-test skips: 0. The three assertion scripts report script success rather than individual assertion counts; do not sum them into an invented total. The deferred blockout section is an explicit scope exclusion, not a passing test.

## Reproduce and inspect

From the repository root:

```powershell
rtk proxy node tests/run_backend_acceptance.cjs
```

The runner imports clean schema/seed into a newly named synthetic database. It does not execute a migration. It preserves existing servers and creates its own free-port servers, which it stops afterward. Each run saves a new evidence directory.

This run's evidence:

- [Summary, exact commands, results and 97-file SHA-256 manifest](../tests/acceptance-results/1792046382055-36320/summary.json)
- [Backend log](../tests/acceptance-results/1792046382055-36320/backend.log)
- [Frontend log](../tests/acceptance-results/1792046382055-36320/frontend.log)
- [17 offline results](../tests/acceptance-results/1792046382055-36320/offline-results.json)
- [Syntax log](../tests/acceptance-results/1792046382055-36320/syntax.log)
- [Diff check](../tests/acceptance-results/1792046382055-36320/diff-check.log)

The manifest confirms the scoped source files were unchanged during the run. Documentation additions after the run do not change application behavior. Runtime: Windows, Node v24.11.1, PHP 8.2.12, Python 3.13.3; installed database client reports MariaDB 10.4.32. The client version is not an independently queried server-version assertion.

## Deliberate exclusions and remaining gates

| Exclusion / remaining work | Reason / next action |
| --- | --- |
| Migration regression, apply, and dry run | Prohibited for this task, including synthetic migration execution. Earlier migration evidence is historical only. |
| Operational database reads/writes | Not authorized. No operational verification was performed. |
| Legacy internal availability blockouts | Deferred scope. Existing code/schema retained without activation or extension. |
| Legacy setup/control/performance scripts | Reuse fixed databases/ports and are not applicable to this isolated runtime run. No historical result JSON was treated as fresh evidence. |
| Browser outage/layout pages and result validators | Manual browser fixtures/artifacts, not current automated acceptance. Use the prepared walkthrough and record actual device observations. |
| Real hosting, TLS termination, scheduler registration, load and recovery | Separate deployment acceptance. CGI bootstrap and two local PHP processes do not establish production behavior. |
| Historical resolution | **Not applicable:** all worksheet rows are sample/test data and will not be migrated into the clean deployment. |
| Owner workflow/policy acceptance | The owner approved the implemented/tested changes and selected the Awaiting Payment policy on 2026-10-16. The policy is implemented and exercised by direct/offline synthetic tests; deployment acceptance remains separate. |

Roadmap step 1's consolidated automated verification is recorded as passed for this code state. Step 2's implemented workflows, including Awaiting Payment, are owner-approved and locally verified. No migration, device/deployment or production-completion gate has been closed.
