"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { X, Copy, Check, Share2, Sparkles, MessageCircle } from "lucide-react";
import { MASCOT_QUOTES } from "@/lib/mascotQuotes";

export default function ShareModal() {
  const { isShareModalOpen, closeShareModal, shareIdol, addBonusVotes } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const targetName = shareIdol ? shareIdol.name : "全平台本命偶像";
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://oshipulse.upay.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addBonusVotes(1); // 成功分享即獎勵 1 張額外應援票
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={closeShareModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-white shadow-lg shadow-cyber-rose/25">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyber-rose">Kakusan Kibō</span>
            <h3 className="text-xl font-black text-slate-900">發動『擴散希望』！</h3>
          </div>
        </div>

        {/* 吉祥物語錄 */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3.5 mb-5 flex items-start gap-3">
          <span className="text-2xl select-none">⚡</span>
          <p className="text-xs text-purple-900 font-medium leading-relaxed">
            {MASCOT_QUOTES.referral}
          </p>
        </div>

        <p className="text-sm text-slate-600 mb-5">
          將專屬應援邀請連結分享給同好，為 <strong className="text-slate-900 font-bold">{targetName}</strong> 凝聚巨大聲量！每成功分享一次即可獲得額外應援票。
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-6 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-600 truncate pl-2">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shrink-0 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>已複製 +1 票</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>複製連結</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-cyber-violet to-cyber-rose rounded-xl shadow-lg shadow-cyber-rose/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>一鍵複製並領取應援能量票</span>
          </button>
        </div>
      </div>
    </div>
  );
}
