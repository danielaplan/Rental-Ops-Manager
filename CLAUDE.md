# Claude Code Project Instructions

Use progressive discovery for every task:

`CLAUDE.md → PROJECT_INDEX.md → relevant documentation → relevant source → relevant tests`

1. Read [`PROJECT_INDEX.md`](PROJECT_INDEX.md) to locate the smallest relevant set of files. The index is navigation, not proof that code is unchanged.
2. Consult only task-relevant Second Brain, requirements, approval, and implementation pages initially. Expand when behavior is cross-cutting or uncertain.
3. Inspect current source, callers, schema dependencies, and tests before implementation. Approved requirements and later owner decisions control scope; plans and proposals alone do not authorize changes.
4. Protect existing functionality, data boundaries, authentication, validation, accessibility, and owner workflows. Preserve offline synchronization and shared direct/sync business-rule parity. FR-10 internal availability blockouts remain deferred unless newly approved.
5. Preserve unrelated working-tree changes. Do not run migrations, deploy, stage, commit, push, or touch operational data without explicit authorization. Never aim an isolated test runner at a normal development or production database.
6. Run the smallest relevant tests plus broader checks warranted by risk, and check affected documentation links. State whether evidence came from source inspection, synthetic/local tests, browser checks, physical devices, production, or client acceptance; identify unverified behavior and unresolved issues.
7. After a meaningful application change, identify which existing documentation became inaccurate and update only those pages. Keep beginner material conversational; preserve Ana's example, simple Mermaid diagrams, Previous/Next Lesson links, and Back to Start Here navigation. Update relevant implementation-status and verification pages only when affected.
8. Add a dated entry under `05 Development Journal/` for meaningful application changes, including the actual verification performed. Update `PROJECT_INDEX.md` when code locations, dependencies, architecture, workflows, authority boundaries, or test commands change. Avoid documentation rewrites for formatting-only or behavior-neutral work.
9. Record an approved business decision in `.project-memory/` only when the user explicitly approves it. Preserve earlier decisions as history and never present an AI assumption as approval.
10. Report source, test, index, journal, and documentation changes together. These maintenance rules apply while Claude Code is actively working; Claude Code does not independently monitor manual or external edits.
