"use client";

import React from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import TugOfWarArena from "@/components/TugOfWarArena";
import { Swords, Trophy, Clock, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

export default function BattlesPage() {
  const { battles, idols } = useAppStore();

  const liveBattles = battles.filter((b) => b.status === "live");
  const endedBattles = battles.filter((b) => b.status === "ended");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 標題區域 */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-cyber-rose text-xs font-black">
          <Swords className="w-3.5 h-3.5" />
          <span>跨界巔峰對決專區 · Real-Time Tug of War</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          跨界巔峰對決 (Season Battles)
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          每季召集跨國、跨領域頂尖本命偶像展開限時聲量肉搏戰。見證即時拉扯死守線，復盤神級逆轉下剋上！
        </p>
      </div>

      {/* 頂部即時擂台 */}
      <TugOfWarArena />

      {/* 進行中對決列表 */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyber-rose animate-ping" />
          <h2 className="text-lg font-black text-slate-900">現正激戰中的賽季</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveBattles.map((battle) => (
            <div
              key={battle.id}
              className="bento-card p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-cyber-rose">
                    LIVE 激烈拉鋸中
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>截止：{new Date(battle.battle_end_at).toLocaleDateString("zh-TW")}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900">{battle.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{battle.description}</p>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100">
                  <SafeImage
                    src={battle.banner_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"}
                    alt={battle.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">聲量差距進入 5% 內即觸發死守警報</span>
                <Link
                  href="/idols"
                  className="font-bold text-cyber-violet hover:underline flex items-center gap-1"
                >
                  <span>為本命拉票</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 歷史榮譽殿堂 (Ended Battles) */}
      <div className="space-y-4 pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-900">歷史賽季殿堂與榮譽榜</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {endedBattles.map((battle) => {
            const champion = idols.find((i) => i.id === battle.champion_idol_id);

            return (
              <div
                key={battle.id}
                className="bento-card p-6 flex flex-col justify-between space-y-4 bg-slate-50/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700">
                      已完賽結算
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      結算日期：{new Date(battle.battle_end_at).toLocaleDateString("zh-TW")}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{battle.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{battle.description}</p>

                  {/* 冠軍偶像展示卡 */}
                  {champion && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                        <SafeImage
                          src={champion.avatar_url || (champion as any).avatar || (champion as any).image_url}
                          alt={champion.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>賽季最終衛冕冠軍</span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 truncate">
                          {champion.name} ({champion.original_name})
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                  <span>完整聲量戰力復盤資料已妥善存檔於鏈上帳本</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
