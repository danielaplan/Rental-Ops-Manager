# Owner Login Credential Compatibility — 2026-10-30

## Change

- Updated the admin login field to accept either an owner username or contact number.
- Added a neutral `credential` login request that checks both fields while preserving the existing `username`, `contact_number`, and `contact` API request forms.
- Kept ambiguous matches rejected so one credential cannot authenticate the wrong owner.
- Updated the login workflow and local setup instructions.

## Reason

The owner-creation form requires a username but allows an empty contact number. The login screen previously sent only a contact number, so a newly created owner could exist in `USERS` without being able to sign in with the required username.

## Verification

- `node --test tests/frontend-async-workflows.test.cjs`: 22 passed, including the neutral credential request.
- Isolated authentication acceptance: passed username/contact credential matching, ambiguous-match rejection, legacy request compatibility, multi-device revocation, expiry, lockout/reset races, and primary-owner permissions.
- `node tests/check_syntax.cjs`: passed PHP, JavaScript, service-worker, test-script, and admin inline-script syntax checks.
- `git diff --check`: passed after the final source, test, and documentation updates.
- Full `node tests/run_backend_acceptance.cjs`: authentication and all 70 frontend checks passed, but the overall runner exited 1 because unrelated `fixed-bug-scenarios` scenario 5 expected an older Dashboard source expression (`stats.balances?.outstanding_balances`) that is not present in the current Dashboard source.

## Evidence boundary

This is a source and synthetic/local verification change. It does not modify or verify production accounts, production data, a physical device, or client acceptance.
