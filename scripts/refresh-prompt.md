# 自動刷新 prompt — AI Changelog GitHub Page

> 這份 prompt 給 **Claude Code 排程 (schedule / cron)** 使用。每次觸發時，agent 會抓三個官方 changelog、更新 repo 內的 HTML、然後 push 回 GitHub 讓 Pages 重建。
>
> **Repo：** `https://github.com/KuoAnn/ai-changelog`（遠端排程會自動 clone 一份）
> **要編輯的檔案：** repo 根目錄的 `claude-code-changelog-tw.html`
> **路徑慣例：** 一律用 **repo-relative** 路徑（例 `claude-code-changelog-tw.html`、`scripts/push-changelog.sh`），不要用任何本機絕對路徑——遠端環境是 Linux、工作目錄已是 repo 根。

---

你的目標：刷新 repo 根目錄的 `claude-code-changelog-tw.html`，把三個 AI 編碼工具 changelog 的最新內容合併進去、產生少量「自動靈感卡」、更新「最後更新」時間戳，最後 **commit 並 push** 讓 GitHub Page（<https://kuoann.github.io/ai-changelog/>）自動重建。所有新加入的內容都必須使用繁體中文，與既有條目風格一致。

== 背景 ==
HTML 內三個 Tab：Claude Code（DATA_CC、INSP_CC）、Codex App（DATA_CA、INSP_CA）、Codex CLI（DATA_CI、INSP_CI）。
Hero 的 Date Span、Total Versions、Tab meta 都由 JS 動態計算 — 不要去動那些靜態字串。

== 步驟 ==

1) **先同步 git**，避免 push 衝突：`git pull --rebase --autostash origin main`
   然後用 Read 工具讀 `claude-code-changelog-tw.html`（160KB+，可用 offset/limit 分塊讀需要的陣列區段）。

2) 三個來源各自抓 — 不同來源用不同策略（這些是經驗證最可靠的）：

   2a) Claude Code（DATA_CC）：
   - 用 WebFetch 抓 `https://code.claude.com/docs/en/changelog`

   2b) Codex CLI（DATA_CI）— 抓 GitHub API（權威來源）：
   - 用 WebFetch 抓 `https://api.github.com/repos/openai/codex/releases?per_page=30`
   - 只挑 stable 版（`prerelease: false`），跳過 alpha
   - 用 `tag_name` 抓版本（例 `rust-v0.136.0`，取 `0.136.0`）、`published_at` 抓日期、`body` 抓 release notes 整理成繁中

   2c) Codex App（DATA_CA）— 抓 RSS feed（避開 stale CDN）：
   - 用 Bash 跑 `curl -s -A 'Mozilla/5.0' 'https://developers.openai.com/codex/changelog/rss.xml'`
   - 只挑 link/guid 含 `-app` 的 entries
   - 從 `<title>`、`<pubDate>`、`<description>`（HTML-encoded）抓內容；保留英文 feature 名、用 <code> 包指令、<b> 強調

3) 對每個來源，找出對應陣列已有 `v` 沒覆蓋的條目。整理成繁中後插入陣列「最前面」（維持新到舊順序）。**不可刪舊條目。** 條目結構：
   - DATA_CC: { v, date, cat, body } cat ∈ {Subagents/Skills, Plugins/MCP, Hooks, Slash Commands, IDE/Editor, Settings/Config, Permissions/Security, UI/UX, Performance/Bug Fix}
   - DATA_CA: { v, date, cat, title, body } cat ∈ {Models/Inference, IDE/Editor, UI/UX, Performance/Bug Fix, Cloud/Web, MCP/Tools} — Codex App 用 v: "YYYY-MM-DD"
   - DATA_CI: { v, date, cat, title, body } cat ∈ {Models/Inference, MCP/Tools, Local Sandbox, Slash Commands, UI/UX, Permissions/Security, Performance/Bug Fix, Plugins/MCP}

   **🚨 一律用 Edit 工具 surgical 替換，禁止用 Write 重寫整檔**（HTML 已 160KB+）。

4) 自動生成靈感卡（每次最多 2 張，每個 INSP_* 最多 1 張）— 嚴格節制。只在新版本有明確破天荒功能時產（新 slash command、新模型、新功能類別首發）。寫不出有意義的應用情境就跳過，寧缺勿濫。

   往對應 INSP_* 陣列末尾 push 一個 object，必須含 `auto: true`：
   ```js
   INSP_CC.push({
     ico: "<emoji>", color: "<purple|blue|orange|green|red|gold|teal>",
     feat: "<短標題（含英文 feature 名）>", ver: "<vX.Y.Z · YYYY-MM-DD>",
     desc: "<1-2 句說明>",
     scen: "<b>場景：</b><帶入 Frontend(iOS/Android/Web)/銀行/Sprint 的應用建議>",
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

6) **Commit + push**（觸發 GitHub Pages 重建）：執行 push 腳本，把三來源檢查結果當 summary 傳入。

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

== 約束 ==
- 所有新增內容必須繁中。
- **一律在 main 上作業並 push 到 main**，不開 PR、不留工作分支（用 push 腳本即可，它已處理）。
- 不要修改 Chart.js 的 `<script src=...>` 標籤。
- 不要刪舊條目、不要動既有手寫靈感卡。
- 不要 find-replace「Anthropic · 36 versions · ...」這類字串 — 已改為動態計算。
- 即使三來源都沒新版，仍要更新時間戳並執行 push 腳本（腳本會因有差異而 commit 時間戳）。
- 三來源都解析失敗時：仍更新時間戳、執行 push 腳本，summary 寫「所有來源解析失敗，僅更新時間戳記」。
