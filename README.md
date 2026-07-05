# AI Changelog

繁中靜態頁面，整理 Claude Code、Codex App、Codex CLI 的官方 changelog，並提供 iOS、Android、Backend、Designer、QA、PM 六種角色的應用靈感卡。

線上版：<https://kuoann.github.io/ai-changelog/>

## 內容

- 三個 changelog 分頁：Claude Code、Codex App、Codex CLI
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

內容由 Claude Code 遠端排程維護。排程會抓三個官方來源，更新 `index.html`，再 commit 並 push 到 `main`，觸發 GitHub Pages 重建。

```text
排程觸發 -> 抓官方 changelog -> 更新 HTML -> commit/push -> Pages 重建
```

官方來源：

| 分頁 | 來源 |
| --- | --- |
| Claude Code | `https://code.claude.com/docs/en/changelog` |
| Codex App | `https://developers.openai.com/codex/changelog/rss.xml` |
| Codex CLI | `https://api.github.com/repos/openai/codex/releases` |

排程設定與 agent 指示集中在 [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md)。

## 更新通知（Telegram / Slack）

當 `index.html` 有**實際內容更新**（新增 `DATA_*` 版本條目或 `INSP_*` 靈感卡）時，會自動發通知到 Telegram 與 Slack；只更新同步時間戳（`<b id="lastRefreshed">`）的 commit **不會**觸發。

```text
push 到 main -> workflow 比對 diff -> 判定是否有新版本/靈感卡 -> 發 Telegram / Slack
```

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

兩個腳本都會先同步 `origin/main`，有變更才 commit，最後 push 到 `main`。

## 主要檔案

| 檔案 | 說明 |
| --- | --- |
| [`index.html`](index.html) | 主頁面（兼 GitHub Pages 入口），包含資料、樣式與互動邏輯 |
| [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) | 排程 agent 的完整刷新指示 |
| [`scripts/push-changelog.ps1`](scripts/push-changelog.ps1) | Windows 手動 commit/push 腳本 |
| [`scripts/push-changelog.sh`](scripts/push-changelog.sh) | Linux/遠端排程 commit/push 腳本 |
| [`.github/workflows/notify-on-update.yml`](.github/workflows/notify-on-update.yml) | 實際更新時發 Telegram / Slack 通知的 workflow |

## 編輯提示

主資料都在 `index.html`：

| 內容 | HTML 內位置 |
| --- | --- |
| changelog 資料 | `DATA_CC`、`DATA_CA`、`DATA_CI` |
| 靈感卡 | `INSP_CC`、`INSP_CA`、`INSP_CI` |
| 角色定義 | `ROLES` |
| 卡片渲染 | `renderInspirationCards()` |
| Modal 邏輯 | `openModal(card)` |

目前刻意維持單一 HTML，方便離線分享與 GitHub Pages 發佈。
