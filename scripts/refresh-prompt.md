# 自動刷新 prompt — AI Changelog GitHub Page

> 給 **Claude Code 排程 (schedule / cron)** 使用。每次觸發：抓四個產品的官方 changelog → 更新資料檔 → 產生少量自動靈感卡 → 更新時間戳 → commit 並 push 到 `main`，讓 GitHub Pages（<https://kuoann.github.io/ai-changelog/>）重建。
>
> - **Repo：** `https://github.com/KuoAnn/ai-changelog`（遠端排程自動 clone；環境是 Linux、工作目錄即 repo 根）。路徑一律 **repo-relative**（例 `index.html`），不用本機絕對路徑。
> - **單一資訊源：** 所有官方 URL、優先順序、版本過濾、標題別名、重要性分級，唯一定義於 `scripts/update-sources.json`（下稱 **manifest**）。**🚨 禁止把來源 URL 寫死在本 prompt 或程式碼各處**；來源異動只改 manifest，本 prompt 只描述「怎麼用」。
> - **來源輸入走快照：** 沙箱連不到多數官方網域，來源改由 GitHub Actions 定時抓好推到快照分支。每輪先跑 `bash scripts/sync-snapshots.sh` 讀本地快照（步驟 3a），**快照可用時不要再 curl 官方來源**；快照不可用才退回 live 抓取（步驟 3b）。
> - 所有新增內容一律**繁體中文**，與既有條目風格一致。

## 產品與寫入目標（四產品彼此不可混用）

| 產品 | 寫入目標 | 版本形式 |
| --- | --- | --- |
| Claude Code CLI | `data/changelog-data.js` → `DATA_CC`、`INSP_CC` | CLI semver（`2.1.x`） |
| Claude Desktop | `data/claude-desktop.json` → `entries`（**獨立檔案**） | Desktop build（`1.24012.9`） |
| Codex CLI | `data/changelog-data.js` → `DATA_CI`、`INSP_CI` | CLI semver |
| Codex App / ChatGPT Desktop | `data/changelog-data.js` → `DATA_CA`、`INSP_CA` | 無版本號，`v` 用 `"YYYY-MM-DD"` |

前端規則（**動資料、不動版面**）：

- 版面與資料分離：`index.html` 是版面＋渲染邏輯，`data/changelog-data.js` 是資料層（classic script，`index.html` 以 `<script src>` 載入）。排程**只維護上表六個陣列＋JSON＋`REFRESH_RUN`**，前端 JS 會自行合併渲染，**🚨 不需要也不得動 `index.html` 的任何版面／邏輯**（唯一例外：步驟 9 的 `lastRefreshed` 時間戳）。
- **🚨 `REFRESH_RUN` 每次都要重寫**（步驟 9）：它是頁面警報列與 EVA 同步率的唯一異常來源。抓取失敗只寫進 commit summary 的話，**頁面永遠只會顯示「演習／無實質意義」的裝飾性警告**，看板上等於沒發生過。
- Hero 的 Date Span、Total Versions、Agents 數、Agent 篩選 chip 計數皆由 JS 動態計算 — 勿改那些靜態字串、勿動 `<script src="data/changelog-data.js">` 載入行。
- **🚨 `DATA_CD` 是產物，不可手改**：由 `scripts/build-claude-desktop.mjs` 從 `data/claude-desktop.json` 產生，寫在 `data/changelog-data.js` 的 `CLAUDE-DESKTOP-DATA:START/END` 標記間。改資料一律改 JSON 再跑產生器（步驟 8）。
- **EVA 機體編號固定不變**（依加入時間配發）：EVA00＝Claude Code、EVA01＝Codex App、EVA02＝Codex CLI、EVA03＝Claude Desktop；新增第五個來源取 `EVA04`，**不可重新分配既有編號**。
- **MAGI 三節點是產品線群組**（EVA 設定三賢者固定三個），非 1:1 產品：MELCHIOR-1 同收 Claude Code 與 Claude Desktop，四產品都在儀表板上。要加來源改 `MAGI_GROUPS`，**不可加第四個節點**。

## 步驟

### 1) 同步 git 與定位

