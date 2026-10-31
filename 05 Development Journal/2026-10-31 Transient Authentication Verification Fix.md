# 2026-10-31 — Transient Authentication Verification Fix

## Problem

Production browser checks showed that opening data-heavy admin pages could unexpectedly return the owner to the login screen. The shared admin guard cleared the cached session for every non-success response from `GET api/auth.php?do=me`, including temporary server errors.

## Change

- Updated `js/admin.js` so only the auth endpoint's explicit `401 Unauthorized` response clears the cached session.
- Temporary server errors continue with the existing, unexpired cached session, matching the established offline fallback.
- Added focused regression tests for unauthorized and server-error responses.
- Updated the login workflow guide to describe the behavior.

## Verification

- `node --check js/admin.js` — passed.
- `node --test tests/frontend-async-workflows.test.cjs` — 24 passed, 0 failed, including the new 401 and 500 response cases.
- Production deployment and browser retesting were not performed as part of this change.
