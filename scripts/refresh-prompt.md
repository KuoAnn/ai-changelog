# 自動刷新 prompt — AI Changelog GitHub Page

> 這份 prompt 給 **Claude Code 排程 (schedule / cron)** 使用。每次觸發時，agent 會抓四個產品面向的官方 changelog、更新 repo 內的資料檔、然後 push 回 GitHub 讓 Pages 重建。
>
> **Repo：** `https://github.com/KuoAnn/ai-changelog`（遠端排程會自動 clone 一份）
> **要編輯的檔案：** `index.html`（Claude Code / Codex CLI / Codex App）、`data/claude-app.json`（Claude Desktop / Claude App）
> **來源設定檔：** `scripts/update-sources.json`（所有官方 URL、優先順序、版本過濾、重要性分級的唯一來源）
> **路徑慣例：** 一律用 **repo-relative** 路徑（例 `index.html`、`scripts/push-changelog.sh`），不要用任何本機絕對路徑——遠端環境是 Linux、工作目錄已是 repo 根。

---

你的目標：刷新四個產品面向的 changelog 資料、產生少量「自動靈感卡」、更新「最後更新」時間戳，最後 **commit 並 push** 讓 GitHub Page（<https://kuoann.github.io/ai-changelog/>）自動重建。所有新加入的內容都必須使用繁體中文，與既有條目風格一致。

## 背景

追蹤的產品分成**四類，彼此不可混用**：

| 產品 | 寫入目標 | 說明 |
| --- | --- | --- |
| Claude Code CLI | `index.html` → `DATA_CC`、`INSP_CC` | CLI 版本（`2.1.x` 這種 semver） |
| Claude Desktop / Claude App | `data/claude-app.json` → `entries` | 桌面／App 版本，**獨立檔案** |
| Codex CLI | `index.html` → `DATA_CI`、`INSP_CI` | CLI 版本 |
| Codex App / ChatGPT Desktop | `index.html` → `DATA_CA`、`INSP_CA` | 桌面 App，已逐步併入 ChatGPT Desktop |

- **🚨 Claude Code CLI 與 Claude Desktop App 是兩個不同產品。** Claude Desktop 的版本號（例 `1.24012.9`）**絕對不可**寫入 `DATA_CC`，只能寫進 `data/claude-app.json`。
- **🚨 Codex App 不能只搜尋「Codex App」字樣**：官方已把 Codex 併入 ChatGPT Desktop，標題會出現 `ChatGPT desktop app`、`Codex joins the ChatGPT desktop app` 等寫法。一律以 `scripts/update-sources.json` 的 `products.codex-app.titleAliases` 為接受清單。
- `index.html` 為單頁合併版面（已無 Tab）：前端 JS 於渲染時把 `DATA_*` 合併成單一時間軸與靈感卡區。**只要維護那六個陣列即可，不需要動任何 HTML 版面。**
- Hero 的 Date Span、Total Versions、Agent 篩選 chip 計數都由 JS 動態計算 — 不要去動那些靜態字串。
- 本階段 `data/claude-app.json` 只作為**獨立更新與通知資料源**，前端尚未顯示第四個 Agent；不要為了顯示它去改前端版面。

## 步驟

### 1) 先同步 git

避免 push 衝突：`git pull --rebase --autostash origin main`

（此處 pull 是為了讓接下來的 Read 讀到最新內容；push 腳本內部會再 pull 一次以確保 fast-forward，兩者不是冗餘 bug。）

接著建議**先用 Grep 定位** `const DATA_CC` / `const DATA_CA` / `const DATA_CI` / `INSP_` 的行號，再用 Read 的 offset/limit 分塊讀需要的陣列區段（`index.html` 290KB+，勿整檔讀）。`data/claude-app.json` 很小，可整檔讀。

### 2) 讀來源設定檔

**排程開始時先讀 `scripts/update-sources.json`**，取得每個產品的來源清單、優先順序、版本 pattern、標題別名與重要性規則。

**🚨 禁止再把來源 URL 分散寫死在這份 prompt 或程式碼各處。** 來源有變更時只改 `scripts/update-sources.json`。這份 prompt 只描述「怎麼用」那些來源，不重複列 URL。

### 3) 抓取策略（所有產品共用）

**🚨 抓取通則（所有 curl 都照這樣寫）：** 排程環境走共用出口 IP，靜默失敗過去常被誤判成「解析失敗」。一律照 `requestPolicy` 帶上這幾個旗標：

