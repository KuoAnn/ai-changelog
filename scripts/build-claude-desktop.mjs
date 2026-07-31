#!/usr/bin/env node
/**
 * 把 data/claude-desktop.json 內嵌成 index.html 的 DATA_CD 陣列。
 *
 * 為什麼要內嵌而不是 runtime fetch：index.html 是 self-contained 單檔，
 * README 明示可直接用瀏覽器開啟（file://），而 file:// 下 fetch 會被 CORS 擋掉。
 * 所以 JSON 是唯一真實來源，HTML 內的 DATA_CD 是 build 產物。
 *
 * 用法：
 *   node scripts/build-claude-desktop.mjs           # 寫入 index.html
 *   node scripts/build-claude-desktop.mjs --check   # 只檢查是否為最新（CI / 驗證用，不寫檔）
 *
 * 冪等：同樣的 JSON 重跑不會產生 diff。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(REPO_ROOT, "data", "claude-desktop.json");
const HTML_PATH = join(REPO_ROOT, "index.html");

const START = "  /* CLAUDE-DESKTOP-DATA:START — 由 scripts/build-claude-desktop.mjs 從 data/claude-desktop.json 產生，勿手改 */";
const END = "  /* CLAUDE-DESKTOP-DATA:END */";

const SEVERITIES = new Set(["critical", "high", "medium", "low"]);

/** JS 字串字面值：用 JSON.stringify 跳脫，再擋掉會提早結束 <script> 的序列。 */
const lit = value => JSON.stringify(String(value ?? "")).replace(/<\//g, "<\\/");

function buildBlock(data) {
  const entries = Array.isArray(data.entries) ? data.entries : [];
  const seen = new Set();
  const rows = entries.map((e, i) => {
    for (const key of ["version", "date", "severity", "title", "summary"]) {
      if (!e[key]) throw new Error(`entries[${i}] 缺少 ${key}`);
    }
    if (!SEVERITIES.has(e.severity)) throw new Error(`entries[${i}] severity 非法：${e.severity}`);
    if (seen.has(e.version)) throw new Error(`entries[${i}] 版本重複：${e.version}`);
    seen.add(e.version);
    const cat = (Array.isArray(e.categories) && e.categories[0]) || "其他";
    return `    {v:${lit(e.version)}, date:${lit(e.date)}, cat:${lit(cat)}, sev:${lit(e.severity)}, ` +
      `title:${lit(e.title)}, body:${lit(e.summary)}},`;
  });
  return [START, "  const DATA_CD = [", ...rows, "  ];", END].join("\n");
}

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const block = buildBlock(data);

const html = readFileSync(HTML_PATH, "utf8");
const from = html.indexOf(START);
const to = html.indexOf(END);
if (from < 0 || to < 0 || to < from) {
  console.error(`[build-claude-desktop] 在 index.html 找不到 DATA_CD marker，請確認 START/END 註解還在。`);
  process.exit(2);
}
const next = html.slice(0, from) + block + html.slice(to + END.length);

if (process.argv.includes("--check")) {
  if (next === html) {
    console.log(`[build-claude-desktop] up to date（${data.entries.length} 筆）`);
    process.exit(0);
  }
  console.error("[build-claude-desktop] index.html 的 DATA_CD 與 data/claude-desktop.json 不同步，請跑 node scripts/build-claude-desktop.mjs");
  process.exit(1);
}

if (next === html) {
  console.log(`[build-claude-desktop] 無變更（${data.entries.length} 筆）`);
} else {
  writeFileSync(HTML_PATH, next);
  console.log(`[build-claude-desktop] 已更新 index.html 的 DATA_CD（${data.entries.length} 筆）`);
}
