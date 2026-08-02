#!/usr/bin/env node
/**
 * 依 scripts/update-sources.json 抓取所有官方來源，存成「原始快照」＋ index.json。
 *
 * 為什麼需要這支：Claude Code 雲端排程沙箱的出口有兩層封鎖（見 manifest 的 cloudSandbox）—
 * api.github.com / github.com 只放行本 session 掛載的 repo，claude.com / learn.chatgpt.com 等
 * 則被組織 egress 政策在 CONNECT 階段拒絕。GitHub Actions runner 沒有這兩層限制，
 * 且內建 GITHUB_TOKEN 可直接打 releases API，所以改由 Actions 定時把來源原文抓下來、
 * 推到快照分支，排程只讀 repo 內的快照即可完全繞過封鎖。
 *
 * 用法：
 *   node scripts/fetch-snapshots.mjs                 # 輸出到 .snapshots/（已 gitignore）
 *   node scripts/fetch-snapshots.mjs --out <dir>     # 指定輸出目錄（CI 用）
 *
 * 設計約束：
 * - **不解析內容**：只存原文（HTTP body 原樣落地）。解析規則全部留在 refresh-prompt.md，
 *   免得同一套解析邏輯在 CI 與排程各寫一份、日後各自漂移。
 * - **來源唯一定義在 manifest**：本檔不得出現任何官方 URL。
 * - 抓取失敗不中斷，逐筆記進 index.json 的 ok / errorClass，讓排程據此寫 REFRESH_RUN。
 *
 * 退出碼：0＝流程完成（即使部分來源失敗）；2＝manifest 讀取／解析失敗。
 * 「全部來源皆失敗」不在此判定，由 workflow 讀 index.json 的 totals 決定是否讓 job 紅燈。
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(REPO_ROOT, "scripts", "update-sources.json");

const argv = process.argv.slice(2);
const outFlag = argv.indexOf("--out");
const OUT_DIR = outFlag >= 0 && argv[outFlag + 1] ? argv[outFlag + 1] : join(REPO_ROOT, ".snapshots");

const TIMEOUT_MS = 45_000;

/** 各 format 對應的落地副檔名（給人看得懂；解析仍以 index.json 的 format 為準）。 */
const EXT_BY_FORMAT = {
  "github-releases-api": "json",
  atom: "atom.xml",
  rss: "rss.xml",
  markdown: "md",
  html: "html",
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** 排程與頁面統一的時間格式：YYYY-MM-DD HH:MM (Taipei)。 */
function taipeiStamp(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date).reduce((acc, part) => (acc[part.type] = part.value, acc), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} (Taipei)`;
}

/** 由 URL 取一段可讀的檔名主體（去查詢字串與副檔名，非字母數字轉 -）。 */
function slugFor(url) {
  const last = new URL(url).pathname.split("/").filter(Boolean).pop() || "index";
  const base = last.replace(/\.(json|xml|atom|rss|md|html?)$/i, "");
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "index";
}

/**
 * 失敗歸類 — 對應 refresh-prompt.md「403 診斷」的分類，讓排程能直接把 errorClass
 * 映射成 REFRESH_RUN 的 status，不必自己重判一次。
 */
function classify({ status, body, error }) {
  if (error) {
    const message = String(error.message || error);
    if (/timeout|abort/i.test(message)) return { errorClass: "timeout", errorDetail: "連線逾時" };
    return { errorClass: "network", errorDetail: `連線失敗：${message}` };
  }
  if (status === 401 || status === 403) {
    if (/not enabled for this session|sessions are bound/i.test(body)) {
      return { errorClass: "session-binding", errorDetail: "session 未掛載該 repo（GitHub 代理攔截）" };
    }
    if (/cf-mitigated|challenge|attention required/i.test(body)) {
      return { errorClass: "cloudflare", errorDetail: "Cloudflare 擋 datacenter IP" };
    }
    return { errorClass: `http-${status}`, errorDetail: `HTTP ${status}（權限或額度）` };
  }
  if (status === 429) return { errorClass: "rate-limit", errorDetail: "HTTP 429 額度耗盡" };
  if (status >= 500) return { errorClass: `http-${status}`, errorDetail: `來源伺服器錯誤 HTTP ${status}` };
  if (status !== 200) return { errorClass: `http-${status}`, errorDetail: `非預期狀態碼 HTTP ${status}` };
  return { errorClass: "empty-body", errorDetail: "HTTP 200 但 body 為空" };
}

/** 只對「可能自己好」的失敗重試：網路錯誤、429、5xx。4xx 重試沒有意義。 */
const worthRetry = result => Boolean(result.error) || result.status === 429 || result.status >= 500;

async function fetchWithRetry(source, policy, token) {
  const headers = { "user-agent": policy.userAgent || "ai-changelog", accept: "*/*" };
  if (source.format === "github-releases-api") {
    headers.accept = "application/vnd.github+json";
    headers["x-github-api-version"] = "2022-11-28";
    if (token) headers.authorization = `Bearer ${token}`;
  }

  const maxAttempts = Math.max(1, (policy.retryCount ?? 0) + 1);
  let last = { status: 0, body: "", attempts: 0 };
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(source.url, {
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = await response.text();
      last = {
        status: response.status,
        body,
        attempts: attempt,
        finalUrl: response.url || source.url,
        contentType: response.headers.get("content-type") || "",
        rateLimitRemaining: response.headers.get("x-ratelimit-remaining"),
      };
      if (response.status === 200 && body.length > 0) return last;
    } catch (error) {
      last = { status: 0, body: "", attempts: attempt, error };
    }
    if (attempt >= maxAttempts || !worthRetry(last)) break;
    await sleep((policy.retryDelaySeconds ?? 5) * 1000);
  }
  return last;
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
} catch (error) {
  console.error(`[fetch-snapshots] 讀不到或解析不了 manifest：${error.message}`);
  process.exit(2);
}

const policy = manifest.requestPolicy || {};
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
if (!token) {
  console.warn("[fetch-snapshots] 未帶 GITHUB_TOKEN，requiresToken 的來源會以未授權身分抓取（額度 60/hr）。");
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const startedAt = new Date();
const products = {};
const byUrl = new Map();   // 同一 URL 被多個產品共用時（Codex RSS）只抓一次、共用同一份檔案
let okCount = 0;
let failCount = 0;
let skipCount = 0;

for (const [productKey, product] of Object.entries(manifest.products || {})) {
  const sources = (product.sources || []).slice().sort((a, b) => a.priority - b.priority);
  const entries = [];

  for (const source of sources) {
    const base = { priority: source.priority, role: source.role, format: source.format, url: source.url };

    // manifest 標 "snapshot": false 的來源不進快照（通常是與前一層完全重複、又特別肥的 HTML 版本）。
    // 不計入 totals：它不是失敗，只是不收；排程需要時再自行 live 抓。
    if (source.snapshot === false) {
      entries.push({ ...base, ok: false, skipped: true, file: null, bytes: 0, skipReason: source.snapshotSkipReason || "manifest 標記不收快照" });
      skipCount += 1;
      continue;
    }

    const shared = byUrl.get(source.url);

    if (shared) {
      entries.push({ ...base, ...shared.result, sharedWith: shared.owner });
      shared.result.ok ? (okCount += 1) : (failCount += 1);
      continue;
    }

    const fetched = await fetchWithRetry(source, policy, token);
    const common = { fetchedAt: new Date().toISOString(), attempts: fetched.attempts, httpStatus: fetched.status };
    let result;

    if (fetched.status === 200 && fetched.body.length > 0) {
      const file = `${productKey}/p${source.priority}-${slugFor(source.url)}.${EXT_BY_FORMAT[source.format] || "txt"}`;
      const abs = join(OUT_DIR, file);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, fetched.body);
      result = {
        ...common,
        ok: true,
        file,
        bytes: Buffer.byteLength(fetched.body),
        sha256: createHash("sha256").update(fetched.body).digest("hex"),
        finalUrl: fetched.finalUrl,
        contentType: fetched.contentType,
        ...(fetched.rateLimitRemaining ? { rateLimitRemaining: fetched.rateLimitRemaining } : {}),
      };
      okCount += 1;
    } else {
      result = { ...common, ok: false, file: null, bytes: 0, ...classify(fetched) };
      failCount += 1;
    }

    entries.push({ ...base, ...result });
    byUrl.set(source.url, { owner: `${productKey}#p${source.priority}`, result });
  }

  products[productKey] = { displayName: product.displayName || productKey, sources: entries };
}

