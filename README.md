# AI Changelog

繁中靜態頁面，整理 Claude 與 Codex **四個產品面向**的官方 changelog，並提供 iOS、Android、Backend、Designer、QA、PM 六種角色的應用靈感卡。

追蹤的四個產品面向：

| 產品面向 | 說明 | 資料位置 |
| --- | --- | --- |
| Claude Code CLI | Anthropic 的 CLI 工具 | [`data/changelog-data.js`](data/changelog-data.js) → `DATA_CC` |
| Claude Desktop | Anthropic 桌面應用程式（build 版本 `1.x`，內含 Chat / Cowork / Code） | [`data/claude-desktop.json`](data/claude-desktop.json) |
| Codex CLI | OpenAI 的 CLI 工具 | [`data/changelog-data.js`](data/changelog-data.js) → `DATA_CI` |
| Codex App / ChatGPT Desktop | OpenAI 的桌面 App（已併入 ChatGPT Desktop） | [`data/changelog-data.js`](data/changelog-data.js) → `DATA_CA` |

四個來源在頁面上各有**固定不變的 EVA 機體編號**（依加入時間配發，既有編號永不重新分配）：

| 機體 | 來源 | 儀表板 MAGI 節點 |
| --- | --- | --- |
| **EVA00 零號機** | Claude Code | MELCHIOR-1 |
| **EVA01 壹號機** | Codex App / ChatGPT Desktop | BALTHASAR-2 |
| **EVA02 貳號機** | Codex CLI | CASPER-3 |
| **EVA03 參號機** | Claude Desktop | MELCHIOR-1 |

MAGI 三賢者依 EVA 設定固定三節點，所以節點語意是**產品線群組**而非 1:1 產品：MELCHIOR-1 同時承載 Anthropic 的兩條線（節點內列出 EVA00 與 EVA03 兩台機體的分項筆數），四個產品都在儀表板上，沒有任何一個被排除。

每台機體都會顯示**同步率**，由兩軸取較差值（不疊加）：

1. **資料新鮮度** — 10 日內以新鮮度（每日遞減 10%）加上近 14 日更新動能（每筆額外更新 +6%、最高 +60%）計算，因此密集更新時可超過 `100%`；超過 10 日臨界值後直接跌為負數（每逾期一日 -12%，下限 -120%）並亮 **精神汙染**。
2. **抓取健康度** — 讀 `data/changelog-data.js` 的 `REFRESH_RUN`（每次排程重寫）。資料再新，只要**最近一次排程沒抓到該來源**就一樣壓成負值：`transient`（連線失敗／timeout／API 額度耗盡，可重試）**-24%** 亮 **鏈路中斷**；`blocked`（Cloudflare／環境網路政策阻擋，非暫時性）**-48%** 亮 **鏈路封鎖**。兩個罰則都用「等同資料逾期 N 日」換算，與新鮮度共用同一把尺。

任一軸為負就把 HUD 的 `PATTERN` 由 `BLUE` 轉 `RED`。警報列永遠保留：有異常時列出失聯機體與失敗診斷（`ALERT LV.1` 資料逾期或 ≥2 台鏈路異常／`LV.2` 單台非暫時性阻擋／`LV.3` 單台可重試失敗）；全部正常時才顯示清楚標示「演習／無實質意義」的裝飾性警告（`LV.0`）。

