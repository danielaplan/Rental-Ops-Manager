# Tester 2 QA Report — Scheduling, Conflicts, Statuses, and Cancellations

Use the [Tester 2 instructions](Instructions.md) for your assigned scenarios and the [common instructions](../README.md) for shared rules. Edit only this report and files under `Evidence/`.

## Environment

- **Tester:**
- **Laptop / environment:**
- **Browser and version:**
- **PHP / MySQL version:**
- **Database baseline file or Git commit:**
- **Starting counts — bookings / customers / payments / pending sync:**

## Results

Enter exactly `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Use `N/A` when no booking was created and `None` when no screenshot or note is needed.

| Scenario | Outcome | Booking reference(s) | Screenshot filename | Notes / Bug ID |
| ---: | --- | --- | --- | --- |
| 11 |  |  |  |  |
| 12 |  |  |  |  |
| 13 |  |  |  |  |
| 14 |  |  |  |  |
| 15 |  |  |  |  |
| 16 |  |  |  |  |
| 17 |  |  |  |  |
| 18 |  |  |  |  |
| 19 |  |  |  |  |
| 20 |  |  |  |  |
| 45 |  |  |  |  |
| 46 |  |  |  |  |
| 47 |  |  |  |  |
| 48 |  |  |  |  |

## Screenshot evidence

Save images in `Evidence/` using `T2-S<scenario>-<short-description>.png`. Add one subsection per screenshot:

```md
### Scenario 11

![Tester 2 Scenario 11 - short description](Evidence/T2-S11-short-description.png)
```

## Bug list

Use IDs `T2-BUG-01`, `T2-BUG-02`, and so on.

| Bug ID | Scenario | Severity | Short issue | Screenshot | Retest? |
| --- | ---: | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Detailed bug records

Copy this subsection once for every bug.

### Bug ID — short title

- **Scenario / booking reference:**
- **Process section:**
- **Severity:** Critical / High / Medium / Low
- **Exact steps to reproduce:**
- **Expected result:**
- **Actual result:**
- **Exact error message:**
- **Does it still happen after refresh/reopen?**
- **Which screens disagree?**
- **Screenshot filename:**
- **Recommended fix or clarification:**

## Summary and handoff

- **PASS:**
- **FAIL:**
- **BLOCKED:**
- **NOT RUN:**
- **Critical / High / Medium / Low bugs:**
- **Scenarios needing retest:**
- **Workflow stages not reached:**
- **Overall assessment:**

Before handoff:

- [ ] Restore or deactivate every `TEMP QA` catalog record.
- [ ] Verify every FAIL and BLOCKED result has screenshot evidence.
- [ ] Verify image links render in this report.
- [ ] Commit and push this report and the `Evidence/` files.
- [ ] Tell the coordinator that Tester 2 is complete.
