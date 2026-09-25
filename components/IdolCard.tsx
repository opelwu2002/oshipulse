"use client";

import React, { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import VoteButton from "@/components/VoteButton";
import { formatNumber, getCountryBadge, getCategoryBadge, is2DFranchiseIdol } from "@/lib/utils";
import { Idol } from "@/lib/supabase/types";

export interface IdolCardProps {
  idol: Idol & {
    image_url?: string;
    avatar?: string;
    avatar_url?: string;
    work?: string;
    votes?: number;
  };
  index?: number;
  rank?: number;
  showVoteButton?: boolean;
  className?: string;
}

/**
 * IdolCard 前台專用角色卡片組件
 * 1. 統一對齊資料庫真實圖片欄位：優先讀取 image_url，接著依序適配 avatar、avatar_url、headshot_url、cover_url
 * 2. 徹底支援 AniList、Google 圖片、Unsplash 等外部真實網址，繞過防盜鏈阻擋
 * 3. 破圖自動優雅降級為首字漸層徽章
 */
export default function IdolCard({
  idol,
  index,
  rank,
  showVoteButton = true,
  className = "",
}: IdolCardProps) {
  const displayRank = rank ?? (index !== undefined ? index + 1 : null);
  const country = getCountryBadge(idol.country || "JP");
  const categoryName = getCategoryBadge(idol.category || "character");

  // 🛡️ 統一資料欄位名稱：嚴格優先匹配 image_url / avatar / avatar_url
  const rawImageUrl =
    idol.image_url ||
    idol.avatar ||
    idol.avatar_url ||
    (idol as any).headshot_url ||
    idol.cover_url ||
    "";

  // 票數支援 vote_count 或 votes
  const voteCount = idol.vote_count ?? (idol as any).votes ?? 0;

  return (
    <div
      className={`bento-card p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {/* 排名角標 (若有提供) */}
      {displayRank !== null && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black shadow-sm ${
              displayRank === 1
                ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300/50"
                : displayRank === 2
                ? "bg-slate-200 text-slate-800"
                : displayRank === 3
                ? "bg-amber-700 text-white"
                : "bg-slate-100/90 backdrop-blur-xs text-slate-600"
            }`}
          >
            #{displayRank}
          </span>
        </div>
      )}

      <div>
        {/* 1:1 頭像立繪展示區塊 */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200/80 shadow-inner">
          <SafeImage
            src={rawImageUrl}
            alt={idol.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />

          {/* 國家/地區標籤 */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold shadow-sm z-10 border border-white/40">
            <span>{country.flag}</span>
            <span className="text-[10px] text-slate-700">{country.name}</span>
          </div>
        </div>

        {/* 偶像/角色文字資訊 */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between gap-1">
            <Link
              href={`/idols/${idol.id}`}
              className="text-base font-black text-slate-900 group-hover:text-cyber-violet transition-colors truncate"
              title={idol.name}
            >
              {idol.name}
            </Link>
            <span className="text-[10px] font-bold text-cyber-violet bg-purple-50 px-2 py-0.5 rounded-full shrink-0 border border-purple-100">
              {is2DFranchiseIdol(idol.wiki_slug, idol.name)
                ? "2.5D企劃 🎤"
                : categoryName}
            </span>
          </div>

          <div className="text-xs text-slate-400 truncate">
            {idol.original_name || (idol as any).work || "人氣代表作"} ·{" "}
            {idol.formation === "group" ? "團體組合" : "個人單人"}
          </div>
        </div>
      </div>

      {/* 底部票數與應援按鈕 */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">累積應援聲量</span>
          <span className="text-sm font-black text-slate-900 font-mono">
            {formatNumber(voteCount)}{" "}
            <span className="text-[10px] font-normal text-slate-400">票</span>
          </span>
        </div>

        {showVoteButton && (
          <VoteButton idolId={idol.id} idolName={idol.name} size="sm" />
        )}
      </div>
    </div>
  );
}
