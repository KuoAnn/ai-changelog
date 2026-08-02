#!/usr/bin/env bash
# 把 GitHub Actions 產生的來源快照（快照分支）同步到本機目錄，供排程直接解析。
#
# 為什麼：Claude Code 雲端排程沙箱連不到 api.github.com / github.com / claude.com /
# learn.chatgpt.com（見 scripts/update-sources.json 的 cloudSandbox），但連得到自己的
# repo。Actions 沒有這些限制，先把來源原文抓好推上快照分支，排程只要 git fetch 就有料。
#
# 用法：
#   bash scripts/sync-snapshots.sh              # 同步到 /tmp/ai-changelog-snapshots
#   SNAPSHOT_DIR=/path bash scripts/sync-snapshots.sh
#
# 退出碼：
#   0  快照已就緒（即使部分來源當初抓失敗 — 逐筆狀態看 index.json）
#   3  沒有快照分支或 fetch 失敗 → 排程請退回原本的 live 抓取流程
set -euo pipefail

cd "$(dirname "$0")/.."

OUT="${SNAPSHOT_DIR:-/tmp/ai-changelog-snapshots}"

# 分支名與過期門檻都以 manifest 為單一資訊源（讀不到就用預設值，不讓同步整個失敗）。
BRANCH="$(node -e 'const m=require("./scripts/update-sources.json");process.stdout.write((m.snapshots&&m.snapshots.branch)||"")' 2>/dev/null || true)"
[ -n "$BRANCH" ] || BRANCH="data-snapshots"

if ! git fetch --quiet --depth=1 --no-tags origin "$BRANCH" 2>/dev/null; then
  echo "[snapshots] 取不到快照分支 origin/$BRANCH（workflow 可能還沒跑過或 fetch 失敗）→ 請退回 live 抓取。" >&2
  exit 3
fi

# 立刻定住 SHA：FETCH_HEAD 會被後續任何 fetch 覆寫，別讓它在這之後才被解讀。
SNAPSHOT_SHA="$(git rev-parse FETCH_HEAD)"

# 下面要 rm -rf，先擋掉會炸掉整台機器的 SNAPSHOT_DIR：空值、根目錄，
# 以及「已存在但不是上一輪快照」的目錄（沒有 index.json 就不是我們建的，不准刪）。
case "$OUT" in
  "" | "/" | "/.")
    echo "[snapshots] SNAPSHOT_DIR 不合法（$OUT）→ 中止，避免誤刪。" >&2
    exit 2
    ;;
esac
if [ -e "$OUT" ] && [ ! -f "$OUT/index.json" ]; then
  echo "[snapshots] $OUT 已存在但不像上一輪快照（缺 index.json）→ 中止，避免誤刪既有資料。" >&2
  exit 2
fi

rm -rf -- "$OUT"
mkdir -p "$OUT"
git archive --format=tar "$SNAPSHOT_SHA" | tar -x -C "$OUT"

if [ ! -f "$OUT/index.json" ]; then
  echo "[snapshots] 快照分支缺少 index.json → 請退回 live 抓取。" >&2
  exit 3
fi

echo "[snapshots] 目錄：$OUT"
python3 - "$OUT/index.json" <<'PY'
import json
import sys
from datetime import datetime, timezone

with open(sys.argv[1], encoding="utf-8") as handle:
    index = json.load(handle)

try:
    with open("scripts/update-sources.json", encoding="utf-8") as handle:
        stale_after = float(json.load(handle).get("snapshots", {}).get("staleAfterHours", 8))
except (OSError, ValueError, TypeError):
    stale_after = 8.0

generated = index.get("generatedAtIso") or ""
age_hours = None
try:
    stamp = datetime.fromisoformat(generated.replace("Z", "+00:00"))
    age_hours = (datetime.now(timezone.utc) - stamp).total_seconds() / 3600
except ValueError:
    pass

totals = index.get("totals", {})
age_text = f"{age_hours:.1f} 小時前" if age_hours is not None else "時間不明"
verdict = "新鮮"
if age_hours is None or age_hours > stale_after:
    verdict = f"過期（超過 {stale_after:g} 小時）— 受影響來源請記為 transient，detail 註明快照逾時未更新"

print(f"[snapshots] 產生於 {index.get('generatedAt', '?')}（{age_text}）→ {verdict}")
print(f"[snapshots] 來源成功 {totals.get('ok', 0)} / 失敗 {totals.get('failed', 0)}（共 {totals.get('sources', 0)}）")

for product_key, product in (index.get("products") or {}).items():
    for source in product.get("sources") or []:
        priority = source.get("priority")
        if source.get("skipped"):
            print(f"[snapshots]   {product_key} p{priority} ➖ 未收快照：{source.get('skipReason', '')}")
        elif source.get("ok"):
            print(f"[snapshots]   {product_key} p{priority} ✅ {source.get('bytes', 0)}B  {source.get('file')}")
        else:
            print(f"[snapshots]   {product_key} p{priority} ❌ {source.get('errorClass', '?')}：{source.get('errorDetail', '')}")
PY
