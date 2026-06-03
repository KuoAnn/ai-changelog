---
name: install-ai-changelog
description: 把「AI Coding Tools 更新摘要」儀表板安裝到使用者的工作環境，內含 Claude Code / Codex App / Codex CLI 三個工具的 changelog 追蹤、6 角色切換器（iOS / Android / Backend / Designer / QA / PM）自動過濾應用靈感卡。當使用者說「安裝 AI changelog」「裝 changelog dashboard」「執行這個 skill」或拖入此 .skill 檔並要求啟用時觸發。
---

# AI Coding Tools Changelog — 一鍵安裝

這是一份 self-contained 的靜態 HTML 儀表板。線上版由 repo 排程自動維護並發佈到 GitHub Pages（<https://kuoann.github.io/ai-changelog/>）；此 skill 讓使用者把同一份 HTML 安裝到本機 / 工作環境離線使用。

**不要詢問使用者太多細節 — 直接執行，遇到選擇題才問。**

## 步驟 1：找到 bundle 的 HTML 檔案

此 skill 目錄內附 `claude-code-changelog-tw.html`。用 `Glob` 搜尋 `**/claude-code-changelog-tw.html`（或檢視此 SKILL.md 同目錄）找到它的絕對路徑。

找不到該檔：告訴使用者「.skill 包裝有問題，請重拿一份」並停止。

## 步驟 2：複製到使用者工作目錄

把 HTML 複製到一個寫得了、會持續存在的位置。優先順序：

1. 若使用者有選定的工作資料夾，放那邊
2. 否則在 `~/Documents/Claude/Projects/` 下建立 `AI Changelog/` 子資料夾並放進去
3. 否則用 outputs 目錄

用 bash `cp` 或 Write 工具完成複製。

## 步驟 3：開啟

把複製後的 HTML 路徑告訴使用者，請他們用瀏覽器打開即可。所有 UI 功能（角色切換、篩選、modal）都離線可用。

## 步驟 4：完成提示

告訴使用者：

> ✓ 安裝完成！用瀏覽器打開剛剛複製的 `claude-code-changelog-tw.html`。
>
> **第一次打開要做的事：**
> 1. 頂端角色 chip 選自己的角色（iOS / Android / Backend / Designer / QA / PM）
> 2. 看「01 應用靈感」區域 — 已自動過濾成你的角色相關卡片，標題會跟著動（例：選 Android RD → 「Android RD 應用靈感」）
> 3. 點任一張卡可看詳細範例（含可複製的 JSON / YAML / Bash 設定）
> 4. 看到 🆕 auto 徽章的卡片代表是排程自動生成的，可看作起點不完美
>
> **想看最新內容：** 直接開線上版 <https://kuoann.github.io/ai-changelog/>，由排程每 2 天自動更新。要更新本機這份，重新跑一次此 skill 取最新 HTML 即可。

## 錯誤處理

- **HTML 找不到**：包裝壞了，請使用者重拿 .skill
- **複製失敗**：改用其他可寫入路徑（outputs 目錄）並提示使用者實際位置
- **任何其他錯誤**：用繁體中文清楚說明錯在哪、建議使用者怎麼做
