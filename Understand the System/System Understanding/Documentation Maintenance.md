---
title: "Documentation Maintenance"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Documentation Maintenance

**Guide:** [Start Here](Start%20Here.md) · [System Overview](System%20Overview.md) · [Glossary](Glossary.md) · [Known Limits](Current%20Implementation%20Gaps.md)

## Review order

1. Record the Git SHA and date in [Source Snapshot](Source%20Snapshot.md).
2. Read current source and schema before changing behavior claims.
3. Use revised requirements/project-memory to label approved, deferred, or superseded scope.
4. Update the connected workflow, endpoint page, table page, glossary, gaps, and navigation together.
5. Run the Markdown link checker with URL decoding and verify every documented endpoint/function/table/column against source.
6. Label evidence precisely: source inspection, syntax, synthetic test, browser fixture, physical device, production, or client acceptance.

## Writing pattern

Major learning chapters should explain purpose, business need, Ana example, owner/system steps, behind-the-scenes behavior, a useful diagram, rules/limits, technical references, and related reading. Reference pages should stay concise and exact.

## Historical knowledge

Do not delete useful history to make the current story simpler. Label legacy tables, superseded decisions, and deferred features. Requirements or plans do not prove implementation; source does not prove production acceptance.
