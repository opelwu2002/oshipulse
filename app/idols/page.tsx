"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import VoteButton from "@/components/VoteButton";
import { formatNumber, getCountryBadge, getCategoryBadge, is2DFranchiseIdol } from "@/lib/utils";
import { MASCOT_QUOTES } from "@/lib/mascotQuotes";
import { Search, Filter, Trophy, Sparkles, ExternalLink, Users } from "lucide-react";

export default function IdolsPage() {
  const { idols } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"votes" | "debut">("votes");

  // 篩選與排序邏輯
  const filtered = idols
    .filter((idol) => {
      const matchSearch =
        idol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idol.original_name && idol.original_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (idol.wiki_slug && idol.wiki_slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
        idol.members?.some(
          (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.original_name && m.original_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      const matchCountry = selectedCountry === "ALL" || idol.country === selectedCountry;
      const matchCategory =
        selectedCategory === "ALL"
          ? true
          : selectedCategory === "franchise_25d"
          ? is2DFranchiseIdol(idol.wiki_slug, idol.name)
          : idol.category === selectedCategory;
      return matchSearch && matchCountry && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "votes") return b.vote_count - a.vote_count;
      return (b.debut_year || 0) - (a.debut_year || 0);
    });

  const countries = [
    { code: "ALL", name: "全部國家" },
    { code: "JP", name: "日本 🇯🇵" },
    { code: "TW", name: "台灣 🇹🇼" },
    { code: "KR", name: "韓國 🇰🇷" },
    { code: "US", name: "美國 🇺🇸" },
    { code: "CN", name: "中國 🇨🇳" },
  ];

  const categories = [
    { code: "ALL", name: "全領域" },
    { code: "character", name: "動漫角色 (Characters) ✦" },
    { code: "franchise_25d", name: "企劃偶像 (2.5D Franchises) 🎤" },
    { code: "singer", name: "實力歌手" },
    { code: "actor", name: "影視演員" },
    { code: "seiyuu", name: "知名聲優" },
    { code: "creator", name: "網路創作者" },
    { code: "vtuber", name: "虛擬偶像" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 標題區域 */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-cyber-violet text-xs font-black">
          <Trophy className="w-3.5 h-3.5" />
          <span>五國五領域 · 跨界偶像聲量殿堂</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          偶像名人堂 (Oshi Hall of Fame)
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          收錄跨越美、日、中、台、韓五國的歌手、演員、聲優、創作者與虛擬偶像。每一份真誠的點擊，都將化作舞台頂點的耀目光芒！
        </p>
      </div>

      {/* 搜尋與多重篩選面板 */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 關鍵字搜尋 */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋偶像藝名、本名或代表作品..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-cyber-violet transition-colors"
            />
          </div>

          {/* 排序方式切換 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "votes" | "debut")}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyber-violet"
            >
              <option value="votes">聲量票數最高</option>
              <option value="debut">出道年份最新</option>
            </select>
          </div>
        </div>

        {/* 國家標籤列 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-400 shrink-0">地區：</span>
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                selectedCountry === c.code
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 類別標籤列 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-400 shrink-0">領域：</span>
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                selectedCategory === cat.code
                  ? "bg-cyber-violet text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 偶像列表 (Bento 格狀呈現) */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-slate-50 rounded-3xl border border-slate-200/80 p-8">
          <div className="w-16 h-16 bg-purple-100 text-cyber-violet rounded-full flex items-center justify-center mx-auto text-2xl font-black">
            ✦
          </div>
          <h3 className="text-lg font-black text-slate-800">未找到相符偶像</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {MASCOT_QUOTES.emptySearch}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCountry("ALL");
              setSelectedCategory("ALL");
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all"
          >
            重設篩選條件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((idol, index) => {
            const country = getCountryBadge(idol.country);
            const categoryName = getCategoryBadge(idol.category);

            return (
              <div
                key={idol.id}
                className="bento-card p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* 排名角標 */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black shadow-sm ${
                      index === 0
                        ? "bg-amber-400 text-slate-950"
                        : index === 1
                        ? "bg-slate-200 text-slate-800"
                        : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    #{index + 1}
                  </span>
                </div>

                <div>
                  {/* 1:1 頭像展示 */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100">
                    <SafeImage
                      src={idol.avatar_url || (idol as any).avatar || (idol as any).image_url || (idol as any).headshot_url}
                      alt={idol.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      <span>{country.flag}</span>
                      <span className="text-[10px] text-slate-700">{country.name}</span>
                    </div>
                  </div>

                  {/* 偶像基本資訊 */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/idols/${idol.id}`}
                        className="text-base font-black text-slate-900 group-hover:text-cyber-violet transition-colors truncate"
                      >
                        {idol.name}
                      </Link>
                      <span className="text-[10px] font-bold text-cyber-violet bg-purple-50 px-2 py-0.5 rounded-full shrink-0">
                        {is2DFranchiseIdol(idol.wiki_slug, idol.name)
                          ? "2.5D企劃 🎤"
                          : categoryName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {idol.original_name} · {idol.formation === "group" ? "團體組合" : "個人單人"}
                    </div>
                  </div>

                  {/* 代表作預覽 */}
                  {idol.notable_works && idol.notable_works.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-[11px] text-slate-600 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold">代表成就/代表作：</div>
                      <div className="truncate font-medium text-slate-800">
                        {idol.notable_works.map((w) => w.title).join(" · ")}
                      </div>
                    </div>
                  )}

                  {/* 成員陣容預覽 */}
                  {idol.members && idol.members.length > 1 && (
                    <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">收錄：</span>
                      <span className="truncate text-slate-700 font-medium">
                        {idol.members.slice(0, 4).map((m) => m.name).join("、")}
                        {idol.members.length > 4 ? ` 等 ${idol.members.length} 位` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* 聲量數據與投票按鈕 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-mono font-black text-slate-900">
                      {formatNumber(idol.vote_count)}
                    </div>
                    <div className="text-[10px] text-slate-400">總累積聲量</div>
                  </div>
                  <VoteButton idolId={idol.id} idolName={idol.name} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