- `git pull --rebase --autostash origin main`（此 pull 讓接下來 Read 到最新內容；push 腳本內部會再 pull 一次確保 fast-forward，兩者非冗餘）。
- `data/changelog-data.js` 200KB+ **勿整檔讀**：先 Grep `const DATA_CC` / `const DATA_CI` / `const DATA_CA` / `INSP_` 行號，再用 Read offset/limit 分塊讀。`data/claude-desktop.json` 很小，可整檔讀。`index.html` 只有步驟 9 時間戳需要碰。

### 2) 讀 manifest

排程開始先讀 `scripts/update-sources.json`：各產品 `sources[]`（priority、role、format、url、filters）、`stableVersionPattern`、`titleAliases`、`requestPolicy`、`deduplication`、`importance`。

### 3) 抓取通則（所有產品共用）

#### 3a) 先同步 Actions 快照（雲端排程一律先做這步）

沙箱連不到多數官方來源（見下方 `cloudSandbox`），所以來源改由 GitHub Actions 代抓、推到快照分支；排程讀 repo 內的快照即可。**每輪開頭先跑：**

```bash
bash scripts/sync-snapshots.sh        # → /tmp/ai-changelog-snapshots，並印出每個來源的健康狀態
```

- **exit 0** → 快照就緒。**所有產品一律改讀 `/tmp/ai-changelog-snapshots/` 內的檔案，不要再 curl 任何官方來源。** 讀 `index.json` 取每個 priority 的 `ok` / `file` / `errorClass`，再照原本的 priority 與 role 語意挑來源（規則完全不變，只是輸入從 HTTP 換成本地檔）。
- **exit 3**（沒有快照分支 / fetch 失敗）→ 退回本節原本的 live 抓取流程（沙箱內多半只有 `raw.githubusercontent.com` 與 `code.claude.com` 會成功）。
- 快照 `index.json` 的 `generatedAtIso` 超過 manifest `snapshots.staleAfterHours`（腳本會直接印「過期」）→ 仍可用，但**受影響產品在 `REFRESH_RUN` 記 `transient`**，`detail` 註明快照逾時未更新（例：「來源快照逾 13 小時未更新，Actions 工作流程可能失敗」）。
- 某來源 `ok: false` → 照 `errorClass` 對應步驟 9 的 `status`（對應表唯一定義在 manifest `snapshots.errorClassToStatus`），並照 priority 退下一層。
- 讀檔一律用 `index.json` 每筆的 `file` 欄位，**不要自己用 `<product>/p<priority>` 推導路徑** — 同一 URL 被多產品共用時只落地一份，`file` 會指向第一個用到它的產品目錄（該筆另有 `sharedWith` 標明出處）。
- 某來源 `skipped: true` → 不是失敗，**不計入健康度**；真的需要它才 live 抓（該類來源都挑沙箱連得到的主機）。

快照只有原文、沒有任何解析結果 — 4a～4d 的解析規則原封不動適用。

#### 3b) live 抓取（快照不可用時的退路）

**🚨 所有 curl 都照 `requestPolicy` 帶旗標**（排程走共用出口 IP，靜默失敗過去常被誤判成「解析失敗」）：

```bash
curl -sfL -A 'Mozilla/5.0 (compatible; ai-changelog/1.0; +https://github.com/KuoAnn/ai-changelog)' \
  --retry 3 --retry-delay 5 --retry-all-errors \
  -D /tmp/hdr.txt \
  -w '\nHTTP_STATUS=%{http_code} FINAL_URL=%{url_effective} BYTES=%{size_download}\n' \
  '<URL>'
```

- `-L` 必加：來源常有 308 搬家（`developers.openai.com` 已搬到 `learn.chatgpt.com`），沒 `-L` 拿到空 body。
- `-f` 必加：讓 4xx/5xx 回非 0 exit code，否則 403 也 exit 0，分不出「沒新版」和「被擋」。
- **成功判定（`requestPolicy.successConditions`）：** `HTTP_STATUS=200`、body 非空、且解析出至少 1 筆 release。任一不成立 → **此來源失敗**：照 priority 退下一層，並套「部分來源失敗」規則（見失敗處理）；同時從 `/tmp/hdr.txt` 撈 header 做 403 診斷。

