"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Shield, ArrowLeft, LogOut, ExternalLink } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUserRole } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 登入頁直接放行，不套用內部守衛與頂部身分條
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("oshipulse_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
        setUserRole("admin");
      } else {
        setIsAuthenticated(false);
        if (!isLoginPage) {
          window.location.replace("/admin/login");
        }
      }
    }
  }, [pathname, isLoginPage, router, setUserRole]);

  // 如果是登入頁，直接渲染
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 檢查認證狀態中，顯示簡易安全防護骨架
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-slate-600">
            正在安全驗證管理者授權權限...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("oshipulse_admin_auth");
      sessionStorage.removeItem("oshipulse_admin_token");
    }
    setUserRole("user");
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 頂部管理員身分條 */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>OshiPulse 企業級統一 CMS 控制台</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-mono font-bold">
                  AUTHENTICATED
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                宇沛實業股份有限公司 (UPAY Corp.) 官方營運系統
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="在新分頁開啟前台首頁"
            >
              <span>檢視前台</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-cyber-rose border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="登出管理員身分並返回登入頁"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>安全登出</span>
            </button>
          </div>
        </div>

        {/* 後台主視圖 */}
        {children}
      </div>
    </div>
  );
}
