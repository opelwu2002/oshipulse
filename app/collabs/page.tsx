"use client";

import React, { useState, useEffect, useMemo } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Gift,
  ExternalLink,
  Flame,
  Clock,
  Building2,
  CalendarX,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

// 格式化顯示中文起訖時間標籤
function formatDisplayDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

// 狀態標籤樣式與光點配置
function getStatusBadgeConfig(status?: string) {
  const s = status || "集氣連署中";
  switch (s) {
    case "洽談簽約中":
    case "商務洽談中":
      return {
        label: s,
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotStyle: "bg-emerald-500",
      };
    case "商務評估中":
      return {
        label: s,
        badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
        dotStyle: "bg-purple-500",
      };
    case "籌備募票中":
      return {
        label: s,
        badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
        dotStyle: "bg-amber-500",
      };
    case "募氣達標中":
    case "已達標":
      return {
        label: s,
        badgeStyle: "bg-yellow-50 text-yellow-800 border-yellow-300 font-black",
        dotStyle: "bg-yellow-500",
      };
    case "集氣連署中":
    default:
      return {
        label: s,
        badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
        dotStyle: "bg-rose-500",
      };
  }
}

const IMG_REGEX = /<!--__OSHI_IMAGE_URL__:(.*?)-->/;

// 智慧解析圖片網址（優先原生欄位，次之自主題元標籤提取）
function extractCollabImage(collab: any) {
  if (!collab) return collab;
  let imageUrl = collab.image_url || "";
  let cleanTheme = collab.theme || "";

  if (!imageUrl && cleanTheme) {
    const match = cleanTheme.match(IMG_REGEX);
    if (match && match[1]) {
      imageUrl = match[1].trim();
      cleanTheme = cleanTheme.replace(IMG_REGEX, "").trim();
    }
  }

  return {
    ...collab,
    theme: cleanTheme,
    image_url: imageUrl || null,
  };
}

// 智慧宣傳海報橫幅挑選
function getCollabBanner(collab: any): string {
  if (collab.image_url) return collab.image_url;
  if (collab.banner_url) return collab.banner_url;

  const text = `${collab.brand || ""} ${collab.idol || ""} ${collab.theme || ""}`;
  if (text.includes("五條悟") || text.includes("咒術")) {
    return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200";
  }
  if (text.includes("成振宇") || text.includes("獨自升級")) {
    return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200";
  }
  if (text.includes("張員瑛") || text.includes("IVE")) {
    return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200";
  }
  if (text.includes("咖啡") || text.includes("animate") || text.includes("安利美特")) {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200";
  }
  return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200";
}

