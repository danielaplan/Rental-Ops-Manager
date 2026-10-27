# Final Hostinger Testing

Use this folder for the final acceptance test of the deployed Hostinger website. It is a controlled check of the live hosting environment, not another local QA run.

## Read first

1. Use only an authorized owner account. Never write a password, token, or real customer information in these files.
2. Run this plan **sequentially**. All scenarios use one deployed database and later scenarios reuse earlier records.
3. Before starting, confirm a backup exists and agree on a quiet test period so test bookings do not block real customer availability.
4. Create only records beginning with `HST FINAL`. These are synthetic final-test records.
5. Record the real visible Booking ID after every successful save. Refresh or reopen the record before marking a result PASS.
6. Do not change the server clock, database, PHP files, or production configuration while testing.
7. Do not delete failed records until the coordinator has accepted the evidence. Remove or cancel successful synthetic test records only after final sign-off and after confirming that no real booking is affected.

## Files

| File | Use it for |
| --- | --- |
| [Sample Data](Sample-Data.md) | Exact fictional customers, dates, amounts, and labels. |
| [Final Scenarios](Final-Scenarios.md) | The ordered final acceptance checks. |
| [Final Report](Report.md) | Record PASS, FAIL, BLOCKED, or NOT RUN immediately. |
| [Evidence](Evidence/README.md) | Store screenshots for every FAIL or BLOCKED result. |

## Result meanings

| Result | Meaning |
| --- | --- |
| **PASS** | Every expected result occurred after refresh/reopen. |
| **FAIL** | The system behaved incorrectly, lost/duplicated data, or screens disagree. |
| **BLOCKED** | Hosting, setup, access, or an earlier failure stopped the test. |
| **NOT RUN** | The scenario was deliberately not attempted. State why. |

## Production acceptance rule

Do not call the deployment complete until every required scenario passes, production backup/restore has been checked, the scheduler is active, HTTPS is confirmed, and the owner accepts the result. A passing browser screen alone is not proof that hosting, backups, offline behavior, or server jobs work.

