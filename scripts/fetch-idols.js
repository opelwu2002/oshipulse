/**
 * OshiPulse 官方角色與偶像圖片自動抓取下載腳本 (Scraper Script)
 * 具備完整防盜鏈 Header 偽裝與離線高品質本地備援圖自動生成機制
 */
const fs = require("fs");
const path = require("path");

const CONFIG_FILE = process.argv[2] || path.join(__dirname, "idols-config.json");
const OUTPUT_DIR = path.join(__dirname, "../public/images/idols");

// 確保目標資料夾存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 根據文字雜湊取得專屬漸層配色
function getGradientColors(name) {
  const colorPairs = [
    ["#EC4899", "#8B5CF6"], // 粉紫
    ["#3B82F6", "#06B6D4"], // 藍青
    ["#F59E0B", "#EF4444"], // 橙紅
    ["#10B981", "#3B82F6"], // 綠藍
    ["#6366F1", "#A855F7"], // 靛紫
    ["#F43F5E", "#FB923C"], // 玫瑰橘
    ["#14B8A6", "#6366F1"], // 青靛
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPairs.length;
  return colorPairs[index];
}

// 產生離線備用高品質向量圖片 (SVG 格式，副檔名相容)
function generateFallbackImage(name) {
  const [c1, c2] = getGradientColors(name);
  const initial = (name || "推").trim()[0];
  const safeName = name.replace(/[<>&"]/g, "");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="50%" stop-color="#1E1B4B" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- 背景底色 -->
  <rect width="600" height="600" fill="url(#bgGrad)" />
  <!-- 裝飾微光同心圓 -->
  <circle cx="300" cy="270" r="180" fill="none" stroke="${c1}" stroke-width="2" stroke-dasharray="8 8" opacity="0.4" />
  <circle cx="300" cy="270" r="140" fill="url(#circleGrad)" stroke="#FFFFFF" stroke-width="3" opacity="0.9" />
  <circle cx="300" cy="270" r="140" fill="none" stroke="${c2}" stroke-width="4" filter="url(#glow)" opacity="0.6" />
  
  <!-- 角色首字徽記 -->
  <text x="300" y="325" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="110" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">
    ${initial}
  </text>
  
  <!-- 角色全名 -->
  <text x="300" y="470" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
    ${safeName}
  </text>
  
  <!-- 品牌標識 -->
  <rect x="210" y="505" width="180" height="32" rx="16" fill="#000000" fill-opacity="0.3" />
  <text x="300" y="527" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#F472B6" text-anchor="middle" letter-spacing="2">
    ✨ OSHIPULSE
  </text>
</svg>`;
}

// 偽裝瀏覽器標頭發起請求下載
async function downloadImage(item, index, total) {
  const { name, url, fileName } = item;
  const filePath = path.join(OUTPUT_DIR, fileName);

  console.log(`[${index + 1}/${total}] ⏳ 正在處理: ${name} (${fileName})...`);

  // 若目標為本機路徑，或 URL 為空，直接產生高品質本地圖
  if (!url || !url.startsWith("http")) {
    const svg = generateFallbackImage(name);
    fs.writeFileSync(filePath, svg, "utf8");
    console.log(`  ⚡ 本地路徑或無網址，已生成專屬本地視覺: ${fileName}`);
    return { status: "fallback", fileName };
  }

  let referer = "";
  try {
    const parsed = new URL(url);
    referer = `${parsed.protocol}//${parsed.host}/`;
  } catch (e) {
    referer = "";
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": referer,
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "image",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "cross-site",
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7 秒超時

    const res = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP 錯誤狀態碼: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 檢查回傳大小，若過小 (< 100 bytes) 可能是無效頁面
    if (buffer.length < 100) {
      throw new Error(`下載內容過小 (${buffer.length} bytes)，可能非有效圖片`);
    }

    fs.writeFileSync(filePath, buffer);
    const sizeKb = (buffer.length / 1024).toFixed(1);
    console.log(`  ✔ 下載成功: ${fileName} (${sizeKb} KB)`);
    return { status: "success", fileName, sizeKb };
  } catch (err) {
    // 遇到防盜鏈 403、網路斷線或超時：啟動自動降級，生成專屬本地高品質圖
    console.warn(`  ⚠️ 遠端下載失敗 (${err.message}) -> 自動啟用智慧本地圖片生成`);
    const svg = generateFallbackImage(name);
    fs.writeFileSync(filePath, svg, "utf8");
    console.log(`  ✔ 專屬本地圖片已就緒: ${fileName}`);
    return { status: "fallback", fileName };
  }
}

async function main() {
  console.log("=================================================");
  console.log("🚀 OshiPulse 偶像圖片本地化抓取腳本啟動");
  console.log(`📁 讀取設定檔: ${CONFIG_FILE}`);
  console.log(`💾 輸出資料夾: ${OUTPUT_DIR}`);
  console.log("=================================================");

  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ 找不到設定檔: ${CONFIG_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CONFIG_FILE, "utf8");
  const config = JSON.parse(raw);

  let successCount = 0;
  let fallbackCount = 0;

  for (let i = 0; i < config.length; i++) {
    const result = await downloadImage(config[i], i, config.length);
    if (result.status === "success") successCount++;
    else fallbackCount++;
  }

  console.log("\n=================================================");
  console.log("🎉 全部角色圖片下載與本地化完成！");
  console.log(`📊 統計報表:`);
  console.log(`   - 總計處理: ${config.length} 位角色`);
  console.log(`   - 遠端成功抓取: ${successCount} 張`);
  console.log(`   - 專屬本地生成: ${fallbackCount} 張`);
  console.log(`   - 本地檔案涵蓋率: 100% 零破圖保證`);
  console.log(`📁 檔案已全部儲存於: /public/images/idols/`);
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("執行過程中發生嚴重錯誤:", err);
  process.exit(1);
});
