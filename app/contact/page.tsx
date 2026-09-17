"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  MapPin,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const { addContactMessage } = useAppStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "偶像入駐提名",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "發送失敗");
      }

      // 同步寫入本機 Zustand 狀態庫以利在後台直接查看與回覆
      addContactMessage({
        sender_name: formData.name,
        sender_email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "連線發生錯誤，請稍後重試";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 頁面標題 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-cyber-violet text-xs font-black">
          <Mail className="w-3.5 h-3.5" />
          <span>宇沛實業 (UPAY Corp.) 官方直通車</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          聯絡我們與合作諮詢 (Contact & Business)
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          歡迎經紀公司洽談偶像入駐、品牌聯名商品合作提案，或通報平台異常。所有信件將直接轉發至營運主管信箱。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左側：法人資訊卡 */}
        <div className="bento-card p-6 space-y-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyber-rose" />
            <span>總部聯絡資訊</span>
          </h3>

          <div className="space-y-4 text-xs text-slate-600">
            <div>
              <div className="text-slate-400 font-bold mb-1">營運法人</div>
              <div className="font-bold text-slate-900">宇沛實業股份有限公司</div>
            </div>

            <div>
              <div className="text-slate-400 font-bold mb-1">營業地址</div>
              <div className="flex items-start gap-1.5 font-medium text-slate-800">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>台北市松山區敦化北路207號9樓之6</span>
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-bold mb-1">專屬客服專線</div>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+886 0911-027-688</span>
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-bold mb-1">官方直聯信箱</div>
              <div className="flex items-center gap-1.5 font-medium text-cyber-violet">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>opelwu2002@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
            系統將於收到信件後 24 小時內指派專人與您聯繫。
          </div>
        </div>

        {/* 右側：表單區域 (佔 2 欄) */}
        <div className="bento-card md:col-span-2 p-6 sm:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">訊息已成功寄達！</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                系統已自動發送通知信至 <strong>opelwu2002@gmail.com</strong>。營運團隊將在查閱後儘速透過您留下的信箱回覆。
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    category: "偶像入駐提名",
                    subject: "",
                    message: "",
                  });
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                寄送另一則詢問
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-cyber-rose rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    您的姓名 / 稱呼 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：王小明"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyber-violet transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    聯絡電子信箱 *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="例如：name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyber-violet transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">諮詢分類 *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-cyber-violet"
                >
                  <option value="偶像入駐提名">偶像入駐 / 粉絲提名審核</option>
                  <option value="聯名周邊企劃">聯名周邊合作 / 願望池提案</option>
                  <option value="廣告商務洽談">廣告曝光 / 商務跨界合作</option>
                  <option value="防弊異常檢舉">防弊作弊檢舉 / 系統異常通報</option>
                  <option value="其他客服諮詢">其他事務諮詢</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">詢問主旨 *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="簡要說明諮詢主旨..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyber-violet transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  詳細諮詢內容 *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="請在此詳細描述您的需求、合作建議或推薦偶像資料..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyber-violet transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyber-rose via-rose-500 to-cyber-violet text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在發送通知至 opelwu2002@gmail.com...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>確認發送諮詢信件</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
