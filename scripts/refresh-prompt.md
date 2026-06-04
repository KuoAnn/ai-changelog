# 自動刷新 prompt — AI Changelog GitHub Page

> 這份 prompt 給 **Claude Code 排程 (schedule / cron)** 使用。每次觸發時，agent 會抓三個官方 changelog、更新 repo 內的 HTML、然後 push 回 GitHub 讓 Pages 重建。
>
> **Repo：** `https://github.com/KuoAnn/ai-changelog`（遠端排程會自動 clone 一份）
> **要編輯的檔案：** repo 根目錄的 `index.html`
> **路徑慣例：** 一律用 **repo-relative** 路徑（例 `index.html`、`scripts/push-changelog.sh`），不要用任何本機絕對路徑——遠端環境是 Linux、工作目錄已是 repo 根。

---

你的目標：刷新 repo 根目錄的 `index.html`，把三個 AI 編碼工具 changelog 的最新內容合併進去、產生少量「自動靈感卡」、更新「最後更新」時間戳，最後 **commit 並 push** 讓 GitHub Page（<https://kuoann.github.io/ai-changelog/>）自動重建。所有新加入的內容都必須使用繁體中文，與既有條目風格一致。

## 背景

HTML 內三個 Tab：Claude Code（DATA_CC、INSP_CC）、Codex App（DATA_CA、INSP_CA）、Codex CLI（DATA_CI、INSP_CI）。
Hero 的 Date Span、Total Versions、Tab meta 都由 JS 動態計算 — 不要去動那些靜態字串。

## 步驟

1) **先同步 git**，避免 push 衝突：`git pull --rebase --autostash origin main`
   （此處 pull 是為了讓接下來的 Read 讀到最新內容；push 腳本內部會再 pull 一次以確保 fast-forward，兩者不是冗餘 bug。）
   接著建議**先用 Grep 定位** `const DATA_CC` / `const DATA_CA` / `const DATA_CI` / `INSP_` 的行號，再用 Read 的 offset/limit 分塊讀需要的陣列區段（`index.html` 160KB+，勿整檔讀）。

2) 三個來源各自抓 — 不同來源用不同策略（這些是經驗證最可靠的）：

   2a) Claude Code（DATA_CC）：
   - 用 WebFetch 抓 `https://code.claude.com/docs/en/changelog`
   - WebFetch 有快取且會自動摘要，**明確要求列出每個版本的版本號與日期**，避免漏版本；同一版若已存在於陣列即視為「無新內容」。

   2b) Codex CLI（DATA_CI）— 抓 GitHub API（權威來源）：
   - 用 WebFetch 抓 `https://api.github.com/repos/openai/codex/releases?per_page=30`
   - 只挑 stable 版（`prerelease: false`），跳過 alpha
   - 用 `tag_name` 抓版本（例 `rust-v0.136.0`，取 `0.136.0`）、`published_at` 抓日期、`body` 抓 release notes 整理成繁中
   - 未授權的 `api.github.com` 每小時限 60 次；若收到 rate limit / 403，視為此來源解析失敗並套用「部分來源失敗」規則（見約束）。

   2c) Codex App（DATA_CA）— 抓 RSS feed（避開 stale CDN）：
   - 用 Bash 跑 `curl -s -A 'Mozilla/5.0' 'https://developers.openai.com/codex/changelog/rss.xml'`
   - 只挑 link/guid 含 `-app` 的 entries
   - 從 `<title>`、`<pubDate>`、`<description>`（HTML-encoded）抓內容；保留英文 feature 名、用 <code> 包指令、<b> 強調

3) 對每個來源，找出對應陣列**尚未收錄**的新條目。整理成繁中後插入陣列「最前面」（維持新到舊順序）。**不可刪舊條目。**

   **🚨 去重判定（防排程重複插入，最重要）：** 先讀該陣列「最前面那筆」的 `v`（即目前最新版），**只插入版本/日期嚴格新於該筆**的條目；實際插入前再掃一次整個陣列，確認該 `v` 不存在才寫入。同一版已存在 → 跳過。

   條目結構：
   - DATA_CC: { v, date, cat, body } cat ∈ {Subagents/Skills, Plugins/MCP, Hooks, Slash Commands, IDE/Editor, Settings/Config, Permissions/Security, UI/UX, Performance/Bug Fix}
   - DATA_CA: { v, date, cat, title, body } cat ∈ {Models/Inference, IDE/Editor, UI/UX, Performance/Bug Fix, Cloud/Web, MCP/Tools} — Codex App 用 v: "YYYY-MM-DD"
   - DATA_CI: { v, date, cat, title, body } cat ∈ {Models/Inference, MCP/Tools, Local Sandbox, Slash Commands, UI/UX, Permissions/Security, Performance/Bug Fix, Plugins/MCP}

   **🚨 一律用 Edit 工具 surgical 替換，禁止用 Write 重寫整檔**（HTML 已 160KB+）。

