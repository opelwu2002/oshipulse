"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  Sparkles,
  ShoppingBag,
  Volume2,
  VolumeX,
  Share2,
  Shield,
  Menu,
  X,
  Flame,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const {
    openCart,
    cartCount,
    isSoundEnabled,
    toggleSound,
    openDonateModal,
    openShareModal,
    bonusVotes,
    currentMember,
    setCurrentMember,
  } = useAppStore();

  useEffect(() => {
    checkUser();
    checkAdminAuth();

    // 監聽 Supabase 驗證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (data) setSupabaseProfile(data);
        } else {
          setSupabaseUser(null);
          setSupabaseProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [pathname]);

  function checkAdminAuth() {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("oshipulse_admin_auth") === "true";
      setIsAdminAuthenticated(isAuth);
    }
  }

  async function checkUser() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSupabaseUser(session.user);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) setSupabaseProfile(data);
      }
    } catch (err) {
      // 離線或無 Supabase 設定時優雅降級
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // 離線降級處理
    }
    setSupabaseUser(null);
    setSupabaseProfile(null);
    setCurrentMember(null);
  }

  // 雙軌身分支援：優先使用 Supabase 登入者，若無則連動 Local Store 展示會員
  const activeUser = supabaseUser || (currentMember ? { id: currentMember.id } : null);
  const activeProfile = supabaseProfile || currentMember;

  // 智能計算後台管理目標路徑：已認證直達 /admin，未認證導向 /admin/login
  const adminTargetPath = isAdminAuthenticated ? "/admin" : "/admin/login";

  // 後台管理點擊導航事件 (雙重保證必定觸發跳轉，杜絕事件攔截或死連結)
  const handleAdminNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("oshipulse_admin_auth") === "true";
      const target = isAuth ? "/admin" : "/admin/login";
      router.push(target);
    }
  };

  const navLinks = [
    { label: "首頁", href: "/" },
    { label: "聲量名人堂", href: "/idols" },
    { label: "巔峰對決", href: "/battles" },
    { label: "聯名許願池", href: "/collabs" },
    { label: "應援商城", href: "/store" },
    { label: "關於平台", href: "/about" },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      {/* 🌟 偶像專屬打氣問候橫幅 (登入後顯示) */}
      {activeUser && (
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-2 shadow-xs animate-fade-in">
          <span>
            ✨ 歡迎回來，{activeProfile?.nickname || activeProfile?.username || "熱情粉絲"}！
          </span>
          <span className="hidden sm:inline opacity-70">|</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
            🔥 您的本命【{activeProfile?.favorite_idol || "所有推角"}】今天也正在發光發熱，一起為他應援打氣吧！
          </span>
        </div>
      )}

      {/* 主導航列 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Logo 區 */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col shrink-0">
            <span className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight whitespace-nowrap">
              OshiPulse
            </span>
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">
              推しパルス · 粉絲全球應援中心
            </span>
          </div>
        </Link>

        {/* 桌面端導航連結 */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm font-medium text-gray-700 shrink-0">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-pink-600 transition whitespace-nowrap ${
                  isActive ? "text-pink-600 font-bold" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 右側操作區塊 */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* 本機離線模式重置按鈕 */}
          <button
            onClick={() => {
              useAppStore.getState().resetAllToInitial();
              alert("已將全站偶像、動漫角色與會員資料同步重置為最新本機種子資料！");
            }}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            title="點擊可重置本機展示資料庫"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>離線模式</span>
          </button>

          {/* 🛡️ 後台管理入口按鈕 (桌機/筆電常駐顯示，帶有盾牌圖示與高對比膠囊樣式) */}
          <Link
            href={adminTargetPath}
            onClick={handleAdminNavigation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
            title="進入 OshiPulse 管理後台控制台"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>後台管理</span>
          </Link>

          {/* 💎 會員專區按鈕 */}
          <div className="flex items-center flex-nowrap gap-1.5 sm:gap-2 justify-end shrink-0">
            {!activeUser ? (
              <>
                <Link
                  href="/member"
                  className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-pink-600 hover:text-pink-700 border border-pink-200 rounded-full hover:bg-pink-50 transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  🔐 會員登入
                </Link>
                <Link
                  href="/member"
                  className="hidden sm:inline-flex px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-pink-600 rounded-full hover:bg-pink-700 shadow-sm transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  📝 註冊會員
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/member"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  ⚙️ 會員中心
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  登出
                </button>
              </>
            )}
          </div>

          {/* 擴散希望領票鈕 */}
          <button
            onClick={() => openShareModal()}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-bold text-cyber-rose bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
            title="發動擴散希望領取能量票"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">擴散希望</span>
            <span className="bg-cyber-rose text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
              +{bonusVotes}
            </span>
          </button>

          {/* 音效開關 */}
          <button
            onClick={toggleSound}
            aria-label="切換音效"
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title={isSoundEnabled ? "音效已開啟" : "音效已靜音"}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyber-violet shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {/* 購物車按鈕 */}
          <button
            onClick={openCart}
            className="relative p-1.5 sm:p-2 text-slate-700 hover:text-cyber-rose rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="開啟應援購物車"
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyber-rose text-[10px] font-black text-white shadow-sm shrink-0">
                {cartCount()}
              </span>
            )}
          </button>

          {/* 行動端漢堡選單 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 shrink-0 cursor-pointer"
            aria-label="選單"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 行動端展開式選單 */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white p-4 space-y-2 animate-in slide-in-from-top-2 shadow-lg">
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

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            {!activeUser && (
              <Link
                href="/member"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-xl border border-pink-200"
              >
                <User className="w-4 h-4 text-pink-600" />
                <span>登入/註冊會員</span>
              </Link>
            )}
            <Link
              href={adminTargetPath}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleAdminNavigation(e);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>後台管理</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}