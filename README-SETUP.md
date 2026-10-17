# AKAD Unified Obsidian Vault Setup Kit

Updated against GitHub `main` commit `4024853bc89a5f38f363efe0989735cdb778f612` (2026-10-17), after the beginner-friendly documentation update.

This kit creates **one Obsidian vault rooted at the Rental-Ops-Manager repository**; it does not move your 96 updated System Understanding notes or the original project memory. It preserves all four knowledge sources in their canonical repo paths.

## Requirements

- Your latest local checkout of `danielaplan/Rental-Ops-Manager`
- Node.js 20+ (already listed by the repository README for running tests)
- Obsidian desktop

## Install

1. Ensure your local repository is current, clean or backed up (`git status`). Do not discard existing work.
2. Extract **the CONTENTS of this ZIP** directly into the root of your local `Rental-Ops-Manager` checkout. This adds `00 Second Brain Home/`, `05 Development Journal/`, `99 Templates/`, and `scripts/setup-obsidian-vault.mjs`. Do not replace other files.
3. Open a PowerShell terminal in the repository root:

   ```powershell
   node scripts/setup-obsidian-vault.mjs
   node scripts/setup-obsidian-vault.mjs --apply
   ```

   The first command checks the inputs without changing anything. The second backs up the existing Obsidian configs **outside** the repository, initializes `.obsidian/` at the root, and adds local workspace ignore rules to `.gitignore`. Your original notes and existing nested config folders are retained.

4. In Obsidian choose **Open folder as vault** and select `Rental-Ops-Manager` (the repository root). Open `00 Second Brain Home/Home.md`.
5. Install [Hidden Folders Access](https://community.obsidian.md/plugins/hidden-folders-access) via Community plugins. In the plugin's settings, allow **only `.project-memory`**. This requires Obsidian **1.13.0+**, desktop only. Don't expose `.git` or other hidden folders.
6. Inspect the links in `Home.md` and use:

   ```powershell
   node scripts/setup-obsidian-vault.mjs --verify
   git status
   ```

7. **Only after you have confirmed that everything works**, close Obsidian and optionally retire the original three nested Obsidian settings folders:

   ```powershell
   node scripts/setup-obsidian-vault.mjs --retire
   git status
   git diff --check
   ```

   The script archives and checks the nested configs before removing them. Your source notes are never deleted or moved. Leaving the nested configs until you are confident is also safe; just open the root vault.

8. Commit the reviewed changes through Git or Codex if desired. This kit does **not** stage, commit or push automatically.

## Critical deployment note

**The Obsidian vault is for development, not for web hosting.** Because the vault root is your repository root, never deploy every repo file indiscriminately. `.gitignore`, `.obsidian/app.json` exclusions, and the fact that Obsidian is local do not protect files on a web server. Package an allowlisted production application and enforce server-side deny rules for project-memory and documentation. See `00 Second Brain Home/Obsidian Setup and Deployment Safety.md`.

## What this does not do

- Does not rewrite the updated System Understanding documentation.
- Does not migrate databases, run tests, or deploy.
- Does not install or enable third-party plugins for you.
- Does not expose `.project-memory` to Obsidian without the desktop plugin.
- Does not alter application code or your existing project memory.
- Does not test the production server's ability to serve private files.

