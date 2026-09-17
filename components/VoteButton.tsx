"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { Heart, Loader2 } from "lucide-react";

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

  const {
    isSoundEnabled,
    isVibrationEnabled,
    castVote: storeCastVote,
    useBonusVote,
  } = useAppStore();

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. 感官音效：Web Audio 短氣泡音 (800Hz -> 1600Hz 於 0.05s 爬升)
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
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: ["#F43F5E", "#8B5CF6", "#F59E0B", "#FDA4AF"],
        shapes: ["circle"],
        scalar: 1.1,
        disableForReducedMotion: true,
      });

      // 4. 純本機離線防弊與投票處理
      const fingerprint = await getDeviceFingerprint();
      const todayStr = new Date().toISOString().split("T")[0];
      const votedKey = `voted_${todayStr}_${fingerprint}`;
      const hasVotedToday = localStorage.getItem(votedKey);

      if (hasVotedToday) {
        // 嘗試扣抵擴散希望贈票
        const usedBonus = useBonusVote();
        if (!usedBonus) {
          alert("今日該設備投票額度已達上限！可點擊右上角發動『擴散希望』獲取額外能量票！");
        } else {
          storeCastVote(idolId);
        }
      } else {
        localStorage.setItem(votedKey, "true");
        storeCastVote(idolId);
      }

      if (onVoted) {
        onVoted(1);
      }
    } catch (err) {
      console.error("本地投票異常：", err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size];

  return (
    <div className="relative inline-block">
      <button
        onClick={handleVote}
        disabled={isLoading}
        aria-label={`為 ${idolName} 應援投票`}
        className={`group relative flex items-center justify-center font-bold text-white rounded-full transition-all duration-200 active:scale-95 shadow-md shadow-cyber-rose/25 bg-gradient-to-r from-cyber-rose via-rose-500 to-cyber-violet hover:shadow-lg hover:shadow-cyber-rose/40 hover:brightness-105 disabled:opacity-75 cursor-pointer ${sizeClasses} ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className="w-4 h-4 fill-white transition-transform group-hover:scale-125 group-active:scale-90" />
        )}
        {showText && <span>{isLoading ? "注入中..." : "應援推一把"}</span>}
      </button>
    </div>
  );
}
