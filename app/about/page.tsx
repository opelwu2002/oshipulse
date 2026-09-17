"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Flame,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  Zap,
  Copy,
  Check,
  HeartHandshake,
  Globe2,
} from "lucide-react";

export default function AboutPage() {
  const { openDonateModal } = useAppStore();
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("126103063350");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 標題與引言 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-cyber-violet text-xs font-black">
          <Flame className="w-4 h-4 fill-cyber-violet" />
          <span>OshiPulse 官方理念宣言</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          讓每一份「推」的心跳，
          <br />
          都能激盪迴響
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          跨越美、日、中、台、韓五國應援文化，打造最純粹、公平與熱血的跨界聲量競技殿堂。
        </p>
      </div>

      {/* 平台宣言三部曲 (嚴格遵守指定文案) */}
      <div className="bento-card p-6 sm:p-10 space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        <div className="border-l-4 border-cyber-rose pl-4 sm:pl-6 py-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            【讓每一份「推」的心跳，都能激盪迴響】
          </h2>
          <p className="text-slate-600">
            在這個多元奔放的時代，偶像不只是舞台上的光芒，更是陪伴我們穿越日常迷惘、賦予我們前行勇氣的靈魂寄託。無論是震撼巨蛋的實力歌手、銀幕上動人心魄的演員、賦予角色生命的聲優，亦或是穿梭於數位浪潮的虛擬偶像與網路創作者——每一位全心投入的「本命（推し）」，都值得擁有最熱烈的掌聲。
          </p>
        </div>

        <div className="border-l-4 border-cyber-violet pl-4 sm:pl-6 py-1">
          <p className="text-slate-600">
            然而，真正的熱愛不該被虛假的機器人刷票所掩蓋。<strong>OshiPulse (推しパルス)</strong> 誕生於一個純粹的信念：打造一個公平、透明且充滿激情的跨國聲量競技舞台。透過科技防弊與即時拉扯的視覺呈現，我們讓跨越美、日、中、台、韓五國的應援文化在此交織，記錄每一次「下剋上」的逆轉奇蹟，復盤每一場粉絲齊心協力的感動戰役。
          </p>
        </div>

        <div className="border-l-4 border-amber-500 pl-4 sm:pl-6 py-1">
          <p className="text-slate-600">
            本平台由 <strong>宇沛實業股份有限公司</strong> 研發、營運與維護。我們融合嚴謹的系統工程與熱血的御宅文化，堅持以極簡流暢的產品體驗、去中心化的社群二創空間，為全亞洲及全球粉絲構築一個純粹的推活（Oshi-katsu）聖地。
          </p>
        </div>
      </div>

      {/* 伺服器能量補給贊助卡 (指定精準文案) */}
      <div className="bento-card p-6 sm:p-8 border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-white shadow-lg shadow-cyber-rose/25">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyber-violet">
              Server Fuel Support
            </span>
            <h3 className="text-xl font-black text-slate-900">
              伺服器能量補給贊助 (Server Fuel Support)
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          每一份微小的補給，都是推動 OshiPulse 為更多偶像點亮舞台的能量。感謝您守護這座跨國應援競技場！
        </p>

        {/* 銀行帳戶細節 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">受款銀行機構</span>
            <span className="font-bold text-slate-800">華南銀行 民生分行 (銀行代碼：008)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">受款戶名</span>
            <span className="font-bold text-slate-800">宇沛實業股份有限公司</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">專用匯款帳號</div>
              <div className="text-xl font-mono font-black text-cyber-violet tracking-wider">
                126103063350
              </div>
            </div>
            <button
              onClick={handleCopyAccount}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>已複製帳號</span>
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
      </div>

      {/* 法人公司基本資訊 */}
      <div className="bento-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-black text-slate-900">企業法人營運資訊</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-bold text-slate-400 text-xs">公司名稱</div>
            <div className="font-bold text-slate-900">宇沛實業股份有限公司 (UPAY Corp.)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-bold text-slate-400 text-xs">營業地址</div>
            <div className="font-bold text-slate-900">台北市松山區敦化北路207號9樓之6</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-bold text-slate-400 text-xs">客服與聯絡電話</div>
            <div className="font-bold text-slate-900">+886 0911-027-688</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-bold text-slate-400 text-xs">官方電子信箱</div>
            <div className="font-bold text-cyber-violet">opelwu2002@gmail.com</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          © 2026 UPAY Corp. All Rights Reserved. 宇沛實業股份有限公司版權所有
        </div>
      </div>
    </div>
  );
}
