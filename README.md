# cathay-ai-changelog

> 一鍵安裝 **Cathay AI Coding Tools 更新摘要** Cowork live artifact。
> 涵蓋 Claude Code、Codex App、Codex CLI 三個工具，附 6 角色化（iOS / Android / Backend / Designer / QA / PM）應用靈感卡，每 2 天自動更新。

## 🌐 線上版（GitHub Page）

**👉 <https://kuoann.github.io/ai-changelog/>**

不用安裝、不用 Cowork，瀏覽器直接開即可。內容由排程每 2 天自動抓三個官方 changelog、更新後 push 回此 repo，Pages 自動重建（見 [自動更新並發佈到 GitHub Page](#自動更新並發佈到-github-page)）。

維護者：[@charliechen](https://cubegit.cubeapps.work/charliechen) · AI Scrum Team

---

## 這個 Skill 做什麼

執行後會在你的 Cowork 中安裝一個 live artifact，提供：

- **三個 Tab**：Claude Code / Codex App / Codex CLI 的官方 changelog 摘要（繁中）
- **6 角色切換器**：依你的職能（iOS / Android / Backend / Designer / QA / PM）自動過濾「對你有用」的應用靈感卡，**「01 應用靈感」標題會隨角色動**
- **可點擊靈感卡**：每張卡點開有「為什麼有用」「設定範例」「實戰技巧」三段詳細說明，code 區塊一鍵複製
- **🆕 auto 卡**：排程任務自動生成的卡片帶金色徽章，內容尚未手動 review
- **時間軸**：依日期排序、可依類別篩選、關鍵字搜尋、分頁載入
- **每 2 天自動更新**：背景排程從三個權威來源抓最新內容
- **「↻ 立即更新」按鈕**：在 artifact 右上角，手動觸發更新

---

## 快速安裝（30 秒）

### 方法 A：Cowork 內直接拖（推薦）

最簡單。適合 Designer / PM / QA 等非工程角色。

1. 從這個資料夾下載 **`cathay-ai-changelog.skill`**（在 [Releases 頁面](https://cubegit.cubeapps.work/Cube/team-skills/-/releases) 或下面 [手動打包章節](#手動打包-skill-檔)）
2. 把 `.skill` 檔拖進 Cowork 任一對話視窗
3. 點訊息下方的 **「Save skill」** 按鈕
4. 對 Cowork 說：

   ```
   安裝 cathay AI changelog
   ```

5. Claude 會自動建好 artifact 並問你要不要設定自動更新（建議要）
6. 完成 → 從 sidebar 打開 artifact、頂端選你的角色

### 方法 B：Claude Code CLI 使用者

如果你用 Claude Code（terminal）：

```bash
# 1. Clone team-skills repo（首次）
git clone https://cubegit.cubeapps.work/Cube/team-skills.git ~/cube/team-skills

# 2. Symlink 進你的 ~/.claude/skills/
mkdir -p ~/.claude/skills
ln -s ~/cube/team-skills/skills/cathay-ai-changelog ~/.claude/skills/cathay-ai-changelog

# 3. 重啟 Claude Code 或在現有 session 跑
claude
> /skills
# 應看到 install-cathay-ai-changelog 在清單中

# 4. 啟用 skill
> 安裝 cathay AI changelog
```

之後 repo 有更新時：

```bash
cd ~/cube/team-skills && git pull
```

skill 內容會跟著更新。

### 方法 C：手動安裝（不想用 skill 機制）

如果你只想要 HTML，不想走 skill 流程：

1. 下載 `claude-code-changelog-tw.html`
2. 直接雙擊用瀏覽器打開（不需要 Cowork）
3. 所有功能（角色切換、篩選、modal）都能用
4. 缺點：沒有「自動更新」與「↻ 立即更新」按鈕

---

## 安裝後怎麼用

### 第一次打開

1. 從 Cowork sidebar 點「**Cathay AI Coding Tools 更新摘要**」打開 artifact
2. 頂端「**我的角色**」chip 列選你的職能：

   | 你是… | 選這個 |
   | --- | --- |
   | iOS 工程師 | 📱 iOS RD |
   | Android 工程師 | 🤖 Android RD |
   | 後端工程師 | ⚙️ Backend RD |
   | UI / UX Designer | 🎨 Designer |
   | QA / 測試工程師 | 🧪 QA / Tester |
   | PM / Scrum Master | 📋 PM |
   | 都想看 | ✦ 全部 |

3. 切換到「01 應用靈感」區域 — 已自動過濾成你的角色相關卡片，**標題會跟著動**（例：選 Android RD → 「Android RD 應用靈感」）
4. 點任一張卡看詳細範例
5. 看到右上角金色「🆕 auto」徽章的卡 = 排程自動生成，可看作起點，內容尚未手動 review

選擇會記在 localStorage，下次打開狀態還在。

### 立即更新

右上角「↻ 立即更新」按鈕會觸發排程任務在背景跑（約 1-2 分鐘）。完成後按瀏覽器 Reload 看到新內容。

⚠️ **第一次點可能會跳工具權限對話框** — **請選「Always allow」而非「Allow once」**，之後就完全靜音自動跑。

---

## 排程任務怎麼運作

每 2 天 09:00 自動跑，三個來源各走最可靠的路徑：

| Tab | 來源 |
| --- | --- |
| Claude Code | `code.claude.com/docs/en/changelog`（官方 HTML） |
| Codex CLI | `api.github.com/repos/openai/codex/releases`（**GitHub API 權威**，避開 CDN cache） |
| Codex App | `developers.openai.com/codex/changelog/rss.xml`（**RSS feed**，避開 CDN cache） |

`update_summary` 會明確列出三個來源各自檢查結果（即使沒新版也標 ✓），你打開 Cowork 通知就有信心知道任務真的有跑。

---

## 自動更新並發佈到 GitHub Page

線上版 <https://kuoann.github.io/ai-changelog/> 的內容由 **Claude Code 排程 (schedule)** 維護，流程：

```text
排程觸發 → agent 抓三來源 → Edit 更新 HTML → push-changelog.ps1 → git push → Pages 自動重建
```

| 檔案 | 用途 |
| --- | --- |
| [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) | 排程 agent 每次執行的完整指示（抓來源 → 改 HTML → 呼叫 push 腳本） |
| [`scripts/push-changelog.ps1`](scripts/push-changelog.ps1) | git pull → commit（含台北時間戳）→ push；無變更時自動跳過 |

### 設定排程

在這個 repo 目錄開 Claude Code，跑 `/schedule`，建立一個 cron 任務（建議 `0 9 */2 * *`＝每 2 天 09:00），prompt 直接用 [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) 的內容。

也可手動觸發一次：
```powershell
# 1. 開 Claude Code，貼 refresh-prompt.md 內容讓它更新 HTML
# 2. 或內容已改好，只想 push：
pwsh scripts/push-changelog.ps1 -Message "手動更新"
```

> ⚠️ push 需要本機已設定 git 認證（這台機器已用 `gh auth` 登入 KuoAnn）。若排程在不同機器跑，需確保該環境也能 push 到 `origin`。

---

## 常見問題

**Q：我沒安裝 Cowork 也能用嗎？**
可以。直接瀏覽器打開 HTML 檔，所有 UI 功能都正常，只是沒辦法自動更新 changelog 資料 — 看到的是 Charlie 最後一次 commit 的快照。

**Q：自動更新會用我的 Claude 額度嗎？**
會。每次更新 ~50k-100k tokens，每 2 天一次。如果在意可以改頻率（編輯 scheduled task）或關掉自動，只用「↻ 立即更新」按鈕手動觸發。

**Q：能加我自己角色專屬的靈感卡嗎？**
可以。Fork 這個 repo、編 `claude-code-changelog-tw.html` 內的 `INSP_CC` / `INSP_CA` / `INSP_CI` 陣列加新 object，照其他 card 格式寫，`roles` 陣列填你的角色 id。改完開 PR 合進主版本給大家用。

**Q：我們團隊有特殊需求（不是這六個角色之一）想加新角色？**
歡迎 PR。需要改：
- HTML 內 `ROLES` 陣列加新 entry
- 既有卡片的 `roles` 標籤（若要套用既有卡）
- 加幾張該角色專屬的新卡

**Q：HTML 變大很多，能拆檔嗎？**
目前刻意保持單一 HTML（self-contained）以利分享、離線使用、安裝為 Cowork artifact。

**Q：🆕 auto 卡看起來不對怎麼辦？**
排程任務每次最多生 2 張 auto 卡，這些品質不保證。看到不對的：
1. 自己編 HTML 拿掉 `auto: true`（變正式卡）或整張刪掉
2. 或回報給 Charlie 重寫

---

## 手動打包 .skill 檔

如果 Releases 頁沒有 .skill 檔（或你想自製版本），在 repo 根目錄跑：

```bash
cd skills/cathay-ai-changelog
zip -j ../../cathay-ai-changelog.skill SKILL.md claude-code-changelog-tw.html
```

產出的 `cathay-ai-changelog.skill` 就可以直接拖進別人的 Cowork 使用。

---

## 維護與貢獻

### 報 bug / 提建議

- Slack DM [@charliechen](https://cubegit.cubeapps.work/charliechen)
- 或在 #ai-scrum 頻道留言
- 或開 Issue 在這個 repo

### 想理解 artifact 內部結構

| 內容 | 位置（HTML 內） |
| --- | --- |
| 三個工具的 changelog 資料 | `const DATA_CC`、`DATA_CA`、`DATA_CI` |
| 角色靈感卡 | `const INSP_CC`、`INSP_CA`、`INSP_CI` |
| 角色定義 | `const ROLES` |
| 角色 ↔ 卡片對應（舊卡） | `ROLE_TAGS_CC` 等 |
| 卡片詳細說明 | 每個 card 的 `d:[...]` 陣列 |
| 卡片過濾邏輯 | `function renderInspirationCards()` |
| Modal 開啟邏輯 | `function openModal(card)` |
| 卡片日期排序 | `function inspDateKey(card)` |
| 立即更新按鈕邏輯 | `manualRefreshBtn` event listener |

---

## 變更紀錄

| 日期 | 版本 | 變更 |
| --- | --- | --- |
| **2026-06-02** | **v1.2** | **排程任務 auto card 生成策略改為「全面積極」：每次最多 8 張（每個 INSP_* 最多 3 張），觸發條件大幅放寬 — 任何使用者面向變動（新指令、新設定、新工具、新 UI、改名、breaking change、平台支援擴展等）都會被當成卡片題材。同事 artifact 完全不再依賴 Charlie 手刻卡 — 他們的排程任務自己會跑同一份新邏輯。品質下限：每張卡仍要有完整 Why/Setup/Tips 與 Cathay 情境。** |
| **2026-06-02** | **v1.1** | **(1) Codex CLI 改抓 GitHub API（避 stale CDN），補 0.131–0.136 共 6 筆。 (2) Codex App 改抓 RSS feed，補 15 筆含 5/28 Windows Computer Use、4/16 In-app Browser 大改版、3/4 Codex App for Windows 正式版等。 (3) Claude Code 補 13 筆含 Opus 4.8、動態工作流、Agent View、/code-review。 (4) 新增 11 張靈感卡對齊近期 changelog（Opus 4.8、/code-review、Windows Computer Use、Codex App for Windows、codex doctor、Goals 等）。 (5) 靈感卡新增 🆕 auto 徽章 + modal 提示。 (6) 「01 應用靈感」標題跟角色切換器連動。 (7) 靈感卡依日期排序（最新在前）。 (8) 右上角「↻ 立即更新」按鈕觸發排程任務。 (9) 排程任務 prompt 改用三來源策略（HTML/GitHub API/RSS）並嚴格報告 update_summary。 (10) Hero 區 Date Span / Tab meta 改為動態計算。** |
| 2026-05-21 | v1.0 | 初版：6 角色、3 Tab、27+13 張靈感卡、每 2 天排程、立即更新按鈕 |

---

## 授權 / 內部使用

僅供 Cathay United Bank 內部使用。changelog 資料來源為三個工具的公開官方 changelog 頁面。
