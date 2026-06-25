# 🛠️ QuickToolsLive 專案開發紀錄、踩坑指南與後續計畫

本文件詳細記錄了從 0 到 1 建立 **QuickImage 快捷工具箱 (quicktoolslive.com)** 的完整歷程、技術亮點、開發中所踩過的坑，以及後續的行銷變現待辦清單。

*您可以直接全選並複製此 Markdown 內容，貼上到您的 Notion 頁面中，Notion 會自動將其排版為美麗的標題、清單與代碼區塊。*

---

## 📋 一、 完整開發歷程與步驟

### 1. 工具構想與方案選定
* **目標**：開發一個不需要登入、不需資料庫、純前端執行以保障隱私，且適合 Google AdSense 變現的高頻工具網站。
* **決策**：在 AI 評估的 10 個低門檻方向中，優先選定 **QuickImage (快捷圖片壓縮與格式轉換助手)** 作為首個核心功能。

### 2. 本地初始化與第一階段開發
* **檔案結構**：建立 `index.html`、`styles.css` 與 `app.js`。
* **技術特點**：使用純前端 HTML5 Canvas API 進行圖片壓縮與格式轉換。因不經由任何後端伺服器，對用戶隱私 100% 安全，且伺服器託管成本為 **$0**。
* **成果**：在本地伺服器（Port 8080）完成第一階段圖片拖放上傳與壓縮下載功能的測試。

### 3. Git 與 GitHub 版本控制
* 在本地專案目錄初始化 Git：`git init`
* 建立第一次提交：`git commit -m "Initial commit..."`
* 在 GitHub 上手動建立名為 `quickimage` 的公開空白儲存庫（帳號：`ellis1004`）。
* 本地與遠端倉庫連接，並完成推送：
  ```bash
  git branch -M main
  git remote add origin https://github.com/ellis1004/quickimage.git
  git push -u origin main
  ```

### 4. 網站功能大擴展（升級多功能工具箱）
為了避免單網頁工具被 AdSense 判定為「低價值內容」，專案架構進行了全面升級：
* **首頁大廳化**：原 `index.html` 改寫為工具大廳導覽頁，展示所有工具的磨砂玻璃發光卡片。
* **工具遷移**：原圖片壓縮移至 `image-compressor.html`。
* **新增工具二（PickRandom 隨機決定助手）**：建立 `random-picker.html` 與 `random-picker.js`。提供大轉盤與名單隨機抽籤，中獎時使用 Canvas 噴灑彩帶。
* **新增工具三（FocusClock 專注番茄鐘）**：建立 `focus-timer.html` 與 `focus-timer.js`。包含專注/休息模式，使用 **Web Audio API** 離線實時合成雨聲、風聲、海浪白噪音。
* **添加隱私權政策 (`privacy.html`)**：加入 AdSense 審核必備的隱私權條款，並全站綁定導覽列。

### 5. 託管平台部署 (Vercel)
* 登入 Vercel 導入 GitHub 的 `ellis1004/quickimage` 儲存庫。
* 設定專案為靜態部署（Other），Vercel 與 GitHub 關聯後，後續每次代碼推送（`git push`）皆會觸發自動建置並於 15 秒內更新上線。

### 6. 自訂網域購買與解析 (DNS)
* 用戶於 GoDaddy 購買了專屬網域 **`quicktoolslive.com`**。
* 在 Vercel 中將該網域新增為 Project Domain，並設定 `quicktoolslive.com` 自動轉向到 `www.quicktoolslive.com`。
* 於 GoDaddy DNS 管理後台配置兩筆指向記錄，將流量導入 Vercel 全球邊緣伺服器：
  * **A 記錄**：`@` 指向 `76.76.21.21`
  * **CNAME 記錄**：`www` 指向 `cname.vercel-dns.com`
* 數分鐘後安全憑證（Let's Encrypt SSL）成功簽發，網站正式以 `https://quicktoolslive.com` 啟用安全連線。