const index = {
  schemaVersion: 1,
  generatedAt: taipeiStamp(startedAt),
  generatedAtIso: startedAt.toISOString(),
  manifestSchemaVersion: manifest.schemaVersion ?? null,
  runner: process.env.GITHUB_ACTIONS ? `github-actions/${process.env.GITHUB_RUN_ID || "?"}` : "local",
  tokenUsed: Boolean(token),
  totals: { sources: okCount + failCount, ok: okCount, failed: failCount, skipped: skipCount },
  products,
};
writeFileSync(join(OUT_DIR, "index.json"), `${JSON.stringify(index, null, 2)}\n`);

const rows = [];
for (const [productKey, product] of Object.entries(products)) {
  for (const source of product.sources) {
    const mark = source.skipped ? "➖" : source.ok ? "✅" : "❌";
    const note = source.skipped
      ? source.skipReason
      : source.ok ? (source.sharedWith ? `共用 ${source.sharedWith}` : "") : source.errorDetail;
    rows.push(`| ${productKey} | p${source.priority} | ${mark} | ${source.httpStatus || "-"} | ${source.bytes} | ${note || ""} |`);
  }
}
const summary = [
  `# 來源快照 ${index.generatedAt}`,
  "",
  `成功 **${okCount}** / 失敗 **${failCount}**（共 ${okCount + failCount} 個來源${skipCount ? `，另 ${skipCount} 個依 manifest 不收快照` : ""}）`,
  "",
  "| 產品 | 優先序 | 結果 | HTTP | bytes | 備註 |",
  "| --- | --- | --- | --- | --- | --- |",
  ...rows,
].join("\n");

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
