/* =============================================================================
   ai-changelog 資料層（classic script，非 module）
   -----------------------------------------------------------------------------
   - 由排程（scripts/refresh-prompt.md）維護：DATA_CC / DATA_CA / DATA_CI、
     INSP_CC / INSP_CA / INSP_CI 與 REFRESH_RUN 直接改本檔。
   - DATA_CD 是產物：由 scripts/build-claude-desktop.mjs 從
     data/claude-desktop.json 產生，寫在 CLAUDE-DESKTOP-DATA:START/END 標記間，
     🚨 勿手改。
   - 本檔以 <script src> 載入（index.html 主 script 之前）；top-level const
     屬全域 lexical scope，主 script 直接取用。不用 fetch 是因頁面需支援
     瀏覽器 file:// 直開（CORS 會擋 fetch）。
   ============================================================================= */
  /* ===========================
     REFRESH RUN — 最近一次排程抓取的健康度（每次刷新都必須整段重寫）
     -----------------------------------------------------------------
     只描述「這次有沒有抓到」，不描述「資料有多舊」（後者由日期自行推算）。
     sources 的鍵＝index.html 的 agent id：cc / cd / ca / ci，每個來源必列。
       status: "ok"        本次成功抓取（含「確認無新版」）
               "transient" 可重試型失敗：連線失敗 / timeout / API 額度耗盡
               "blocked"   非暫時性阻擋：Cloudflare、環境網路政策、需人工換來源
       detail: 失敗原因（繁中一句，照 refresh-prompt 的 403 診斷分類寫）
     status 非 ok → index.html 會把該機體同步率壓成負值並亮真實警報。
     =========================== */

  const REFRESH_RUN = {
    ranAt: "2026-08-25 22:23 (Taipei)",
    sources: {
      cc: { status: "ok" },
      cd: { status: "ok" },
      ca: { status: "ok" },
      ci: { status: "ok" }
    }
  };

  /* ===========================
     DATA
     =========================== */

  const DATA_CC = [
    {v:"2.1.245", date:"2026-08-25", cat:"Performance/Bug Fix", body:"修復：Linux 發行版搭載 glibc 2.44（例如 Arch Linux、CachyOS 與 Fedora Rawhide）時啟動當機。"},
    {v:"2.1.243", date:"2026-08-24", cat:"Settings/Config", body:"新增：<b>/usage 的 Loops 明細</b>：列出各 <code>/loop</code> 執行次數、總 token、平均 token 與最後執行時間，方便揪出失控或多話的排程任務；<b>modelPicker 設定</b>：以有序、附標籤的模型清單客製 <code>/model</code> 選單（任何 id 拼法，含 Vertex／Bedrock id），可附加或取代內建清單；<b>promptCacheTtl 與 subagentPromptCacheTtl 設定</b>：API key 與雲端供應商使用者可讓主對話維持 1 小時 prompt cache，subagent 仍為 5 分鐘；<b>modelPricing 受管設定</b>：讓組織約定的各模型費率與折扣倍率套用到 <code>/cost</code>、狀態列與遙測費用數字，取代牌價；<b>/login 免金鑰登入</b>：Anthropic Console 下新增「Sign in with your Console account」（建議），與建立 API key 並列，供不允許 API key 的組織登入；<b>/status 新增 Skipped sources 列</b>：列出存在但因較高優先序受管來源生效而未套用的受管設定來源（如 <code>managed-settings.json</code>）；<b>managed 標記</b>：<code>/mcp</code> 與 <code>/plugins</code> 對認證由組織管理的 claude.ai connector 加註標記；<b>GitHub 連結提示</b>：對尚未於 Claude Code on the web 連結 GitHub 的 claude.ai 使用者，顯示指向 <code>/web-setup</code> 的提示，<code>/status</code> 亦新增一列顯示 Pro／Max 方案的連結狀態；<b>subagent 模型標示</b>：<code>/tasks</code> 與 agent 詳情對話框新增顯示每個 subagent 使用的模型與 effort 等級。修復：非互動（<code>-p</code>）與 SDK session 中的遠端 MCP 伺服器連線中斷後永不恢復，現會自動重連或回報失敗；從桌面 App 啟動的 MCP 伺服器登入，在支援 client ID metadata 文件的伺服器（如 Linear）上以「Invalid redirect URI」失敗；暫時性伺服器端停用被快取、後續 flag 擷取又失敗時，auto mode 於啟動時持續不可用；API 短暫過載並要求用戶端重試約一分鐘後，auto mode 工具呼叫被拒為「暫時無法使用」；<code>/model</code> 選單靜默忽略 Ultracode 選擇，現選取後會立即套用到目前 session；<code>/resume</code> 僅列出最近 50 個 session，選單現會隨捲動載入更多；雲端 session 於回合中途重啟後恢復時，待處理的 hook 或背景任務通知被當成提示重送，而非正常接續訊息；2.1.232 socket 目錄強化後，跨 session 傳訊在使用者命名空間與 rootless 容器內靜默失效；溢出容器的文字（如 <code>/login</code> 的登入網址）於畫面其他部分重繪時遺失開頭欄位；緊接在 emoji 後輸入的拼錯字，<code>spellcheck</code> 未加底線標示；背景 subagent 的最後一個背景 Bash 任務完成時未被喚醒；Anthropic API 從未開始回應時 session 靜默逾 10 分鐘，現改為約 3 分鐘逾時、重試一次，之後顯示 <code>API Error: No response from API</code>；認證、模型可用性等用戶端產生的錯誤訊息，渲染成模型輸出而非錯誤列；CI 中同一 job 內多個程序現共用已交換的 workload identity federation token，不再重複交換一次性 token，遭拒的交換會立即失敗並顯示伺服器訊息；以登入開始的 session（如 <code>/logout</code> 後首次啟動）在啟動時未顯示伺服器管理的 <code>companyAnnouncements</code>；hook 的 <code>if</code> 條件（如 <code>Bash(cat *)</code>）在指令含 <code>$()</code> 或反引號命令替換並接續更多參數時，誤觸發於不相關的 Bash 指令；以 <code>marketplace</code> 欄位宣告依賴的 plugin，透過 <code>--plugin-dir</code> 一起載入兩個 plugin 時永遠無法解析；最後一個 LSP plugin 停用後 <code>/reload-plugins</code> 仍保留 LSP 工具，現會一併移除，並在會重新讀取對話的 LSP plugin 變更前顯示警告；<code>--agents</code> 靜默忽略無效 JSON 或無效 agent 定義，現會如 <code>--mcp-config</code> 一樣顯示明確錯誤並結束；<code>~/.claude.json</code> 內有無效 MCP 伺服器項目時，<code>/status</code> 顯示「Found invalid entries in: .」卻無檔名；<code>/clear</code> 會把提示列的 <code>/rename</code> session 名稱移除，即使該名稱其實保留給新 session；<code>~/.claude/history.jsonl</code> 內含格式錯誤項目時，Ctrl+R 歷史搜尋與上箭頭歷史失效；在會將修飾鍵編碼（modifyOtherKeys／kitty protocol）的終端機中，Ctrl+[ 無法離開 vim INSERT 模式；<code>NO_PROXY</code> 列出 <code>localhost</code> 但非小寫 <code>no_proxy</code> 時，本機 IDE 連線被誤經過 <code>HTTPS_PROXY</code> 轉送（有時因此失敗），現兩種大小寫皆會被遵循；被擋的指令仍以 exit 0 結束時（如 <code>curl</code> 印出 proxy 的 403 頁面），沙箱網路違規細節從 Bash 工具結果中遺失；狀態列 <code>rate_limits</code> 欄位與 <code>/usage</code> 於視窗重置後、session 閒置期間，仍顯示重置前的用量百分比；<code>claude --teleport &lt;session&gt;</code> 遇到未提交變更時直接結束，而非如 session 選單般提供暫存並繼續；較舊、不支援 <code>gh auth token</code> 的 GitHub CLI 已完成認證時，<code>/web-setup</code> 仍反覆要求登入；Claude in Chrome 於自動更新清除其設定所用版本後與 Claude Code 斷線，原生 host 現改由穩定的 <code>claude</code> launcher 啟動；[VSCode] 在功能旗標首次擷取前啟動的 session（如安裝後立即啟動）以預設權限模式開啟，而非 auto mode 或設定的預設模式；[VSCode] 已展開的 Focus view 區塊於 subagent 工具活動期間自行收合；<code>claude remote-control</code> 於伺服器在 session 中途丟失其環境時結束並讓已連接的 Remote Control session 失聯，現會自動復原；由 <code>claude remote-control</code> 服務的 Remote Control session，在停止並重啟後，對沒有 admin 或 owner 角色的 Team／Enterprise 成員有時卡住。其他改進：啟動效能改善，沙箱與 MCP 啟動不再阻塞首幀，裸啟動略過子指令註冊，workflow 探索、設定與信任存放區作業成本降低；原生安裝與自動更新下載體積改善，二進位檔改用 zstd 壓縮（Linux x64 約 75MB，原為 340MB）；直接以 <code>ANTHROPIC_AUTH_TOKEN</code> 對 Anthropic API 認證的 session，用量遙測歸屬組織的準確度提升，其資料處理設定得以套用；原生二進位體積再減約 2MB，內建 skill 與提示文字改用更精簡儲存方式；原生建置記憶體用量改善，程式碼改為隨需載入而非整包常駐（每 session 約省 40–70MB）；長時間執行 session 的尖峰記憶體用量改善（heap 成長時 runtime 現會更早進行垃圾回收）；<code>/login</code> 透過 SSH 的體驗改善，登入網址立即顯示，按 <code>c</code> 會回報網址實際如何被複製而非一律宣稱成功，並提供全螢幕下選取文字的提示；effort 設為 <code>xhigh</code>／<code>max</code> 卻關閉 thinking 時的錯誤訊息改善，現會指出等級、關閉 thinking 的設定與修正方式 <code>/effort high</code>；<code>/loop</code> 改善，Claude 無事可做的連續喚醒現摺疊成終端機單一行，而非逐筆列印；跨 session 傳訊收件匣 socket 改為關閉 30 秒內未送出完整一行的連線，透過此管道發訊的腳本應等資料就緒後再連線；恢復其 Remote Control 被另一個終端機持有的對話時，提示訊息改善，現會說明其他機器上的 session 彼此看不到也連不到本機；[VSCode] 長 session 的歷史裁剪改善，優先捨棄較舊的工具活動列，讓使用者訊息與 Claude 回覆保持可見；[VSCode] 已用 Claude 帳號登入時，擴充功能自身用量遙測歸屬組織的準確度改善，其資料處理設定得以套用。變更：沙箱化 Bash 工具提示不再列出允許的網路主機，改為讓 Claude 直接嘗試請求（可核准新主機），而非假設未列出的主機一律被擋；<code>/model</code> 選單與內建 <code>claude-api</code> skill 更新為顯示 Sonnet 5 每 Mtok $2/$10 的標準牌價，而非限時促銷價；macOS 上點擊桌面、Dock 或 Finder 視窗現需透過存取對話框授權 Finder，與其他一般 App 相同；<code>/model</code>、<code>/fast</code>、<code>/effort</code> 在 Bedrock、Vertex、Foundry 或關閉遙測時改為立即執行，不再排入該輪結束後才生效。"},
    {v:"2.1.241", date:"2026-08-23", cat:"Performance/Bug Fix", body:"修復：一般錯誤修復與穩定性改善。"},
    {v:"2.1.240", date:"2026-08-22", cat:"Performance/Bug Fix", body:"修復：一般錯誤修復與穩定性改善。"},
    {v:"2.1.239", date:"2026-08-21", cat:"UI/UX", body:"新增：<b>資料落地地區 1.1 倍推論費用計入成本試算</b>（<code>/cost</code>、狀態列、<code>--max-budget-usd</code>）；Bedrock、Vertex、Foundry 等先前排除在外的部署現亦提供一次性全螢幕渲染器體驗詢問，該類新安裝現直接以全螢幕啟動；新增 <b><code>/claude-api upgrade</code></b>：協助 Python 專案由 <code>anthropic</code> 0.x 遷移到 1.x，並更新該 skill 的 Python 參考文件以符合 1.x（逾時改用 <code>anthropic.Timeout</code> 而非 <code>httpx.Timeout</code>）；雲端 session 中由 claude.ai 同步的 plugin 現顯示為 <code>name@synced</code>，可用 <code>claude plugin enable/disable &lt;name&gt;@synced</code> 操作，且不會覆蓋同名的本機安裝 plugin；Alpine／musl 建置現可載入原生圖片貼上、剪貼簿與錄音擴充套件（改用 musl 建置的二進位檔，不再被執行環境拒絕先前的 glibc 版本）；月額度已用盡時顯示的用量上限訊息，現亦會說明 session 或週額度何時重置。修復：Bedrock 串流在會剝除回應 Content-Type header 的 proxy 後方運作異常，曾靜默讓每輪對話改為非串流重跑並使 API 呼叫計費加倍；搭配 SSO profile 與 <code>awsAuthRefresh</code> 使用 Bedrock 時，Claude Code 在 HTTPS proxy 後方啟動卡住（憑證預先檢查現遵循 <code>HTTPS_PROXY</code>）；從已不存在的目錄啟動 Claude Code 時顯示原始當機傾印，現改為清楚的錯誤訊息；JetBrains IDE 終端機中，Claude Code plugin 連線時 Edit 與 Write 呼叫會暫停約 5 秒；佇列中的提示按下 Esc 時的競速問題，可能讓下一輪提前結束、使 session 顯示閒置但 Claude 仍在執行，導致稍後重送指令時動作重複；<code>WebFetch</code> 將過期頁面內容保留整個 session 而非預定的 15 分鐘；雲端 session（網頁、桌面與行動版 Claude Code）在閒置 worker 重啟後未能維持 plan mode 恢復；全螢幕模式下高度超出終端機的 MCP elicitation 表單被裁切，現會自動縮放以符合視窗，隱藏欄位可捲動檢視，Accept／Decline 一律可見；雲端 session 或透過 SDK <code>setMcpServers()</code> 時，遠端 MCP 伺服器在 session 中途重連遇到暫時性 5xx 後持續顯示失敗；重新命名後 transcript 累積逾約 64KB，自訂 session 標題會從 <code>/resume</code> 消失；<code>claude -c</code>／resume 誤抓路徑僅差 <code>_</code>、<code>-</code> 或 <code>.</code> 等字元的不同目錄 session；<code>/resume</code> 與 agents 檢視誤把僅檔案被觸碰或重新開啟的 session 標記為近期變更並重新排序；all-projects 模式下 <code>/resume</code> 誤導使用者 <code>cd</code> 進已刪除的目錄（如已移除的 worktree），現改為在目前目錄恢復；<code>dark-ansi</code> 主題在全螢幕模式下展開工具結果時文字與背景同色；全螢幕渲染器詢問在永遠無法作答時仍每次啟動出現，現於顯示滿三次後停止；<code>.worktreeinclude</code> 中以 <code>**/</code> 開頭的樣式，於目標位於已被 gitignore 的目錄時靜默無效；以 UTF-8 BOM 開頭的 agent、skill 與指令 <code>.md</code> 檔案被靜默忽略；<code>/insights</code> 在部分模型上於回應中原樣顯示 <code>&lt;message&gt;</code> 標籤；marketplace 的 <code>metadata.pluginRoot</code> 未生效，現裸露的 plugin 來源名稱會依文件所述在其下解析；瀏覽器式終端機中滑鼠事件跨多次寫入分段送達時，會把類似 <code>\"35;150;7M\"</code> 的文字插入提示框；自訂主題對 effort／ultracode 狀態徽章顏色的覆寫被忽略；OpenTelemetry trace 分裂：被 <code>PreToolUse</code> hook 延後的工具執行現接續原始輪次的 trace 而非另開新 trace；agent 檢視下的 vim 模式，Escape 現切換為 NORMAL 模式並保留輸入文字而非清空；<code>selection:copy</code> 鍵綁定會靜默捨棄以 Shift+方向鍵擴充的文字選取；停用語音聽寫後 <code>voice.enabled</code> 設定仍出現 <code>/voice</code> 啟動提示；shell 模式（<code>!</code>）Tab 補全會從 <code>./script</code> 路徑中誤刪 <code>./</code>，導致 shell 無法執行；全螢幕模式下僅為讓終端機視窗回到前景而點擊，卻誤觸核准權限提示或按鈕；全螢幕模式下 slash command 面板（如 <code>/config</code>、<code>/model</code>）遮住最新訊息，現對話內容固定顯示於面板上方；Claude 仍在回覆時開啟 <code>/workflows</code> 詳細對話框，會溢出終端機並讓標頭捲出畫面；Linux sandbox 讓不存在的 <code>.git/config.worktree</code> 變得不可讀，導致設有 <code>extensions.worktreeConfig</code> 的 repo 內所有 sandboxed git 指令失敗；session 工作目錄被刪除後 hooks 以「posix_spawn ENOENT」失敗，現改為從專案根目錄或家目錄執行；<code>claudeMdExcludes</code> 在樣式指名規則目錄本身或其符號連結（而非目標）時，無法排除符號連結的 <code>.claude/rules</code> 檔案；兩個 Claude Code 程序共用同一背景工作狀態時，session 標題向 Remote Control 失控式同步（2.1.232 回歸），現標題更新已去重並限流；標題以 <code>/</code> 開頭的 session 無法被 <code>SendMessage</code> 定址、在 <code>ListAgents</code> 顯示為「(untitled)」；游標位於 <code>[Pasted text #N]</code> 佔位字內時，Ctrl+W、Ctrl+U、Ctrl+K、Option+Backspace、Option+D 與 vim <code>df</code>／<code>dt</code> 會留下破損的佔位字；登入代碼欄位等遮罩（密碼式）輸入框的文字，可被 Ctrl+Y 貼到別處，或於雙按 Esc 清空時存入提示歷史；搜尋框中 Ctrl+Backspace 只刪一個字元而非一整個字詞；組織政策檢查拒絕的請求，會在拒絕訊息顯示前就被重送。其他改進：改進壓縮後顯示的提醒文字，避免 skill 原始參數被當成新請求重跑；工具列上過長的檔案路徑現於中段截斷以維持單行；長時間執行的 <code>SessionStart</code> 或 <code>Setup</code> hook 期間，遠端 session 持續傳送 keep-alive，避免容器因閒置被回收；<code>/goal</code>：長時間背景工作的重複查看進度現改為漸進間隔（30 分鐘、接著 1 小時、之後每 2 小時），不再固定每 30 分鐘一次；<code>/goal</code>：從 <code>claude --resume</code> 選單恢復 session 現會還原其進行中的 goal；<code>ListAgents</code> 現會告知 session 自己的名稱（供其他 session 傳訊使用），對自己名稱呼叫 <code>SendMessage</code> 現會明確提示而非顯示「no agent named …」；<code>ListAgents</code>／<code>/list-agents</code> 現會列出即時的隊友（先前僅顯示 subagent 與其他 session，可連線的隊友曾顯示為不存在）；<code>keybindingFlavor: \"readline\"</code> 現對詞彙鍵亦比照 Bash：Alt+F 與 Ctrl／Option+→ 停在詞尾、Alt+D 刪到詞尾（Ctrl+Y 可貼回）、標點符號可分隔詞彙；持續重試模式（<code>CLAUDE_CODE_RETRY_WATCHDOG</code>）遇到組織額度或費用上限錯誤時現改為立即失敗，不再無限等待重置；Claude in Chrome：<code>/clear</code> 現會關閉該 session 的 Chrome 分頁群組，<code>/resume</code> 與 Claude Code 結束時會關閉空的分頁群組；遠端 session：從手機上傳的圖片現包含其儲存路徑，讓 Claude 可將其複製進新建立的檔案；Claude Code on the web：Bash 與其他工具對非 API 的 anthropic.com 主機（如 www、docs）的請求現會經過該 session 的網路 proxy，因此環境允許的網域設定同樣適用；Remote Control：帳號未啟用 Remote Control 時的訊息與 <code>claude doctor</code> 說明更清楚；Windows：現支援跨 session 傳訊，同機的 Claude Code session 之間可用 <code>SendMessage</code> 互傳訊息、以 <code>ListAgents</code> 互相尋找，與 macOS／Linux 一致；[VSCode] 用量上限橫幅內的「View usage」現與警告文字同列，不再浮動於橫幅中間。"},
    {v:"2.1.238", date:"2026-08-20", cat:"Plugins/MCP", body:"新增：<b>keybindingFlavor 設定</b>：設為 <code>\"readline\"</code> 時提示框內 Ctrl+W 會如 Bash 般刪到前一個空白字元，預設 <code>\"classic\"</code> 不變；<b>Plugin marketplace headersHelper</b>：url marketplace 或 catalog 項目可設定 <code>headersHelper</code>，執行指令為 catalog 與同源封存檔擷取即時產生 HTTP header（如短效 token），catalog 項目的 <code>headersHelper</code> 僅於安裝／更新該 plugin 時執行並先顯示指令，<code>claude plugin install/update</code> 會詢問 <code>[y/N]</code>（或帶 <code>-y</code>）；<b>self-hosted-runner 新增 <code>--defer-shutdown-max-min</code></b>：收到 SIGTERM 後持續服務已連接的 session，逾時後才釋出並結束；<b>self-hosted-runner 新增 <code>--proxy-authorization-command</code>／<code>--proxy-authorization-file</code></b>：供每次連線都需重新發出 <code>Proxy-Authorization</code> header 的 egress proxy 使用。修復：長時間互動 session 記憶體無限成長，subagent 工具結果離開近期顯示視窗後即釋出；自訂／專案／plugin 的 output style 於 session 中途飄回預設語氣；<code>CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=true</code> 於用量接近但未超過上限時未能持續顯示提示建議；worktree-isolation 的 Bash 拒絕訊息在指令本無 redirect 時仍要求移除 redirect；自架 runner 因單次緩慢或遺失的輪詢請求即被伺服器移除、把健康的 session 轉交其他 runner；MCP elicitation 對話框在網址超過 4096 字元時不顯示內容，權限提示在專案路徑超出終端機寬度時遺失「不再詢問」選項；Bash 指令被終止、逾時或中斷時殘留的 <code>/tmp/claude-*-cwd</code> 檔案；大量按鍵連續送達（慢速 SSH／mosh）時終端機以 Ctrl+H 代表 Backspace 卻遭忽略；權限提示 diff 中含寬字元（如 emoji）或 tab 的行被裁切；終止暫停中（Ctrl+Z）的 session 有時讓終端機卡在 bracketed-paste 模式且游標隱藏；stdio MCP 伺服器在 <code>initialize</code> 前收到 <code>server/discover</code>，導致延遲啟動的伺服器每次開啟 session 都要重新啟動後端；proxy 拒絕連線被回報成通用網路錯誤而非指名該 proxy；prompt cache 已過期時仍出現 <code>/model</code>／<code>/effort</code> 快取未命中警告；Remote Control tasks 面板的單一任務 Stop 在 CLI-hosted session 上無效；未帶有效角色的使用者訊息造成遠端 session 結束；<code>claude remote-control</code> 啟動的 session 繼承啟動 shell 的 session 範圍環境變數；Remote Control session 程序當機後持續無法使用，需重啟 <code>claude remote-control</code>（現可於下次傳訊時重新使用）；透過網頁或 Desktop 在 Claude 仍在回覆時送出的 Remote Control 訊息，回合結束後從 transcript 消失；手機或網頁上選取的 Remote Control 模型未同步更新終端機顯示；短暫網路中斷延遲更新登入時 Remote Control 誤判「login expired」而斷線（現改為重試並保持連線）；登出時 Remote Control 誤報重新連線失敗（現以明確訊息結束 session）；<code>claude remote-control</code>（伺服器模式）或 Desktop／IDE host 執行的 session 中 <code>ListAgents</code>／<code>SendMessage</code> 誤報「Remote Control is not connected」；<code>ListAgents</code>／<code>SendMessage</code> 會顯示出為下個背景 session 預熱的閒置 worker（現僅任務認領後才顯示）；跨 session 傳訊到拒收（如 <code>crossSessionInbound: \"refuse\"</code>）的本機 session 時誤報成功（現回報「refused」）；收件匣捨棄訊息（額度或佇列已滿）的 session 現會告知寄件端而非讓訊息無聲消失。其他改進：bare <code>claude</code> 在 macOS 啟動更快；改善 zsh 特有語法在 shell 條件式的 Bash 工具權限判斷；Remote Control 連線韌性提升，網路邊界／VPN／proxy 造成的短暫 HTTP 403 拒絕可容忍最長 3 分鐘並指名造成阻擋的一方；自動更新檢查改為啟動約 10 秒後才執行，避免與啟動搶 CPU；更新內建 <code>claude-api</code> skill 以配合 Managed Agents 8/19 版本（自架 sandbox 的網路搜尋／擷取網域設定與記憶體儲存）。變更：全螢幕模式下 Ctrl+L 與 Cmd+K 一律僅重繪畫面，移除連按兩次觸發 <code>/clear</code> 的捷徑，1 列高的 nvim 終端機不再誤觸自動 <code>/clear</code> 迴圈；<code>claude mcp list</code>／<code>claude mcp get</code> 對已停用的伺服器顯示 <code>⊘ Disabled</code>，不再為健康檢查而連線；專案 <code>.mcp.json</code> 內的 <code>headersHelper</code>，以及專案或 <code>--add-dir</code> agent 檔內的內嵌 MCP 伺服器，現需該資料夾已通過信任對話框（<code>claude -p</code> 下亦同）；來自專案 <code>.mcp.json</code>、plugin 或 agent 檔的 <code>headersHelper</code> 執行時不繼承憑證環境變數，使用者、受管與 claude.ai 範圍的 helper 現改由 Claude 設定目錄執行。"},
    {v:"2.1.237", date:"2026-08-20", cat:"UI/UX", body:"修復：LLM gateway 或自訂 base URL 下 session 的 prompt caching 失效。新增：<b>內建 Concise 輸出風格</b>：Claude 回覆優先給出結果、省略前言與旁白，仍同樣徹底完成工作，可在 <code>/config</code> 的 Output style 選取。"},
    {v:"2.1.236", date:"2026-08-19", cat:"Settings/Config", body:"新增：<b>ANTHROPIC_DEFAULT_MODEL 環境變數</b>：設定新 session 預設啟動模型，<code>/model</code> 選擇仍可覆寫並在重啟後保留（不同於 <code>ANTHROPIC_MODEL</code>）；<b>跨 session SendMessage 新增 notify_when_idle</b>：可要求同機另一個 Claude Code session 於下次進入閒置狀態時發出一次性通知，選擇性開啟、不需輪詢（macOS 與 Linux）；<b>沙箱強化</b>：macOS 上萬用字元讀取拒絕規則（如 <code>**/.env</code>）現於允許讀取範圍內優先生效，涵蓋比對到目錄下的所有內容，且無法透過重新命名被拒絕檔案繞過。修復：目錄於 session 切換進入後被移除會導致剪貼簿複製、背景維護、背景 session 與本機 MCP log 全部失效（自 2.1.229 起的回歸）；全螢幕渲染器初次啟動失敗後永久失效，現改為退回傳統渲染器而非每次啟動都結束；<code>/model</code> 選單渲染高度超出終端機視窗，現僅顯示視窗容納的模型數量，其餘可捲動瀏覽；<code>SendMessage</code> 在結尾標籤格式錯誤導致訊息文字被留在摘要欄位時遭拒；子程序啟動失敗時的未處理 promise rejection（例如 WSL 停用 Windows interop 時的 <code>powershell.exe</code>，2.1.234 回歸）；全螢幕模式下終端機視窗調整大小後，新送出的訊息有時要等到下次更新才顯示；清除多行提示後上方殘留空白區塊，以及全螢幕模式下視窗縮放後再還原未正確重繪；受管設定核准提示偶爾未在啟動時顯示，卻仍把第一個按鍵當作核准；tmux（iTerm tmux 整合）終端機分頁標題跳動，現改為文字變動才寫入而非每 960ms 動畫刷新；雲端環境清單回傳空白或格式錯誤時的不明確錯誤訊息；使用 Remote Control 時 Fable 5 首次用量點數提示逾 60 秒未回應會自動選擇備援模型；<code>~/.claude.json</code> 快取的 guest-pass 獎勵格式錯誤時，spinner tips 永不顯示且持續背景報錯；SDK／VS Code session 的 skill 熱重載於 session 工作目錄被刪除後（2.1.229+），每次 skill 變動都拋出錯誤；自架執行環境 session 於閒置、退役或啟動逾時釋出時，偶爾在前一個 post-session hook 完成前就搶先在其他 runner 上恢復；Clawd 吉祥物在 iTerm2 特定字型大小下眼睛與腳渲染不均；偶發的連續 session 摘要暴衝（現將自動與 <code>/recap</code> 摘要文字上限設為 400 字元，並於字詞邊界截斷）。其他改進：啟動效能改善，session 計數器改為背景寫入；auto mode 改善：啟用 auto mode 時 <code>Monitor</code> 的允許規則會暫時擱置，Monitor 指令與 Bash 指令一律接受相同審查；auto mode 在 Bedrock、Vertex AI、Foundry 或關閉遙測時，分類器改用與 Claude API 相同的預設值（含嚴重性評分分類）；auto mode 的 git status 檢查不再被 repo 的 <code>status.showUntrackedFiles=no</code> 設定誤導成回報乾淨工作區。變更：<code>/model</code> 選單改為僅標示最新模型名稱，讓標示對準新發布版本而非清單中任意子集；<code>/goal</code>：閒置 session 的 goal 卡在長時間背景工作後方時，現會於 30 分鐘（接著 1 小時、2 小時）後自動確認進度，不再等待使用者返回；<code>/usage</code> 現對 Team 與 Enterprise 成員顯示用量點數花費列，尚未花費時顯示上限為 0% 的列；print／SDK 模式下 SIGTERM 不再記錄中斷的回合或合成工具拒絕紀錄再結束，執行中指令仍會被終止且程序仍以 code 143 結束；在 slash command 打錯字或該 session 無法使用的指令上按 Enter，現會回報錯誤而非執行最接近的模糊比對結果（前綴與別名仍可執行）；Remote Control 現會在 CLI 結束或其終端機關閉的數秒內將 session 標為離線；<code>SendMessage</code> 現會在短時間內大量訊息即將超出收件 session 收件匣上限時提前拒絕後續訊息，而非回報已送出卻實際被捨棄；提示框邊框上的 session 標題晶片與 footer 右側邊界對齊；footer 右側對齊項目（goal 指示器、session 狀態、背景 agent 狀態）與截斷提示現與提示區其他元素共用一致的右邊界；[VSCode] transcript 新增螢幕閱讀器支援：回覆、權限請求、錯誤與狀態變更皆有即時播報，並支援逐輪標題導覽。"},
    {v:"2.1.235", date:"2026-08-18", cat:"UI/UX", body:"新增：<b>拼字檢查（spellcheck）設定</b>：可選擇啟用，輸入 prompt 時以已安裝的 <code>aspell</code>、<code>hunspell</code> 或 <code>ispell</code> 為錯字加底線。修復：語言伺服器於 session 中途斷線或重新連線時，整個 prompt cache 失效；巢狀 markdown 清單項目在第 3 層以上發生錯位，終端機 UI 換行清單項目現補上垂懸縮排；多行 prompt 中，輸入提示高亮（slash command、關鍵字、mention）位移一至多個字元；權限提示的備註欄位內按 Shift+Tab 會核准該編輯並授予整個 session 的編輯權限，而非關閉欄位；Agent 工具在 general-purpose 代理不可用的 session 中仍宣告其為預設值，省略 <code>subagent_type</code> 現會清楚列出可用 agent 並報錯；notebook 儲存格刪除／取代核准對話框在無法讀取該筆記本或儲存格時靜默省略既有內容，現會說明原因；Claude 回應期間執行的 slash command 顯示 HTML 實體而非實際字元；背景自動更新後，提示 footer 未顯示「Update installed」重啟通知；展開的任務清單（<code>ctrl+t</code>）在恢復或重新啟動仍有未完成任務的 session 時，一律從收合狀態開始。其他改進：<code>/ultrareview</code>、<code>/autofix-pr</code> 等雲端 session 於背景執行時，不再每次更新都重新掃描並重繪事件串流，降低記憶體與 CPU 用量；權限對話框顯示文字與「不再詢問」選項現一律對應實際授權範圍，內容無法完整顯示時不提供「不再詢問」；原生 macOS／Linux 版內建 <code>grep</code> 對病態樣式現快速失敗而非耗盡記憶體，<code>-m N</code> 搭配 <code>-A</code>／<code>-C</code> 現印出正確的上下文；context 上限錯誤訊息現會說明 auto-compact 是否關閉並指向 <code>/config</code> 重新開啟；Vim 模式下切換詳細 transcript（ctrl+o）或關閉面板時保留 NORMAL 模式與游標位置；對話框快速按方向鍵與 Enter 現會選取實際導覽到的選項而非先前反白的選項；<code>SendMessage</code> 現會於傳送前即拒絕過大而無法跨 session 遞送的訊息，不再靜默捨棄；Remote Control 的 <code>claude rc</code> 現套用與互動啟動相同的 enterprise gateway 可用性檢查；[VSCode] 修復視窗含多個 Claude 面板被還原或重新載入時，焦點在已開啟分頁間自行跳動。"},
    {v:"2.1.234", date:"2026-08-17", cat:"Permissions/Security", body:"新增：<b>CLAUDE_CODE_PROJECT_DIR_NAME 環境變數</b>：讓各 session 有獨立設定目錄的 host 可為逐專案 transcript 目錄自訂簡短名稱；<b>selection:clear 鍵綁定動作</b>：可綁定按鍵清除 App 內文字選取，於 agents 檢視同樣適用；<b>GitLab merge request 徽章</b>：footer 與 statusline 對有 GitLab remote 且已認證 <code>glab</code> CLI 的 repo 顯示 MR <code>!N</code> 與 draft／pending／green 狀態；<b>用量上限重置後自動接續</b>：claude.ai 用量上限重置時自動接續先前 session，可於 <code>/config</code>（「Continue automatically at usage limit」）關閉；Claude 現改為僅將使用者帳號 email 用於身分識別，除非使用者要求，不會傳送給無關服務；<b>Windows NT 命名空間路徑加固</b>：remote file read、session restore、CLAUDE.md include、workflow script 與檔案上傳現一律拒絕 Windows NT 命名空間（<code>\\??\\</code>）路徑，強化尚未涵蓋的 pre-approval 檔案存取，防範 NTLM 憑證外洩漏洞。修復：長 session 於對話已壓縮後，auto mode 反覆重新檢查並拒絕 sandbox 指令的網路存取；回答背景 subagent 工具權限提示時，session 層級的權限設定（含拒絕）被捨棄；非串流 fallback 路徑（常見於第三方 gateway）回應缺少 thinking 或 text 欄位時崩潰；含特殊 Unicode 序列的訊息 markdown 渲染極度緩慢；<code>SendMessage</code> 在收件者名稱達 200 字元上限或含大量 emoji 時，拒絕從 <code>ListAgents</code> 複製而來的收件者；git remote 含特殊 userinfo 時 repo 偵測誤判主機，導致連結與行為對錯誤主機生效；MCP 診斷會印出已解析的機密，現改為顯示原始 <code>${VAR}</code> 形式，連線失敗細節僅顯示伺服器來源；<code>strictKnownMarketplaces</code> allowlist 誤放行主機與 git 實際連線主機不同的 SCP 風格來源；全螢幕模式下複製 <code>/login</code> OAuth 網址等 modal 文字會遺失字元；渲染 markdown 的 <code>---</code> 水平線與下一行黏在一起；待辦事項／任務更新穿插於連續 shell 指令之間時，被拆成多列「Ran 1 shell command」；<code>!</code> shell 指令執行完成時，關閉如 <code>/permissions</code> 等執行中的對話框；用上鍵編輯佇列中的 <code>!</code> shell 指令後，改以純文字送給模型；佇列訊息在仍排隊時重新出現於提示歷史、選取佇列訊息時按 Esc 誤中斷該輪、送出後 <code>!</code> 模式卡住不消失；接受「Try the new fullscreen renderer?」提示會重啟 session 並遺失原本的權限模式（如 <code>--dangerously-skip-permissions</code>）、工具允許／拒絕規則、model 或 effort 旗標；<code>/tui</code> 重啟時遺失啟動旗標的 <code>--allowed-tools</code>／<code>--disallowed-tools</code> 規則，現改為 session 有無法沿用的限制時拒絕切換並說明原因；目錄早於其 repo 存在時，trust 提示遺漏整個 repo 範圍的警告；IDE diff 分頁在權限重新提示期間關閉，會以先前輸入回答新提示；Remote Control 由 Claude Code Desktop 或 VS Code 主控時傳給使用者的檔案未上傳，導致手機與網頁端顯示空白卡片；<code>/login</code> 後若已設定 <code>CLAUDE_CODE_OAUTH_TOKEN</code>，過期 token 提醒外洩到 Claude 自動接續的該輪對話，現僅顯示給使用者；權限預覽現只轉發給收件通過信任閘道的頻道伺服器，且伺服器明確退出權限能力時予以尊重；轉發的權限預覽上，憑證遮罩曾讓核准者看不到指令、路徑或目的地，超大私鑰區塊現以完整強度遮罩；權限預覽上，直接接在 shell 分隔符號後的 provider API token 現亦會遮罩；Claude Desktop 跨 session 訊息在收件 session 誤判跨 session 訊息已停用時遭靜默捨棄，導致寄件端查詢卡在「thinking」長達數分鐘。Remote Control：改用不同 claude.ai 帳號或組織登入這台電腦時，數秒內即停止執行中 session 並說明原因，不再要數小時後才顯示誤導性的 HTTP 404；由 Claude Code Desktop 或 VS Code 啟動的 Remote Control session，現會持續讓手機與 claude.ai/code 同步該 session 的權限模式（與 claude.ai/code 上的 model）；在手機或 claude.ai/code 選擇的 effort 現套用至終端機與 Desktop／VS Code 主控的 session，session 亦會將自身 effort 等級發佈給已連線的用戶端。其他改進：<code>SendMessage</code> 與 <code>ListAgents</code> 會提示帳號 session 清單過長、未能完整檢查，而非把看不到的 session 當成不存在；過期的 Anthropic profile 憑證現會在 claude.ai 登入具優先權時導向 <code>/login</code>；transcript 內自己輸入的提示詞現與回覆一樣以 markdown 渲染（含語法標色的程式碼區塊、行內程式碼、清單）；改進「API returned an empty or malformed response」錯誤訊息，說明實際收到的內容（content type、body 種類、大小、request ID）與原始串流請求失敗原因；自動產生的 session 標題改為簡短具體名稱（如「Login button bug」）而非覆述請求的完整句子；內建 <code>claude-api</code> skill 的載入 context 成本由約 20 萬 token 降至約 2.5 萬 token，改為按需載入參考文件；<code>/permissions</code> 現可在 Claude 執行中開啟，規則變更套用至該輪剩餘部分；<code>/add-dir &lt;path&gt;</code> 現可在執行中使用，<code>/add-dir</code>、<code>/autocompact</code>、<code>/theme</code>、<code>/help</code>、<code>/config</code> 與 <code>/advisor</code> 對話框可在全螢幕 TUI 中於該輪執行途中開啟；<code>/goal</code> 於該輪因不可恢復錯誤（如認證被撤銷、額度用盡或 context 溢位）中止時會清除自身狀態並提示，不再停留在已設定狀態；<code>/goal</code>：背景工作讓 goal 等待超過 30 分鐘時，Claude 現會主動查看進度，可設 <code>CLAUDE_CODE_GOAL_CHECKIN_MINUTES=0</code> 停用；<code>claude setup-token</code> 現拒絕非預期的多餘參數，不再靜默忽略。變更：全螢幕模式下 Esc 不再清除滑鼠文字選取，仍照常中斷或關閉，選取範圍維持反白；移除 auto mode 在每個 Agent 工具呼叫下顯示的多餘「Allowed by auto mode classifier」提示；移除 <code>/config</code> 的「Default teammate model」設定，agent-team 隊員現預設沿用 leader 的 model，除非產生時另外指定；淡化執行中工具標頭上的經過時間計數器，避免與粗體數字搶眼；回合之間送達的背景工作通知現改為包在 <code>&lt;system-reminder&gt;</code> 標籤內傳給模型，與回合中送達的方式一致；Mantle 於啟動時若主迴圈 model 已選定，跳過 admin-pin 可用性探測；Windows：<code>~/.claude.json</code> 唯讀時，啟動不再卡在反覆的更名重試。"},
    {v:"2.1.233", date:"2026-08-14", cat:"Permissions/Security", body:"新增：<b>GitLab merge request 支援</b>：<code>--worktree</code> 旗標與 <code>claude agents</code> 檢視新增 GitLab MR URL 支援（顯示為 <code>!N</code>）；<b>Apps gateway 使用者身分轉發</b>：Anthropic upstream 新增選用的 <code>forward_user_identity</code> 設定，將登入使用者身分以 header 轉發，供 gateway 後方 proxy 依使用者歸戶花費；<b>Bash 工具記憶體 cgroup 限制</b>：Linux 新增選用的 <code>CLAUDE_CODE_TOOL_MEMORY_LIMIT</code>，避免失控的建置指令拖垮整個 session；新增 <code>CLAUDE_CODE_WEBFETCH_CACHE_TTL_MS</code> 環境變數可調整 WebFetch session 網址快取存留時間（預設仍為 15 分鐘）。修復：雲端 session 在環境於等待權限核准提示時關閉會被誤判為遺失；MCP v2 連線對固定逾時後主動關閉長連線串流的伺服器（如 serverless 主機）反覆重開訂閱串流；於 Claude Desktop 或 VS Code 下執行時 Notification hook 未針對權限提示觸發；啟用沙箱時 Linux 閒置 session 偶爾讓某 CPU 核心卡在 100%；使用者或專案 skill 遮蔽內建 skill 時，<code>/checkup</code>、<code>/review</code> 等內建別名在 <code>-p</code> 模式或載入 plugin／MCP 時誤報「Unknown command」；skill／command 參數代換現避免參數值被再次展開為模板標記；<b>Windows NT <code>\\??\\</code> 裝置路徑前綴繞過 UNC 路徑驗證的 NTLM 憑證外洩漏洞</b>。其他改進：<code>claude self-hosted-runner</code> session 啟動加速，建立分支不再改寫工作樹、省去兩次伺服器往返；apps gateway 錯誤轉發改善：Vertex、Foundry 與 AWS 上的 Claude Platform 傳回 400/413 時攜帶上游原始訊息（並修正 apps gateway 上 auto-compact 的錯誤）；<code>claude plugin validate</code> 新增檢查裸 <code>.claude/skills</code> 目錄，回報 frontmatter 解析失敗的 SKILL.md；螢幕閱讀器模式改善：<code>/effort</code> 選單改為可輸入數字的清單，提示與對話框文字不再被截斷；print mode 診斷新增：請求的 model ID 無法辨識時於 stderr 寫入 <code>[claude-code:unrecognized_model]</code>（可用 <code>modelOverrides</code> 對應以消除）。變更：repo 的 origin remote 為 gitlab.com 或 bitbucket.org 時不再顯示 GitHub app 設定提示，企業 marketplace 提示現涵蓋非 GitHub 的內部 git host；Opus 4.8、Sonnet 5、Fable 5、Mythos 5 及更新模型預設移除待辦事項追蹤工具（<code>TaskCreate</code>／<code>Get</code>／<code>Update</code>／<code>List</code>、<code>TodoWrite</code>），可用 <code>CLAUDE_CODE_ENABLE_TODO_TOOLS=1</code> 還原；Windows：修復一般 <code>cd &lt;dir&gt; &amp;&amp; &lt;command&gt; &gt; file</code> 指令在 auto mode 下反覆停下要求手動核准（2.1.232 回歸）；回退 2.1.232 對 Windows Cygwin 風格符號連結與輸入重導向（<code>&lt; file</code>）的 Bash 權限變更，後續版本會有更精準的修正。"},
    {v:"2.1.232", date:"2026-08-13", cat:"Permissions/Security", body:"<b>Subagent forking 預設開啟</b>：<code>subagent_type: \"fork\"</code> 的 subagent 現繼承完整對話與 prompt cache，互動 session 中非 teammate 的 agent 衍生預設改在背景執行；<b>用 <code>@</code> 提及其他 Claude session</b>：在提示中輸入 <code>@</code> 提及具名 session，Claude 會透過 <code>SendMessage</code> 直接送達；<b><code>SendMessage</code> 精準比對名稱</b>：名稱剛好對應唯一存活 session 時直接送達，不再要求先以 ref 確認；<b>同機 session 名稱唯一化</b>：啟動或重新命名遇到同名存活 session 時自動加上 <code>name-word-word</code> 變體並告知使用者；新增 <code>/config</code> 設定項「Dialog expiry」與「Messages from your other sessions」（跨 session 訊息 accept/hold/refuse）；<b>新增 GitLab token 遮罩</b>：涵蓋 <code>glrt-</code>、<code>gloas-</code>、<code>glptt-</code>、<code>glagent-</code>、<code>glimt-</code>、<code>glsoat-</code>、<code>glcbt-</code>、<code>glft-</code>、<code>glffct-</code> 等家族並完整遮罩可路由的 <code>glpat-</code>／<code>gldt-</code> token，<code>glab</code> CLI 設定檔比照 <code>gh</code> 套用相同沙箱與憑證路徑保護；<b>Plugin marketplace 新增 GitLab 支援</b>：純 <code>gitlab.com</code> repo 網址（含巢狀 subgroup）可比照 <code>github.com</code> 直接 clone，clone 認證失敗提示會標明實際使用的 git host；設定別名：<code>additionalMarketplaces</code>／<code>allowedMarketplaces</code> 現為 <code>extraKnownMarketplaces</code>／<code>strictKnownMarketplaces</code> 的別名；企業政策 <code>blockedMarketplaces</code> 純 repo 網址項目在 CLI 判定為 git clone 時仍會封鎖；閘道 <code>desktop:</code> overlay 現接受所有已發布的 Desktop 設定（原僅 11 個手動列出的鍵），啟動時依 Desktop 自身 schema 驗證，未知或不合法鍵會使啟動失敗；閘道 <code>managed.policies[].match.groups</code>／<code>admin.admin_groups</code> 空項目與格式錯誤的 <code>email_domain</code>（空值或含 <code>@</code>、空白、逗號）現改為啟動失敗，不再靜默比對不到任何人或誤授予管理員權限；Fable 5 重新於 <code>/advisor</code> 提供給有 Fable 權限的組織，並可透過 <code>/model fable</code> 設定用量點數同意。修復：PowerShell 權限繞過漏洞，寫入型參數可靜默覆寫 <code>$PSDefaultParameterValues</code> 並重導後續指令的檔案存取；Windows Git Bash 依 Cygwin 風格符號連結被路徑驗證誤判為一般檔案的權限繞過，現透過該連結寫入需權限核准；巢狀 git repository 誤繼承父目錄信任，現每個 repository 各自要求信任確認；MCP 連線在伺服器對協定版本探測無回應或回傳錯誤格式時卡滿 30 秒逾時；Remote Control session 由雲端 session 內的 bridge 代管時繼承該 session 的 transcript 或憑證；從 Claude Desktop 或 IDE 啟動的 Remote Control session 每次 resume 本機 session 都被視為新 claude.ai session（現改為重新連接既有 session）；Remote Control session 閒置時對新連線的用戶端顯示為無法連線；Remote Control bridge session 於 worker 重啟後未還原對話歷史；Remote Control 復原已從 claude.ai 或 App 刪除的對話時，改為建立替代 session 而非以登入相關訊息失敗（於 v2.1.227 引入的回歸）；Cloud gateway <code>/login</code> 在受管設定載入失敗時，「Press Enter to continue」後靜默結束或終端機無回應（現顯示失敗原因）；原生版本語音模式在語音服務拒絕連線時卡在「listening…」（現立即顯示拒絕原因）；mTLS 憑證輪替需要重啟才生效（現於連線錯誤時自動重新載入輪替後的憑證與金鑰）；AWS 或 Vertex region 值格式錯誤時仍用於組建請求網址（現改為退回預設 region）；Bedrock、Vertex 與 gateway 部署的串流閒置逾時錯誤直接判定請求失敗而非嘗試恢復；內容尺寸型 overlay 顯示截斷文字時多佔一欄，開頭截斷文字塌縮成刪節號；長 shell 指令或 agent 描述預覽在 emoji 中間截斷產生亂碼字元；<code>known_marketplaces.json</code> 並發寫入的啟動競態可能靜默取消註冊 plugin marketplace；<code>/update</code> 與 <code>/tui</code> 在有可存活重啟的工作進行中時拒絕重啟；SDK 與遠端 session 的用量上限提示建議了不可用的 slash command；互動式 <code>--advisor fable</code> 啟動的同意訊息誤導要在已結束的互動 session 內執行 <code>/model fable</code>。其他改進：全螢幕串流改善，長 session 不再每次更新都重新正規化整段對話，維持回應速度；受管設定核准對話框改善，顯示端點網址、僅遙測變更措辭更清楚、略過例行 OpenTelemetry 選項，且伺服器管理的沙箱執行檔覆寫（<code>sandbox.bwrapPath</code>、<code>sandbox.socatPath</code>、<code>sandbox.ripgrep</code>）現需核准；Claude 回應中呼叫 <code>/feedback</code>／<code>/bug</code> 立即開啟，不再等待該輪結束；<code>/plugin install plugin@marketplace</code> 先重新整理 marketplace，新發布的 plugin 免手動更新即可安裝；<code>/code-review</code> 在 high、xhigh、max effort 下比照其他等級改於背景 agent 執行；貼上與剪貼簿圖片讀取不再阻塞事件迴圈；Remote Control 網路短暫中斷後持續重連約 30 分鐘，一小時內多次短暫中斷不再直接斷線；Remote Control 復原對話不再靜默把 Remote Control 從同機另一個仍持有它的 Claude Code 手中拿走，需在該處執行 <code>/remote-control</code> 才會移轉；Agent 面板更新：已完成的 subagent 立即隱藏並附 <code>/tasks</code> footer 提示，「↓ N more」溢出指示移至左側以利顯示；Remote Control 終端機現會說明 session 是被其他裝置接管、從其他 App 結束或已刪除，並停止建議會撤銷該狀態的重新連線；Bash <code>&lt;</code> 檔案重導向現與其他寫法一樣受權限檢查；縮短已完成背景 agent 被 resume 時顯示的訊息；Cowork session 不再內嵌使用者層級記憶檔案的外部 <code>@</code> 匯入；強化共用 <code>/tmp</code> 上自動產生的跨 session 通訊 socket 目錄，預先埋入的符號連結或他人目錄現會被拒絕而非直接使用；強化 Linux 檔案系統沙箱防範受保護路徑繞過。變更：<code>sandbox.ripgrep</code> 改為僅受使用者、受管與 <code>--settings</code> 設定尊重，專案設定不再能覆寫沙箱的 ripgrep 執行檔；移除建議建立自訂 subagent 的啟動提示與 <code>/powerup</code> 導覽中對應的提示。"},
    {v:"2.1.231", date:"2026-08-13", cat:"Plugins/MCP", body:"修復：MCP OAuth 登入對使用預先註冊 OAuth client 的伺服器（如 Slack）因 <code>redirect URI</code> 不符而失敗。"},
    {v:"2.1.229", date:"2026-08-12", cat:"Plugins/MCP", body:"<b>新增伺服器端 Hook 支援自架執行環境</b>：self-hosted runner session 現支援伺服器端提供的 Claude Code hook，行為與受管環境一致；<b>新增 Plugin marketplace <code>command</code> 來源</b>：本機指令（如 IDE）可輸出 plugin 目錄，每個 session 重新解析並套用而不需重啟，<code>mode: \"link\"</code> 可就地使用該目錄；<b>閘道串流新增 SSE keepalive</b>：長時間思考期間對 gateway 串流回應送出 keepalive ping，避免 Vertex 與 Bedrock 上游因閒置逾時斷線；<b><code>ListAgents</code> 狀態標示</b>：已斷線的 Remote Control session 標為 <code>offline</code>，雲端 session 標為 <code>cloud</code>；新增文件說明 <code>claude remote-control --continue</code> 可接續最近一個 Remote Control session。修復：長回應串流時部分內容消失且在終端機重複列印；工具呼叫帶非字串型別的 <code>glob</code>、<code>file_path</code> 或 <code>command</code> 值時崩潰至錯誤畫面（含對該 session 執行 <code>--resume</code> 時）；極窄終端機視窗渲染進度列或 Markdown 表格時的 RangeError 崩潰（也可能使 <code>claude --continue</code>/<code>--resume</code> 於啟動時崩潰）；Windows 上工具呼叫或訊息引用延伸長度（<code>\\\\?\\</code>）或 UNC 路徑時崩潰；透過 <code>CLAUDE_CODE_ATTRIBUTION_HEADER</code> 停用歸屬標頭的使用者（直連 Anthropic API）auto mode 每次工具呼叫皆失敗；使用自訂 <code>ANTHROPIC_BASE_URL</code> gateway 的 claude.ai 訂閱者 <code>/model</code> 拒絕選擇 Sonnet/Opus 1M；MCP OAuth 對嚴格 authorization server 改用 <code>127.0.0.1</code> 取代 <code>localhost</code> 作為 redirect URI 以修復連線失敗；筆電終端機輸入 slash 指令後 Remote Control 用戶端顯示卡住的執行中圈圈；<code>/install-github-app</code> 產生的 Claude Code Review workflow 完成卻未在 PR 上張貼審查結果；IDE 擴充連線時編輯含數千筆 IDE 診斷的檔案後 UI 停滯數秒；一次性 <code>claude plugin</code> 指令遺留殘留存活檔，阻礙清理過舊 plugin 版本；CPU 受限容器內的 dynamic workflow 誤用主機核心數而非容器限制數；原子檔案取代後的檔案監控 handle 洩漏，以及排程任務監控在網路或虛擬檔案系統上失敗時 Windows 未捕捉的錯誤；SDK 與 <code>--input-format stream-json</code> session 送出僅含空白的訊息時收到 400 錯誤；訊息本身即超過 API 32MB 上限、且無圖片或文件可移除時的對話反覆重試壓縮（現改為失敗一次並顯示明確訊息）；Claude Desktop session 的 OpenTelemetry 匯出在該 gateway 亦為遙測端點時被 Desktop 受管 gateway 拒絕；部署 <code>managed-mcp.json</code> 且伺服器提供 MCP 伺服器時，自架 runner 與其他遠端 session 於啟動時結束（現改為跳過並顯示警告）；自架 runner 準備 repository 時卡在 Git Credential Manager 提示（現改為缺少憑證即快速失敗）。其他改進：workflow 平行展開時錯開相同前綴的相鄰 agent，讓後續 agent 讀取快取的 prompt 前綴而非重新付費（可用 <code>CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS=0</code> 停用）；「prompt is too long」錯誤改為說明自動壓縮為何無法恢復，不再只建議 <code>/compact</code>；沙箱網路網域清單中的 IPv6 位址改為加中括號（<code>[::1]:443</code>），模糊寫法強制 fail-closed 並由 <code>/doctor</code> 標示；<code>/login</code> 登入成功後會重複顯示 <code>CLAUDE_CODE_OAUTH_TOKEN</code> 覆寫警告。變更：<code>/commit-push-pr</code> 對帶危險旗標（<code>--force</code>、<code>--amend</code>、<code>--no-verify</code> 等）的 git/gh 指令不再自動核准；自架 runner 於 Windows 啟動須明確指定 <code>--base-dir</code>，Windows 上無預設 checkout 目錄；[VSCode] 「Report a problem」與 <code>/bug</code> 改為開啟內建意見回饋對話框而非已停用的問卷連結；[VSCode] <code>/btw</code> 側邊提問面板可拖曳邊界調整大小（側欄與堆疊版面皆可）；[VSCode] 側欄新增 session 群組（右鍵建立、重新命名或刪除；Cmd/Ctrl 或 Shift 點擊可一次移動多個 session）。"},
    {v:"2.1.228", date:"2026-08-11", cat:"Performance/Bug Fix", body:"修復：互動式 session 在罕見內部版面錯誤後可能整個停止重繪，但背後程序仍繼續執行；從 git 安裝資料夾的上層目錄啟動時，Windows 找不到 <code>git</code>／Git Bash；上次回應後透過 <code>/model</code> 切換過模型時，<code>/tui</code> 復原會誤退回舊模型；安裝或升級後第一個 session 的跨 session 訊息偶發沒有收件匣就啟動；連線中執行 Remote Control <code>/resume</code> 會把被復原對話的標題或歷史洩漏進目前連線的 session；<code>claude self-hosted-runner</code> 在該 session 不會推送的某個 repository checkout hook 失敗時，會讓每個新 runner 的 session 全部失敗（現改為跳過該 repository 並顯示警告）；自架 runner 在背景任務完成與接續 turn 開始之間的空隙結束 session；session 清理誤刪專案記憶資料夾內容；背景 plugin 快取清理在唯一版本為 symlink 開發副本時仍刪除該 plugin 快取；較高優先層設定重新定義 marketplace 項目時會繼承其他層的自訂 headers（現改為整組 marketplace 項目合併）；skill 呼叫後 deferred-tools 提醒偶爾重複送給模型兩次。其他改進：強化從 claude.ai 同步的 skill：不再遮蔽本機指令或 MCP prompt，描述會被清理並標示來源，且在本機執行時內容不會執行 <code>!</code> 指令或展開 <code>@</code> 檔案；跨 session 訊息改善：寄件者與內容改為直接顯示而非摺疊成一行，寄給其他機器上 Remote Control session 的訊息會顯示你的 Remote Control session 名稱作為寄件者；Vertex AI 憑證處理改善：Google Cloud 憑證過期或缺失時數秒內即失敗，不再重試數分鐘；壓縮進度改善：重試倒數與延遲提示現會於壓縮期間顯示，不再僅有進度列；更新終端標題忙碌動畫字符，減少部分終端分頁閃動。變更：Write 工具改為讓較新模型可覆寫本次 session 尚未讀取過的既有檔案，與 Edit 工具規則一致（較舊模型仍須先讀取）；移除 Pro／Max／Team 方案首次使用提示中「auto mode session 費用略高」的過時說明。"},
    {v:"2.1.227", date:"2026-08-10", cat:"Performance/Bug Fix", body:"修復：session 以過期登入 token 啟動時，功能旗標判定未依使用者訂閱層級評估，導致誤將 Max 方案使用者導向啟用 Fable 使用量點數；<code>claude-code-action</code> 在 GitHub-hosted runner 搭配 <code>allowed_non_write_users</code> 時所有 Bash 指令失敗；<code>/tui</code> 復原已倒回至第一則訊息之前的對話。其他改進：slash-command 選單改為僅以藍色標示選取列、比對到的字元改用粗體而非變色，且 emoji 或含重音符號的名稱維持原字符；減少檔案不存在建議與 at-mention 大小檢查造成的事件迴圈停滯。"},
    {v:"2.1.226", date:"2026-08-08", cat:"Performance/Bug Fix", body:"修復：一般錯誤修正與穩定性改善。"},
    {v:"2.1.225", date:"2026-08-08", cat:"Permissions/Security", body:"<b>閘道支出上限通知</b>：使用量警告新增閘道（gateway）支出上限支援，達上限訊息會顯示上限額度、重置時間與操作者留言（需閘道端同步升級至 2.1.225）；<b><code>claude agents</code> 工作區信任提示</b>：對不受信任的目錄新增信任提示，行為與 <code>claude</code> 一致。修復：暫時性 401 錯誤會用儲存登入的短效 token 覆蓋長效 <code>CLAUDE_CODE_OAUTH_TOKEN</code>，導致無頭（headless）session 中斷直到重啟；macOS 上 MCP OAuth 伺服器在 keychain 讀取逾時後間歇性以一連串 401 錯誤失敗，如同從未通過驗證；auto mode 誤將安全過濾器拒絕自身權限檢查計入連續阻擋次數上限（動作仍會被拒絕，但現在會告知模型繼續而非重試）；跨 session 訊息在無頭 session 與啟動期間停滯而無通知或逾時機制；Remote Control session 在非常大量對話經壓縮後恢復時對話歷史會中斷；在 agents 清單中將滑鼠移到其他專案的 session 上會改變下一個 agent 啟動的目錄；<code>claude self-hosted-runner</code> 在 <code>--base-dir</code> 無法建立或寫入時會先註冊成功、之後每個 session 都失敗，現改為啟動時即以明確錯誤結束；Claude Code on the web session 被誤報為卡住，每次重新連線都重送不斷增長的事件回補佇列；[VSCode] Focus view 會摺疊掉最新待辦清單、待回覆問題的上下文與已回答內容，僅思考中的摺疊現顯示「Thought for Ns」並於完成後自動重新收合。其他改進：Remote Control 從 Claude App 附加的照片現直接顯示給 Claude，不再另開工具呼叫從磁碟讀取；<code>SendMessage</code> 現可用名稱主動對其他機器上的 Remote Control session 發起對話（<code>ListAgents</code> 會顯示為 <code>name [ref]</code>），不再只能等對方先發訊息才能回覆；<code>SendMessage</code> 已確認過的 Remote Control 收件者，即使無法檢查該機器自己的清單，也不會被同名的本機 session 誤換掉。"},
    {v:"2.1.224", date:"2026-08-07", cat:"Plugins/MCP", body:"<b>新增自架執行環境（self-hosted environments）</b>：<code>claude self-hosted-runner</code> 可將自有機器或容器變為 Claude Code web、行動裝置與桌面 session 的執行主機（Team／Enterprise 方案）；<b>新增 <code>archive</code> plugin 來源</b>：可透過 HTTPS 的 zip 檔安裝 plugin，不需 git 或 npm，並可選擇 SHA-256 校驗；<b>新增跨 session <code>SendMessage</code></b>：不同機器上的 Claude Code session 可互相傳訊，並可用 <code>ListAgents</code> 探索（macOS／Linux）；新增 <code>crossSessionInbound</code> 與 <code>dialogExpiry</code> 設定：以繞過權限模式執行的 session 收到跨 session 訊息時需等待核准，其餘 session 的訊息則自動送達；新增沙箱憑證遮罩選項：結構化環境變數的 <code>extract</code>／<code>onExtractNoMatch</code>、JWT 感知遮罩（<code>decode: \"jwt\"</code> 搭配 <code>maskClaims</code>）、AWS SigV4 重簽（<code>awsPairs</code>／<code>sigv4</code>），僅在啟用 <code>network.tlsTerminate</code> 且透過使用者、受管或 <code>--settings</code> 設定時生效；新增 <code>ANTHROPIC_BEDROCK_REGION_PREFIX</code> 環境變數，可指定偏好的跨區域 Bedrock 推論設定檔；移除單一 session 200 個 subagent 的衍生上限（並發與深度限制仍適用）。修復：超過 200 字元的長專案路徑因共用前綴誤解析至其他專案的 session 目錄（含 session 清單、重新命名、分叉、刪除與 <code>/resume</code>）；<code>SendMessage</code> 寄送失敗卻誤報「Message sent」；沙箱檔案系統以結尾斜線寫入的拒絕規則（如 <code>denyRead: \"~/.aws/\"</code>）在 Linux／macOS 可被繞過；Bash 工具結果從未顯示沙箱違規細節；中途連線的 MCP 工具未通知模型其名稱；同一 plugin 安裝於多專案時安裝紀錄損毀；復原或還原的貼上內容偶發附加錯誤資料或遺失文字；Wayland 上選取即複製偶爾未寫入剪貼簿；長 session 意見回饋問卷分享失敗時誤顯成功；Remote Control 冷啟動遇過期登入 token 時「Remote credentials fetch failed」間歇失敗；Remote Control／SDK 於 <code>/clear</code> 等無輸出指令後顯示空白「(no content)」訊息；session 過期後重建的 Remote Control session 誤上傳先前本機對話歷史；[VSCode] 修正連線失敗後仍顯示 Remote Control 為已連線、<code>/resume</code> 靜默重新連線已關閉的 Remote Control、未遵守明確啟用的 <code>remoteControlAtStartup</code>。其他改進：全螢幕模式跨多次 compaction 保留完整壓縮前歷史；Remote Control 附加的 web／行動用戶端可見 compaction 進度與壓縮後邊界、<code>/clear</code> 重置會同步給已連接用戶端；Remote Control 連線失敗改為持續顯示失敗指示與重連捷徑（原僅 8 秒 toast）；受管設定：組織設定未變時重新登入或切換組織不再重複要求核准提示。"},
    {v:"2.1.223", date:"2026-08-06", cat:"Permissions/Security", body:"新增 <code>strictKnownMarketplaces</code>／<code>blockedMarketplaces</code> 受管設定支援 <code>\"owner/*\"</code> 萬用字元，可一次允許或封鎖整個 GitHub org 下的所有 marketplace repo；workflow agent、forked skill、slash command 或恢復的背景 agent 要求的 subagent 模型受限而改用父模型時，新增警告提示；雲端 session 新增 <code>/teleport</code> 提示，顯示如何用 <code>claude --teleport &lt;session id&gt;</code> 接續本機工作。修復：精心構造的指令可隱藏部分內容繞過 Bash 權限檢查；指令以 tab 或隱形 Unicode 字元填塞時核准對話框無法顯示完整指令；workflow 腳本可用動態 <code>import()</code> 逃出 workflow sandbox 執行程式碼；agent 定義的 <code>bypassPermissions</code> 模式忽略組織停用 bypass-permissions 的政策；session 中途 <code>/cd</code> 後 resume 回到空白畫面；gateway model discovery 隱藏以 provider 前綴命名的 Claude 模型（如 <code>vertex_ai/claude-*</code>、<code>bedrock/anthropic.claude-*</code>）；非 Anthropic model ID 的 <code>modelOverrides</code> 鍵被誤當作 session 的正式 model ID（現依文件僅忽略未知鍵）；受管設定：伺服器端設定不再停用機器本機 <code>managed-settings.json</code> 或 MDM 設定檔的 env 區塊，管理員 env 改為逐鍵合併；<code>sandbox.filesystem.denyWrite</code> 涵蓋工作目錄時 Linux 沙箱指令無法啟動；分叉背景 agent 於 resume 期間重建父 prompt 失敗時卡在「already resuming」；歷史含格式錯誤診斷附件的 resume session 每輪失敗或畫面卡死；解析特殊 <code>git push</code> 輸出時偶發的掛起。變更：<code>CLAUDE_CODE_DISABLE_1M_CONTEXT</code> 現涵蓋所有具原生 1M context 的 Claude 模型（非僅固定清單）並以 auto-compaction 限制在 200K，未能限制時顯示啟動警告；auto-compact 對未知 model ID 的 session 亦限制在假定的 context window 內（可用 <code>CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT=1</code> 還原舊行為）；<code>/review</code> 改為 <code>/code-review</code> 別名（<code>/code-review &lt;level&gt; &lt;pr#&gt;</code> 可指定 PR，<code>/code-review ultra</code> 為雲端深度審查）；未帶 effort 等級的 <code>/code-review</code> 改為沿用上次輸入的等級。"},
    {v:"2.1.222", date:"2026-08-04", cat:"Permissions/Security", body:"修復 worktree 隔離的 session 與其 subagent 可對主 checkout 執行破壞性 git 指令的漏洞，隔離範圍現涵蓋所有 session 類型的檔案編輯與 Bash；修復背景 agent 任務（摘要、壓縮、重新命名）中 PreToolUse auto-allow hooks 繞過工具限制的問題；修復 Team／Enterprise 的 <code>/usage-credits</code>，先前請求被駁回的成員誤顯示「已送出用量額度請求」而無法再次送出；修復啟動連線檢查在 HTTPS proxy 後方卡死再失敗，現改用與 API 請求相同的 proxy-aware transport 並附清楚逾時訊息；修復回應已完整送達卻仍回報「Connection closed mid-response」；修復 <code>/usage</code> 對 MCP 伺服器用量歸因過高，現只計入實際使用該伺服器工具結果的請求；修復分支推送後建立的 PR（含透過 GitHub REST API 建立者）未連結回 session；修復受組織限制的 <code>model: opus</code> 類 subagent／teammate family alias 直接退回父模型，而非改用該 family 中組織允許的最新模型；修復自訂 <code>ANTHROPIC_BASE_URL</code> gateway 儘管持續收到 keep-alive ping 仍觸發串流閒置逾時；修復 session token 失效時 claude.ai connector 被誤判為需要授權，現改顯示 <code>/login</code> 提示；修復 MCP 伺服器移除後本機已不存在的工具不再顯示工具錯誤訊息；修復 <code>SendMessage</code> 因摘要過長直接失敗，現改為截斷後送出；修復 subagent transcript 的 spinner effort 標籤顯示 session 的 effort 而非 subagent 自身設定；修復檔案監控遇到檔案系統錯誤或拆除時的偶發崩潰；修復 <code>--ax-screen-reader</code> 模式下螢幕報讀器每次 backspace 都重讀整行輸入；修復設定 <code>CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST</code> 時 host 端模型選擇鍵未優先於過期的本機 <code>managed-settings.json</code>。其他改進：auto mode 現會在派送前先讓權限分類器檢查透過 <code>SendMessage</code> 送往其他 agent session 的訊息；Claude 嘗試呼叫設有 <code>disable-model-invocation</code> 的 skill 時，拒絕訊息改為請你執行該 skill 而非自行複製其流程；<code>/diff</code> 檢視、Remote Control 工作區 diff 與 Claude Code on the web session 的檔案編輯 diff 改用原始 git blob 內容，忽略工作區設定的 diff driver 與 textconv；變更：repo-local 的 <code>.claude/settings.json</code> 或 <code>.claude/settings.local.json</code> 現不能再自動開啟 Remote Control（仍可用來關閉），須改在使用者層級以 <code>/config</code> 開啟；移除 ultraplan 功能。"},
    {v:"2.1.221", date:"2026-08-04", cat:"IDE/Editor", body:"<b>VSCode 新增 Focus view</b>：聊天選單切換選項，把工具活動摺疊到可展開的逐輪摘要後方並保留即時執行中工具指示器，可用 <code>Ctrl+Alt+F</code> 或指令選擇區「Claude Code: Toggle Focus view」切換；<b>新增 Linux／WSL 沙箱憑證檔案 <code>mode: \"mask\"</code></b>：沙箱化指令讀取哨兵替身（整檔或僅 <code>extract</code> regex 擷取範圍），沙箱代理在對外連線時代換回真實值（macOS 上退回 <code>deny</code>）；<code>claude plugin validate</code> 新增警告：marketplace 或 plugin 名稱會被 Claude Desktop 受管 marketplace 同步拒絕時提示；<code>claude-api</code> skill 新增 <code>prompt-audit</code> 子指令，可稽核 prompt 與工具描述中針對舊模型撰寫的過時模式。修復：zsh 於 <code>[[ ]]</code> regex 條件式中可執行隱藏指令的 Bash 權限檢查繞過（現會提示權限）；Windows 路徑含引號字元時 PowerShell 權限檢查誤判（現會提示核准）；以關閉思考模式啟動的 session 全程思考切換無效；中途停用 MCP 伺服器不再被靜默還原；<code>--mcp-config</code> 的 MCP 伺服器在 print mode（<code>-p</code>）首輪前未連線，導致模型把工具呼叫當純文字輸出；按 Esc 收回提示再重送時 @-mention 檔案被靜默丟棄；SDK MCP 工具命名為 <code>constructor</code> 等內建物件屬性時崩潰；停用思考時以 <code>xhigh</code>/<code>max</code> effort 呼叫 WebSearch 回傳 400 錯誤；沙箱化大型上傳透過沙箱 proxy 因 TLS 錯誤失敗；Team／Enterprise 支出上限訊息誤指為組織月度上限而非個人支出上限；Windows 機器設定雜散 <code>HOME</code> 環境變數時，桌面受管 session 的 Bedrock AWS SSO named profile 認證失敗；<code>CLAUDE_CODE_RESUME_INTERRUPTED_TURN=0</code> 未能停用中斷 turn 自動恢復；喚醒時兩個 Claude Code 程序同時刷新同一 MCP connector 或 WIF OAuth token 導致的競態重新認證；從 Claude Code Desktop 或 claude.ai 重新命名 session 未同步更新 CLI 的 session 名稱；以終端機專屬內建指令命名的 plugin／org skill（如 <code>/help</code>、<code>/feedback</code>）在非互動 session 中無法呼叫；「Plugins changed」通知在 plugin 重新載入後仍殘留；Vim 模式 yank 暫存器在對話框、歷史搜尋與 transcript 檢視間被靜默清空；Vim 模式復原至空白提示後未正確要求「再按 ← 一次」確認。其他改進：Google Vertex AI 對 Claude 4.5 世代以上模型重新啟用工具搜尋；auto mode 平行工具呼叫權限檢查改為快取化並修正切換模式時的競態；背景 session 改為以 commit/push 保留工作、僅在任務需要時才開 draft PR，並依 CLAUDE.md 的 git 指示行事。"},
    {v:"2.1.220", date:"2026-07-25", cat:"Performance/Bug Fix", body:"本版本為問題修正與可靠性改善，無使用者面向的新功能變更。"},
    {v:"2.1.219", date:"2026-07-24", cat:"Settings/Config", body:"<b>Claude Opus 5 新增為預設 Opus 模型</b>（<code>claude-opus-5</code>，1M context window，Fast mode 定價 $10/$50/Mtok）；新增 <b><code>sandbox.network.strictAllowlist</code></b> 設定，可拒絕沙箱指令存取未列入允許清單的主機而無需提示；<b>新 <code>DirectoryAdded</code> hook</b>：於 <code>/add-dir</code> 或 SDK <code>register_repo_root</code> 新增工作目錄後觸發；新增 <b><code>workflowSizeGuideline</code></b> 設定鍵，可從任意設定檔控制動態 workflow 大小建議；<b>子 Agent 巢狀深度預設升至 3 層</b>（可用 <code>CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1</code> 停用）；MCP server 啟動錯誤納入 stream-json init 事件（<code>mcp_server_errors</code>）；Fast mode 移除 Opus 4.7，<code>/fast</code> 改適用 Opus 5 與 Opus 4.8；新增 nested subagent forwarding（depth ≥ 2 時 stream-json 轉發子 agent 文字）。修復：<code>claude -p</code> 於 turn 中途 API 錯誤時靜默遺失輸出；<code>claude mcp list</code>/<code>/mcp</code> 缺少連線失敗的 HTTP 狀態與錯誤訊息；Fable 模型列誤顯「需要使用點數」；Remote Control 切換模型後 fast-mode 狀態殘留；GNU screen 內複製選取印出 base64 而非複製；<code>CLAUDE_CODE_GIT_BASH_PATH</code> 在 Windows 非 bash/sh 路徑時提前結束；自我托管 runner 重啟後已核准權限被捨棄；<code>claude update</code>/<code>claude doctor</code> 靜默掛起等多項穩定性修復。"},
    {v:"2.1.218", date:"2026-07-22", cat:"Slash Commands", body:"<b><code>/code-review</code> 改為背景子 agent 執行</b>：review 工作不再填滿對話，堆疊 slash 指令以原來的 review 目標繼續；<b>螢幕閱讀器刪除文字播報</b>：<code>--ax-screen-reader</code> 模式下 <code>Option+Delete</code>、<code>Ctrl+W</code>、<code>Cmd+Backspace</code>、<code>Ctrl+U</code>、<code>Ctrl+K</code> 操作自動播報刪除內容；<b>MCP 連線狀態強化</b>：<code>claude mcp list</code> 與 <code>/mcp</code> 顯示伺服器連線失敗的 HTTP 狀態與錯誤訊息，並警告含隱藏前後空白的 config 值；<b><code>/deep-research</code> 改為手動觸發</b>：Claude 不再自動發起深度研究；<b>技能 <code>context: fork</code> 預設背景執行</b>（可設 <code>background: false</code> 停用）；<code>yes</code>/<code>no</code>/<code>on</code>/<code>off</code>/<code>1</code>/<code>0</code>（不分大小寫）現為 frontmatter boolean 接受值；OTel log 事件加入 <code>message.uuid</code>、<code>client_request_id</code>、<code>tool_source</code>；新增 <code>CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH</code> 可設定 OTel 內容截斷上限（預設 60 KB）；記憶體檔 frontmatter 新增 ISO <code>modified</code> 時間戳；server-managed 設定的良性功能/費用切換不再觸發設定核准提示；agent markdown 名稱禁止含 <code>:</code>（保留給 plugin 命名空間）。修復：Windows 路徑含 <code>\\u</code> 前綴（如 <code>C:\\Users\\unicorn</code>）被誤轉為 CJK 字元使檔案無法存取；← 鍵在編輯後誤棄對話（現要求確認）；終端將換行編碼為 Ctrl+J 導致多行貼上擠成一行；<code>/context</code> 壓縮後顯示舊 token 數；<code>/ultrareview</code> 描述性參數（如「review my auth changes」）現正確對當前分支執行 review；<code>/code-review ultra</code> 非互動 session 靜默走本地 review（現改啟動雲端 review）；gateway 費用計量對 Bedrock 應用推論 ARN 採正確模型費率；長 IDE 選取在 emoji 中間截斷的亂碼；引擎拆解競態及工具中止後殘留 <code>tool_use</code> 區塊；深層監控目錄樹刪除/移動時的 Maximum call stack 崩潰；PR 事件偶爾遺失；Bedrock setup wizard 在分 partition 區域及代理網路的 assume-role profile 驗證失敗；計時器改用單調時鐘，避免系統時鐘調整影響；auto-mode 分類器不再對 dangerous-rm、背景 <code>&amp;</code>、可疑 Windows 路徑開啟 permission dialog；fork-session lineage 壓縮後遺失；含格式錯誤 delta 附件的恢復 session 每輪崩潰或失敗；agent frontmatter hooks 限制只在已信任資料夾執行；遠端 session 心跳在 worker 被替換後仍持續發送。"},
    {v:"2.1.217", date:"2026-07-21", cat:"UI/UX", body:"<b>Emoji 短代碼自動補全</b>：輸入 <code>:heart:</code> 等 emoji 短代碼可直接插入符號，支援模糊搜尋，可用 <code>emojiCompletionEnabled</code> 停用；<b>子 Agent 並發上限</b>：新增最多同時執行 20 個子 agent 的上限（可用 <code>CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS</code> 覆寫），防止單一訊息無限衍生背景 agent；<b>子 Agent 巢狀限制</b>：子 agent 預設不再衍生巢狀子 agent，可設 <code>CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH</code> 允許更深層巢狀；<b><code>--max-budget-usd</code> 強制執行修復</b>：到達預算上限後新衍生被拒絕，執行中背景 agent 也一併停止。修復：Transcript 寫入失敗（磁碟滿或 session 儲存停用）改為顯示警告而非靜默遺失；<code>--resume</code>/<code>/resume</code> 含格式錯誤附件時 TypeError；MCP 工具輸出截斷後完整內容保留在記憶體的洩漏；Windows 自動更新失敗後 <code>claude.exe</code> 遺失（更新失敗現自動還原備份）；高負載機器背景 shell 無法停止；背景 session 隔離未正規化 symlink 工作目錄導致逃逸工作區；Bedrock 上 Opus 4.8 從未觸發自動 compaction；企業 mTLS/TLS-verify/OAuth scope/proxy 在 Claude Desktop session 中被忽略；螢幕閱讀器啟動公告截斷與思考列頻繁重繪；OpenTelemetry 受管設定 endpoint 被各訊號旁路；Remote Control 連線後看不到等待中的權限提示；CLAUDE.md/SKILL.md 前置多組 brace 展開導致 OOM（現加入展開預算限制）；Transcript preview 緊貼輸入區版面跳動；Footer PR 徽章在 SSH/tmux 環境改為可點擊超連結（可設 <code>FORCE_HYPERLINK=0</code> 停用）；登入到期警告提前時間從 5 天縮短為 3 天；Frontend-design plugin 建議提示上限 3 次不再無限重複。"},
    {v:"2.1.216", date:"2026-07-20", cat:"Performance/Bug Fix", body:"<b>新設定 <code>sandbox.filesystem.disabled</code></b>：跳過檔案系統隔離、保留網路 egress 控制；<b>長 session 效能大修</b>：修復 message normalization 在多輪對話中呈二次方成長造成多秒卡頓與緩慢 resume；<b>OAuth token 過期後 Auto mode 分類錯誤修復</b>；<b>AskUserQuestion 中性措辭修復</b>：使用者明確要求等待或說明時，回應措辭不再誤導 Claude 繼續執行；修復雲端 session 閒置後重複提問且丟棄答案；修復 Claude-in-Chrome 重連 403 迴圈；修復 MCP 重新認證撤銷有效憑證問題；修復雲端 session 容器重啟時在途訊息遺失（中斷 turn 於 resume 時自動重跑）。<b>Agent/背景 session 修復</b>：<code>@-mention</code> 附加失敗、vim dot-repeat、statusline 重複執行、resume picker 卡住；恢復背景 agent session 的 agent prompt 與工具限制；無 git repo 的 worktree 背景 session 無法刪除；背景 subagent 在啟動視窗被高優先訊息取消；<code>/mcp</code> 與 <code>/install-github-app</code> 無用戶端時改為在 agent view 掛起等待輸入。<b>Worktree/git 修復</b>：子 agent 透過 <code>git -C</code>/<code>--git-dir</code>/<code>GIT_DIR</code> 重導至共用 checkout；worktree session 落入其他專案殘留 worktree；<code>claude daemon stop --any</code> 誤殺無關程序；workflow 存檔與排程任務寫入跟隨 <code>.claude</code> symlink 導致寫出專案外。<b>Terminal UI 修復</b>：長 session 含背景任務時 Esc-Esc 無法開啟 rewind picker；GUI 編輯器開啟時終端滑鼠/焦點雜訊；全螢幕對話框超出右側；<code>/config</code> 清單底部鍵盤提示被截斷；transcript 模式頁腳在窄終端換行；session 中修改的 skill/command 不重啟不出現在選單。<b>Security/permission 修復</b>：<code>&&</code> 清單或否定中帶重導的複合陳述式 Bash 許可檢查；Windows 網路路徑唯讀指令未提示；non-ASCII 字元 Bash 解析；PowerShell 隱形 Unicode 字元；<code>/rewind</code> 透過 symlink/hard link 還原或刪除檔案（現回報跳過數量）。<b>UX 改進</b>：<code>/fork</code> 確認改為單行含新 session 名稱與 <code>claude attach</code> id；<code>git</code>/<code>gh</code> 參數驗證；<code>/ultrareview</code> diff 過大錯誤顯示設定上限、實際大小與最大貢獻檔案；<code>/context</code> 超出 context window 時顯示明確警告；更新內建 dataviz skill 圖表色板順序。"},
    {v:"2.1.215", date:"2026-07-19", cat:"Slash Commands", body:"<b><code>/verify</code> 與 <code>/code-review</code> 改為手動觸發</b>：Claude 不再自動執行 <code>/verify</code> 與 <code>/code-review</code> 技能；如需使用請在對話中明確輸入對應指令觸發。"},
    {v:"2.1.214", date:"2026-07-18", cat:"Permissions/Security", body:"<b>單層 <code>dir/**</code> 允許規則修正</b>：修復 <code>Edit(src/**)</code> 等規則錯誤自動核准整棵目錄樹下巢狀 <code>dir/</code> 寫入的問題，現僅允許 <code>&lt;cwd&gt;/dir</code> 路徑；<b>PowerShell 5.1 permission bypass 修復</b>；<b>Bash 權限檢查強化</b>：修復檔案描述符重導、超過 10,000 字元的指令（一律提示確認）、zsh 變數下標與 modifier、<code>help</code>/<code>man</code> 特定選項等邊緣情形；<b>Docker 指令新增 permission prompt</b>（含 Podman 的 <code>docker</code> shim 及遠端旗標 <code>--url</code>、<code>--connection</code>、<code>--identity</code>）；<b>遠端 session 權限提示競態修復</b>：防止本地確認對話框完成前即繼續執行。<b>新增 EndConversation 工具</b>：Claude 可在偵測到高度濫用或越獄嘗試時主動結束 session；<b>長時間工具呼叫定期心跳</b>：過去靜默的長工具呼叫現在會定期回報進度；記憶體檔案 frontmatter 新增 ISO <code>modified</code> 時間戳；OTel log events 加入 <code>message.uuid</code>、<code>client_request_id</code>、<code>tool_source</code>；新增 <code>CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH</code> 控制 OTel 內容截斷長度（預設 60 KB）。修復：GrowthBook 功能評估 null 崩潰；settings 檔超過 2 MiB 現於啟動時顯示明確錯誤；企業 proxy 環境 Windows 串流失敗；stream-json 輸出在慢速 SDK/pipeline 情形下截斷；排程任務拒絕自身已設定 prompt；PowerShell 工具因子程序等待 stdin 而掛起；Windows Unicode 解碼崩潰；PowerShell <code>&gt;</code>/<code>&gt;&gt;</code> 重導寫入 UTF-16LE；背景 session 閒置未清理；<code>claude rm</code> 無法刪除已完成 session；背景 session 從 worktree 資料夾還原失敗；Plugin 透過 <code>--settings</code> 旗標啟用後未正常載入；<code>claude update</code>/<code>claude doctor</code> 靜默掛起；<code>/ultrareview</code> 於無 merge base 的 repo 中失敗；token 計費重複計算修復。"},
    {v:"2.1.212", date:"2026-07-17", cat:"Slash Commands", body:"<b>新增 <code>/fork</code> 指令</b>：將當前 session 完整複製為新的背景 session，可在不中斷主線工作的情況下分叉試驗不同實作路徑；<b>新增 <code>/subtask</code> 指令</b>：直接在 session 內啟動子 agent 執行特定任務，無需切換視窗；<b>Session 級別 WebSearch 用量限制</b>：新增整個 session 的 WebSearch 呼叫上限，防止意外大量搜尋耗盡配額；<b>Subagent 衍生上限強制執行</b>：限制單次工作流中可衍生的 subagent 數量，提升可預測性；<b>MCP 工具自動移至背景</b>：MCP 工具執行超過 2 分鐘後自動轉為背景執行，不再阻塞主 session；<code>/resume</code> 改為顯示過去 sessions 的選擇器介面，更易操作。修復：plan mode 意外自動執行；worktree symlink 處理異常；hook 基礎設施相關問題。"},
    {v:"2.1.211", date:"2026-07-15", cat:"Performance/Bug Fix", body:"<b><code>--forward-subagent-text</code> 旗標</b>：新增 <code>CLAUDE_CODE_FORWARD_SUBAGENT_TEXT</code> 環境變數，讓 stream-json 輸出包含子 agent 文字；<b>「永遠允許」規則存於 repo 根目錄</b>；<code>/usage-credits</code> 加入金額確認提示；Vim NORMAL 模式 <code>s</code>/<code>S</code> 行為修正。修復：permission preview 未中和特殊 Unicode 字元；auto mode 覆蓋 PreToolUse hook 的 <code>ask</code> 決策；多個平行 session 喚醒後同時登出；plugin MCP servers 閒置 web session 喚醒後未重連；Vertex/Bedrock 啟動時嘗試預設 Opus 模型；子 agent 明確覆寫模型後恢復時回退至父模型；巢狀 <code>.claude/rules/*.md</code> 在停用專案設定時仍載入；DOS 裝置後綴與尾部點的上傳驗證；Chrome 遠端 session 檔案上傳；編輯輸入為「?」靜默丟棄；Chrome 擴充啟用但未執行時啟動卡死；300ms 非同步內容延遲；重開停止的背景 session 顯示空白對話；<code>/loop</code> 將 session 隱藏於 <code>/resume</code>；螢幕閱讀器失去聲音鈴聲；LLM gateway 認證在 daemon 重生後失敗；<code>claude agents</code> 工作因 git worktree 問題永久無法刪除；<code>/clear</code> 未重置費用計數器；Chrome 設定頁面在 Windows 失敗；headless print-mode 在 Windows 以不可讀 stdin 崩潰；背景 session 標題顯示命名模型的拒絕文字；背景 agent 被使用者終止後自動重生；無排程例程回報 1970 年下次執行時間；Bedrock/Vertex/Mantle/Foundry prompt-cache 回歸問題。改進：終端機版面與渲染效能；背景 agent 結果回報；記憶體索引超限警告；整數環境變數接受科學記號（如 <code>1e6</code>）。"},
    {v:"2.1.210", date:"2026-07-14", cat:"Permissions/Security", body:"<b>Agent 工具安全強化</b>：加強防範間接提示注入攻擊；<b>即時耗時計時器</b>：摺疊工具摘要列新增 elapsed-time 即時計數器；<b>權限規則啟動警告</b>：對 <code>Write(path)</code>、<code>NotebookEdit(path)</code>、<code>Glob(path)</code> 類型的規則顯示啟動警告；<code>ultracode</code> 關鍵字 opt-in 不再對非人工發起的輸入觸發。自動模式改進：外部 sessions 的分類器預設改用 Sonnet 5；記憶體寫入超過讀取限制現顯示明確錯誤而非靜默截斷；螢幕閱讀器模式可朗讀權限模式變更；agent footer 顯示等待輸入的背景 agent 數量。修復：<code>isolation: 'worktree'</code> 子 agent 對主 repo 執行 git 指令（應在獨立 worktree）；<code>claude attach</code> 出現「job not found」或「agent is still starting」；工具結果渲染器回傳 bigint 或純文字時 session 崩潰；hook 回呼逾時被誤報為使用者拒絕；<code>cd</code> 移至背景後 Claude 誤以為目錄已切換；plugin 提供的 MCP servers 在重新同步時被拆除；計畫核准未含編輯時被標記「(edited by user)」；<code>/doctor</code> 在 Bedrock、Vertex、Foundry 跳過 auto-mode 預設建議；Grep 分頁時誤回「No matches found」；skill/command 中未配對佔位符被移除；plugin 快取寫入失敗後留下暫存檔；背景 worker 在連線重置時崩潰迴圈；<code>claude agents --effort ultracode</code> 未傳達至 dispatched sessions；← 返回 session 時丟失任務追蹤器；agent dashboard 保留已放棄草稿的貼圖；已終止背景 sessions 留下永久 <code>git worktree lock</code>；SDK MCP servers 等到下一輪才開始連線；<code>CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN=1</code> 時 agent view 出現重疊幽靈框；延遲出現的 <code>.claude/*</code> symlinks 未同步至 sandbox deny-write 清單。"},
    {v:"2.1.209", date:"2026-07-14", cat:"Performance/Bug Fix", body:"<b>背景 session 對話框封鎖修復</b>：修復 <code>/model</code> 選擇器與互動對話框（含 permission dialogs）在背景 sessions 中被封鎖、無法正常顯示的問題。"},
    {v:"2.1.208", date:"2026-07-14", cat:"UI/UX", body:"<b>螢幕閱讀器模式</b>：新增無障礙純文字渲染 opt-in（<code>--ax-screen-reader</code> 旗標、<code>CLAUDE_AX_SCREEN_READER=1</code> 環境變數、<code>\"axScreenReader\": true</code> 設定）；<b>Vim Insert 模式自訂鍵位</b>：<code>vimInsertModeRemaps</code> 設定可將兩鍵 insert-mode 序列（如 <code>jj</code>）對應為 Escape；<b>企業啟動器支援</b>：<code>CLAUDE_CODE_PROCESS_WRAPPER</code> 環境變數讓 agent view 與背景服務所有 Claude Code 自我衍生均透過指定 wrapper 執行；全螢幕多選選單與「Other」輸入列支援滑鼠點擊。效能：輸入回應性改善（任務列更新不再重繪整個 UI）；MCP 工具池組裝改為快取（高工具數時單輪最快提速 7 倍）；session transcript 最多縮小 79 倍並限制 checkpoint 磁碟用量；file edit 快取上限 16 MB；permission 規則編譯一次後快取，消除多規則時每輪 multi-second 延遲；完成的背景 agent 保留於 <code>/tasks</code> 直到清理後消失。修復：Fast mode 切換後自動恢復；背景 agent 訊息遞送失敗時保留文字；auto-update 後 <code>claude agents</code> daemon 附加永久失敗；context window 在自動更新後短暫錯誤重置為 200k；HTTP/2 GOAWAY 在 session 與背景 session 造成崩潰；大型 Markdown 表格渲染卡頓（超 200 列改顯摘要）；<code>apiKeyHelper</code> 錯誤被隱藏 10 次重試後才浮現；環境變數科學記號解析（<code>1e6</code> 被誤用為 <code>1</code>）；Edit tool 在讀後修改但目標仍唯一時失敗；Grep 無效 regex 靜默回傳空結果、count 模式分頁漏計；Bedrock SSO <code>sso_region</code> 跨 region 認證失敗（2.1.207 regression）；stream-json 大型回應截斷與 CRLF 空行終止 session；背景 session 多項記憶體洩漏（MCP stdio stderr 上限 64 MB、LSP 文件 LRU 50 份、hook 輸出、headless payload 累積）；agent view 貼圖記憶體洩漏；SDK session agents 在 plugin 刷新前遺失；<code>/usage</code> 顯示過期快取、<code>/mcp</code> 不重新分類 placeholder server；<code>/release-notes</code> 將完整 changelog 注入 context；<code>rm -rf ~</code> 等毀滅性指令在 <code>$(…)</code> 組合形式下未提示確認。"},
    {v:"2.1.207", date:"2026-07-11", cat:"Settings/Config", body:"<b>Auto mode 正式開放至 Bedrock / Vertex AI / Foundry</b>（無需 <code>CLAUDE_CODE_ENABLE_AUTO_MODE</code> 環境變數；可用 <code>disableAutoMode</code> 設定停用）；Bedrock、Vertex AI 與 AWS Claude Platform <b>預設模型改為 Claude Opus 4.8</b>；auto mode 不再從專案層 <code>.claude/settings.local.json</code> 讀取 <code>autoMode</code>（改由 <code>~/.claude/settings.json</code> 管控）。修復：串流含超長清單／表格／段落／程式碼區塊時<b>終端機凍結與按鍵延遲</b>；非互動式執行（<code>claude -p</code>、SDK）遠端受管設定被永久記為已同意而略過安全確認對話框；系統產生的對話更新誤觸 prompt injection 警告；自動更新器覆蓋 <code>~/.local/bin/claude</code> 的自訂啟動腳本或 symlink（<code>/doctor</code> 現回報外部管理的啟動器）；含 <code>cd</code> 的複合指令在輸出至 <code>/dev/null</code> 時誤要求許可；回應結束後 transcript 跳回答案起始位置；移除最後 worktree 後 <code>extensions.worktreeConfig</code> 殘留於 <code>.git/config</code>（破壞 <code>tea</code> 等 go-git 工具）；規則 glob／skill 路徑錯誤括號模式破壞檔案讀取與 worktree 建立；agent team 中格式錯誤的 mailbox 訊息每秒觸發崩潰迴圈；接受計畫後自動命名的背景 session 未顯示名稱；git worktree 背景 session 冷開啟後顯示空白；Remote Control 任務狀態在網路恢復後丟失；Desktop App 托管的 Remote Control session 在手機／網頁不顯示背景 agent 進度；Deep research 抓取階段 agent 顯示「unknown」（改為來源主機名）；Bedrock 每次 API 請求重複要求 AWS SSO 憑證；<code>/usage-credits</code> 金額輸入靜默移除格式錯誤值（現拒絕並要求超 $1,000 金額確認）。安全：plugin hooks／monitors／MCP headersHelper shell-form 指令中 <code>${user_config.*}</code> 現被拒絕（shell injection 修復）；plugin option 值不再從專案層 <code>.claude/settings.json</code> 讀取。"},
    {v:"2.1.206", date:"2026-07-09", cat:"Performance/Bug Fix", body:"<b><code>/cd</code> 目錄路徑建議</b>：輸入時提供目錄路徑補全提示；<b><code>/doctor</code> 改進</b>：新增修剪 CLAUDE.md 的建議功能；<b>自動允許 git push 到已設定的遠端</b>；支援 gateway 登入；worktree 建立確認提示；背景 agent 版本升級；過期登入修復；<code>--resume</code>/<code>--continue</code> 鍵盤輸入修復；MCP timeout 修復；<code>CLAUDE_CODE_EXTRA_BODY</code> 修復；MCP OAuth 重新認證修復；MCP 伺服器啟動崩潰修復；<code>/model</code> picker 修復；桌面 session 修復；agents view 鍵盤修復；<code>claude rm</code> 清理修復；<code>/remote-control</code> 離線處理；workflow 詳細導覽修復；<code>/status</code> 重複警告修復；plugin 棄用遙測修復；<code>/doctor</code> Homebrew 通道修復；全螢幕 UI 修復；Bedrock 啟動卡死修復；<code>/code-review</code> 品質改進；agents view 狀態欄寬度改善。"},
    {v:"2.1.205", date:"2026-07-08", cat:"Performance/Bug Fix", body:"<b>Auto mode 安全規則</b>：新增規則阻擋篡改 session transcript 檔案；執行無法從 context 解析的變數 <code>rm -rf</code> 前先詢問確認。<b>Agent view 改版</b>：PR 編輯/合併/留言/推送的 session 於 <code>claude agents</code> 直接連結 PR；列改顯彩色狀態字詞與 classifier 撰寫標題，blocked session 展開可見完整詢問內容。<b><code>/doctor</code> 升級為全面安裝檢查工具</b>（<code>/checkup</code> 為別名）。<b>Auto-update 串流下載</b>：更新程式改為串流寫磁碟，峰值記憶體降低約 400MB。背景任務通知加入明確聲明防偽造授權。保留 <code>Claude Browser</code> MCP 伺服器名稱（與 <code>Claude Preview</code> 同）。修復：<code>--json-schema</code> 使用 <code>format</code> 關鍵字被拒或格式無效靜默輸出非結構化結果；<code>--max-turns</code> 到限時中途傳入訊息靜默丟棄；Windows worktree 移除時 NTFS junction 導致刪除超出範圍；背景 agent 恢復後仍顯「失敗/完成」或狀態閃爍；<code>claude attach</code> 在升級重啟中報錯；Bash 輸出超 30K 時 session-to-PR 連結遺失；<code>claude mcp add-from-claude-desktop</code> 遇不支援字元卡住；LSP 插件失敗阻擋同副檔名的有效插件；Windows 啟動目錄遭刪除/鎖定/卸載時崩潰；檔案監控在掃描進行中關閉時崩潰；verify skills 每 session 重寫；agent view 標頭裁切；遠端控制面板背景任務顯示過期「執行中」狀態；Cowork VM-mode 本地 agent session 無法啟動。"},
    {v:"2.1.204", date:"2026-07-08", cat:"Hooks", body:"<b>SessionStart hooks 串流修正</b>：修復 headless sessions 中 <code>SessionStart</code> hook 事件無法串流的問題，確保排程與 CI 環境的 hook 執行結果正確傳遞。"},
    {v:"2.1.203", date:"2026-07-07", cat:"UI/UX", body:"<b>登入到期警告</b>：即將到期時提前顯示提示；<b>手動模式灰色暫停徽章</b>：手動權限模式下工具呼叫等待圖示改為灰色暫停符號，視覺更清晰；<b>MCP roots/list 改善</b>：根目錄列表更穩定可靠；多項背景 session 修復，提升長時間運作穩定性。"},
    {v:"2.1.202", date:"2026-07-06", cat:"Settings/Config", body:"<b>動態工作流程規模設定</b>：<code>/config</code> 新增「Dynamic workflow size」（small/medium/large），作為每次動態工作流程 agent 數量的建議指引（非強制上限）；<b>OpenTelemetry workflow 屬性</b>：工作流程衍生 agent 的 telemetry 加入 <code>workflow.run_id</code> 與 <code>workflow.name</code>，可從 OTel 資料完整重建工作流程活動。修復：Ctrl+R 歷史搜尋接受或取消時崩潰；背景 session <code>/rename</code> 重啟後被還原；mTLS 憑證輪換期間暫時握手失敗；Remote Control 指令傳入互動 session 失敗；Remote Control 傳送無說明的圖片/檔案被靜默丟棄；<code>claude auth login</code> 與 <code>claude mcp login --no-browser</code> 登入 URL 在 SSH 換行後不可點擊（改為單一超連結）；從 <code>claude agents</code> 開啟對話時偶爾崩潰並進入重啟迴圈；workflow 腳本中 unicode 引號被破壞且 parse 錯誤現顯示問題行號；語音聽寫反覆失敗時無限重試（現改為暫停語音輸入）；<code>/remote-control</code> session 顯示錯誤的權限模式；含大量 git worktree 的 repo 中依名稱恢復 session 耗時過長；下載中途被 proxy 中斷時立即失敗（改為自動重試）；重複呼叫已載入 skill 導致指令重複加入 context。改進：<code>/workflows</code> agent 清單排版優化（更寬標題、獨立時間欄）；MCP 設定有 <code>url</code> 無 <code>type</code> 時錯誤提示更清晰；<code>/review &lt;pr&gt;</code> 恢復單輪快速審查，多 agent 審查改用 <code>/code-review &lt;level&gt; &lt;pr#&gt;</code>。"},
    {v:"2.1.201", date:"2026-07-03", cat:"Performance/Bug Fix", body:"<b>Claude Sonnet 5 對話中 system role 修正</b>：Sonnet 5 sessions 不再於對話中途以 system role 傳送 harness reminders，避免干擾對話流程與提示快取行為。"},
    {v:"2.1.200", date:"2026-07-03", cat:"Performance/Bug Fix", body:"<b><code>AskUserQuestion</code> 對話框不再預設自動繼續</b>；修復背景 session 在 turn 中途停止、daemon 切換、roster 問題、subagent 速率限制、終端控制字元、plugin 載入、<code>/mcp</code> 螢幕閱讀器追蹤、語音聽寫訊息等多項問題；改善螢幕閱讀器輸出品質。"},
    {v:"2.1.199", date:"2026-07-02", cat:"Subagents/Skills", body:"<b>疊加 slash-skill 呼叫最多可載入 5 個 skill</b>；修復 SSL 憑證錯誤處理、串流中途錯誤丟棄回應、subagent 部分工作處理、背景 daemon Linux 問題、<code>claude stop</code> 競態條件、背景任務進度、記憶體壓力、遠端 session 抖動、model picker、hooks stderr、SendMessage 路由錯誤、色彩底色、設定檔復原、Chrome 重連與 plan mode 提示等多項問題。"},
    {v:"2.1.198", date:"2026-07-01", cat:"UI/UX", body:"<b>Claude in Chrome 正式發布（GA）</b>：Chrome 瀏覽器延伸功能正式上線，可在任意頁面呼叫 Claude Code；<b>背景 agent 完成推播通知</b>：背景 agent 任務結束時推送桌面通知；新增 <code>/dataviz</code> 資料視覺化 skill；<b>AWS 平台支援強化</b>；背景 session 完成後<b>自動建立 PR</b>；多項可靠性改進。"},
    {v:"2.1.197", date:"2026-06-30", cat:"Settings/Config", body:"<b>Claude Sonnet 5 成為 Claude Code 預設模型</b>：具備原生 <b>1M token context window</b>，促銷定價 $2/$10 per Mtok（至 2026-08-31）；需更新至 2.1.197 才能存取 Sonnet 5。"},
    {v:"2.1.196", date:"2026-06-29", cat:"Performance/Bug Fix", body:"<b>新增組織預設模型</b>：管理員可在 org console 設定，<code>/model</code> 顯示為「Org default」或「Role default」；<b>Session 啟動自動產生易讀預設名稱</b>；<b>聊天文件附件可點擊</b>（Cmd/Ctrl-click 在 Finder/Explorer 顯示）；<b>安全修復</b>：<code>claude mcp list/get</code> 不再啟動工作區自行核准的 <code>.mcp.json</code> MCP 伺服器（未信任 workspace 顯示「Pending approval」）；<b>串流閒置看門狗</b>預設對所有 provider 開啟（5 分鐘無事件即中止並重試，設 <code>CLAUDE_ENABLE_STREAM_WATCHDOG=0</code> 停用）；<code>claude agents</code> 改為單次 ← 進入 agent 視圖；<code>/code-review</code> 合併清理 finder 減少約 25% token 用量；修復背景 session 對話遺失、速率限制閃爍、PowerShell git 指令回傳碼誤判、語音聽寫吞字等多項問題。"},
    {v:"2.1.195", date:"2026-06-26", cat:"Performance/Bug Fix", body:"<b>新增 <code>CLAUDE_CODE_DISABLE_MOUSE_CLICKS</code> 環境變數</b>：停用全螢幕模式的滑鼠點擊／拖曳／懸停（保留滾輪捲動）；修復帶連字號識別字的 hook matcher 意外走子字串比對（<code>code-reviewer</code>、<code>mcp__brave-search</code> 等改為精確匹配，如需比對所有同名 MCP 工具請用 <code>mcp__brave-search__.*</code>）；修復 macOS 長 session 預設輸入裝置異動導致語音擷取靜音；修復日文／中文／泰文等無空格語言語音聽寫自動送出失效；修復僅由專案 <code>.claude/settings.json</code> 啟用的外部 plugin 每次重複要求安裝同意；修復 <code>/plugin</code> Enable/Disable 在 plugin.json name 與 marketplace 名稱不符時失效；修復背景作業由新版 Claude Code 寫入後從 <code>claude agents</code> 消失或資料遺失；修復崩潰背景任務重啟顯示空白畫面最長 5 秒（現為即時重啟）；修復控制 socket 啟動失敗時 daemon 不可達；Linux 語音模式現區分「無麥克風」與「未安裝 SoX」；<code>claude agents</code> 完成清單填滿可用垂直空間，短終端自動縮小標題；遠端 session 啟動加入設定清單。"},
    {v:"2.1.193", date:"2026-06-25", cat:"Settings/Config", body:"<b>新增 <code>autoMode.classifyAllShell</code> 設定</b>：所有 Bash/PowerShell 指令均走 auto-mode 分類器（原僅分類任意程式碼執行樣式）；<b>auto-mode 拒絕原因</b>同步顯示於 transcript、拒絕提示與 <code>/permissions</code> 最近拒絕清單；<b>新增 <code>claude_code.assistant_response</code> OpenTelemetry 記錄事件</b>（含模型回應文字，預設遮蔽；設 <code>OTEL_LOG_ASSISTANT_RESPONSES=1</code> 解鎖；若已啟用 <code>OTEL_LOG_USER_PROMPTS</code> 升級後亦自動記錄回應，可設 <code>=0</code> 僅記錄 prompt）；<b>bash 模式（<code>!</code>）加入即時檔案路徑自動補全</b>；<b>MCP 伺服器需認證時啟動顯示通知</b>並引導至 <code>/mcp</code>；<b>閒置背景 shell 自動回收記憶體壓力</b>（可用 <code>CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1</code> 停用）。修復：<code>/login</code> 後 <code>/model</code> 等 UI 顯示舊／空白狀態；背景切換（←←）在所有任務均已移轉時誤報「N 背景任務將被放棄」；釘選背景 agent 每次自動更新後重複要求「繼續未完成工作」；切換主 turn 至背景時產生幽靈「general-purpose (resumed)」子 agent 重跑對話；查看子 agent 時面板隱藏兄弟 agent；MCP <code>headersHelper</code> 在工具呼叫回傳 401/403 時自動重跑並重新連線；plugin 自動套用 marketplace <code>renames</code> 對應表更新本地設定名稱；<code>/add-dir</code> 目錄已是工作目錄時提供更清晰提示。"},
    {v:"2.1.191", date:"2026-06-24", cat:"Performance/Bug Fix", body:"<b>CPU 使用率降低 37%</b>：將文字更新合併為 100ms 批次間隔，大幅降低串流回應期間的 CPU 用量；<b>恢復 <code>/rewind</code> 支援</b>：<code>/clear</code> 後可從先前對話點復原；<b>MCP 伺服器可靠性改進</b>：<code>tools/list</code>/<code>prompts/list</code>/<code>resources/list</code> 遇暫時網路錯誤自動重試（含短退避），MCP OAuth 重試強化，無頭環境直接顯示 URL 貼上提示；沙箱網路允許主機在整個 session 內記住（不再每次連線重新詢問）；Vim NORMAL <code>/</code> 搜尋現提示如何存取 slash 指令。修復：串流期間捲動位置跳至底部；停止的背景 agent 在停止後復活；<code>/voice</code> 被組織政策停用時顯示明確說明；Windows Terminal 中 <code>/login</code> URL 換行截斷；<code>/permissions</code>「Recently-denied」標籤批准拒絕後靜默丟棄；hook matcher 逗號分隔樣式永不觸發；<code>forceRemoteSettingsRefresh</code> 透過 MDM 設定時未生效；Ghostty over ssh/tmux 的 Cmd+click 連結異常；長 session 終端輸出快取導致記憶持續增長。"},
    {v:"2.1.190", date:"2026-06-24", cat:"Performance/Bug Fix", body:"Bug 修復與可靠性改進（無使用者面向新功能）。"},
    {v:"2.1.187", date:"2026-06-23", cat:"Permissions/Security", body:"<b>新增 <code>sandbox.credentials</code> 設定</b>：可防止沙箱化指令讀取憑證檔案與機密環境變數；<b>支援組織設定的模型限制</b>：model picker、<code>--model</code>、<code>/model</code>、<code>ANTHROPIC_MODEL</code> 均受控，選擇受限模型時顯示「受組織設定限制」提示；<b>全螢幕模式下選單支援滑鼠點擊</b>（權限提示、<code>/model</code>、<code>/config</code> 等）。修復：<code>--resume</code> 在原 <code>-p</code> 無模型回應時回報「No conversation found」；<code>--json-schema</code> 與 workflow <code>agent({schema})</code> 結構化輸出無限循環問題；遠端 MCP 工具呼叫 5 分鐘無回應改為中止（可用 <code>CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT</code> 覆寫）；Remote Control session 啟動延遲 ~2.7 秒；韓文/CJK 貼上亂碼；<code>/update</code> 透過 Remote Control 時卡住；Agents view 背景工作永久顯示「working」；頻道連線在切換 Agents view 後中斷；子 Agent 深度追蹤與 worktree 登錄洩漏等多項問題。另改善 <code>/install-github-app</code>（GitHub Actions workflow 設定步驟改為可選）、<code>/btw</code> 新增左右方向鍵導覽舊答案、<code>/plugin</code> 浮現近期未用插件便於清理；[VSCode] 修復大型 session resume 時擴充功能無回應。"},
    {v:"2.1.186", date:"2026-06-22", cat:"Plugins/MCP", body:"<b>新增 <code>claude mcp login/logout &lt;name&gt;</code> CLI 指令</b>，可不開互動式 <code>/mcp</code> 選單直接從終端認證 MCP 伺服器（支援 <code>--no-browser</code> 走 stdin 完成 SSH 認證）；<b><code>!</code> Bash 指令輸出現自動觸發 Claude 回應</b>（可用 <code>\"respondToBashCommands\": false</code> 關閉）；<b><code>/workflows</code> 新增 <code>f</code> 鍵篩選 agent 狀態</b>；<code>/plugin</code> 已安裝頁加入 Skills 區段；<code>teammateMode: \"iterm2\"</code> 設定支援 iTerm2 teammate 模式；<code>/login</code> 新增 AWS 憑證重新整理選項；skill frontmatter 現接受 kebab-case/snake_case/camelCase 三種寫法。修復：睡眠喚醒後串流 JSON parse 錯誤、background subagent 權限提示改在主 session 顯示（Esc 只拒絕該工具）、<code>Agent(type)</code> deny 規則未對命名 subagent 強制執行、Workflow subagent schema 驗證失敗時無限循環、session cost 對企業/團隊訂閱用戶未顯示，以及多項 TUI 渲染與背景 session 問題。"},
    {v:"2.1.185", date:"2026-06-20", cat:"Performance/Bug Fix", body:"<b>串流停滯提示訊息改版</b>：等待 API 回應時的提示文字改為「Waiting for API response · will retry in …」，觸發時機從 10 秒延長至 <b>20 秒</b>，減少網路稍慢時的誤報，使用者能更清楚知道 Claude Code 正在等待 API 回應。"},
    {v:"2.1.183", date:"2026-06-19", cat:"Permissions/Security", body:"<b>Auto mode 安全強化：自動阻擋破壞性 git 指令</b>（如 <code>git push --force</code>、<code>reset --hard</code> 等），防止自動化流程誤毀版控歷史；<b>新增模型棄用警告</b>：當前 session 使用的模型即將停用時主動顯示提示；新增 <code>attribution.sessionUrl</code> 設定可記錄 session 來源 URL 方便追蹤。修復：thinking block 顯示錯誤、subagent 中 WebSearch 失效、終端游標位置異常、全螢幕 TUI 畫面損毀等多項問題。"},
    {v:"2.1.181", date:"2026-06-17", cat:"Settings/Config", body:"<b><code>/config</code> 新增直接指定值的語法</b>（例 <code>/config theme dark</code>）；Apple Events sandbox 支援選加入（<code>sandbox.macAppleEventsEnabled</code>）；新增 <code>CLAUDE_CLIENT_PRESENCE_FILE</code> 環境變數，可讓外部程式偵測 Claude Code 是否執行中；Bun 升至 1.4；改善串流中斷後的自動重試機制與 subagent 面板顯示。修復：prompt cache 計費異常、Write/Edit 大檔處理邏輯、多項啟動 regression。"},
    {v:"2.1.179", date:"2026-06-16", cat:"Performance/Bug Fix", body:"修復串流中途斷線後對話卡死的問題；修復 WSL2 環境下滑鼠滾輪無法捲動的問題；修復 sandbox glob 樣式比對異常；新增意見回饋問卷提示與歡迎畫面橫幅；<code>Ctrl+O</code> 現可查看 subagent transcript；改善遠端 session 背景任務的穩定性。"},
    {v:"2.1.178", date:"2026-06-15", cat:"Permissions/Security", body:"<b>權限規則新增 <code>Tool(param:value)</code> 語法</b>，可依參數值精確允許或拒絕工具呼叫（例 <code>Agent(model:opus)</code> 封鎖特定模型 subagent、<code>WebFetch(domain:*.example.com)</code> 限制存取網域，支援 <code>*</code> 萬用字元）；<b>巢狀 <code>.claude/skills</code> 目錄</b>自動按工作目錄載入，名稱衝突時顯示為 <code>&lt;dir&gt;:&lt;name&gt;</code>；Auto mode 改為在 subagent 啟動前先由分類器評估（補上安全缺口）；<code>/doctor</code> 版面扁平化且區段狀態圖示更清晰；workflow 關鍵字高亮改為紫色光暈且只對明確短語觸發（減少誤判）；Remote Control 連線失敗顯示紅色 <code>/rc failed</code> 提示並說明失敗原因；<code>/bug</code> 指令須先輸入描述才可送出。修復：繼承過期 websocket/OAuth 環境變數導致 OOM 崩潰、Chrome OAuth 帳號不符無聲連線失敗、subagent transcript 現正確顯示工具結果與即時進度、<code>--fallback-model</code> 在 compaction 時未生效、MCP server 層級 <code>disallowedTools</code> 被靜默忽略、vim undo 合併多步命令等多項問題。"},
    {v:"2.1.176", date:"2026-06-12", cat:"UI/UX", body:"<b>Session 標題自動適配對話語言</b>（標題以對話所用語言命名）；頁腳連結支援 regex 樣式徽章；改善 Bedrock 憑證快取穩定性。修復：Fable 5 上 <code>enforceAvailableModels</code> 與 auto mode 模型強制問題、hook 條件判斷與 symlink settings 熱重載、tmux/SSH 環境剪貼簿操作、Remote Control 重連與背景 session 啟動等多項問題。"},
    {v:"2.1.175", date:"2026-06-12", cat:"Settings/Config", body:"新增 <code>enforceAvailableModels</code> managed 設定：啟用後，<code>availableModels</code> 允許清單同時限制預設模型；若預設模型解析到不允許的模型，自動降級為清單第一個允許的模型；使用者或專案設定無法擴展受管的 <code>availableModels</code> 清單。"},
    {v:"2.1.174", date:"2026-06-12", cat:"UI/UX", body:"新增 <code>wheelScrollAccelerationEnabled</code> 設定可停用全螢幕模式滑鼠滾輪加速；<b><code>/model</code> 選擇器</b>正確顯示預設模型所屬的模型家族（Max/Team Premium/Enterprise 顯示 Opus 獨立行；Pro/Team 顯示 Sonnet 獨立行）；<b><code>/usage</code> 對話框</b>新增用量歸因：依快取未命中、長 context、subagent 及 skill/agent/plugin/MCP 各項細分，支援過去 24 小時或 7 天時間範圍。修復：Bedrock GovCloud 區域推論設定檔前綴錯誤（400）、背景 session 繼承其他 session 的 provider 環境變數、退出後 shell 指令中斷暫停 1-2 秒、git 共同作者歸因顯示錯誤模型名稱、<code>/advisor</code> 模型被 <code>availableModels</code> 允許清單阻擋、skill 熱重載重送整份清單等多項修復。"},
    {v:"2.1.173", date:"2026-06-11", cat:"Performance/Bug Fix", body:"修復 Fable 5 模型名稱含 <code>[1m]</code> 後綴未正規化的問題（1M context 版 Fable 5 現自動去除後綴）；修復 Windows 啟動時誤報「sandbox dependencies missing」警告。"},
    {v:"2.1.172", date:"2026-06-10", cat:"Subagents/Skills", body:"<b>子 Agent 可遞迴派生</b>（最深 5 層）；Amazon Bedrock 現從 <code>~/.aws</code> 設定檔讀取 AWS region（<code>/status</code> 顯示來源）；<code>/plugin</code> 市集新增搜尋列；OTEL <code>claude_code.lines_of_code.count</code> 加入 <code>model</code> 屬性。修復：1M context session 無使用額度時永久卡住、重複圖片處理錯誤、Agent view spinner 誤延遲 30 秒、背景 agent 讀錯目錄的 <code>.mcp.json</code> 信任設定、<code>availableModels</code> 未套用至子 agent 模型覆寫與 dispatch picker、WebFetch 萬用字元域名規則不匹配，以及多項 <code>/model</code> picker 顯示與效能問題。"},
    {v:"2.1.170", date:"2026-06-09", cat:"Performance/Bug Fix", body:"<b>Claude Fable 5 發布</b>（Mythos 級旗艦模型，效能超越先前所有公開版本，需更新至 2.1.170 才能存取）；修復從 VS Code 整合終端或繼承 Claude Code 環境變數的 shell 啟動時，session 不儲存 transcript 且不出現於 <code>--resume</code> 清單的問題。"},
    {v:"2.1.169", date:"2026-06-08", cat:"Slash Commands", body:"新增 <code>--safe-mode</code>（<code>CLAUDE_CODE_SAFE_MODE</code>）：停用 CLAUDE.md、plugins、skills、hooks、MCP 伺服器，供故障排查；新增 <code>/cd</code> 可在 session 中切換工作目錄而不中斷 prompt cache；新增 <code>disableBundledSkills</code> / <code>CLAUDE_CODE_DISABLE_BUNDLED_SKILLS</code> 可隱藏內建 skills、workflows 與 slash command。修復：企業 MCP 政策在重連前未套用、macOS 每輪開頭 30–50ms UI 卡頓、Windows <code>claude -p</code> 指令掃描掛起（2.1.161 引入）、Remote Control 重新連線後卡在「reconnecting」等多項問題。"},
    {v:"2.1.168", date:"2026-06-06", cat:"Performance/Bug Fix", body:"Bug 修復與可靠性改進（無使用者面向新功能）。"},
    {v:"2.1.167", date:"2026-06-06", cat:"Performance/Bug Fix", body:"Bug 修復與可靠性改進（無使用者面向新功能）。"},
    {v:"2.1.166", date:"2026-06-06", cat:"Settings/Config", body:"新增 <code>fallbackModel</code> 設定（最多三個後備模型，主模型過載或不可用時依序嘗試）；<code>--fallback-model</code> 適用互動工作階段；<b>全球規則工具名稱位置支援 glob 樣式</b>（<code>\"*\"</code> 拒絕所有工具）；<b>跨工作階段訊息強化</b>：透過 <code>SendMessage</code> 中繼的訊息不再攜帶使用者授權。修復：圖像無法處理反覆錯誤與額外 Token 用量、遠端工作階段背景擾亂卡住、JetBrains 終端閃爍、Kitty 協議 Shift+非ASCII 字元遺失、PowerShell 命令驗證偶爾超時。"},
    {v:"2.1.165", date:"2026-06-05", cat:"Performance/Bug Fix", body:"Bug 修復與可靠性改進（無使用者面向新功能）。"},
    {v:"2.1.163", date:"2026-06-04", cat:"Plugins/MCP", body:"<b>受管設定版本控制</b>：新增 <code>requiredMinimumVersion</code>/<code>requiredMaximumVersion</code> managed settings，管理員可強制版本範圍，啟動時超出即拒絕並引導更新。<b>新增 <code>/plugin list</code> 指令</b>（<code>--enabled</code>/<code>--disabled</code> 篩選已裝 plugin）；<code>/btw</code> 加入 <b>c 鍵複製</b>原始 Markdown；<b>Stop/SubagentStop hooks</b> 可回傳 <code>hookSpecificOutput.additionalContext</code> 繼續 turn 而不觸發 hook 錯誤；Skills 加入 <code>\\$</code> 逸出語法（避免數字前 <code>$</code> 被意外展開）；<b>stdio MCP 伺服器現接收 <code>CLAUDE_CODE_SESSION_ID</code></b> 等 session 環境變數（與 hooks/Bash 相同）。修復：<code>claude -p</code> 永久掛起、bazel/EDR 工作流 <code>$TMPDIR</code> 覆蓋 regression（2.1.154 引入）、Windows EEXIST 錯誤、org-managed 權限規則未正確套用、重連後台 session 任務遺失、貼上後鍵盤無響應等多項問題。"},
    {v:"2.1.162", date:"2026-06-03", cat:"UI/UX", body:"<code>claude agents --json</code> 新增 <code>waitingFor</code> 欄位顯示受阻 session；原生 build 的 Grep/Glob 工具改用內建搜尋引擎；<b><code>/effort</code> 預設改為持久化</b>（確認提示）；Slash 指令在自動補全選取後填入 prompt 而非立即執行；<b>Remote Control 改為常駐底部 pill</b>；選單中 Windsurf 改名為 Devin Desktop。修復：唯讀 config 目錄導致啟動卡死、WebFetch 預先核准 domain 的權限規則失效、Windows 反斜線與大小寫路徑規則失效、turn 開頭中斷被靜默丟棄、emoji classifier 的 API 400、低於 1000ms 的 MCP timeout 設定、LSP <code>workspaceSymbol</code> 無結果、<code>claude agents</code> 附加時偶爾彈回 session 列表、背景服務重啟後 session 對話遺失、失敗回覆未排隊重送、深層目錄跨 session 訊息失敗，以及多項啟動訊息整潔化。"},
    {v:"2.1.161", date:"2026-06-02", cat:"Performance/Bug Fix", body:"<code>OTEL_RESOURCE_ATTRIBUTES</code> 值自動附加為 metrics 標籤，可依團隊/repo 切分用量；<code>claude agents</code> 列顯示 <b>done/total</b> 工作扇出進度；<code>/mcp</code> 預設折疊未用的 claude.ai connectors；<b>平行工具呼叫修復</b>：Bash 指令失敗不再取消同批其他呼叫；全螢幕模式剪貼簿改用 <code>wl-copy</code>/<code>xclip</code>/<code>xsel</code>（同時寫 clipboard 與 PRIMARY）；JIT 穩定化提升大檔寫入渲染效能。另修復 <code>/effort</code> dialog 動畫、managed-settings 封鎖第三方 provider session、背景 subagent 污染 <code>claude -p</code> stdout、<code>claude mcp list</code> 洩漏 secrets，以及多項 Windows/worktree/VSCode 問題。"},
    {v:"2.1.160", date:"2026-06-02", cat:"Permissions/Security", body:"寫 shell 啟動檔（<code>.zshenv</code>、<code>.zlogin</code>、<code>.bash_login</code>）或 <code>~/.config/git/</code> 前先 prompt；<code>acceptEdits</code> 模式寫 <code>.npmrc</code>、<code>.yarnrc*</code>、<code>.bazelrc</code>、<code>.devcontainer/</code> 等可執行的 build 設定也先問。<b>動態工作流的觸發關鍵字從 <code>workflow</code> 改為 <code>ultracode</code></b>（紫色高亮）。Edit 工具現在認 grep 為 read-before-edit 條件。修 Windows WSL 剪貼簿用 PowerShell interop。"},
    {v:"2.1.159", date:"2026-05-31", cat:"Performance/Bug Fix", body:"內部基礎設施改善（無使用者面向變更）。"},
    {v:"2.1.158", date:"2026-05-30", cat:"Settings/Config", body:"<b>Auto mode 開放到 Bedrock / Vertex / Foundry</b>（限 Opus 4.7、4.8）；以 <code>CLAUDE_CODE_ENABLE_AUTO_MODE=1</code> 啟用。"},
    {v:"2.1.157", date:"2026-05-29", cat:"Plugins/MCP", body:"<b><code>.claude/skills</code> 目錄下的 plugins 自動載入</b>，免 marketplace；新 <code>claude plugin init &lt;name&gt;</code> 腳手架；<code>/plugin</code> 參數自動補全（子命令、已裝 plugin、marketplace）；<code>claude agents</code> 尊重 settings.json 的 <code>agent</code> 欄位（<code>--agent</code> 可覆寫）；<b><code>EnterWorktree</code> 可中途切換 Claude-managed worktree</b>；<code>OTEL_LOG_TOOL_DETAILS=1</code> 時 <code>tool_decision</code> 事件含 <code>tool_parameters</code>；WSL 圖片貼上 / 拖曳支援強化；多項 <code>--resume</code> 與 <code>/model</code> picker 修復。"},
    {v:"2.1.156", date:"2026-05-29", cat:"Performance/Bug Fix", body:"修復使用 <b>Opus 4.8</b> 時 thinking blocks 被修改導致 API 錯誤的問題。"},
    {v:"2.1.154", date:"2026-05-28", cat:"Performance/Bug Fix", body:"<b>Opus 4.8 發布</b>，預設 high effort、<code>/effort xhigh</code> 應戰最難任務；<b>動態工作流</b>：請 Claude 建 workflow 即可在背景同時編排數十到上百個 agent，<code>/workflows</code> 檢視。Opus 4.8 fast mode 半價提速 2.5×；Lean system prompt 成為 Haiku/Sonnet/Opus 4.7 以外的預設。"},
    {v:"2.1.153", date:"2026-05-28", cat:"Plugins/MCP", body:"新增 <code>skipLfs</code> marketplace 來源選項略過 Git LFS；status line 指令收到 <code>COLUMNS</code>/<code>LINES</code>；<code>claude agents</code> dispatch 自動補全本機 slash 指令與 skills；<code>/model</code> 預設儲存改為新 sessions 預設（按 <code>s</code> 僅當前 session）；多項 subagent MCP 修復。"},
    {v:"2.1.152", date:"2026-05-27", cat:"Hooks", body:"<code>/code-review --fix</code> 套用 review 改動到工作樹；<b>skills 與 slash 指令 frontmatter 可設 <code>disallowed-tools</code></b>；新 <code>/reload-skills</code> 不需重啟即重掃 skills 目錄；新 <code>MessageDisplay</code> hook 可改寫或隱藏 assistant 文字；<code>SessionStart</code> hook 可回傳 <code>reloadSkills</code> 或設 <code>sessionTitle</code>。"},
    {v:"2.1.150", date:"2026-05-23", cat:"Performance/Bug Fix", body:"內部基礎設施改善（無使用者面向變更）。"},
    {v:"2.1.149", date:"2026-05-22", cat:"UI/UX", body:"<code>/usage</code> 顯示 skills、subagents、plugins、每個 MCP 伺服器 cost 的逐類拆解；<code>/diff</code> 詳細頁可鍵盤捲動；markdown 渲染 GFM 任務清單核取方塊；修補 PowerShell 內建 <code>cd</code> 函式 (<code>cd..</code>/<code>cd\\</code>) 繞過權限檢查的安全問題。"},
    {v:"2.1.148", date:"2026-05-22", cat:"Performance/Bug Fix", body:"<b>重要修復</b>：修正 Bash 工具對所有指令回傳 exit code 127 的 regression（由 2.1.147 引入）。"},
    {v:"2.1.147", date:"2026-05-21", cat:"Slash Commands", body:"<code>Ctrl+T</code> 釘選背景 session 永不閒置回收，可就地重啟套用更新；<b><code>/simplify</code> 改名為 <code>/code-review</code></b>，依 effort 回報 bug，可 <code>--comment</code> 貼進 PR；auto-updater 更聰明（網路重試、錯誤分類）；提示歷史去重連續重複。"},
    {v:"2.1.145", date:"2026-05-19", cat:"IDE/Editor", body:"<code>claude agents --json</code> 以 JSON 列出活躍 sessions（tmux-resurrect/status bar）；OTEL 新增 <code>agent_id</code>/<code>parent_agent_id</code>；status line JSON 含 GitHub repo/PR；<code>/plugin</code> Discover/Browse 安裝前先看 commands、agents、skills、hooks、MCP/LSP；Read tool 超大檔回 PARTIAL view 而非硬錯。"},
    {v:"2.1.144", date:"2026-05-19", cat:"UI/UX", body:"<b>背景 session 支援 <code>/resume</code></b>，標記 <code>bg</code>；背景 subagent 完工通知含 elapsed；<code>/plugin</code> 顯示最後更新時間；<code>/model</code> 改為僅變當前 session（按 <code>d</code> 設預設）；<code>/extra-usage</code> 改名 <code>/usage-credits</code>；修復 <code>api.anthropic.com</code> 不可達時啟動最久 75s 卡住。"},
    {v:"2.1.143", date:"2026-05-15", cat:"Plugins/MCP", body:"<b>Plugin 依賴強制</b>：<code>claude plugin disable</code> 拒絕被依賴 plugin、<code>enable</code> 自動連帶；<code>/plugin</code> marketplace 顯示預估 context 成本；新 <code>worktree.bgIsolation: \"none\"</code> 讓背景 session 直接編輯工作樹；PowerShell tool 預設加 <code>-ExecutionPolicy Bypass</code>。"},
    {v:"2.1.142", date:"2026-05-14", cat:"Settings/Config", body:"<code>claude agents</code> 新增 <code>--add-dir</code>、<code>--settings</code>、<code>--mcp-config</code>、<code>--plugin-dir</code>、<code>--permission-mode</code>、<code>--model</code>、<code>--effort</code>、<code>--dangerously-skip-permissions</code>；<b>Fast mode 預設改用 Opus 4.7</b>（要 4.6 設 <code>CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE=1</code>）；plugin 根 <code>SKILL.md</code> 視為 skill。"},
    {v:"2.1.141", date:"2026-05-13", cat:"Hooks", body:"hook JSON 輸出新增 <code>terminalSequence</code> 可發桌面通知、視窗標題、鈴聲；<code>CLAUDE_CODE_PLUGIN_PREFER_HTTPS</code> 走 HTTPS 拉 GitHub plugin；<code>ANTHROPIC_WORKSPACE_ID</code> workload identity；<code>claude agents --cwd</code>；rewind 選單加 <b>Summarize up to here</b>。"},
    {v:"2.1.140", date:"2026-05-12", cat:"Performance/Bug Fix", body:"Agent tool <code>subagent_type</code> 比對改為大小寫與分隔符不敏感（如 <code>\"Code Reviewer\"</code> → <code>code-reviewer</code>）；agent 色彩調色盤更新。修復：<code>/goal</code> 在 <code>disableAllHooks</code> 設定下無聲掛起、symlink settings hot-reload regression 導致誤報 <code>ConfigChange</code> hook、<code>claude --bg</code> 在服務即將 idle 關閉時失敗、企業 endpoint security 封鎖背景服務啟動，以及多項 Windows/loop/讀取工具修復。"},
    {v:"2.1.139", date:"2026-05-11", cat:"IDE/Editor", body:"<b>Agent View（Research Preview）：<code>claude agents</code> 一個畫面看所有 Claude session</b>（執行中、待回應、完工）；新 <code>/goal</code> 指令跨 turn 持續工作直到達成；新 <code>/scroll-speed</code>；<code>claude plugin details</code> 顯示元件清單與預估 token 成本；transcript view 支援 <code>{</code>/<code>}</code> 跳到使用者提示。"},
    {v:"2.1.138", date:"2026-05-09", cat:"Performance/Bug Fix", body:"內部修復（無使用者面向變更）。"},
    {v:"2.1.137", date:"2026-05-09", cat:"IDE/Editor", body:"<b>[VSCode]</b> 修復 VS Code extension 在 Windows 無法啟動的問題。"},
    {v:"2.1.136", date:"2026-05-08", cat:"Settings/Config", body:"新增 <code>CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL</code>；<code>settings.autoMode.hard_deny</code> 無條件阻擋規則；修復 VS Code/JetBrains/SDK 中 <code>/clear</code> 後 MCP 伺服器消失、OAuth refresh token 並發遺失（多 MCP 伺服器不再每天重登）、plan mode 不阻擋有 <code>Edit</code> allow 規則之檔案寫入。"},
    {v:"2.1.133", date:"2026-05-07", cat:"Settings/Config", body:"新增 <code>worktree.baseRef</code> 設定（<code>fresh</code>/<code>head</code>）；<code>sandbox.bwrapPath</code>/<code>sandbox.socatPath</code> managed settings；hooks 可讀 <code>effort.level</code> 與 <code>$CLAUDE_EFFORT</code>；修復多 session 因 token refresh race 一起 401；修復 subagents 無法用 Skill tool 找到 project/user/plugin skills。"},
    {v:"2.1.132", date:"2026-05-06", cat:"Settings/Config", body:"新增 <code>CLAUDE_CODE_SESSION_ID</code> 環境變數可在 Bash 子程序使用、新增 <code>CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN</code> opt-out；多項 TUI 修復（貼上、全螢幕白屏、vim NFD 字元、slash autocomplete、status line context counts）。"},
    {v:"2.1.131", date:"2026-05-06", cat:"IDE/Editor", body:"修復 Windows 上 VS Code extension 啟動問題；Mantle endpoint 認證標頭修正。"},
    {v:"2.1.129", date:"2026-05-06", cat:"Plugins/MCP", body:"新增 <code>--plugin-url &lt;url&gt;</code> 旗標可從 URL 拉取 plugin .zip；plugin manifest 中 <code>themes</code>/<code>monitors</code> 移到 <code>experimental</code>；gateway <code>/v1/models</code> 探索改為 opt-in。"},
    {v:"2.1.128", date:"2026-05-04", cat:"Plugins/MCP", body:"<code>/mcp</code> 顯示 tool 數量並標出 0-tool servers；<code>--plugin-dir</code> 支援 .zip；<b>workspace</b> 變保留的 MCP 伺服器名；subagent prompt-cache 修復（cache_creation 約降至 1/3）；MCP 重連訊息抑制。"},
    {v:"2.1.126", date:"2026-05-01", cat:"Permissions/Security", body:"<code>/model</code> picker 列出 gateway 模型；新增 <code>claude project purge</code>；<code>--dangerously-skip-permissions</code> 不再可繞過 .claude/.git；OAuth code 支援 WSL2/SSH 貼上 fallback；<b>allowManagedDomainsOnly 安全修復</b>。"},
    {v:"2.1.123", date:"2026-04-29", cat:"Performance/Bug Fix", body:"修復當 <code>CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1</code> 時 OAuth 401 重試迴圈。"},
    {v:"2.1.122", date:"2026-04-28", cat:"Settings/Config", body:"新增 <code>ANTHROPIC_BEDROCK_SERVICE_TIER</code> 環境變數；<b>把 PR URL 貼進 <code>/resume</code> 會自動找對應 session</b>（GitHub/GitLab/Bitbucket）；OTel 新增 <code>at_mention</code> 事件；多項 <code>/branch</code>、<code>/model</code> Bedrock 修復。"},
    {v:"2.1.121", date:"2026-04-28", cat:"Plugins/MCP", body:"MCP 新增 <code>alwaysLoad</code> 選項（跳過 tool-search 延遲載入）；<code>claude plugin prune</code> 清理孤兒依賴；<code>/skills</code> 加搜尋框；<b>PostToolUse hooks 可用 <code>updatedToolOutput</code> 替換任意工具輸出</b>；iTerm2 在 tmux 下也能 <code>/copy</code>。"},
    {v:"2.1.120", date:"2026-04-28", cat:"IDE/Editor", body:"Windows: 不再強制需要 Git for Windows（PowerShell fallback）；新增非互動式 <code>claude ultrareview [target]</code>；skills 可使用 <code>${CLAUDE_EFFORT}</code>；多 connector 啟動加速。"},
    {v:"2.1.119", date:"2026-04-23", cat:"Settings/Config", body:"<code>/config</code> 設定持久化到 <code>~/.claude/settings.json</code> 並有正確 override 順序；新 <code>prUrlTemplate</code> 設定；<code>--from-pr</code> 支援 GitLab/Bitbucket/GH Enterprise；<code>--print</code> 尊重 agent frontmatter；PowerShell auto-approve。"},
    {v:"2.1.118", date:"2026-04-23", cat:"UI/UX", body:"<b>vim 新增 visual (v) 與 visual-line (V) 模式</b>；<code>/cost</code>+<code>/stats</code> 合併為 <code>/usage</code>；<code>/theme</code> 可命名自訂主題；hooks 可呼叫 MCP 工具；<code>DISABLE_UPDATES</code> 環境變數；<code>claude plugin tag</code>。"},
    {v:"2.1.117", date:"2026-04-22", cat:"Subagents/Skills", body:"<code>CLAUDE_CODE_FORK_SUBAGENT=1</code> 在外部建置啟用 forked subagents；<code>--agent</code> 載入 agent frontmatter 中的 <code>mcpServers</code>；<code>/model</code> 選擇跨重啟保留；原生 macOS/Linux Glob/Grep 改用內建 bfs/ugrep；預設 effort 升至 <b>high</b>。"},
    {v:"2.1.116", date:"2026-04-20", cat:"Performance/Bug Fix", body:"<code>/resume</code> 在 40MB+ session 約快 67%；MCP 啟動延後 <code>resources/templates/list</code>；VS Code/Cursor/Windsurf 全螢幕滾動更平順；thinking spinner 顯示 inline 進度；sandbox dangerous-path 安全修復。"},
    {v:"2.1.114", date:"2026-04-18", cat:"Performance/Bug Fix", body:"修復 agent teammate 請求權限時 permission dialog 崩潰問題。"},
    {v:"2.1.113", date:"2026-04-17", cat:"Performance/Bug Fix", body:"CLI 改為 spawn 原生 Claude Code binary（取代 bundled JS）；新增 <code>sandbox.network.deniedDomains</code>；長 URL 換行後仍可點擊；<code>/loop</code> 可中斷喚醒；<code>/extra-usage</code> 從 Remote Control 可用；多項 Bash 安全強化。"},
    {v:"2.1.112", date:"2026-04-16", cat:"Performance/Bug Fix", body:"修復 auto mode 下 \"claude-opus-4-7 is temporarily unavailable\" 問題。"},
    {v:"2.1.111", date:"2026-04-16", cat:"Subagents/Skills", body:"<b>Claude Opus 4.7 xhigh 釋出</b>；Max 訂閱者可在 Opus 4.7 用 auto mode；新 <code>xhigh</code> effort level；<code>/effort</code> 互動 slider；\"Auto (match terminal)\" 主題；<b>新 <code>/less-permission-prompts</code> skill</b>；<b>新 <code>/ultrareview</code> 雲端平行多 agent code review</b>；PowerShell tool 漸進釋出。"},
    {v:"2.1.110", date:"2026-04-15", cat:"UI/UX", body:"新 <code>/tui</code> 指令與 <code>tui</code> 設定（<code>/tui fullscreen</code> 無閃爍）；Remote Control 啟用時提供 push notification 工具；<code>Ctrl+O</code> 改為只切 verbose；新 <code>/focus</code>；<code>--resume</code>/<code>--continue</code> 可復活排程任務。"},
    {v:"2.1.109", date:"2026-04-15", cat:"UI/UX", body:"改善 extended-thinking indicator，加入輪播進度提示。"},
    {v:"2.1.108", date:"2026-04-14", cat:"Slash Commands", body:"新 <code>ENABLE_PROMPT_CACHING_1H</code>（API key/Bedrock/Vertex/Foundry 1 小時 prompt cache TTL）；<b>新 recap 功能與 <code>/recap</code> 指令</b>；<b>模型可透過 Skill 工具呼叫 <code>/init</code>、<code>/review</code>、<code>/security-review</code></b>；<code>/undo</code> 為 <code>/rewind</code> 別名。"},
    {v:"2.1.107", date:"2026-04-14", cat:"UI/UX", body:"在長時間操作時更早顯示思考提示。"},
    {v:"2.1.105", date:"2026-04-13", cat:"Hooks", body:"<code>EnterWorktree</code> 新增 <code>path</code> 參數；<b>PreCompact hook 可阻擋 compaction</b>；plugin manifest <code>monitors</code> 鍵支援背景程序；<code>/proactive</code> 為 <code>/loop</code> 別名；卡住的 stream 5 分鐘後 abort+非串流重試；<code>/doctor</code> 按 <code>f</code> 一鍵修復。"},
    {v:"2.1.101", date:"2026-04-10", cat:"Slash Commands", body:"<b>新 <code>/team-onboarding</code> 指令</b>；預設信任 OS CA 憑證庫；<code>/ultraplan</code> 自動建立預設 cloud 環境；更好的 tool-not-available 錯誤；多項 <code>/resume</code> 修復。"},
    {v:"2.1.98", date:"2026-04-09", cat:"Permissions/Security", body:"登入流程新增互動式 Google Vertex AI setup wizard；新 <code>CLAUDE_CODE_PERFORCE_MODE</code>；新 Monitor 工具（背景腳本事件流）；<b>Linux 子程序加 PID namespace</b>；<code>--exclude-dynamic-system-prompt-sections</code> 跨用戶 cache；<code>/agents</code> 改為 Running/Library 分頁。"},
    {v:"2.1.97", date:"2026-04-08", cat:"UI/UX", body:"<code>NO_FLICKER</code> 模式下 <code>Ctrl+O</code> 切 focus view；status line 新 <code>refreshInterval</code>；<code>workspace.git_worktree</code> 進入 status line JSON；<code>/agents</code> 顯示 <code>● N running</code>；Cedar policy syntax highlighting。"},
    {v:"2.1.96", date:"2026-04-08", cat:"Performance/Bug Fix", body:"修復 Bedrock 在 <code>AWS_BEARER_TOKEN_BEDROCK</code> / <code>CLAUDE_CODE_SKIP_BEDROCK_AUTH</code> 下 403 問題。"},
    {v:"2.1.94", date:"2026-04-07", cat:"Settings/Config", body:"Amazon Bedrock 透過 Mantle 支援；API/Bedrock/Vertex/Foundry/Team/Enterprise 預設 effort 從 medium → high；MCP send-message 支援可點擊 Slack channel header；plugin output styles 加 <code>keep-coding-instructions</code> frontmatter；<code>UserPromptSubmit</code> hook 加 <code>sessionTitle</code>。"},
    {v:"2.1.92", date:"2026-04-04", cat:"Settings/Config", body:"新 <code>forceRemoteSettingsRefresh</code> policy（fail-closed 啟動）；互動式 Bedrock setup wizard；<code>/cost</code> 加 per-model + cache-hit 細分；<code>/release-notes</code> 互動 picker；<b>移除 <code>/tag</code> 與 <code>/vim</code></b>。"},
    {v:"2.1.91", date:"2026-04-02", cat:"Plugins/MCP", body:"MCP 工具結果 size 可透過 <code>_meta[\"anthropic/maxResultSizeChars\"]</code> 覆寫（最高 500K）；<code>disableSkillShellExecution</code> 設定；<code>claude-cli://</code> deep link 支援多行 prompt；<b>plugins 可在 <code>bin/</code> 內附執行檔</b>；Edit 工具用更短 anchor。"},
    {v:"2.1.90", date:"2026-04-01", cat:"Slash Commands", body:"新 <code>/powerup</code> 互動課程（含動畫）；<code>CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE</code>；rate-limit 對話框無限迴圈修復；auto mode 尊重使用者明確邊界；SSE transport 大 frame 改為線性時間。"},
    {v:"2.1.89", date:"2026-04-01", cat:"Hooks", body:"PreToolUse hooks 新增 <code>\"defer\"</code> 權限決策（headless 暫停/恢復）；<code>CLAUDE_CODE_NO_FLICKER=1</code>（無閃爍 alt-screen）；<b>新 <code>PermissionDenied</code> hook</b>；@-mention 自動完成支援命名 subagent；<code>MCP_CONNECTION_NONBLOCKING=true</code>；thinking summaries 預設關閉。"},
    {v:"2.1.87", date:"2026-03-29", cat:"Performance/Bug Fix", body:"修復 Cowork Dispatch 訊息派發問題。"},
    {v:"2.1.86", date:"2026-03-27", cat:"Subagents/Skills", body:"新增 <code>X-Claude-Code-Session-Id</code> 標頭以利 proxy 聚合；<code>.jj</code>/<code>.sl</code> 排除於 Grep/autocomplete；Bedrock/Vertex/Foundry prompt-cache 命中率提升；<code>/skills</code> 描述上限 250 字；<code>/skills</code> 字母排序。"},
    {v:"2.1.85", date:"2026-03-26", cat:"Hooks", body:"新 <code>CLAUDE_CODE_MCP_SERVER_NAME</code>/<code>_URL</code> env vars 提供給 <code>headersHelper</code>；<b>hooks 新增條件式 <code>if</code> 欄位（permission-rule 語法）</b>；MCP OAuth 遵循 RFC 9728 PRM；PreToolUse hook 可透過 <code>updatedInput</code> 滿足 <code>AskUserQuestion</code>；transcript 為排程任務加 timestamp marker。"},
    {v:"2.1.84", date:"2026-03-26", cat:"IDE/Editor", body:"<b>Windows PowerShell tool（opt-in preview）</b>；新 <code>CLAUDE_STREAM_IDLE_TIMEOUT_MS</code>；新 <code>TaskCreated</code> hook；<code>WorktreeCreate</code> hook 支援 HTTP；<code>allowedChannelPlugins</code> managed 設定；75 分鐘閒置會建議 <code>/clear</code>；裸 <code>#123</code> 不再被自動連結。"},
    {v:"2.1.83", date:"2026-03-25", cat:"Hooks", body:"<code>managed-settings.d/</code> drop-in 目錄；<b>新 <code>CwdChanged</code> + <code>FileChanged</code> hooks</b>；<code>sandbox.failIfUnavailable</code> 設定；<code>disableDeepLinkRegistration</code>；<code>CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1</code> 清除子程序憑證；<b>transcript 搜尋（在 Ctrl+O 中按 /）</b>；<code>Ctrl+X Ctrl+E</code> 外部編輯器；<code>[Image #N]</code> chip。"}
  ];

  const DATA_CA = [
    {v:"2026-08-20", date:"2026-08-20", cat:"Cloud/Web", title:"Apple Messages Plugin、Site 協作編輯與 Computer History 歐洲上線", body:"新增：<b>Apple Messages plugin</b>：可在 macOS 讀取／搜尋 Mac 上的 Messages 對話並準備或傳送訊息，所有方案皆可在 ChatGPT desktop app 使用，並可於 ChatGPT Work 與 Codex 內呼叫，預設僅在核准訊息內容與收件人後才會送出；<b>Site 協作編輯</b>：Site collaboration 可用時，擁有者可邀請同 workspace 成員擔任編輯者，編輯者可讀取 Site 即時資料庫資料、更新 Site、儲存版本並於擁有者首次發佈後發佈變更，擁有者仍保留受眾、設定、分析、所有權、版本回復與編輯者權限的控管；<b>可編輯 Site 網址</b>：URL 編輯功能可用時，擁有者可變更既有 Site 的 ChatGPT-hosted 網址且免重新部署，舊網址會導向新網址（自訂網域不受影響）；<b>Computer History 擴及歐洲</b>：ChatGPT desktop app（macOS）的 Computer History 現於 EEA、瑞士與英國對 Pro、Business、Enterprise 使用者開放，預設關閉且需開啟 Memories，Business／Enterprise 須先由管理員開放權限；<b>Shared thread snapshots</b>：所有 Codex 方案可從 ChatGPT desktop app（macOS）分享本機 Codex thread 的唯讀快照，快照不隨原 thread 變動而更新，個人帳號連結任何人可開啟、workspace 帳號連結僅限同 workspace 成員，Codex 會遮罩已知機密格式但仍建議檢查分享內容，可在 ChatGPT data controls 的 Shared links 檢視或撤銷；<b>統一釘選對話</b>：ChatGPT desktop app 與 iOS 現共用相同的釘選對話清單。"},
    {v:"2026-08-13", date:"2026-08-13", cat:"UI/UX", title:"Computer History：把電腦活動化為可搜尋記憶", body:"<b>新增 Computer History（選擇性啟用）</b>：ChatGPT 桌面應用程式（macOS）可將跨 App 與網站的活動整理成記憶與時間軸，供 ChatGPT 與 Codex 使用；可自選哪些 App／網站納入、隨時暫停收集，或檢視與刪除既有紀錄。開放對象為 ChatGPT Pro、Business 與 Enterprise 使用者，Business／Enterprise 需由管理員先啟用權限成員才能開啟；初期不含歐洲經濟區（EEA）、瑞士與英國。"},
    {v:"2026-08-11", date:"2026-08-11", cat:"UI/UX", title:"ChatGPT 桌面應用程式 Linux 預覽版 + Agent 匯入", body:"<b>ChatGPT 桌面應用程式推出 Linux 預覽版</b>：支援 Ubuntu、Debian、Fedora（x64／ARM64），下載 <code>.deb</code> 或 <code>.rpm</code> 套件安裝後登入即可使用專案、本機檔案與 Codex；<b>匯入其他 Agent 的既有設定與近期工作</b>：桌面應用程式支援匯入 Claude Code、Claude Cowork 與 Cursor 的指令、設定、skill、plugin、專案與近期工作，可在 Settings > Import 開啟自動更新持續同步；Codex CLI 亦可透過 <code>/import</code> 匯入 Claude Code 與 Cursor 的支援設定與近期對話。"},
    {v:"2026-07-30", date:"2026-07-30", cat:"UI/UX", title:"內建瀏覽器強化、跨 Repo Review 與圖片編輯 Canvas View", body:"<b>內建瀏覽器加入網址列</b>：可直接輸入網址重訪瀏覽紀錄或無符合結果時搜尋 Google；瀏覽紀錄可在 Settings 管理，並可讓 ChatGPT 搜尋歷史頁面協助找回先前造訪過的頁面；<b>Chrome 擴充功能強化</b>：可 <code>@mention</code> 已開啟分頁或帶入畫面反白文字進側邊聊天，並可直接對任意 YouTube 影片提問取得摘要；網頁上右鍵新增「Ask ChatGPT」選項。<b>跨 Repo Review</b>：multi-folder project 可一次檢視所有 repo 的異動行數，選擇 Review 即可跨 repo 檢視 diff 而不必切換視窗。<b>圖片編輯 Canvas View</b>：生成圖片新增放大檢視器，可切換 Focused view 與 Canvas view，對多張圖片加註解、選取要套用的版本，直接在對話中送出局部修改而不必離開視窗。其他：側欄新增 Activity view 顯示近期需留意的對話（可按鈴鐺圖示或 <code>Cmd/Ctrl+Opt+U</code> 切換）；瀏覽器設定僅列出支援的瀏覽器；改善 Windows 套件路徑過長時的安裝可靠性；其他效能與 bug 修復。"},
    {v:"2026-07-27", date:"2026-07-27", cat:"UI/UX", title:"語音 ChatGPT 聲音設定、任務重連改善與 Composer 技能補全", body:"<b>語音對話採用所選 ChatGPT 聲音</b>並在接近用量上限時顯示警示；<b>任務重連與連續性改善</b>：返回 App 或以 Face ID 解鎖後，任務恢復更穩定流暢；<b>Composer 自動補全強化</b>：現可對應桌面版的 plugin mention，並納入已安裝 plugin 提供的技能；<b>選取文字參照送出後仍保留</b>，可在傳送後重新預覽所選內容；<b>Goal 控制改善</b>：暫停或繼續時進度顯示更清晰；<b>Inline 視覺化改進</b>：表格與視覺主題渲染更穩定可靠。"},
    {v:"2026-07-23", date:"2026-07-23", cat:"UI/UX", title:"ChatGPT Voice（GPT-Live）+ 多資料夾本地專案", body:"新增 <b>ChatGPT Voice（GPT-Live）</b>：在 ChatGPT 桌面應用程式（macOS/Windows）中透過語音跨 Chat、Work、Codex 協調任務，說一句話即可同時觸發討論、指派 Codex 任務與查詢文件；<b>多資料夾本地專案</b>：本地專案可包含多個相關資料夾，並可指定主要資料夾，適合跨 repo 或 monorepo 工作情境。"},
    {v:"2026-07-20", date:"2026-07-20", cat:"UI/UX", title:"iOS 互動表單 + Mermaid 圖表 inline 渲染", body:"<b>Codex for iOS 任務互動表單</b>：任務中的互動表單（interactive forms）正式支援，可在 iOS 裝置上直接填寫表單與操作；<b>Mermaid 圖表 inline 渲染</b>：任務 transcript 中的 Mermaid 語法可直接在 iOS 上 inline 渲染為視覺化圖表，無需切換外部工具。"},
    {v:"2026-07-13", date:"2026-07-13", cat:"UI/UX", title:"任務 Inline 視覺化、Composer 鍵盤優化與多項修復", body:"新增<b>任務 Inline 視覺化</b>：可直接在 Codex 任務中預覽圖表與視覺化輸出；改善從對話中<b>建立與管理任務的流程</b>，新建任務的連結更穩定可靠；優化工具活動樣式與進度指示器；改善開檔回饋體驗；改善 Composer 在長提示與較大文字尺寸下的鍵盤配置，確保控制項持續可見於鍵盤上方。修復：每個任務的 Fast mode 選擇與還原；初始提示忽略已選核准預設值；autocomplete 背景色異常及滑動手勢中 task row 無回應等問題。"},
    {v:"2026-07-09", date:"2026-07-09", cat:"Cloud/Web", title:"Codex 整合進 ChatGPT 桌面應用程式；GPT-5.6 加速 Computer Use", body:"<b>Codex 正式成為 ChatGPT 桌面應用程式的一部分</b>（macOS 與 Windows）；現有 Codex App 使用者可照常更新，專案、設定與工作流程完整保留，可將 Codex 設為預設視圖，macOS 亦可保留 Codex App 圖示。新增<b>直接在 App 內編輯 Markdown 與程式碼</b>，支援 inline 批注與要求 Codex 修訂選取內容；<b>側邊欄整合 GitHub PR 審查</b>，可在 diff 旁並排查看審查意見而無需離開 App；支援在同一專案內<b>跨多個 repo 工作</b>；<b>Computer Use 改用 GPT-5.6 提速</b>；改善任務活動與進度追蹤可視性；<b>Plugin 管理移至 Settings 頁面</b>；提升行動端連線穩定性並修復 SSH 專案的影片渲染。"},
    {v:"2026-07-06", date:"2026-07-06", cat:"UI/UX", title:"任務管理、Diff 篩選器、附件預覽與 SSH 快捷鍵", body:"新增從對話中<b>直接建立、搜尋、開啟、分叉與管理 Codex 任務</b>；新增 Diff 檢視<b>篩選器</b>（staged、unstaged、branch、last-turn 變更），支援跨分支比較；支援將選取的 transcript 文字<b>直接加入 composer</b>；圖片與檔案附件可在送出前<b>預覽</b>；附件選單加入 Photos 與 Camera 快速選取器；新增 SSH 主機連線捷徑，支援使用私鑰或免密碼登入；任務選單顯示<b>用量限制與點數明細</b>。"},
    {v:"2026-06-25", date:"2026-06-25", cat:"Cloud/Web", title:"Codex Remote 正式上線；DigitalOcean Plugin 發布", body:"<b>Codex Remote 正式進入 GA</b>：可透過 ChatGPT 行動 App 從手機啟動或繼續 Mac/Windows 主機上的工作、查看進度並核准操作。<b>Remote Control 改用一對一 QR 配對認證</b>（iOS/Android 裝置與主機各自獨立配對），請同步更新 ChatGPT App 與 Codex App；2026-06-08 後使用的連線維持配對，較舊的閒置連線需重新配對。<b>全新 DigitalOcean Plugin</b>：讓 Codex 自動佈建 DigitalOcean Droplet、設定 SSH 存取，並將其連接為遠端工作空間。"},
    {v:"2026-06-22", date:"2026-06-22", cat:"UI/UX", title:"iOS 個性設定與 Composer 功能強化", body:"新增<b>每台主機獨立個性設定</b>（Friendly 與 Pragmatic 兩種選項）；支援<b>直接在 Composer 中編輯 Goals</b>；新增從分叉對話返回原始 thread 的連結；改善側邊聊天可視性（在 composer 上方分開顯示對話）；改善 Composer 對指令、skill 與 plugin 的自動補全；改善 subagent、任務與 worktree 建立的進度可視性。"},
    {v:"2026-06-11", date:"2026-06-11", cat:"UI/UX", title:"用量限制點數銀行、Developer Mode 與企業 Computer Use", body:"<b>用量限制重置點數銀行</b>：Plus/Pro 使用者可保存重置點數，上線即獲一次免費重置，並可透過邀請獲取更多；Business 成員可透過獨立邀請計畫獲得共享工作空間點數。新增<b>Developer mode</b>（Chrome 與 Codex in-app browser）：讓 Codex 透過 Chrome DevTools Protocol（CDP）存取效能分析工具，可除錯網路流量、主控台輸出、執行期錯誤與頁面狀態。新增 <b><code>/init</code> 指令</b>至 App composer（與 CLI 相同的專案初始化流程）；可自訂 macOS Dock 圖示（淺色/深色變體）；<b>企業用戶 Computer Use 擴展上線</b>（歐洲經濟區、英國、瑞士除外），並支援在 Windows 上設定每個 App 的 Computer Use 存取控制。"},
    {v:"2026-06-02", date:"2026-06-02", cat:"Cloud/Web", title:"Sites Plugin 預覽版上線", body:"新增 <b>Sites Plugin（預覽版）</b>：可在 Codex 內直接建立、儲存、部署與檢視網站、儀表板、內部工具、Web App 與遊戲，由 OpenAI 托管。"},
    {v:"2026-05-28", date:"2026-05-28", cat:"UI/UX", title:"Windows 支援 Computer Use 與行動端遠端控制", body:"<b>Computer Use 登陸 Windows</b>：Codex 可在 Windows 桌面前景看見、點擊、輸入操作原生 App。<b>Remote control</b> 也支援 Windows 主機，可從 ChatGPT iOS/Android 或 Mac 上的 Codex 啟動並追蹤 Windows 上的工作。Profile 區新增使用量與 token 活動，past thread 搜尋擴及對話內容與 Git branch 名稱。"},
    {v:"2026-05-13", date:"2026-05-13", cat:"Remote/Mobile", title:"從 ChatGPT 手機 App 遠端使用 Codex", body:"新增 <b>Remote connections</b>：ChatGPT iOS/Android 可連線到執行 Codex App 的 Mac 主機，沿用該機器的專案、檔案、認證、plugin、skill 與設定（亦支援 SSH host）。同時 <b>Hooks GA</b>、<b>Codex access tokens</b>（信任自動化用）與企業 admin setup 文件上線。"},
    {v:"2026-05-08", date:"2026-05-08", cat:"UI/UX", title:"Hooks 信任審查流程", body:"新增 <b>in-app trust review</b> 流程給 hooks，未完成設定前 Hooks 設定頁仍可進入。修復 Windows 終端機 <code>Ctrl+V</code>、外部連結改在系統瀏覽器開啟、feedback slash command 綁定原 thread 等多項桌面 regression。"},
    {v:"2026-05-05", date:"2026-05-05", cat:"UI/UX", title:"語音聽寫字典與圖片 lightbox 強化", body:"新增 <b>dictation cleanup</b> 與可設定的聽寫字典（含人名、檔案路徑、程式符號）。圖片 lightbox 加入縮放與下載；in-app 瀏覽器留言錨點在捲動與縮放下保持對齊；PR 建立與重連流程更穩定。"},
    {v:"2026-04-24", date:"2026-04-24", cat:"UI/UX", title:"Realtime 委派提示與多項桌面修復", body:"在 realtime 委派訊息加上 tooltip 說明會以周圍語音對話為 context。修復長 review 檔案的搜尋跳轉、embedded MCP 面板於全螢幕切換時不再重啟、舊版 macOS 全域聽寫熱鍵與 tray crash 等問題。"},
    {v:"2026-04-20", date:"2026-04-20", cat:"UI/UX", title:"Composer 支援本地 branch 搜尋與可摺疊側欄", body:"新增 composer 內 <b>local branch search</b> 與非圖片檔案貼上、<b>可摺疊側欄區段</b>、tray 顯示 usage limit、命令面板主題切換。Review diff 批次與狀態保留更穩定。"},
    {v:"2026-04-16", date:"2026-04-16", cat:"UI/UX", title:"Codex 擴展為通用工作空間（重大更新）", body:"重大更新：新增 <b>in-app browser</b>（可對渲染頁面留言）、<b>Computer Use</b>（操作 macOS App）、無需先選資料夾的 <b>Chats</b>、<b>thread automations</b>、<b>task sidebar</b>、context-aware suggestions、GitHub PR 流程嵌入、<b>artifact viewer</b>（預覽 PDF/試算表/簡報）、<b>Memories</b>。另含 SSH remote connections alpha、多終端機、Windows 系統匣、多視窗、Intel Mac 支援。"},
    {v:"2026-04-12", date:"2026-04-12", cat:"UI/UX", title:"命令選單檔案搜尋與側欄豐富預覽", body:"新增 command-menu 檔案搜尋（<code>Cmd+P</code> 進入 workspace 檔案搜尋）、側欄 file viewer 支援圖片/PDF/Markdown 預覽、每個 thread 獨立 terminal tabs、選取文字 <b>Ask Codex</b> overlay、Help 選單回饋入口。"},
    {v:"2026-04-10", date:"2026-04-10", cat:"Cloud/Web", title:"Windows Store 更新器與 PR 流程擴充", body:"新增 <b>Windows Store updater</b>。PR 流程加上活動 timeline、PR 頁面留言、push modal 推送選項。Thread 側欄新增 workspace 檔案 tabs、tab 拖曳排序、run action 編輯與登出確認。"},
    {v:"2026-04-01", date:"2026-04-01", cat:"UI/UX", title:"原生 Windows 更新器與 workspace 設定", body:"新增 workspace 設定、MCP 核准面板的 <b>Don't ask again</b>、<b>原生 Windows updater</b>（含 MSIX）與 Windows 系統匣常駐選單、automation composer 內 <code>@</code> mention App/檔案、subagent diff 統計、artifact cards。"},
    {v:"2026-03-24", date:"2026-03-24", cat:"UI/UX", title:"Thread 搜尋與 VS Code 設定同步", body:"新增 <b>past thread 搜尋</b>（含側欄捷徑與跳到最近 thread 的快捷鍵）、一鍵封存專案所有本地 thread。Codex App 與 <b>VS Code extension 設定雙向同步</b>，extension 新增設定入口。"},
    {v:"2026-03-18", date:"2026-03-18", cat:"UI/UX", title:"從任意訊息分叉、Slash 切換模型", body:"<b>對話分叉</b>不再只能從最新一則訊息開始。新增切換模型與 reasoning level 的 slash command，且可在草稿句中插入。Plan mode 問題加上通知提示。"},
    {v:"2026-03-12", date:"2026-03-12", cat:"UI/UX", title:"主題自訂與 Automations 改版", body:"設定中可選擇 <b>base theme</b> 並調整 accent/background/foreground 色與 UI/code 字型，可分享自訂主題。<b>Automations 改版</b>：可選本地或 worktree 執行、自訂 reasoning level 與模型，並提供範本。"},
    {v:"2026-03-11", date:"2026-03-11", cat:"IDE/Editor", title:"Codex 可讀取整合終端機輸出", body:"Codex 能 <b>讀取目前 thread 的 integrated terminal</b>，可確認 dev server 狀態或回查失敗的 build 輸出。"},
    {v:"2026-03-04", date:"2026-03-04", cat:"IDE/Editor", title:"Codex App for Windows 正式推出", body:"<b>Codex App 正式登陸 Windows</b>，使用 PowerShell 與原生 Windows sandbox 提供受限權限，無需 WSL/VM 即可使用。完整支援 Skills、Automations、Worktrees；偏好 WSL 者可切換 agent 與終端機進 WSL。可由 Microsoft Store 下載並以 ChatGPT 帳號或 API key 登入。"},
    {v:"2026-02-27", date:"2026-02-27", cat:"UI/UX", title:"任務列 PR 狀態徽章與 worktree 上限設定", body:"任務列與 PR 按鈕新增 <b>PR 狀態徽章</b>（draft/open/merged/closed）。Worktrees 設定可指定保留幾個 Codex 管理的 worktree。長對話與 code review 捲動更穩定。"},
    {v:"2026-02-26", date:"2026-02-26", cat:"MCP/Tools", title:"Composer 內 MCP 捷徑與 @ 提及進 review", body:"Composer 新增 <b>MCP 捷徑</b>（含安裝關鍵字建議與 Add context 內的 MCP server 子選單）。Inline review 留言支援 <code>@mentions</code> 與 skill 提及。"},
    {v:"2026-05-11", date:"2026-05-11", cat:"Cloud/Web", title:"Auto-review 文件擴充", body:"新增專屬 <code>Auto-review</code> 頁面，涵蓋 reviewer lifecycle、觸發條件、failure behavior、本機 / managed 設定。同步更新 <b>Agent approvals & security</b> 與 <b>Sandbox</b> 文件，更清楚說明 Auto-review 與 sandbox boundary 的關係。"},
    {v:"2026-05-14", date:"2026-05-14", cat:"Cloud/Web", title:"Codex 從任何地方使用：手機 + Mac host", body:"<b>ChatGPT 手機 app 可連到執行 Codex 的 Mac</b>，共用相同專案、檔案、認證、plugins、skills、設定；同步推出 <b>Hooks GA</b>、Codex access tokens（可信自動化）、Enterprise admin setup 指引。"},
    {v:"2026-05-07", date:"2026-05-07", cat:"Cloud/Web", title:"Codex for Chrome 擴充功能", body:"新 Chrome 擴充：Codex 可在瀏覽器中平行處理多個分頁、背景執行而不接管視窗；使用者控管 Codex 可存取哪些網站。"},
    {v:"v260212", date:"2026-02-12", cat:"UI/UX", title:"Codex App v260212：Spark + 對話分支", body:"加入 <b>GPT-5.3-Codex-Spark</b> 支援、<b>對話 forking（分支）</b>、浮動 pop-out 視窗。多項效能與 bug 修復；同時 Windows alpha 開始測試。"},
    {v:"2026-02-12", date:"2026-02-12", cat:"Models/Inference", title:"GPT-5.3-Codex-Spark 預覽", body:"GPT-5.3-Codex 的精簡版本，串流速度超過 <b>1000 tokens/sec</b>。ChatGPT Pro 在 Codex App、CLI、IDE extension 都可用；128k context、文字-only。"},
    {v:"2026-02-09", date:"2026-02-09", cat:"IDE/Editor", title:"GPT-5.3-Codex 進駐 Cursor 與 VS Code", body:"GPT-5.3-Codex 在 Cursor 與 VS Code 原生可用；API 採分批釋出。在 Preparedness Framework 下視為高安全能力模型。"},
    {v:"v260205", date:"2026-02-05", cat:"UI/UX", title:"Codex App v260205：Mid-turn steering", body:"加入 GPT-5.3-Codex 支援、<b>mid-turn steering（執行中可送訊息調整方向）</b>、可附加 / 拖曳任意檔案類型。修復 App 閃爍。"},
    {v:"2026-02-05", date:"2026-02-05", cat:"Models/Inference", title:"GPT-5.3-Codex 發表", body:"目前最強 agentic coding 模型：推理更強、執行 <b>快 25%</b>、即時 steering 改善。Codex App / CLI / IDE / Cloud 都可用，API 即將支援。"},
    {v:"v260204", date:"2026-02-04", cat:"UI/UX", title:"Codex App v260204：開檔器擴充 + PDF 預覽", body:"新增 Zed 與 Textmate 作為開檔工具選項；review 面板加入 <b>PDF 預覽</b>；整體效能改善。"},
    {v:"2026-04-07", date:"2026-04-07", cat:"Models/Inference", title:"Codex 模型清單異動", body:"從 model picker 移除 <code>gpt-5.2-codex</code>、<code>gpt-5.1-codex</code>、<code>gpt-5.1</code>、<code>gpt-5</code>。保留 <code>gpt-5.4</code>、<code>gpt-5.4-mini</code>、<code>gpt-5.3-codex</code>、<code>gpt-5.2</code>，Pro 用戶另有 <code>gpt-5.3-codex-spark</code>。"}
  ];

  const DATA_CI = [
    {v:"0.149.1", date:"2026-08-24", cat:"Performance/Bug Fix", title:"CLI 0.149.1：維護更新（無使用者面向變更）", body:"純版本更新，官方未提供詳細變更說明。"},
    {v:"0.149.0", date:"2026-08-20", cat:"UI/UX", title:"CLI 0.149.0：codex agents 儀表板、/cd 系列指令與 codex queue 跨 Session 傳訊", body:"新增：<b>互動式 <code>codex agents</code> 儀表板</b>：可搜尋、啟動、開啟、重新命名與停止任務，並提供可自訂捷徑；<b><code>/cd</code>、<code>/pwd</code>、<code>/cwd</code> 指令</b>：於 TUI session 內管理工作目錄；<b><code>codex queue</code></b>：向既有本機或遠端 session 傳送訊息；<b>Vim 編輯擴充</b>：新增字元取代與更多變更動作（如 <code>cw</code>、<code>c$</code>、<code>cc</code>）；<b><code>codex doctor</code> 擴充診斷</b>：新增端點防護、網路／proxy 故障、桌面應用狀態與更新連線的檢測；<b>SDK 支援精確 CLI 設定覆寫</b>：並可選擇 <code>max</code> 或 <code>ultra</code> reasoning effort。修復：佇列訊息現可可靠喚醒閒置 session、更妥善解決重複 session 名稱，並保留貼上或延遲指令的語意；恢復或 fork 的 thread 現正確還原使用中的權限設定，不再靜默退回目前預設值；修正 sub-agent 活動重複顯示，並收緊 TUI 對 sub-agent 通知與核准的路由；Realtime WebRTC sideband 連線於傳輸意外中斷後可重新連線，不遺失待送輸出；Windows Terminal scrollback 現保留內嵌 TUI 歷史記錄；閒置 TUI thread 的重播緩衝區現有上限，避免過量保留串流輸出。文件：說明外部貢獻應透過 issue 與設計討論、而非直接送 PR；補充安全 devcontainer 的 DNS 外洩風險與信任限制說明。"},
    {v:"0.148.0", date:"2026-08-18", cat:"Models/Inference", title:"CLI 0.148.0：Bedrock Runtime 內建供應商、Hooks 呼叫 MCP 工具與 /export 匯出對話", body:"新增：<b>/export 匯出完整 TUI 對話為 Markdown</b>：可複製到剪貼簿或存成新檔；<b><code>codex exec fork</code> 分支 session</b>：並可於 TUI 恢復選單封存或還原 session，TUI 初始化期間可預先草擬 prompt，並顯示恢復與 fork 進度；<b><code>/status</code>、狀態列與終端機標題顯示預估 thread 額度或成本</b>（限合資格 workspace）；<b>Amazon Bedrock Runtime 內建供應商</b>：支援 AWS profile、region 與 GPT-5.6 路由；<b>Hooks 現可非同步執行指令並呼叫 MCP 工具</b>。修復：切換 model 或更新設定不再遺留過時指令、也不會在執行中途變更該輪內容；恢復的 session 現會還原其持久化工作目錄與核准政策，並更精確預覽 transcript；連線暫時中斷時 turn 會自動重連，MCP 伺服器於 OAuth 重新認證後可自行恢復而不需重啟 Codex；TUI 啟動時緩衝的終端機輸入不再意外觸發 prompt，認證缺失時會顯示引導畫面；composer 與 transcript 渲染現正確處理 CRLF 貼上、換行空白與長網址；沙箱限制對遭拒或無法讀取的路徑現於 Linux 與 Windows 上一律封閉失敗（fail closed）。文件：內建 skill-creator 指南更聚焦，驗證現會拒絕未完成的 TODO 佔位。"},
    {v:"0.147.0", date:"2026-08-07", cat:"Plugins/MCP", title:"CLI 0.147.0：Agent Plugins 可攜式安裝 + 持久化對話分區 + --approve-for-me", body:"<b>Agent Plugins 可攜式安裝與跨目錄搜尋</b>：支援安裝可攜式 Agent Plugins，並可跨本機、個人、workspace 與遠端 plugin 目錄搜尋；<b>持久化對話分區</b>：對話可依人工排序整理進持久分區，並可逐步瀏覽長 transcript；<b>新增 <code>--approve-for-me</code> CLI 旗標</b>：啟用自動審查核准；<b>匯入 Cursor 管理的 skill</b>：可匯入 Cursor skill，並同步已匯入的 Claude／Cursor 對話變更而不產生重複；<b>支援 MCP 2026-07-28 協定（opt-in）</b>：含分頁探索、多輪請求與非阻塞伺服器啟動；<b>Amazon Bedrock 支援快取網路搜尋與遠端對話壓縮</b>。修復：顯示指令與重播對話歷史時遮罩機密與完整 bearer token；修正焦點恢復、MCP 伺服器初始化或 Ghostty 處理鍵盤快捷鍵時終端機輸入遺失或卡住；修正日文字元、emoji、超連結與視窗邊界附近文字的渲染與游標定位；正確中斷 Windows 背景程序並一致處理 Windows 檔案路徑；不熟悉的本機專案需明確信任、憑證使用前強制受管認證限制；強化 plugin 隔離，政策更新失敗時拒絕網路存取。其他：MCP SDK 升至 3.0.0、Ratatui 升至 0.30.2、V8 升至 150.4.0；移除已棄用的 <code>codex exec --full-auto</code> 旗標（改用 <code>--sandbox workspace-write</code>）；停止發佈重複的 Linux bundle 壓縮檔。"},
    {v:"0.146.1", date:"2026-08-05", cat:"Permissions/Security", title:"CLI 0.146.1：cyber-capable 模型自動審查更保守預設值", body:"<b>調整自動審查（auto-review）預設值</b>：針對具備網路安全能力（cyber-capable）的模型套用更保守的自動審查預設設定；<b>終端機介面顯示更清楚的權限異動說明</b>，指令因權限受限時可清楚了解變更原因。純安全性 backport patch 版本（#37057）。"},
    {v:"0.146.0", date:"2026-07-29", cat:"Plugins/MCP", title:"CLI 0.146.0：命名 Session + Agent Plugins + 執行緒分叉 + 遠端 Code Mode", body:"<b>命名 Session 與釘選</b>：<code>/new</code> 或 <code>/clear</code> 可為 session 命名，支援釘選重要 thread 並在多個側邊對話間切換；<b>Agent Plugins manifest</b>：支援 Workspace plugin 發布，並新增 Amazon Bedrock 與 Claude Code 的 Plugin marketplace；<b>執行緒分叉含分頁歷史</b>：可從任意歷史點分叉 thread，包含不出現在列表的臨時分叉；<b>遠端 Code Mode</b>：app-server 可透過 WebSocket 連接遠端 Code Mode 主機；<b>Executor 技能探索</b>：可探索 executor 提供的技能並安全讀取其關聯資源（含明確選取的技能）；<b>獨立網路搜尋</b>：支援相容自訂 model provider 的 standalone web search。Bug 修復：全面修正 proxy 支援（認證、plugin 下載、MCP 授權、遠端執行、WebSocket、重導、LM Studio）；MCP 連線在認證或設定變更後自動重連（不重啟正常伺服器）；終端機響應性改善（非阻塞中斷、鍵盤處理、窄版面、超連結、mention 刷新）；Windows 導覽鍵修復、sandbox process tree 可靠終止、代理設定在安全審查期間保留；技能目錄在 context 預算緊張時保留更多可用技能並顯示截斷警告；macOS helper 執行檔在打包前簽署並公證；新增企業方案識別與管理員控制 in-app 更新。"},
    {v:"0.145.0", date:"2026-07-21", cat:"UI/UX", title:"CLI 0.145.0：分頁式對話歷史 + /import 遷移設定 + Bedrock 登入 + 音訊輸入", body:"<b>實驗性分頁式對話歷史</b>：支援高效 resume、搜尋、持久化名稱、子 agent 支援與記憶功能；<b><code>/import</code> 擴充遷移能力</b>：可從 Cursor 與 Claude Code 遷移 MCP servers、plugins、sessions、commands 與專案記憶體；<b>Amazon Bedrock 實驗性登入</b>：支援自訂 endpoint 與認證，預設模型改為 GPT-5.6 Sol；<b>音訊輸入支援</b>：新增音訊輸入處理與工具輸出，支援 Realtime V3 串流對話；<b>Multi-Agent V2 穩定化</b>：可設定子 agent 模型、推理等級、並發數，還原角色並改善導覽；<b>終端機內聯視覺化連結</b>（安全可點擊）；改善：增量 Markdown 渲染與快取提升終端機響應速度；修復：MCP 啟動超時、Windows 執行與 sandbox 可靠性；更新 ripgrep 至 15.2.0；並行技能／插件探索降低啟動開銷。"},
    {v:"0.144.6", date:"2026-07-18", cat:"Models/Inference", title:"CLI 0.144.6：GPT-5.6 Sol/Terra/Luna 模型 metadata 修正", body:"<b>更新 GPT-5.6 Sol、Terra、Luna 的內建指令</b>：修正三款模型的 context window 至正確的 <b>272,000 tokens</b>；同步更新對應的模型 metadata 與 prompt 內容。純模型資訊修正版本，無其他使用者面向變更。"},
    {v:"0.144.5", date:"2026-07-16", cat:"Permissions/Security", title:"CLI 0.144.5：危險指令偵測強化", body:"<b>危險指令偵測強化</b>：擴大 <code>rm</code> 強制形式的識別範圍，偵測更多潛在破壞性的指令變體；<b>拒絕訊息更透明</b>：指令被阻擋時提供更清晰的拒絕原因，讓使用者明確知道操作為何受阻。純安全強化 patch，無其他使用者面向變更。"},
    {v:"0.144.4", date:"2026-07-14", cat:"Performance/Bug Fix", title:"CLI 0.144.4：維護更新（無使用者面向變更）", body:"純維護性 patch 版本，自 0.144.3 起無任何使用者面向變更。"},
    {v:"0.144.3", date:"2026-07-13", cat:"Performance/Bug Fix", title:"CLI 0.144.3：版本號更新（無程式碼變更）", body:"純版本號更新，自 0.144.2 起無任何程式碼變更合併。"},
    {v:"0.144.2", date:"2026-07-13", cat:"Performance/Bug Fix", title:"CLI 0.144.2：Guardian 自動審查修復", body:"<b>還原 Guardian auto-review 回歸問題</b>：修復上一次更新引入的提示回歸問題，還原 Guardian 自動審查的政策、請求格式與工具行為，恢復其正常運作狀態。純單項修復版本。"},
    {v:"0.144.1", date:"2026-07-09", cat:"Performance/Bug Fix", title:"CLI 0.144.1：安裝程式可靠性 + Code Mode 後備修復", body:"<b>安裝程式可靠性修復</b>：修正 GitHub 回傳壓縮或重新排序的 release metadata 時獨立安裝失敗的問題；<b>macOS 套件安裝正確公開 code-mode host</b>：確保 macOS 套件安裝同時公開 code-mode host 執行檔與主要執行檔；<b>Code Mode 後備機制</b>：當 companion host binary 不可用時，code mode 自動回退至嵌入式執行環境，確保持續可用。"},
    {v:"0.144.0", date:"2026-07-09", cat:"Permissions/Security", title:"CLI 0.144.0：用量重置點數明細 + writes 核准模式 + MCP 互動認證", body:"<b>用量限制重置點數</b>顯示類型與到期日，並可選擇兌換哪種點數；新增 <b><code>writes</code> 核准模式</b>：允許聲明的唯讀操作，僅針對寫入動作提示確認；<b>MCP 工具可在無需實驗性 opt-in 的情況下互動式請求認證</b>；App-server 主機可在執行期提供 Codex 認證並在登入成功後重導至托管頁面；偵測全域 pnpm 安裝以確保診斷與更新使用正確的套件管理器；選擇 Ultra reasoning 時，若多 agent 高並發可能快速消耗用量，現顯示警告。修復：已壓縮的 ChatGPT threads 若參照已退役模型，恢復時改以當前選定模型重試；修復 Intel macOS 發行版二進位的 Code Mode 崩潰；Windows sandbox 可刪除可寫根目錄中的檔案並存取受管主要執行環境；貼上終端控制序列不再破壞 TUI 渲染或恢復的對話歷史；長時間執行的 app sessions 現可為托管的 <code>codex_apps</code> connector 重新整理過期認證；Responses WebSockets 在遵守系統代理與自訂 CA 的同時，繼續使用低延遲傳輸。文件：裝置碼登入警告加入識別並阻止網路釣魚攻擊的說明；降低遠端 executor 上插件技能載入時間；加快並提高大型 repo 的 <code>/review</code> 分支選擇器可靠性。"},
    {v:"0.143.0", date:"2026-07-08", cat:"Plugins/MCP", title:"CLI 0.143.0：遠端插件預設啟用 + 系統代理 + Bedrock GPT-5.6", body:"<b>遠端 plugins 預設啟用</b>（目錄列表列更豐富）；<b>macOS / Windows 系統代理支援</b>（涵蓋 PAC / WPAD）；新 <b><code>codex remote-control pair</code></b> 指令可產生配對碼；<b>Amazon Bedrock 加入 GPT-5.6 系列模型</b>（含 reasoning effort 支援）；MCP 工具預設採工具搜尋模式；修復 Windows ConPTY 輸入處理與 sandbox 憑證問題；安全性更新：OpenSSL、Hono、fast-uri、quick-xml、crossbeam-epoch。"},
    {v:"0.142.5", date:"2026-07-01", cat:"Permissions/Security", title:"CLI 0.142.5：安全修復（WebSocket trace log 防護）", body:"<b>安全修復</b>：防止完整的 Responses WebSocket 請求 payload 被寫入 trace log，避免敏感資訊外洩至日誌檔案。純 patch 修正版本。"},
    {v:"0.142.4", date:"2026-06-29", cat:"Performance/Bug Fix", title:"CLI 0.142.4：維護更新（無使用者面向變更）", body:"純維護性 patch 版本，自 0.142.3 起無任何使用者面向變更。"},
    {v:"0.142.3", date:"2026-06-26", cat:"Performance/Bug Fix", title:"CLI 0.142.3：維護更新（無使用者面向變更）", body:"純維護性 patch 版本，自 0.142.2 起無任何使用者面向變更。"},
    {v:"0.142.2", date:"2026-06-25", cat:"MCP/Tools", title:"CLI 0.142.2：MCP 工具搜尋預設開啟 + macOS 系統代理", body:"<b>MCP 工具預設採用工具搜尋模式</b>（支援時），強化工具發現能力；<b>macOS 系統代理支援</b>：認證客戶端可遵守系統 proxy、PAC 與 WPAD 設定；<b>Plugin 深色模式圖示</b>：可透過本地 manifest 提供專屬深色模式 logo；<b>安全緩衝 UI 強化</b>：可顯示伺服器提供的豐富 metadata。修復：遠端插件目錄精選推薦排名；Amazon Bedrock 過期憑證可行指引；遠端 stdio MCP 伺服器接受絕對工作目錄；遠端 HTTP(S) 圖片輸入驗證錯誤清晰化；PowerShell 指令安全分類改進；Code Mode 模型缺少必要 metadata 時顯示警告；更新 OpenSSL 至 3.6.3、esbuild 至 0.28.1。"},
    {v:"0.142.1", date:"2026-06-25", cat:"Local Sandbox", title:"CLI 0.142.1：Windows 系統代理認證支援", body:"<b>新增 opt-in Windows 系統代理支援</b>：認證流程可遵守 Windows 系統 proxy 設定，涵蓋 PAC、WPAD、靜態 proxy 與 bypass 規則，無需手動設定即可透過企業代理進行認證。"},
    {v:"0.142.0", date:"2026-06-22", cat:"Plugins/MCP", title:"CLI 0.142.0：用量點數兌換 + Plugins 分區整理", body:"<b><code>/usage</code> 新增用量重置點數顯示與兌換</b>（含確認與刷新）；<b><code>/plugins</code> 整理為 OpenAI 精選、Workspace 與 Shared 三個區段</b>並提供推薦；可設定 rollout token 預算跨 agent threads 追蹤用量並提醒剩餘額度；App-server 客戶端可在 thread / turn 層級設定 <b>Multi-agent 委派控制</b>；<b>索引網路搜尋模式</b>：允許即時搜尋，但直接存取頁面限制於伺服器核准 URL；Codex 可接收排程 UTC 時間提醒並直接查詢當前時間。修復：Linux TUI 暫停/恢復後渲染異常；exec-server 與 MCP sessions 在短暫斷線後可存活（signed-URL refresh）；遠端環境跨 OS 保留原生路徑、shell 與 sandbox 行為；parent agent 現正確接收子 agent 錯誤（而非空白成功）；以目標為首的 threads 正確持久化並可由 thread/list 與 thread/search 查詢。"},
    {v:"0.141.0", date:"2026-06-18", cat:"Permissions/Security", title:"CLI 0.141.0：端對端加密 Noise Relay + 跨平台遠端執行", body:"<b>遠端 executors 改用認證的端對端加密 Noise relay 通道</b>，跨平台遠端執行保留原生工作目錄、shell 與檔案系統權限；Executor plugins 可為每個 thread 啟動 stdio MCP servers（含 marketplace 與認證專屬目錄探索改善）；App-server 客戶端新增列出子 threads、關聯外部 agent 匯入結果、存取 rate-limit 重置點數等能力；Realtime 客戶端可附加語音、控制回應進入對話、省略啟動 context；TUI 輸入 prompt 支援閒置後自動解決（含互動倒數計時）。修復：hook 信任繞過持久性；plugin 能力路由一致性；Windows sandbox 憑證；relay 連線能力；SQLite WAL-reset 損毀；P-521 憑證簽章支援企業 proxy。"},
    {v:"0.140.0", date:"2026-06-15", cat:"UI/UX", title:"CLI 0.140.0：/usage 用量追蹤 + /import 設定匯入", body:"新增 <b><code>/usage</code> 每日、每週與累計 token 用量檢視</b>；<b><code>/import</code> 可從 Claude Code 匯入設定</b>；<code>codex delete</code>/<code>/delete</code> 永久刪除 session；<code>/goal</code> 保留超大文字、貼上內容與遠端 session 圖片附件；<code>@</code> 提及開啟統一選單（檔案、plugin、skill）；支援受管 Amazon Bedrock API-key 認證（本地加密儲存）；損毀 SQLite 資料庫自動備份並從可用資料重建；大型 repo 與長 session 效能提升（Git 檔案系統監控與 turn-diff 快取）；移除實驗性 <code>/realtime</code> 語音控制與相關音訊依賴。"},
    {v:"0.139.0", date:"2026-06-09", cat:"MCP/Tools", title:"CLI 0.139.0：Code mode 直呼 Web Search + MCP schema 強化", body:"<b>Code mode 現可直接呼叫 standalone web search</b>，以純文字回傳結果；MCP 工具 schema 改善對 <code>oneOf</code>/<code>allOf</code> 結構的保留相容性；<code>codex doctor</code> 新增 editor 與 pager 環境診斷資訊；plugin marketplace automation 支援 JSON 輸出。修復：圖片編輯、URL linkification、thread 設定保留等多項問題。"},
    {v:"0.138.0", date:"2026-06-08", cat:"Slash Commands", title:"CLI 0.138.0：/app 交棒 Codex Desktop + 本地圖片路徑", body:"新增 <b><code>/app</code> 指令可將目前 CLI thread 交棒到 Codex Desktop</b>（macOS 及原生 Windows），無縫延續對話；本地圖片附件現在向模型揭露檔案路徑以提升編輯品質；reasoning effort 選擇更彈性，加入後備鍵盤快捷鍵；帳戶 token 用量可查看，支援 v2 personal access token；plugin automation 強化 JSON 輸出。"},
    {v:"0.137.0", date:"2026-06-04", cat:"UI/UX", title:"CLI 0.137.0：F13-F24 功能鍵 + Multi-Agent v2 改進", body:"TUI 支援 <b>F13–F24 按鍵綁定</b>、可搜尋選單中貼上、精簡版僅顯示 reasoning 的狀態欄；企業流程顯示每月額度上限並支援雲端管理 config bundle（含 EDU workspace）；<b>Remote-control 客戶端可透過 app-server v2 RPC 發起配對、列出或撤銷授權</b>；<code>codex plugin list --json</code> 輸出機器可讀格式並快取遠端目錄建議；hosted web/image 工具整合進更多 code-mode 流程、standalone 網路搜尋可平行執行；<b>Multi-agent v2</b> 每個 thread 獨立保留執行時模型選擇，衍生 agent 的後續追問與 metadata 預設更整潔。修復：取消已送出 prompt 可還原草稿與附件、本地 session 歷史壓縮穩定性、macOS deep link 啟動改善、Windows SQLite 啟動與 thread resume、沙箱 setup refresh、plugin 載入順序保留等多項問題。"},
    {v:"0.136.0", date:"2026-06-01", cat:"UI/UX", title:"CLI 0.136.0：Session 封存 + Markdown 連結", body:"TUI Markdown 加入 <b>OSC 8 可點擊連結</b>、表格擠不下時自動切換為易讀的鍵值對形式；新 <code>/archive</code> 與 <code>codex archive</code>/<code>codex unarchive</code> 封存 session（保護不被 resume/fork）；app-server 新 <code>--stdio</code> mode；remote-control websocket 改用短期 server token；Windows alpha <code>codex sandbox setup --elevated</code>；Bedrock catalog 更新含 <b>GPT-5.5</b>。"},
    {v:"0.135.0", date:"2026-05-28", cat:"Slash Commands", title:"CLI 0.135.0：/permissions + Vim 強化", body:"<code>codex doctor</code> 報告更豐富的環境/Git/terminal/thread 診斷；<code>/status</code> 在 remote 模式下顯示連線細節；<b>Vim mode 加入 text-object 編輯</b>、可設定中斷 turn binding；<code>/permissions</code> 認得命名 permission profile；macOS/Linux packaged build 自帶 patched zsh helper；<code>CODEX_NON_INTERACTIVE=1</code> 支援非互動安裝。"},
    {v:"0.134.0", date:"2026-05-26", cat:"MCP/Tools", title:"CLI 0.134.0：對話搜尋 + MCP 並發", body:"新增<b>本地對話歷史搜尋</b>（不分大小寫、附 preview）；<code>--profile</code> 升為主 profile 選擇器，legacy profile 強制遷移；MCP 設定支援 per-server 環境、streamable HTTP server OAuth；connector tool schema 保留 <code>$ref</code>/<code>$defs</code>；<b>read-only MCP 工具可並發執行</b>（advertise <code>readOnlyHint</code> 即可）；hook 收到 conversation history 與 subagent identity。"},
    {v:"0.133.0", date:"2026-05-21", cat:"Plugins/MCP", title:"CLI 0.133.0：Goals 預設開 + Plugin marketplace", body:"<b>Goals 功能預設開啟</b>，跨 turn 追蹤進度；<code>codex remote-control</code> 改為 foreground 指令並等待 ready；permission profile 支援列出、繼承、<code>requirements.toml</code> 管理、runtime refresh；plugin 列表 marketplace-aware、顯示已裝版本、支援 remote collection；extension 可觀察 subagent start/stop、tool execution、approval/turn 處理。"},
    {v:"0.132.0", date:"2026-05-20", cat:"MCP/Tools", title:"CLI 0.132.0：Python SDK 強化 + 圖片解析度", body:"Python SDK 加入 first-class 認證（API key login、ChatGPT browser/device-code flow、帳戶查詢、logout）；Python turn API 接受純字串、回傳更豐富的 <code>TurnResult</code>；<code>codex exec resume</code> 支援 <code>--output-schema</code> 維持 session context；TUI 啟動更快（批次 probe 終端能力）；<b>app-server turn 保留圖片原始解析度</b>。"},
    {v:"0.131.0", date:"2026-05-18", cat:"UI/UX", title:"CLI 0.131.0：TUI 大更新 + codex doctor", body:"TUI 加入 service-tier 指令、混合 token 用量、permissions/approval mode、有效 workspace roots、響應式 Markdown 表格；<code>@</code> mention 一鍵搜尋檔案/目錄/plugin/skill；plugin marketplace CLI 指令、版本化分享、shared-workspace bucket；<b>新 <code>codex doctor</code> 全面診斷</b>（runtime/auth/terminal/network/config/state）；Python SDK 遷移到 <code>openai-codex</code>；Windows sandbox 多項加固。"},
    {v:"0.130.0", date:"2026-05-08", cat:"Plugins/MCP", title:"CLI 0.130.0：plugin 分享 + remote-control", body:"plugin 詳情顯示 bundled hooks，分享暴露連結 metadata 與可發現性設定；新 <b><code>codex remote-control</code></b> 一鍵啟動 headless 可遠端控制的 app-server；app-server client 可分頁載入大型 threads（unloaded/summary/full）；Bedrock 認證支援 <code>aws login</code> profile；<code>view_image</code> 可透過所選 environment 解析檔案。"},
    {v:"0.129.0", date:"2026-05-07", cat:"UI/UX", title:"CLI 0.129.0：Vim composer + /hooks 瀏覽", body:"<b>TUI composer 支援 modal Vim 編輯</b>（<code>/vim</code>、預設模式設定、Vim-only keymap）；resume/fork picker 重新設計、raw scrollback、<code>/ide</code> context 注入、workspace-aware <code>/diff</code>；status line 支援主題色與 PR/branch 摘要；plugin 支援 workspace 分享與權限；新 <code>/hooks</code> 瀏覽與切換 lifecycle hooks，hooks 可在 compaction 前後執行；Linux 沙箱多項可靠性修復。"},
    {v:"0.120.0", date:"2026-04-11", cat:"MCP/Tools", title:"CLI 0.120.0：Realtime V2 串流 + hooks", body:"Realtime V2 在背景 agent 執行中即時串流進度，支援 queue 後續 response。TUI hook 活動更易掃讀；MCP outputSchema 型別改善；<code>SessionStart</code> hooks 可區分 <code>/clear</code> 與全新啟動。修復 Windows elevated sandbox 與 remote websocket TLS。"},
    {v:"0.119.0", date:"2026-04-10", cat:"MCP/Tools", title:"CLI 0.119.0：Voice、MCP Apps、exec-server", body:"<b>Realtime 語音 session 預設 v2 WebRTC</b>。MCP Apps 支援更豐富（resource 讀取、tool-call metadata、custom-server 工具搜尋、檔案上傳）。新 <code>Ctrl+O</code> 在 TUI 複製、<code>/resume</code> by ID、可設定通知、實驗性 <code>codex exec-server</code>。多項 TUI / resume / sandbox / MCP 修復。"},
    {v:"0.118.0", date:"2026-03-31", cat:"Local Sandbox", title:"CLI 0.118.0：Windows proxy sandbox + 裝置登入", body:"Windows sandbox 在 OS 層強制 <b>proxy-only egress</b>；app-server client 可用 device code flow 登入；<code>codex exec</code> 支援 prompt+stdin；自訂 provider 可 refresh 短期 bearer token；專案內 <code>.codex</code> 第一次建立時受保護。"},
    {v:"0.101.0", date:"2026-02-12", cat:"Performance/Bug Fix", title:"CLI 0.101.0：模型解析與 memory 修復", body:"用 prefix 選模型時保留 requested slug；developer 訊息排除於 phase-1 memory input；memory phase concurrency 降低以提升穩定性。多項 code path 清理與 CI 衛生更新。"},
    {v:"0.100.0", date:"2026-02-12", cat:"MCP/Tools", title:"CLI 0.100.0：JS REPL + memory 指令", body:"加入實驗性 <code>js_repl</code> 持久 runtime、多 rate-limit 支援、<b>websocket transport（split inbound/outbound）</b>、<code>/m_update</code>+<code>/m_drop</code> memory slash 指令、Apps SDK 支援、<code>ReadOnlyAccess</code> sandbox policy。修復 websocket dedup、Windows multi-line paste、stale rate-limit。"},
    {v:"0.99.0", date:"2026-02-11", cat:"UI/UX", title:"CLI 0.99.0：Statusline + 並行 shell", body:"<b>直接 shell 指令可與 active turn 並行</b>。新 <code>/statusline</code> TUI footer 設定、可排序 resume picker、app-server APIs（turn steering、experimental features、resume_agent）；企業 web-search 與 network 限制透過 <code>requirements.toml</code>；GIF/WebP 圖片支援；shell 環境快照。"},
    {v:"0.98.0", date:"2026-02-05", cat:"Models/Inference", title:"CLI 0.98.0：GPT-5.3-Codex + steer 穩定", body:"加入 GPT-5.3-Codex 支援。<b>Steer mode 改為 stable 並預設開啟</b>：Enter 立即送出、Tab 排隊。修復 resumeThread image 參數順序、切換模型時的 model-instruction、remote compaction estimator、cloud requirements 重載。"},
    {v:"0.97.0", date:"2026-02-05", cat:"Slash Commands", title:"CLI 0.97.0：Approve-remember + /debug-config", body:"加入 session-scoped Allow + remember（MCP / App tool 批准）、live skill 更新偵測、<b>混合 text+image 動態 tool 輸出</b>、<code>/debug-config</code>、初始 memory plumbing、可設定 <code>log_dir</code>。穩定 apps/connectors picker 與 TUI 工作指示。"},
    {v:"0.96.0", date:"2026-02-04", cat:"MCP/Tools", title:"CLI 0.96.0：thread/compact 與 websocket signal", body:"加入 <code>thread/compact</code> async RPC（v2 app-server API）、websocket 端 rate limit signal（<code>codex.rate_limits</code> 事件）、<code>unified_exec</code> 支援所有非 Windows 平台、constrained requirements 來源 provenance。修復 <code>request_user_input</code> notes mode 的 Esc 處理與 thread state DB 問題。"}
  ];

  /* CLAUDE-DESKTOP-DATA:START — 由 scripts/build-claude-desktop.mjs 從 data/claude-desktop.json 產生，勿手改 */
  const DATA_CD = [
    {v:"1.34493.1", date:"2026-08-21", cat:"Performance/Bug Fix", sev:"low", title:"Inference Gateway Session 的 Prompt Caching 修復", body:"General、Code、Cowork 皆無使用者面向變更。3P：修復透過 inference gateway 或自訂 endpoint 的 session 未套用 prompt caching。"},
    {v:"1.34493.0", date:"2026-08-20", cat:"Settings/Config", sev:"medium", title:"macOS 啟動當機、排程任務日期錯誤與 SSH worktree 遺失修復", body:"General：修復 macOS 上將應用程式放在 iCloud Drive 並開啟 Optimize Mac Storage 時啟動卡死；修復排程任務問題：「每 N 天／月」排程跑錯日期（既有任務會於下次執行時自動改到正確日期）、重新啟用任務或改排程會立即為已過去的時段補跑一次、手動執行的任務有時未記錄最後執行時間；修復 macOS 以 Touch ID 登入時當機（Touch ID passkey 登入暫時停用）；修復 macOS 磁碟空間不足或停止口述時 App 直接關閉。Code：修復封存含未提交或未合併變更的 SSH session 會捨棄其遠端 worktree 的工作內容，現改為保留 worktree，取消封存時若已遺失會自動重建以接續進行；修復資料夾名稱含重音、韓文或日文字元時，macOS 上的 session 歷史記錄不再更新或顯示遺失；修復 30 天以上未開啟、App 仍正常使用中的 session 遺失對話歷史；修復 SSH 連線在不穩定或慢速網路下第一次嘗試必失敗、需手動重試；修復 SSH session 在 App 更新後重新連線時遺失仍在執行中的任務；修復側邊聊天在長 session 中首次回答後即因認證錯誤而全部失敗。Cowork：修復訊息內含極長的中括號文字、極長且未閉合的 <code>[<\/code> 起始行，或極長的連續 <code>&gt;<\/code> 字元時對話無法開啟；修復組織關閉產品意見回饋時仍偶爾出現訊息評分與「Send feedback」連結；修復受管 Mac 上 App 暫存目錄不可寫入導致 session 無法啟動。3P：變更 gateway device-code 登入在 gateway 同時發出 refresh token 時改為靜默更新，不再每次 access token 到期就要求重新登入；修復 App 閒置時未察覺已結束的 gateway device-code 登入，現會於下次定期設定檢查或電腦喚醒後不久察覺並要求重新登入，Setup 視窗現顯示「Session expired」而非「Denied」；修復關閉數分鐘的 Cowork 檔案預覽面板重新開啟後持續顯示「Preview unavailable」，需重啟 App 才會恢復。"},
    {v:"1.32885.1", date:"2026-08-18", cat:"Settings/Config", sev:"medium", title:"訊息佇列、電腦使用權限延遲防護與 3P bootstrapHeaders 認證", body:"General：新增 Research 執行中傳送的訊息會排隊，待報告完成後才送出；修復 Claude in Chrome 於多個瀏覽器設定檔登入時 1Password 憑證請求失敗；修復 Windows 於背景更新檢查仍在執行時安裝更新導致當機，以及較新更新取代已預先安裝版本後，更新安裝反覆失敗；修復停止回覆後立即傳送的訊息有時被放回輸入框而非送出；修復重新載入或重開暫時聊天會在載入後稍微延遲重建頁面，可能遺失提早輸入的文字；修復 Cowork 與 Claude Code session 的 computer-use 權限提示會誤接受瞄準訊息框或其他畫面元素的鍵盤快捷鍵，現增加短暫延遲，避免提示剛出現時的送出按鍵誤觸核准。Code：修復用量上限觸發自動接續時卡進已匯入 session 確認提示或過期登入狀態，現會等待伺服器額度重置並顯示更清楚的接續訊息；修復前一指令仍在等待回應（如互動式登入）時，行內 bash 指令被靜默截取為該指令的輸入，現會在 transcript 註記卡住的指令並於下一指令執行前清除；修復 session 之間互傳的訊息有時被靜默捨棄，導致寄件 session 顯示「thinking」長達數分鐘；修復 <code>~/.claude.json<\/code> 設有 MCP 伺服器時 session 啟動緩慢；修復 Code 分頁在只有 Apple Command Line Tools、沒有 Xcode 的 Mac 上仍誤要求安裝 Git；修復 <code>WorktreeCreate<\/code> hook 於印出路徑前先輸出狀態訊息時，worktree session 因「path contains control characters」錯誤而失敗。Cowork：修復 Claude 提出的問題卡片切換為新一組問題時偶發「Something went wrong」錯誤；修復 Claude 有時回報檔案已儲存，實際卻寫入使用者無法開啟的暫存位置；修復 Cowork 在 Intel Mac 上無法啟動。3P：新增 <code>bootstrapHeaders<\/code>／<code>bootstrapHeadersHelper<\/code>，可用服務帳號憑證認證 bootstrap 設定擷取，取代自 1.32352.0 起遭拒的、內嵌於 <code>bootstrapUrl<\/code> 的 <code>user:password@<\/code> 寫法；新增從匯入精靈直接登入 claude.ai 擷取資料匯出檔，免手動下載 zip；變更新版 Cowork session 改以短固定資料夾名稱儲存 Claude Code transcript（需搭配內建 Claude Code 2.1.234 以上），進一步縮短 Windows 路徑長度；變更組織 plugin 端點自設定移除時，成員裝置上該端點安裝的 plugin 會一併移除，與移除 marketplace 時的行為一致；修復管理員設定的 plugin marketplace 與組織 plugin，在登入後或延遲設定擷取套用後，未能在下次定期刷新前重新同步。"},
    {v:"1.32352.1", date:"2026-08-18", cat:"Performance/Bug Fix", sev:"low", title:"Windows 首次啟動失敗修復", body:"General：修復 Windows 全新安裝後首次啟動時，第一個視窗偶發初始化失敗的罕見問題。Code、Cowork、3P 皆無使用者面向變更。"},
    {v:"1.32352.0", date:"2026-08-17", cat:"Plugins/MCP", sev:"high", title:"Plugin URL Marketplace、對話／任務匯出與多項連線修復", body:"General：修復 Windows 更新偶爾安裝到一半、後續更新接連失敗；修復網路 proxy 擋下首次連線時卡在「Couldn't connect to Claude」，現改為持續重試數分鐘，回到視窗時再試一次；修復組織關閉或未設定額外用量時，用量上限提示後 composer 持續停用；修復聊天內設定與 connector 連結點擊無反應或另開瀏覽器，現改為開啟 App 自身設定；修復開啟無痕模式時 new chat 頁面已輸入文字消失；修復 Claude 建立或連結檔名含百分號的檔案時，聊天顯示錯誤畫面而非對話。Code：用量上限自動接續改為預設開啟，session 於上限重置後自動恢復，可在用量提示橫幅取消勾選「Auto-continue when limits reset」關閉；修復 resume 後 session 偶爾卡住，第一則訊息後顯示「session 已停止回應」，或檔案系統／MCP 伺服器卡住時完全無法啟動；修復訊息輸入框 Undo（Cmd+Z，Windows／Linux 為 Ctrl+Z）偶爾出錯後失效；修復剛建立的雲端 session 傳送第一則訊息數秒內切換畫面會遺失該訊息；修復 App 剛開啟後立即建立的 session 有時以比已存權限模式更寬鬆的模式執行；修復 Remote Control session 完成登入或裝置驗證後仍卡在「connecting」，從其他電腦檢視 session 時檔案連結無法開啟。Cowork：移除 Claude in Chrome 權限卡片的「Allow all browser actions」選項，改為逐網站授權，Settings 內開關不變；修復磁碟空間不足時 workspace 啟動錯誤建議重開機或重灌，現改為提示釋放空間後重試；修復本機 MCP 伺服器於呼叫中當機導致工具呼叫卡住整整一分鐘，現改為立即失敗；修復 macOS 拍攝螢幕截圖後或畫面錄製中，computer use 每次點擊都被拒絕；修復核准模式在組織政策已封鎖「Skip all approvals」時仍顯示為該選項，切回「Manually approve」現會在 Claude 於核准關閉期間造訪過的網頁前再次詢問；修復檔案於聊天旁開啟時活動面板按鈕無反應，現會關閉檔案並顯示面板。3P：新增 <code>claudeAiImport.exportEnabled<\/code>，與 <code>claudeAiImport.enabled<\/code> 同時為 true 時，使用者可從 Settings > Import & export 將本機對話、Cowork 任務與 Code session 匯出成 zip 供其他安裝匯入，預設關閉；<code>allowedPluginMarketplaces<\/code>（beta）新增 <code>url<\/code> 來源，可透過 HTTPS 以 zip 封存檔提供 hosted <code>marketplace.json<\/code>、免安裝 git，並可用 <code>manifestSha256<\/code> 釘選 manifest（自動安裝的 plugin 必填）；同功能新增 <code>inferenceCredential<\/code> 作為 <code>credentialKind<\/code>，讓掛在推論 gateway 的 <code>url<\/code> marketplace 直接沿用 App 既有推論憑證；<code>coworkEgressAllowedHosts<\/code> 的 <code>:port<\/code> 限定現亦適用於 Cowork session 的 shell 指令與套件安裝；管理員設定的 plugin marketplace（含自動安裝與必要 plugin）現亦套用至 Code session、不僅限 Cowork；來自本機設定（非裝置管理）bootstrap URL 需使用者核准的項目現全有或全無生效，使用者選 Allow 前一律不生效，Quit 則關閉 App 並於下次啟動再問一次；受管設定中連線值不合法時，現改為指名該欄位並保留組織其餘設定生效，非 Anthropic 的 model 項目改為跳過並警告而非讓整份設定失效；新 Cowork session 磁碟資料夾名稱大幅縮短，避免超出 Windows 路徑長度限制，既有 session 沿用原資料夾，比對 <code>local_<\/code> 前綴的工具亦相容新命名；修復未設定 <code>claudeAiImport.enabled<\/code>、僅由裝置管理提供登入匯入的部署，Settings > Import & export 誤報匯入未啟用，該鍵現僅控管檔案／舊 session 匯入、匯入提示與 session 匯出；修復 Setup 視窗允許誤植的推論區域、Azure AI Foundry 資源名稱、空白 Vertex AI 專案 ID 或非 Anthropic model ID 到裝置端才被拒絕，現於儲存前即檢查；修復匯入的專案指示以獨立檔案呈現而非可編輯的專案 Instructions，現於專案頁顯示待審閱、接受後才套用。"},
    {v:"1.30096.5", date:"2026-08-14", cat:"Performance/Bug Fix", sev:"low", title:"維護性更新（無使用者面向變更）", body:"General、Code、Cowork、3P 皆無使用者面向變更，僅內部維護性更新。"},
    {v:"1.30096.1", date:"2026-08-13", cat:"Settings/Config", sev:"high", title:"Cowork Rewind 支援雲端 Session、OTel 免靜態 Header 認證與多項穩定性修復", body:"Code 新增 Rewind 支援雲端與 Remote Control session（訊息選單、Esc Esc 或 <code>/rewind<\/code>）；3P 新增 <code>otlpAuthMode<\/code>／<code>otlpHeadersHelper<\/code> 免用靜態 <code>otlpHeaders<\/code> 即可認證遙測匯出，新增 <code>inferenceGatewayOidc.resource<\/code> 供會限制 audience 的身分識別提供者使用；使用者自行輸入 bootstrap 網址時，變更 <code>inferenceBedrockBaseUrl<\/code>／<code>inferenceVertexBaseUrl<\/code> 現需一次性同意（受管部署或 <code>trustBootstrapDelivery: true<\/code> 不受影響）；<code>claudeAiImport<\/code> 匯入的 session 首次接續前需使用者確認「Trust and resume」。General：修復啟動後首次按 Cmd+F 無反應、composer 內右到左文字與左到右內嵌詞混排錯亂、Windows 無法跑本機 Cowork 時側欄缺少 Artifacts 入口、macOS 一啟動就要求通知權限、部分 Linux（尤其重新打包安裝）啟動或系統主題切換時當機。Code：修復中斷的 Claude Code 下載讓該機器 Code session 無法啟動（多見於 Windows）、雲端 session 環境斷線後未回應的權限或 plan 核准提示被誤判為已核准、需要輸入的雲端 session 有時開啟卻不顯示問題或核准提示、Remote Control session 閒置時開啟有時永遠連不上、停止或中斷後在其他裝置持續顯示離線、transcript 貼到富文字 App 遺失行內程式碼／粗體／斜體前後空格與程式碼區塊錯亂、Plan 檢視選取文字後 Cmd+C 複製不到內容。Cowork：修復失敗的任務恢復按「Go back」或 App 重啟後立刻編輯訊息會捨棄先前對話、Claude Code <code>managed-settings.json<\/code> 設定 <code>allowManagedPermissionRulesOnly<\/code> 時記憶體儲存失敗、Windows 背景服務停止後 Cowork 每次啟動都顯示「VM service not running」（現自動重啟服務，否則提示重開機可修復）、sub-agent 步驟完成時把已往上捲動的畫面拉回底部。3P：修復單一格式錯誤的 <code>allowedPluginMarketplaces<\/code>（beta）項目會停用所有已設定的 marketplace（現改為跳過並回報）、bootstrap 伺服器關閉 <code>coworkTabEnabled<\/code> 時傳送訊息會失敗（現改為首頁直接開啟 Chat）、閘道同時作為遙測收集端點時 OpenTelemetry 匯出被拒絕。"},
    {v:"1.28929.0", date:"2026-08-11", cat:"Settings/Config", sev:"high", title:"歷史記錄匯入、Gateway 位址同意提示與 1M Context 預設偏好", body:"新增歷史記錄匯入（claudeAiImport.enabled）：可將 Claude.ai 資料匯出、同機其他 Claude 安裝的 Cowork／Code／Chat session，或終端機 Claude Code CLI session 匯入 App（Settings > Import），claudeAiImport.bannerBehavior 控制新任務的匯入橫幅（off／detect／show）；新增 modelPrefer1mContext，未選過模型的使用者若部署將該模型標示為 1M-capable（含自動探索的模型）即預設使用 1M context 變體，已儲存的選擇不受影響；新增一次性 bootstrap 同意提示涵蓋 gateway 位址 inferenceGatewayBaseUrl，未透過裝置管理設定 bootstrap URL 時，使用者需在啟動時同意該位址（變更時再次詢問），未同意前不會連線至 gateway，可用 trustBootstrapDelivery 預先為全員同意；管理員停用 Code 時 Code tab 改為完全隱藏而非顯示為灰色。General：新增標準 macOS 全螢幕快捷鍵（View 選單提供 Enter/Exit Full Screen）；修復部分 Linux 系統（尤其重新打包或容器化安裝）啟動錯誤導致缺少系統匣圖示且每次系統主題變更都重現；修復 macOS 內建終端機指令因權限不足以錯誤 -1743 失敗、未顯示 Automation 權限提示；修復 macOS 登入反覆出現「Failed to login, it may have been cancelled」（現改為在系統登入頁不可用時開啟預設瀏覽器登入）；修復部分 Windows 安裝（MSIX 套件與企業管理的漫遊設定檔）無法儲存對話歷史、設定與排程任務，且 App 更新後 Cowork 以「Download failed」無法啟動；修復長時間執行 session 時記憶體用量無限成長。Code：移除排程任務與其他無人值守 session 在 Browser preview 啟動 dev server 的權限，其他 session 現改為對每個不同 dev server 指令只核准一次而非每次啟動都詢問；修復外部編輯器以 UTF-8 BOM 重新儲存後，App 設定與 session worktree 紀錄被捨棄；修復分叉的 session 從原始 base branch 而非父 session 目前分支啟動；修復匯入 Claude Code CLI session 會改變 <code>claude --resume<\/code> 既有 session 順序；修復 session 被移入 worktree 後無法復原、對話歷史誤報遺失；修復從 Code session 透過 Claude in Chrome 上傳檔案以「Invalid arguments for tool file_upload」失敗。Cowork：修復 Claude 仍在撰寫回覆時傳送的後續訊息偶爾被丟棄、回覆被截斷。3P：修復系統 keychain 暫時鎖定時已儲存的登入遺失；修復 Chat tab 忽略 toolSearchEnabled，導致每次請求都送出所有 connector 的工具定義並可能塞爆 context window（現改為 true 時按需載入，與 Cowork／Code 一致）；修復憑證來自 helper script（inferenceCredentialHelper）時，憑證過期通知與 Cowork／Code 的 session 錯誤橫幅未提供重新登入方式（現顯示「Sign in again」重新執行 helper）；修復選過 1M context 變體後，新 session、重啟或切換 Chat／Cowork 時 model picker 誤退回標準 context 變體。"},
    {v:"1.26832.0", date:"2026-08-06", cat:"Settings/Config", sev:"high", title:"Chat／Cowork 統一首頁、Code Session 視窗還原與唯讀工作資料夾模式", body:"Chat 與 Cowork 合併為統一首頁（Home 並列顯示對話與任務，「New」可一鍵開始聊天或任務）；Code session 視窗還原：關閉 App 時開啟的 Code session 視窗於下次啟動時自動重開。企業／3P 設定：allowedWorkspaceFolders 新增 mode: \"ro\" 唯讀存取（Cowork 寫入會被導向 session outputs 資料夾，Code tab 目前僅涵蓋檔案工具，Bash／SSH 尚未強制）；coworkEgressAllowedHosts 支援 <code>:port<\/code> 限定連接埠；新增 updateViaUpdatesHost，可改用僅提供更新 feed、不含模型 API 的 releases.claude.com（適合封鎖 api.anthropic.com 的網路，安裝檔仍來自 downloads.claude.ai）；trustBootstrapLocalExec 更名為 trustBootstrapDelivery（涵蓋登入來源與 helper／connector 信任，舊名稱仍相容）；一次性 bootstrap 同意提示新增 Azure AI Foundry、Bedrock IAM Identity Center、Vertex OAuth 與 gateway OIDC 登入目標設定，可用 trustBootstrapDelivery 預先為全員同意。修復：自訂 gateway 端點閒置逾時誤判（忽略仍在送達的 keep-alive）；管理員關閉非必要遙測後 gateway／API key 部署仍傳送流量至 api.anthropic.com；裝置上過期的 Claude Code managed-settings.json 覆蓋部署提供的模型選項；bootstrap-config-v2.schema.json 文件描述扁平鍵名，與 App 實際匯出的巢狀格式不符；Project 內開新對話未套用 Project 的 Instructions 與 Context 連結。"},
    {v:"1.25927.0", date:"2026-08-04", cat:"Plugins/MCP", sev:"high", title:"內建 GitHub Connector、Chat Projects 與巢狀 Bootstrap Schema 破壞性變更", body:"新增 managedMcpServers 內建 GitHub connector，可指向 GitHub Enterprise Server、選擇載入的 toolset 並提供唯讀模式；3P 新增 Chat Projects 整理對話（Cowork tab 關閉時仍可用）、skillCreationEnabled 控管使用者自建與上傳 skill、trustBootstrapLocalExec 讓管理員預先同意會執行本機指令的 bootstrap 設定，並支援把 Windows 對應網路磁碟機掛載進 Cowork sandbox。破壞性變更：巢狀 v2 bootstrap 回應中 deploymentDisplayName／deploymentDisplaySubtitle 移到 appearance 下，endUserAttribution／userContentRendererUrl 移到 workspace 下（扁平 MDM 鍵名不受影響）。Code 新增電腦休眠中斷 session 後自動恢復、瀏覽器分頁截圖標註；Cowork 修復排程任務 cron 用 7 代表週日永不觸發、卡住的 run 需重啟 App 才會停止等問題；General 新增口述／語音模式切換鈕，並修復多語系下 macOS Touch ID 崩潰與更新中斷進行中任務。"},
    {v:"1.24012.11", date:"2026-08-03", cat:"Plugins/MCP", sev:"low", title:"MCP 連線時序與 Microsoft 365 連接器修復", body:"修正伺服器仍在連線中時啟動的 session 缺少 connector 工具，需另開新對話才會取得；修正 Microsoft 365 連接器首次登入後要重啟 App 才會出現。General、Code、Cowork 皆無使用者面向變更。"},
    {v:"1.24012.9", date:"2026-07-24", cat:"Hooks", sev:"high", title:"Windows Plugin Hooks 修復、MCP 永久允許控管與 Opus 5 effort", body:"修正 Windows 上 plugin hooks 靜默不執行；新增 mcpPersistentAlwaysAllowEnabled，管理員可停用 MCP 工具的永久 Always allow、保留單次工作階段核准；model picker 為 Claude Opus 5 加入五段式 effort 選擇（Opus 5 一律開啟 extended thinking）。"},
    {v:"1.24012.0", date:"2026-07-21", cat:"Permissions/Security", sev:"critical", title:"worktree 誤動主 repo 修復、iOS Simulator 支援與大量企業設定鍵", body:"修復 Code session 動到錯誤檔案：背景 worktree 清理只刪一半時會切換或重設主 repo checkout，新 session 也可能複製原資料夾的未提交檔案。新增 iOS Simulator 支援（可建置、啟動模擬器並驗證結果）、Pause Project、composer 截圖標註；Cowork 加 /usage 與 /cost 卡片。企業端新增 deploymentDisplayName、enduserAttribution、userContentRendererUrl 與 managed MCP 的 oauth.authorizationUrl/tokenUrl，並修正 managed MCP tool policy 例外反被拒絕的問題。"},
    {v:"1.22209.3", date:"2026-07-19", cat:"Performance/Bug Fix", sev:"medium", title:"企業 TLS 檢查代理下每輪 Socket is closed 修復", body:"修復 Windows 在會檢查加密連線的公司代理環境下，session 每一輪都以「Socket is closed」失敗；內建 Claude Code CLI 升到 2.1.215，中斷的回應改用新連線重試。"},
    {v:"1.22209.0", date:"2026-07-16", cat:"Settings/Config", sev:"high", title:"Browser pane 限縮 localhost、OTel traces 與 workspace 政策延伸至 SSH", body:"新增 disableBrowserExternalNavigation，管理員可在 managed-settings.json 把 Code tab 的 Browser pane 限制在 localhost；新增 otlpTracesEnabled（beta）匯出 Cowork/Code 的 OpenTelemetry traces；allowed workspace folders 政策延伸適用於 SSH 主機上的 Code session。修正 managed Auto mode opt-out 未生效、未設 toolPolicy 的工具只給「Allow once / Deny」兩個選項。"},
    {v:"1.21459.3", date:"2026-07-16", cat:"Performance/Bug Fix", sev:"low", title:"擴充功能載入卡死修復", body:"修復已安裝擴充功能載入失敗、卡在無限載入狀態；修正對話結束後狀態指示器仍持續顯示。"},
    {v:"1.21459.0", date:"2026-07-14", cat:"Plugins/MCP", sev:"high", title:"MCP toolSearchEnabled 按需載入、envHelper 與 1M context 預設選項", body:"新增 toolSearchEnabled：Code 與 Cowork session 改為按需載入 MCP tool schema，避免大量工具塞爆 context window；managedMcpServers 新增 envHelper / envHelperTtlSec 由管理員提供的執行檔載入環境變數；inferenceModels 新增 prefer1m 讓 1M context 變體成為預設選項；新增 disableFeatureDiscovery 隱藏功能推播。另加 preview pane 網址列、artifact 釘選、SSH 重連改善，並修正 headersHelper 短效憑證到期後連線失效。"},
    {v:"1.20186.9", date:"2026-07-14", cat:"Permissions/Security", sev:"medium", title:"權限提示與提問靜默消失修復", body:"修復輸入處理錯誤後，權限提示與 session 內提問可能靜默不再出現的問題 — 若 Claude 提問或請求權限但提示從未顯示，本版修正；同時更新內建 Claude Code CLI。"},
    {v:"1.20186.0", date:"2026-07-09", cat:"Permissions/Security", sev:"high", title:"可偽造訊息卡修復、managed MCP toolPolicy 萬用字元與 CLI session 匯入", body:"修復輸入的 channel-message 回合被渲染成可偽造的「Message from {server}」卡片，改以使用者自身文字呈現；managed MCP toolPolicy 支援 * 萬用字元比對（如 outlook_*），allow 萬用字元會預先核准所比對到的工具。新增 Troubleshooting 選項可匯入本機既有的 Claude Code CLI session；修正 Azure AI Foundry 互動登入後每則訊息認證失敗、gateway-SSO bootstrap 丟失跨來源 managedMcpServers。"},
    {v:"1.19367.0", date:"2026-07-07", cat:"Settings/Config", sev:"high", title:"破壞性變更：Desktop Extensions 預設不再載入；Linux apt 自動更新", body:"破壞性變更：.dxt 與 .mcpb 桌面擴充預設不再載入，需在 managed configuration 設 isDesktopExtensionEnabled 為 true（原本預設載入、僅擋安裝介面）。新增 Linux 經 Anthropic apt repository 自動更新；managed stdio MCP 新增 startupTimeoutSec，預設啟動逾時由 10 秒提高到 120 秒；新增 inferenceFoundryAuthFlow、microsoftAuthBroker 與背景 agent 於 token 到期後維持登入。"},
    {v:"1.18286.2", date:"2026-07-07", cat:"Performance/Bug Fix", sev:"low", title:"內建 Claude Code 引擎更新", body:"僅更新內建的 Claude Code 引擎至最新版，無其他使用者面向變更。"},
    {v:"1.18286.0", date:"2026-07-02", cat:"UI/UX", sev:"medium", title:"遺失工作資料夾的 session 救援、佇列訊息拖曳排序與 live preview 強化", body:"新增「Choose folder」救援：工作資料夾遺失的 session 可分叉到指定資料夾並封存原 session；佇列訊息支援拖曳排序，Steer 支援含圖片的訊息；Code tab live preview 改為回報真實連線／載入狀態並加上上一頁、下一頁、重新載入控制。修正 SSH 大訊息重連迴圈、session 過期後反覆要求登入（10 分鐘內回來可還原草稿）。"},
    {v:"1.17377.2", date:"2026-07-01", cat:"Models/Inference", sev:"high", title:"model picker 新增 Claude Fable 5", body:"為已取得存取權的組織在 model picker 加入 Claude Fable 5。"},
    {v:"1.17377.1", date:"2026-06-30", cat:"Settings/Config", sev:"high", title:"Linux 正式支援（.deb）、SSH 整合終端機與 transcript 預設遮罩金鑰", body:"Claude Desktop 正式支援 Linux：Debian 與 Ubuntu 的 x64／arm64 以 .deb 套件安裝，並支援 root-owned /etc/claude-desktop/managed-settings.json 的 managed configuration。SSH session 新增整合終端機面板與 transcript 內嵌圖片預覽；transcript 預設遮罩 API key 與 token（點眼睛圖示才顯示）。新增 allowedPluginMarketplaces managed 設定；修正 inferenceModels[].supports1m 被忽略導致 Bedrock／Vertex／Foundry／gateway 缺少 1M context 選項。"},
    {v:"1.15962.2", date:"2026-06-30", cat:"Performance/Bug Fix", sev:"low", title:"內建 Claude Code 引擎更新", body:"僅更新內建的 Claude Code 引擎至最新版，無其他使用者面向變更。"},
    {v:"1.15962.1", date:"2026-06-26", cat:"Plugins/MCP", sev:"medium", title:"第三方部署的 MCP 連線修復", body:"修正第三方部署未使用 MDM 時本機設定的 stdio MCP server 被拒絕；修正 OAuth provider 回傳非標準 refresh 回應導致第三方 MCP 連接器每次重啟即斷線；修正受管 Mac 上 Microsoft 365 brokered 登入回報「No reply address provided」。"},
    {v:"1.15962.0", date:"2026-06-25", cat:"Settings/Config", sev:"high", title:"受管 websearch 內建工具、otlpContentCapture 與 disableBundledSkills", body:"新增受管 websearch 內建工具，自架部署可由管理員設定 Brave、Tavily、Exa 或自訂端點，Cowork 與 Code 皆可用；新增 otlpContentCapture 讓管理員選擇性把未遮罩內容（使用者提示、回應、工具輸入輸出、原始 API request/response）送到 OTLP collector；新增 disableBundledSkills 可關閉內建 skill 與 workflow（如 deep-research）。另加本機 routine 自訂 cron 運算式與檔案面板的「Open in VS Code／Cursor」。"},
    {v:"1.15200.0", date:"2026-06-23", cat:"Plugins/MCP", sev:"high", title:"破壞性變更：移除本機 .mcpb／.dxt 連接器安裝；v2 bootstrap schema", body:"破壞性變更：移除從本機 .mcpb 與 .dxt 檔案安裝連接器擴充的支援。發佈 v2 bootstrap 回應 JSON schema（巢狀格式），v1 扁平 schema 仍支援。新增 Claude 多選提問的 inline 卡片（逐題選擇後合併成一次回覆）與從側欄刪除 Cowork session；修正開啟 Code tab 後因本機 session 歷史檔過大而崩潰。"},
    {v:"1.14271.0", date:"2026-06-18", cat:"Settings/Config", sev:"high", title:"破壞性變更：chatCodeExecutionEnabled 更名；routine 改計入一般用量", body:"破壞性變更：managed configuration 鍵 chatCodeExecutionEnabled 更名為 chatAdvancedFileAnalysisEnabled；betaFeaturesEnabled 標為棄用，改用 chatTabEnabled 與 chatAdvancedFileAnalysisEnabled。routine 改為計入一般用量上限，移除獨立的每日包含次數；新增 inferenceSessionLifetimeSec 於登入到期前提醒重新認證；allowedWorkspaceFolders 支援 ~ 與環境變數展開（如 %APPDATA%）。"},
    {v:"1.13576.0", date:"2026-06-16", cat:"UI/UX", sev:"high", title:"統一 Artifacts 檢視、Chat tab beta 與 MCP client id 變更", body:"新增統一 Artifacts 檢視，把 chat、Code、Cowork 的 artifact 集中成可搜尋清單；find-in-page 改為搜尋整份 transcript。破壞性注意：送往連線 MCP server 的 client identifier 由 custom3p-desktop 改為 claude-desktop-3p，比對舊值的 MCP allowlist 或 log filter 需更新。新增 Chat tab（beta，chatTabEnabled）、Bedrock Mantle 推論供應商、inferenceModels 的 anthropicFamilyTier／isFamilyDefault；model picker 改版並修正受管 tool policy 的 * 預設值被忽略。"},
    {v:"1.12603.1", date:"2026-06-11", cat:"Plugins/MCP", sev:"high", title:"內建 Microsoft 365 連接器、SSH Files 面板與 model picker 記憶", body:"新增內建 Microsoft 365 連接器：管理員可從 Setup 視窗的伺服器預設設定，使用者以瀏覽器登入後 Claude 可搜尋與讀取 M365 郵件、行事曆、OneDrive 與 SharePoint（預設唯讀）。遠端與 SSH session 新增 Files 面板；活動指示器新增執行中任務按鈕，背景任務面板的 Bash 列可展開即時輸出；model picker 記住上次選擇。inferenceGatewayAuthScheme 的 sso 值標為棄用，改用 inferenceCredentialKind: interactive。"},
    {v:"1.11847.5", date:"2026-06-09", cat:"Models/Inference", sev:"high", title:"支援 Fable 模型家族與 Mythos", body:"新增 Fable 模型家族支援，組織有存取權時亦支援 Mythos。修正 Clear Cache and Restart 會直接登出、macOS 上 Logitech Options+ 等驅動管理的滑鼠上一頁／下一頁失效（並新增觸控板滑動導覽）、Code session 從閒置恢復後遺失編碼指示與 worktree 脈絡、shell 匯出的自訂 request header 未傳入 Claude Code session。"},
    {v:"1.11187.4", date:"2026-06-05", cat:"UI/UX", sev:"medium", title:"effort 滑桿新增 Ultracode、transcript 數學式渲染", body:"effort 滑桿新增 Ultracode，選取後套用最高 effort 並為該 session 開啟 dynamic workflows；Claude Code transcript 支援行內與區塊數學式渲染、三連擊選取整段程式碼；Cowork 新增 session 內 effort 與 thinking 控制。修正 Windows 全機安裝後重裝失敗、開機不自動啟動、更新安裝失敗改顯示橫幅而非靜默失敗。"},
  ];
  /* CLAUDE-DESKTOP-DATA:END */

  /* Claude Desktop 目前沒有手寫靈感卡；保留空陣列讓 AGENTS 合約一致。 */
  const INSP_CD = [];

  const INSP_CC = [
    {ico:"eye", color:"blue", feat:"VSCode Focus View — 摺疊工具雜訊、只留逐輪摘要", ver:"v2.1.221 · 2026-08-04",
     desc:"VSCode 擴充新增 Focus view：把工具呼叫活動摺疊到可展開的逐輪摘要後方，只保留即時執行中工具指示器，長時間背景任務畫面不再被大量工具呼叫洗版。",
     scen:"<b>場景：</b>Backend 工程師跑長時間重構或大量檔案搜尋時按 <code>Ctrl+Alt+F</code> 切換 Focus view，只看逐輪重點與目前執行中的工具；QA 追蹤自動化修復進度時也能用同一視角快速掌握狀態而不被 Read/Grep/Edit 呼叫洗版。",
     roles:["backend","frontend","qa"],
     d:[
       {h:"為什麼有用", p:"背景 session 或大型重構常在單輪內觸發數十次工具呼叫，逐一展開閱讀會拖慢對進度的掌握；Focus view 把雜訊摺疊，只留下逐輪摘要與目前執行中的工具，讓人專注在「做到哪裡」而非「做了哪些呼叫」。"},
       {h:"設定 / 操作", c:"bash", b:"# VSCode 擴充內：\n# 按 Ctrl+Alt+F 切換 Focus view\n# 或開啟命令選擇區輸入：\n# \"Claude Code: Toggle Focus view\""},
       {h:"小技巧", l:["適合搭配 Ctrl+T 釘選的背景 session 長跑時使用，減少視覺負擔", "摺疊狀態下仍可展開單一輪次查看完整工具活動，不影響除錯"]}
     ], auto: true},
    {ico:"bolt", color:"purple", feat:"/ultrareview — 平行多 Agent Code Review", ver:"v2.1.111 · 2026-04-16",
     desc:"非互動式雲端平行多 agent review，可一次跑安全、效能、可讀性、Style 多視角。",
     scen:"<b>iOS 場景：</b>每次 PR 進 develop 前自動跑 <code>claude ultrareview</code>，產出 Swift Concurrency、SwiftUI 效能、銀行交易資安、團隊 Style 四份報告。RD 不再瓶頸於 Senior Reviewer。",
     d:[
       {h:"為什麼對 iOS RD 有用", p:"傳統 PR review 一個人要兼顧資安、效能、Style、可讀性，常顧此失彼。<code>/ultrareview</code> 把 review 拆成多個 agent 平行跑，每個專注一個視角，最後合併摘要。"},
       {h:"基本指令", c:"bash", b:"# 對 develop 跑 review\nclaude ultrareview origin/develop\n\n# 從 PR URL 啟動\nclaude ultrareview --from-pr https://github.com/your-org/ios-app/pull/1234"},
       {h:"四種 iOS 視角分工建議", l:["<b>Concurrency</b>：actor 隔離、Sendable、@MainActor 違規","<b>Security</b>：Keychain、APIClient、TLS pinning、log 是否漏個資","<b>UI Perf</b>：SwiftUI body 重繪、Combine 訂閱洩漏","<b>團隊 Style</b>：內部命名規範、SwiftLint warnings"]},
       {h:"包成團隊 Slash Command", c:"bash", b:"# .claude/commands/review.md\nclaude ultrareview $1 \\\n  --agent concurrency-swift \\\n  --agent security-banking \\\n  --agent ui-perf \\\n  --agent style"}
     ]},
    {ico:"lock", color:"orange", feat:"Hooks 條件式 if + permission 語法", ver:"v2.1.85 · 2026-03-26",
     desc:"Hooks 可加 <code>if</code> 條件，使用 <code>Bash(git push *)</code> 這類 permission 規則精準觸發。",
     scen:"<b>銀行 APP 場景：</b>偵測 <code>Bash(git push origin main)</code> 自動 block；<code>Edit(*Secrets.swift)</code> 強制二次確認。",
     d:[
       {h:"為什麼有用", p:"PreToolUse hooks 加 <code>if</code> 後可以「只在符合條件時觸發」。配合 permission-rule 語法，可以攔截高風險操作而不影響日常工具呼叫。"},
       {h:"擋直接 push 到 main", c:"json", b:"// .claude/hooks/block-main-push.json\n{\n  \"event\": \"PreToolUse\",\n  \"if\": \"Bash(git push origin main) || Bash(git push origin master)\",\n  \"action\": {\n    \"decision\": \"block\",\n    \"message\": \"iOS 團隊規範：請開 PR，不要直接推 main\"\n  }\n}"},
       {h:"Secrets.swift 編輯需二次確認", c:"json", b:"{\n  \"event\": \"PreToolUse\",\n  \"if\": \"Edit(**/Secrets.swift) || Edit(**/*ApiKey*.swift)\",\n  \"action\": { \"decision\": \"ask\" }\n}"},
       {h:"延伸玩法", l:["改 <code>.pbxproj</code> 自動寄通知到 Slack","或自動標記 PR 需資安 sign-off","可疊加多個 hook 互不干擾"]}
     ]},
    {ico:"doc", color:"green", feat:"/recap + 模型自動 /init /review", ver:"v2.1.108 · 2026-04-14",
     desc:"新 <code>/recap</code> 重點摘要；模型可透過 Skill 工具呼叫 <code>/init</code>、<code>/review</code>、<code>/security-review</code>。",
     scen:"<b>Scrum 場景：</b>站立會議前用 <code>/recap</code> 整理昨日對話與 commit；Sprint 中段排程跑 <code>/security-review</code>，提早發現金融合規風險。",
     d:[
       {h:"為什麼有用", p:"<code>/recap</code> 把對話與 commit 整理成可直接貼 Confluence/JIRA 的條列式摘要；模型還可自動透過 Skill 工具呼叫 <code>/security-review</code>，不必每次手動下指令。"},
       {h:"站立會議前 5 分鐘", c:"bash", b:"claude --resume yesterday-session\n> /recap\n# → 輸出昨日做了什麼、阻塞點、今日 TODO（繁中）\n# 直接貼進 Slack #ios-daily 頻道"},
       {h:"自動週五安全 review", c:"yaml", b:"# .claude/skills/auto-security.md\n---\nname: auto-security\ntrigger: every-friday\n---\n當 sprint 進入週五時自動跑 /security-review，\n把結果寫到 .claude/reports/security-{date}.md"},
       {h:"和 Sprint 流程整合", l:["<b>Daily standup</b>：用 /recap 跨 session 串聯昨日進度","<b>Sprint review</b>：批次跑 /recap 拼成 sprint summary","<b>Retro</b>：對 retrospective session 跑 /recap 摘錄共識"]}
     ]},
    {ico:"puzzle", color:"blue", feat:"Plugin 可內附 bin/ 執行檔", ver:"v2.1.91 · 2026-04-02",
     desc:"Plugins 可打包 <code>bin/</code> 執行檔，配合 marketplace 內部分發。",
     scen:"<b>iOS 場景：</b>把 xcodegen wrapper、SwiftLint custom rules、API mock server 打成 plugin，新人 <code>claude plugin install ios-toolkit</code> 一行入手。",
     d:[
       {h:"為什麼有用", p:"原本內部工具要每個 RD 自己安裝、版本各異。打包成 plugin 後集中分發，工具升級走 plugin update。"},
       {h:"plugin 結構範例", c:"bash", b:"ios-toolkit/\n├── plugin.json\n├── bin/\n│   ├── mock         # API mock server\n│   ├── xcgen        # xcodegen + 預設配置\n│   └── secrets-scan # 偵測 hard-coded API keys\n├── skills/\n│   ├── style.md\n│   └── api-spec.md\n└── hooks/\n    └── block-main-push.json"},
       {h:"plugin.json 範例", c:"json", b:"{\n  \"name\": \"ios-toolkit\",\n  \"version\": \"1.0.0\",\n  \"bin\": {\n    \"mock\": \"./bin/mock\",\n    \"xcgen\": \"./bin/xcgen\"\n  }\n}"},
       {h:"安裝與分發", l:["內網架 plugin marketplace（HTTP 即可）","新人執行 <code>claude plugin install ios-toolkit</code>","版本控管走 semver，破壞性變更升 major"]}
     ]},
    {ico:"shield", color:"red", feat:"Sandbox + 子程序 PID namespace", ver:"v2.1.98 · 2026-04-09",
     desc:"Linux 子程序加 PID namespace、<code>CLAUDE_CODE_SUBPROCESS_ENV_SCRUB</code> 自動清除憑證 env var。",
     scen:"<b>金融資安場景：</b>避免 Claude 把生產 token 漏給外部 MCP server。資安團隊會非常開心。",
     d:[
       {h:"為什麼對銀行 RD 重要", p:"金融開發機常存 token、AWS key、Bedrock 憑證。Claude 子程序若不慎漏給外部 server 是合規風險。<code>SUBPROCESS_ENV_SCRUB</code> 會自動清掉敏感變數；Linux 額外加 PID namespace 隔離程序樹。"},
       {h:"開啟方式", c:"bash", b:"# ~/.zshrc\nexport CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1"},
       {h:"配合 deniedDomains 雙重保險", c:"json", b:"// .claude/settings.json\n{\n  \"sandbox\": {\n    \"network\": {\n      \"deniedDomains\": [\"*.production.example.com\"],\n      \"failIfUnavailable\": true\n    }\n  }\n}"},
       {h:"哪些變數會被 scrub", l:["<code>AWS_*</code>、<code>ANTHROPIC_API_KEY</code>、<code>OPENAI_API_KEY</code>","結尾為 <code>_TOKEN</code>、<code>_SECRET</code>、<code>_PASSWORD</code> 的變數","自訂前綴可透過設定加入"]}
     ]},
    {ico:"ruler", color:"gold", feat:"/team-onboarding 指令", ver:"v2.1.101 · 2026-04-10",
     desc:"幫助新人快速進入專案。",
     scen:"<b>AI Scrum 場景：</b>新進 iOS RD 第一天執行，自動帶過 repo 結構、CI flow、銀行 API gateway、code review checklist。學習曲線從 1-2 週壓到半天。",
     d:[
       {h:"為什麼有用", p:"新人第一天最痛是「不知道從哪開始讀 code」。<code>/team-onboarding</code> 自動帶過 repo 結構、CI flow、團隊內部慣例、code review checklist。"},
       {h:"建立團隊 onboarding 模板", c:"yaml", b:"# .claude/commands/onboarding.md\n---\nname: ios-onboarding\ndescription: iOS 新進 RD 入門導覽\n---\n你是新人。請依序帶我認識：\n1. 專案結構（先讀 README.md、Package.swift）\n2. CI flow（.github/workflows、fastlane）\n3. 銀行 API gateway 的呼叫慣例（讀 NetworkLayer/）\n4. Code review checklist（從 .claude/skills/style.md）\n5. 第一個練習 task：實作假交易明細頁"},
       {h:"執行流程", l:["新人第一天 <code>claude /team-onboarding</code>","Claude 邊讀 code 邊解釋，每步問「有問題嗎」","結束後產出個人版 onboarding.md 摘要","Mentor 看摘要快速確認新人理解程度"]}
     ]},
    {ico:"hook", color:"orange", feat:"CwdChanged / FileChanged Hooks", ver:"v2.1.83 · 2026-03-25",
     desc:"新增檔案變動與切換工作目錄的 hook。",
     scen:"<b>iOS 場景：</b><code>.xcodeproj</code>/<code>Package.swift</code> 變動自動跑 <code>xcodegen</code>；切到 feature 分支自動 <code>pod install</code>。",
     d:[
       {h:"為什麼有用", p:"原本要靠 fswatch / entr 監視檔案，現在 Claude 內建。<code>FileChanged</code> 在儲存後觸發；<code>CwdChanged</code> 在切換工作目錄（含 git checkout 切分支）後觸發。"},
       {h:"自動跑 xcodegen", c:"json", b:"// .claude/hooks/auto-xcgen.json\n{\n  \"event\": \"FileChanged\",\n  \"if\": \"FilePattern(project.yml) || FilePattern(Package.swift)\",\n  \"action\": {\n    \"run\": \"cd $CWD && xcodegen generate\"\n  }\n}"},
       {h:"切分支自動 pod install", c:"json", b:"{\n  \"event\": \"CwdChanged\",\n  \"action\": {\n    \"run\": \"if [ -f Podfile.lock ]; then pod install --silent; fi\"\n  }\n}"},
       {h:"還可以做的事", l:["改 <code>Localizable.strings</code> → 跑 <code>swiftgen</code>","切到 <code>main</code> → 跑 <code>git pull --ff-only</code>","Sprint 開始日 → 自動清 <code>DerivedData</code>"]}
     ]},
    {ico:"robot", color:"purple", feat:"Forked Subagents + Agent mcpServers", ver:"v2.1.117 · 2026-04-22",
     desc:"開 forked subagent；agent frontmatter 支援 <code>mcpServers</code> 限縮工具集。",
     scen:"<b>Scrum 場景：</b>定義 Sprint Planner（只連 Jira）、UI Reviewer（只連 Figma）、Compliance Bot（只連 Confluence + 資安規則）。互不干擾、可平行。",
     d:[
       {h:"為什麼有用", p:"以前所有 agent 共用一份 MCP 工具 — Sprint Planner 也能存取 Figma、Compliance Bot 也能戳 Slack。Forked subagent + agent frontmatter 的 <code>mcpServers</code> 可分開，達到最小權限原則。"},
       {h:"Sprint Planner agent", c:"yaml", b:"# .claude/agents/sprint-planner.md\n---\nname: sprint-planner\nmcpServers:\n  - jira\n  - confluence\n---\n你是 iOS 的 Sprint Planner。\n專注於：故事點估算、依賴拆解、風險識別。\n禁止：直接改 code（沒有 file tool）。"},
       {h:"Compliance Bot agent", c:"yaml", b:"# .claude/agents/compliance-bot.md\n---\nname: compliance-bot\nmcpServers:\n  - confluence\n  - policy-api\n---\n你是金融合規檢查員。\n對任何 PR 比對 .claude/policies/ 規則。\n如違反則建議補丁，不直接改 code。"},
       {h:"啟用 forked 平行跑", c:"bash", b:"export CLAUDE_CODE_FORK_SUBAGENT=1\nclaude --agent sprint-planner /plan-next-sprint &\nclaude --agent compliance-bot /review HEAD &\nwait"}
     ]},
    {ico:"antenna", color:"blue", feat:"Status Line worktree / 模型 / effort", ver:"v2.1.97 · 2026-04-08",
     desc:"Status line 支援 <code>refreshInterval</code>、<code>workspace.git_worktree</code>、<code>effort.level</code>。",
     scen:"<b>iOS RD 場景：</b>Status Line 顯示「Sprint · 分支 · Xcode scheme · 跑了幾分鐘」，搭配 <code>Ctrl+O</code> 切 verbose。",
     d:[
       {h:"為什麼有用", p:"Status Line 一直在視野底部，是放「上下文」最好的位置。把 Sprint、分支、Xcode scheme、effort 集中顯示，不再切視窗看狀態。"},
       {h:"設定範例", c:"json", b:"// .claude/settings.json\n{\n  \"statusLine\": {\n    \"refreshInterval\": 5000,\n    \"format\": \"{sprint} · {branch} · {scheme} · {effort.level} · {duration}\",\n    \"command\": \"./scripts/statusline.sh\"\n  }\n}"},
       {h:"自製腳本範例", c:"bash", b:"#!/bin/bash\n# scripts/statusline.sh\nSPRINT=$(jq -r '.sprint' .claude/sprint.json)\nBRANCH=$(git branch --show-current)\nSCHEME=$(xcodebuild -list -json | jq -r '.workspace.schemes[0]')\necho \"{\\\"sprint\\\":\\\"$SPRINT\\\",\\\"branch\\\":\\\"$BRANCH\\\",\\\"scheme\\\":\\\"$SCHEME\\\"}\""},
       {h:"小技巧", l:["<b>Ctrl+O</b> 切 verbose 看詳細上下文","<code>workspace.git_worktree</code> 顯示目前 worktree 名","<code>effort.level</code> 顯示目前思考強度（避免不小心開 xhigh 燒額度）"]}
     ]},
    {ico:"clock", color:"green", feat:"排程任務 + Monitor 工具", ver:"v2.1.98, 2.1.110 · 2026-04",
     desc:"支援排程任務、背景腳本事件流，<code>--resume</code> 可復活排程。",
     scen:"<b>銀行專案場景：</b>排程「每週五跑 SwiftLint + 依賴檢查 + 資安掃描」自動產 PR，週一站會直接看報告。",
     d:[
       {h:"為什麼對銀行專案有用", p:"資安掃描、依賴更新通常被當「事件驅動」（出事才跑）。改成「排程驅動」可以提早發現問題、降低 incident 機率。"},
       {h:"每週五自動掃描", c:"yaml", b:"# .claude/scheduled/weekly-scan.md\n---\ncron: 0 17 * * 5    # 週五 17:00\n---\n步驟：\n1. swift package outdated\n2. swiftlint --strict\n3. /security-review HEAD~7..HEAD\n4. 把報告寫到 .claude/reports/scan-{date}.md\n5. 若有 high severity，開 PR 自動修可修的"},
       {h:"Monitor 工具用法", c:"bash", b:"# 跑長時間任務時看背景進度\nclaude monitor ./scripts/full-build.sh \\\n  --pattern 'warning|error' \\\n  --notify-on-match"},
       {h:"小技巧", l:["排程跑出來的失敗會自動 <code>--resume</code> 復活","可以串接 Slack webhook 通知 Scrum Master","跨 sprint 累積掃描資料能畫趨勢圖"]}
     ]},
    {ico:"badge", color:"gold", feat:"Skills 用 ${CLAUDE_EFFORT}", ver:"v2.1.120 · 2026-04-28",
     desc:"Skills 可依 effort 動態調整內容；描述上限 250 字讓觸發更精準。",
     scen:"<b>AI Scrum 場景：</b>建立 <i>ios-style</i>、<i>api-mock</i>、<i>compliance-checklist</i> skills。Effort 高時詳列規則，平常給摘要。",
     d:[
       {h:"為什麼有用", p:"Skills 可根據當前 effort 動態調整內容 — high effort 時詳列規則、平常只給摘要，節省 token 又保持精確度。"},
       {h:"ios-style skill 範例", c:"yaml", b:"# .claude/skills/ios-style.md\n---\nname: ios-style\ndescription: iOS 命名與架構規範（250 字內）\n---\n# 摘要規則（永遠載入）\n- ViewModel 後綴：xxxViewModel\n- 網路層放 NetworkLayer/，protocol-driven\n- 不可在 View 裡呼叫 URLSession\n\n${CLAUDE_EFFORT == 'high' ? `\n# 完整規則（high effort 才載入）\n... [50+ 條詳列]\n` : ''}"},
       {h:"建議的 skill 清單", l:["<b>ios-style</b>：命名 / 架構規範","<b>api-mock</b>：產生符合內部 API 規格的 mock","<b>compliance-checklist</b>：金管會 / 個資法 checklist","<b>swift-perf-tips</b>：SwiftUI / Combine 效能陷阱"]},
       {h:"觸發精準度", p:"description 上限 250 字後 skill 觸發更穩 — 把 description 寫成「什麼情境會用到」，而不是 skill 內容本身的摘要。"}
     ]},
    {ico:"search", color:"red", feat:"/resume 用 PR URL 搜尋", ver:"v2.1.122 · 2026-04-28",
     desc:"PR URL 貼進 <code>/resume</code> 自動找對應 session。",
     scen:"<b>iOS 工作流：</b>同事丟 PR 連結，貼到 <code>/resume</code> 立刻接回上下文，不用重讀 diff。",
     d:[
       {h:"為什麼有用", p:"以前同事丟 PR 連結要重新 git fetch、checkout、claude --continue 翻歷史 session。現在貼一條 URL 進 <code>/resume</code> 就回到當時的 Claude 上下文（含 review 思路、待辦）。"},
       {h:"實際操作", c:"bash", b:"claude\n> /resume\n> https://github.com/your-org/ios-app/pull/1234\n# Claude 自動：\n#  1. 找出對應 session（依 commit hash + branch）\n#  2. 載入當時的對話、TODO、思考紀錄\n#  3. 提示「上次討論到 XX，要繼續嗎？」"},
       {h:"支援的 git host", l:["GitHub / GitHub Enterprise","GitLab / GitLab Self-managed","Bitbucket Cloud + Data Center","可自訂 <code>prUrlTemplate</code> 對應內網 git server"]},
       {h:"進階：自動帶上 review checklist", p:"配合 <code>--print</code> 非互動式跑：<code>claude /resume &lt;PR&gt; --print '依 style skill 給 review 意見'</code>，產出當下分析給 ChatOps bot。"}
     ]},
    {ico:"branch", color:"blue", feat:"/fork — Session 平行分叉探索", ver:"v2.1.212 · 2026-07-17",
     desc:"<code>/fork</code> 把當前 session 完整複製為背景 session，可同時試不同修法，取最優者合入。",
     scen:"<b>Sprint 場景：</b>遇到複雜 bug 有兩種修法，直接 <code>/fork</code> 開一條背景 session 試 Plan B，主 session 繼續試 Plan A——誰先跑通誰上 PR，不再序列化試錯。",
     roles:["backend","frontend","qa","pm"],
     d:[
       {h:"為什麼有用", p:"以前試不同修法要先 stash、重開 terminal、重建上下文。<code>/fork</code> 一鍵複製整個 session（含對話歷史與 worktree 狀態）到背景，兩路並行後用 <code>/resume</code> 選贏家繼續。"},
       {h:"設定 / 操作", c:"bash", b:"# 1. 在主 session 決定分叉點\n> /fork\n# → 已建立背景 session，繼承完整上下文\n\n# 2. 主 session 繼續 Plan A；背景跑 Plan B\n# 3. 查看所有 sessions\nclaude agents\n\n# 4. 選贏家繼續\n> /resume"},
       {h:"小技巧", l:["<code>/fork</code> 後兩 session 的 git worktree 各自獨立，不會互相污染","搭配 <code>/subtask</code> 在 session 內再派子 agent 處理子問題","背景 session 完成後會推播通知，不需要守著等"]}
     ],
     auto:true},
    {ico:"server", color:"teal", feat:"claude self-hosted-runner — 自架執行環境", ver:"v2.1.224 · 2026-08-07",
     desc:"<code>claude self-hosted-runner</code> 可把自有機器或容器變成 Claude Code web、行動裝置與桌面 session 的執行主機（Team／Enterprise）。",
     scen:"<b>場景：</b>銀行內網合規要求程式碼與憑證不能離開受控機器，Backend 團隊把 self-hosted-runner 跑在內網 build agent 上，工程師從手機或 Claude Code web 派工作，實際執行與檔案存取全程留在內網主機。",
     roles:["backend","frontend","qa"],
     d:[
       {h:"為什麼有用", p:"過去 Claude Code web／行動裝置的 session 只能執行在 Anthropic 託管的環境，內網程式碼或需要特殊憑證的專案無法使用。<code>self-hosted-runner</code> 讓 Team／Enterprise 把任意機器或容器登記為執行主機，遠端發起的 session 實際在該主機上執行，資料不出內網。"},
       {h:"設定 / 操作", c:"bash", b:"# 在受控的內網機器或容器上執行\nclaude self-hosted-runner \\\n  --name backend-build-agent\n\n# 之後從 Claude Code web／行動裝置\n# 選擇該 runner 作為 session 執行主機"},
       {h:"小技巧", l:["搭配 crossSessionInbound／dialogExpiry 設定，跨 session 訊息在 bypass-permissions 模式下仍需人工核准", "適合搭配沙箱憑證遮罩選項，讓 runner 上的機密環境變數不外流"]}
     ],
     auto:true}
  ];

  const INSP_CA = [
    {ico:"message", color:"green", feat:"Apple Messages plugin", ver:"2026-08-20",
     desc:"ChatGPT desktop app（macOS）新增 Apple Messages plugin，可讀取／搜尋 Mac 上的 Messages 對話並代為準備或送出訊息。",
     scen:"<b>場景：</b>PM／QA 用 ChatGPT desktop 整理跨團隊 iMessage 討論串、自動彙整待辦，或請 Codex 代擬回覆草稿，送出前仍需人工核准訊息內容與收件人。",
     roles:["pm","qa"],
     d:[
       {h:"為什麼有用", p:"過去要靠人工在 Messages 裡翻找對話再回報進度，現在可直接讓 ChatGPT 讀取、搜尋並代擬回覆，省下反覆複製貼上的時間。"},
       {h:"設定 / 操作", c:"bash", b:"# ChatGPT desktop app (macOS) → Settings → Plugins\n# 啟用 Apple Messages plugin 後於對話中呼叫"},
       {h:"小技巧", l:["預設每次送出前都要核准訊息內容與收件人，注意持久核准（persistent-approval）帶來的風險與撤銷步驟","僅 macOS 版 ChatGPT desktop app 可用，Codex 與 ChatGPT Work 皆可呼叫"]}
     ], auto: true},
    {ico:"branch", color:"teal", feat:"對話 Forking（分支）", ver:"v260212 · 2026-02-12",
     desc:"在同一個 thread 開分支試不同方向，不必重起一個 session。",
     scen:"<b>iOS UI 探索場景：</b>同一個 SwiftUI navigation 設計，先 fork 一支試 NavigationStack、另一支試 NavigationSplitView。比完再選，不會搞混上下文。",
     d:[
       {h:"為什麼有用", p:"在同一個 thread 開分支試不同方向。原本要重起一個對話，現在直接從某一輪 fork 出一條新 thread，A/B 比完留贏家。"},
       {h:"iOS UI 探索場景", l:["<b>父 thread</b>：「我要做交易明細頁的 navigation」","<b>分支 A</b>：用 NavigationStack（iOS 16+）","<b>分支 B</b>：用 NavigationSplitView（適配 iPad）","比較完選 A，分支 B 留檔備查"]},
       {h:"操作", c:"bash", b:"# Codex App UI:\n# 1. 在某輪 AI 回應上右鍵 → Fork from here\n# 2. 新 thread 用相同上下文開始\n# 3. 父 thread 與分支可同時開，不互相影響"},
       {h:"小技巧", p:"取個有意義的 thread 名字（例如「nav-stack」「nav-split」）。Cmd+K 切 thread 時一目瞭然。"}
     ]},
    {ico:"target", color:"purple", feat:"Mid-turn Steering", ver:"v260205 · 2026-02-05",
     desc:"Codex 跑到一半時可以送訊息調整方向。",
     scen:"<b>銀行交易流程場景：</b>Codex 在改 transfer flow 寫到一半，發現方向偏了，立刻送一句「請改用 Result type 而不是 throw」，省下整輪 retry。",
     d:[
       {h:"為什麼有用", p:"Codex 寫到一半發現方向偏了，過去只能等它跑完再修正。現在可以直接送訊息打斷與調整 — 像跟真人 pair programming。"},
       {h:"iOS 場景：改交易流程", l:["你：「重構 transferMoney() 處理錯誤」","Codex 開始改用 throws…","你（mid-turn）：「等等，請改用 Result&lt;Success, TransferError&gt;」","Codex 立刻轉向，前面的 throws 改回來"]},
       {h:"什麼時候用", l:["發現 Codex 誤解需求","想加額外限制（不要動某檔案）","看到一半想插一句測試案例","品味方向偏離想拉回"]},
       {h:"配合 Steer Mode（CLI）", p:"CLI 0.98+ 已穩定 Steer Mode：Tab 排隊訊息、Enter 立即送。把 mid-turn steering 從 GUI 帶到 terminal 工作流。"}
     ]},
    {ico:"bolt", color:"green", feat:"GPT-5.3-Codex-Spark（>1000 tok/s）", ver:"2026-02-12",
     desc:"小型快模型，串流速度極快，適合互動式編輯。",
     scen:"<b>iOS 開發場景：</b>SwiftUI 預覽迭代、Repeat-style refactor、寫 unit test boilerplate — 用 Spark 比 5.3-Codex 快上不少，迭代節奏直接上一階。",
     d:[
       {h:"為什麼對 iOS 有用", p:"Spark 串流速度 &gt;1000 tokens/sec — 對「短而頻繁」的編輯特別有感（boilerplate、unit test、refactor）。重型推理還是用 5.3-Codex；Spark 適合 IDE 內 inline 互動。"},
       {h:"切換 model", c:"bash", b:"# Codex CLI\ncodex --model gpt-5.3-codex-spark\n\n# Codex App\n# 設定 → Model → GPT-5.3-Codex-Spark"},
       {h:"iOS 適合的工作流", l:["<b>SwiftUI 預覽迭代</b>：改一個顏色看效果，Spark 速度跟得上","<b>Test boilerplate</b>：產 XCTestCase 樣板","<b>Doc comment</b>：產生 ///- Parameters / Returns","<b>Snippet 翻譯</b>：把 Obj-C 轉 Swift"]},
       {h:"什麼不適合 Spark", p:"複雜 architecture decision、跨檔案 refactor、debug 邏輯錯誤這類需要深度推理的，還是切回 5.3-Codex 比較穩。"}
     ]},
    {ico:"puzzle", color:"blue", feat:"VS Code / Cursor 原生整合", ver:"2026-02-09",
     desc:"GPT-5.3-Codex 在兩大編輯器原生可用。",
     scen:"<b>iOS 工作流：</b>銀行 APP 部分後端 / Web 用 VS Code 開發，跨團隊 review 時不必切工具。Cursor 主力是 Swift Server，可同時用同一個模型。",
     d:[
       {h:"為什麼有用", p:"銀行 APP 開發常跨工具 — iOS 用 Xcode，Backend / Web 用 VS Code 或 Cursor。GPT-5.3-Codex 在三邊都能用，跨團隊 review 時不必切模型。"},
       {h:"安裝與啟用", l:["VS Code：搜尋 Codex extension、登入 ChatGPT","Cursor：設定 → Models → 選 GPT-5.3-Codex","桌面 Codex App：自動帶過 ChatGPT 帳號"]},
       {h:"iOS 的隱性好處", p:"雖然 Xcode 沒有 native extension，但 Cursor / VS Code 可以開啟 .swift 檔做小型編輯後再回 Xcode build。對 SwiftPM 為主的 iOS 專案很順手。"},
       {h:"團隊協作建議", l:["前端 / 後端 / iOS 共用同一個 Codex thread 討論 API spec","SwiftLint / ESLint 都用 Codex 一鍵修","跨團隊 PR 都用 Codex 摘要"]}
     ]},
    {ico:"clip", color:"gold", feat:"附加任意檔案類型 + PDF 預覽", ver:"v260205, v260204",
     desc:"可拖曳任何格式的檔案；review 面板可預覽 PDF。",
     scen:"<b>銀行金管會 / 規範場景：</b>把法規 PDF（個資法、金管會規定）直接拖進 Codex App，討論 APP 功能設計時對著條文寫 code。",
     d:[
       {h:"為什麼對銀行 RD 有用", p:"金管會法規、產品 spec、UX wireframe 多半是 PDF / 圖片。直接拖進 Codex App 就能對著討論，不必先複製貼上文字。"},
       {h:"場景：對著金管會條文寫 code", l:["把「電子支付管理條例」PDF 拖進 Codex","問：「這條 6.2 對 APP 端意味什麼？」","Codex 引用條文 + 給 Swift 實作建議","review 面板可同時看 PDF 對照"]},
       {h:"場景：UX 原稿轉 SwiftUI", l:["把 Figma 截圖拖進","「實作這個交易明細卡片，用 SwiftUI」","Codex 產 code + 註解像素位置"]},
       {h:"支援格式", l:["PDF（含預覽）","PNG / JPG / WebP / GIF","CSV / JSON / XML","Swift / Obj-C / 任何文字檔"]}
     ]},
    {ico:"spark", color:"orange", feat:"Floating Pop-out Window", ver:"v260212 · 2026-02-12",
     desc:"Codex App 可獨立浮動視窗。",
     scen:"<b>iOS pair programming 場景：</b>Xcode 全螢幕同時讓 Codex 浮在角落；不用 Cmd+Tab 來回切，spec / 程式 / AI 三件可同步看。",
     d:[
       {h:"為什麼有用", p:"Xcode 全螢幕時 Cmd+Tab 切視窗很煩。Pop-out 把 Codex App 變成 always-on-top 浮動小窗，不擋程式碼也能即時對話。"},
       {h:"操作", c:"bash", b:"# Codex App 視窗右上角 →「⊞ Pop out」\n# 浮動視窗可拖到任何角落\n# 再按一次回到主視窗"},
       {h:"iOS pair programming 場景", l:["Xcode 主畫面 + Codex 浮在右下","Spec 在 Notion / Confluence 開另一邊","三面同步看，不用 Cmd+Tab"]},
       {h:"小技巧", p:"搭配 mid-turn steering 特別好用 — 看 Xcode 預覽發現問題立刻在浮動 Codex 打字修正。"}
     ]},
    {ico:"mic", color:"teal", feat:"ChatGPT Voice（GPT-Live）— 語音協調 Codex 任務", ver:"2026-07-23",
     desc:"透過語音在 Chat、Work、Codex 之間協調任務，直接口述方向讓 Codex 在桌面背景執行。",
     scen:"<b>iOS 開發場景：</b>通勤戴 AirPods 對 ChatGPT 說「幫我繼續修 feature/payment-fix 的 bug」，Mac 上的 Codex 自動接手背景任務；進公司只需審 diff，開發節奏不中斷。",
     roles:["frontend","backend","pm"],
     d:[
       {h:"為什麼有用", p:"GPT-Live 讓語音輸入從「單純聽寫」升級為「跨模組任務協調」。一句話可同時觸發 Chat 討論、指派 Codex 任務、查詢 Work 文件，特別適合雙手忙或移動中的情境。"},
       {h:"設定 / 操作", c:"bash", b:"# ChatGPT 桌面 App（macOS/Windows）\n# 點選右上角麥克風啟動 ChatGPT Voice\n# 範例指令：\n# 「幫我繼續修 feature/payment-fix 分支的 bug」\n# 「把昨天 sprint review 的 TODO 整理成 Jira tickets」\n# Codex 自動開啟對應 session 並在背景執行"},
       {h:"小技巧", l:["搭配 <b>Codex Remote Control</b>：手機說話、Mac 執行，隨時查看進度","會議空檔說「整理一下剛才討論的 TODO」讓 Work 記錄決策","通勤確認方向 → 進公司審 diff → 節省 context switch 時間"]}
     ],
     auto: true},
    {ico:"layers", color:"blue", feat:"跨 Repo Review + 圖片編輯 Canvas View", ver:"2026-07-30",
     desc:"multi-folder project 可一次檢視所有 repo 的異動並跨 repo review diff；生成圖片新增 Focused / Canvas 檢視與局部註解修改。",
     scen:"<b>跨 repo 微服務場景：</b>銀行 APP 前後端拆成多個 repo（iOS App、BFF、design-system），改一支 API 常需同時調整多邊程式碼；multi-folder project 的跨 repo Review 可一次看完所有 repo 的異動行數，不必切視窗來回核對。",
     roles:["frontend","backend","designer"],
     d:[
       {h:"為什麼有用", p:"銀行 APP 開發常見前端、後端、design-system 分屬不同 repo，過去 review 得逐一切換視窗核對。multi-folder project 把相關 repo 收進同一個專案，Review 時能一次看見所有 repo 的變更行數與 diff，減少漏看跨 repo 影響的風險。"},
       {h:"設定 / 操作", c:"bash", b:"# ChatGPT 桌面 App\n# 1. Projects → New project → Add local folders（勾選多個 repo：ios-app、bff、design-system）\n# 2. 指定其中一個為 primary folder\n# 3. 完成一輪修改後點選 Review，可跨 repo 檢視 diff"},
       {h:"小技巧", l:["圖片相關產出（icon、illustration）可用新版 Canvas view 逐張加註解，選好版本再一次送出修改","Focused view 適合單張精修，Canvas view 適合多版本並排比較","Chrome 擴充可直接 @mention 開啟中的設計稿分頁，帶文字進側邊聊天核對規格"]}
     ],
     auto: true}
  ];

  const INSP_CI = [
    {ico:"layout", color:"blue", feat:"codex agents 儀表板", ver:"0.149.0 · 2026-08-20",
     desc:"互動式儀表板可搜尋、啟動、開啟、重新命名與停止多個 Codex session，取代逐一切換視窗管理。",
     scen:"<b>場景：</b>後端／QA 同時跑多條 Codex 任務（跑測試、寫 migration、修 bug）時，用 <code>codex agents</code> 一次盤點所有任務狀態，直接在儀表板重新命名、停止或跳轉，不用記哪個視窗對應哪個任務。",
     roles:["backend","qa"],
     d:[
       {h:"為什麼有用", p:"過去多個 Codex session 同時跑，只能各自切視窗確認進度。<code>codex agents</code> 把所有任務彙整成一張可搜尋、可操作的清單，一眼看出哪個卡住、哪個完成。"},
       {h:"設定 / 操作", c:"bash", b:"codex agents\n# 面板內：/ 搜尋任務、Enter 開啟、r 重新命名、x 停止"},
       {h:"小技巧", l:["搭配 <code>codex queue</code> 直接對清單裡的 session 補送指令，不用切回原視窗","可自訂快捷鍵，常用動作（停止／重新命名）一鍵完成"]}
     ], auto: true},
    {ico:"plug", color:"blue", feat:"codex exec-server（實驗）", ver:"0.119.0 · 2026-04-10",
     desc:"把 Codex 變成可被外部呼叫的長駐 server，IPC / WebSocket 都行。",
     scen:"<b>銀行內網 CI 場景：</b>把 codex exec-server 跑在內網 build agent，CI pipeline 透過 IPC 呼叫做 PR 審查 / 測試生成；不用每次都 spin up CLI。",
     d:[
       {h:"為什麼有用", p:"原本要呼叫 Codex 都要 spawn 一個新 process（慢、要重新 auth）。<code>codex exec-server</code> 變成長駐 server，外部以 IPC / WebSocket 呼叫，秒回。"},
       {h:"啟動 server", c:"bash", b:"# 在內網 build agent 上\ncodex exec-server \\\n  --bind 0.0.0.0:7878 \\\n  --auth-token $CODEX_AUTH_TOKEN \\\n  --sandbox read-only-access"},
       {h:"CI pipeline 呼叫範例", c:"yaml", b:"# .github/workflows/pr-review.yml\n- name: Codex PR review\n  run: |\n    curl -X POST http://build-agent.internal/codex \\\n      -H \"Authorization: Bearer $TOKEN\" \\\n      -d '{\"prompt\":\"review PR #${{ github.event.number }}\"}'"},
       {h:"和 Claude /ultrareview 的差別", l:["<b>Claude /ultrareview</b>：適合「在我桌機上跑 4 個視角」","<b>codex exec-server</b>：適合「CI / 內網長駐共用」","可以兩個都用 — 桌機跑 Claude、CI 跑 Codex"]}
     ]},
    {ico:"shield", color:"red", feat:"Windows Proxy-only Sandbox", ver:"0.118.0 · 2026-03-31",
     desc:"Windows 在 OS 層強制只能透過 proxy 出網。",
     scen:"<b>銀行合規場景：</b>RD 工作機常被要求所有出網都要走 proxy 並記錄。Codex CLI 在這環境直接合規，不用額外封裝。",
     d:[
       {h:"為什麼對銀行 RD 重要", p:"銀行內部規定所有出網要走 proxy 並記錄。Codex CLI 在 Windows OS 層強制 proxy-only egress — 不需要再用第三方軟體封裝，直接合規。"},
       {h:"設定方式", c:"bash", b:"# PowerShell\n$env:CODEX_PROXY = \"http://proxy.internal.local:8080\"\n$env:CODEX_SANDBOX_NETWORK = \"proxy-only\"\n\ncodex"},
       {h:"和 Mac 比較", l:["Mac 沒有 OS 層強制 — 但可靠 <code>requirements.toml</code> 限制 domain","Windows 是 OS 層 — 連 Codex spawn 的子程序都受限","建議：Windows 工作機開 proxy-only，Mac 用 deniedDomains 補強"]},
       {h:"資安團隊 sign-off 要點", l:["所有對外 request 經 proxy 留 log","違規連線在 OS 層被拒，Codex 自身無法繞過","可搭配 <code>requirements.toml</code> 白名單 domain"]}
     ]},
    {ico:"antenna", color:"teal", feat:"Realtime V2 串流", ver:"0.120.0 · 2026-04-11",
     desc:"背景 agent 進度即時串流，可 queue 後續 response。",
     scen:"<b>iOS / 後端整合場景：</b>讓 Codex 跑長任務（重構整個 networking layer），在 terminal 看著它推進度，需要插話直接 queue 下一個指示。",
     d:[
       {h:"為什麼有用", p:"原本長任務只能盯著 spinner 等。V2 把背景 agent 的「下一步在做什麼」即時串流出來，且支援 queue：你看到他要做 A 但你想他做 B 時，直接打字排到下一個 turn。"},
       {h:"iOS 場景：重構 networking", c:"bash", b:"$ codex \"重構整個 NetworkLayer 改用 async/await\"\n\n[bg-agent] 讀 NetworkLayer/Endpoint.swift...\n[bg-agent] 偵測到 12 個 callback-based call site\n> 把單元測試也一起改\n[queued] OK 等當前 turn 完再處理"},
       {h:"觀察 hook 活動", c:"bash", b:"# 在 TUI 中按 h 切到 hook 活動視圖\n# 看到所有 hook 觸發的時間軸\n# 對 debug 自製 hook 超有用"},
       {h:"和 Codex App 的差別", p:"App 偏向互動式對話、CLI Realtime V2 偏向「啟動 → 看著它工作」。長任務優先選 CLI。"}
     ]},
    {ico:"mic", color:"purple", feat:"Realtime Voice v2 WebRTC", ver:"0.119.0 · 2026-04-10",
     desc:"預設 v2 WebRTC 的語音 session。",
     scen:"<b>Pair programming 場景：</b>iPad 或耳機接 codex CLI，邊喝咖啡邊跟它對話：「跑 unit test」「把這支函式加 logging」。手不離鍵盤但能 multitask。",
     d:[
       {h:"為什麼有趣", p:"v2 WebRTC 延遲低、音質穩。對 iOS RD 來說：通勤、走路、洗碗時都可以「跟 Codex 對話寫 code」。"},
       {h:"啟動語音 session", c:"bash", b:"codex --voice\n# 預設用 v2 WebRTC\n\n# 指定耳機輸入裝置\ncodex --voice --audio-in 'AirPods Pro'"},
       {h:"iOS 場景", l:["<b>通勤路上</b>：「幫我跑一下 unit test」「最後 commit 是什麼」","<b>洗碗時</b>：「把這支函式加 debug log」（事先講出函式名）","<b>會議空檔</b>：用 AirPods 跟 Codex 確認某段邏輯是否正確"]},
       {h:"安全提醒", p:"在公司 / 公共場所講 code 要小心 — 客戶資料、API key 不要念出來。建議只在 home 環境用語音。"}
     ]},
    {ico:"flask", color:"gold", feat:"js_repl 持久 Runtime", ver:"0.100.0 · 2026-02-12",
     desc:"Codex 內建 JS REPL，跨 turn 保留狀態。",
     scen:"<b>原型驗證場景：</b>iOS RD 偶爾要驗 backend JSON / API 行為，直接在 Codex 內 js_repl 跑 fetch 測試，不用切 Postman。",
     d:[
       {h:"為什麼有用", p:"iOS RD 偶爾要驗 backend / Web 端的 JSON、API 行為。原本要切 Postman 或寫 .js 檔。js_repl 直接在 Codex 內，跨 turn 保留變數狀態。"},
       {h:"iOS 開發場景", c:"bash", b:"$ codex\n> /js_repl\nrepl> const r = await fetch('https://api.internal/test/transfer', { ... })\nrepl> const data = await r.json()\nrepl> console.log(data.amount)\n# 驗 API 回傳格式對不對"},
       {h:"進階：模擬 Combine pipeline 邏輯", p:"用 RxJS 模擬 Combine 行為，先在 JS 跑通邏輯再翻成 Swift — 比起直接寫 Swift 更快迭代。"},
       {h:"小提醒", l:["js_repl 是實驗性功能，可能 break","狀態跨 turn 保留，但 session 結束就清空","不要拿來跑生產資料"]}
     ]},
    {ico:"gauge", color:"orange", feat:"Steer Mode 預設開啟", ver:"0.98.0 · 2026-02-05",
     desc:"Tab queue 訊息、Enter 立即送，不再實驗性。",
     scen:"<b>長任務場景：</b>請 Codex CLI 分析整個 repo，邊跑邊 Tab 預先送下一步「跑完幫我寫 changelog」「再幫我列 TODO」。Pipeline 思維。",
     d:[
       {h:"為什麼有用", p:"Tab 鍵把訊息排隊、Enter 立即送。長任務跑著時，你可以預先把下一步、下下一步排好，pipeline 思維。"},
       {h:"操作差異", l:["<b>Enter</b>：立刻打斷當前 turn 並送","<b>Tab</b>：排隊到 queue 尾","<b>Ctrl+G</b>：清空 queue","<b>Ctrl+E</b>：編輯 queue"]},
       {h:"iOS 場景", c:"bash", b:"$ codex \"分析整個 repo 的 SwiftConcurrency 使用\"\n\n[正在分析...]\n[Tab] 跑完幫我列 5 個改善建議\n[Tab] 再幫我把第一個改善開 PR\n[Tab] PR 標題用 [iOS][refactor] 格式\n# 三個指令排好，agent 跑完一個自動接下一個"},
       {h:"什麼時候別用", p:"探索性對話（不確定下一步問什麼）就別預排 — 用普通互動模式比較自然。"}
     ]},
    {ico:"key", color:"red", feat:"ReadOnlyAccess Sandbox Policy", ver:"0.100.0 · 2026-02-12",
     desc:"新 sandbox policy，僅讀取不寫入。",
     scen:"<b>銀行 read-only 探索：</b>叫 Codex 分析線上 incident log、DB dump、舊版 codebase 時用此模式，避免任何 mutation 風險。",
     d:[
       {h:"為什麼對銀行有用", p:"分析線上 incident log、prod DB dump、舊版 codebase 時，最怕 Codex 不小心 write / mutate。ReadOnlyAccess 從 sandbox 層保證「絕對不會寫」。"},
       {h:"啟用方式", c:"bash", b:"codex --sandbox read-only-access\n\n# 或寫進 ~/.codex/config.toml\n[sandbox]\npolicy = \"read-only-access\""},
       {h:"哪些操作會被擋", l:["所有檔案寫入（Edit、Write、touch、>）","git commit / push / reset","mv / cp 到非 /tmp 路徑","Bash 中的 rm、unlink"]},
       {h:"和 deniedDomains 搭配", p:"分析 prod log 時通常也不該出網。<code>read-only-access</code> + <code>requirements.toml</code> 白名單 domain 一起用，雙重保險。"}
     ]},
    {ico:"chart", color:"green", feat:"/statusline + 排序 resume picker", ver:"0.99.0 · 2026-02-11",
     desc:"TUI 底部 statusline、resume picker 可排序。",
     scen:"<b>多專案 iOS 工作流：</b>同時跑 main app、watch app、widget，statusline 顯示哪個 session、哪個 branch；resume 按時間 / 大小排序找回上下文超快。",
     d:[
       {h:"為什麼對多專案 RD 有用", p:"iOS RD 常同時跑 main app、watch app、widget extension、internal tools。Statusline 顯示當前 session 的關鍵 context；resume picker 可以按時間 / 大小排序快速找回。"},
       {h:"設定 statusline", c:"toml", b:"# ~/.codex/config.toml\n[statusline]\nformat = \"{project} · {branch} · {model} · {tokens_used}/{tokens_limit}\"\nrefresh_ms = 3000"},
       {h:"resume picker 操作", l:["<code>/resume</code> 不帶參數 → 開 picker","按 <code>s</code> 切排序：時間 / 大小 / 專案","按 <code>/</code> 模糊搜尋","Enter 載入 session"]},
       {h:"小技巧", p:"把 session title 設成 <code>[ios-app/feature/transfer-flow] sprint 42</code> 這種結構化字串，picker 篩起來很快。"}
     ]},
    {ico:"loop", color:"blue", feat:"並行 Shell + Active Turn", ver:"0.99.0 · 2026-02-11",
     desc:"直接 shell 指令可與 active agent turn 並行執行。",
     scen:"<b>iOS 開發效率：</b>Codex 在重構時，你同時 <code>xcodebuild test</code>、<code>swift test</code>、<code>git status</code>。雙線推進不必等。",
     d:[
       {h:"為什麼有用", p:"以前 Codex 跑時 TUI 卡住等不能下其他指令。現在背景 turn 在跑，你可以直接 <code>git status</code>、<code>xcodebuild</code>、<code>swift test</code>。雙線推進。"},
       {h:"iOS 場景", c:"bash", b:"$ codex \"重構 PaymentManager 加入 retry 邏輯\"\n\n[turn running...]\n# 在同一個 TUI 視窗按 ! 切到 shell mode\n!$ xcodebuild test -scheme Main\n!$ git diff --stat\n!$ swift package outdated\n# 全部能跑，turn 也持續推進"},
       {h:"並發限制", l:["<b>Shell 指令</b>：可任意並行","<b>Codex turn</b>：仍然一次一個","<b>git</b>：避免同時改 working tree（會衝突）"]},
       {h:"小技巧", p:"配合 Steer Mode：shell 看到問題 → Tab 排個指令給 Codex 修。把 Codex 變成「會自動接 PR」的隊友。"}
     ]}
  ];

  /* ===========================
     ROLE TAGGING (post-hoc)
     =========================== */
  // Tag existing cards by `feat` substring → roles array.
  const ROLE_TAGS_CC = {
    "/ultrareview": ["ios","android","backend","qa"],
    "Hooks 條件式": ["ios","android","backend"],
    "/recap": ["ios","android","backend","qa","pm","designer"],
    "Plugin 可內附": ["ios","android","backend"],
    "Sandbox + 子程序": ["ios","android","backend","qa"],
    "/team-onboarding": ["ios","android","backend","qa","pm","designer"],
    "CwdChanged": ["ios","android","backend"],
    "Forked Subagents": ["ios","android","backend","qa","pm"],
    "Status Line": ["ios","android","backend","qa"],
    "排程任務": ["ios","android","backend","qa","pm"],
    "Skills 用": ["ios","android","backend"],
    "/resume 用 PR URL": ["ios","android","backend"]
  };
  const ROLE_TAGS_CA = {
    "對話 Forking": ["ios","android","backend","designer"],
    "Mid-turn Steering": ["ios","android","backend","designer"],
    "GPT-5.3-Codex-Spark": ["ios","android","backend"],
    "VS Code / Cursor": ["ios","android","backend"],
    "附加任意檔案類型": ["ios","android","backend","qa","pm","designer"],
    "Floating Pop-out": ["ios","android","backend","qa","pm","designer"]
  };
  const ROLE_TAGS_CI = {
    "codex exec-server": ["backend","qa"],
    "Windows Proxy-only": ["ios","android","backend","qa"],
    "Realtime V2 串流": ["ios","android","backend","qa"],
    "Realtime Voice": ["ios","android","backend"],
    "js_repl": ["backend"],
    "Steer Mode": ["ios","android","backend","qa"],
    "ReadOnlyAccess": ["backend","qa"],
    "/statusline": ["ios","android","backend","qa"],
    "並行 Shell": ["ios","android","backend"]
  };
  function tagRoles(arr, table){
    arr.forEach(c => {
      if (c.roles) return;
      for (const key of Object.keys(table)) {
        if (c.feat.includes(key)) { c.roles = table[key]; return; }
      }
      c.roles = ["ios","android","backend","qa","pm","designer"]; // default all
    });
  }
  tagRoles(INSP_CC, ROLE_TAGS_CC);
  tagRoles(INSP_CA, ROLE_TAGS_CA);
  tagRoles(INSP_CI, ROLE_TAGS_CI);

  /* ===========================
     NEW ROLE-SPECIFIC CARDS
     =========================== */
  // Android RD
  INSP_CC.push({
    ico:"box", color:"green", feat:"FileChanged hook 自動跑 Gradle sync", ver:"v2.1.83 · 2026-03-25",
    desc:"Android 改 build.gradle 後常忘記 Sync，跑出來才發現 dependency 不對。Hook 解決。",
    scen:"<b>Android 場景：</b>儲存 <code>build.gradle.kts</code> 自動跑 <code>./gradlew --refresh-dependencies</code>，不再有「我 code 對啊為什麼跑不起來」。",
    roles:["android"],
    d:[
      {h:"為什麼有用", p:"Android Studio 的 Gradle Sync 觸發時機常常不一致，build 完才發現 dependency 沒同步。用 FileChanged hook 把同步自動化。"},
      {h:"設定", c:"json", b:"// .claude/hooks/auto-gradle-sync.json\n{\n  \"event\": \"FileChanged\",\n  \"if\": \"FilePattern(**/build.gradle.kts) || FilePattern(libs.versions.toml)\",\n  \"action\": {\n    \"run\": \"./gradlew --refresh-dependencies dependencies\"\n  }\n}"},
      {h:"延伸應用", l:["改 <code>AndroidManifest.xml</code> → 跑 lint","切到 release branch → 自動跑 <code>./gradlew bundleRelease</code> dry-run","新增 string 資源 → 跑 <code>./gradlew generateLocaleConfig</code>"]}
    ]
  });
  INSP_CC.push({
    ico:"palette", color:"purple", feat:"Compose Preview 用 Spark 迭代", ver:"GPT-5.3-Codex-Spark · 2026-02-12",
    desc:"Jetpack Compose 預覽 + Codex Spark 的快速 streaming 是黃金組合。",
    scen:"<b>Android UI 場景：</b>Spark 速度 >1000 tok/s，配合 Compose Preview 改一個 modifier 立刻看效果。比起 5.3-Codex 在 UI 微調上快很多。",
    roles:["android","designer"],
    d:[
      {h:"為什麼有用", p:"Compose Preview 的迭代節奏跟 SwiftUI 預覽類似，需要快速 try-and-see。Spark 的高速 streaming 對「短改動」特別有感。"},
      {h:"設定", c:"bash", b:"# Cursor / VS Code\ncodex --model gpt-5.3-codex-spark\n\n# 然後在 Composable 上方加註解：\n# @Preview(name = \"App 主題\", showBackground = true)\n# @Composable\n# fun TransferCardPreview() { ... }"},
      {h:"什麼時候切回 5.3-Codex", p:"複雜的 State / ViewModel 重構、跨檔案的 Compose 架構改動還是要深度推理，切回 5.3-Codex。"}
    ]
  });

  // Designer (UI/UX)
  INSP_CA.push({
    ico:"image", color:"teal", feat:"Figma 截圖 → SwiftUI / Compose code", ver:"v260205 · 2026-02-05",
    desc:"設計師最常做的事：把 design spec 變成 code 給 RD 參考。",
    scen:"<b>Designer 場景：</b>把 Figma 截圖拖進 Codex App，「實作這個交易明細卡片」→ Codex 產 SwiftUI/Compose code + 像素位置註解。直接貼進 RD spec 文件當參考實作。",
    roles:["designer"],
    d:[
      {h:"為什麼對 Designer 有用", p:"以前設計師交付 spec 只能寫文字描述。現在可以「順便」產一份參考實作給 RD，溝通效率提升、減少實作偏差。"},
      {h:"操作流程", l:["Figma 中選中要轉換的 frame，<code>Cmd+Shift+C</code> 截圖","拖進 Codex App","Prompt：「請用 SwiftUI（iOS）和 Jetpack Compose（Android）兩種版本實作，並標註關鍵尺寸」","複製貼進 spec 文件"]},
      {h:"進階技巧", l:["指定設計系統：「使用 Design Token」","指定 accessibility：「VoiceOver / TalkBack 標籤要齊全」","要求多狀態：「請含 default / pressed / disabled」"]}
    ]
  });
  INSP_CC.push({
    ico:"palette", color:"gold", feat:"Skills 產生 Design Token 程式碼", ver:"v2.1.120 · 2026-04-28",
    desc:"設計師更新色票後，由 Skill 自動產 Swift / Kotlin / Web 多平台 Token 檔。",
    scen:"<b>Designer 場景：</b>更新 Figma colors 後，跑 <code>/design-tokens</code>，Skill 讀 Figma export → 產三個平台的 Token 檔給 RD。",
    roles:["designer","ios","android"],
    d:[
      {h:"為什麼有用", p:"設計系統最痛的是「色票改了，三個平台沒同步」。把 Token 轉檔做成 Skill，設計師自己就能驅動。"},
      {h:"Skill 範例", c:"yaml", b:"# .claude/skills/design-tokens.md\n---\nname: design-tokens\ndescription: 從 Figma export JSON 產出 iOS/Android/Web 三平台 Design Token\n---\n讀取 design-tokens.json（從 Figma Tokens plugin export）\n產出：\n  - iOS/AppColors.swift（Color extension）\n  - android/AppColors.kt（Compose Color object）\n  - web/_tokens.scss\n命名遵循團隊規則：brand500、neutral100 等"},
      {h:"設計師工作流", l:["Figma → Tokens plugin → Export JSON","Drop JSON 進 Claude → <code>/design-tokens</code>","Skill 產三個檔 → 提交 PR","RD 收到 PR → review → merge"]}
    ]
  });

  // QA / Tester
  INSP_CC.push({
    ico:"flask", color:"green", feat:"Skills 自動產 Test Case", ver:"v2.1.120 · 2026-04-28",
    desc:"PRD 變動後最痛苦的就是補 test case。Skill 把這變成半自動。",
    scen:"<b>QA 場景：</b>把 PRD 段落貼進 Claude，跑 <code>/test-cases</code>，Skill 用 Given-When-Then 格式產出 happy path / edge case / negative case 三組。",
    roles:["qa"],
    d:[
      {h:"為什麼對 QA 有用", p:"傳統流程要靠 QA 一條條手寫 test case。Skill 自動產出後 QA 改成審核者角色，效率大幅提升。"},
      {h:"Skill 範例", c:"yaml", b:"# .claude/skills/test-cases.md\n---\nname: test-cases\ndescription: 從 PRD 段落產出 Given-When-Then 格式 test case\n---\n步驟：\n1. 讀 user input PRD 段落\n2. 識別 actor、action、expected outcome\n3. 產出三組 case：\n   - Happy path（正常流程）\n   - Edge cases（邊界值、空值、極端輸入）\n   - Negative cases（錯誤輸入、權限不足、網路失敗）\n4. 每個 case 用 Given-When-Then 格式\n5. 標註對應的 acceptance criteria"},
      {h:"進階：跨平台同步", p:"產出時可指定平台（iOS/Android/Web），Skill 會用對應 UI 操作詞彙（tap / click / long-press）。"}
    ]
  });
  INSP_CC.push({
    ico:"clock", color:"red", feat:"排程：每晚 smoke test + 結果報告", ver:"v2.1.98 · 2026-04-09",
    desc:"用 Claude 排程跑 smoke test，早上 QA 上工就看報告。",
    scen:"<b>QA 場景：</b>每晚 23:00 對 staging 跑 critical path test，把失敗報告 + 截圖整理成 Slack 訊息，早上開電腦就看到。不再需要手動跑 baseline。",
    roles:["qa"],
    d:[
      {h:"為什麼有用", p:"Nightly smoke test 過去靠 CI cron job，但寫報告整理常常是隔天才有人看。Claude 排程任務可以順手把結果包成可讀的摘要。"},
      {h:"排程設定", c:"yaml", b:"# .claude/scheduled/nightly-smoke.md\n---\ncron: 0 23 * * *    # 每晚 23:00\n---\n步驟：\n1. cd ios && fastlane scan --testplan SmokeTests\n2. cd android && ./gradlew smokeTest\n3. 整理失敗 case：失敗測試名、stack trace、相關 commit\n4. 用 /recap 產出每日報告\n5. 發到 Slack #qa-nightly 頻道（用 MCP slack）"},
      {h:"小技巧", l:["失敗閾值：>3 個 critical fail 就 @通知 RD on-call","趨勢追蹤：把每晚結果寫 JSON，週末產週報","截圖：失敗時自動截圖存 S3 給 RD 看"]}
    ]
  });
  INSP_CI.push({
    ico:"scope", color:"red", feat:"ReadOnlyAccess 分析 Incident Log", ver:"0.100.0 · 2026-02-12",
    desc:"處理線上 incident 時最怕 AI 不小心改到 prod data。",
    scen:"<b>QA 場景：</b>把 incident log dump 給 Codex，用 <code>--sandbox read-only-access</code>，叫它分析 root cause、找相似歷史 incident — 完全沒寫入風險。",
    roles:["qa","backend"],
    d:[
      {h:"為什麼對 QA 有用", p:"分析 incident 時通常要看大量 log、historical data、code path。ReadOnlyAccess 保證 AI 絕對只讀，連 git status 都不會動，可放心餵 production data。"},
      {h:"操作", c:"bash", b:"# 1. 拉 incident 期間的 log\nkubectl logs deployment/api --since=2h > /tmp/incident.log\n\n# 2. 啟動 read-only Codex\ncodex --sandbox read-only-access \\\n  \"分析 /tmp/incident.log，找出 root cause 與相似的歷史 incident\"\n\n# 3. Codex 不能寫檔、不能 commit、不能 push\n# 但可以 grep、cat、檢視 git history"},
      {h:"配合 deniedDomains", p:"如果 incident 涉及客戶資料，再加 <code>deniedDomains: [\"*\"]</code> 切斷網路 — 雙重保險。"}
    ]
  });

  // Backend RD
  INSP_CI.push({
    ico:"rocket", color:"blue", feat:"exec-server 嵌入 CI/CD Pipeline", ver:"0.119.0 · 2026-04-10",
    desc:"把 Codex 變成 CI 上的長駐 service，PR 自動 review 不用 spin-up。",
    scen:"<b>Backend 場景：</b>內網 build agent 跑 <code>codex exec-server</code>，GitLab CI 收到 PR 時 curl 一下，三十秒回 review。比啟動新 process 快 10 倍。",
    roles:["backend"],
    d:[
      {h:"為什麼對 Backend 有用", p:"後端 CI 跑 review 的瓶頸是「每次都要重新 spawn Codex process + auth」。exec-server 預先 warm-up，CI job 來就秒回。"},
      {h:"GitLab CI 範例", c:"yaml", b:"# .gitlab-ci.yml\nreview:\n  stage: review\n  script:\n    - |\n      curl -X POST http://codex-server.internal:7878/api/v1/exec \\\n        -H \"Authorization: Bearer $CODEX_TOKEN\" \\\n        -d '{\n          \"prompt\": \"請 review 這個 PR：$CI_MERGE_REQUEST_PROJECT_URL/-/merge_requests/$CI_MERGE_REQUEST_IID\",\n          \"sandbox\": \"read-only-access\"\n        }'\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\""},
      {h:"和 Claude /ultrareview 的搭配", l:["桌機端用 Claude /ultrareview 跑深度多視角","CI 端用 codex exec-server 跑快速 gate review","兩者 review 對齊（用同一份 review checklist skill）"]}
    ]
  });
  INSP_CC.push({
    ico:"db", color:"blue", feat:"MCP 接公司內部 DB / API", ver:"v2.1.121 · 2026-04-28",
    desc:"用 MCP 把內網 DB、API gateway 接進 Claude，agent 可以查資料解 bug。",
    scen:"<b>Backend 場景：</b>寫一個 internal MCP server，包 Postgres read-only 連線、API gateway 查詢。Claude 解 ticket 時直接 query 確認資料、找 root cause。",
    roles:["backend"],
    d:[
      {h:"為什麼有用", p:"Backend 解 bug 常常要切 terminal 跑 psql 或 curl。把這些變成 MCP tool，Claude 可以自己查、自己驗證假設。"},
      {h:"MCP server 結構", c:"json", b:"// .claude/mcp/internal.json\n{\n  \"command\": \"node\",\n  \"args\": [\"./scripts/mcp-server.js\"],\n  \"alwaysLoad\": true,\n  \"env\": {\n    \"DB_READ_ONLY_URL\": \"$DB_READ_ONLY_URL\"\n  }\n}"},
      {h:"工具範例", l:["<code>db_query</code>：read-only SQL 查詢","<code>api_inspect</code>：對內部 API 發 GET 看 response","<code>trace_lookup</code>：用 trace_id 查 distributed tracing","<code>config_get</code>：查 LaunchDarkly feature flag 狀態"]},
      {h:"安全提醒", l:["DB 一定要 read-only role","API 限制 staging / dev 環境","所有查詢進 audit log","plug ENV scrub 防止 token 漏出"]}
    ]
  });

  // PM
  INSP_CC.push({
    ico:"calendar", color:"gold", feat:"Subagent + Jira MCP 做 Sprint Planning", ver:"v2.1.117 · 2026-04-22",
    desc:"Sprint Planner agent 只連 Jira / Confluence，專注故事點估算與依賴分析。",
    scen:"<b>PM 場景：</b>定義專屬 agent <code>sprint-planner</code>，連 Jira MCP 自動拉 backlog、分析依賴、產出可投票的 sprint plan，省下 1-2 小時會議準備時間。",
    roles:["pm"],
    d:[
      {h:"為什麼對 PM 有用", p:"Sprint Planning 最花時間的是「整理 backlog 狀態、找依賴」。讓 agent 先做這部分，會議上直接審核就好。"},
      {h:"Agent 定義", c:"yaml", b:"# .claude/agents/sprint-planner.md\n---\nname: sprint-planner\nmcpServers:\n  - jira\n  - confluence\n---\n你是 iOS Scrum Team 的 Sprint Planner。\n\n任務：\n1. 從 Jira 拉 backlog 前 30 個 ticket\n2. 識別跨 ticket 依賴（label \"depends-on\"）\n3. 估算故事點（基於歷史相似 ticket）\n4. 分組成可投票的 sprint candidates\n5. 標註風險：規格不清、跨團隊依賴、技術未知\n\n禁止：直接修改 Jira 狀態（你是建議者，不是執行者）"},
      {h:"PM 工作流", l:["週一早上 <code>claude --agent sprint-planner /plan-next-sprint</code>","Review 產出的 sprint candidates","跟 RD lead 確認故事點","會議上直接投票，不再「現場才開始想」"]}
    ]
  });
  INSP_CC.push({
    ico:"doc", color:"green", feat:"/recap 產 Stakeholder Update", ver:"v2.1.108 · 2026-04-14",
    desc:"PM 每週要對 stakeholder 報告進度，最痛是「整理進度」這件事本身。",
    scen:"<b>PM 場景：</b>每週五跑 <code>/recap --target=stakeholder</code>，自動把這週 commit + Jira 狀態變動 + Slack 討論摘要，產出可貼進 email 的高階摘要。",
    roles:["pm"],
    d:[
      {h:"為什麼有用", p:"<code>/recap</code> 原本是技術導向摘要。配合 audience flag 可以產出不同層次的摘要 — stakeholder 看 outcome、RD 看 technical detail。"},
      {h:"設定", c:"bash", b:"# 每週五 17:00 自動跑\nclaude --schedule \"0 17 * * 5\" \\\n  /recap --target=stakeholder \\\n  --output=docs/weekly/$(date +%Y-W%V).md"},
      {h:"產出內容範例", l:["<b>本週交付</b>：完成 3 個 feature、修 5 個 bug","<b>進度</b>：Sprint 進度 80%、blocker 1 個","<b>風險</b>：依賴 X 團隊 API，預計延後 3 天","<b>下週重點</b>：UAT 啟動、效能測試"]},
      {h:"小技巧", p:"產出的 markdown 可直接貼進 Confluence 或 email。配合 Confluence MCP 還能自動同步到內部 wiki。"}
    ]
  });
  // === Auto-generated cards (from scheduled refresh) ===
  INSP_CC.push({
    ico:"eye", color:"purple", feat:"Agent View — 一個畫面看所有 sessions", ver:"v2.1.139 · 2026-05-11",
    desc:"<code>claude agents</code> 開啟 Research Preview 視圖，看所有執行中、待回應、完工的 Claude session。",
    scen:"<b>場景：</b>同時跑 main app、watch app、widget、internal tools 重構時，不再要切多個 tmux 視窗。一畫面看哪個 session 在等你回話、哪個跑完可以 review、哪個還在跑。",
    roles:["ios","android","backend"],
    d:[
      {h:"為什麼有用", p:"多 session 工作流的痛點是「我現在有幾個 Claude 在跑」「哪個需要我關心」。Agent View 把這個盲點解決。"},
      {h:"操作", c:"bash", b:"# 開啟 Agent View（Research Preview）\nclaude agents\n\n# JSON 輸出供 tmux / status bar 整合\nclaude agents --json\n\n# 從 view 內 dispatch 新 session：按 d → 補全 slash 指令 / skills"},
      {h:"iOS 場景搭配", l:["跑 <code>/code-review</code> 在 PR 上，切到別的 session 開新 feature","Agent View 通知 review 跑完可回去看","跨 worktree 一目了然，避免改錯分支"]}
    ],
    auto:true
  });
  INSP_CA.push({
    ico:"desktop", color:"orange", feat:"Codex 變通用工作空間：In-app Browser + Computer Use", ver:"2026-04-16",
    desc:"Codex App 大改版：內建瀏覽器（可對渲染頁面留言）、操作 macOS 原生 App、artifact viewer 預覽 PDF/試算表/簡報、Memories、多視窗、多終端機。",
    scen:"<b>場景：</b>用 in-app browser 開內部 admin 系統，邊操作邊讓 Codex 觀察並建議改進；artifact viewer 可直接預覽從 backend 撈出來的 Excel report，不用切到 Numbers 或瀏覽器。讓 Codex App 從「對話介面」變成「整個工作環境」。",
    roles:["ios","android","backend","designer","qa","pm"],
    d:[
      {h:"為什麼是重大更新", p:"這次不只是加功能 — Codex App 從「聊天框」升級為「通用工作空間」。In-app browser、Computer Use、artifact viewer、Memories 加在一起，讓你不必離開 Codex 就能完成大部分桌面工作。"},
      {h:"關鍵新功能", l:["<b>In-app browser</b>：在 Codex 內開網頁，可對渲染後的頁面留言、追蹤改動","<b>Computer Use（macOS）</b>：Codex 看得到、點得了、輸入到任何 macOS App","<b>Chats</b>：不必先選資料夾即可開新對話","<b>Thread automations</b>：把對話流程變成可重複執行的 automation","<b>Artifact viewer</b>：預覽 PDF、試算表、簡報，不用切外部工具","<b>Memories</b>：跨 thread 記住偏好與 context"]},
      {h:"iOS RD 場景", l:["<b>Spec 對照寫 code</b>：In-app browser 開 Confluence spec，旁邊讓 Codex 寫 SwiftUI 實作","<b>Bug 重現</b>：用 Computer Use 操作模擬器示範 bug，Codex 看著找 root cause","<b>QA report 速覽</b>：QA 上傳的 Excel test result 直接用 artifact viewer 預覽"]},
      {h:"EEA/UK/瑞士例外", p:"Computer Use 在歐盟/英國/瑞士暫不提供。台灣可用。"}
    ],
    auto:true
  });

  INSP_CA.push({
    ico:"mobile", color:"teal", feat:"ChatGPT 手機 app 連到你的 Mac Codex", ver:"2026-05-14",
    desc:"<b>手機 app 連你執行中的 Mac Codex</b>，共用同一份專案、檔案、認證、plugins、skills、設定。Hooks 同步 GA。",
    scen:"<b>場景：</b>會議空檔在手機接手 sprint 任務 — 「Codex，看一下 #PR-1234 並寫 review summary」「跑一下 SwiftLint 看 warning」。Mac 上的 Cowork 環境一致，不需切上下文。",
    roles:["ios","android","backend","pm"],
    d:[
      {h:"為什麼有趣", p:"桌面開發者最大的痛是「離開電腦就斷線」。手機 app 連 Mac host 讓你可在通勤、會議空檔接手任務，且環境完全一致（同 skills、同 plugins、同認證）。"},
      {h:"設定", c:"bash", b:"# 1. Mac 上開 Codex host mode（會給一條配對 QR）\n# 2. iPhone 開 ChatGPT app → 設定 → 連結 Codex Mac\n# 3. 掃 QR 即配對成功\n# 之後任何 ChatGPT 對話都能引用 Mac 上的 codex 環境"},
      {h:"搭配 Hooks GA", l:["Hooks 從 beta 升 GA — 可放心在生產環境用","Codex access tokens：寫 CI 整合不用每次重 auth","Enterprise admin setup 指引：方便 IT 部署到全行"]}
    ],
    auto:true
  });

  INSP_CC.push({
    ico:"chart", color:"blue", feat:"排程 + MCP：自動產 Roadmap 進度", ver:"v2.1.98 · 2026-04-09",
    desc:"自動拉 Jira / GitHub / Confluence 資料拼成可視化 roadmap。",
    scen:"<b>PM 場景：</b>每週一早上自動跑「拉 Jira epics、抓 GitHub milestone、合成 roadmap」並更新 Confluence 頁面，PM 上工就看到最新狀態。",
    roles:["pm"],
    d:[
      {h:"為什麼有用", p:"Roadmap 維護的痛點是「資料散在多處」。把資料收集自動化，PM 專注在策略而非搬運。"},
      {h:"排程設定", c:"yaml", b:"# .claude/scheduled/roadmap-refresh.md\n---\ncron: 0 9 * * 1   # 每週一 09:00\nmcpServers: [jira, github, confluence]\n---\n1. 從 Jira 拉所有 Epic 狀態（fixVersion = current quarter）\n2. 從 GitHub 拉 milestone 進度\n3. 合併為 roadmap：epic / 進度 / 風險 / ETA\n4. Push 到 Confluence: /team/iOS-Roadmap-Q2\n5. 變動超過 20% 進度的 epic → 標紅 + Slack 通知"},
      {h:"配合 Plan Mode", p:"PM 開週會前先跑一次 plan mode 對話：「下個季度該如何排優先順序」，Claude 結合 roadmap + 歷史 velocity 給建議。"}
    ]
  });

  // ====== 2026-05/06 新增的手刻 + auto 卡片 ======

  // === Claude Code 手刻 ===
  INSP_CC.push({
    ico:"bolt", color:"gold", feat:"Opus 4.8 + 動態工作流 /workflows", ver:"v2.1.154 · 2026-05-28",
    desc:"<b>Opus 4.8 釋出</b>，預設 high effort、可開 <code>/effort xhigh</code> 應戰最難任務；<b>動態工作流</b>讓 Claude 在背景同時編排數十到上百個 agent，<code>/workflows</code> 檢視進度。",
    scen:"<b>場景：</b>銀行 APP 的「跨 module migration」「全 repo 安全掃描」「大型 refactor」這類任務，過去要手動拆給多個 RD 跑。現在 <code>/workflows</code> 一句話讓 Claude 編排 50+ subagent 平行處理，Opus 4.8 xhigh 確保品質。",
    roles:["ios","android","backend","qa","pm"],
    d:[
      {h:"為什麼是重大更新", p:"Opus 4.8 是目前最強模型；動態工作流則是新工作模式 — 你描述目標，Claude 自己拆解、編排、執行數十個 subagent。對大規模任務（migration、scan、refactor）效率提升一個數量級。"},
      {h:"基本用法", c:"bash", b:"# 開動態工作流\nclaude\n> 請對整個 iOS repo 跑 SwiftConcurrency 安全掃描，每個 module 一個 agent\n# Claude 自動編排 → /workflows 看進度\n\n# 強化推理：手動切 xhigh\n> /effort xhigh"},
      {h:"iOS 場景", l:["<b>跨 module 重構</b>：交給 Claude 拆 module、每個並行","<b>API spec 大改</b>：每個受影響檔案開一個 subagent","<b>季度資安掃描</b>：每個 feature folder 跑 /security-review"]}
    ]
  });
  INSP_CC.push({
    ico:"search", color:"green", feat:"/code-review（+ --fix 直接套用）", ver:"v2.1.147, 2.1.152 · 2026-05",
    desc:"<b>/simplify 改名為 /code-review</b>，依 effort 等級回報問題；新 <code>--fix</code> 直接套用修改到工作樹；<code>--comment</code> 把意見貼進 PR。",
    scen:"<b>場景：</b>每支 PR 推上去自動跑 <code>/code-review --comment</code>，意見直接貼到 GitLab PR；reviewer 不再做「找小問題」。<code>--fix</code> 可選擇性套用安全的修補。",
    roles:["ios","android","backend"],
    d:[
      {h:"為什麼有用", p:"原本的 /simplify 比較窄；/code-review 是完整 review 工具，配 --fix 與 --comment 兩個 flag 就能整套自動化進 CI。"},
      {h:"PR webhook 整合", c:"bash", b:"# GitLab CI / GitHub Actions\nclaude /code-review HEAD~1..HEAD \\\n  --effort high \\\n  --comment $PR_URL\n\n# Review + 自動修補（謹慎用）\nclaude /code-review HEAD --fix --effort medium"},
      {h:"和 /ultrareview 的分工", l:["<b>/code-review</b>：單 agent 跑完整 review，速度快","<b>/ultrareview</b>：多 agent 平行多視角（安全/效能/Style），最深","建議：PR 自動跑 /code-review；merge 前重要 PR 跑 /ultrareview"]}
    ]
  });

  // === Codex App 手刻 ===
  INSP_CA.push({
    ico:"cursor", color:"purple", feat:"Windows Computer Use + Mobile Remote Control", ver:"2026-05-28",
    desc:"<b>Computer Use 登陸 Windows</b>：Codex 看得到、點得了、能輸入到 Windows 原生 App。<b>Mobile remote control</b> 也支援 Windows 主機 — 從 ChatGPT iOS/Android 啟動並追蹤 Windows 工作。",
    scen:"<b>場景：</b>銀行內部很多 Windows-only 系統（Outlook、Office、內部 CRM）。讓 Codex 自動填表、跨 App 搬資料；QA 跨平台測試；通勤時用手機看 Windows 主機在跑什麼。",
    roles:["ios","android","backend","qa"],
    d:[
      {h:"為什麼對銀行有用", p:"銀行內部系統多是 Windows-only — Outlook、ServiceNow、行內 CRM。Computer Use 讓 Codex 可自動化這些原本「不能 API 化」的流程。"},
      {h:"設定", c:"bash", b:"# 1. Windows 上開 Codex App、啟用 Computer Use（設定 → 進階）\n# 2. ChatGPT 手機 app 配對：QR scan\n# 3. 手機隨時送指令：「打開 Outlook，寄這個 review summary」\n# 4. Codex 在 Windows 替你操作"},
      {h:"iOS RD 場景", l:["銀行 Windows-only 工具：用 Codex 搬資料","QA：跨平台測試（同一支 Codex 跑 Mac + Windows）","通勤：手機監看 Windows 上的 batch script"]},
      {h:"歐盟例外", p:"Computer Use 在 EEA/UK/瑞士暫不提供。台灣可用。"}
    ]
  });
  INSP_CA.push({
    ico:"window", color:"blue", feat:"Codex App for Windows 正式版", ver:"2026-03-04",
    desc:"Codex App 原生 Windows 版本，用 <b>PowerShell + 原生 Windows sandbox</b> 提供受限權限，無需 WSL/VM。支援 Skills、Automations、Worktrees。",
    scen:"<b>場景：</b>銀行 RD 多數用 Windows 開發機。Codex App 原生版讓你不必架 WSL 環境也能用，sandbox 又符合資安要求。一份 ChatGPT 帳號跨 Mac + Windows 共用。",
    roles:["android","backend","qa","pm"],
    d:[
      {h:"為什麼重要", p:"以前 Windows 上要跑 Codex 得透過 WSL 或 VM，效能、相容性都打折。原生 Windows 版用 PowerShell 與 OS 層 sandbox，全部原生，安裝走 Microsoft Store。"},
      {h:"安裝步驟", l:["從 Microsoft Store 搜尋「Codex」","以 ChatGPT 帳號（或 API key）登入","設定 → 偏好的 agent 與 terminal（PowerShell / WSL）","Skills、Automations、Worktrees 全部支援"]},
      {h:"和 Mac 版差異", p:"功能對等。Windows 版多了：原生 MSIX updater、Windows Store 自動更新、Windows 系統匣常駐。WSL 支援者可切換 agent 進 WSL。"}
    ]
  });

  // === Codex CLI 手刻 ===
  INSP_CI.push({
    ico:"pulse", color:"red", feat:"codex doctor — 全面環境診斷", ver:"0.131.0 · 2026-05-18",
    desc:"<code>codex doctor</code> 一鍵跑全套診斷：runtime、auth、terminal、network、config、local state。新人 onboarding 或環境出問題第一個跑的指令。",
    scen:"<b>場景：</b>新進 RD 第一天裝 Codex，跑 <code>codex doctor</code> 自動檢查所有相依、認證、proxy、sandbox 狀態，產出 report 給 mentor 看哪邊還沒設好。debug 環境問題從幾小時降到幾分鐘。",
    roles:["ios","android","backend","qa"],
    d:[
      {h:"為什麼有用", p:"以前環境出問題要手動逐項檢查：proxy 通嗎？auth 過期了嗎？sandbox 設對了嗎？<code>codex doctor</code> 把這些自動化成一張 health report。"},
      {h:"基本用法", c:"bash", b:"# 跑全套診斷\ncodex doctor\n\n# 輸出範例：\n# ✓ Runtime: codex 0.135.0\n# ✓ Auth: ChatGPT Pro account\n# ✗ Network: proxy.internal.local:8080 unreachable\n# ✓ Sandbox: bwrap 0.10.0 installed\n# ✓ Config: ~/.codex/config.toml valid\n# ✓ Threads: 47 local, 12 paged"},
      {h:"團隊化用法", l:["新人入職 day 1 跑一次，產 report 給 mentor","CI workflow 用 <code>codex doctor --json</code> 驗證 build agent","每月 IT 健檢全團隊跑一次，看誰環境壞了"]}
    ]
  });
  INSP_CI.push({
    ico:"target", color:"green", feat:"Goals 預設開啟 — 跨 turn 持續工作", ver:"0.133.0 · 2026-05-21",
    desc:"Goals 從實驗性升為預設開啟。設一個目標後，Codex 跨 turn 自動推進直到完成（或 usage limit / blocker）。",
    scen:"<b>場景：</b>「把 NetworkLayer 整個改用 async/await」這種大任務設成 goal，Codex 自動拆 PR、跑 test、改 callsite，跨數十個 turn 推進。你只需要 review、回 question、不必每次重述目標。",
    roles:["ios","android","backend"],
    d:[
      {h:"為什麼有用", p:"以前每個 turn 結束你要重提醒「下一步做 X」「記得別忘 Y」。Goals 把目標當持久狀態存著，Codex 自動推進、自動回報進度。"},
      {h:"設目標", c:"bash", b:"$ codex\n> /goal 把 NetworkLayer 整個改用 async/await，所有 call site 一起改，加上 unit test\n\n# Codex 把目標存起來，開始工作\n# 跨 turn 後仍記得目標、追蹤進度\n# /goal status 查進度\n# /goal done 結束"},
      {h:"和 Steer Mode 搭配", p:"Goals 管總方向，Steer Mode（Tab 排隊）管細部指令。組合起來：Goal 設長期目標，Tab 排短期修正，pipeline 思維最大化。"}
    ]
  });

  // === Auto cards（自動生成、可被手改） ===

  INSP_CC.push({
    ico:"target", color:"green", feat:"/goal — 跨 turn 持續推進至完成", ver:"v2.1.139 · 2026-05-11",
    desc:"Claude Code 新 <code>/goal</code> 指令：設一個目標後，Claude 跨 turn 持續工作直到達成。",
    scen:"<b>場景：</b>大型 refactor 或 bug hunt，告訴 Claude「目標：把所有 callback API 改 async/await，含 tests」，Claude 自己一輪一輪做下去，你只在 blocker 時介入。",
    roles:["ios","android","backend"],
    d:[
      {h:"為什麼有用", p:"和 Codex 的 Goals 對應 — Claude 也能跨 turn 自動推進。把「我要 Claude 做什麼」變成持久狀態，不必每次重述。"},
      {h:"用法", c:"bash", b:"claude\n> /goal 全 repo 把 SwiftConcurrency 警告清零\n# Claude 開始：找警告、分類、逐一修\n# 你看 review、補 input、Claude 接著做\n# /goal status 查進度"},
      {h:"小技巧", l:["目標寫得越具體越好（含 acceptance criteria）","可搭配 Agent View 同時跑多個 goal","失敗時自動 /resume 不丟進度"]}
    ],
    auto:true
  });
  INSP_CC.push({
    ico:"ban", color:"red", feat:"Skills/slash frontmatter 加 disallowed-tools", ver:"v2.1.152 · 2026-05-27",
    desc:"Skills 與 slash command frontmatter 可加 <code>disallowed-tools</code> 限制能用的工具，最小權限原則。",
    scen:"<b>場景：</b>合規 skill 禁止用 Bash（不能跑 shell）；review skill 禁止用 Edit/Write（只能讀）。確保不同 skill 各自有適當權限邊界，避免越權操作。",
    roles:["ios","android","backend","qa","pm"],
    d:[
      {h:"為什麼有用", p:"以前所有 skill 共用同一份工具權限。現在每個 skill 可宣告自己不能用什麼，從架構上避免越權。"},
      {h:"範例", c:"yaml", b:"# .claude/skills/compliance-checklist.md\n---\nname: compliance-checklist\ndisallowed-tools: [Bash, Edit, Write]\n---\n你是金融合規檢查員。\n只能讀檔、給建議，禁止執行任何指令或修改檔案。"},
      {h:"和 mcpServers 搭配", l:["<code>mcpServers</code>：限制能連哪些 MCP server","<code>disallowed-tools</code>：限制能用哪些內建工具","兩者結合 → 最小權限原則"]}
    ],
    auto:true
  });
  INSP_CC.push({
    ico:"spark", color:"purple", feat:"Claude Fable 5 — Mythos 級旗艦模型", ver:"v2.1.170 · 2026-06-09",
    desc:"Fable 5 效能超越先前所有公開模型，適用最複雜任務（大型 refactor、深度推理、跨 repo migration）。",
    scen:"<b>場景：</b>銀行 iOS App 年度大重構（Combine → Swift Concurrency），以往用較弱模型易推理失誤。Fable 5 搭配 <code>/effort xhigh</code> 準確率大幅提升。",
    roles:["frontend","backend","qa","pm"],
    d:[
      {h:"為什麼有用", p:"Fable 5 是目前最強公開模型。對需要長程推理的任務（大型 refactor、跨 module 依賴分析、安全稽核）準確率和推理深度皆優於 Opus 4.8。"},
      {h:"切換方式", c:"bash", b:"# 互動式切換到 Fable 5\nclaude\n> /model claude-fable-5\n\n# 搭配 xhigh effort\n> /effort xhigh\n\n# 設為預設（~/.claude/settings.json）\n# { \"model\": \"claude-fable-5\" }"},
      {h:"適用場景", l:["<b>年度大重構</b>：架構替換、全 repo callsite 改寫","<b>複雜 bug hunt</b>：需要長程推理跨多個 module","<b>安全稽核</b>：深度分析資安弱點、跨 module 追蹤"]}
    ],
    auto:true
  });
  INSP_CA.push({
    ico:"terminal", color:"blue", feat:"Codex 可讀取整合終端機輸出", ver:"2026-03-11",
    desc:"Codex 能讀取目前 thread 的 <b>integrated terminal</b> 輸出 — 確認 dev server 狀態、回查失敗的 build。",
    scen:"<b>場景：</b>iOS build 失敗時不用複製貼上 error log；Codex 直接看 Xcode build output 找 root cause。Backend 跑 server 時 Codex 即時看 stderr 確認服務狀態。",
    roles:["ios","android","backend"],
    d:[
      {h:"為什麼有用", p:"以前你要把 terminal output 複製貼到 Codex 對話框。現在 Codex 直接看 — 對話更自然「為什麼 build 失敗」一句話 Codex 自己去看。"},
      {h:"用法", c:"bash", b:"# 在 Codex App integrated terminal 跑\n$ xcodebuild build -scheme MainApp\n# (build 失敗)\n\n# 直接問 Codex（不用複製）\n> 為什麼剛剛 build 失敗\n# Codex 讀整合終端輸出，給診斷"},
      {h:"延伸應用", l:["跑 unit test 失敗 → Codex 直接分析 failure","SwiftLint warning → Codex 一條條修","跑 server 看 log → Codex 找 anomaly"]}
    ],
    auto:true
  });
  INSP_CI.push({
    ico:"db", color:"gold", feat:"/archive 封存 session（防誤刪）", ver:"0.136.0 · 2026-06-01",
    desc:"新 <code>/archive</code> slash 指令 + <code>codex archive</code>/<code>codex unarchive</code> CLI，封存的 session 不會被 resume/fork 誤動。",
    scen:"<b>場景：</b>重要 incident review session、跨團隊討論 session 封存起來不會誤刪；之後審計/重看時 unarchive 即可。當 session 是 audit trail 時特別實用。",
    roles:["ios","android","backend","qa","pm"],
    d:[
      {h:"為什麼有用", p:"resume picker 列表太長後容易誤點。重要 session 封存後從 picker 隱藏，但仍可從 archived list 找回。"},
      {h:"用法", c:"bash", b:"# 在 session 內封存\n> /archive\n\n# CLI 操作\ncodex archive <session-id>\ncodex unarchive <session-id>\ncodex list --archived"},
      {h:"場景", l:["Incident review session：封存當 audit trail","完成的大型 refactor：封存 + tag","客戶 demo 對話：封存避免被 resume 改動"]}
    ],
    auto:true
  });
  INSP_CI.push({
    ico:"palette", color:"teal", feat:"CLI 0.131.0 TUI 大更新（@ mention + plugin marketplace）", ver:"0.131.0 · 2026-05-18",
    desc:"TUI 多項升級：service-tier、token 用量、permissions/approval mode、響應式 Markdown 表格；<code>@</code> mention 一鍵搜尋檔案/目錄/plugin/skill；plugin marketplace CLI 指令。",
    scen:"<b>場景：</b>@ mention 一秒帶入內部 skill；plugin marketplace 找團隊共用工具；TUI 顯示當下 effort / approval mode 上下文。日常用 codex CLI 整體體驗大幅升級。",
    roles:["ios","android","backend"],
    d:[
      {h:"為什麼有用", p:"0.131.0 是 TUI 大改版，把過去散落的 UX 痛點集中解決。新人學 CLI 的曲線變平。"},
      {h:"亮點功能", l:["<b>@ mention</b>：選檔案、目錄、plugin、skill 一鍵帶入","<b>Plugin marketplace 指令</b>：<code>codex plugin install/list/upgrade</code>","<b>響應式 Markdown 表格</b>：終端窄時自動切緊湊版","<b>Permissions/approval mode</b> 顯示當下權限狀態"]},
      {h:"小技巧", p:"配合 0.135.0+ 的 codex doctor 一起，新人 day 1 跑兩個指令就能掌握環境。"}
    ],
    auto:true
  });
  INSP_CI.push({
    ico:"loop", color:"blue", feat:"/app — CLI thread 無縫交棒 Codex Desktop", ver:"0.138.0 · 2026-06-08",
    desc:"CLI 工作到一半可用 <code>/app</code> 把整個 thread 交棒到 Codex Desktop（macOS/Windows），不丟失任何 context。",
    scen:"<b>場景：</b>用 CLI 跑了一半的 refactor，想切到桌面環境用 In-app browser 對照 spec 繼續工作。<code>/app</code> 一下，CLI 的 context 完整帶進 Desktop，不用重頭說明背景。",
    roles:["frontend","backend"],
    d:[
      {h:"為什麼有用", p:"CLI 和 Desktop 各有優勢：CLI 快、可腳本化；Desktop 有 in-app browser、Computer Use、artifact viewer。/app 讓你視情況切換，不再是二選一。"},
      {h:"用法", c:"bash", b:"# CLI 工作到一半\n$ codex\n> /app\n# Codex Desktop 自動開啟，載入同一 thread\n# context、附件、對話歷史全部保留"},
      {h:"小技巧", l:["macOS 和原生 Windows 皆支援","Desktop 做完後可用同 session ID 在 CLI <code>--resume</code>","和 <code>/archive</code> 搭配：交棒前先封存一份快照"]}
    ],
    auto:true
  });

  INSP_CC.push({
    ico:"web", color:"orange", feat:"子 Agent 可遞迴派生（最深 5 層）", ver:"v2.1.172 · 2026-06-10",
    desc:"Sub-agent 可以繼續派生自己的 sub-agent，最深 5 層巢狀，構成真正的多層 agent 樹狀結構。",
    scen:"<b>場景：</b>大型 monorepo migration：頂層 agent 拆分成 module agent，各 module agent 再拆出檔案 agent，平行處理數百個檔案；每層負責自己範圍內的推理。",
    roles:["backend","frontend","qa","pm"],
    d:[
      {h:"為什麼有用", p:"過去子 agent 只有一層，頂層 orchestrator 需要手動拆分所有工作。巢狀 5 層後，agent 可自行遞迴分解問題 — 大型任務自組織、不需人工介入分片。"},
      {h:"基本用法", c:"bash", b:"# 頂層 agent 會自動派生子 agent\nclaude\n> 對整個 monorepo 執行安全稽核，每個 package 獨立 agent\n# 內部：pkg-agent 再按檔案派發 file-agent\n# /goal 或 claude agents 追蹤各層進度"},
      {h:"小技巧", l:["深層 agent 消耗 token 較多，建議搭配 <code>/effort high</code> 而非 xhigh","<code>claude agents --json</code> 可用 waitingFor 欄位找出哪層卡住","5 層上限足夠處理 monorepo → package → file 三層結構"]}
    ],
    auto:true
  });

  INSP_CC.push({
    ico:"shield", color:"purple", feat:"Tool Parameter Permission Rules（Tool(param:value) 語法）", ver:"v2.1.178 · 2026-06-15",
    desc:"權限規則新增參數比對語法，可精確限制工具的使用方式——不只控制「能不能用」，更管制「怎麼用」。",
    scen:"<b>場景：</b>企業 Backend Sprint 中，Security Team 在 <code>settings.json</code> 設定 <code>WebFetch(domain:*.external.com)</code> 為拒絕規則，確保 Claude agent 只能存取公司內部 API，有效防止敏感資料透過 WebFetch 外洩。",
    roles:["backend","qa","pm"],
    d:[
      {h:"為什麼有用", p:"過去權限規則只能控制「允許或拒絕某工具」，現在可依參數值做細粒度管制。企業可在不完全停用工具的前提下實施最小權限原則，大幅降低 AI agent 誤用或資料外洩風險。"},
      {h:"設定 / 操作", c:"json", b:"// .claude/settings.json\n{\n  \"permissions\": {\n    \"deny\": [\n      \"Agent(model:claude-opus*)\",\n      \"WebFetch(domain:*.external-site.com)\"\n    ]\n  }\n}"},
      {h:"小技巧", l:["<code>*</code> 萬用字元可比對部分參數值，如 <code>Agent(model:opus*)</code>","搭配 <code>allow</code> 與 <code>deny</code> 可實現白名單式精細控管","MCP server 層級 <code>disallowedTools</code> 已同步修復，現正確套用"]}
    ],
    auto:true
  });

  INSP_CI.push({
    ico:"plug", color:"teal", feat:"Hooks 非同步呼叫 MCP 工具", ver:"0.148.0 · 2026-08-18",
    desc:"Hooks 過去只能同步跑一個 shell 指令，現在可以非同步執行並直接呼叫 MCP 工具，等同把 hook 升級成迷你 agent 動作。",
    scen:"<b>場景：</b>Backend Sprint 中，PostToolUse hook 偵測到 Edit 動作命中 <code>schema.sql</code> 後，非同步呼叫內部 MCP server 的 <code>notify_dba</code> 工具通知資料庫變更，不阻塞當前 turn 繼續執行。",
    roles:["backend","qa"],
    d:[
      {h:"為什麼有用", p:"過去 hook 只能跑同步 shell 指令，想接 MCP 工具（例如查內部 API、通知系統）得自己包一層 CLI wrapper。現在 hook 可直接非同步呼叫 MCP 工具，減少一層轉接，也不會卡住當前 turn。"},
      {h:"設定 / 操作", c:"toml", b:"# ~/.codex/config.toml\n[[hooks]]\nevent = \"PostToolUse\"\nmatch = \"Edit(path:**/schema.sql)\"\nasync = true\nmcp_tool = \"internal-db.notify_dba\""},
      {h:"小技巧", l:["<code>async = true</code> 才會非阻塞，同步 hook 仍會等待結果","適合通知類、記錄類動作；有回傳值需擋住 turn 的仍建議同步 hook","搭配既有 MCP 伺服器設定即可用，不需額外部署"]}
    ],
    auto:true
  });

  // Fold legacy role ids (ios / android / web) into the merged "frontend" role, dedupe.
  function normalizeRoles(arr){
    arr.forEach(c => {
      if (!c.roles) return;
      const mapped = c.roles.map(r => (r === "ios" || r === "android" || r === "web") ? "frontend" : r);
      c.roles = [...new Set(mapped)];
    });
  }
  normalizeRoles(INSP_CC);
  normalizeRoles(INSP_CA);
  normalizeRoles(INSP_CI);