### 7. Google Search Console (GSC) 登錄與網站地圖提交
* 於 GSC 中選擇「網域驗證」，輸入 `quicktoolslive.com`。
* 透過 GoDaddy 的 **Domain Connect** 自動化聯網協議，一鍵點擊授權完成擁有權驗證。
* 提交本機編寫的網站地圖 **`https://www.quicktoolslive.com/sitemap.xml`**。
* Google 機器人成功解析 Sitemap，精確識別出網站內部的 5 個網頁，準備開始編入搜尋索引。

### 8. 工具箱大規模擴展（12款核心工具/14個頁面）與全站下拉選單優化
為滿足大規模型工具箱建置需求，我們一次性 Scaffold 並完成了 10 款新工具的實作與上線：
* **新工具列表**：
  1. `word-counter.html` (字數統計)
  2. `password-generator.html` (安全密碼產生器)
  3. `json-formatter.html` (JSON 格式化)
  4. `css-generator.html` (CSS 陰影與玻璃擬態產生器)
  5. `qr-code.html` (QR Code 產生與解析，引進外部 CDN)
  6. `unit-converter.html` (多功能單位換算與即時匯率轉換)
  7. `color-converter.html` (色彩代碼互轉與調色盤配色)
  8. `base64-converter.html` (文字與圖片 Base64 互轉)
  9. `date-calculator.html` (日期加減、間隔與 Unix 時間戳轉換)
  10. `speech-assistant.html` (純前端麥克風語音輸入與語音合成朗讀)
* **導覽整合**：在 `styles.css` 中引入了優美的磨砂玻璃純 CSS 下拉選單（`✨ 更多工具`），並更新至全站所有 14 個 HTML 頁面中，大幅提升內鏈跳轉率。

### 9. 解決 GSC 重定向與重複頁面問題（規範化 www 連結）
* **GSC 警告修復**：修復了 Google Search Console 回報的「頁面會重新導向」與「重複網頁；使用者未選取標準網頁」警告。
* **做法**：
  * 將 [`sitemap.xml`](sitemap.xml) 與 [`robots.txt`](robots.txt) 的所有路徑全面強制設為帶 `www` 網域（例如：`https://www.quicktoolslive.com/...`）。
  * 全站 14 個頁面全部新增 `<link rel="canonical" href="...">` 標準化標籤。

### 10. 首頁視覺與結構升級（3D 科技插圖 welcome-banner 導入）
* **設計升級**：在首頁新增了 3D 抽象科技感插圖 [`hero_banner.png`](hero_banner.png)，使首頁不再單調。
* **版面調整**：橫幅佈局調整為雙欄 Grid 響應式佈局，左側介紹、右側插圖，並支援手機端自動摺疊。

---

## 🕳️ 二、 開發過程中踩過的坑與解決方案

### 1. 網域後綴選擇的陷阱 (AdSense 審核風險)
* **踩坑**：註冊商結帳時預設推薦 `.it.com` 或 `.xyz` 組合包。
* **解決**：避免購買非標準的頂級網域，容易被 AdSense 以「子網域不予直接申請」拒絕。最終改為購買標準的 `.com` 網域，成功避坑。

### 2. JPEG 格式轉換透明背景變黑
* **踩坑**：在將透明背景的 PNG 圖片轉換為 JPEG 時，因為 JPEG 不支援 Alpha 通道，Canvas 預設會將透明部分填為黑色。
* **解決**：在 Canvas 繪圖邏輯中，若輸出格式為 `image/jpeg`，在繪製圖片前先填滿畫布為白色背景 (`#FFFFFF`)。

### 3. 新對接網域報錯 `NET::ERR_CERT_COMMON_NAME_INVALID`
* **踩坑**：GoDaddy DNS 設定完後立刻用瀏覽器打開，網頁報安全警告錯誤。
* **解決**：這是由於 Vercel 還在後台向 CA 申請並分發該網域的安全憑證。只需靜待 2-3 分鐘後重新整理即可。

### 4. GSC 網域資源提交 Sitemap 報「位址無效」
* **踩坑**：在 Search Console 提交網站地圖時，只輸入 `sitemap.xml` 被提示無效路徑。
* **解決**：網域資源驗證沒有預填網域前綴，必須填入**完整正規化 URL**（如 `https://www.quicktoolslive.com/sitemap.xml`）。

