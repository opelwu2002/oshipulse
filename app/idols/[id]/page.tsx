"use client";

import React from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import VoteButton from "@/components/VoteButton";
import {
  formatNumber,
  formatCurrency,
  getCountryBadge,
  getCategoryBadge,
} from "@/lib/utils";
import {
  Sparkles,
  Share2,
  Calendar,
  ExternalLink,
  Music,
  Tv,
  ArrowLeft,
  Users,
  Award,
  ShoppingBag,
  Heart,
  ChevronRight,
} from "lucide-react";

export default function IdolDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { idols, products, addToCart, openShareModal } = useAppStore();

  const idol = idols.find((i) => i.id === id) || idols[0];
  const relatedProducts = products.filter((p) => p.idol_id === idol?.id);

  if (!idol) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-800">找不到該偶像資訊</h2>
        <Link href="/idols" className="text-cyber-violet font-bold hover:underline">
          返回偶像名人堂
        </Link>
      </div>
    );
  }

  const country = getCountryBadge(idol.country);
  const category = getCategoryBadge(idol.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 頂部返回導航列 */}
      <div className="flex items-center justify-between">
        <Link
          href="/idols"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回偶像名人堂</span>
        </Link>
        <button
          onClick={() => openShareModal(idol)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyber-rose bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition-all shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>發動擴散希望</span>
        </button>
      </div>

      {/* 16:9 封面大圖與 1:1 頭像層疊區 */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-xl">
        {/* 16:9 封面 */}
        <div className="relative w-full aspect-[16/9] max-h-96">
          <SafeImage
            src={idol.cover_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200"}
            alt={`${idol.name} 封面`}
            fill
            className="object-cover opacity-80"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* 封面浮動資訊 (頭像與標題) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            {/* 1:1 頭像 */}
            <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shrink-0 bg-slate-100">
              <SafeImage
                src={idol.avatar_url}
                alt={idol.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* 標題與標籤 */}
            <div className="space-y-1.5 text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-md">
                  {country.flag} {country.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyber-rose text-white">
                  {category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black">{idol.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {idol.original_name} · 出道年份：{idol.debut_year || "早期"} 年
              </p>
            </div>
          </div>

          {/* 右側累積票數與即時應援鈕 */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-left sm:text-right text-white">
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                {formatNumber(idol.vote_count)}
              </div>
              <div className="text-[11px] text-slate-300">目前累積聲量點數</div>
            </div>
            <VoteButton idolId={idol.id} idolName={idol.name} size="md" />
          </div>
        </div>
      </div>

      {/* 詳細內容兩欄排版 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側欄位：代表作、成員名單、媒體嵌入 (佔 2 欄) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 成員陣容名單 (至多 50 人動態呈現，含星座徽章) */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-violet" />
              <h3 className="text-base font-black text-slate-900">
                成員陣容名單 ({idol.members?.length || 0} 位)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {idol.members && idol.members.length > 0 ? (
                idol.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <SafeImage
                        src={member.avatar_url}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {member.name}
                        </span>
                        {member.original_name && (
                          <span className="text-[11px] font-medium text-slate-400 truncate">
                            ({member.original_name})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-cyber-violet">
                          {member.zodiac}
                        </span>
                        <span>·</span>
                        <span>{member.birth_date || "神秘生日"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">目前為獨立單人偶像體制。</p>
              )}
            </div>
          </div>

          {/* 偶像光陰足跡與傳奇時間軸 */}
          <div className="bento-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyber-purple" />
                <h3 className="text-base font-black text-slate-900">光陰足跡 · 傳奇里程碑</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">官方紀實時間軸</span>
            </div>

            <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6 my-2">
              {(idol.timeline && idol.timeline.length > 0
                ? idol.timeline
                : [
                    {
                      year: `${idol.debut_year || 2020}`,
                      title: "正式登上歷史舞台",
                      desc: `以驚艷姿態初次向世界揭幕，開啟專屬的應援篇章。`,
                    },
                    {
                      year: "巔峰躍升",
                      title: "人氣與影響力突破",
                      desc: "獲得全球粉絲熱烈擁護與關鍵里程碑肯定，奠定不可動搖的傳奇地位。",
                    },
                    {
                      year: "2026 現今",
                      title: "OshiPulse 聲量競技殿堂",
                      desc: "跨越次元與國境疆界，在此持續燃燒炙熱的應援誓言！",
                    },
                  ]
              ).map((milestone, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-cyber-purple group-hover:bg-cyber-purple group-hover:scale-125 transition-all shadow-xs" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-cyber-purple font-mono font-black text-xs">
                        {milestone.year}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        {milestone.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {milestone.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 代表作與成就 */}
          {idol.notable_works && idol.notable_works.length > 0 && (
            <div className="bento-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">代表作與輝煌成就</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {idol.notable_works.map((work, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/50 border border-purple-100"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-cyber-violet rounded-lg shadow-xs">
                      {work.type}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{work.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 影音串流內嵌區塊 (Spotify & YouTube) */}
          <div className="space-y-4">
            {idol.youtube_video_id && (
              <div className="bento-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-black text-slate-900">熱門影音官方舞台</h3>
                </div>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${idol.youtube_video_id}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {idol.spotify_track_id && (
              <div className="bento-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900">Spotify 暢銷歌曲試聽</h3>
                </div>
                <div className="w-full rounded-2xl overflow-hidden">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${idol.spotify_track_id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="border-0 rounded-2xl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側欄位：官方連結、相關周邊商品、應援排行榜 (佔 1 欄) */}
        <div className="space-y-6">
          {/* 官方社群入口 */}
          <div className="bento-card p-6 space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              官方社群與專屬頻道
            </h3>
            <div className="space-y-2">
              {idol.official_links && idol.official_links.length > 0 ? (
                idol.official_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-cyber-violet transition-colors"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))
              ) : (
                <p className="text-xs text-slate-400">尚無外部連結紀錄</p>
              )}
            </div>
          </div>

          {/* 關聯正版授權周邊 */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyber-rose" />
                <h3 className="text-sm font-black text-slate-900">本命專屬周邊</h3>
              </div>
              <Link href="/store" className="text-xs font-bold text-cyber-rose hover:underline">
                前往商城
              </Link>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="space-y-3">
                {relatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <SafeImage
                        src={prod.images[0]}
                        alt={prod.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {prod.title}
                      </div>
                      <div className="text-xs font-mono font-bold text-cyber-rose mt-0.5">
                        {formatCurrency(prod.price)}
                      </div>
                      <button
                        onClick={() => addToCart(prod, 1)}
                        className="mt-1.5 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>加入購物袋</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">目前本命周邊籌備中，敬請期待聯名企劃！</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
