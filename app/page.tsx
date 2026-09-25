"use client";

import React, { useState, useEffect, useMemo } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import MissionCenter from "@/components/MissionCenter";
import TugOfWarArena from "@/components/TugOfWarArena";
import { MobileMascotInline } from "@/components/MascotWidget";
import VoteButton from "@/components/VoteButton";
import {
  formatNumber,
  formatCurrency,
  getCountryBadge,
  getCategoryBadge,
  is2DFranchiseIdol,
  getIdolAvatar,
} from "@/lib/utils";
import {
  Flame,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  HeartHandshake,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const {
    idols,
    battles,
    collabs,
    products,
    openDonateModal,
    openShareModal,
    openPersonalityQuiz,
  } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [dbIdols, setDbIdols] = useState<any[]>([]);

  // 🛡️ 即時同步：首頁載入時向 API 取得最新真實角色與圖片網址
  useEffect(() => {
    async function loadLatestIdols() {
      try {
        const res = await fetch(`/api/admin/idols?t=${Date.now()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbIdols(json.data);
        }
      } catch (err) {
        console.warn("首頁載入資料庫偶像失敗，使用本地備援:", err);
      }
    }
    loadLatestIdols();
  }, []);

  // 統一資料來源：資料庫優先，並對齊 image_url / avatar 實體欄位，徹底排除偽色塊
  const allIdols = useMemo(() => {
    if (dbIdols.length === 0) return idols;

    return dbIdols.map((db) => {
      const local = idols.find((i) => i.id === db.id);
      const finalImg = getIdolAvatar(db) || getIdolAvatar(local);

      return {
        ...(local || {}),
        ...db,
        id: db.id,
        name: db.name || local?.name || "未知角色",
        original_name: db.original_name || local?.original_name || db.work || "",
        country: db.country || local?.country || "JP",
        category: db.category || local?.category || "character",
        vote_count: Number(db.votes ?? db.vote_count ?? local?.vote_count ?? 0),
        image_url: finalImg,
        avatar: finalImg,
        avatar_url: finalImg,
      };
    });
  }, [dbIdols, idols]);

  // 根據篩選過濾偶像列表
  const filteredIdols = allIdols.filter((idol) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "CHARACTER") return idol.category === "character";
    if (selectedFilter === "FRANCHISE") return is2DFranchiseIdol(idol.wiki_slug, idol.name);
    return idol.country === selectedFilter;
  });

  // 排序計算排行
  const sortedIdols = [...filteredIdols].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const topFive = sortedIdols.slice(0, 5);

  const activeBattle = battles.find((b) => b.status === "live") || battles[0];
  const featuredCollab = collabs[0];
  const featuredProduct = products[0];

  const filterTabs = [
    { code: "ALL", name: "全部本命與角色" },
    { code: "CHARACTER", name: "動漫角色 ✦" },
    { code: "FRANCHISE", name: "企劃偶像 🎤" },
    { code: "JP", name: "日本 🇯🇵" },
    { code: "TW", name: "台灣 🇹🇼" },
    { code: "KR", name: "韓國 🇰🇷" },
    { code: "US", name: "美國 🇺🇸" },
    { code: "CN", name: "中國 🇨🇳" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 bg-white">
      {/* 行動端吉祥物播報條 */}
      <MobileMascotInline />

      {/* Hero 區域：純白 Bento 標題宣示與快捷應援按鈕 */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-black text-cyber-rose shadow-2xs">
            <Flame className="w-4 h-4 fill-cyber-rose animate-pulse" />
            <span>2026 跨國偶像聲量大激戰 · 本機純前端離線模式已啟動</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            讓每一份「推」的心跳，
            <br className="hidden sm:inline" />
            都能在此 <span className="cyber-gradient-text">激盪迴響</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            跨越動漫原作、多媒體企劃、美日中台韓五國應援文化。透過科技防弊與即時拉扯的視覺呈現，記錄每一次「下剋上」的逆轉奇蹟！
          </p>

          {/* 快捷互動膠囊 (測驗與任務) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={openPersonalityQuiz}
              className="px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-cyber-purple font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyber-purple animate-spin" />
              <span>測測命定應援人格 ✦</span>
            </button>
            <a
              href="#mission-center"
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>今日應援修煉所</span>
            </a>
          </div>
        </div>

        {/* 頂級拔河擂台 (Tug of War Arena) */}
        <div id="tug-of-war-arena">
          <TugOfWarArena />
        </div>
      </section>

      {/* 每日應援任務中心 */}
      <MissionCenter />

      {/* 國別與分類快速篩選條 */}
      <section className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {filterTabs.map((tab) => (
            <button
              key={tab.code}
              onClick={() => setSelectedFilter(tab.code)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                selectedFilter === tab.code
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <Link
          href="/idols"
          className="text-xs font-bold text-cyber-violet hover:underline flex items-center gap-1 shrink-0 ml-auto"
        >
          <span>查看完整名人堂 ({idols.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* Bento Grid 模組化柵格卡片系統 (標準 2x2 雙列四欄) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 卡片 1: TOP 5 即時排行榜 (佔據 2 欄寬度) */}
        <div className="bento-card md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">即時聲量巔峰榜</h2>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                即時更新 · 設備防刷已驗證
              </span>
            </div>

            <div className="space-y-3">
              {topFive.map((idol, index) => {
                const country = getCountryBadge(idol.country);
                const categoryName = getCategoryBadge(idol.category);

                return (
                  <div
                    key={idol.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 text-center font-mono font-black text-sm ${
                          index === 0
                            ? "text-amber-500 text-base"
                            : index === 1
                            ? "text-slate-700"
                            : index === 2
                            ? "text-amber-700"
                            : "text-slate-400"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <SafeImage
                          src={getIdolAvatar(idol)}
                          alt={idol.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/idols/${idol.id}`}
                            className="font-bold text-sm text-slate-900 hover:text-cyber-violet truncate"
                          >
                            {idol.name}
                          </Link>
                          <span className="text-xs">{country.flag}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {is2DFranchiseIdol(idol.wiki_slug, idol.name) ? "2.5D企劃" : categoryName} · {idol.original_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-slate-900">
                          {formatNumber(idol.vote_count)}
                        </div>
                        <div className="text-[10px] text-slate-400">聲量點數</div>
                      </div>
                      <VoteButton idolId={idol.id} idolName={idol.name} size="sm" showText={false} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">落後者隨時可能發動下剋上逆襲！</span>
            <Link
              href="/idols"
              className="text-cyber-rose font-bold hover:underline flex items-center gap-1"
            >
              <span>查看全部 {idols.length} 位本命與角色</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 卡片 2: 進行中賽季大戰 */}
        {activeBattle && (
          <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-purple-100 text-cyber-violet rounded-full text-xs font-black">
                  熱戰進行中 · LIVE
                </span>
                <span className="text-xs font-mono text-slate-400">賽事編號 #01</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-cyber-violet transition-colors">
                {activeBattle.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {activeBattle.description}
              </p>

              <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 border border-slate-100">
                <SafeImage
                  src={activeBattle.banner_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"}
                  alt={activeBattle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs text-white font-medium">
                    終局之戰倒數：2026/09/30 23:59:59 截止
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">歷史對決與下剋上紀錄</span>
              <Link
                href="/battles"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                進入巔峰對決場
              </Link>
            </div>
          </div>
        )}

        {/* 卡片 3: 聯名許願池預告 */}
        {featuredCollab && (
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-rose-50 text-cyber-rose rounded-full text-xs font-black">
                  應援許願中 · Pledging
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {Math.round((featuredCollab.pledge_count / featuredCollab.pledge_goal) * 100)}% 達成
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                {featuredCollab.title}
              </h3>
              <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                {featuredCollab.details_markdown}
              </p>

              {/* 進度條 */}
              <div className="space-y-1.5 mb-4">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-rose to-amber-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (featuredCollab.pledge_count / featuredCollab.pledge_goal) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>已集氣 {formatNumber(featuredCollab.pledge_count)} 票</span>
                  <span>目標 {formatNumber(featuredCollab.pledge_goal)} 票</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">達標釋出門票抽獎</span>
              <Link
                href="/collabs"
                className="text-xs font-bold text-cyber-rose hover:underline flex items-center gap-1"
              >
                <span>立即參與聯名集氣</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 卡片 4: 官方限量周邊特企 */}
        {featuredProduct && (
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 p-6 flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <SafeImage
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute top-1.5 left-1.5 text-[9px] font-black bg-cyber-rose text-white px-1.5 py-0.5 rounded">
                  限定周邊
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-cyber-violet">
                  {featuredProduct.min_votes_to_buy > 0
                    ? `應援滿 ${featuredProduct.min_votes_to_buy} 票可購買`
                    : "免門檻開放預購"}
                </span>
                <h4 className="text-base font-black text-slate-900 line-clamp-2 mt-0.5 mb-1">
                  {featuredProduct.title}
                </h4>
                <div className="text-lg font-mono font-black text-cyber-rose">
                  {formatCurrency(featuredProduct.price)}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                  庫存剩餘 {featuredProduct.stock} 件 · 正品授權
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">宇沛實業直送防護包裝</span>
              <Link
                href="/store"
                className="px-4 py-2 bg-gradient-to-r from-cyber-rose to-cyber-violet text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all"
              >
                前往商城專區
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 伺服器能量贊助快速橫幅 (宇沛實業與華南銀行) */}
      <section className="bento-card p-6 sm:p-8 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyber-violet uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyber-rose" />
            <span>Server Fuel Support</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            守護 OshiPulse 跨國聲量競技場
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            每一份微小的補給，都是推動 OshiPulse 為更多偶像點亮舞台的能量。華南銀行民生分行 (008) · 戶名：宇沛實業股份有限公司。
          </p>
        </div>
        <button
          onClick={openDonateModal}
          className="shrink-0 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-all active:scale-95"
        >
          <HeartHandshake className="w-4 h-4 text-cyber-rose" />
          <span>前往能量補給贊助</span>
        </button>
      </section>
    </div>
  );
}
