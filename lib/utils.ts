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
