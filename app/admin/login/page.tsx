"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, ArrowRight, ArrowLeft, KeyRound, AlertCircle, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUserRole } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 若已經登入，自動導向 /admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("oshipulse_admin_auth");
      if (isAuth === "true") {
        router.replace("/admin");
      }
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      // 驗證寫死憑證：admin / Opel6439
      if (username.trim() === "admin" && password === "Opel6439") {
        sessionStorage.setItem("oshipulse_admin_auth", "true");
        sessionStorage.setItem("oshipulse_admin_token", `oshipulse_token_${Date.now()}`);
        setUserRole("admin");
        router.push("/admin");
      } else {
        setErrorMessage("帳號或密碼錯誤！請確認輸入是否正確。");
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUsername("admin");
    setPassword("Opel6439");
    setErrorMessage("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* 標題與圖標 */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-white mx-auto shadow-md shadow-rose-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            OshiPulse 管理者控制台
          </h1>
          <p className="text-xs text-slate-500">
            請輸入管理員金鑰憑證以解鎖全站活動 CMS 與實體名冊管理
          </p>
        </div>

        {/* 錯誤訊息反饋 */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-cyber-rose flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 登入表單 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">管理員帳號</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入帳號"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-cyber-purple focus:bg-white transition-colors text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">專屬授權密碼</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-cyber-purple focus:bg-white transition-colors text-slate-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isLoading ? "驗證金鑰中..." : "解鎖並進入後台"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 本機測試快速帶入 */}
        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            <span className="font-bold text-cyber-purple">開發驗證帳密：</span>
            <code className="font-mono ml-1 text-slate-900">admin / Opel6439</code>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-cyber-purple font-black text-[11px] hover:bg-purple-100 transition-colors shrink-0 cursor-pointer"
          >
            快速填入
          </button>
        </div>

        {/* 返回首頁 */}
        <div className="text-center pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回 OshiPulse 首頁</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
