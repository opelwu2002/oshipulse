"use client";

import React, { useState, useEffect, useMemo } from "react";

export interface SmartAvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackInitial?: string;
  fill?: boolean;
  priority?: boolean;
}

// 根據名稱雜湊計算專屬配色
function getGradientTheme(name: string) {
  const themes = [
    { from: "from-pink-500", via: "via-purple-600", to: "to-indigo-600", text: "text-white", border: "border-pink-300/40" },
    { from: "from-blue-600", via: "via-indigo-600", to: "to-violet-700", text: "text-white", border: "border-blue-300/40" },
    { from: "from-rose-500", via: "via-red-600", to: "to-orange-500", text: "text-white", border: "border-rose-300/40" },
    { from: "from-emerald-500", via: "via-teal-600", to: "to-cyan-600", text: "text-white", border: "border-emerald-300/40" },
    { from: "from-amber-500", via: "via-orange-600", to: "to-rose-600", text: "text-white", border: "border-amber-300/40" },
    { from: "from-fuchsia-600", via: "via-pink-600", to: "to-rose-500", text: "text-white", border: "border-fuchsia-300/40" },
    { from: "from-cyan-500", via: "via-blue-600", to: "to-purple-600", text: "text-white", border: "border-cyan-300/40" },
  ];

  if (!name) return themes[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % themes.length;
  return themes[index];
}

/**
 * SmartAvatar 高可用性智慧圖片元件
 * 1. 支援本地相對路徑與外部 URL
 * 2. 外部圖片自動注入 referrerPolicy="no-referrer" 抵禦防盜鏈
 * 3. 圖片載入失敗或破圖時，絕不顯示瀏覽器蛋圖，優雅切換為專屬首字光暈漸層 UI
 */
export default function SmartAvatar({
  src,
  alt = "OshiPulse 偶像",
  className = "",
  fallbackInitial,
  fill = false,
  priority = false,
  onError,
  ...props
}: SmartAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // 當 src 變更時重置錯誤狀態
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // 計算首字 (Fallback Initial)
  const initial = useMemo(() => {
    if (fallbackInitial) return fallbackInitial.trim()[0];
    const cleanAlt = (alt || "推").trim().replace(/^[【「(（\s]+/, "");
    return cleanAlt[0] || "推";
  }, [alt, fallbackInitial]);

  // 取得該角色固定且專屬的色彩主題
  const theme = useMemo(() => getGradientTheme(alt), [alt]);

  const fillClasses = fill ? "absolute inset-0 w-full h-full object-cover" : "";

  // 🛡️ 破圖捕捉或無路徑：顯示質感漸層首字徽章
  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${theme.from} ${theme.via} ${theme.to} ${theme.text} select-none relative overflow-hidden transition-all duration-300 ${
          fill ? "absolute inset-0 w-full h-full" : ""
        } ${className}`}
        title={`${alt} (本地專屬視覺)`}
        role="img"
        aria-label={alt}
      >
        {/* 背景裝飾光暈圈 */}
        <div className="absolute inset-0 bg-radial from-white/15 via-transparent to-black/20 pointer-events-none" />
        
        {/* 中央首字徽記 */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="font-black text-lg sm:text-2xl drop-shadow-md tracking-tight scale-105 transform">
            {initial}
          </span>
          <span className="text-[9px] opacity-75 font-bold tracking-widest uppercase scale-90 mt-0.5">
            OSHI
          </span>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      loading={priority ? "eager" : "lazy"}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      className={`${fillClasses} ${className}`}
      {...props}
    />
  );
}