```bash
curl -sfL -A 'Mozilla/5.0 (compatible; ai-changelog/1.0; +https://github.com/KuoAnn/ai-changelog)' \
  --retry 3 --retry-delay 5 --retry-all-errors \
  -D /tmp/hdr.txt \
  -w '\nHTTP_STATUS=%{http_code} FINAL_URL=%{url_effective} BYTES=%{size_download}\n' \
  '<URL>'
```

- `-L` 必加：來源常有 308 搬家（`developers.openai.com` 就已搬到 `learn.chatgpt.com`），沒 `-L` 會拿到空 body。
- `-f` 必加：讓 4xx/5xx 回非 0 exit code。原本 `curl -s` 遇 403 也是 exit 0，agent 分不出「沒新版」和「被擋」。
- **成功判定（`requestPolicy.successConditions`）：** `HTTP_STATUS=200`、body 非空、且至少能解析出一筆 release。任一條不成立 → **此來源失敗**，套用「部分來源失敗」規則（見約束），並照 priority 往下一層退。
- 失敗時從 `/tmp/hdr.txt` 撈出診斷 header 寫進 summary（見約束「403 診斷」）。

**優先順序與 role 語意：** 每個產品依 `sources[].priority` **由小到大**嘗試：

- `version-primary`：**成功後就停**，不再呼叫任何 version fallback。
- `version-fallback`：**只有 primary 失敗時才使用**，同樣成功即停。
- `product-enrichment` / `notability-enrichment` / `human-readable-canonical` / `code-surface-cross-check`：**enrichment 類**，只能用來
  1. 補充摘要文字
  2. 判斷更新重要性（severity / notify）
  3. 補充功能名稱
  **🚨 不得用 enrichment 類來源建立版本條目**，尤其不得因為 enrichment 又提到同一版就重複寫入一筆。

**GitHub API Token：**

```bash
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
```

- 有 Token → 走 `github-releases-api` 來源，帶 `-H "Authorization: Bearer $TOKEN" -H 'Accept: application/vnd.github+json'`。額度 5000 次/小時 **per token**（不看 IP）。
- **沒有 Token → 不得打未授權的 `api.github.com`**，直接退到該產品的 Atom 來源。未授權是 60 次/小時 per 出口 IP，排程環境是共用 NAT、額度會被其他 tenant 吃光。
- **不要用 WebFetch 打 GitHub API** — WebFetch 無法帶 `Authorization` header，等於未授權請求。

**Atom / RSS 解析要點：**

- `releases.atom`：`<entry>` 內 `<title>` = 版本、`<updated>` = ISO 日期、`<content type="html">` = release notes（HTML entity-encoded，需 unescape）。**只回最新 10 筆且不支援分頁** → 排程中斷超過 1 天時 stable 版可能已滑出窗口；抓不到就往下一層退，不要當成「無新版」。`<content>` 內有大量 GitHub 的 `<a class="issue-link" data-hovercard-...>` 雜訊，整理繁中時剝掉，只留 feature 描述。
- Codex RSS（實測 ~1.1MB / 109 items）**同時含三種來源，靠 link 分流**，見下方 4c / 4d。

### 4) 各產品抓取與寫入

#### 4a) Claude Code CLI → `index.html` 的 `DATA_CC`

- 依 priority：GitHub Releases API（`anthropics/claude-code`，需 token）→ `releases.atom` → `CHANGELOG.md`（raw markdown）→ 官方 HTML changelog。
- 過濾條件：

  ```text
  draft == false
  prerelease == false
  版本符合 ^v?\d+\.\d+\.\d+$
  ```

- 用 `tag_name`／`<title>` 取版本號（有 `v` 前綴則去掉）、`published_at`／`<updated>` 取日期、`body`／`<content>` 取內容。
- `notability-enrichment`（What's New）只用來判斷「這版重不重要」與補功能名稱，**不建立條目**。
- 條目結構：`{ v, date, cat, body }`，`cat` ∈ {Subagents/Skills, Plugins/MCP, Hooks, Slash Commands, IDE/Editor, Settings/Config, Permissions/Security, UI/UX, Performance/Bug Fix}

#### 4b) Claude Desktop / Claude App → `data/claude-app.json`

