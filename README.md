# AI Changelog

繁中靜態頁面，整理 Claude 與 Codex **四個產品面向**的官方 changelog，並提供 iOS、Android、Backend、Designer、QA、PM 六種角色的應用靈感卡。

追蹤的四個產品面向：

| 產品面向 | 說明 | 資料位置 |
| --- | --- | --- |
| Claude Code CLI | Anthropic 的 CLI 工具 | `index.html` → `DATA_CC` |
| Claude Desktop / Claude App | Anthropic 的桌面／App 版本 | [`data/claude-app.json`](data/claude-app.json) |
| Codex CLI | OpenAI 的 CLI 工具 | `index.html` → `DATA_CI` |
| Codex App / ChatGPT Desktop | OpenAI 的桌面 App（已併入 ChatGPT Desktop） | `index.html` → `DATA_CA` |

> Claude Code CLI 與 Claude Desktop App 是**兩個不同產品**，資料刻意分開存放，Desktop 版本不會混入 `DATA_CC`。
> 目前頁面上的時間軸顯示 Claude Code、Codex App、Codex CLI 三組；Claude Desktop / App 先作為獨立的更新與通知資料源，UI 整合另開任務處理。

線上版：<https://kuoann.github.io/ai-changelog/>

## 內容

- 合併時間軸：Claude Code、Codex App、Codex CLI（Claude App 資料獨立於 `data/claude-app.json`）
- 角色切換：依職能篩出較相關的應用靈感卡
- 靈感卡詳情：包含用途、設定範例、實戰技巧與 code copy
- 時間軸：支援分類篩選、關鍵字搜尋、分頁載入
- 最後更新時間：由排程更新後寫入靜態 HTML

## 本機查看

這是 self-contained 靜態頁，不需要安裝依賴。

直接用瀏覽器開啟：

```text
index.html
```

## 自動更新

內容由 Claude Code 遠端排程維護。排程會抓四個產品面向的官方來源，更新 `index.html` 與 `data/claude-app.json`，再 commit 並 push 到 `main`，觸發 GitHub Pages 重建。

```text
排程觸發 -> 讀 update-sources.json -> 抓官方 changelog -> 更新 HTML / JSON -> commit/push -> Pages 重建
```

官方來源：

| 產品 | 主要來源 | 備援／補充來源 |
| --- | --- | --- |
| Claude Code | GitHub Releases API | Atom、CHANGELOG.md、官方 Changelog、What's New |
| Claude Desktop / App | Cowork changelog.md | HTML Changelog、Claude Apps Release Notes、Desktop Code Changelog |
| Codex CLI | GitHub Releases API | Atom、Codex RSS 中的 `#github-release-` |
| Codex App / ChatGPT Desktop | Codex RSS 的 App 項目 | Codex Changelog、OpenAI Product Release Notes |

所有來源、優先順序、版本過濾與通知重要性規則集中定義於 [`scripts/update-sources.json`](scripts/update-sources.json)。

抓取策略：每個產品依 `sources[].priority` 由小到大嘗試，`version-primary` 成功即停，`version-fallback` 只在 primary 失敗時使用；enrichment 類來源只補摘要與重要性判定，不建立版本條目。沒有 `GITHUB_TOKEN` / `GH_TOKEN` 時不打未授權的 GitHub API，直接退到 Atom。

排程設定與 agent 指示集中在 [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md)。

## 更新通知（Telegram / Slack）

當 `index.html` 有**實際內容更新**（新增 `DATA_*` 版本條目或 `INSP_*` 靈感卡），或 `data/claude-app.json` 新增 `"notify": true` 的 Claude App 條目時，會自動發通知到 Telegram 與 Slack。通知會列出每筆新增版本／靈感卡的來源、名稱與短摘要；Claude App 條目另含版本、日期、severity、標題與摘要。只更新同步時間戳（`<b id="lastRefreshed">` 或 JSON 的 `lastRefreshed`）的 commit **不會**觸發。

```text
push 到 main -> workflow 比對 diff / JSON 差集 -> 判定是否有新版本/靈感卡 -> 發 Telegram / Slack
```

