import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 組合 Tailwind ClassName 工具
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化數值（例如 14,205）
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("zh-TW").format(num);
}

/**
 * 格式化新台幣貨幣金額
 */
export function formatCurrency(amount: number): string {
  return `NT$ ${new Intl.NumberFormat("zh-TW").format(amount)}`;
}

/**
 * 國家代碼轉換名稱與國旗
 */
export function getCountryBadge(country: string): { name: string; flag: string } {
  switch (country) {
    case "TW":
      return { name: "台灣", flag: "🇹🇼" };
    case "JP":
      return { name: "日本", flag: "🇯🇵" };
    case "KR":
      return { name: "韓國", flag: "🇰🇷" };
    case "CN":
      return { name: "中國", flag: "🇨🇳" };
    case "US":
      return { name: "美國", flag: "🇺🇸" };
    default:
      return { name: "國際", flag: "🌐" };
  }
}

/**
 * 領域類別轉換中文名稱
 */
export function getCategoryBadge(category: string): string {
  switch (category) {
    case "singer":
      return "實力歌手";
    case "actor":
      return "影視演員";
    case "seiyuu":
      return "知名聲優";
    case "creator":
      return "網路創作者";
    case "vtuber":
      return "虛擬偶像";
    case "character":
      return "動漫角色";
    default:
      return "全能藝人";
  }
}

/**
 * 判斷是否為 2.5D 多媒體企劃偶像 (A3!, Hypnosis Mic, UtaPri, Ensemble Stars 等)
 */
export function is2DFranchiseIdol(slug?: string | null, name?: string): boolean {
  if (!slug && !name) return false;
  const target = `${slug || ""} ${name || ""}`.toLowerCase();
  return (
    target.includes("hypnosis") ||
    target.includes("division") ||
    target.includes("uta_no_prince") ||
    target.includes("starish") ||
    target.includes("quartet") ||
    target.includes("a3!") ||
    target.includes("mankai") ||
    target.includes("ensemble") ||
    target.includes("knights") ||
    target.includes("love_live") ||
    target.includes("=love") ||
    target.includes("equal love") ||
    target.includes("イコールラブ") ||
    target.includes("buster") ||
    target.includes("mad trigger") ||
    target.includes("fling posse")
  );
}

/**
 * 🛡️ 權威高解析真實外部立繪索引表 (對齊 AniList、Wikimedia、Unsplash 等外部圖床)
 * 徹底杜絕 /images/idols/*.jpg 偽 JPG 文字色塊
 */
