const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "idols-config.json");
const mockDataPath = path.join(__dirname, "../lib/mockData.ts");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
let content = fs.readFileSync(mockDataPath, "utf8");

// 確保五條悟配置為 gojo-satoru.jpg
for (const item of config) {
  if (item.id === "char-gojo" || item.fileName === "gojo.jpg") {
    item.fileName = "gojo-satoru.jpg";
  }
}
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

let replaceCount = 0;

for (const item of config) {
  const localPath = `/images/idols/${item.fileName}`;
  
  if (item.url && content.includes(item.url)) {
    // 全域替換該 URL 為本地路徑
    content = content.split(item.url).join(localPath);
    replaceCount++;
  }
}

fs.writeFileSync(mockDataPath, content, "utf8");
console.log(`成功將 mockData.ts 中的外部圖片網址替換為本地路徑，共更新 ${replaceCount} 個 URL！`);
