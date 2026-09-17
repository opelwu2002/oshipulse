"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import {
  Flame,
  Mail,
  MapPin,
  Phone,
  HeartHandshake,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const { openDonateModal } = useAppStore();

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/80 pt-12 pb-24 sm:pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* 品牌與理念 */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyber-rose to-cyber-violet flex items-center justify-center text-white shadow-md shadow-cyber-rose/25">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-slate-900">
                Oshi<span className="text-cyber-rose">Pulse</span> (推しパルス)
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
              記錄每一次「下剋上」的逆轉奇蹟，復盤每一場粉絲齊心協力的感動戰役。跨越美、日、中、台、韓五國應援文化，打造極致公平、透明且充滿激情的偶像跨界聲量競技舞台。
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={openDonateModal}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-all shadow-sm"
              >
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>伺服器能量補給贊助</span>
              </button>
            </div>
          </div>

          {/* 企業資訊 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              營運法人資訊
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="font-bold text-slate-800">
                宇沛實業股份有限公司 (UPAY Corp.)
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>台北市松山區敦化北路207號9樓之6</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+886 0911-027-688</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="mailto:opelwu2002@gmail.com"
                  className="text-cyber-violet hover:underline"
                >
                  opelwu2002@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* 快速導航與條款 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              平台快速指引
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-cyber-violet transition-colors">
                  平台理念與宣言
                </Link>
              </li>
              <li>
                <Link href="/idols" className="hover:text-cyber-violet transition-colors">
                  五國偶像名人堂
                </Link>
              </li>
              <li>
                <Link href="/battles" className="hover:text-cyber-violet transition-colors">
                  跨界巔峰對決專區
                </Link>
              </li>
              <li>
                <Link href="/collabs" className="hover:text-cyber-violet transition-colors">
                  聯名活動與門票抽選
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-cyber-violet transition-colors">
                  官方正版周邊商城
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyber-violet transition-colors">
                  偶像入駐提案與商務諮詢
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 底層版權宣告 */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 UPAY Corp. All Rights Reserved. 宇沛實業股份有限公司版權所有</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>硬體設備指紋防刷票系統運行中</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
