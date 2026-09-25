"use client";

import React, { useState, useEffect, useMemo } from "react";

export interface SmartAvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null | any;
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
 * 自動解析可能的圖片來源屬性 (avatar, avatar_url, image_url, headshot_url, cover_url)
 * 支援協定補齊、去除外層引號與 Google 圖片搜尋跳轉網址解析
 */
function resolveImageUrl(srcInput: any): string {
  if (!srcInput) return "";
  let raw = "";
  if (typeof srcInput === "string") {
    raw = srcInput;
  } else if (typeof srcInput === "object") {
    // 🛡️ 優先選取真實外鏈圖片 (image_url 或 avatar)，避免命中本地舊色塊偽 JPG
    const isHttp = (url?: any) =>
      typeof url === "string" &&
      (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"));

    if (isHttp(srcInput.image_url)) {
      raw = srcInput.image_url;
    } else if (isHttp(srcInput.avatar)) {
      raw = srcInput.avatar;
    } else if (isHttp(srcInput.avatar_url)) {
      raw = srcInput.avatar_url;
    } else if (isHttp(srcInput.cover_url)) {
      raw = srcInput.cover_url;
    } else {
      raw =
        srcInput.image_url ||
        srcInput.avatar ||
        srcInput.avatar_url ||
        srcInput.headshot_url ||
        srcInput.cover_url ||
        srcInput.src ||
        "";
    }
  }

  if (!raw || typeof raw !== "string") return "";
  let url = raw.trim().replace(/^['"]|['"]$/g, ""); // 去除外層引號

  // 若以雙斜線開頭 (Protocol-relative URL)，自動補齊 https:
  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  // 若使用者貼上 Google 圖片搜尋跳轉網址，自動提純真實圖片連結
  if (url.includes("google.com/imgres") || url.includes("google.com/url")) {
    try {
      const parsed = new URL(url);
      const extracted = parsed.searchParams.get("imgurl") || parsed.searchParams.get("url");
      if (extracted) {
        url = decodeURIComponent(extracted);
      }
    } catch {
      // 保持原始 url
    }
  }

  return url;
}

/**
 * SmartAvatar 高可用性智慧圖片元件
 * 1. 支援本地相對路徑與外部 URL (如 AniList, Wikimedia, Unsplash 等)
 * 2. 外部圖片注入 referrerPolicy="no-referrer" 繞過官網防盜鏈 (403 Forbidden)
 * 3. 移除 crossOrigin="anonymous"，避免第三方圖床因缺少 Access-Control-Allow-Origin 觸發瀏覽器 CORS 封鎖
 * 4. 僅在圖片真實載入失敗時才優雅降級為首字漸層 UI，優先保證網路圖片 100% 正常渲染
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
  const resolvedSrc = useMemo(() => resolveImageUrl(src), [src]);

  // 當 resolvedSrc 變更時重置錯誤狀態
  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

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
  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${theme.from} ${theme.via} ${theme.to} ${theme.text} select-none relative overflow-hidden transition-all duration-300 ${
          fill ? "absolute inset-0 w-full h-full" : ""
        } ${className}`}
        title={`${alt} (預設視覺)`}
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
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      className={`${fillClasses} ${className}`}
      {...props}
    />
  );
}