export const DEFAULT_IDOL_REAL_AVATARS: Record<string, string> = {
  // 韓國頂級動漫 / 條漫 IP
  "char-sung-jinwoo": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
  "sung-jinwoo": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
  "成振宇": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",

  "char-kim-dokja": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-2VOnp9aL30xG.png",
  "kim-dokja": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-2VOnp9aL30xG.png",
  "金獨子": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-2VOnp9aL30xG.png",

  // 韓國頂流 K-Pop 偶像
  "idol-jungkook": "https://upload.wikimedia.org/wikipedia/commons/4/4e/BTS_for_Dispatch_White_Day_Special%2C_27_February_2019_01.jpg",
  "jungkook": "https://upload.wikimedia.org/wikipedia/commons/4/4e/BTS_for_Dispatch_White_Day_Special%2C_27_February_2019_01.jpg",
  "田柾國": "https://upload.wikimedia.org/wikipedia/commons/4/4e/BTS_for_Dispatch_White_Day_Special%2C_27_February_2019_01.jpg",

  "idol-wonyoung": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/230811_Jamboree_K-Pop_Super_Live_IVE.jpg/1200px-230811_Jamboree_K-Pop_Super_Live_IVE.jpg",
  "wonyoung": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/230811_Jamboree_K-Pop_Super_Live_IVE.jpg/1200px-230811_Jamboree_K-Pop_Super_Live_IVE.jpg",
  "張員瑛": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/230811_Jamboree_K-Pop_Super_Live_IVE.jpg/1200px-230811_Jamboree_K-Pop_Super_Live_IVE.jpg",

  // 日本動漫角色
  "char-gojo": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
  "gojo-satoru": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
  "五條悟": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",

  "char-frieren": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-g1roJ6R7zJ6C.jpg",
  "frieren": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-g1roJ6R7zJ6C.jpg",
  "芙莉蓮": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-g1roJ6R7zJ6C.jpg",

  "idol-21": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-NptLiy7e9wZl.jpg",
  "星野愛": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-NptLiy7e9wZl.jpg",

  "idol-22": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiDY.png",
  "里維·阿卡曼": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiDY.png",

  "char-sukuna": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
  "兩面宿儺": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",

  "char-fushiguro": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
  "伏黑惠": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",

  "char-killua": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",
  "奇犽·揍敵客": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",

  "char-gon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",
  "小傑·富力士": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",

  "char-chrollo": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",
  "庫洛洛·魯西魯": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",

  "char-meruem": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",
  "梅路艾姆": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",

  "char-hisoka": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",
  "西索": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-n5b7E2m8A24b.jpg",

  "char-yugi-atem": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx481-4J92m8B01aF7.png",
  "闇遊戲": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx481-4J92m8B01aF7.png",

  "char-kaiba": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx481-4J92m8B01aF7.png",
  "海馬瀨人": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx481-4J92m8B01aF7.png",

  "char-rengoku": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx112151-7knzP4A8u1hP.jpg",
  "煉獄杏壽郎": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx112151-7knzP4A8u1hP.jpg",

  "char-muzan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgLd.jpg",
  "鬼舞辻無慘": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgLd.jpg",

  "char-sesshomaru": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx249-1t9gK9hL0m5a.jpg",
  "殺生丸": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx249-1t9gK9hL0m5a.jpg",

  "char-inuyasha-solo": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx249-1t9gK9hL0m5a.jpg",
  "犬夜叉": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx249-1t9gK9hL0m5a.jpg",

  "char-doraemon": "https://upload.wikimedia.org/wikipedia/en/2/25/Doraemon_2005_anime_logo.png",
  "哆啦A夢": "https://upload.wikimedia.org/wikipedia/en/2/25/Doraemon_2005_anime_logo.png",

  "char-nobita": "https://upload.wikimedia.org/wikipedia/en/2/25/Doraemon_2005_anime_logo.png",
  "野比大雄": "https://upload.wikimedia.org/wikipedia/en/2/25/Doraemon_2005_anime_logo.png",

  "char-gian": "https://upload.wikimedia.org/wikipedia/en/2/25/Doraemon_2005_anime_logo.png",
  "剛田武": "https://upload.wikimedia.org/wikipedia/en/2/25/Doraemon_2005_anime_logo.png",

  "char-chiikawa": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144217-U6P0kHmsj7Uq.jpg",
  "吉伊卡哇": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144217-U6P0kHmsj7Uq.jpg",

  "char-usagi": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144217-U6P0kHmsj7Uq.jpg",
  "兔兔": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144217-U6P0kHmsj7Uq.jpg",
  "烏薩奇": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144217-U6P0kHmsj7Uq.jpg",

  "idol-1": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hoshimachi_Suisei_2023.jpg/800px-Hoshimachi_Suisei_2023.jpg",
  "星街彗星": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hoshimachi_Suisei_2023.jpg/800px-Hoshimachi_Suisei_2023.jpg",

  "idol-2": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Jay_Chou_at_the_Taipei_Arena%2C_2011_%28cropped%29.jpg/800px-Jay_Chou_at_the_Taipei_Arena%2C_2011_%28cropped%29.jpg",
  "周杰倫": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Jay_Chou_at_the_Taipei_Arena%2C_2011_%28cropped%29.jpg/800px-Jay_Chou_at_the_Taipei_Arena%2C_2011_%28cropped%29.jpg",

  "idol-3": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/NewJeans_in_October_2023.jpg/1200px-NewJeans_in_October_2023.jpg",
  "NewJeans": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/NewJeans_in_October_2023.jpg/1200px-NewJeans_in_October_2023.jpg",

  "idol-4": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards.png/800px-191125_Taylor_Swift_at_the_2019_American_Music_Awards.png",
  "泰勒絲": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards.png/800px-191125_Taylor_Swift_at_the_2019_American_Music_Awards.png",

  "idol-5": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Kana_Hanazawa_at_TIFF_2019.jpg/800px-Kana_Hanazawa_at_TIFF_2019.jpg",
  "花澤香菜": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Kana_Hanazawa_at_TIFF_2019.jpg/800px-Kana_Hanazawa_at_TIFF_2019.jpg",

  "idol-6": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Xiao_Zhan_at_Gucci_show_in_Milan_in_2023_02.jpg/800px-Xiao_Zhan_at_Gucci_show_in_Milan_in_2023_02.jpg",
  "肖戰": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Xiao_Zhan_at_Gucci_show_in_Milan_in_2023_02.jpg/800px-Xiao_Zhan_at_Gucci_show_in_Milan_in_2023_02.jpg",

  "idol-7": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
  "統神": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",

  "idol-8": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800",
  "AKB48": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800",

  "idol-9": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
  "IShowSpeed": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",

  "idol-10": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
  "金秀賢": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",

  "idol-11": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
  "Buster Bros!!!": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",

  "idol-12": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
  "MAD TRIGGER CREW": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",

  "idol-13": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
  "Fling Posse": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",

  "idol-14": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
  "ST☆RISH": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",

  "idol-15": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
  "QUARTET NIGHT": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",

  "idol-16": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
  "A3! 滿開劇團 春組": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",

  "idol-17": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
  "Knights": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",

  "idol-23": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
  "=LOVE": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",

  "char-sasaki-maika": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
  "佐佐木舞香": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",

  "char-noguchi-iori": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
  "野口衣織": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
};

