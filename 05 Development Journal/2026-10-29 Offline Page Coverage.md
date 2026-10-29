---
title: "Offline Page Coverage"
date: 2026-10-29
---

# Offline Page Coverage

## Change

Added Audit History, Owner Accounts, and Packages to the service-worker app-shell cache. The cache version changed so installed browsers replace the incomplete shell. The sync panel now states precisely that pages are cached while fresh server data is not downloaded, and that supported local work requires an existing session and saved data.

## Verification

- Focused simulation verifies every current `admin/*.html` file appears in the app-shell cache and the readiness wording includes the saved-data boundary.
- `node --test tests/frontend-async-workflows.test.cjs`, `node tests/check_syntax.cjs`, and `git diff --check` were run after the change.

## Scope

No API, booking-modal, or data-sync business rules changed. Existing unrelated worktree changes were preserved.
