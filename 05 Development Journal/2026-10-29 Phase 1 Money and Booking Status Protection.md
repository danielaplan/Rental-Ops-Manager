# Phase 1 Money and Booking Status Protection

Date: 2026-10-29

## What changed

- Replaced browser/offline floating-point payment balance comparisons with integer-cent calculations.
- Applied the same two-decimal validation to queued payments, held deposits, and itemized deductions before local storage or outbox creation.
- Kept the server as the final authority: direct payment/deposit endpoints and `api/sync.php` replay continue through the shared strict money parser and payment/deposit services.
- Added regression cases for exact fractional remaining payments, excessive precision, overpayments, and invalid queued money.

## What was achieved

- An exact final payment is evaluated in cents and can reach `Fully Paid` without a JavaScript rounding mismatch.
- Amounts such as `10.001` fail before entering the offline queue and fail again on the server if submitted directly or by a malformed client.
- Completed payments above the remaining booking balance remain rejected; no customer-credit/refund-due behavior was added.

## Verification performed

- `rtk node --test tests/payment-helper.test.cjs tests/frontend-api-contract.test.cjs` — 17/17 passed (local synthetic JavaScript/contract evidence).
- `rtk node tests/check_syntax.cjs` — PHP, JavaScript, service worker, test scripts, and admin inline scripts passed.
- `rtk proxy node tests/run_backend_acceptance.cjs` — attempted, but the isolated database-backed portion could not start because local MySQL refused the connection with `ERROR 2002` / Windows socket error `10013`. The runner's database-independent frontend checks passed, but this is not a backend acceptance pass.

## Not done / blocker

- The new direct endpoint and sync-replay database assertions were not executed because local MySQL was unavailable. Rerun the isolated acceptance command after MySQL is started; do not point it at a normal development or production database.
- No browser UI, physical device, production environment, client acceptance, deployment, migration, commit, or push was performed.

## Zero-deposit lock correction

- New deposit records now require a positive negotiated amount; there is still no fixed peso minimum.
- A legacy zero deposit may be corrected only when it is still `Held`, has no refund date, and has no itemized or aggregate deductions.
- That repair writes an audit event. Once positive money is recorded, the held amount remains immutable.
- The booking UI exposes “Correct zero deposit” only for that narrow safe state. Offline writes enforce the same rule before queuing, and sync replay uses the shared server service.
- Added frontend simulation/contract coverage for zero rejection and nonzero immutability. The combined payment, API-contract, and booking-flow run passed 24/24; syntax checks also passed.
- Added isolated database assertions for direct zero repair, later overwrite rejection, and sync replay repair. Execution remains blocked because local MySQL refused the connection with `ERROR 2002` / Windows socket error `10013`.
