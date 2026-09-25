"use client";

import React, { useState, useEffect, useRef } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
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
} from "lucide-react";
import { MASCOT_QUOTES } from "@/lib/mascotQuotes";

export default function TugOfWarArena() {
  const { idols, openShareModal, syncIdolsFromApi } = useAppStore();

  // 🛡️ 即時同步：進入頁面時向 API 取得最新真實角色與立繪
  useEffect(() => {
    syncIdolsFromApi?.();
  }, [syncIdolsFromApi]);

  // 取得前兩名
  const sorted = [...idols].sort((a, b) => b.vote_count - a.vote_count);
  const rank1 = sorted[0];
  const rank2 = sorted[1];

  // 記錄前一次排名狀態以偵測「下剋上」逆轉事件
  const prevRank1IdRef = useRef<string | null>(rank1 ? rank1.id : null);
  const [justOvertaken, setJustOvertaken] = useState(false);
  const [overtakeToast, setOvertakeToast] = useState<string | null>(null);

  // IG Story 卡片截圖 DOM 參照
  const cardCaptureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 比例計算
  const totalVotes = (rank1?.vote_count || 0) + (rank2?.vote_count || 0);
  const ratio1 = totalVotes > 0 ? (rank1.vote_count / totalVotes) * 100 : 50;
  const ratio2 = totalVotes > 0 ? (rank2.vote_count / totalVotes) * 100 : 50;
  const deltaPercent = Math.abs(ratio1 - ratio2);
  const isTense = deltaPercent < 5; // 差距小於 5% 進入死守線

  // 偵測排名更替（下剋上逆轉）
  useEffect(() => {
    if (!rank1) return;
    if (prevRank1IdRef.current && prevRank1IdRef.current !== rank1.id) {
      // 觸發下剋上逆轉！
      soundEngine.playCrystalChime();
      setJustOvertaken(true);
      setOvertakeToast("【下剋上達成】領先 1 票！");

      const timer = setTimeout(() => {
        setJustOvertaken(false);
        setOvertakeToast(null);
      }, 4500);

      prevRank1IdRef.current = rank1.id;
      return () => clearTimeout(timer);
    }
    prevRank1IdRef.current = rank1.id;
  }, [rank1?.id, rank1?.vote_count]);

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
      link.download = `OshiPulse_Story_${rank1?.name}_vs_${rank2?.name}.png`;
      link.click();
    } catch (err) {
      console.error("IG限動卡生成失敗：", err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!rank1 || !rank2) return null;

  const country1 = getCountryBadge(rank1.country);
  const country2 = getCountryBadge(rank2.country);

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
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-rose opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-rose"></span>
            </span>
            <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm sm:text-base">
              <Swords className="w-5 h-5 text-cyber-rose" />
              <span>即時巔峰對決擂台 (Tug of War)</span>
            </div>
          </div>

          {/* 緊張死守線指示標 */}
          <div className="flex items-center gap-2">
            {isTense && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-cyber-rose border border-rose-200 rounded-full text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-cyber-rose" />
                <span>差距 {deltaPercent.toFixed(1)}%：死守拉鋸線！</span>
              </div>
            )}
            <button
              onClick={handleExportStoryCard}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-cyber-violet bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-full transition-all shadow-sm"
              title="匯出 9:16 IG限動應援卡"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isCapturing ? "生成中..." : "9:16 IG限動卡"}</span>
            </button>
          </div>
        </div>

        {/* 雙雄頭像與數據對立展示 */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 items-center mb-6">
          {/* Rank 1 選手 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <motion.div
                animate={
                  justOvertaken
                    ? { scale: [1, 1.18, 1], rotate: [0, -3, 3, 0] }
                    : { scale: 1 }
                }
                transition={{ type: "spring", damping: 10, stiffness: 200 }}
                className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 ${
                  isTense
                    ? "border-cyber-rose ring-4 ring-rose-400/40 animate-pulse"
                    : "border-amber-400 shadow-lg shadow-amber-400/20"
                }`}
              >
                <SafeImage
                  src={getIdolAvatar(rank1)}
                  alt={rank1.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 112px"
                  unoptimized
                />
              </motion.div>
              {/* 王座皇冠標籤 */}
              <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md">
                <Trophy className="w-4 h-4 text-slate-950" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs">{country1.flag}</span>
              <Link
                href={`/idols/${rank1.id}`}
                className="text-base sm:text-lg font-black text-slate-900 hover:text-cyber-violet transition-colors"
              >
                {rank1.name}
              </Link>
            </div>
            <div className="text-xs text-slate-400 mb-2">{rank1.original_name}</div>
            <div className="text-lg sm:text-2xl font-black text-cyber-violet mb-3 font-mono">
              {formatNumber(rank1.vote_count)} <span className="text-xs font-normal text-slate-500">票</span>
            </div>

            <VoteButton idolId={rank1.id} idolName={rank1.name} size="sm" />
          </div>

          {/* Rank 2 選手 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div
                className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 ${
                  isTense
                    ? "border-cyber-rose ring-4 ring-rose-400/40 animate-pulse"
                    : "border-slate-300 shadow-md"
                }`}
              >
                <SafeImage
                  src={getIdolAvatar(rank2)}
                  alt={rank2.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 112px"
                  unoptimized
                />
              </div>
              <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs shadow-md">
                #2
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs">{country2.flag}</span>
              <Link
                href={`/idols/${rank2.id}`}
                className="text-base sm:text-lg font-black text-slate-900 hover:text-cyber-rose transition-colors"
              >
                {rank2.name}
              </Link>
            </div>
            <div className="text-xs text-slate-400 mb-2">{rank2.original_name}</div>
            <div className="text-lg sm:text-2xl font-black text-cyber-rose mb-3 font-mono">
              {formatNumber(rank2.vote_count)} <span className="text-xs font-normal text-slate-500">票</span>
            </div>

            <VoteButton idolId={rank2.id} idolName={rank2.name} size="sm" />
          </div>
        </div>

        {/* 動態拔河拉扯比例條 (Framer Motion) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-cyber-violet">{ratio1.toFixed(1)}%</span>
            <span className="text-slate-400 font-medium">即時聲量佔比</span>
            <span className="text-cyber-rose">{ratio2.toFixed(1)}%</span>
          </div>

          <div className="relative h-4 sm:h-5 bg-slate-100 rounded-full overflow-hidden p-0.5 flex">
            {/* Rank 1 能量佔比 */}
            <motion.div
              className="h-full rounded-l-full bg-gradient-to-r from-purple-500 to-cyber-violet relative"
              initial={{ width: "50%" }}
              animate={{ width: `${ratio1}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
            {/* 中間拉扯分界線 */}
            <div className="w-1 h-full bg-white z-10 shadow-md" />
            {/* Rank 2 能量佔比 */}
            <motion.div
              className="h-full rounded-r-full bg-gradient-to-r from-cyber-rose to-rose-400 relative"
              initial={{ width: "50%" }}
              animate={{ width: `${ratio2}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>票數領先：+{formatNumber(Math.abs(rank1.vote_count - rank2.vote_count))} 票</span>
            <button
              onClick={() => openShareModal(rank2)}
              className="flex items-center gap-1 text-cyber-rose hover:underline font-bold"
            >
              <Zap className="w-3 h-3" />
              <span>為第 2 名助力下剋上！</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