- **🚨 寫入 `data/claude-app.json`，不得寫入 `DATA_CC`。**
- 主要解析 `products.claude-app` 的 priority 1（Cowork changelog **Markdown**）。Markdown 解析失敗才退到 priority 2 的 HTML 版。
- **解析結構（實測 2026-07-31）：** 該 Markdown 用 MDX 標籤而非 heading 分段，每個版本一段：

  ```text
  <Update label="v1.24012.9" description="2026-07-24">
    **General** / **Code** / **Cowork** / **3P**  ← 四個子區塊，各自列 bullet
  </Update>
  ```

  取 `label` 當 `version`（去掉 `v` 前綴，形如 `1.24012.9`；注意**不是** CLI 的 `2.1.x`）、`description` 當 `date`。
  **🚨 段落內的 `**Code**` 子區塊講的是 Desktop 內建的 Claude Code 介面，仍屬 Desktop 版本的一部分 — 不要因為看到 Code 就寫進 `DATA_CC`。**
  子區塊寫「No user-facing changes.」時，該版通常是 `low` / `notify: false`。
- priority 3（Claude Apps Release Notes）與 priority 4（Desktop Code Changelog）是 enrichment / cross-check：只補摘要與重要性、**不建立重複的 Desktop 版本**。
- JSON 結構：

  ```json
  {
    "product": "Claude Desktop / Claude App",
    "canonicalSource": "https://claude.com/docs/cowork/changelog",
    "lastRefreshed": "YYYY-MM-DD HH:MM (Taipei)",
    "entries": []
  }
  ```

- 每筆 entry：

  ```json
  {
    "version": "1.24012.9",
    "date": "2026-07-24",
    "severity": "high",
    "notify": true,
    "title": "Windows Plugin Hooks 修復、MCP 永久允許控管與 Opus 5 effort",
    "summary": "修正 Windows 上 plugin hooks 靜默不執行；新增 mcpPersistentAlwaysAllowEnabled，管理員可停用 MCP 工具的永久 Always allow、保留單次工作階段核准；Opus 5 加入五段式 effort 選擇。",
    "categories": ["Hooks", "MCP/Permissions", "Models"]
  }
  ```

- 規則：
  1. **最新條目放最前面**（`entries[0]` 為最新）。
  2. **不得重複版本。**
  3. **不得把 Claude Desktop 版本寫入 `DATA_CC`。**
  4. `severity` 只能是 `critical` / `high` / `medium` / `low`。
  5. `notify` 依步驟 6 的通知規則判定。
  6. `title` 與 `summary` 用繁中；`categories` 保留英文功能領域名。

#### 4c) Codex CLI → `index.html` 的 `DATA_CI`

- 依 priority：GitHub Releases API（`openai/codex`，需 token）→ `releases.atom` → Codex RSS 中 link 含 `#github-release-` 的 entries（`<title>` 形如 `Codex CLI Release: 0.146.0`，內容較精簡，僅保底）。
- 過濾條件（**三道都要做**，實測不濾會插錯條目）：

  ```text
  draft == false
  prerelease == false
  排除 -alpha
  排除 rusty-v8-*
  只接受 ^(?:rust-v)?\d+\.\d+\.\d+$
  ```

- `rust-v0.136.0` → 取 `0.136.0`。alpha 版發佈很密（實測 atom 10 筆內只有 1 筆是 codex stable）。
- 條目結構：`{ v, date, cat, title, body }`，`cat` ∈ {Models/Inference, MCP/Tools, Local Sandbox, Slash Commands, UI/UX, Permissions/Security, Performance/Bug Fix, Plugins/MCP}
- summary 需註明實際走了哪一層（見步驟 9）。

#### 4d) Codex App / ChatGPT Desktop → `index.html` 的 `DATA_CA`

- priority 1 = Codex RSS，**靠 link 分流**：

  ```text
  取   #codex-YYYY-MM-DD-app      → Codex App（本節要的）
  忽略 #codex-YYYY-MM-DD-mobile   → 行動版
  （#github-release-<id> 屬 Codex CLI，見 4c 保底層）
  ```

- **解析標題時需接受 manifest `titleAliases` 的全部寫法**，至少包含：

  ```text
  Codex app
  Codex desktop app
  ChatGPT desktop app
  ChatGPT Voice and multi-folder projects
  Codex joins the ChatGPT desktop app
  ```

- RSS 失敗才退到 priority 2 的 HTML changelog（CDN 可能 stale，僅保底）；priority 3（OpenAI Product Release Notes）只作 enrichment。
- 從 `<title>`、`<pubDate>`、`<description>`（HTML-encoded）抓內容；保留英文 feature 名、用 `<code>` 包指令、`<b>` 強調。
- 條目結構：`{ v, date, cat, title, body }`，`cat` ∈ {Models/Inference, IDE/Editor, UI/UX, Performance/Bug Fix, Cloud/Web, MCP/Tools}；Codex App 的 `v` 用 `"YYYY-MM-DD"`。

