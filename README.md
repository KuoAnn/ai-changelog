# ai-changelog

> **AI Coding Tools 更新摘要** — Claude Code、Codex App、Codex CLI 三個工具的官方 changelog 繁中摘要，附 6 角色化（iOS / Android / Backend / Designer / QA / PM）應用靈感卡。
>
> 一個 self-contained 的靜態 HTML 儀表板，由排程每 2 天自動抓三個官方 changelog、更新後 push 回 repo，GitHub Pages 自動重建。

## 🌐 線上版（GitHub Page）

**👉 <https://kuoann.github.io/ai-changelog/>**

瀏覽器直接開即可，不需安裝。內容由 [自動更新排程](#自動更新並發佈到-github-page) 維護。

---

## 這個頁面有什麼

- **三個 Tab**：Claude Code / Codex App / Codex CLI 的官方 changelog 摘要（繁中）
- **6 角色切換器**：依職能（iOS / Android / Backend / Designer / QA / PM）自動過濾「對你有用」的應用靈感卡，「01 應用靈感」標題會隨角色動
- **可點擊靈感卡**：每張卡點開有「為什麼有用」「設定範例」「實戰技巧」三段詳細說明，code 區塊一鍵複製
- **🆕 auto 卡**：排程自動生成的卡片帶金色徽章，內容尚未手動 review
- **時間軸**：依日期排序、可依類別篩選、關鍵字搜尋、分頁載入
- **右上角顯示最後更新時間**（由排程推上來的靜態時間戳）

---

## 本機開啟

只想看內容、不想等線上版：下載 `claude-code-changelog-tw.html`，直接雙擊用瀏覽器打開即可。所有 UI 功能（角色切換、篩選、modal）都能用，看到的是 repo 最後一次更新的快照。

---

## 自動更新並發佈到 GitHub Page

線上版的內容由 **Claude Code 排程 (schedule)** 維護，流程：

```text
排程觸發 → agent 抓三來源 → Edit 更新 HTML → push-changelog 腳本 → git push → Pages 自動重建
```

| 檔案 | 用途 |
| --- | --- |
| [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) | 排程 agent 每次執行的完整指示（抓來源 → 改 HTML → 呼叫 push 腳本） |
| [`scripts/push-changelog.sh`](scripts/push-changelog.sh) | **遠端 / Linux** 用：git pull → commit（台北時間戳）→ push；無變更自動跳過 |
| [`scripts/push-changelog.ps1`](scripts/push-changelog.ps1) | **本機 / Windows** 用，同上 |

三個來源各走最可靠的路徑：

| Tab | 來源 |
| --- | --- |
| Claude Code | `code.claude.com/docs/en/changelog`（官方 HTML） |
| Codex CLI | `api.github.com/repos/openai/codex/releases`（GitHub API，避開 CDN cache） |
| Codex App | `developers.openai.com/codex/changelog/rss.xml`（RSS feed，避開 CDN cache） |

### 設定排程（Claude Code 遠端 routine）

用 `/schedule` 建立一個 **遠端 routine**（在雲端執行，不依賴電腦開機）：

- **cron**：`0 1 */2 * *`（UTC）＝每 2 天 **09:00 台北時間**
- **repo source**：`https://github.com/KuoAnn/ai-changelog`（routine 會自動 clone）
- **prompt**：直接用 [`scripts/refresh-prompt.md`](scripts/refresh-prompt.md) 的內容

> ⚠️ 遠端 routine 要能 `git push` 回此 repo，需該雲端環境具備對 `origin` 的寫入權限（GitHub 整合 / token）。第一次設定後建議「Run now」跑一次驗證 push 成功。

也可在本機手動更新：

```powershell
# 1. 開 Claude Code，貼 refresh-prompt.md 內容讓它更新 HTML
# 2. 或內容已改好，只想 push：
pwsh scripts/push-changelog.ps1 -Message "手動更新"
```

---

## 常見問題

**Q：自動更新會用多少額度？**
每次更新約 50k–100k tokens，每 2 天一次。在意的話可調整頻率（改 cron）或關掉排程。

**Q：能加我自己角色專屬的靈感卡嗎？**
可以。Fork 這個 repo、編 `claude-code-changelog-tw.html` 內的 `INSP_CC` / `INSP_CA` / `INSP_CI` 陣列加新 object，照其他 card 格式寫，`roles` 陣列填角色 id。改完開 PR。

**Q：想加新角色（不是這六個之一）？**
歡迎 PR。需要改：HTML 內 `ROLES` 陣列加新 entry、既有卡片的 `roles` 標籤、加幾張該角色專屬的新卡。

**Q：HTML 變大很多，能拆檔嗎？**
目前刻意保持單一 HTML（self-contained）以利分享、離線使用。

**Q：🆕 auto 卡看起來不對怎麼辦？**
排程每次最多生 2 張 auto 卡，品質不保證。看到不對的：自己編 HTML 拿掉 `auto: true`（變正式卡）或整張刪掉。

---

## 內部結構參考

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

---

## 變更紀錄

| 日期 | 版本 | 變更 |
| --- | --- | --- |
| **2026-06-03** | **v2.0** | **改為純靜態 GitHub Page：移除 Cowork live artifact / 手動「立即更新」按鈕相關 UI 與程式，右上角僅保留最後更新時間；改由 Claude Code 排程更新並 push 觸發 Pages 重建。內容去品牌化（移除組織專屬字樣），靈感卡範例改用通用識別名。** |
| 2026-06-02 | v1.2 | 排程 auto card 生成策略改為「全面積極」：任何使用者面向變動都可成為卡片題材，品質下限維持完整 Why/Setup/Tips。 |
| 2026-06-02 | v1.1 | 三來源策略（HTML / GitHub API / RSS）、靈感卡 auto 徽章、標題隨角色連動、靈感卡依日期排序、Hero 動態計算。 |
| 2026-05-21 | v1.0 | 初版：6 角色、3 Tab、靈感卡、每 2 天排程。 |
