#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# sync-vault.sh
# Mirrors .project-memory/* into the Obsidian vault ("Rentals ops(Third year)")
# so the vault's human-readable notes stay in sync with session-auto-updated
# memory files.  Designed to be scheduled via cron (see CronCreate prompts).
#
# Mapping (.project-memory filename -> vault filename):
#   AKAD_Approval.md             -> "AKAD Requirements Analysis Approval.md"
#   AKAD_Ideas_and_Concepts.md   -> "AKAD Requirements Analysis Ideas and Concepts.md"
#   AKAD_Requirements_Changes.md -> "AKAD Requirements Analysis Changes.md"
#   process-context.md           -> "process-context.md"   (new in vault)
# ---------------------------------------------------------------------------
set -eu

PM_DIR=".project-memory"
VAULT_DIR="Rentals ops(Third year)"

# Resolve the repo root regardless of where cron fires from
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== vault-sync: starting $(date) ==="

sync_file() {
    local src="$PM_DIR/$1"
    local dst="$VAULT_DIR/$2"
    if [ -f "$src" ]; then
        mkdir -p "$VAULT_DIR"
        cp "$src" "$dst"
        echo "  synced: $src -> $dst"
    else
        echo "  skip:   $src (not found)"
    fi
}

sync_file "AKAD_Approval.md" \
          "AKAD Requirements Analysis Approval.md"
sync_file "AKAD_Ideas_and_Concepts.md" \
          "AKAD Requirements Analysis Ideas and Concepts.md"
sync_file "AKAD_Requirements_Changes.md" \
          "AKAD Requirements Analysis Changes.md"
sync_file "process-context.md" \
          "process-context.md"

echo "=== vault-sync: complete ==="
