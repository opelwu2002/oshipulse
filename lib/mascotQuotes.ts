/**
 * 吉祥物「Pulse-kun (パルス君)」專屬語音包
 * 全繁體中文御宅專屬情境語錄
 */
export const MASCOT_QUOTES = {
  tension: "やばい！雙方差距進入死守線！本命要被下剋上 (Gekokujō) 啦！",
  overtake: "キターー (Kitaaa)！大逆轉達成！這個尊み (Totomi) 的光芒直接衝破天際！",
  referral: "快發動『拡散希望 (Kakusan Kibō)』！拉好友一起為推注入靈魂！",
  dailyReset: "待って (Matte)！今天的能量票快作廢了，別讓推的應援哭著告別！",
  retrospective: "鳥肌 (Torihada) 預警！昨晚這個集結衝刺完全是神展開！",
  emptySearch: "報告！這裡空空如也，找不到相關偶像捏… (OwO)",
  emptyCart: "購物袋還空空的～快把推的限量周邊帶回家供奉！",
  welcome: "歡迎來到 OshiPulse！今天也要全心守護本命的心跳聲量！(≧▽≦)",
  voted: "感謝應援！能量已灌注至本命舞台，光芒閃耀中！✨",
} as const;

export type MascotQuoteKey = keyof typeof MASCOT_QUOTES;
