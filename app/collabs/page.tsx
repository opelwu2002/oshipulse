"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import {
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Gift,
  ExternalLink,
  Flame,
} from "lucide-react";

export default function CollabsPage() {
  const { collabs, idols, events, pledgeCollab } = useAppStore();
  const [pledgedSuccessId, setPledgedSuccessId] = useState<string | null>(null);

  const handlePledge = (collabId: string) => {
    pledgeCollab(collabId);
    setPledgedSuccessId(collabId);
    setTimeout(() => setPledgedSuccessId(null), 3000);
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
      {/* 區塊 1: 官方線下與線上特企展演 (Official Events) */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyber-rose fill-cyber-rose" />
            <h2 className="text-xl font-black text-slate-900">官方巡迴與主題特企 (Official Events)</h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
              {events?.length || 0} 檔火熱進行中
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events?.map((event) => {
            const mapUrl =
              event.google_maps_url ||
              (event.address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`
                : "");

            return (
              <div
                key={event.id}
                className="bento-card p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all"
              >
                <div className="space-y-4">
                  {/* 宣傳海報 */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                    <SafeImage
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white shadow-sm">
                        官方活動
                      </span>
                      {event.is_physical && (
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
                        舉辦期程：{event.event_start_date?.replace("T", " ")} ~ {event.event_end_date?.replace("T", " ")}
                      </span>
                    </div>

                    {/* 實體會場與 Google Maps 連結 */}
                    {event.is_physical && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{event.address || "線下展場"}</span>
                        </div>
                        {mapUrl && (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-cyan-700 shadow-2xs hover:scale-105 active:scale-95 transition-all"
                          >
                            <MapPin className="w-3 h-3 text-cyan-600" />
                            <span>Google Maps 導航</span>
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
      </div>

      {/* ===================================================================== */}
      {/* 區塊 2: 粉絲願望池跨界連署 (Wish Pool) */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-black text-slate-900">粉絲跨界願望池 (Fan Wish Pool)</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              連署募集中
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collabs.map((collab) => {
            const idol = idols.find((i) => i.id === collab.idol_id);
            const percent = Math.min(Math.round((collab.pledge_count / collab.pledge_goal) * 100), 100);
            const isPledged = pledgedSuccessId === collab.id;

            return (
              <div
                key={collab.id}
                className="bento-card p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* 橫幅大圖 */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                    <SafeImage
                      src={collab.banner_url}
                      alt={collab.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-cyber-rose shadow-sm">
                      {percent >= 100 ? "已達標！即將落地" : `集氣進度 ${percent}%`}
                    </div>
                  </div>

                  {/* 主題與內容 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {idol && (
                        <span className="text-xs font-bold text-cyber-violet bg-purple-50 px-2 py-0.5 rounded-md">
                          {idol.name} 應援企劃
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        狀態：{collab.status === "pledging" ? "連署募集階段" : "籌備就緒"}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{collab.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {collab.details_markdown}
                    </p>
                  </div>

                  {/* 活動時間與場地 (若有) */}
                  {(collab.event_date || collab.event_venue) && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      {collab.event_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>預計日程：{new Date(collab.event_date).toLocaleDateString("zh-TW")}</span>
                        </div>
                      )}
                      {collab.event_venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>預定會場：{collab.event_venue}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 集氣進度條 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-slate-800">
                        已凝聚 {formatNumber(collab.pledge_count)} 人次連署
                      </span>
                      <span className="text-slate-500">
                        目標 {formatNumber(collab.pledge_goal)} 人次
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
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
                    onClick={() => handlePledge(collab.id)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isPledged
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                    }`}
                  >
                    {isPledged ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>連署集氣成功！+1 票</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>注入連署力量 (+1 願望)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Ticket className="w-4 h-4 text-cyber-rose" />
                    <span>達標無償抽票</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
