"use client";

import React, { useState, useEffect } from "react";
import { MASCOT_QUOTES, MascotQuoteKey } from "@/lib/mascotQuotes";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, X, ChevronRight, Volume2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function MascotWidget() {
  const { idols, cart } = useAppStore();
  const [currentQuoteKey, setCurrentQuoteKey] = useState<MascotQuoteKey>("welcome");
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // 根據當前狀態智慧切換台詞
  useEffect(() => {
    const sorted = [...idols].sort((a, b) => b.vote_count - a.vote_count);
    if (sorted.length >= 2) {
      const delta = Math.abs(sorted[0].vote_count - sorted[1].vote_count);
      const total = sorted[0].vote_count + sorted[1].vote_count;
      if (total > 0 && delta / total < 0.05) {
        setCurrentQuoteKey("tension");
        return;
      }
    }

    if (cart.length === 0) {
      // 偶爾提醒購物車
    }
  }, [idols, cart.length]);

  const quoteKeys = Object.keys(MASCOT_QUOTES) as MascotQuoteKey[];

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = quoteKeys.indexOf(currentQuoteKey);
    const nextIndex = (currentIndex + 1) % quoteKeys.length;
    setCurrentQuoteKey(quoteKeys[nextIndex]);
  };

  if (dismissed) return null;

  return (
    <>
      {/* 桌面端：右下角懸浮藥丸膠囊 (fixed bottom-6 right-6 z-40 hidden sm:flex) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 items-end flex-col pointer-events-none">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="pointer-events-auto mb-2 max-w-xs bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xl shadow-slate-200/50 relative"
            >
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="收起對話"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-cyber-violet mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyber-violet" />
                <span>パルス君 (Pulse-kun) 播報</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium pr-3">
                {MASCOT_QUOTES[currentQuoteKey]}
              </p>

              <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                <button
                  onClick={handleNextQuote}
                  className="text-cyber-rose hover:underline font-bold flex items-center gap-0.5"
                >
                  <span>下一句語錄</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <span className="text-slate-400">點擊吉祥物互動</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 懸浮藥丸點擊按鈕 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl transition-transform active:scale-95 group border border-slate-700"
          aria-label="吉祥物帕ルス君"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-sm font-black text-white shadow-sm">
            ✦
          </div>
          <span className="text-xs font-bold tracking-wide group-hover:text-cyber-rose transition-colors">
            パルス君
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>
    </>
  );
}

/**
 * 行動端專用：輕量非侵入式播報組件
 * 放置於擂台或首頁頂部，完全不遮擋底部導覽列
 */
export function MobileMascotInline() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteKeys = Object.keys(MASCOT_QUOTES) as MascotQuoteKey[];

  const handleNext = () => {
    setQuoteIndex((prev) => (prev + 1) % quoteKeys.length);
  };

  const currentKey = quoteKeys[quoteIndex];

  return (
    <div
      onClick={handleNext}
      className="sm:hidden flex items-center gap-2.5 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-100 rounded-2xl p-2.5 mb-4 shadow-sm cursor-pointer active:scale-98 transition-all"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
        ✦
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] font-bold text-cyber-violet">
          <span>パルス君 (Pulse-kun)</span>
          <span className="text-slate-400">· 點擊切換</span>
        </div>
        <p className="text-xs text-slate-800 font-medium truncate">
          {MASCOT_QUOTES[currentKey]}
        </p>
      </div>
    </div>
  );
}