/**
 * 檢查字串是否為有效外部 HTTP(S) 或 Data URL 圖片
 */
function isValidExternalImageUrl(url?: any): boolean {
  if (typeof url !== "string") return false;
  const clean = url.trim();
  if (!clean) return false;
  if (clean.includes("/images/idols/")) return false; // 嚴格排除本機偽色塊路徑
  return clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("//") || clean.startsWith("data:image/");
}

/**
 * 🌟 核心權威偶像頭像立繪萃取器 (getIdolAvatar)
 * 1. 統一對齊 Supabase 資料庫與前後端真實欄位 (avatar, image_url, avatar_url, cover_url 等)
 * 2. 嚴格優先萃取外部真圖，絕不讓 /images/idols/*.jpg 偽文字色塊流入畫面
 * 3. 若為舊本機路徑或缺圖，自動映射全域高畫質外部立繪索引表
 */
export function getIdolAvatar(idol: any): string {
  if (!idol) return "";

  // 若傳入純字串 URL
  if (typeof idol === "string") {
    const raw = idol.trim();
    if (isValidExternalImageUrl(raw)) return raw;
    // 檢查是否命中檔名或角色關鍵字
    for (const [key, realUrl] of Object.entries(DEFAULT_IDOL_REAL_AVATARS)) {
      if (raw.toLowerCase().includes(key.toLowerCase())) {
        return realUrl;
      }
    }
    // 排除偽色塊路徑
    if (raw.includes("/images/idols/")) {
      return "";
    }
    return raw;
  }

  // 若傳入角色物件：依序檢查所有可能欄位是否有「外部真圖」
  const candidateKeys = ["avatar", "image_url", "avatar_url", "headshot_url", "cover_url", "image"];
  for (const key of candidateKeys) {
    const val = idol[key];
    if (isValidExternalImageUrl(val)) {
      return val.trim();
    }
  }

  // 若上述皆未命中真圖，透過 id、name、wiki_slug 查閱權威真圖索引表
  const lookupKeys = [idol.id, idol.name, idol.original_name, idol.wiki_slug];
  for (const k of lookupKeys) {
    if (k && typeof k === "string") {
      const match = DEFAULT_IDOL_REAL_AVATARS[k] || DEFAULT_IDOL_REAL_AVATARS[k.trim()];
      if (match) return match;
      // 模糊比對名稱包含
      for (const [dictKey, realUrl] of Object.entries(DEFAULT_IDOL_REAL_AVATARS)) {
        if (k.includes(dictKey) || dictKey.includes(k)) {
          return realUrl;
        }
      }
    }
  }

  // 檢查是否有非偽色塊的本機相對路徑
  for (const key of candidateKeys) {
    const val = idol[key];
    if (typeof val === "string" && val.trim() && !val.includes("/images/idols/")) {
      return val.trim();
    }
  }

  return "";
}

/**
 * 🌟 核心權威偶像封面寬幅大圖萃取器 (getIdolCover)
 */
export function getIdolCover(idol: any): string {
  if (!idol) return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200";

  const candidateKeys = ["cover_url", "banner_url", "cover", "image_url", "avatar"];
  for (const key of candidateKeys) {
    const val = idol[key];
    if (isValidExternalImageUrl(val)) {
      return val.trim();
    }
  }

  // 降級退回頭像立繪或預設封面
  const avatar = getIdolAvatar(idol);
  if (avatar) return avatar;

  return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200";
}
