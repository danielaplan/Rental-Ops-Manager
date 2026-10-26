# Tester 1 Screenshot Evidence

Save every Tester 1 screenshot in this folder. Do not paste or link screenshots inside `Report.md`; the filename connects each image to its scenario and bug.

## Required filename

For an application bug:

```text
T1-S<scenario>-BUG-<number>-<short-description>-<image-number>.png
```

Example: `T1-S03-BUG-01-package-missing-01.png`

For a blocker without an application Bug ID:

```text
T1-S<scenario>-BLOCKED-<short-description>-<image-number>.png
```

Example: `T1-S07-BLOCKED-mysql-unavailable-01.png`

Use `-01`, `-02`, and so on when one problem needs multiple screenshots. Use lowercase words separated by hyphens, keep the original image format (`.png`, `.jpg`, or `.webp`), and never include passwords, tokens, or real customer information.

## Retest update

All former Tester 1 bug screenshots were removed on 2026-10-26 after focused client and isolated database integration retests passed. They depicted superseded failure states.

Current verification status is recorded in [the Tester 1 report](../Report.md).
