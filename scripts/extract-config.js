const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "../lib/mockData.ts"), "utf8");

// 正則分析各偶像物件
const idols = [];
const blocks = content.split(/\{\s*id:\s*"/g).slice(1);

for (const b of blocks) {
  const idMatch = b.match(/^([^"]+)"/);
  const nameMatch = b.match(/name:\s*"([^"]+)"/);
  const avatarMatch = b.match(/avatar_url:\s*"([^"]+)"/);

  if (idMatch && nameMatch && avatarMatch) {
    const id = idMatch[1];
    const name = nameMatch[1];
    const url = avatarMatch[1];

    let slug = id
      .replace(/^(idol-|char-|anime-)/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    idols.push({
      id,
      name,
      fileName: `${slug}.jpg`,
      url
    });
  }
}

const outputPath = path.join(__dirname, "idols-config.json");
fs.writeFileSync(outputPath, JSON.stringify(idols, null, 2), "utf8");
console.log(`成功提取 ${idols.length} 位角色設定檔至 scripts/idols-config.json`);
