---
title: Obsidian Setup and Deployment Safety
tags: [akad, obsidian, deployment]
---

# Unified vault and production separation

This Obsidian vault is the **repository root**. The three documentation directories remain where they were, and `.project-memory` stays hidden on disk and available to development tools. Only the Obsidian configuration has been consolidated into the repository-root `.obsidian/` directory.

## Open the vault

In Obsidian: **Manage vaults → Open folder as vault**, then select your local `Rental-Ops-Manager` folder, **not** `Understand the System`, `Implementation`, `Source Documents`, or `00 Second Brain Home` individually.

Install the desktop **Hidden Folders Access** plugin if you want `.project-memory` indexed: Obsidian **Settings → Community plugins → Browse**, search and enable, then in its settings allow `.project-memory` only. This plugin is third-party, relies on Obsidian internals, and is desktop-only. Do not assume Obsidian Sync will copy hidden folders to other devices.

Make sure **Second Brain Home** opens and that its links work. The root vault excludes application-code and test folders from Obsidian indexing for a less cluttered sidebar; this does not remove those files from the repository.

## Deployment danger

The repository includes development memory, diagrams, test evidence, and code. Opening it in Obsidian does **not** expose them, but **deploying the entire repository as a website** may expose these files over HTTP. A `.gitignore` file and Obsidian's `Excluded files` setting are **not** server access controls.

**Before production hosting**, use a deployment manifest / build step to publish only the required site assets and PHP API files, or use a dedicated public document root and server deny rules. Explicitly exclude or deny access to:

- `.obsidian/`, all nested `.obsidian/` backups and hidden metadata
- `.project-memory/`
- `Understand the System/`, `Source Documents/`, `Implementation/`
- `00 Second Brain Home/`, `05 Development Journal/`, `99 Templates/`
- `tests/`, development scripts, sample data, credentials, git metadata and other private files

Server-side PHP files and runtime configuration must also be protected against source disclosure; use a properly configured PHP-capable host with HTTPS. The local README's `php -S ... -t .` uses the repository root as its document root for development, which is **not production isolation**. Treat the dev server as localhost-only, not as a public deployment strategy.

**Do not deploy or switch hosting through this vault setup.** The code still needs independent production review for PHP, MySQL, authentication, TLS, uploads, scheduler, backups, offline tests, and owner acceptance.

## Safe migration procedure

1. Back up your current checkout or commit it; stop Obsidian before configuration moves.
2. `node scripts/setup-obsidian-vault.mjs` (preflight only)
3. `node scripts/setup-obsidian-vault.mjs --apply` (backs up settings outside the repo, creates root config)
4. Open repository root as the vault; verify navigation, figures, markdown links, settings.
5. Install the Hidden Folders Access plugin, enabling `.project-memory` only.
6. `node scripts/setup-obsidian-vault.mjs --verify` (basic file checks)
7. **Optional, once satisfied and with Obsidian closed:** `node scripts/setup-obsidian-vault.mjs --retire` (backs up old nested settings outside the repo, verifies hashes, then removes those three `.obsidian` configuration directories; never moves the notes themselves).
8. Review `git status` and `git diff`; commit when you are satisfied.

Return to [Second Brain Home](Home.md).
