"use client";

import React, { useState, useEffect, useMemo } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ShoppingBag, Lock, Sparkles, Check, Filter, Heart, AlertCircle } from "lucide-react";

export default function StorePage() {
  const { products, idols, addToCart, bonusVotes, openShareModal } = useAppStore();
  const [dbInventory, setDbInventory] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "collab_exclusive" | "official_regular">("ALL");

  // 🛡️ 即時同步：載入後台資料庫 shop_inventory 即時商品售價與庫存
  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch(`/api/admin/inventory?t=${Date.now()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbInventory(json.data);
        }
      } catch (err) {
        console.warn("載入資料庫商品庫存失敗，使用本地備援:", err);
      }
    }
    loadInventory();
  }, []);

  // 統合商品資料（資料庫 shop_inventory 優先，確保售價與庫存件數即時同步）
  const allProducts = useMemo(() => {
    if (dbInventory.length > 0) {
      return dbInventory.map((db) => {
        const local = products.find((p) => p.id === db.id);
        return {
          id: db.id,
          idol_id: db.idol_id || local?.idol_id || "idol-1",
          collab_id: local?.collab_id || null,
          source_type: db.source_type || local?.source_type || "collab_exclusive",
          title: db.title || local?.title || "官方限定周邊",
          description: db.description || local?.description || "",
          price: Number(db.price ?? local?.price ?? 980),
          stock: Number(db.stock ?? local?.stock ?? 0),
          min_votes_to_buy: Number(db.min_votes_to_buy ?? local?.min_votes_to_buy ?? 0),
          images: [db.image_url || local?.images?.[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"],
          is_active: db.is_active ?? true,
          created_at: db.created_at || local?.created_at || new Date().toISOString(),
        };
      });
    }
    return products;
  }, [dbInventory, products]);

  const filteredProducts = allProducts.filter((p) => {
    if (filterType === "ALL") return true;
    return p.source_type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 標題區域 */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-cyber-rose text-xs font-black">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>正版授權 · 應援限定周邊</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          應援周邊商城 (OshiPulse Store)
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          官方直營與跨國聯名特企周邊！部分珍稀限定商品設有「應援門檻解鎖」機制，唯有熱血粉絲方能供奉帶回！
        </p>
      </div>

      {/* 篩選標籤 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            filterType === "ALL"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          全部周邊 ({products.length})
        </button>
        <button
          onClick={() => setFilterType("collab_exclusive")}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            filterType === "collab_exclusive"
              ? "bg-cyber-rose text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          聯名限定特企
        </button>
        <button
          onClick={() => setFilterType("official_regular")}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            filterType === "official_regular"
              ? "bg-cyber-violet text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          官方常態正版
        </button>
      </div>

      {/* 商品卡片列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const idol = idols.find((i) => i.id === product.idol_id);
          const isLocked = product.min_votes_to_buy > 0 && bonusVotes < product.min_votes_to_buy;

          return (
            <div
              key={product.id}
              className="bento-card p-5 flex flex-col justify-between group relative"
            >
              <div>
                {/* 圖片展示 */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100">
                  <SafeImage
                    src={product.images[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  {/* 限定角標 */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.source_type === "collab_exclusive" ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyber-rose text-white shadow-sm">
                        聯名限定
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900 text-white shadow-sm">
                        官方正版
                      </span>
                    )}
                  </div>
                </div>

                {/* 偶像關聯與標題 */}
                <div className="space-y-1.5 mb-3">
                  {idol && (
                    <Link
                      href={`/idols/${idol.id}`}
                      className="text-xs font-bold text-cyber-violet hover:underline inline-block"
                    >
                      {idol.name} 專屬
                    </Link>
                  )}
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                </div>
              </div>

              <div>
                {/* 門檻與價格 */}
                <div className="flex items-baseline justify-between mb-3 pt-3 border-t border-slate-100">
                  <div className="text-lg font-mono font-black text-cyber-rose">
                    {formatCurrency(product.price)}
                  </div>
                  <span
                    className={`text-[11px] font-mono ${
                      product.stock <= 0
                        ? "text-rose-600 font-bold"
                        : product.stock <= 20
                        ? "text-amber-600 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    {product.stock <= 0 ? "已售罄 (Sold Out)" : `庫存剩餘：${product.stock} 件`}
                  </span>
                </div>

                {/* 購買或解鎖按鈕 */}
                {product.stock <= 0 ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>已售罄 (補貨中)</span>
                  </button>
                ) : isLocked ? (
                  <button
                    onClick={() => openShareModal()}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-cyber-rose border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-cyber-rose" />
                    <span>需 {product.min_votes_to_buy} 票解鎖 (去拉票)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(product as any, 1)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>加入應援袋</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
