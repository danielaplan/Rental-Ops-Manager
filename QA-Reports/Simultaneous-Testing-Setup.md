# Simultaneous Testing Overview

This page is the coordinator's overview. Each tester has a complete, tester-specific setup and testing guide in their own folder.

## Tester assignments

| Tester | Database | Git branch | Complete step-by-step guide |
| --- | --- | --- | --- |
| Tester 1 | `akad_rentals_qa_t1` | `qa/tester-1` | [Tester 1 setup](Tester-1/Setup.md) |
| Tester 2 | `akad_rentals_qa_t2` | `qa/tester-2` | [Tester 2 setup](Tester-2/Setup.md) |
| Tester 3 | `akad_rentals_qa_t3` | `qa/tester-3` | [Tester 3 setup](Tester-3/Setup.md) |
| Tester 4 | `akad_rentals_qa_t4` | `qa/tester-4` | [Tester 4 setup](Tester-4/Setup.md) |

All testers start from the same coordinator-selected Git commit and the same `db/schema.sql` and `db/seed.sql`. Each tester creates a separate local QA database. Their package, add-on, inventory, checklist, and gallery baseline is the same, but their customers, bookings, payments, and other test transactions remain separate.

## Coordinator steps

1. Make sure the approved QA documentation, database seed, and gallery images are committed and pushed.
2. Select one starting Git commit and send its commit ID to all four testers.
3. Tell each tester to follow only the `Setup.md` in their assigned folder.
4. Confirm that every tester reports the same starting commit and the correct QA database.
5. Let all four testers run simultaneously; no tester depends on another tester's database.
6. Review each tester's branch, report, and evidence after handoff.
7. Merge the four branches into the selected integration branch, preferably through pull requests.
8. Complete the [Consolidated Report](Consolidated-Report.md), group related bugs, and assign repairs and retests.

## Rules that apply to everyone

- Never use or reset the normal `akad_rentals` database for this test.
- Never share a live MySQL database between testers.
- Never commit database files, passwords, tokens, or real customer data.
- Each tester edits only their own `Report.md` and `Evidence/` folder.
- A Git pull downloads the schema, seed, gallery images, and instructions; it does not automatically create or update MySQL.
- Local manual test results are not production, physical-device, security, or client acceptance.
