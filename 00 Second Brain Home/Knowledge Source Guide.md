---
title: AKAD Knowledge Source Guide
tags: [akad, second-brain, documentation]
---

# Where information belongs

Use the four existing repositories of knowledge instead of creating duplicate note collections:

- **Understand the System/**: Teach the current functionality and provide accurate technical references. Update when current code changes.
- **Source Documents/**: Preserve approved requirements, proposals, diagrams, and historical specifications. Do not silently rewrite approvals to match source code.
- **Implementation/**: Track implementation plans, acceptance evidence, migration considerations, and unresolved gates. Do not call untested work complete.
- **.project-memory/**: Canonical working memory, operating context, approvals, and decisions. Keep it at the repository root for existing tool integrations.

## New personal development notes

Put your own study notes, reasoning, lessons learned, and troubleshooting journals in **05 Development Journal/**. Keep private information out of Git: this repository is public.

When you update a major workflow, reference the affected code and tests and update the relevant pages in **Understand the System/**. Do not automatically copy `.project-memory` into a visible folder; the hidden-folder plugin lets Obsidian index the source files in place.

Return to [Second Brain Home](Home.md).
