"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  Sparkles,
  ShoppingBag,
  Volume2,
  VolumeX,
  HeartHandshake,
  Share2,
  Shield,
  Menu,
  X,
  Flame,
  Swords,
  Gift,
  Compass,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    openCart,
    cartCount,
    isSoundEnabled,
    toggleSound,
    openDonateModal,
    openShareModal,
    bonusVotes,
    currentUserRole,
    setUserRole,
  } = useAppStore();

  const navLinks = [
    { label: "聲量名人堂", href: "/idols" },
    { label: "巔峰對決", href: "/battles" },
    { label: "聯名許願池", href: "/collabs" },
    { label: "應援商城", href: "/store" },
    { label: "關於平台", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-rose via-rose-500 to-cyber-violet flex items-center justify-center text-white shadow-md shadow-cyber-rose/25 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Oshi<span className="text-cyber-rose">Pulse</span>
              </span>
              <span className="text-[10px] font-bold text-cyber-violet bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                推しパルス
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              跨國偶像聲量競技場
            </span>
          </div>
        </Link>

        {/* 桌面端導航項目 */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-colors ${
                  isActive
                    ? "text-cyber-violet bg-purple-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 本機純前端離線模式指示器與一鍵同步 */}
          <button
            onClick={() => {
              useAppStore.getState().resetAllToInitial();
              alert("已將全站偶像與動漫角色資料同步刷新為最新本機名冊！");
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
            title="點擊可刷新重置本機資料為最新動漫與企劃偶像名單"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>本機離線模式</span>
          </button>

          {/* ⚙️ 後台管理入口 (緊鄰 Local Mode 徽章) */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            title="前往 OshiPulse 企業級後台管理系統"
          >
            <span>⚙️ 後台管理</span>
          </Link>

          {/* 擴散希望領票鈕 */}
          <button
            onClick={() => openShareModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-cyber-rose bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-sm"
            title="發動擴散希望領取能量票"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">擴散希望</span>
            <span className="bg-cyber-rose text-white text-[10px] px-1.5 py-0.2 rounded-full">
              +{bonusVotes}
            </span>
          </button>

          {/* 音效開關 */}
          <button
            onClick={toggleSound}
            aria-label="切換音效"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title={isSoundEnabled ? "音效已開啟" : "音效已靜音"}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyber-violet" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* 伺服器能量贊助 */}
          <button
            onClick={openDonateModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-sm"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span>能量贊助</span>
          </button>

          {/* 購物車按鈕 */}
          <button
            onClick={openCart}
            className="relative p-2 text-slate-700 hover:text-cyber-rose rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="開啟應援購物車"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyber-rose text-[10px] font-black text-white shadow-sm">
                {cartCount()}
              </span>
            )}
          </button>

          {/* 行動端漢堡選單 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            aria-label="選單"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 行動端展開式選單 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:text-cyber-violet hover:bg-purple-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                openDonateModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>伺服器能量贊助</span>
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl"
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span>後台管理</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