**Role 語意**（每產品依 `sources[].priority` 由小到大嘗試）：

- `version-primary`：成功即停，不再呼叫任何 version fallback。
- `version-fallback`：僅 primary 失敗才用，同樣成功即停。
- `content-fallback`：內容保底 — 只提供版本區塊內文（**無發佈日期欄位**），可補全既定版本的 `body`；日期由更前 priority 來源對照，補不到日期就**不得建立條目**。
- `product-enrichment` / `notability-enrichment` / `human-readable-canonical` / `code-surface-cross-check`：**enrichment 類**，只能 (1) 補摘要 (2) 判重要性 (3) 補功能名稱。**🚨 不得用 enrichment 建立版本條目，也不得因 enrichment 又提到同版而重複寫入。**

**GitHub API Token：** `TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"`

- 有 token → 走 `github-releases-api` 來源，帶 `-H "Authorization: Bearer $TOKEN" -H 'Accept: application/vnd.github+json'`（5000 次/hr per token）。
- 無 token → **不得打未授權 `api.github.com`**（60 次/hr per 出口 IP，共用 NAT 額度會被其他 tenant 吃光），直接退該產品 Atom 來源。
- **不要用 WebFetch 打 GitHub API**（帶不了 `Authorization` header，等於未授權）。
- **🚨 雲端排程沙箱限制（manifest `cloudSandbox`，2026-08-02 實測）：** 沙箱的 GitHub 代理只放行本 session 掛載的 repo，打 anthropics / openai 的 `api.github.com` 與 `github.com`（含 `releases.atom`）一律 403，**帶 token 也一樣被攔**（回應 body 是 JSON、含 `not enabled for this session` 或 `sessions are bound`）。偵測到此簽名＝非暫時性，處置如下：(1) 雲端對這兩個主機的 curl **不帶 `--retry-all-errors`**（`-f` 讓 403 立即以非 0 結束，避免 requestPolicy 重試把同一個 403 連打 3 次）；(2) 同一輪偵測到簽名後，另一個 GitHub 來源（API 或 atom）**直接跳過不打**；(3) 退 `raw.githubusercontent.com` / `code.claude.com` 層。本機手動執行不受此限，原 priority 與 retry 旗標照舊。

**Atom / RSS 解析要點：**

- `releases.atom`：`<title>`＝版本、`<updated>`＝ISO 日期、`<content type="html">`＝release notes（entity-encoded 需 unescape；剝掉 GitHub `<a class="issue-link" data-hovercard-...>` 雜訊，只留 feature 描述）。**只回最新 10 筆、不支援分頁** → 排程中斷 >1 天 stable 可能滑出窗口；抓不到就退下一層，不可當「無新版」。
- Codex RSS（實測 ~1.1MB / 109 items）**同時含三種來源，靠 link 分流**（見 4c / 4d）。

### 4) 各產品要點

#### 4a) Claude Code CLI → `DATA_CC`

- 依 priority：GitHub Releases API（需 token）→ `releases.atom` → `code.claude.com/docs/en/changelog.md`（MDX，含日期）→ `CHANGELOG.md`（raw markdown，**無日期**，僅內容保底）→ 官方 HTML changelog；What's New 為 notability-enrichment。
- **雲端沙箱實務主來源是 priority 3 的 `changelog.md`**（前兩層必 403，見步驟 3）：官方由 GitHub CHANGELOG.md 生成，結構同 Cowork changelog 的 MDX 標籤 —— `<Update label="2.1.220" description="July 25, 2026">`，`label` → 版本、`description` → 日期（英文長日期轉 `YYYY-MM-DD`）。
- 過濾照 manifest：`draft == false`、`prerelease == false`、版本符合 `stableVersionPattern`。
- 版本取 `tag_name`／`<title>`（去 `v` 前綴）、日期取 `published_at`／`<updated>`、內容取 `body`／`<content>`。
- 條目 `{ v, date, cat, body }`；`cat` ∈ {Subagents/Skills, Plugins/MCP, Hooks, Slash Commands, IDE/Editor, Settings/Config, Permissions/Security, UI/UX, Performance/Bug Fix}。

