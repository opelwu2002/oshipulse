"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { X, Copy, Check, HeartHandshake, ShieldCheck, Zap } from "lucide-react";

export default function SupportDonateModal() {
  const { isDonateModalOpen, closeDonateModal } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!isDonateModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText("126103063350");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={closeDonateModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-white shadow-lg shadow-cyber-rose/25">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyber-violet">Support Fuel</span>
            <h3 className="text-xl font-black text-slate-900">伺服器能量補給贊助 (Server Fuel Support)</h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          每一份微小的補給，都是推動 OshiPulse 為更多偶像點亮舞台的能量。感謝您守護這座跨國應援競技場！
        </p>

        {/* 銀行帳號卡片 */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyber-violet/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>受款銀行機構</span>
            <span className="font-semibold text-slate-800">華南銀行 民生分行 (銀行代碼：008)</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>戶名</span>
            <span className="font-semibold text-slate-800">宇沛實業股份有限公司</span>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">匯款帳號</div>
              <div className="text-lg sm:text-xl font-mono font-bold tracking-wider text-cyber-violet">
                126103063350
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-cyber-violet text-slate-700 hover:text-cyber-violet rounded-xl shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600">已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>複製帳號</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>贊助款項將全數投入伺服器高防護 CDN、防刷票運算算力與活動應援看板購置。</span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeDonateModal}
            className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-cyber-violet to-cyber-rose rounded-xl shadow-lg shadow-cyber-violet/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>我已完成支持，守護本命！</span>
          </button>
        </div>
      </div>
    </div>
  );
}
