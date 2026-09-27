"use client";

import React, { useState, useEffect, useRef } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import { formatNumber, getCountryBadge, getIdolAvatar } from "@/lib/utils";
import VoteButton from "./VoteButton";
import {
  Flame,
  Swords,
  Share2,
  Download,
  Sparkles,
  Trophy,
  AlertTriangle,
  Zap,
  Heart,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
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

export default function TugOfWarArena() {
  const { idols, openShareModal, syncIdolsFromApi, isSoundEnabled, isVibrationEnabled } = useAppStore();

  // 🌟 資料庫 battles 動態連動狀態
  const [dbBattle, setDbBattle] = useState<any>(null);
  const [votingSide, setVotingSide] = useState<"red" | "blue" | null>(null);

  // 🛡️ 即時同步：進入頁面時向 API 取得最新真實對決與角色資料
  useEffect(() => {
    syncIdolsFromApi?.();
    fetchLiveBattle();
  }, [syncIdolsFromApi]);

  const fetchLiveBattle = async () => {
    try {
      const res = await fetch(`/api/admin/battles?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });
      const json = await res.json();
      if (json.success && json.battle) {
        setDbBattle(json.battle);
      }
    } catch (err) {
      console.warn("載入資料庫對決失敗，使用偶像榜首備援:", err);
    }
  };

  // 本地備援：取得偶像榜首前兩名
  const sorted = [...idols].sort((a, b) => b.vote_count - a.vote_count);
  const fallbackRank1 = sorted[0];
  const fallbackRank2 = sorted[1];

  // 決定目前擂台戰況資料來源（資料庫優先，降級至 idols 前兩名）
  const isFromDb = Boolean(dbBattle);
  const battleStatus: "live" | "upcoming" | "ended" =
    isFromDb && dbBattle?.status ? dbBattle.status : "live";
  const battleStartTime = isFromDb ? dbBattle?.start_time : null;
  const battleEndTime = isFromDb ? dbBattle?.end_time : null;

  const competitorA = isFromDb
    ? {
        name: dbBattle.red_name,
        avatar: dbBattle.red_avatar || "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
        vote_count: Number(dbBattle.red_votes) || 0,
        id: "red",
        subText: "紅方陣營",
        side: "red" as const,
      }
    : {
        name: fallbackRank1?.name || "成振宇",
        avatar: getIdolAvatar(fallbackRank1),
        vote_count: fallbackRank1?.vote_count || 128400,
        id: fallbackRank1?.id || "rank1",
        subText: fallbackRank1?.original_name || "《我獨自升級》",
        side: "red" as const,
      };

  const competitorB = isFromDb
    ? {
        name: dbBattle.blue_name,
        avatar: dbBattle.blue_avatar || "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
        vote_count: Number(dbBattle.blue_votes) || 0,
        id: "blue",
        subText: "藍方陣營",
        side: "blue" as const,
      }
    : {
        name: fallbackRank2?.name || "五條悟",
        avatar: getIdolAvatar(fallbackRank2),
        vote_count: fallbackRank2?.vote_count || 116500,
        id: fallbackRank2?.id || "rank2",
        subText: fallbackRank2?.original_name || "《咒術迴戰》",
        side: "blue" as const,
      };

  const arenaTitle = isFromDb
    ? dbBattle.title || "即時巔峰對決擂台"
    : "即時巔峰對決擂台 (Tug of War)";
  const seasonBadge = isFromDb
    ? dbBattle.season_name || "Season 1 終局決戰"
    : "2026 跨界巔峰對決";

  // 比例計算
  const totalVotes = competitorA.vote_count + competitorB.vote_count;
  const ratioA = totalVotes > 0 ? (competitorA.vote_count / totalVotes) * 100 : 50;
  const ratioB = totalVotes > 0 ? (competitorB.vote_count / totalVotes) * 100 : 50;
  const deltaPercent = Math.abs(ratioA - ratioB);
  const isTense = deltaPercent < 5; // 差距小於 5% 進入死守線

  // 下剋上逆轉偵測
  const prevLeaderRef = useRef<string | null>(
    competitorA.vote_count >= competitorB.vote_count ? competitorA.name : competitorB.name
  );
  const [justOvertaken, setJustOvertaken] = useState(false);
  const [overtakeToast, setOvertakeToast] = useState<string | null>(null);

  // IG Story 卡片截圖 DOM 參照
  const cardCaptureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 偵測排名更替（下剋上逆轉）
  useEffect(() => {
    const currentLeader = competitorA.vote_count >= competitorB.vote_count ? competitorA.name : competitorB.name;
    if (prevLeaderRef.current && prevLeaderRef.current !== currentLeader) {
      soundEngine.playCrystalChime();
      setJustOvertaken(true);
      setOvertakeToast(`【下剋上達成】${currentLeader} 逆轉取得領先！`);

      const timer = setTimeout(() => {
        setJustOvertaken(false);
        setOvertakeToast(null);
      }, 4500);

      prevLeaderRef.current = currentLeader;
      return () => clearTimeout(timer);
    }
    prevLeaderRef.current = currentLeader;
  }, [competitorA.vote_count, competitorB.vote_count, competitorA.name, competitorB.name]);

  // 🔥 資料庫雙向即時應援投票處理 (Real-Time Bidirectional Sync)
  const handleVoteSide = async (side: "red" | "blue", e: React.MouseEvent) => {
    e.stopPropagation();
    if (votingSide) return;
    if (isFromDb && battleStatus !== "live") return;
    setVotingSide(side);

    try {
      // 1. 感官音效與震動
      if (isSoundEnabled) soundEngine.playBubblePop();
      if (isVibrationEnabled && typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([15, 60, 25]);
        } catch {
          // 靜默
        }
      }

      // 2. 視覺特效：愛心彩紙噴發
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: side === "red" ? ["#F43F5E", "#FDA4AF", "#FB7185"] : ["#3B82F6", "#60A5FA", "#93C5FD"],
        shapes: ["circle"],
        scalar: 1.1,
        disableForReducedMotion: true,
      });

      // 3. 樂觀即時更新狀態 (Optimistic UI Update)
      if (isFromDb && dbBattle) {
        setDbBattle((prev: any) => ({
          ...prev,
          red_votes: side === "red" ? (Number(prev.red_votes) || 0) + 1 : prev.red_votes,
          blue_votes: side === "blue" ? (Number(prev.blue_votes) || 0) + 1 : prev.blue_votes,
        }));

        // 4. 背景非同步向 API 寫入 Supabase 資料庫
        fetch("/api/admin/battles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: dbBattle.id,
            vote_side: side,
            increment: 1,
          }),
        }).catch((err) => console.error("對決應援寫入資料庫失敗:", err));
      }
    } catch (err) {
      console.error("應援投票異常:", err);
    } finally {
      setTimeout(() => setVotingSide(null), 300);
    }
  };

  // 一鍵生成 9:16 IG Story 宣傳卡
  const handleExportStoryCard = async () => {
    if (!cardCaptureRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(cardCaptureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `OshiPulse_Story_${competitorA.name}_vs_${competitorB.name}.png`;
      link.click();
    } catch (err) {
      console.error("IG限動卡生成失敗：", err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* 下剋上逆轉彈窗 Toast */}
      <AnimatePresence>
        {overtakeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-cyber-rose via-purple-600 to-amber-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-cyber-rose/50 border-2 border-white"
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>{overtakeToast}</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">キターー！</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 擂台主卡片 (可被截圖區域) */}
      <div
        ref={cardCaptureRef}
        className="relative bg-white border-2 border-slate-100 rounded-3xl p-5 sm:p-8 shadow-xl overflow-hidden"
      >
        {/* 背景裝飾光暈 */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 擂台頂部資訊條 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {battleStatus === "live" ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-rose opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-rose"></span>
              </span>
            ) : battleStatus === "upcoming" ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600">
                <Clock className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}

            <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm sm:text-base">
              <Swords className="w-5 h-5 text-cyber-rose" />
              <span>{arenaTitle}</span>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-cyber-purple border border-purple-100">
              {seasonBadge}
            </span>

            {/* 賽季狀態標籤 */}
            {battleStatus === "live" ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● 進行中 (LIVE)
              </span>
            ) : battleStatus === "upcoming" ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                ⏳ 排程準備中 (Upcoming)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                🏁 已完賽結算 (Ended)
              </span>
            )}

            {/* 賽季起訖時間標籤 */}
            {(battleStartTime || battleEndTime) && (
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-pink-500" />
                <span>
                  {battleStartTime ? formatDisplayDateTime(battleStartTime) : "即日起"}
                  {" ~ "}
                  {battleEndTime ? formatDisplayDateTime(battleEndTime) : "無限期"}
                </span>
              </span>
            )}
          </div>

          {/* 緊張死守線指示標 */}
          <div className="flex items-center gap-2">
            {battleStatus === "live" && isTense && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-cyber-rose border border-rose-200 rounded-full text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-cyber-rose" />
                <span>差距 {deltaPercent.toFixed(1)}%：死守拉鋸線！</span>
              </div>
            )}
            <button
              onClick={handleExportStoryCard}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-cyber-violet bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-full transition-all shadow-sm cursor-pointer"
              title="匯出 9:16 IG限動應援卡"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isCapturing ? "生成中..." : "9:16 IG限動卡"}</span>
            </button>
          </div>
        </div>

        {/* 雙雄頭像與數據對立展示 */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 items-center mb-6">
          {/* 選手 A (紅方) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <motion.div
                animate={
                  justOvertaken && competitorA.vote_count >= competitorB.vote_count
                    ? { scale: [1, 1.18, 1], rotate: [0, -3, 3, 0] }
                    : { scale: 1 }
                }
                transition={{ type: "spring", damping: 10, stiffness: 200 }}
                className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 ${
                  competitorA.vote_count >= competitorB.vote_count
                    ? "border-amber-400 shadow-lg shadow-amber-400/20"
                    : isTense && battleStatus === "live"
                    ? "border-cyber-rose ring-4 ring-rose-400/40 animate-pulse"
                    : "border-slate-300 shadow-md"
                }`}
              >
                <SafeImage
                  src={competitorA.avatar}
                  alt={competitorA.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 112px"
                  unoptimized
                />
              </motion.div>

              {/* 冠軍金冠或領先標記 */}
              {competitorA.vote_count >= competitorB.vote_count && (
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md"
                  title={battleStatus === "ended" ? "賽季衛冕冠軍" : "即時領先"}
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {competitorA.name}
              </span>
            </div>

            {/* 陣營與名次標籤 */}
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-rose-600 font-bold">{competitorA.subText}</span>
              {battleStatus === "ended" && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    competitorA.vote_count >= competitorB.vote_count
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {competitorA.vote_count >= competitorB.vote_count ? "🏆 衛冕冠軍" : "🥈 準優勝"}
                </span>
              )}
            </div>

            <div className="text-lg sm:text-2xl font-black text-rose-600 mb-3 font-mono">
              {formatNumber(competitorA.vote_count)} <span className="text-xs font-normal text-slate-500">票</span>
            </div>

            {/* 即時應援按鈕（依狀態切換） */}
            {isFromDb ? (
              battleStatus === "live" ? (
                <button
                  onClick={(e) => handleVoteSide("red", e)}
                  disabled={votingSide === "red"}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {votingSide === "red" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>為紅方應援 (+1)</span>
                </button>
              ) : battleStatus === "upcoming" ? (
                <button
                  disabled
                  className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 cursor-not-allowed opacity-80 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏳ 敬請期待開賽</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200 cursor-not-allowed opacity-80 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>🏁 賽季已結算</span>
                </button>
              )
            ) : (
              <VoteButton idolId={competitorA.id} idolName={competitorA.name} size="sm" />
            )}
          </div>

          {/* 選手 B (藍方) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <motion.div
                animate={
                  justOvertaken && competitorB.vote_count > competitorA.vote_count
                    ? { scale: [1, 1.18, 1], rotate: [0, -3, 3, 0] }
                    : { scale: 1 }
                }
                transition={{ type: "spring", damping: 10, stiffness: 200 }}
                className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 ${
                  competitorB.vote_count > competitorA.vote_count
                    ? "border-amber-400 shadow-lg shadow-amber-400/20"
                    : isTense && battleStatus === "live"
                    ? "border-blue-500 ring-4 ring-blue-400/40 animate-pulse"
                    : "border-slate-300 shadow-md"
                }`}
              >
                <SafeImage
                  src={competitorB.avatar}
                  alt={competitorB.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 112px"
                  unoptimized
                />
              </motion.div>

              {/* 冠軍金冠或領先標記 */}
              {competitorB.vote_count > competitorA.vote_count && (
                <div
                  className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md"
                  title={battleStatus === "ended" ? "賽季衛冕冠軍" : "即時領先"}
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {competitorB.name}
              </span>
            </div>

            {/* 陣營與名次標籤 */}
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-blue-600 font-bold">{competitorB.subText}</span>
              {battleStatus === "ended" && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    competitorB.vote_count > competitorA.vote_count
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {competitorB.vote_count > competitorA.vote_count ? "🏆 衛冕冠軍" : "🥈 準優勝"}
                </span>
              )}
            </div>

            <div className="text-lg sm:text-2xl font-black text-blue-600 mb-3 font-mono">
              {formatNumber(competitorB.vote_count)} <span className="text-xs font-normal text-slate-500">票</span>
            </div>

            {/* 即時應援按鈕（依狀態切換） */}
            {isFromDb ? (
              battleStatus === "live" ? (
                <button
                  onClick={(e) => handleVoteSide("blue", e)}
                  disabled={votingSide === "blue"}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {votingSide === "blue" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>為藍方應援 (+1)</span>
                </button>
              ) : battleStatus === "upcoming" ? (
                <button
                  disabled
                  className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 cursor-not-allowed opacity-80 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏳ 敬請期待開賽</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200 cursor-not-allowed opacity-80 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>🏁 賽季已結算</span>
                </button>
              )
            ) : (
              <VoteButton idolId={competitorB.id} idolName={competitorB.name} size="sm" />
            )}
          </div>
        </div>

        {/* 動態拔河拉扯比例條 (Framer Motion) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-rose-600">{ratioA.toFixed(1)}%</span>
            <span className="text-slate-400 font-medium">即時聲量佔比</span>
            <span className="text-blue-600">{ratioB.toFixed(1)}%</span>
          </div>

          <div className="relative h-4 sm:h-5 bg-slate-100 rounded-full overflow-hidden p-0.5 flex">
            {/* 選手 A 能量佔比 */}
            <motion.div
              className="h-full rounded-l-full bg-gradient-to-r from-rose-500 to-pink-500 relative"
              initial={{ width: "50%" }}
              animate={{ width: `${ratioA}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
            {/* 中間拉扯分界線 */}
            <div className="w-1 h-full bg-white z-10 shadow-md" />
            {/* 選手 B 能量佔比 */}
            <motion.div
              className="h-full rounded-r-full bg-gradient-to-r from-blue-500 to-indigo-500 relative"
              initial={{ width: "50%" }}
              animate={{ width: `${ratioB}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>
              {battleStatus === "ended"
                ? `🏁 賽季已結算 · 最終票數差距：${formatNumber(Math.abs(competitorA.vote_count - competitorB.vote_count))} 票`
                : battleStatus === "upcoming"
                ? `⏳ 賽季籌備中 · 初始票數差距：${formatNumber(Math.abs(competitorA.vote_count - competitorB.vote_count))} 票`
                : `票數差距：${formatNumber(Math.abs(competitorA.vote_count - competitorB.vote_count))} 票`}
            </span>
            {battleStatus === "live" ? (
              <button
                onClick={() => openShareModal()}
                className="flex items-center gap-1 text-cyber-rose hover:underline font-bold cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>發動擴散希望領取能量票！</span>
              </button>
            ) : battleStatus === "upcoming" ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>賽季即將開打，請先於修煉所備戰！</span>
              </span>
            ) : (
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>賽季圓滿結算，恭喜衛冕贏家！</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