Claude App 的通知門檻由資料本身控制：排程依 `scripts/update-sources.json` 的重要性規則寫入 `severity`（`critical` / `high` / `medium` / `low`）與 `notify`；只有 `notify: true` 才會發送（critical、high 一律通知，有實質使用者影響的 medium 才通知，low 不通知）。

機制在 [`.github/workflows/notify-on-update.yml`](.github/workflows/notify-on-update.yml)，偵測完全靠 `git diff`，與排程 agent 解耦（agent 與 push 腳本無需改動）。

兩個管道各自獨立：**沒設定對應 secret 的管道會自動略過、只寫進 workflow log，不會報錯、也不會讓 workflow 失敗** — 可只啟用其中一個，或兩個都開。

啟用前在 GitHub repo → **Settings → Secrets and variables → Actions → Secrets** 設定：

| 名稱 | 管道 | 說明 / 怎麼拿 |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Telegram | BotFather 給的 token。Telegram 找 `@BotFather` → `/newbot` 建立取得 |
| `TELEGRAM_CHAT_ID` | Telegram | 收訊對象 id。先對 bot 傳一則訊息，再開 `https://api.telegram.org/bot<TOKEN>/getUpdates` 讀 `chat.id`（群組為負數；或用 `@userinfobot` 查） |
| `SLACK_WEBHOOK_URL` | Slack | Incoming Webhook URL。<https://api.slack.com/apps> → 你的 App → **Incoming Webhooks** → Add New Webhook → 選 channel → 複製 |

> 未設定的管道不發送、不報錯，只在該 step 的 log 記一行「未設定，跳過」。只有「已設定但送出失敗」（HTTP 非 200）才會讓該 step 失敗，方便及早發現真正的問題。

設定完成後，可到 **Actions → Notify on real update → Run workflow** 手動觸發，會發一則 🧪 測試通知，驗證設定正確。

## 手動推送

如果已經手動改好 HTML，可以執行：

```powershell
pwsh scripts/push-changelog.ps1 -Message "手動更新"
```

Linux / 遠端排程使用：

```bash
bash scripts/push-changelog.sh "手動更新"
```

兩個腳本都會先同步 `origin/main`，stage `index.html`、`data/claude-app.json`、`scripts/update-sources.json`，有變更才 commit，最後 push 到 `main`；沒有變更時直接 no-op 結束。

## 主要檔案

| 檔案 | 說明 |
| --- | --- |
| [`index.html`](index.html) | 主頁面（兼 GitHub Pages 入口），包含資料、樣式與互動邏輯 |
| [`scripts/update-sources.json`](scripts/update-sources.json) | Claude / Codex CLI 與 App 的官方來源、備援策略、版本過濾及通知分級 |
| [`data/claude-app.json`](data/claude-app.json) | Claude Desktop / Claude App 的獨立版本資料 |
| [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) | 排程 agent 的完整刷新指示 |
| [`scripts/push-changelog.ps1`](scripts/push-changelog.ps1) | Windows 手動 commit/push 腳本 |
| [`scripts/push-changelog.sh`](scripts/push-changelog.sh) | Linux/遠端排程 commit/push 腳本 |
| [`.github/workflows/notify-on-update.yml`](.github/workflows/notify-on-update.yml) | 實際更新時發 Telegram / Slack 通知的 workflow |

## 編輯提示

Claude Desktop / App 的資料在 `data/claude-app.json`（`entries` 陣列，最新在最前面，每筆含 `version`、`date`、`severity`、`notify`、`title`、`summary`、`categories`）。其餘主資料都在 `index.html`：

| 內容 | HTML 內位置 |
| --- | --- |
| changelog 資料 | `DATA_CC`、`DATA_CA`、`DATA_CI` |
| 靈感卡 | `INSP_CC`、`INSP_CA`、`INSP_CI` |
| 角色定義 | `ROLES` |
| 卡片渲染 | `renderInspirationCards()` |
| Modal 邏輯 | `openModal(card)` |

目前刻意維持單一 HTML，方便離線分享與 GitHub Pages 發佈。
