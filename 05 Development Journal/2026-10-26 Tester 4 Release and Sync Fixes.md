# Tester 4 Release and Sync Fixes — 2026-10-26

## What changed

- Added outgoing quantity and condition controls to every Checklist & Release row. A release can proceed only when each checked row has its exact expected quantity and an outgoing condition.
- Made the release handler save those values with the checklist row before recording the single release, and re-save all displayed rows in order at final confirmation so rapid multi-row edits cannot race background saves. Release history now includes a booking-scoped `Released` entry for every checklist row, including a template row without a catalog inventory link.
- Rejected short returns unless they are marked `Missing` and have item notes. Final post-event review repeats the condition safeguard.
- Made an offline booking creation that overlaps a confirmed booking return an actionable sync conflict even when the draft itself is Pending. Direct online Pending booking behavior is unchanged.
- Confirmed the notification deep-link implementation already opens the requested booking and tab in the current source; no additional change was required for that older Tester 4 report item.

## Verification performed

- `node --test tests/booking-flow-frontend-regressions.test.cjs tests/frontend-async-workflows.test.cjs` — 23 passed.
- The isolated `sync-plan-gaps.test.cjs` portion of `node tests/run_backend_acceptance.cjs` passed, including the new Pending-overlap conflict assertion. Other database-backed suites that ran before the offline suite also passed.
- `python tests/check_syntax.py` (using the bundled Python runtime with UTF-8 enabled) — passed.
- `git diff --check` — passed.
- Live isolated-browser retest: a complete four-row release created 1 release record, 4 item-history records, and 0 incomplete checklist rows. A short return marked `Good` was rejected with the Missing-and-notes error.
- Tester 4's report was updated to 13 PASS / 0 FAIL; the five obsolete failure screenshots were removed.
- The full acceptance runner did not complete because its existing `offline-sync.test.cjs` VM lacks `TextEncoder`; this is a test-harness environment issue outside the changed release/conflict paths.

## Boundaries

- Verification is synthetic/local only; the live browser checks used an isolated local QA database.
- No migration, operational database mutation, commit, or push was performed.