#### 4b) Claude Desktop → `data/claude-desktop.json`

- **🚨 只寫入 JSON，版本絕不可寫入 `DATA_CC`**（Desktop 的 `1.24012.9` ≠ CLI 的 `2.1.x`，兩個不同產品）。
- 主要解析 priority 1（Cowork changelog **Markdown**），解析失敗才退 priority 2 HTML。**解析結構（實測 2026-07-31）：** 用 MDX 標籤而非 heading 分段，每版一段：

  ```text
  <Update label="v1.24012.9" description="2026-07-24">
    **General** / **Code** / **Cowork** / **3P**  ← 四個子區塊，各自列 bullet
  </Update>
  ```

  `label` → `version`（去 `v` 前綴）、`description` → `date`。
  **🚨 `**Code**` 子區塊講的是 Desktop 內建的 Claude Code 介面，仍屬 Desktop 版本 — 不要因為看到 Code 就寫進 `DATA_CC`。** 子區塊寫「No user-facing changes.」時該版通常 `low` / `notify: false`。
- **🚨 Claude Desktop ≠ Claude Apps（實測 2026-07-31 確認）：** priority 3 的 Claude Apps Release Notes 是 web／desktop／iOS／Android 傘狀公告頁、**完全沒有版本號**（依日期分段），與 Cowork changelog 同一天內容完全不同（2026-07-24：Desktop build＝修 Windows plugin hooks、Apps 公告＝Claude Opus 5 launch）→ **永遠只當 enrichment、不建立條目**；要收傘狀公告請另開產品。
- JSON 結構與 entry 範例：

  ```json
  {
    "product": "Claude Desktop",
    "canonicalSource": "https://claude.com/docs/cowork/changelog",
    "lastRefreshed": "YYYY-MM-DD HH:MM (Taipei)",
    "entries": [
      {
        "version": "1.24012.9",
        "date": "2026-07-24",
        "severity": "high",
        "notify": true,
        "title": "Windows Plugin Hooks 修復、MCP 永久允許控管與 Opus 5 effort",
        "summary": "修正 Windows 上 plugin hooks 靜默不執行；新增 mcpPersistentAlwaysAllowEnabled…",
        "categories": ["Hooks", "MCP/Permissions", "Models"]
      }
    ]
  }
  ```

- 規則：`entries[0]` 為最新；版本不得重複；`severity` ∈ critical/high/medium/low；`notify` 照步驟 6；`title`/`summary` 繁中、`categories` 保留英文功能領域名。

#### 4c) Codex CLI → `DATA_CI`

- 依 priority：GitHub Releases API（需 token）→ `releases.atom` → Codex RSS 中 link 含 `#github-release-` 的 entries（`<title>` 形如 `Codex CLI Release: 0.146.0`，內容精簡，僅保底）。
- 過濾照 manifest **三道全做**（排除 `-alpha`、排除 `rusty-v8-*`、符合 `stableVersionPattern`）— 實測不濾會插錯條目；alpha 發佈極密（atom 10 筆內常僅 1 筆 stable）。`rust-v0.136.0` → 取 `0.136.0`。
- 條目 `{ v, date, cat, title, body }`；`cat` ∈ {Models/Inference, MCP/Tools, Local Sandbox, Slash Commands, UI/UX, Permissions/Security, Performance/Bug Fix, Plugins/MCP}。
- summary 需註明實際走了哪一層（見步驟 11）。

#### 4d) Codex App / ChatGPT Desktop → `DATA_CA`

- priority 1＝Codex RSS，**靠 link 分流**：取 `#codex-YYYY-MM-DD-app`；忽略 `#codex-YYYY-MM-DD-mobile`（行動版）；`#github-release-<id>` 屬 4c。
- **🚨 標題不能只搜「Codex App」字樣**（官方已把 Codex 併入 ChatGPT Desktop）：一律以 manifest 的 `products.codex-app.titleAliases` 為接受清單（含 `ChatGPT desktop app`、`Codex joins the ChatGPT desktop app` 等寫法）。
- RSS 失敗才退 priority 2 HTML changelog（CDN 可能 stale，僅保底）；priority 3 只作 enrichment。
- 從 `<title>`／`<pubDate>`／`<description>`（HTML-encoded）抓內容；保留英文 feature 名、指令用 `<code>` 包、強調用 `<b>`。
- 條目 `{ v, date, cat, title, body }`，`v` 用 `"YYYY-MM-DD"`；`cat` ∈ {Models/Inference, IDE/Editor, UI/UX, Performance/Bug Fix, Cloud/Web, MCP/Tools}。

