"use client";

import React, { useState, useEffect } from "react";
import SafeImage from "@/components/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Compass, Award, ArrowRight, Zap, Star } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function CinematicHero() {
  const { idols, openPersonalityQuiz } = useAppStore();
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  // 精選 5 位超人氣指標本命（動漫與企劃代表）
  const spotlightCandidates = idols.filter((idol) =>
    [
      "char-doraemon",
      "char-gojo-satoru",
      "char-killua-zoldyck",
      "char-yugi-atem",
      "idol-equallove",
      "char-frieren",
    ].includes(idol.id)
  );

  const heroList = spotlightCandidates.length > 0 ? spotlightCandidates : idols.slice(0, 5);

  useEffect(() => {
    if (heroList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % heroList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroList.length]);

  const currentHero = heroList[activeHighlightIndex] || heroList[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-indigo-500/20">
      {/* 背景動態聚光燈與發光粒子效果 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-cyber-purple/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-cyber-rose/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-cyber-gold/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 左側：主標語與行動引導 */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-black tracking-wide text-rose-300">
            <Flame className="w-4 h-4 text-cyber-rose animate-bounce" />
            <span>OshiPulse 2026 全域沉浸式應援革命</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            讓每一份熱愛，
            <br />
            都化作頂級舞台的
            <span className="block mt-1 bg-gradient-to-r from-rose-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              耀眼星芒
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            跨越次元藩籬、連結全球熱血。結合即時拔河決戰、官方足跡時間軸、每日應援任務與 AI 本命智慧伴侶，為心愛的祂獻上不朽的聲量誓言！
          </p>

          {/* 行動引導按鈕群組 */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => scrollToSection("tug-of-war-arena")}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyber-rose to-cyber-purple text-white font-black text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>立即登上擂台投票</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={openPersonalityQuiz}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>測測命定應援人格</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            </button>

            <button
              onClick={() => scrollToSection("mission-center")}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>今日應援任務</span>
            </button>
          </div>
        </div>

        {/* 右側：精選指標本命動態卡片 */}
        {currentHero && (
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              key={currentHero.id}
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden group"
            >
              {/* 光環角標 */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>焦點本命殿堂</span>
              </div>

              {/* 立繪展示 */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-white/10 shadow-inner">
                <SafeImage
                  src={currentHero.avatar_url || (currentHero as any).avatar || (currentHero as any).image_url}
                  alt={currentHero.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 380px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white tracking-wider uppercase mb-1">
                    {currentHero.category === "character" ? "二次元傳奇" : "頂級偶像"}
                  </span>
                  <h3 className="text-xl font-black text-white drop-shadow-md">
                    {currentHero.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {currentHero.original_name}
                  </p>
                </div>
              </div>

              {/* 資訊簡報與輪播指示器 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>累計應援聲量</span>
                  <span className="font-black text-amber-300 font-mono text-sm">
                    {currentHero.vote_count.toLocaleString()} 票
                  </span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(15, (currentHero.vote_count / 3000) * 100))}%`,
                    }}
                  />
                </div>

                {/* 輪播圓點 */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {heroList.map((hero, idx) => (
                    <button
                      key={hero.id}
                      onClick={() => setActiveHighlightIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === activeHighlightIndex
                          ? "w-6 bg-amber-400"
                          : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`切換至 ${hero.name}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
