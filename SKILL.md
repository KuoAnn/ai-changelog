---
name: install-cathay-ai-changelog
description: 在使用者的 Cowork 中一鍵安裝「AI Coding Tools 更新摘要」live artifact，內含 Claude Code / Codex App / Codex CLI 三個工具的 changelog 追蹤、6 角色切換器（iOS / Android / Backend / Designer / QA / PM）自動過濾應用靈感卡、每 2 天自動更新排程。當使用者說「安裝 AI changelog」「安裝 Cathay changelog」「裝 changelog dashboard」「執行這個 skill」「跑 install-cathay-ai-changelog」「set up the AI changelog artifact」或拖入此 .skill 檔並要求啟用時觸發。
---

# Cathay AI Coding Tools Changelog — 一鍵安裝（v1.1）

這是 Cathay AI Scrum Team 內部分享的安裝 skill。當被觸發時，請依以下步驟完成設定。**不要詢問使用者太多細節 — 直接執行，遇到選擇題才問。**

## 步驟 1：找到 bundle 的 HTML 檔案

此 skill 目錄內附 `claude-code-changelog-tw.html`。請用 `Glob` 工具搜尋 `**/claude-code-changelog-tw.html`（或檢視此 SKILL.md 同目錄）找到它的絕對路徑。

如果找不到該檔，告訴使用者「.skill 包裝有問題，請向 Charlie 重拿一份」並停止。

## 步驟 2：複製到使用者工作目錄

把 HTML 複製到一個寫得了、會持續存在的位置。優先順序：
1. 若使用者有選定的 Cowork 資料夾，放那邊
2. 否則放 `~/Documents/Claude/Projects/` 下建立 `Cathay AI Changelog/` 子資料夾並放進去
3. 否則用 outputs 目錄

用 bash `cp` 或 Write 工具完成複製。

## 步驟 3：建立 artifact

呼叫 `mcp__cowork__create_artifact`：

- **id**: `cathay-ai-changelog`
- **html_path**: 步驟 2 複製到的絕對路徑
- **description**: `Cathay AI Scrum：Claude Code / Codex App / Codex CLI 三工具 changelog，6 角色切換靈感卡（iOS / Android / Backend / Designer / QA / PM），每 2 天自動更新。`

不需要在 `mcp_tools` 參數列出工具 — HTML 本身只用 Chart.js（已內含 CDN script），不呼叫任何 MCP tool。

## 步驟 4：詢問是否要設定每 2 天自動更新

問使用者一個是非題：

> 「要不要設定每 2 天自動抓三個官方 changelog 並更新 artifact？建議要，這樣每次打開都看到新內容。」

### 若使用者同意：

呼叫 `mcp__scheduled-tasks__create_scheduled_task`：

- **taskId**: `refresh-cathay-ai-changelog`
- **description**: `每 2 天 09:00 自動抓三個來源（Claude Code HTML、Codex CLI GitHub API、Codex App RSS）更新 cathay-ai-changelog artifact`
- **cronExpression**: `0 9 */2 * *`
- **prompt**: 完整貼下面這段 ⬇️

