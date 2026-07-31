#!/usr/bin/env bash
# Commit & push the changelog dashboard so GitHub Pages rebuilds.
#
# Linux/macOS counterpart of push-changelog.ps1 — used by the REMOTE
# scheduled agent (which runs on Linux). Called AFTER the agent has edited
# index.html and/or data/claude-desktop.json.
#
# Pulls latest, stages changed files, commits with a Taipei timestamp, and
# pushes to origin/main. No-op safe: if nothing changed, exits 0 without a commit.
#
# Usage: scripts/push-changelog.sh "Claude Code +2 筆、Claude Desktop +1 筆、Codex CLI +1 筆、Codex App +0 筆"
set -euo pipefail

MSG="${1:-內容刷新}"

# Repo root = parent of this script's dir (resilient to where it's invoked from)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

TAIPEI="$(TZ=Asia/Taipei date '+%Y-%m-%d %H:%M')"
echo "[push-changelog] repo: $REPO_ROOT"
echo "[push-changelog] Taipei time: $TAIPEI"

# Identity for the commit (remote env may have none configured)
git config user.name  >/dev/null 2>&1 || git config user.name  "ai-changelog-bot"
git config user.email >/dev/null 2>&1 || git config user.email "bot@users.noreply.github.com"

# Rebase onto main first so the push to main lands as a fast-forward.
# (The remote scheduler may start us on an auto-created branch — we still
#  commit here and push straight to main below, never opening a PR.)
git fetch origin main || true
git pull --rebase --autostash origin main || true

git add index.html data/changelog-data.js data/claude-desktop.json scripts/update-sources.json

if git diff --cached --quiet; then
  echo "[push-changelog] no changes staged — skipping commit."
  exit 0
fi

git commit -m "chore(auto): 自動更新 changelog ($TAIPEI Taipei)

$MSG

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"

# Push current HEAD straight to main, regardless of the local branch name.
git push origin HEAD:main

echo "[push-changelog] pushed to main. Pages will rebuild within ~1 min:"
echo "  https://kuoann.github.io/ai-changelog/"