export default function CollabsPage() {
  const { pledgeCollab } = useAppStore();
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbCollabs, setDbCollabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localVotesMap, setLocalVotesMap] = useState<Record<string, number>>({});
  const [pledgedSuccessId, setPledgedSuccessId] = useState<string | null>(null);

  // 🛡️ 100% 直連 Supabase 資料庫：載入官方特企 (events) 與 粉絲願望池 (collab_wishes)
  async function loadRealData() {
    setLoading(true);
    try {
      // 1. 直連 Supabase collab_wishes 資料表
      let wishesList: any[] = [];
      const { data: wishesData, error: wishesError } = await supabase
        .from("collab_wishes")
        .select("*")
        .order("id", { ascending: false });

      if (!wishesError && wishesData) {
        wishesList = wishesData;
      } else {
        // 備援：透過伺服器端管理員 API 讀取
        const collabsRes = await fetch(`/api/admin/collabs?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        });
        const collabsJson = await collabsRes.json();
        if (collabsJson.success && Array.isArray(collabsJson.data)) {
          wishesList = collabsJson.data;
        }
      }
      setDbCollabs(wishesList.map(extractCollabImage));

      // 2. 直連 Supabase events 資料表
      let eventsList: any[] = [];
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("id", { ascending: false });

      if (!eventsError && eventsData) {
        eventsList = eventsData;
      } else {
        // 備援：透過伺服器端管理員 API 讀取
        const eventsRes = await fetch(`/api/admin/events?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        });
        const eventsJson = await eventsRes.json();
        if (eventsJson.success && Array.isArray(eventsJson.data)) {
          eventsList = eventsJson.data;
        }
      }
      setDbEvents(eventsList);
    } catch (err) {
      console.warn("直連 Supabase 資料庫讀取失敗:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRealData();
  }, []);

  // 聯名許願清單：精準對應 Supabase collab_wishes 資料表真實欄位 (brand, idol, theme, votes, target, status, start_time, end_time)
  const displayCollabs = useMemo(() => {
    return dbCollabs.map((c) => {
      // 相容原生 votes 與 current_votes 欄位
      const baseVotes = Number(c.votes ?? c.current_votes ?? 0);
      const addedVotes = localVotesMap[String(c.id)] || 0;
      const currentVotes = baseVotes + addedVotes;
      // 相容原生 target 與 target_votes 欄位
      const targetVotes = Number(c.target ?? c.target_votes ?? 15000);
      const percent = targetVotes > 0 ? Math.min(Math.round((currentVotes / targetVotes) * 100), 100) : 0;
      const bannerUrl = getCollabBanner(c);

      return {
        id: String(c.id),
        title: c.theme || `${c.brand || "品牌"} × ${c.idol || "偶像"} 跨界聯名集氣企劃`,
        brand: c.brand || "跨界品牌",
        idolName: c.idol || "本命偶像",
        theme: c.theme || "主題企劃研擬中",
        details_markdown: `由全體粉絲共同發起的【${c.brand || "品牌"} × ${c.idol || "偶像"}】跨界夢幻連動！達標即可正式向官方團隊與企業品牌遞交連署計畫書，解鎖快閃特企與專屬特典！`,
        banner_url: bannerUrl,
        current_votes: currentVotes,
        target_votes: targetVotes,
        percent: percent,
        start_time: c.start_time,
        end_time: c.end_time,
        status: c.status || "集氣連署中",
      };
    });
  }, [dbCollabs, localVotesMap]);

  // 投票累加連動：樂觀更新 + 雙向真實寫入 Supabase 資料庫
  const handlePledge = async (collabId: string) => {
    // 1. 本地樂觀票數即時累加
    setLocalVotesMap((prev) => ({
      ...prev,
      [collabId]: (prev[collabId] || 0) + 1,
    }));
    setPledgedSuccessId(collabId);
    setTimeout(() => setPledgedSuccessId(null), 3000);

    // 2. 同步更新本地 Store 狀態
    pledgeCollab(collabId);

    // 3. 發送至後端 API 即時寫入 Supabase 資料庫 (原子累加)
    try {
      await fetch("/api/admin/collabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collabId, increment: 1 }),
      });
    } catch (err) {
      console.warn("同步連署票數至資料庫失敗:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 標題區域 */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black">
          <Gift className="w-3.5 h-3.5" />
          <span>粉絲願望池 · 官方巡迴與線下特企</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          特企展演與跨界願望池 (Events & Wish Pool)
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          推的力量能夠化為實體奇蹟！即時查看官方最新巡迴特展與快閃活動，或為本命集氣連署，達標即解鎖巨型戶外應援看板、快閃咖啡廳與海外專場見面會！
        </p>
      </div>

      {/* ===================================================================== */}
      {/* 區塊 1: 官方線下與線上特企展演 (Official Events) - 100% 直連 Supabase */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyber-rose fill-cyber-rose" />
            <h2 className="text-xl font-black text-slate-900">官方巡迴與主題特企 (Official Events)</h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
              {dbEvents.length} 檔火熱進行中
            </span>
          </div>
          <button
            type="button"
            onClick={loadRealData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="重新整理資料庫"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-mono animate-pulse">
            即時自 Supabase 資料庫連線載入特展排程中...
          </div>
        ) : dbEvents.length === 0 ? (
          <div className="bento-card p-12 text-center space-y-4 border border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-cyber-rose flex items-center justify-center mx-auto shadow-2xs">
              <CalendarX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">目前尚無舉辦中的官方巡迴與特企展演</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                後台資料庫已同步更新。新的官方特企巡演與線下見面會即將釋出，敬請鎖定官方最新排程公告！
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dbEvents.map((event) => {
              const locationText = event.location || event.address || "";
              const mapUrl =
                event.google_maps_url ||
                (locationText
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`
                  : "");
              const isPhysical =
                event.event_type === "線下實體展" || event.is_physical === true;
              const dateRange =
                (event.start_time || event.event_start_date) && (event.end_time || event.event_end_date)
                  ? `${formatDisplayDateTime(event.start_time || event.event_start_date)} ~ ${formatDisplayDateTime(event.end_time || event.event_end_date)}`
                  : "即日起熱烈開展中";

              return (
                <div
                  key={event.id}
                  className="bento-card p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-4">
                    {/* 宣傳海報（沉浸式雙層防裁切容器：底層柔光背景 + 頂層海報全貌 object-contain） */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 group/poster flex items-center justify-center">
                      {/* 底層柔光環境背景：以同張圖片做高斯模糊擴散填滿，避免兩側留下空洞黑邊 */}
                      <SafeImage
                        src={event.image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"}
                        alt=""
                        fill
                        className="object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none"
                        unoptimized
                        aria-hidden="true"
                      />
                      {/* 頂層主宣傳海報：object-contain 完整露出無裁切、無變形 */}
                      <SafeImage
                        src={event.image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"}
                        alt={event.title}
                        fill
                        className="relative z-10 object-contain p-2 drop-shadow-md group-hover/poster:scale-[1.02] transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white shadow-sm">
                          {event.status || "官方活動"}
                        </span>
                        {isPhysical && (
                          <span className="bg-rose-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white shadow-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white" />
                            <span>線下實體展</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 標題與簡介 */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 leading-snug">{event.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                    </div>

                    {/* 日期與會場 */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyber-violet shrink-0" />
                        <span className="font-mono">
                          舉辦期程：{dateRange}
                        </span>
                      </div>

                      {/* 實體會場與 Google Maps 連結 */}
                      {isPhysical && locationText && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                          {mapUrl && (
                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-cyan-700 shadow-2xs hover:scale-105 active:scale-95 transition-all"
                            >
                              <MapPin className="w-3 h-3 text-cyan-600" />
                              <span>導航</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 區塊 2: 粉絲願望池跨界連署 (Wish Pool) - 100% 直連 Supabase collab_wishes */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-black text-slate-900">粉絲跨界願望池 (Fan Wish Pool)</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              {displayCollabs.length} 個連署企劃火熱募集中
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              直連 Supabase 資料庫
            </span>
            <button
              type="button"
              onClick={loadRealData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="重新整理願望池"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-mono animate-pulse">
            即時自 Supabase 資料庫連線載入連署願望池中...
          </div>
        ) : displayCollabs.length === 0 ? (
          <div className="bento-card p-12 text-center space-y-4 border border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">目前尚無開放連署的跨界企劃</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                所有願望池項目皆與後台 CMS 資料庫即時連動，歡迎關注後續解鎖的全新企劃！
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayCollabs.map((collab) => {
              const percent = collab.percent;
              const isPledged = pledgedSuccessId === collab.id;
              const statusConfig = getStatusBadgeConfig(collab.status);

              return (
                <div
                  key={collab.id}
                  className="bento-card p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all group"
                >
                  <div className="space-y-4">
                    {/* 橫幅大圖（沉浸式雙層防裁切容器：底層柔光背景 + 頂層海報全貌 object-contain） */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 group/poster flex items-center justify-center">
                      {/* 底層柔光環境背景：以同張圖片做高斯模糊擴散填滿，避免兩側留下空洞黑邊 */}
                      <SafeImage
                        src={collab.banner_url}
                        alt=""
                        fill
                        className="object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none"
                        unoptimized
                        aria-hidden="true"
                      />
                      {/* 頂層主宣傳海報：object-contain 完整露出無裁切、無變形 */}
                      <SafeImage
                        src={collab.banner_url}
                        alt={collab.title}
                        fill
                        className="relative z-10 object-contain p-2 drop-shadow-md group-hover/poster:scale-[1.02] transition-transform duration-500"
                        unoptimized
                      />
                      {/* 進度達成角標 */}
                      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-cyber-rose shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyber-rose animate-pulse" />
                        <span>{percent >= 100 ? "🎉 已達標！即將落地" : `集氣進度 ${percent}%`}</span>
                      </div>

                      {/* 序號 ID 角標 */}
                      <div className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-200">
                        #{collab.id}
                      </div>
                    </div>

                    {/* 主題與內容 */}
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 品牌標籤 */}
                        {collab.brand && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-cyber-violet bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{collab.brand}</span>
                          </span>
                        )}

                        {/* 偶像標籤 */}
                        {collab.idolName && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                            <span>✦</span>
                            <span>{collab.idolName}</span>
                          </span>
                        )}

                        {/* 動態狀態標籤 (如：商務評估中、洽談簽約中、籌備募票中) */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${statusConfig.badgeStyle}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotStyle}`} />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>

                      {/* 企劃標題 */}
                      <h3 className="text-xl font-black text-slate-900 leading-snug group-hover:text-cyber-rose transition-colors">
                        {collab.title}
                      </h3>

                      {/* 企劃描述 */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {collab.details_markdown}
                      </p>
                    </div>

                    {/* 活動時間區間排程 (若後台有設定起訖時間) */}
                    {(collab.start_time || collab.end_time) && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs text-slate-600 font-mono">
                        <Clock className="w-3.5 h-3.5 text-cyber-rose shrink-0" />
                        <span>
                          集氣期程：
                          {collab.start_time ? formatDisplayDateTime(collab.start_time) : "即日起"}
                          {" ~ "}
                          {collab.end_time ? formatDisplayDateTime(collab.end_time) : "無限期達標為止"}
                        </span>
                      </div>
                    )}

                    {/* 集氣進度條與數值 */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-cyber-rose" />
                          <span>已凝聚 {formatNumber(collab.current_votes)} 人次連署</span>
                        </span>
                        <span className="text-slate-500">
                          目標門檻 {formatNumber(collab.target_votes)} 人次
                        </span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                        <div
                          className="h-full bg-gradient-to-r from-cyber-rose via-rose-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => handlePledge(collab.id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                        isPledged
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                      }`}
                    >
                      {isPledged ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 animate-bounce" />
                          <span>連署集氣成功！+1 票</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>注入連署力量 (+1 願望)</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                      <Ticket className="w-4 h-4 text-cyber-rose" />
                      <span>達標無償抽票</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
