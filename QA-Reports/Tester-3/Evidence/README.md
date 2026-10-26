# Tester 3 Screenshot Evidence

Save every Tester 3 screenshot in this folder. Do not paste or link screenshots inside `Report.md`; the filename connects each image to its scenario and bug.

## Required filename

For an application bug:

```text
T3-S<scenario>-BUG-<number>-<short-description>-<image-number>.png
```

Example: `T3-S21-BUG-01-payment-total-incorrect-01.png`

For a blocker without an application Bug ID:

```text
T3-S<scenario>-BLOCKED-<short-description>-<image-number>.png
```

Example: `T3-S21-BLOCKED-mysql-unavailable-01.png`

Use `-01`, `-02`, and so on when one problem needs multiple screenshots. Use lowercase words separated by hyphens, keep the original image format (`.png`, `.jpg`, or `.webp`), and never include passwords, tokens, or real customer information.

## Captured failure evidence

- `T3-S30-BUG-01-cross-screen-financial-totals-01.png` — Reports shows zero deposits, refunds, and deductions despite the persisted Scenario 30 financial records.
- `T3-S49-BUG-02-future-payment-accepted-01.png` — Booking 11 payment history shows the future-dated Completed payment on January 1, 2027.
- `T3-S50-BUG-03-overpayment-accepted-01.png` — Booking 12 payment history shows accepted Completed payments of ₱900 and ₱100.
- `T3-S50-BUG-03-overpayment-accepted-02.png` — Booking 12 Details shows a ₱999 total but ₱1,000 paid and a zero balance.
- `T3-S52-BUG-04-report-filter-totals-01.png` — March 2027 filtering shows inconsistent revenue, financial totals, and package popularity.
