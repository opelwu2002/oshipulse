# OshiPulse (推しパルス) 跨國偶像應援聲量競技平台

> **讓每一份「推」的心跳，都能在此激盪迴響！**  
> 由 **宇沛實業股份有限公司 (UPAY Corp.)** 研發、營運與維護之跨國偶像應援競技全端 Web 應用。

---

## 🌟 核心特色與技術架構

- **全端框架**：Next.js 14+ (App Router, TypeScript, React 18+)
- **視覺規範**：Tailwind CSS（純白底 `#FFFFFF`、高對比文字 `#0F172A`、電馭紫 `#8B5CF6`、霓虹玫瑰 `#F43F5E`、旭日金 `#F59E0B`、Mobile-first Bento Grid 卡片系統）
- **多重感官回饋**：
  - **Web Audio API**：800Hz 至 1600Hz 極速氣泡短音 (`Bubble Pop`)，以及逆轉勝時的水晶風鈴音 (`Crystal Chime`)。
  - **觸覺震動**：HTML5 Vibration API 雙重震動模式 (`navigator.vibrate([15, 60, 25])`)。
  - **視覺粒子**：`canvas-confetti` 愛心綵球噴發。
  - **社群炫耀卡**：`html2canvas` 一鍵生成 9:16 IG限動宣傳卡片。
- **防刷作弊架構**：
  - 結合 `@fingerprintjs/fingerprintjs` 設備指紋。
  - Supabase PostgreSQL 安全原子預存程序 `cast_idol_vote` 與 `device_daily_records`。
  - 支援「擴散希望 (Kakusan Kibō)」推薦邀請機制贈送抵扣票。
- **即時競技拉鋸 (Tug of War Arena)**：
  - 即時第一名與第二名聲量比值條（`framer-motion`）。
  - 差距小於 5% 觸發急速脈衝警報 (`animate-pulse`)。
  - 偵測逆轉超車即時觸發「【下剋上達成】領先 1 票！」彈簧動畫。
- **統一後台管理儀表板 (`/admin`)**：
  - 具備 5 大分頁：`battles` (賽程與防弊審計)、`idols` (全 CRUD、動態成員至多 50 人、生日自動算星座符號、串流 ID 綁定)、`collabs` (許願目標與密碼學抽獎)、`store` (庫存調整與出貨 CSV 匯出)、`messages` (聯絡信件檢視與 Resend 郵件回信)。
- **官方聯絡直通車 (`/contact` & `/api/contact`)**：
  - 諮詢自動轉發至官方主管信箱 `opelwu2002@gmail.com`。

---

## 🏢 法人資訊與贊助資訊

- **營運法人**：宇沛實業股份有限公司 (UPAY Corp.)
- **營業地址**：台北市松山區敦化北路207號9樓之6
- **客服專線**：+886 0911-027-688
- **官方信箱**：`opelwu2002@gmail.com`
- **版權宣告**：`© 2026 UPAY Corp. All Rights Reserved. 宇沛實業股份有限公司版權所有`
- **伺服器能量補給贊助帳戶**：
  - 銀行：華南銀行 民生分行 (代碼：008)
  - 戶名：宇沛實業股份有限公司
  - 帳號：`126103063350`

---

## 🚀 快速啟動指南

### 1. 安裝相依套件
```bash
npm install
```

### 2. 本地開發模式啟動
```bash
npm run dev
```
開啟瀏覽器造訪 [http://localhost:3000](http://localhost:3000)。

### 3. 生產環境編譯
```bash
npm run build
npm run start
```

---

## 🗄️ Supabase 資料庫遷移與種子資料

1. 登入 [Supabase Dashboard](https://supabase.com)。
2. 進入專案的 **SQL Editor**。
3. 依序執行以下檔案內容：
   - `supabase/schema.sql`：建立所有 Enums、資料表、RLS 政策與預存程序（`cast_idol_vote`, `decrement_stock`）。
   - `supabase/seed.sql`：匯入 10 位跨 5 國（TW, JP, KR, CN, US）與 5 領域（singer, actor, seiyuu, creator, vtuber）頂尖偶像初始資料。
