"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Trophy, Swords, Sparkles, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, openCart } = useAppStore();

  const items = [
    { label: "主頁", href: "/", icon: Flame },
    { label: "聲量榜", href: "/idols", icon: Trophy },
    { label: "巔峰對決", href: "/battles", icon: Swords },
    { label: "聯名許願", href: "/collabs", icon: Sparkles },
    { label: "商城", href: "/store", icon: ShoppingBag, isCart: false },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? "text-cyber-rose font-black scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {item.href === "/store" && cartCount() > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-cyber-rose text-white text-[9px] font-black flex items-center justify-center">
                    {cartCount()}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