### 5) 去重與寫入

統一去重鍵：`product + version + publishedDate`（同 manifest `deduplication`）。防排程重複插入，依序執行：

1. 先讀目標最新筆（`DATA_*[0]` 的 `v`、`entries[0]` 的 `version`）。
2. 只接受版本／日期**嚴格新於該筆**的條目。
3. 插入前再掃一次完整資料，確認該版本不存在。
4. 同一版本不得因 enrichment 來源重複寫入。

整理成繁中後插入最前面（維持新到舊）。**不可刪舊條目**（含 JSON 既有 entries）。

**🚨 改 `data/changelog-data.js` 一律用 Edit 工具 surgical 替換，禁止 Write 重寫整檔**（200KB+）。`data/claude-desktop.json` 可整檔重寫，但必須保留既有 entries。

### 6) severity 與 notify

依 manifest `importance` 分級填 `severity`（critical / high / medium / low）。通知規則：critical、high 一律通知；**有實質使用者影響的 medium** 才通知；一般 medium 與 low 不通知。

僅 `data/claude-desktop.json` 的 entry 填 `severity` + `notify`（boolean）；`index.html` 的 `DATA_*` 沿用既有結構、不加 severity 欄位（通知由 workflow 依 diff 判定）。

### 7) 自動靈感卡

**全來源合計每次最多 2 張、同一 `INSP_*` 最多 1 張** — 嚴格節制。只在新版本有明確破天荒功能（新 slash command、新模型、功能類別首發）才產；寫不出有意義的應用情境就跳過，寧缺勿濫。不動既有手寫靈感卡。

往對應 `INSP_*` 陣列末尾 push，必含 `auto: true`：

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

Claude Desktop 目前沒有對應 `INSP_*` 陣列，**不要硬塞進 `INSP_CC`**。

### 8) 產生 DATA_CD（動過 Claude Desktop 資料就必跑）

```bash
node scripts/build-claude-desktop.mjs
```

把 JSON 內嵌成 `data/changelog-data.js` 的 `DATA_CD`。**JSON 是唯一真實來源，`DATA_CD` 是產物。** 內嵌而非 runtime fetch 是因頁面需支援瀏覽器直開（`file://` 下 `fetch` 被 CORS 擋）。產生器冪等（資料沒變無 diff）、會擋重複版本與非法 `severity`；`node scripts/build-claude-desktop.mjs --check` 只驗證同步不寫檔（不同步回非 0）。

### 9) 更新時間戳與抓取健康度（`REFRESH_RUN`）

格式必為 `YYYY-MM-DD HH:MM (Taipei)`：先 `TZ=Asia/Taipei date '+%Y-%m-%d %H:%M'` 取台北時間，再：

