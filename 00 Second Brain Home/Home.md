---
title: AKAD Second Brain — Home
aliases:
  - Second Brain Home
  - Project Knowledge Hub
tags:
  - akad
  - second-brain
  - dashboard
status: active
---

# AKAD Second Brain

> **Start here.** This is the knowledge dashboard for the Rental-Ops-Manager project. It is a reference and learning system; it is **not** part of the customer-facing production website.

## Learn how Rental-Ops-Manager works

**New to the project? No programming knowledge needed.** Follow the friendly lessons in order. Technical sections are optional.

1. [Start Here — choose your learning path](<../Understand the System/System Understanding/Start Here.md>)
2. [See the whole system in simple terms](<../Understand the System/System Understanding/System Overview.md>)
3. [Learn how owners sign in](<../Understand the System/System Understanding/Workflows/Login and Authentication.md>)
4. [Create and price Ana's booking](<../Understand the System/System Understanding/Workflows/Booking and Pricing.md>)
5. [Understand schedules and availability](<../Understand the System/System Understanding/Workflows/Availability and Conflicts.md>)
6. [Follow payments, deposits and balances](<../Understand the System/System Understanding/Workflows/Payments and Deposits.md>)
7. [Prepare, release and inspect equipment](<../Understand the System/System Understanding/Workflows/Equipment Release and Return.md>)
8. [Complete the post-event review](<../Understand the System/System Understanding/Workflows/Post-event Completion.md>)
9. [Understand offline saving and synchronization](<../Understand the System/System Understanding/Workflows/Offline Synchronization.md>)
10. [Learn where report numbers come from](<../Understand the System/System Understanding/Workflows/Reports.md>)
11. [Understand deployment and remaining limits](<../Understand the System/System Understanding/Deployment and Limitations.md>)

**For developers:** [Frontend](<../Understand the System/System Understanding/Frontend/Overview.md>) · [Backend](<../Understand the System/System Understanding/Backend/Backend Overview.md>) · [Database](<../Understand the System/System Understanding/Database/Database Overview.md>) · [API reference](<../Understand the System/System Understanding/Backend/API Reference.md>)

## Four authoritative knowledge sources

| Source | What you will find | Start here |
|---|---|---|
| **Understand the System** | Beginner-friendly walkthrough and verified technical reference | [Start Here](<../Understand the System/System Understanding/Start Here.md>) |
| **Source Documents** | Official requirements, design and diagrams | [System Design](<../Source Documents/Documentation/REvised/AKAD_System_Design.md>) |
| **Implementation** | Implementation plans, tests, verification, limitations | [Backend Requirement Matrix](<../Implementation/Backend-Requirement-Matrix.md>) |
| **.project-memory** | Decisions, approvals, authoritative AI development context | [Project Memory Index](<../.project-memory/MEMORY.md>) |

> **Hidden folder:** `.project-memory` remains in place for other development tools. To index it in Obsidian without duplicating it, enable the **Hidden Folders Access** community plugin (desktop Obsidian 1.13+) and explicitly allow only `.project-memory`. Do not enable `.git`, `.env` or other sensitive folders.

## Development decisions and plans

- [Approved decisions](<../.project-memory/AKAD_Approval.md>)
- [Requirements changes](<../.project-memory/AKAD_Requirements_Changes.md>)
- [Ideas and concepts](<../.project-memory/AKAD_Ideas_and_Concepts.md>)
- [Process context](<../.project-memory/process-context.md>)
- [Implementation verification](<../Implementation/Backend-Consolidated-Verification-2026-10-15.md>)
- [Current implementation gaps](<../Understand the System/System Understanding/Current Implementation Gaps.md>)

## How to keep this vault reliable

1. **Code is the implementation**, not the notes. Check the current commit before making technical assertions.
2. **Source Documents and approvals** explain intent and authorization; do not silently change them.
3. **Understand the System** should describe what the application actually does, including limits.
4. **Implementation** stores evidence and plans. Local tests do not establish production readiness.
5. **.project-memory** is authoritative project memory and is also consumed by development tools. Avoid unsupervised editing of these files in Obsidian.
6. Update links and the relevant walkthrough when the underlying implementation changes.

## Other pages

- [AI-Assisted Development Setup](<../README.md#ai-assisted-development>)
- [Knowledge Source Guide](<Knowledge Source Guide.md>)
- [Obsidian Setup & Deployment Safety](<Obsidian Setup and Deployment Safety.md>)
- [Development Journal](<../05 Development Journal/README.md>)
- [Feature Note Template](<../99 Templates/Feature Note.md>)