```
你的目標：刷新 Cowork 上 id 為 `cathay-ai-changelog` 的 live artifact，把三個 AI 編碼工具 changelog 的最新內容合併進去、產生少量「自動靈感卡」、並更新「最後更新」時間戳。所有新加入的內容都必須使用繁體中文，與既有條目風格一致。

== 背景 ==
artifact 內三個 Tab：Claude Code（DATA_CC、INSP_CC）、Codex App（DATA_CA、INSP_CA）、Codex CLI（DATA_CI、INSP_CI）。
Hero 的 Date Span、Total Versions、Tab meta 都由 JS 動態計算 — 不要去動那些靜態字串。

== 步驟 ==

1) **不要直接 Read `mcp__cowork__list_artifacts` 回的 path**（那個是 `~/Documents/Claude/Artifacts/...`，沙箱訪問不到）。改 Read **使用者的 Cowork workspace folder 內的 HTML**（通常在 `~/Documents/Claude/Projects/Cathay AI Changelog/claude-code-changelog-tw.html`，或他們安裝時 Claude 複製到的位置）。如果使用者沒有 workspace folder，用 `mcp__cowork__list_artifacts` 找路徑後嘗試 Read；若 Read 失敗就放棄此次 run、只更新時間戳。

`mcp__cowork__list_artifacts` 只用來確認 artifact id 存在 + 拿來給 `update_artifact` 用。

2) 三個來源各自抓 — 不同來源用不同策略（這些是經驗證最可靠的）：

   2a) Claude Code（DATA_CC）：
   - `mcp__workspace__web_fetch` 抓 `https://code.claude.com/docs/en/changelog`
   - 若超過 token 上限會自動寫到 temp 檔；用 Read + offset/limit 分塊讀

   2b) Codex CLI（DATA_CI）— 抓 GitHub API（權威來源）：
   - `mcp__workspace__web_fetch` 抓 `https://api.github.com/repos/openai/codex/releases?per_page=30`
   - 回傳 JSON
   - 只挑 stable 版（`prerelease: false`），跳過 alpha
   - 用 `tag_name` 抓版本（例 `rust-v0.136.0`，取 `0.136.0` 部分）
   - 用 `published_at` 抓日期、`body` 抓 release notes Markdown 整理成繁中

   2c) Codex App（DATA_CA）— 抓 RSS feed（避開 stale CDN）：
   - 用 `mcp__workspace__bash` 跑 `curl -s -A 'Mozilla/5.0' 'https://developers.openai.com/codex/changelog/rss.xml'`（web_fetch 對此 XML 會回傳 binary 失效）
   - RSS 太大會自動寫到 temp 檔；用 grep / awk / python 切出 `<item>` 區塊
   - 只挑 link/guid 含 `-app` 的 entries（這是 Codex App-specific）
   - 從 `<title>`、`<pubDate>`、`<description>`（HTML-encoded）抓內容
   - 描述風格保留英文 feature 名、用 <code> 包指令、<b> 強調

3) 對每個來源，找出對應陣列已有 `v` 沒覆蓋的條目。整理成繁中後插入陣列「最前面」（陣列維持新到舊順序）。不可刪舊條目。條目結構：
   - DATA_CC: { v, date, cat, body } cat ∈ {Subagents/Skills, Plugins/MCP, Hooks, Slash Commands, IDE/Editor, Settings/Config, Permissions/Security, UI/UX, Performance/Bug Fix}
   - DATA_CA: { v, date, cat, title, body } cat ∈ {Models/Inference, IDE/Editor, UI/UX, Performance/Bug Fix, Cloud/Web, MCP/Tools} — 對 Codex App 用 v: "YYYY-MM-DD" 格式
   - DATA_CI: { v, date, cat, title, body } cat ∈ {Models/Inference, MCP/Tools, Local Sandbox, Slash Commands, UI/UX, Permissions/Security, Performance/Bug Fix, Plugins/MCP}

**🚨 嚴格規則：**
1. 一律用 Edit 工具 surgical 替換，**禁止用 Write 重寫整檔**（HTML 已 160KB+，Write 會走 chunked 模式跑超時且風險高）
2. **檔案路徑用 workspace folder 的**，**不要用 `list_artifacts` 回的 `~/Documents/Claude/Artifacts/...`**（那個沙箱訪問不到）

4) 自動生成靈感卡（每次最多 3 張，每個 INSP_* 最多 1 張）— 嚴格節制。只在新版本有明確破天荒功能時產（新 slash command、新模型、新功能類別首發）。

生卡觸發條件（盡可能廣）：
✓ 生卡：新 slash / sub-command、新模型 / fast mode / effort 等級、新 hook 類型 / sandbox 模式 / plugin 能力、新環境變數 / 設定鍵、新工具（MCP tool、CLI subcommand）、新 UI 元素 / 互動模式、改名 / 重新設計（例 /simplify → /code-review）、Breaking change 或預設行為變動、平台支援擴展（Windows 正式版、新 IDE 整合）、任何 changelog 寫成「new」「introducing」「now」「supports」的條目
✗ 跳過：純內部 refactor / dependency upgrade、Bug fix（除非安全 / 嚴重 regression）、文件 typo 修正、重複內容

品質下限：每張卡都要有完整 desc + scen + d（Why / Setup / Tips），能套到 1 個有意義 Cathay 情境（iOS、Android、銀行、Sprint）。寫不出來就跳過 — 寧缺勿濫優先於數量上限。

對挑中的每筆，往對應 INSP_* 陣列末尾 push 一個新 object，必須包含 `auto: true`：