### 5) 去重

**統一去重鍵：**

```text
product + version + publishedDate
```

另外仍需依序執行（防排程重複插入，最重要）：

1. **先讀目標陣列／JSON 的最新版**（`DATA_*[0]` 的 `v`、`entries[0]` 的 `version`）。
2. **只接受版本／日期嚴格新於該筆**的條目。
3. **插入前再掃一次完整資料**，確認該版本不存在才寫入。
4. **同一版本不得因 enrichment 來源重複寫入。**

整理成繁中後插入「最前面」（維持新到舊順序）。**不可刪舊條目。**

**🚨 改 `index.html` 一律用 Edit 工具 surgical 替換，禁止用 Write 重寫整檔**（HTML 已 290KB+）。`data/claude-app.json` 可整檔重寫，但必須保留既有 entries。

### 6) 重要性與通知判定

依 `scripts/update-sources.json` 的 `importance` 分級：

| severity | 判定依據 |
| --- | --- |
| `critical` | 資安漏洞、Sandbox escape、資料遺失、操作錯誤 repository、操作錯誤檔案、重大認證或權限破壞性變更 |
| `high` | 新模型、Context window 重大變更、MCP、Plugin、Hooks、Subagent、Worktree、Remote execution、Enterprise policy、Breaking change |
| `medium` | 明顯 UI 改善、工作流程改善、效能改善、穩定性改善 |
| `low` | 一般 bug fix、依賴更新、重打包、no user-facing changes |

通知規則：

```text
critical              -> 通知
high                  -> 通知
有實質使用者影響的 medium -> 通知
一般 medium            -> 不通知
low                   -> 不通知
```

`data/claude-app.json` 的每筆 entry 都要照這張表填 `severity` 與 `notify`（`notify` 為 boolean）。`index.html` 的 `DATA_*` 條目沿用既有結構、不加 severity 欄位（通知由 workflow 依 diff 判定）。

### 7) 自動生成靈感卡

**全部來源合計每次最多 2 張，且同一個 `INSP_*` 最多 1 張** — 嚴格節制。只在新版本有明確破天荒功能時產（新 slash command、新模型、新功能類別首發）。寫不出有意義的應用情境就跳過，寧缺勿濫。

往對應 `INSP_*` 陣列末尾 push 一個 object，必須含 `auto: true`：

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

Claude App 目前沒有對應 `INSP_*` 陣列，**不要為它硬塞靈感卡到 `INSP_CC`**。

### 8) 更新時間戳

**格式必須 `YYYY-MM-DD HH:MM (Taipei)`**：先取台北時間 `bash TZ=Asia/Taipei date '+%Y-%m-%d %H:%M'`，再

- 用 Edit 替換 `index.html` 的 `<b id="lastRefreshed">舊時間 (Taipei)</b>`；
- 同步更新 `data/claude-app.json` 的 `lastRefreshed`。

### 9) 語法驗證 gate（push 前必做）

全程用 Edit surgical 替換大檔 HTML，一個逗號/括號錯誤就會讓整頁 JS 掛掉，且排程環境沒人看得到。push 前務必驗證：

```bash
python3 -m json.tool scripts/update-sources.json >/dev/null
python3 -m json.tool data/claude-app.json >/dev/null
```

- 抽出修改過的 `DATA_*` / `INSP_*` 區塊，用 `node --check` 或 `node -e "..."` parse 一次；無 Node 時至少確認陣列開合括號 / 大括號數量平衡。
- **驗證不過就中止，不要 push。** 仍執行 push 腳本只更新時間戳（若時間戳是唯一變更），summary 註明「內容語法驗證失敗，僅更新時間戳記」。

### 10) Commit + push

執行 push 腳本（腳本已 stage `index.html`、`data/claude-app.json`、`scripts/update-sources.json`），把四來源檢查結果當 summary 傳入。

- 遠端 / Linux（排程環境）：

  ```bash
  bash scripts/push-changelog.sh "Claude Code +N 筆、Claude App +N 筆、Codex CLI +N 筆、Codex App +N 筆"
  ```

- 本機 / Windows（手動跑）：

  ```powershell
  pwsh scripts/push-changelog.ps1 -Message "Claude Code +N 筆、Claude App +N 筆、Codex CLI +N 筆、Codex App +N 筆"
  ```

**Summary 格式**——基本行固定四個產品：

```text
Claude Code +N 筆、Claude App +N 筆、Codex CLI +N 筆、Codex App +N 筆
```

