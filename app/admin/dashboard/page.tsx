"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs font-bold text-slate-400">
      正在跳轉至管理者主控制台...
    </div>
  );
}
