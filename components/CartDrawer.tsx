"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { MASCOT_QUOTES } from "@/lib/mascotQuotes";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useAppStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isCartOpen) return null;

  const total = cartTotal();
  const shippingFee = total > 1500 || total === 0 ? 0 : 80;
  const grandTotal = total + shippingFee;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // 呼叫結帳處理 (模擬或後端 API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCheckoutSuccess(true);
      clearCart();
    } catch (err) {
      console.error("結帳失敗：", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 背景遮罩 */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* 抽屜頂部 */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyber-rose" />
              <h2 className="text-lg font-black text-slate-900">應援周邊結帳袋</h2>
              <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                {cart.length} 項商品
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 抽屜主體列表 */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {checkoutSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">訂單已成功建立！</h3>
                <p className="text-sm text-slate-600">
                  感謝您以實質行動應援本命！我們將儘速備貨並以最精緻的安全包裝寄出。
                </p>
                <button
                  onClick={() => {
                    setCheckoutSuccess(false);
                    closeCart();
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all"
                >
                  繼續瀏覽商城
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-700">購物袋空空如也</h3>
                <div className="p-3 bg-purple-50 text-purple-900 text-xs rounded-2xl border border-purple-100 font-medium">
                  {MASCOT_QUOTES.emptyCart}
                </div>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <SafeImage
                      src={product.images[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate mb-1">
                      {product.title}
                    </div>
                    <div className="text-xs font-mono font-bold text-cyber-rose mb-2">
                      {formatCurrency(product.price)}
                    </div>
                    {/* 數量控制 */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                        title="移除商品"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 結帳結算底欄 */}
          {cart.length > 0 && !checkoutSuccess && (
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>商品小計</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>運費 (滿 NT$ 1,500 免運)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {shippingFee === 0 ? "免運" : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>應付總額</span>
                  <span className="text-cyber-rose font-mono text-base">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyber-rose via-rose-500 to-cyber-violet text-white font-black text-sm rounded-2xl shadow-lg shadow-cyber-rose/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{isCheckingOut ? "正在處理訂單..." : "前往安全結帳"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>宇沛實業 (UPAY Corp.) 官方直營驗證 · 正品保證</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