INSP_CC.push({
  ico: "<1-2 字 emoji>",
  color: "<purple|blue|orange|green|red|gold|teal 擇一>",
  feat: "<短標題（含原英文 feature 名）>",
  ver: "<vX.Y.Z · YYYY-MM-DD>",
  desc: "<1-2 句說明這功能做什麼>",
  scen: "<b>Cathay 場景：</b><帶入 iOS/Android/銀行/Sprint 情境的應用建議>",
  roles: [<從 ios/android/backend/designer/qa/pm 擇相關 1-4 個>],
  d: [
    { h: "為什麼有用", p: "<繁中段落>" },
    { h: "設定 / 操作", c: "<bash|json|yaml|toml>", b: "<可貼上的程式碼或命令>" },
    { h: "小技巧", l: ["<bullet 1>", "<bullet 2>"] }
  ],
  auto: true
});

5) 更新時間戳 — **必須含時、分、台北時區 suffix**：

   先取台北時間：`bash TZ=Asia/Taipei date '+%Y-%m-%d %H:%M'`

   Edit anchor：
   - old_string: `<b id="lastRefreshed">舊時間 (Taipei)</b>` （從步驟 1 讀到的 HTML 拿，例如 `<b id="lastRefreshed">2026-06-02 15:11 (Taipei)</b>`）
   - new_string: `<b id="lastRefreshed">{今天台北時間} (Taipei)</b>` 

   **格式必須是 `YYYY-MM-DD HH:MM (Taipei)`**，含分鐘、含 (Taipei) suffix。

6) 寫回檔案（步驟 1 拿到的原 path）。

7) 呼叫 mcp__cowork__update_artifact：
   - id: `cathay-ai-changelog`
   - html_path: 同上 path
   - update_summary（繁中）— 三個來源都要明確報告檢查結果，不要靜默跳過：
     - 例：`自動更新（2026-06-02）：Claude Code +2 筆、Codex CLI（GitHub API）+1 筆、Codex App（RSS）+3 筆`
     - 例：`自動排程（2026-06-02）：Claude Code ✓、Codex CLI ✓、Codex App ✓ 均無新版本，僅更新時間戳記`
     - 某來源失敗：`自動更新（YYYY-MM-DD）：Claude Code +1 筆、Codex CLI（GitHub API）+1 筆、Codex App RSS 解析失敗`

== 約束 ==
- 所有新增內容必須繁中。
- 不要修改 Chart.js 的 `<script src=...>` 標籤（保持 integrity / crossorigin 屬性原樣）。
- 不要刪舊條目、不要動既有手寫靈感卡。
- 不要去 find-replace「Anthropic · 36 versions · ...」這類字串 — 它們已改為動態計算。
- 自動卡每次最多新增 2 張（每個 INSP_* 最多 1 張）。
- 若三個來源都解析失敗，仍要更新時間戳並 update_artifact，summary 寫「自動排程（YYYY-MM-DD）：所有來源解析失敗，僅更新時間戳記」。
```

### 若使用者不要排程：

跳過 — 之後他們仍可在 artifact 右上角點「↻ 立即更新」按鈕（但因為沒有排程任務存在，按鈕會顯示錯誤，記得告訴他們）。

## 步驟 5：完成提示

告訴使用者：

> ✓ 安裝完成！
>
> 在 Cowork sidebar 找到「Cathay AI Changelog」artifact 並打開。
>
> **第一次打開要做的事：**
> 1. 頂端「我的角色」chip 選自己的角色（iOS / Android / Backend / Designer / QA / PM）
> 2. 看「01 應用靈感」區域 — 已自動過濾成你的角色相關卡片，標題會跟著動（例：選 Android RD → 「Android RD 應用靈感」）
> 3. 點任一張卡可看詳細範例（含可複製的 JSON / YAML / Bash 設定）
> 4. 看到 🆕 auto 徽章的卡片代表是排程自動生成的，可看作起點不完美
>
> **要 trigger 即時更新：** 右上角「↻ 立即更新」按鈕。或等排程每 2 天 09:00 自動跑。
>
> **有問題：** Slack DM Charlie 或 #ai-scrum 頻道。

## 步驟 6：建議：先 pre-approve 工具

提醒使用者：「第一次排程跑時會出現幾個工具權限對話框（`web_fetch`、`bash` 用於 curl RSS、`update_artifact`）。**請選「Always allow」而非「Allow once」**，之後排程跑就完全無人值守。」

## 錯誤處理

- **HTML 找不到**：包裝壞了，請使用者重拿 .skill
- **create_artifact 失敗**：可能 id 已存在，改用 `update_artifact` 並提示使用者
- **create_scheduled_task 失敗**：跳過排程設定，繼續走步驟 5，告訴使用者排程功能不可用，可改用「立即更新」按鈕
- **任何其他錯誤**：用繁體中文清楚說明錯在哪、建議使用者怎麼做（重試 / 聯絡 Charlie）
