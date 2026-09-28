"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { supabase } from "@/lib/supabase";
import { Heart, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface VoteButtonProps {
  idolId: string;
  idolName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  onVoted?: (newVoteCount: number) => void;
}

export default function VoteButton({
  idolId,
  idolName,
  size = "md",
  className = "",
  showText = true,
  onVoted,
}: VoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    isSoundEnabled,
    isVibrationEnabled,
    castVote: storeCastVote,
    currentMember,
  } = useAppStore();

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. 感官音效：Web Audio 氣泡音 (800Hz -> 1600Hz 於 0.05s 爬升)
      if (isSoundEnabled) {
        soundEngine.playBubblePop();
      }

      // 2. 觸覺震動：HTML5 雙震動模式 [15ms, 60ms, 25ms]
      if (isVibrationEnabled && typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([15, 60, 25]);
        } catch {
          // 靜默
        }
      }

      // 3. 視覺反饋：局域愛心五彩紙屑
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: ["#F43F5E", "#8B5CF6", "#F59E0B", "#FDA4AF"],
        shapes: ["circle"],
        scalar: 1.1,
        disableForReducedMotion: true,
      });

      // 4. 🚀 樂觀即時更新 (Optimistic UI Update)：立刻使前端畫面票數 +1
      storeCastVote(idolId);
      if (onVoted) {
        onVoted(1);
      }

      // 5. 彈出成功提示 Toast
      setToastMessage(`應援成功！票數 +1`);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);

      // 6. 🛡️ 直連 Supabase 資料庫原子寫入 (支援後端 API 與 RPC 雙重備援)
      const fingerprint = await getDeviceFingerprint();
      const userId = currentMember?.id || null;

      try {
        // 首選：呼叫專屬投票 API 執行原子累加並記錄審計
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idol_id: idolId,
            amount: 1,
            user_id: userId,
            fingerprint: fingerprint,
          }),
        });

        const json = await res.json();
        if (json.success && json.votes) {
          // 若 API 回傳資料庫最新票數，同步告知回呼函式
          if (onVoted) {
            onVoted(json.votes);
          }
        } else {
          // 備援方案：若 API 異常，客戶端直連 Supabase 呼叫 RPC 或 update
          const { data: rpcData, error: rpcErr } = await supabase.rpc(
            "increment_idol_votes",
            {
              target_idol_id: idolId,
              amount: 1,
            }
          );

          if (rpcErr) {
            // 次級備援：直連 idols 表更新
            const { data: idolRow } = await supabase
              .from("idols")
              .select("votes")
              .eq("id", idolId)
              .single();
            if (idolRow) {
              await supabase
                .from("idols")
                .update({ votes: (Number(idolRow.votes) || 0) + 1 })
                .eq("id", idolId);
            }
          } else if (rpcData && onVoted) {
            onVoted(Number(rpcData));
          }
        }
      } catch (networkErr) {
        console.warn("寫入 Supabase 資料庫異常，本地樂觀更新已生效:", networkErr);
      }
    } catch (err) {
      console.error("應援投票異常：", err);
    } finally {
      // 防連點冷卻機制：350 毫秒後解除載入狀態
      setTimeout(() => {
        setIsLoading(false);
      }, 350);
    }
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size];

  return (
    <div className="relative inline-block">
      {/* 應援成功靈動浮動 Toast 提示 */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900/95 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl border border-rose-500/40 backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
          <span>{toastMessage}</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>
      )}

      <button
        type="button"
        onClick={handleVote}
        disabled={isLoading}
        aria-label={`為 ${idolName} 應援投票`}
        className={`group relative flex items-center justify-center font-bold text-white rounded-full transition-all duration-200 active:scale-95 shadow-md shadow-cyber-rose/25 bg-gradient-to-r from-cyber-rose via-rose-500 to-cyber-violet hover:shadow-lg hover:shadow-cyber-rose/40 hover:brightness-105 disabled:opacity-85 cursor-pointer ${sizeClasses} ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Heart className="w-4 h-4 fill-white transition-transform group-hover:scale-125 group-active:scale-90" />
        )}
        {showText && (
          <span>{isLoading ? "注入中..." : "應援推一把"}</span>
        )}
      </button>
    </div>
  );
}