- Edit 替換 `index.html` 的 `<b id="lastRefreshed">舊時間 (Taipei)</b>`；
- 同步更新 `data/claude-desktop.json` 的 `lastRefreshed`；
- **整段重寫 `data/changelog-data.js` 的 `REFRESH_RUN`**（四個來源一個都不能少，成功的也要寫 `ok`）：

  ```js
  const REFRESH_RUN = {
    ranAt: "YYYY-MM-DD HH:MM (Taipei)",
    sources: {
      cc: { status: "ok" },
      cd: { status: "blocked",   detail: "claude.com 連線失敗（環境網路政策阻擋，非暫時性）" },
      ca: { status: "transient", detail: "learn.chatgpt.com / developers.openai.com / openai.com 均連線失敗" },
      ci: { status: "ok" }
    }
  };
  ```

  `status` 由步驟「失敗處理」的 403 診斷分類直接對應：

  | 診斷分類 | `status` | 前端同步率 | 前端標籤 |
  | --- | --- | --- | --- |
  | 成功（含「已確認無新版」；**讀快照成功也算**） | `ok` | 照資料新鮮度計算 | — |
  | 連線失敗 / timeout（`HTTP_STATUS=000` 且非 CONNECT 403）、API 額度耗盡、**快照過期或快照分支不可用** | `transient` | **-24%**（＝逾期 2 日） | 鏈路中斷 |
  | Cloudflare 擋 datacenter IP、環境網路政策阻擋（CONNECT 403）、雲端 session 未掛載 repo 等非暫時性 | `blocked` | **-48%**（＝逾期 4 日） | 鏈路封鎖 |

  讀快照時 `status` 直接由 `index.json` 的 `errorClass` 對應，**唯一定義在 manifest `snapshots.errorClassToStatus`**（`errorClass` 是封閉集合，精確狀態碼在 `httpStatus` / `errorDetail`，不會編進 class）：

  | `errorClass` | `status` | 說明 |
  | --- | --- | --- |
  | `ok: true` | `ok` | — |
  | `session-binding` / `cloudflare` | `blocked` | 非暫時性，重試無效 |
  | `http-4xx` | `blocked` | 401/403 權限或額度、404 來源搬家 — **需要人改 manifest**，`detail` 要寫出實際狀態碼與 URL |
  | `rate-limit` / `timeout` / `network` / `http-5xx` / `unexpected-status` / `empty-body` | `transient` | 下一輪可能自己好 |

  判定以**產品**為單位：該產品所有 priority 來源都失敗才算失敗；退 fallback 後成功仍是 `ok`。
  `detail` 用繁中一句寫實際主機與原因，會原樣顯示在頁面警報列。
  同時逾期又抓不到時，前端取兩軸較差值（不疊加），下限仍是 -120%。

### 10) 語法驗證 gate（push 前必做）

一個逗號／括號錯誤就會讓整頁 JS 掛掉，且排程環境沒人看得到：

```bash
python3 -m json.tool scripts/update-sources.json >/dev/null
python3 -m json.tool data/claude-desktop.json >/dev/null
node --check data/changelog-data.js
node scripts/build-claude-desktop.mjs --check
```

- `node --check data/changelog-data.js` 可直接驗整個資料層語法（它是獨立 JS 檔）；無 Node 至少確認括號／大括號數量平衡。
- **驗證不過就中止，不要 push 內容。** 若時間戳是唯一變更仍執行 push 腳本，summary 註明「內容語法驗證失敗，僅更新時間戳記」。

### 11) Commit + push（🚨 一律直推 main）

push 腳本已 stage `index.html`、`data/changelog-data.js`、`data/claude-desktop.json`、`scripts/update-sources.json`，內部用 `git push origin HEAD:main` 直推（與起始分支無關）。**不開 PR、不自行開分支。** 兩腳本都會自動偵測「無變更」→ 不 commit 直接結束；push 成功後 Pages 約 1 分鐘重建。

```bash
bash scripts/push-changelog.sh "<summary>"             # 遠端 / Linux（排程環境）
```

```powershell
pwsh scripts/push-changelog.ps1 -Message "<summary>"   # 本機 / Windows（手動跑）
```

**Summary 格式** — 基本行固定四產品，視情況附註 fallback 層級與失敗原因：

```text
Claude Code +N 筆、Claude Desktop +N 筆、Codex CLI +N 筆、Codex App +N 筆
Codex CLI 使用 Atom fallback
Claude Desktop Markdown 解析失敗，改用 HTML
Codex CLI GitHub API 額度耗盡，改用 Atom
來源快照逾 13 小時未更新，四產品均以舊快照解析
快照分支不可用，改為 live 抓取
```

走快照是常態，**不需在 summary 特別註明**；只有快照過期、不可用或部分來源在快照裡就是失敗時才寫一行。

## 失敗處理

