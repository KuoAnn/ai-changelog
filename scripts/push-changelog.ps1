<#
.SYNOPSIS
  Commit & push the changelog dashboard so GitHub Pages rebuilds.

.DESCRIPTION
  Called by the scheduled refresh agent AFTER it has edited
  claude-code-changelog-tw.html. Pulls latest, stages changed files,
  commits with a Taipei timestamp, and pushes to origin/main.

  Safe to run when nothing changed: it detects an empty diff and exits 0
  without creating a commit.

.PARAMETER Message
  Optional extra summary appended to the commit message
  (e.g. "Claude Code +2, Codex CLI +1, Codex App +3").

.EXAMPLE
  pwsh scripts/push-changelog.ps1 -Message "Claude Code +2 筆、Codex CLI +1 筆"
#>
[CmdletBinding()]
param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"

# Repo root = parent of this script's folder
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

# Taipei timestamp (TZ-independent: compute from UTC + 8h)
$taipei = [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId(
  [DateTime]::UtcNow, "Taipei Standard Time"
).ToString("yyyy-MM-dd HH:mm")

Write-Host "[push-changelog] repo: $RepoRoot"
Write-Host "[push-changelog] Taipei time: $taipei"

# Get latest first so the push is fast-forward
git pull --rebase --autostash origin main 2>&1 | Write-Host

# Stage the dashboard + any sibling content that changed
git add claude-code-changelog-tw.html index.html 2>&1 | Write-Host

# Nothing to commit? bail cleanly.
$staged = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "[push-changelog] no changes staged — skipping commit." -ForegroundColor Yellow
  exit 0
}

$summary = if ([string]::IsNullOrWhiteSpace($Message)) { "內容刷新" } else { $Message }
$commitMsg = @"
chore(auto): 自動更新 changelog ($taipei Taipei)

$summary

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
"@

git commit -m $commitMsg 2>&1 | Write-Host
git push origin main 2>&1 | Write-Host

Write-Host "[push-changelog] pushed. Pages will rebuild within ~1 min:" -ForegroundColor Green
Write-Host "  https://kuoann.github.io/ai-changelog/"
