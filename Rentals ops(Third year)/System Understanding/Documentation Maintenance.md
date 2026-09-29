---
title: "Documentation Maintenance"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
audience: documentation-team
status: documented
---

# Documentation Maintenance

## Keeping the guide accurate

When code changes, its explanation may also need to change. A source file is the actual project file used to check a technical claim.

1. Find the changed feature’s workflow, file notes and table notes.
2. Update the plain explanation and example first.
3. Have a developer check the exact behavior, fields and known limits.
4. Check that links still open and diagrams still describe the implemented flow.
5. Record verification only when the relevant checks were actually performed.

Keep the existing filenames and folder names. This preserves links used by your team. Add future frontend explanations when that work is ready and authorized.

## A useful review question

Can a teammate explain the feature after reading the plain section without reading code? If not, clarify the purpose and example before adding more technical detail.

## Technical reference (optional)

Read this part when you need exact file behavior, field names or developer details. The explanation above is the first-pass reading.

This is a manually written explanation supported by a source inventory. It must be reviewed when backend/database behavior changes.

1. Compare changed PHP/SQL files against the source snapshot below.
2. Update affected file notes, table column dictionaries, route reference and workflows together.
3. Recheck direct and sync paths: they have separate dispatch/validation code.
4. Keep requirements/design differences explicit. Do not remove a gap just because one path was fixed.
5. Check all source links and Obsidian links; maintain full vault-relative links under System Understanding to avoid ambiguous filenames.
6. Record new verification evidence separately from previously recorded tests. Frontend documentation should be added later under its own folder when authorized/ready.

### Source snapshot

SHA-256 fingerprints are recorded in [[System Understanding/Source Snapshot]] for every PHP file and SQL script reviewed. They identify this guide's source baseline, not a live database state. A changed fingerprint signals a review is needed.

Properties date/status/tags follow the vault's existing convention. Notes use Obsidian wikilinks, regular Markdown source links and Mermaid diagrams; no additional Obsidian plugin or skill is required.
Return to [[System Understanding/Start Here|Start Here]].
