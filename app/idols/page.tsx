"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import IdolCard from "@/components/IdolCard";
import { is2DFranchiseIdol } from "@/lib/utils";
import { MASCOT_QUOTES } from "@/lib/mascotQuotes";
import { Search, Trophy } from "lucide-react";

export default function IdolsPage() {
  const { idols } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"votes" | "debut">("votes");
  const [dbIdols, setDbIdols] = useState<any[]>([]);

  // 🛡️ 即時同步：進入前台名冊庫時向 API 同步最新 Supabase 角色清單與立繪
  useEffect(() => {
    async function loadLatestIdols() {
      try {
        const res = await fetch(`/api/admin/idols?t=${Date.now()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbIdols(json.data);
        }
      } catch (err) {
        console.warn("前台載入資料庫角色失敗，平滑切換至本機快取:", err);
      }
    }
    loadLatestIdols();
  }, []);

  // 統一資料來源：資料庫優先，並對齊 image_url / avatar 實體欄位
  const allIdols = useMemo(() => {
    if (dbIdols.length === 0) return idols;

    return dbIdols.map((db) => {
      const local = idols.find((i) => i.id === db.id);
      const finalImg =
        db.image_url ||
        db.avatar ||
        db.avatar_url ||
        (local as any)?.image_url ||
        local?.avatar_url ||
        "";

      return {
        ...(local || {}),
        ...db,
        id: db.id,
        name: db.name || local?.name || "未知角色",
        original_name: db.original_name || local?.original_name || db.work || "",
        country: db.country || local?.country || "JP",
        category: db.category || local?.category || "character",
        vote_count: Number(db.votes ?? db.vote_count ?? local?.vote_count ?? 0),
        image_url: finalImg,
        avatar: finalImg,
        avatar_url: finalImg,
      };
    });
  }, [dbIdols, idols]);

  // 篩選與排序邏輯
  const filtered = allIdols
    .filter((idol) => {
      const matchSearch =
        idol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idol.original_name && idol.original_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (idol.wiki_slug && idol.wiki_slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
        idol.members?.some(
          (m: any) =>
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
      if (sortBy === "votes") return (b.vote_count || 0) - (a.vote_count || 0);
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

      {/* 偶像列表 (Bento 格狀呈現，整合標準 IdolCard) */}
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
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all cursor-pointer"
          >
            重設篩選條件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((idol, index) => (
            <IdolCard
              key={idol.id}
              idol={idol}
              index={index}
              showVoteButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