- **部分來源失敗：跳過該來源、不中止流程**，用成功的來源照常更新；summary 標註（例「Codex App 解析失敗，跳過」）**並在 `REFRESH_RUN` 記下該產品的 `status` 與 `detail`**（步驟 9）— summary 只餵通知，`REFRESH_RUN` 才餵頁面。
- **四來源全失敗：** 仍更新時間戳、執行 push 腳本，summary 寫「所有來源解析失敗，僅更新時間戳記」。
- **即使四來源都沒新版**，仍要更新時間戳並執行 push 腳本（腳本會因時間戳差異而 commit）。
- **🚨 403 診斷（任一來源非 200 時必附分類，不可只寫「解析失敗」）** — 從 `/tmp/hdr.txt`、body 與 curl stderr／exit code 判斷（依序比對，先中先贏）：
  - body 是 JSON 且含 `not enabled for this session` 或 `sessions are bound to their configured repositories` → 寫「雲端 session 未掛載該 repo（GitHub 代理攔截，token 無效）」。非 IP、非額度，重試無效 → 直接退下一層；該產品全層失敗才記 `blocked`。
  - curl exit 56 且 stderr 含 `CONNECT tunnel failed, response 403`（此時 `HTTP_STATUS=000`）→ 寫「環境網路政策阻擋（org egress，connect_rejected）」→ `blocked`。**勿與單純 timeout 混淆** — 有明確 403 回應的 CONNECT 失敗是政策擋、非暫時性。
  - `X-RateLimit-Remaining: 0` → 寫「API 額度耗盡（共用 IP）」。共用 NAT 的未授權額度被其他 tenant 吃光 — **不是本 repo 打太多次，不要降低排程頻率**，要改帶 token 或走 `releases.atom`。
  - `cf-ray` / `cf-mitigated` 或 body 是 challenge HTML → 寫「Cloudflare 擋 datacenter IP」。重試無效，只能換來源。
  - `HTTP_STATUS=000` 或 timeout（且非上述 CONNECT 403）→ 寫「連線失敗」。
  - 其他狀態碼 → 原樣寫出，不要只寫「解析失敗」。

## 其他硬性約束

- 所有新增內容繁中；來源 URL 只能來自 manifest。
- 本階段不要為了顯示 Claude Desktop 大改前端版面，也**不要把 Claude Desktop 偽裝成 Claude Code**。

## 完成定義（DoD — 結束前自我檢查）

1. **來源設定**：已讀 manifest，抓取照 priority 與 role 語意（primary 成功即停、enrichment 不建條目）。
1b. **快照**：已跑 `scripts/sync-snapshots.sh`；成功時四產品皆讀本地快照、全程未 curl 官方來源；快照過期或不可用時已記進 `REFRESH_RUN` 與 summary。
2. **產品分流**：Claude Desktop 版本只在 `data/claude-desktop.json`；`DATA_CC` 只有 Claude Code CLI 的 semver；`index.html` 除時間戳外零改動。
3. **去重**：各陣列／`entries` 無重複版本，只插入嚴格新於原最前筆的條目（鍵 `product + version + publishedDate`）。
4. **語法**：兩個 JSON 過 `python3 -m json.tool`；`node --check data/changelog-data.js` 過；`build-claude-desktop.mjs --check` 過。
5. **重要性**：JSON 每筆 entry 有合法 `severity` 與依規則判定的 `notify`。
6. **時間戳**：`index.html` 的 `<b id="lastRefreshed">` 與 JSON 的 `lastRefreshed` 皆為 `YYYY-MM-DD HH:MM (Taipei)`。
6b. **抓取健康度**：`REFRESH_RUN.ranAt` 同上時間戳；`sources` 含 `cc`/`cd`/`ca`/`ci` 四鍵，`status` ∈ `ok`/`transient`/`blocked`，非 `ok` 者有 `detail`；本次沒失敗就四個都是 `ok`（**不可沿用上一次的失敗值**）。
7. **靈感卡**：合計 ≤ 2 張、同一 `INSP_*` ≤ 1 張，皆含 `auto: true`。
8. **Push**：腳本回報 `pushed to main` 或 `no changes`（皆為成功收尾）。
9. **Summary**：四產品筆數齊全；fallback 註明層級；失敗來源附 403 診斷分類。
10. **抓取健康度**：每來源確認過 `HTTP_STATUS=200` 且 `BYTES>0`（讀快照時＝`index.json` 該來源 `ok: true` 且 `bytes > 0`）；退 fallback 的產品註明走了哪一層。