> Claude Code CLI 與 Claude Desktop 是**兩個不同產品**，資料刻意分開存放，Desktop 版本不會混入 `DATA_CC`。
> 另外 **Claude Desktop ≠ Claude Apps**：`Claude Apps` 是 Anthropic 對 web／desktop／iOS／Android 的傘狀稱呼、**沒有版本號**（[Claude Apps Release Notes](https://support.claude.com/en/articles/12138966-release-notes) 依日期分段）；本站追蹤的是可版本化的 **Desktop build**（[Cowork changelog](https://claude.com/docs/cowork/changelog)，自述 `Release notes for Claude Desktop`）。同一天兩邊內容不同，不是同一份資料。

線上版：<https://kuoann.github.io/ai-changelog/>

## 內容

- 合併時間軸：四個來源合併成單一時間軸，可依 AI Agent 與分類篩選；Claude Desktop 條目另帶 severity 徽章
- 角色切換：依職能篩出較相關的應用靈感卡
- 靈感卡詳情：包含用途、設定範例、實戰技巧與 code copy
- 時間軸：支援分類篩選、關鍵字搜尋、分頁載入
- 最後更新時間：由排程更新後寫入靜態 HTML

## 本機查看

這是純靜態頁，不需要安裝依賴；資料層 `data/changelog-data.js` 以 `<script src>` 載入（非 `fetch`），所以 `file://` 直開也能動。

直接用瀏覽器開啟：

```text
index.html
```

## 自動更新

內容由 Claude Code 遠端排程維護。排程會抓四個產品面向的官方來源，更新 `data/changelog-data.js` 與 `data/claude-desktop.json`（`index.html` 只碰時間戳），再 commit 並 push 到 `main`，觸發 GitHub Pages 重建。

```text
排程觸發 -> 讀 update-sources.json -> 取來源快照（見下）-> 更新資料檔 -> commit/push -> Pages 重建
```

官方來源：

| 產品 | 主要來源 | 備援／補充來源 |
| --- | --- | --- |
| Claude Code | GitHub Releases API | Atom、CHANGELOG.md、官方 Changelog、What's New |
| Claude Desktop | Cowork changelog.md | HTML Changelog、Claude Apps Release Notes（僅補充，無版本號） |
| Codex CLI | GitHub Releases API | Atom、Codex RSS 中的 `#github-release-` |
| Codex App / ChatGPT Desktop | Codex RSS 的 App 項目 | Codex Changelog、OpenAI Product Release Notes |

所有來源、優先順序、版本過濾與通知重要性規則集中定義於 [`scripts/update-sources.json`](scripts/update-sources.json)。

抓取策略：每個產品依 `sources[].priority` 由小到大嘗試，`version-primary` 成功即停，`version-fallback` 只在 primary 失敗時使用；enrichment 類來源只補摘要與重要性判定，不建立版本條目。沒有 `GITHUB_TOKEN` / `GH_TOKEN` 時不打未授權的 GitHub API，直接退到 Atom。

排程設定與 agent 指示集中在 [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md)。

### 來源快照（繞過雲端排程的網路封鎖）

排程跑在 Claude Code 雲端沙箱，出口有兩層封鎖擋住大部分官方來源（實測 2026-08-02，細節見 manifest 的 `cloudSandbox`）：

| 封鎖類型 | 影響網域 | 說明 |
| --- | --- | --- |
| session-binding | `api.github.com`、`github.com` | 沙箱的 GitHub 代理只放行該 session 掛載的 repo，**帶 token 也擋** |
| egress-policy | `claude.com`、`support.claude.com`、`learn.chatgpt.com`、`developers.openai.com`、`openai.com` | 組織 egress 政策在 CONNECT 階段拒絕 |

GitHub Actions runner 沒有這兩層限制，所以改由 Actions 代抓：

```text
每 12 小時 -> fetch-snapshots.mjs 依 manifest 抓所有來源原文 -> force push 到 data-snapshots 分支
排程觸發 -> sync-snapshots.sh 取回快照 -> 照原本的 priority / role 規則解析 -> 更新資料檔
```

- 快照分支是**孤兒分支、每次 force push 覆蓋**（單一 commit、無歷史），不進 `main`、不觸發 Pages 重建、repo 體積不隨時間膨脹。
- 快照只存 **HTTP body 原文**，不做任何解析 — 解析規則仍只有 [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) 一份，不會 CI 與排程各寫一套而漂移。唯一的例外是 `snapshotDropFields`（與內容無關的體積裁切）：releases API 的 `assets` 陣列佔 openai/codex 回應的 98.7%（8.07MB → 108KB）而排程完全用不到，故不收；被裁切的條目在 `index.json` 帶 `prunedFields` 與 `rawBytes`。
- `index.json` 逐筆記錄 `ok` / `httpStatus` / `bytes` / `errorClass`，排程據此決定退哪一層 fallback、以及頁面警報列要顯示的 `blocked` / `transient`。
- 抓取排在 UTC 00:00 / 12:00（台北 08:00 / 20:00），`00:00` 那班刻意落在排程當天第一輪之前。GitHub 排程實測會延遲最多約 1 小時。
- 快照超過 `snapshots.staleAfterHours`（16 小時；＝12 小時週期＋延遲的餘裕，漏跑一輪才會觸發）未更新，排程會把受影響來源記為 `transient` 並在頁面標示，不會假裝資料是新的。**調整 cron 時必須一起評估這個門檻**，否則正常的快照會被誤判為過期。
- 本機也可手動跑：`node scripts/fetch-snapshots.mjs`（輸出到已 gitignore 的 `.snapshots/`）。

## 更新通知（Telegram / Slack）

當 `data/changelog-data.js` 有**實際內容更新**（新增 `DATA_*` 版本條目或 `INSP_*` 靈感卡），或 `data/claude-desktop.json` 新增 `"notify": true` 的 Claude Desktop 條目時，會自動發通知到 Telegram 與 Slack。通知會列出每筆新增版本／靈感卡的來源、名稱與短摘要；Claude Desktop 條目另含版本、日期、severity、標題與摘要。只更新同步時間戳（`<b id="lastRefreshed">` 或 JSON 的 `lastRefreshed`）的 commit **不會**觸發。

```text
push 到 main -> workflow 比對 diff / JSON 差集 -> 判定是否有新版本/靈感卡 -> 發 Telegram / Slack
```

Claude Desktop 的通知門檻由資料本身控制：排程依 `scripts/update-sources.json` 的重要性規則寫入 `severity`（`critical` / `high` / `medium` / `low`）與 `notify`；只有 `notify: true` 才會發送（critical、high 一律通知，有實質使用者影響的 medium 才通知，low 不通知）。

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

兩個腳本都會先同步 `origin/main`，stage `index.html`、`data/changelog-data.js`、`data/claude-desktop.json`、`scripts/update-sources.json`，有變更才 commit，最後 push 到 `main`；沒有變更時直接 no-op 結束。

## 主要檔案

| 檔案 | 說明 |
| --- | --- |
| [`index.html`](index.html) | 主頁面（兼 GitHub Pages 入口），包含版面、樣式與互動邏輯 |
| [`data/changelog-data.js`](data/changelog-data.js) | 資料層：`DATA_*` 版本條目與 `INSP_*` 靈感卡（排程更新的主要目標） |
| [`scripts/update-sources.json`](scripts/update-sources.json) | Claude / Codex CLI 與 App 的官方來源、備援策略、版本過濾及通知分級 |
| [`data/claude-desktop.json`](data/claude-desktop.json) | Claude Desktop 的獨立版本資料（`DATA_CD` 的來源） |
| [`scripts/build-claude-desktop.mjs`](scripts/build-claude-desktop.mjs) | 把 `data/claude-desktop.json` 內嵌成 `data/changelog-data.js` 的 `DATA_CD`（冪等，支援 `--check`） |
| [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) | 排程 agent 的完整刷新指示 |
| [`scripts/fetch-snapshots.mjs`](scripts/fetch-snapshots.mjs) | 依 manifest 抓所有官方來源原文＋`index.json`（Actions 端執行，不解析內容） |
| [`scripts/sync-snapshots.sh`](scripts/sync-snapshots.sh) | 排程端取回快照分支到 `/tmp/ai-changelog-snapshots` 並印出健康摘要 |
| [`.github/workflows/fetch-source-snapshots.yml`](.github/workflows/fetch-source-snapshots.yml) | 每 12 小時抓來源快照並 force push 到 `data-snapshots` 分支的 workflow |
| [`scripts/push-changelog.ps1`](scripts/push-changelog.ps1) | Windows 手動 commit/push 腳本 |
| [`scripts/push-changelog.sh`](scripts/push-changelog.sh) | Linux/遠端排程 commit/push 腳本 |
| [`.github/workflows/notify-on-update.yml`](.github/workflows/notify-on-update.yml) | 實際更新時發 Telegram / Slack 通知的 workflow |
| [`favicon.svg`](favicon.svg) | 分頁圖示（NERV 紋章葉形版）；`index.html` 另以 data URI 內嵌同一份，維持零外部請求 |
| [`favicon.ico`](favicon.ico) | Windows 釘選／舊瀏覽器用；正方尺寸階梯 16／24／32／48／64，未滿 48px 用葉形版，48px 起用含 NERV 字樣的完整版 |

## 編輯提示

Claude Desktop 的資料在 `data/claude-desktop.json`（`entries` 陣列，最新在最前面，每筆含 `version`、`date`、`severity`、`notify`、`title`、`summary`、`categories`），頁面上的 `DATA_CD` 由 [`scripts/build-claude-desktop.mjs`](scripts/build-claude-desktop.mjs) 從該 JSON 產生 — **改資料請改 JSON 再跑產生器，不要直接改 `DATA_CD`**：

```bash
node scripts/build-claude-desktop.mjs          # 產生／更新 data/changelog-data.js 的 DATA_CD
node scripts/build-claude-desktop.mjs --check  # 只檢查是否同步（不寫檔）
```

之所以 build-time 內嵌而不是 runtime `fetch`：頁面要能直接用瀏覽器開（`file://`），而 `file://` 下 `fetch` 會被 CORS 擋掉。內容分佈：

| 內容 | 位置 |
| --- | --- |
| changelog 資料 | `data/changelog-data.js` → `DATA_CC`、`DATA_CA`、`DATA_CI`、`DATA_CD`（產物） |
| 靈感卡 | `data/changelog-data.js` → `INSP_CC`、`INSP_CA`、`INSP_CI`、`INSP_CD`（目前為空） |
| EVA 編號／MAGI 分組 | `index.html` → `AGENTS`（`eva` 欄位）、`MAGI_GROUPS` |
| 同步率／精神汙染 | `index.html` → `EVA_STALE_DAYS`、`evaFreshness()`、`evaUnitStatus()`、`renderEvaUnits()` |
| 抓取健康度／鏈路警報 | `data/changelog-data.js` → `REFRESH_RUN`；`index.html` → `EVA_LINK_FAULT`、`evaLinkFault()`、`initDeck()` 的警報列 |
| 角色定義 | `index.html` → `ROLES` |
| 卡片渲染／Modal | `index.html` → `renderInspiration()`、`openModal(card)` |

版面（`index.html`）與資料（`data/`）分離：排程只動資料檔，token 成本與誤改版面的風險都大幅下降；頁面本體仍是零依賴靜態檔，方便離線分享與 GitHub Pages 發佈。