若有走 fallback，附註實際層級：

```text
Claude Code 使用 Atom fallback
Codex CLI 使用 RSS fallback
```

若有失敗，附註失敗與改用來源：

```text
Claude App Markdown 解析失敗，改用 HTML
Codex CLI GitHub API 額度耗盡，改用 Atom
```

兩個腳本都會自動偵測「無變更」→ 不 commit、直接結束。push 成功後 Pages 約 1 分鐘內重建。

**🚨 一律直接更新 main 分支：** 不要開 PR、不要把變更留在工作分支。push 腳本內部用 `git push origin HEAD:main` 把當前 commit 直接推到 `main`（與排程環境起始在哪個分支無關）。**不要自己另外開分支或發 PR。**

## 約束

- 所有新增內容必須繁中。
- **來源 URL 只能來自 `scripts/update-sources.json`**，不要在別處硬寫。
- **一律在 main 上作業並 push 到 main**，不開 PR、不留工作分支（用 push 腳本即可，它已處理）。
- 不要修改 Chart.js 的 `<script src=...>` 標籤。
- 不要刪舊條目（含 `data/claude-app.json` 的既有 entries）、不要動既有手寫靈感卡。
- 不要 find-replace「Anthropic · 36 versions · ...」這類字串 — 已改為動態計算。
- 本階段不要為了顯示 Claude App 去大改前端版面；也**不要把 Claude App 偽裝成 Claude Code**。
- 即使四來源都沒新版，仍要更新時間戳並執行 push 腳本（腳本會因有差異而 commit 時間戳）。
- **部分來源失敗時：跳過該來源、不要中止整個流程**，用成功的來源照常更新；summary 標註哪些來源失敗（例「Codex App 解析失敗，跳過」）。
- 四來源**都**解析失敗時：仍更新時間戳、執行 push 腳本，summary 寫「所有來源解析失敗，僅更新時間戳記」。
- **🚨 403 診斷（失敗時必附原因，否則沒人查得出來）：** 任一來源非 200 時，從 `/tmp/hdr.txt` 撈 header 判斷類型，寫進 summary：
  - 有 `X-RateLimit-Remaining: 0` → 寫「API 額度耗盡（共用 IP）」。排程環境走共用 NAT，未授權的 60/hr 額度會被其他 tenant 吃光 — **這不是本 repo 打太多次**，不要因此降低排程頻率，要改帶 token 或走 releases.atom。
  - 有 `cf-ray` / `cf-mitigated` 或 body 是 challenge HTML → 寫「Cloudflare 擋 datacenter IP」。無法靠重試解決，只能換來源。
  - `HTTP_STATUS=000` 或 timeout → 寫「連線失敗」。
  - 其他狀態碼 → 原樣寫出狀態碼，不要只寫「解析失敗」。

## 完成定義（DoD — 結束前自我檢查）

1. **來源設定**：已讀 `scripts/update-sources.json`，抓取一律照 priority 與 role 語意（primary 成功即停、enrichment 不建立條目）。
2. **產品分流**：Claude Desktop 版本只在 `data/claude-app.json`；`DATA_CC` 只有 Claude Code CLI 的 semver。
3. **去重**：每個陣列／`entries` 無重複版本，且只插入了嚴格新於原最前筆的條目（去重鍵 `product + version + publishedDate`）。
4. **語法**：`scripts/update-sources.json` 與 `data/claude-app.json` 通過 `python3 -m json.tool`；修改過的 `DATA_*` / `INSP_*` 區塊通過 parse / 括號平衡檢查。
5. **重要性**：`data/claude-app.json` 每筆 entry 都有合法 `severity`（critical/high/medium/low）與依規則判定的 `notify`。
6. **時間戳**：`index.html` 的 `<b id="lastRefreshed">` 與 `data/claude-app.json` 的 `lastRefreshed` 都已更新為 `YYYY-MM-DD HH:MM (Taipei)`。
7. **靈感卡**：合計 ≤ 2 張、同一 `INSP_*` ≤ 1 張，且皆含 `auto: true`。
8. **Push**：push 腳本回報 `pushed to main` 或 `no changes`（兩者皆為成功收尾）。
9. **Summary**：四個產品筆數都寫出；有 fallback 註明層級；失敗來源必須帶 403 診斷分類（見約束），不可只寫「解析失敗」。
10. **抓取健康度**：每個來源都確認過 `HTTP_STATUS=200` 且 `BYTES>0`；退到 fallback 的產品在 summary 註明走了哪一層。
