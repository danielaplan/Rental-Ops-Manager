---
title: "2026-10-18 — AI Workflow and Deployment Readiness"
date: 2026-10-18
tags:
  - akad
  - journal
  - ai-workflow
  - deployment
status: verified-local
---

# AI Workflow and Deployment Readiness

## What changed

The repository now gives OpenAI Codex, Claude Code, and GitHub Copilot the same progressive discovery workflow through `PROJECT_INDEX.md` and the unified Obsidian Second Brain. The deployment handbook also has a seven-part client/domain checklist covering hosting, a clean database, production owners, environment settings, domain protection, scheduled reconciliation, backups, device testing, and client acceptance.

No rental application PHP, JavaScript, HTML, CSS, SQL, or test logic changed during this documentation work.

## How the shared AI workflow works

Each assistant starts with its repository instructions, uses `PROJECT_INDEX.md` to locate the smallest relevant documentation and source set, verifies behavior in current code, runs relevant tests, and updates only documentation affected by meaningful application changes. Approval records remain authoritative for business scope; the index remains navigation rather than implementation proof.

## Deployment decision and limits

The current deployment path is a clean production database initialized from `db/schema.sql`. The legacy migration and `db/seed.sql` sample data are not part of that path. Production still requires real owner accounts, HTTPS and allowed-origin configuration, protected internal files, a scheduler, backup/restore proof, physical-device/offline checks, report reconciliation, and client acceptance.

Legacy internal availability blockouts remain deferred. Offline synchronization remains required.

## Evidence and verification

- Code base: Git commit `b430ca7b5299eb7db57c663f8b3501e7c388da7f` plus documentation changes described here.
- Fresh command: `node tests/run_backend_acceptance.cjs` after local XAMPP MySQL was started.
- Backend/sync: nine test files passed.
- Offline: 17 integration checks passed.
- Frontend: 37 tests passed with no failures or skips.
- Syntax and `git diff --check`: passed.
- Synthetic database: `akad_verify_plan_1792257592586_23952`.
- Evidence: `tests/acceptance-results/1792257592167-5292/`.
- Source hashes: unchanged during the acceptance run.

The first attempt, recorded in `tests/acceptance-results/1792257355533-11996/`, stopped before backend assertions because MySQL was off. It is environment-failure evidence, not an application-test failure. The successful rerun above supersedes it for runtime status.

## Remaining checks

- Configure and verify the actual hosting account, domain, DNS, TLS, database credentials, allowed origins, writable uploads, and scheduler.
- Create production-safe owner accounts without importing sample credentials or records.
- Verify backup and restore on the target environment.
- Complete physical-phone, additional-browser, offline/reconnect, production-performance, and owner/client acceptance checks.
- Do not claim production readiness until those gates are complete.

## Related documentation

- [Project Index](<../PROJECT_INDEX.md>)
- [Deployment and Limitations](<../Understand the System/System Understanding/Deployment and Limitations.md>)
- [Current Implementation Gaps](<../Understand the System/System Understanding/Current Implementation Gaps.md>)
- [Backend Requirement Matrix](<../Implementation/Backend-Requirement-Matrix.md>)
- [Second Brain Home](<../00 Second Brain Home/Home.md>)
