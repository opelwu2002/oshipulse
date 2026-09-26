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
  Trophy,
  Swords,
  Compass,
  Mail,
  HeartHandshake,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    syncIdolsFromApi,
  } = useAppStore();

  // 當抽屜選單開啟時鎖定背景滾動，避免穿透
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    syncIdolsFromApi?.();
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

  // 平台核心快速指引項目 (整合原頁尾 6 大延伸功能捷徑)
  const quickGuideLinks = [
    {
      label: "平台理念與宣言",
      desc: "跨國聲量競技與應援初心",
      href: "/about",
      icon: Compass,
      color: "text-amber-500 bg-amber-50 border-amber-100",
    },
    {
      label: "五國偶像名人堂",
      desc: "收錄美日中台韓全領域本命",
      href: "/idols",
      icon: Trophy,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      label: "跨界巔峰對決專區",
      desc: "即時拔河拉鋸死守線競技",
      href: "/battles",
      icon: Swords,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      label: "聯名活動與門票抽選",
      desc: "品牌聯名集氣與專屬福利",
      href: "/collabs",
      icon: Sparkles,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
    {
      label: "官方正版周邊商城",
      desc: "應援手燈、服飾與限定周邊",
      href: "/store",
      icon: ShoppingBag,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "偶像入駐提案與商務諮詢",
      desc: "官方商務合作與粉絲諮詢",
      href: "/contact",
      icon: Mail,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      {/* 🌟 偶像專屬打氣問候橫幅 (登入後顯示) */}
      {activeUser && (
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white text-xs sm:text-sm py-1.5 px-3 text-center font-medium flex flex-wrap items-center justify-center gap-1.5 shadow-xs animate-fade-in">
          <span>
            ✨ 歡迎回來，{activeProfile?.nickname || activeProfile?.username || "熱情粉絲"}！
          </span>
          <span className="hidden sm:inline opacity-70">|</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold text-[11px] sm:text-xs">
            🔥 您的本命【{activeProfile?.favorite_idol || "所有推角"}】今天也正在發光發熱！
          </span>
        </div>
      )}

      {/* 主導航列 Container：邊距與間距自適應，徹底防止手機右側按鈕被遮蔽 */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Logo 區 */}
        <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
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

        {/* 桌面端常規導航連結 */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm font-medium text-gray-700 shrink-0">
          <Link
            href="/"
            className={`hover:text-pink-600 transition whitespace-nowrap ${
              pathname === "/" ? "text-pink-600 font-bold" : ""
            }`}
          >
            首頁
          </Link>
          <Link
            href="/idols"
            className={`hover:text-pink-600 transition whitespace-nowrap ${
              pathname === "/idols" ? "text-pink-600 font-bold" : ""
            }`}
          >
            聲量名人堂
          </Link>
          <Link
            href="/battles"
            className={`hover:text-pink-600 transition whitespace-nowrap ${
              pathname === "/battles" ? "text-pink-600 font-bold" : ""
            }`}
          >
            巔峰對決
          </Link>
          <Link
            href="/collabs"
            className={`hover:text-pink-600 transition whitespace-nowrap ${
              pathname === "/collabs" ? "text-pink-600 font-bold" : ""
            }`}
          >
            聯名許願池
          </Link>
          <Link
            href="/store"
            className={`hover:text-pink-600 transition whitespace-nowrap ${
              pathname === "/store" ? "text-pink-600 font-bold" : ""
            }`}
          >
            應援商城
          </Link>
          <Link
            href="/about"
            className={`hover:text-pink-600 transition whitespace-nowrap ${
              pathname === "/about" ? "text-pink-600 font-bold" : ""
            }`}
          >
            關於平台
          </Link>
        </nav>

        {/* 右側操作區塊：RWD 彈性空間排版 */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* 本機離線模式重置按鈕 (桌面專屬) */}
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

          {/* 🛡️ 後台管理入口按鈕：手機端文字精簡為「管理」，釋放水平空間 */}
          <Link
            href={adminTargetPath}
            onClick={handleAdminNavigation}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
            title="進入 OshiPulse 管理後台控制台"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="sm:hidden">管理</span>
            <span className="hidden sm:inline">後台管理</span>
          </Link>

          {/* 💎 會員專區按鈕：手機端文字精簡為「登入」/「會員」 */}
          <div className="flex items-center flex-nowrap gap-1 sm:gap-1.5 justify-end shrink-0">
            {!activeUser ? (
              <>
                <Link
                  href="/member"
                  className="px-2 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-pink-600 hover:text-pink-700 border border-pink-200 rounded-full hover:bg-pink-50 transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <span className="sm:hidden">登入</span>
                  <span className="hidden sm:inline">🔐 會員登入</span>
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
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <span className="sm:hidden">會員</span>
                  <span className="hidden sm:inline">⚙️ 會員中心</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:inline-flex px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition shrink-0 whitespace-nowrap cursor-pointer"
                >
                  登出
                </button>
              </>
            )}
          </div>

          {/* 擴散希望領票鈕：手機端隱藏冗長文字，僅顯示圖示與票數角標，徹底消除被遮蔽問題 */}
          <button
            onClick={() => openShareModal()}
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-bold text-cyber-rose bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
            title="發動擴散希望領取能量票"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">擴散希望</span>
            <span className="bg-cyber-rose text-white text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full shrink-0">
              +{bonusVotes}
            </span>
          </button>

          {/* 音效開關 */}
          <button
            onClick={toggleSound}
            aria-label="切換音效"
            className="p-1 sm:p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title={isSoundEnabled ? "音效已開啟" : "音效已靜音"}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-violet shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {/* 購物車按鈕 */}
          <button
            onClick={openCart}
            className="relative p-1 sm:p-2 text-slate-700 hover:text-cyber-rose rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="開啟應援購物車"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyber-rose text-[10px] font-black text-white shadow-sm shrink-0">
                {cartCount()}
              </span>
            )}
          </button>

          {/* 🌟 頂端「三條線 (Hamburger Menu)」漢堡選單按鈕：整合平台快速指引 */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 sm:p-2 text-slate-700 hover:text-pink-600 bg-slate-50 hover:bg-pink-50 border border-slate-200/80 rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-2xs group"
            aria-label="開啟平台快速指引選單"
            title="平台快速指引選單 (☰)"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 group-hover:text-pink-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* 🚀 美觀高質感側邊抽屜選單 (Side Drawer Modal) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          {/* 半透明毛玻璃暗色背景遮罩 */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* 抽屜本體 (自右側平滑展開) */}
          <div className="fixed top-0 right-0 bottom-0 w-[88%] max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out border-l border-slate-200">
            
            {/* 抽屜內容區域 */}
            <div>
              {/* 頂部 Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 via-purple-50/30 to-white">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                    <Flame className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <span className="text-base font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      OshiPulse
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold">
                      平台快速指引 ✦
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="關閉選單"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 會員身分卡片 */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                {activeUser ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
                        {activeProfile?.nickname?.[0] || activeProfile?.username?.[0] || "推"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {activeProfile?.nickname || activeProfile?.username || "熱情粉絲"}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          本命：{activeProfile?.favorite_idol || "全體偶像"}
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/member"
                      onClick={() => setDrawerOpen(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-pink-600 rounded-xl text-xs font-bold shrink-0 shadow-2xs"
                    >
                      會員中心
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <p className="text-xs text-slate-600 font-medium">
                      登入會員解鎖每日專屬能量票與本命應援任務！
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href="/member"
                        onClick={() => setDrawerOpen(false)}
                        className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition text-center"
                      >
                        🔐 登入 / 註冊
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 核心功能：【平台快速指引 (Platform Quick Guide)】 */}
              <div className="p-4 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-pink-500" />
                  <span>平台快速指引 · QUICK GUIDE</span>
                </div>

                <div className="space-y-1.5">
                  {quickGuideLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                          isActive
                            ? "bg-pink-50/70 border-pink-200 text-pink-700 shadow-2xs"
                            : "hover:bg-slate-50 border-transparent text-slate-800 hover:border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${item.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black">{item.label}</div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 實用工具與管理專區 */}
              <div className="p-4 pt-2 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>管理與能量專區</span>
                </div>

                {/* 後台管理捷徑 */}
                <Link
                  href={adminTargetPath}
                  onClick={(e) => {
                    setDrawerOpen(false);
                    handleAdminNavigation(e);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition border border-slate-200/80"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>進入後台管理控制台</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* 伺服器贊助按鈕 */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    openDonateModal();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold transition border border-amber-200/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>伺服器能量補給贊助</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-800">
                    💖 支援
                  </span>
                </button>

                {/* 重置本機離線展示資料庫 */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    useAppStore.getState().resetAllToInitial();
                    alert("已將全站偶像、動漫角色與會員資料同步重置為最新本機種子資料！");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[11px] font-bold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>重置本機展示資料庫</span>
                  </div>
                  <span className="text-[10px] text-slate-400">冷啟動</span>
                </button>
              </div>
            </div>

            {/* 抽屜底部 Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-600">宇沛實業股份有限公司 (UPAY Corp.)</p>
              <p>© 2026 OshiPulse. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}