4) 自動生成靈感卡（**全部來源合計每次最多 2 張，且同一個 INSP_* 最多 1 張**）— 嚴格節制。只在新版本有明確破天荒功能時產（新 slash command、新模型、新功能類別首發）。寫不出有意義的應用情境就跳過，寧缺勿濫。

   往對應 INSP_* 陣列末尾 push 一個 object，必須含 `auto: true`：
   ```js
   INSP_CC.push({
     ico: "<emoji>", color: "<purple|blue|orange|green|red|gold|teal>",
     feat: "<短標題（含英文 feature 名）>", ver: "<vX.Y.Z · YYYY-MM-DD>",
     desc: "<1-2 句說明>",
     scen: "<b>場景：</b><帶入 Frontend(iOS/Android/Web)/Sprint 的應用建議>",
     roles: [<frontend/backend/designer/qa/pm 擇 1-4>],
     d: [
       { h: "為什麼有用", p: "<繁中段落>" },
       { h: "設定 / 操作", c: "<bash|json|yaml|toml>", b: "<可貼上的命令>" },
       { h: "小技巧", l: ["<bullet 1>", "<bullet 2>"] }
     ],
     auto: true
   });
   ```

5) 更新時間戳 — **格式必須 `YYYY-MM-DD HH:MM (Taipei)`**：
   先取台北時間 `bash TZ=Asia/Taipei date '+%Y-%m-%d %H:%M'`，再用 Edit 替換 `<b id="lastRefreshed">舊時間 (Taipei)</b>`。

6) **語法驗證 gate（push 前必做）：** 全程用 Edit surgical 替換 160KB HTML，一個逗號/括號錯誤就會讓整頁 JS 掛掉，且排程環境沒人看得到。push 前務必驗證：
   - 抽出修改過的 `DATA_*` / `INSP_*` 區塊，用 `node --check` 或 `node -e "..."` parse 一次；無 Node 時至少確認陣列開合括號 / 大括號數量平衡。
   - **驗證不過就中止，不要 push。** 仍執行 push 腳本只更新時間戳（若時間戳是唯一變更），summary 註明「內容語法驗證失敗，僅更新時間戳記」。

7) **Commit + push**（觸發 GitHub Pages 重建）：執行 push 腳本，把三來源檢查結果當 summary 傳入。

   - 遠端 / Linux（排程環境）：

     ```bash
     bash scripts/push-changelog.sh "Claude Code +N 筆、Codex CLI +N 筆、Codex App +N 筆"
     ```

   - 本機 / Windows（手動跑）：

     ```powershell
     pwsh scripts/push-changelog.ps1 -Message "Claude Code +N 筆、Codex CLI +N 筆、Codex App +N 筆"
     ```

   兩個腳本都會自動偵測「無變更」→ 不 commit、直接結束。push 成功後 Pages 約 1 分鐘內重建。

   **🚨 一律直接更新 main 分支：** 不要開 PR、不要把變更留在工作分支。push 腳本內部用 `git push origin HEAD:main` 把當前 commit 直接推到 `main`（與排程環境起始在哪個分支無關）。**不要自己另外開分支或發 PR。**

## 約束

- 所有新增內容必須繁中。
- **一律在 main 上作業並 push 到 main**，不開 PR、不留工作分支（用 push 腳本即可，它已處理）。
- 不要修改 Chart.js 的 `<script src=...>` 標籤。
- 不要刪舊條目、不要動既有手寫靈感卡。
- 不要 find-replace「Anthropic · 36 versions · ...」這類字串 — 已改為動態計算。
- 即使三來源都沒新版，仍要更新時間戳並執行 push 腳本（腳本會因有差異而 commit 時間戳）。
- **部分來源失敗時：跳過該來源、不要中止整個流程**，用成功的來源照常更新；summary 標註哪些來源失敗（例「Codex App 解析失敗，跳過」）。
- 三來源**都**解析失敗時：仍更新時間戳、執行 push 腳本，summary 寫「所有來源解析失敗，僅更新時間戳記」。

## 完成定義（DoD — 結束前自我檢查）

1. **去重**：每個陣列無重複 `v`，且只插入了嚴格新於原最前筆的條目。
2. **語法**：修改過的 `DATA_*` / `INSP_*` 區塊通過 parse / 括號平衡檢查。
3. **時間戳**：`<b id="lastRefreshed">` 已更新為 `YYYY-MM-DD HH:MM (Taipei)`。
4. **靈感卡**：合計 ≤ 2 張、同一 INSP_* ≤ 1 張，且皆含 `auto: true`。
5. **Push**：push 腳本回報 `pushed to main` 或 `no changes`（兩者皆為成功收尾）。
6. **Summary**：如實反映各來源新增筆數與失敗情形。
