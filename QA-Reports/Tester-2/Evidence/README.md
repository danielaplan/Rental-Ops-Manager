# Tester 2 Screenshot Evidence

Save every Tester 2 screenshot in this folder. Do not paste or link screenshots inside `Report.md`; the filename connects each image to its scenario and bug.

## Required filename

For an application bug:

```text
T2-S<scenario>-BUG-<number>-<short-description>-<image-number>.png
```

Example: `T2-S11-BUG-01-conflict-approval-failed-01.png`

For a blocker without an application Bug ID:

```text
T2-S<scenario>-BLOCKED-<short-description>-<image-number>.png
```

Example: `T2-S11-BLOCKED-mysql-unavailable-01.png`

Use `-01`, `-02`, and so on when one problem needs multiple screenshots. Use lowercase words separated by hyphens, keep the original image format (`.png`, `.jpg`, or `.webp`), and never include passwords, tokens, or real customer information.

## Retest update

The former T2-BUG-01, T2-BUG-02, Scenario 12, and Scenario 20 screenshots were removed on 2026-10-26 after their fixes or retests passed. They depicted superseded failure or blocked states.

Current verification is recorded in [the Tester 2 report](../Report.md).
