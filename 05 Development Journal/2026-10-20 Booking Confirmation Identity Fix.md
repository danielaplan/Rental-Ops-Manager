# Booking Confirmation Identity Fix

Date: October 20, 2026

## Change

- Updated both saved-booking availability checks to exclude the current booking with its accepted numeric `_server_id` while retaining the local ID for offline-aware updates.
- Normalized availability times in `js/api.js` so values already containing seconds do not become malformed values such as `10:00:00:00`.
- Added focused regression assertions for both booking-page callers and the shared time normalization.

## Verification

- `node --test tests/booking-flow-frontend-regressions.test.cjs tests/frontend-async-workflows.test.cjs`: 23 passed, 0 failed.
- `python tests/check_syntax.py`: passed.
- `git diff --check` on the changed source and test files: passed, with the existing LF-to-CRLF working-copy warning for the test file.
- Browser check on `http://127.0.0.1:8000` with local MySQL port 3306: Booking 1 changed from Pending to Confirmed and settled at `Online · 0 Pending Sync`.
- Direct database read: booking 1 status was Confirmed.

This is local synthetic evidence, not production, physical-device, or client acceptance. The remaining booking scenarios were not executed as part of this focused fix.
