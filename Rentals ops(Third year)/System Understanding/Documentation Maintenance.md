---
title: "Documentation Maintenance"
date: 2026-09-29
tags:
  - akad
  - system-understanding
  - backend-database
status: documented
---

# Documentation Maintenance

This is a manually written explanation supported by a source inventory. It must be reviewed when backend/database behavior changes.

1. Compare changed PHP/SQL files against the source snapshot below.
2. Update affected file notes, table column dictionaries, route reference and workflows together.
3. Recheck direct and sync paths: they have separate dispatch/validation code.
4. Keep requirements/design differences explicit. Do not remove a gap just because one path was fixed.
5. Check all source links and Obsidian links; maintain full vault-relative links under System Understanding to avoid ambiguous filenames.
6. Record new verification evidence separately from previously recorded tests. Frontend documentation should be added later under its own folder when authorized/ready.

## Source snapshot

SHA-256 fingerprints are recorded in [[System Understanding/Source Snapshot]] for every PHP file and SQL script reviewed. They identify this guide's source baseline, not a live database state. A changed fingerprint signals a review is needed.

Properties date/status/tags follow the vault's existing convention. Notes use Obsidian wikilinks, regular Markdown source links and Mermaid diagrams; no additional Obsidian plugin or skill is required.

Return to [[System Understanding/Start Here|Start Here]].