### 5. Vercel 自動部署 Webhook 未及時觸發導致的 404
* **踩坑**：在 GitHub 上成功推入了包含 `hero_banner.png` 的 commit 後，實測網站卻返回 404，且 HTML 沒有被同步更新。
* **解決**：經由 GitHub API 查詢發現該 Commit 並未被 Vercel webhook 捕捉到（缺少對應 Deployment）。我們在本地推入了一個空的觸發 commit（`git commit --allow-empty`），成功強制觸發 Vercel 重啟建置部署，將靜態資源與圖片完全推上線。

### 6. 瀏覽器快取（Cache）導致畫面未更新
* **踩坑**：網站部署完成後，使用者端點開網址仍顯示為無插圖的舊版首頁。
* **解決**：這是由於瀏覽器將先前的 `index.html` 快取在本地磁碟。教導用戶使用強制重新整理（Windows: `Ctrl` + `F5`，Mac: `Cmd` + `Shift` + `R`）即可繞過快取、即時看見新版頁面。

---

## 📅 三、 後續待辦與推廣計畫

### 1. 追蹤 Search Console 收錄與 Sitemap 解析 (3-5 天後)
* 定期登入 [Google Search Console](https://search.google.com/search-console/)，確認「Sitemaps」的狀態是否持續維持「成功」。
* 觀察「網頁」收錄狀況，確認 canonical 網址警告是否消失。

### 2. 推廣與獲取初期流量 (這兩週內)
* **社群分享**：在 Facebook、Notion 社群、部落格等地方發布工具，主打「100% 離線處理，保障圖片隱私」的特點。
* **論壇推廣**：在 Dcard、PTT 或 V2EX 等工具分享板發布，說明這是一個個人開發的免費且無廣告（目前）工具箱。

### 3. 申請 Google AdSense 變現 (約 1-2 週後)
當網站有一點點流量（如每日十幾人次）且 Google 搜尋能順利找到您的網頁時：
1. 登入 [Google AdSense](https://www.google.com/adsense/start/) 註冊帳戶。
2. 點選「新增網站」，輸入 `quicktoolslive.com`。
3. 將 Google 提供的一行 `<script>` 廣告代碼貼入所有 HTML 頁面的 `<head>` 之間，並 `git push` 上傳。
4. 在 AdSense 後台提交審核，等待審核通過。

### 4. 建立 `ads.txt` 檔案 (AdSense 通過後)
* 在專案根目錄建立 `ads.txt` 檔案，填入您的發佈商 ID：
  ```text
  google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
  ```
* 推送至 GitHub，完成發佈商代碼驗證。

---

## 🔗 四、 補充紀錄：網址、資源與消費紀錄

### 1. 本日使用網址清單
* **正式上線網址**：[https://www.quicktoolslive.com](https://www.quicktoolslive.com)
* **GitHub 程式碼儲存庫**：[https://github.com/ellis1004/quickimage](https://github.com/ellis1004/quickimage)
* **Google Search Console 驗證後台**：[https://search.google.com/search-console](https://search.google.com/search-console)
* **GoDaddy 網域管理台**：[https://dcc.godaddy.com/control/portfolio](https://dcc.godaddy.com/control/portfolio)

### 2. 本日使用技術資源
* **JSZip 函式庫 (CDN)**：`https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` (用於批次壓縮圖片後的 `.zip` 打包下載)。
* **Canvas Confetti 灑花特效 (CDN)**：`https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js` (用於隨機決定轉盤與抽籤中獎時的慶祝特效)。
* **Google Fonts (Outfit & Inter 字體)**：引入微調全站字型，使介面呈現高階的英文與中文字體視覺。
* **Web Audio API**：原生音頻合成 API，於本地即時合成雨聲、森林風聲、大自然白噪音。
* **qrcode.js & jsQR.js (CDN)**：用於純本機 QR Code 圖片生成與解碼。
* **Open Exchange Rates API**：用於多功能單位換算器的全球即時匯率轉換（附帶本地緩存與備用匯率）。
