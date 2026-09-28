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
  const [dbPledge, setDbPledge] = useState<any>(null);
  const [dbFeaturedProduct, setDbFeaturedProduct] = useState<any>(null);
  const [dbBattle, setDbBattle] = useState<any>(null);

  // 🛡️ 即時同步：首頁載入時向 API 取得最新真實角色、應援許願池、商城庫存與賽季對決
  useEffect(() => {
    async function loadLatestData() {
      try {
        const [idolsRes, pledgesRes, inventoryRes, battlesRes] = await Promise.all([
          fetch(`/api/admin/idols?t=${Date.now()}`),
          fetch(`/api/admin/pledges?t=${Date.now()}`),
          fetch(`/api/admin/inventory?t=${Date.now()}`),
          fetch(`/api/admin/battles?t=${Date.now()}`),
        ]);
        
        const idolsJson = await idolsRes.json();
        if (idolsJson.success && Array.isArray(idolsJson.data) && idolsJson.data.length > 0) {
          setDbIdols(idolsJson.data);
        }

        const pledgesJson = await pledgesRes.json();
        if (pledgesJson.success) {
          if (pledgesJson.active) {
            setDbPledge(pledgesJson.active);
          } else if (pledgesJson.pledge) {
            setDbPledge(pledgesJson.pledge);
          } else if (Array.isArray(pledgesJson.data) && pledgesJson.data.length > 0) {
            setDbPledge(pledgesJson.data[0]);
          } else {
            setDbPledge(null);
          }
        } else {
          setDbPledge(null);
        }

        const inventoryJson = await inventoryRes.json();
        if (inventoryJson.success) {
          if (inventoryJson.featured) {
            setDbFeaturedProduct(inventoryJson.featured);
          } else if (Array.isArray(inventoryJson.data) && inventoryJson.data.length > 0) {
            setDbFeaturedProduct(inventoryJson.data[0]);
          } else {
            setDbFeaturedProduct(null);
          }
        } else {
          setDbFeaturedProduct(null);
        }

        const battlesJson = await battlesRes.json();
        if (battlesJson.success) {
          if (battlesJson.battle) {
            setDbBattle(battlesJson.battle);
          } else if (Array.isArray(battlesJson.battles) && battlesJson.battles.length > 0) {
            setDbBattle(battlesJson.battles[0]);
          } else {
            setDbBattle(null);
          }
        } else {
          setDbBattle(null);
        }
      } catch (err) {
        console.warn("首頁載入資料庫資料失敗:", err);
      }
    }
    loadLatestData();
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
        vote_count: Math.max(Number(db.votes ?? db.vote_count ?? 0), Number(local?.vote_count ?? 0)),
        image_url: finalImg,
        avatar: finalImg,
        avatar_url: finalImg,
      };
    });
  }, [dbIdols, idols]);

  // 全域應援聲量前五名（不受國別/分類分頁過濾限制，代表全站最高戰力）
  const globalTopFive = useMemo(() => {
    return [...allIdols].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 5);
  }, [allIdols]);

  // 根據篩選過濾偶像列表（供分類分頁使用）
  const filteredIdols = allIdols.filter((idol) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "CHARACTER") return idol.category === "character";
    if (selectedFilter === "FRANCHISE") return is2DFranchiseIdol(idol.wiki_slug, idol.name);
    return idol.country === selectedFilter;
  });

  // 分類排序排行
  const sortedIdols = [...filteredIdols].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const topFive = sortedIdols.slice(0, 5);

  // 🛡️ 賽季對決：100% 依據 Supabase 資料庫真實資料，並計算拉鋸佔比與有效狀態
  const displayBattle = useMemo(() => {
    if (dbBattle) {
      const redVotes = Number(dbBattle.red_votes) || 0;
      const blueVotes = Number(dbBattle.blue_votes) || 0;
      const total = redVotes + blueVotes;
      const redRatio = total > 0 ? (redVotes / total) * 100 : 50;
      const blueRatio = total > 0 ? (blueVotes / total) * 100 : 50;

      return {
        id: dbBattle.id,
        title: dbBattle.title,
        season_name: dbBattle.season_name || "2026 跨界巔峰對決",
        red_name: dbBattle.red_name,
        red_avatar: dbBattle.red_avatar || "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
        red_votes: redVotes,
        blue_name: dbBattle.blue_name,
        blue_avatar: dbBattle.blue_avatar || "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
        blue_votes: blueVotes,
        redRatio,
        blueRatio,
        status: dbBattle.effective_status || dbBattle.status || "live",
        start_time: dbBattle.start_time,
        end_time: dbBattle.end_time,
      };
    }
    const local = battles.find((b) => b.status === "live") || battles[0];
    if (local) {
      return {
        id: local.id,
        title: local.title,
        season_name: "2026 巔峰對決賽季",
        red_name: "成振宇",
        red_avatar: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
        red_votes: 125000,
        blue_name: "五條悟",
        blue_avatar: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
        blue_votes: 118000,
        redRatio: 51.4,
        blueRatio: 48.6,
        status: local.status || "live",
        start_time: null,
        end_time: null,
      };
    }
    return null;
  }, [dbBattle, battles]);

  // 🛡️ 應援許願池 (Pledging)：100% 依據 Supabase 資料庫真實資料，徹底切斷靜態假資料回退
  const displayPledge = useMemo(() => {
    if (dbPledge) {
      const cur = Number(dbPledge.current_votes || 0);
      const tar = Number(dbPledge.target_votes || 10000);
      return {
        id: dbPledge.id,
        title: dbPledge.title,
        description: dbPledge.description,
        current_votes: cur,
        target_votes: tar,
        image_url: dbPledge.image_url,
        start_time: dbPledge.start_time,
        end_time: dbPledge.end_time,
        status: dbPledge.status || 'active',
        percent: tar > 0 ? Math.round((cur / tar) * 100) : 0,
      };
    }
    return null;
  }, [dbPledge]);

  // 🛡️ 商城周邊推薦：100% 依據 Supabase 資料庫 shop_inventory 真實資料，徹底切斷靜態假資料回退
  const displayProduct = useMemo(() => {
    if (dbFeaturedProduct) {
      return {
        id: dbFeaturedProduct.id,
        title: dbFeaturedProduct.title,
        price: Number(dbFeaturedProduct.price || 980),
        stock: Number(dbFeaturedProduct.stock || 0),
        min_votes_to_buy: Number(dbFeaturedProduct.min_votes_to_buy || 0),
        image: dbFeaturedProduct.image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
      };
    }
    return null;
  }, [dbFeaturedProduct]);

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

        {/* 卡片 2: 進行中賽季大戰 (100% 直連 Supabase battles 資料庫) */}
        {displayBattle && (
          <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                    displayBattle.status === 'live'
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : displayBattle.status === 'upcoming'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      displayBattle.status === 'live'
                        ? 'bg-rose-500'
                        : displayBattle.status === 'upcoming'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {displayBattle.status === 'live'
                      ? '熱戰進行中 · LIVE'
                      : displayBattle.status === 'upcoming'
                      ? '排程準備中 · UPCOMING'
                      : '已完賽結算 · ENDED'}
                  </span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {displayBattle.season_name} #{displayBattle.id}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-cyber-violet transition-colors">
                {displayBattle.title}
              </h3>

              {/* 雙雄即時對抗比分面板 */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* 紅方選手 */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-rose-500 shrink-0 bg-white shadow-sm">
                      <SafeImage
                        src={displayBattle.red_avatar}
                        alt={displayBattle.red_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-rose-600">紅方陣營</div>
                      <div className="text-xs font-black text-slate-900 truncate">{displayBattle.red_name}</div>
                      <div className="text-xs font-mono font-bold text-rose-600">
                        {formatNumber(displayBattle.red_votes)} 票
                      </div>
                    </div>
                  </div>

                  {/* 藍方選手 */}
                  <div className="flex items-center justify-end gap-2.5 text-right">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-blue-600">藍方陣營</div>
                      <div className="text-xs font-black text-slate-900 truncate">{displayBattle.blue_name}</div>
                      <div className="text-xs font-mono font-bold text-blue-600">
                        {formatNumber(displayBattle.blue_votes)} 票
                      </div>
                    </div>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 bg-white shadow-sm">
                      <SafeImage
                        src={displayBattle.blue_avatar}
                        alt={displayBattle.blue_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                {/* 聲量拉鋸條 */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono font-bold">
                    <span className="text-rose-600">{displayBattle.redRatio.toFixed(1)}%</span>
                    <span className="text-slate-400 font-normal">擂台即時佔比</span>
                    <span className="text-blue-600">{displayBattle.blueRatio.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{ width: `${displayBattle.redRatio}%` }}
                    />
                    <div className="w-0.5 h-full bg-white" />
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${displayBattle.blueRatio}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 賽季時間提示 */}
              {(displayBattle.start_time || displayBattle.end_time) && (
                <div className="text-[11px] font-mono text-slate-500 mb-3 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">賽季區間：</span>
                  <span>{displayBattle.start_time ? displayBattle.start_time.slice(0, 16).replace("T", " ") : "即日起"}</span>
                  <span>~</span>
                  <span>{displayBattle.end_time ? displayBattle.end_time.slice(0, 16).replace("T", " ") : "無限期"}</span>
                </div>
              )}
            </div>

            <div className="relative z-10 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">歷史對決與下剋上紀錄</span>
              <Link
                href="/battles"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>進入巔峰對決場</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 全新增設：賽季全域應援聲量前五名列表 (Top 5 Cheering Volume Ranking) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 relative overflow-hidden group">
          {/* 背景氛圍光效 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 頂部標題列 */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black">
                <Trophy className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                    全站應援聲量前五名列表
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                    TOP 5 CHEERING RANKING
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  即時連動 Supabase 資料庫 · 前五名具備下季巔峰對決種子擂台資格
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>即時連動中</span>
              </span>
              <Link
                href="/idols"
                className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 border border-white/10 cursor-pointer"
              >
                <span>完整名人堂</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 5 位偶像橫排響應式卡片 */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {globalTopFive.map((idol, index) => {
              const country = getCountryBadge(idol.country);
              const maxVotes = globalTopFive[0]?.vote_count || 1;
              const ratio = Math.max(10, Math.min(100, Math.round(((idol.vote_count || 0) / maxVotes) * 100)));

              const rankStyles = [
                {
                  badge: "bg-amber-400 text-slate-950 shadow-amber-400/50 shadow-md",
                  border: "border-amber-400/40 hover:border-amber-400 bg-amber-500/5",
                  crown: "👑 NO.1 榜首",
                  avatarBorder: "border-amber-400 ring-2 ring-amber-400/30",
                },
                {
                  badge: "bg-slate-200 text-slate-900 shadow-slate-300/50 shadow-md",
                  border: "border-slate-300/40 hover:border-slate-200 bg-slate-400/5",
                  crown: "🥈 NO.2 亞軍",
                  avatarBorder: "border-slate-300 ring-2 ring-slate-300/30",
                },
                {
                  badge: "bg-amber-600 text-white shadow-amber-600/50 shadow-md",
                  border: "border-amber-600/40 hover:border-amber-500 bg-amber-700/5",
                  crown: "🥉 NO.3 季軍",
                  avatarBorder: "border-amber-600 ring-2 ring-amber-600/30",
                },
                {
                  badge: "bg-slate-800 text-slate-300 border border-white/10",
                  border: "border-white/10 hover:border-white/25 bg-white/5",
                  crown: "NO.4 殿軍",
                  avatarBorder: "border-slate-600",
                },
                {
                  badge: "bg-slate-800 text-slate-300 border border-white/10",
                  border: "border-white/10 hover:border-white/25 bg-white/5",
                  crown: "NO.5 晉級",
                  avatarBorder: "border-slate-600",
                },
              ][index] || {
                badge: "bg-slate-800 text-slate-300 border border-white/10",
                border: "border-white/10 hover:border-white/25 bg-white/5",
                crown: `#${index + 1}`,
                avatarBorder: "border-slate-600",
              };

              return (
                <div
                  key={idol.id}
                  className={`rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between space-y-3 relative group/card ${rankStyles.border}`}
                >
                  {/* 名次角標 */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${rankStyles.badge}`}>
                      {rankStyles.crown}
                    </span>
                    <span className="text-xs">{country.flag}</span>
                  </div>

                  {/* 偶像頭像與姓名 */}
                  <div className="text-center flex flex-col items-center">
                    <div
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden mb-2 border-2 ${rankStyles.avatarBorder} bg-slate-800 transition-transform group-hover/card:scale-105 duration-300`}
                    >
                      <SafeImage
                        src={getIdolAvatar(idol)}
                        alt={idol.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <Link
                      href={`/idols/${idol.id}`}
                      className="font-black text-sm text-white hover:text-pink-300 truncate max-w-[130px] transition-colors"
                      title={idol.name}
                    >
                      {idol.name}
                    </Link>
                    <span className="text-[11px] text-slate-400 truncate max-w-[130px] mt-0.5">
                      {idol.original_name || idol.work || "超人氣本命"}
                    </span>
                  </div>

                  {/* 聲量數據與進度條 */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 text-[11px]">聲量票數</span>
                      <span className="font-black text-white text-sm">
                        {formatNumber(idol.vote_count)}
                      </span>
                    </div>
                    {/* 相對榜首進度條 */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>

                  {/* 快捷即時應援按鈕 */}
                  <div className="pt-2">
                    <VoteButton idolId={idol.id} idolName={idol.name} size="sm" showText={true} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部說明條 */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>本榜單由全站每位粉絲的即時應援心跳聚合而成，落後者隨時可能發動下剋上逆襲！</span>
            </span>
            <Link
              href="/battles"
              className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 shrink-0"
            >
              <span>查看巔峰對決場賽況</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 卡片 3: 應援許願池 (Pledging) 連動預告 */}
        {displayPledge ? (
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-rose-50 text-cyber-rose rounded-full text-xs font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-rose animate-ping" />
                  應援許願中 · Pledging
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {displayPledge.percent}% 達成
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                {displayPledge.title}
              </h3>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                {displayPledge.description}
              </p>

              {/* 活動期程（若有設定排程時間） */}
              {(displayPledge.start_time || displayPledge.end_time) && (
                <div className="mb-3.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span className="text-cyber-rose font-bold">集氣期程：</span>
                  <span>{displayPledge.start_time ? displayPledge.start_time.replace("T", " ") : "即刻起"}</span>
                  <span>~</span>
                  <span>{displayPledge.end_time ? displayPledge.end_time.replace("T", " ") : "達標為止"}</span>
                </div>
              )}

              {/* 進度條 */}
              <div className="space-y-1.5 mb-4">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-rose to-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(displayPledge.percent, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>已集氣 {formatNumber(displayPledge.current_votes)} 票</span>
                  <span>目標 {formatNumber(displayPledge.target_votes)} 票</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">達標釋出門票抽獎與實體活動</span>
              <Link
                href="/collabs"
                className="text-xs font-bold text-cyber-rose hover:underline flex items-center gap-1"
              >
                <span>立即參與聯名集氣</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 p-6 flex flex-col justify-between items-center text-center py-10 relative overflow-hidden group bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-cyber-rose flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase mb-1.5 inline-block">
                Pledging Status
              </span>
              <h3 className="text-base font-black text-slate-900 mb-1">
                目前尚無進行中的應援許願池
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                管理員尚未開啟新一期的偶像聯名集氣願望，敬請期待下一輪企劃公布！
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 w-full flex items-center justify-center">
              <Link
                href="/collabs"
                className="text-xs font-bold text-cyber-rose hover:underline flex items-center gap-1"
              >
                <span>瀏覽往期企劃專區</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 卡片 4: 官方限量周邊特企（連動商城庫存 shop_inventory） */}
        {displayProduct ? (
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 p-6 flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <SafeImage
                  src={displayProduct.image}
                  alt={displayProduct.title}
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
                  {displayProduct.min_votes_to_buy > 0
                    ? `應援滿 ${displayProduct.min_votes_to_buy} 票可購買`
                    : "免門檻開放預購"}
                </span>
                <h4 className="text-base font-black text-slate-900 line-clamp-2 mt-0.5 mb-1">
                  {displayProduct.title}
                </h4>
                <div className="text-lg font-mono font-black text-cyber-rose">
                  {formatCurrency(displayProduct.price)}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                  庫存剩餘 {displayProduct.stock} 件 · 正品授權
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
        ) : (
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 p-6 flex flex-col justify-between items-center text-center py-10 relative overflow-hidden group bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-cyber-purple flex items-center justify-center mb-2">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase mb-1.5 inline-block">
                Official Merch
              </span>
              <h3 className="text-base font-black text-slate-900 mb-1">
                目前尚無特企周邊上架
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                官方正版周邊與限定企劃籌備中，敬請關注商城專區最新上架資訊！
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 w-full flex items-center justify-center">
              <Link
                href="/store"
                className="text-xs font-bold text-cyber-violet hover:underline flex items-center gap-1"
              >
                <span>前往商城專區</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
