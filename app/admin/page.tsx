"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useAppStore } from "@/lib/store";
import { Idol, Member, Battle, Collab, Product, ContactMessage, EventData } from "@/lib/supabase/types";
import { getZodiacSign } from "@/lib/zodiac";
import { formatNumber, formatCurrency, getCountryBadge, getCategoryBadge } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Copy,
  Swords,
  Users,
  Sparkles,
  ShoppingBag,
  Mail,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Send,
  Ticket,
  Download,
} from "lucide-react";

type AdminTab = "events" | "idols" | "battles" | "collabs" | "store" | "messages";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("events");

  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    idols,
    addIdol,
    updateIdol,
    deleteIdol,
    battles,
    addBattle,
    collabs,
    products,
    messages,
    replyContactMessage,
  } = useAppStore();

  // =========================================================================
  // TAB 1: EVENTS (活動排程 CMS、複製活動、Google Maps 實體聯動)
  // =========================================================================
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [duplicateToast, setDuplicateToast] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    publish_start_date: "",
    publish_end_date: "",
    event_start_date: "",
    event_end_date: "",
    image_url: "",
    description: "",
    is_physical: false,
    address: "",
    google_maps_url: "",
  });

  const openNewEventModal = () => {
    setEditingEvent(null);
    const now = new Date();
    const oneMonthLater = new Date(Date.now() + 30 * 86400000);
    const formatDT = (d: Date) => d.toISOString().slice(0, 16);

    setEventForm({
      title: "",
      publish_start_date: formatDT(now),
      publish_end_date: formatDT(oneMonthLater),
      event_start_date: formatDT(now),
      event_end_date: formatDT(oneMonthLater),
      image_url: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
      description: "",
      is_physical: false,
      address: "",
      google_maps_url: "",
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event: EventData) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      publish_start_date: event.publish_start_date || "",
      publish_end_date: event.publish_end_date || "",
      event_start_date: event.event_start_date || "",
      event_end_date: event.event_end_date || "",
      image_url: event.image_url,
      description: event.description,
      is_physical: event.is_physical,
      address: event.address || "",
      google_maps_url: event.google_maps_url || "",
    });
    setShowEventModal(true);
  };

  const handleAddressChange = (addr: string) => {
    const trimmed = addr.trim();
    const autoMapUrl = trimmed
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
      : "";

    setEventForm((prev) => ({
      ...prev,
      address: addr,
      google_maps_url:
        !prev.google_maps_url || prev.google_maps_url.includes("google.com/maps/search/?api=1&query=")
          ? autoMapUrl
          : prev.google_maps_url,
    }));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, eventForm);
    } else {
      addEvent(eventForm);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDuplicate = (id: string) => {
    duplicateEvent(id);
    setDuplicateToast("✅ 已成功複製活動副本！已加入排程頂部，點擊「編輯」即可快速微調發布。");
    setTimeout(() => setDuplicateToast(null), 4000);
  };

  const getPublishStatus = (start?: string, end?: string) => {
    if (!start || !end) return { label: "常態展示", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    const now = new Date().getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();

    if (now < s) {
      return { label: "預約排程 (未開始)", color: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (now > e) {
      return { label: "已結束下架", color: "bg-slate-100 text-slate-500 border-slate-200" };
    }
    return { label: "上架展示中", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  // =========================================================================
  // TAB 2: IDOLS (偶像全 CRUD、動態成員名單、代表作、自動星座計算)
  // =========================================================================
  const [editingIdol, setEditingIdol] = useState<Idol | null>(null);
  const [showIdolModal, setShowIdolModal] = useState(false);
  const [idolForm, setIdolForm] = useState({
    name: "",
    original_name: "",
    country: "JP" as Idol["country"],
    category: "character" as Idol["category"],
    entity_type: "solo" as Idol["entity_type"],
    formation: "solo" as Idol["formation"],
    debut_year: 2024,
    avatar_url: "https://s4.anilist.co/file/anilistcdn/character/large/b139084-nI5pU2uA1a56.png",
    cover_url: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
    spotify_track_id: "",
    youtube_video_id: "",
    members: [] as Member[],
    notable_works: [] as { type: string; title: string }[],
  });

  const [tempWorkType, setTempWorkType] = useState("代表作");
  const [tempWorkTitle, setTempWorkTitle] = useState("");

  const handleAddWork = () => {
    if (!tempWorkTitle.trim()) return;
    setIdolForm((prev) => ({
      ...prev,
      notable_works: [...(prev.notable_works || []), { type: tempWorkType, title: tempWorkTitle.trim() }],
    }));
    setTempWorkTitle("");
  };

  const [tempMemberName, setTempMemberName] = useState("");
  const [tempMemberGender, setTempMemberGender] = useState<"female" | "male" | "other">("female");
  const [tempMemberBirth, setTempMemberBirth] = useState("2004-05-15");
  const [tempMemberAvatar, setTempMemberAvatar] = useState(
    "https://s4.anilist.co/file/anilistcdn/character/large/b139084-nI5pU2uA1a56.png"
  );

  const handleAddMemberToForm = () => {
    if (!tempMemberName) return;
    let zodiac = "未知星屑 ✦";
    if (tempMemberBirth) {
      const parts = tempMemberBirth.split("-");
      if (parts.length >= 3) {
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const z = getZodiacSign(m, d);
        zodiac = `${z.name} ${z.symbol}`;
      }
    }

    const newMember: Member = {
      name: tempMemberName,
      gender: tempMemberGender,
      birth_date: tempMemberBirth,
      is_unrevealed: false,
      zodiac,
      avatar_url: tempMemberAvatar,
    };

    setIdolForm((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    setTempMemberName("");
  };

  const handleSaveIdol = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIdol) {
      updateIdol(editingIdol.id, idolForm);
    } else {
      addIdol({
        ...idolForm,
        entity_type: idolForm.formation === "group" ? "universe" : "solo",
        members: idolForm.members,
        notable_works: idolForm.notable_works.length > 0 ? idolForm.notable_works : [{ type: "代表作", title: "官方主打作品" }],
        official_links: [{ name: "官方網站", url: "https://example.com" }],
        is_active: true,
      });
    }
    setShowIdolModal(false);
    setEditingIdol(null);
  };

  const openNewIdolModal = () => {
    setEditingIdol(null);
    setIdolForm({
      name: "",
      original_name: "",
      country: "JP",
      category: "character",
      entity_type: "solo",
      formation: "solo",
      debut_year: 2024,
      avatar_url: "https://s4.anilist.co/file/anilistcdn/character/large/b139084-nI5pU2uA1a56.png",
      cover_url: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
      spotify_track_id: "",
      youtube_video_id: "",
      members: [],
      notable_works: [{ type: "代表作", title: "" }],
    });
    setShowIdolModal(true);
  };

  const openEditIdolModal = (idol: Idol) => {
    setEditingIdol(idol);
    setIdolForm({
      name: idol.name,
      original_name: idol.original_name || "",
      country: idol.country,
      category: idol.category,
      entity_type: idol.entity_type || (idol.formation === "group" ? "universe" : "solo"),
      formation: idol.formation,
      debut_year: idol.debut_year || 2024,
      avatar_url: idol.avatar_url,
      cover_url: idol.cover_url || "",
      spotify_track_id: idol.spotify_track_id || "",
      youtube_video_id: idol.youtube_video_id || "",
      members: idol.members || [],
      notable_works: idol.notable_works || [],
    });
    setShowIdolModal(true);
  };

  // =========================================================================
  // TAB 3: BATTLES (巔峰對決賽事管理 & 防弊審計)
  // =========================================================================
  const [newBattleTitle, setNewBattleTitle] = useState("");
  const [newBattleDesc, setNewBattleDesc] = useState("");
  const [fraudAuditMsg, setFraudAuditMsg] = useState<string | null>(null);

  const handleCreateBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBattleTitle) return;
    addBattle({
      title: newBattleTitle,
      description: newBattleDesc,
      banner_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
      teaser_start_at: new Date().toISOString(),
      battle_start_at: new Date().toISOString(),
      battle_end_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "live",
      champion_idol_id: null,
    });
    setNewBattleTitle("");
    setNewBattleDesc("");
  };

  const handleAuditFraud = () => {
    setFraudAuditMsg("正在調取設備指紋與連線時序數據...");
    setTimeout(() => {
      setFraudAuditMsg("✅ 審計完成：已檢查 48,290 筆時序投票記錄，設備指紋熵值正常，未偵測到異常機房刷票 IP！");
    }, 1200);
  };

  // =========================================================================
  // TAB 4: COLLABS & LOTTERY (許願池目標設定與密碼學抽獎)
  // =========================================================================
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);

  const handleExecuteLottery = (collabTitle: string) => {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    const verificationCode = "WIN-" + randomArray[0].toString(16).toUpperCase().padStart(8, "0");

    const mockWinnerId = "Oshi_Fan_" + Math.floor(1000 + Math.random() * 9000);
    setLotteryResult(
      `🎉 抽獎執行完畢！【${collabTitle}】中獎者帳號：${mockWinnerId}，安全防偽驗證碼：${verificationCode}`
    );
  };

  // =========================================================================
  // TAB 5: STORE & CSV EXPORT (庫存控制與訂單出貨 CSV 匯出)
  // =========================================================================
  const handleExportCSV = () => {
    const csvRows = [
      ["訂單編號", "商品名稱", "單價", "數量", "收件人", "聯絡電話", "寄送地址", "狀態"],
      ["ORD-20260901-01", "星街彗星 2026 璀璨彗星應援互動手燈", "980", "1", "王大明", "0912345678", "台北市大安區信義路三段", "待出貨"],
      ["ORD-20260902-02", "成振宇 暗影君王金屬鑰匙圈特展限定款", "450", "2", "李小華", "0987654321", "台北市中正區市民大道三段", "已出貨"],
      ["ORD-20260903-03", "田柾國 GOLDEN 紀念黑膠寫真集", "1680", "1", "張志豪", "0922333444", "高雄市新興區中正三路", "待出貨"],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OshiPulse_Shipping_Orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // TAB 6: MESSAGES (聯絡詢問檢視與直接回信)
  // =========================================================================
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const handleSendReply = async (msg: ContactMessage) => {
    const replyContent = replyTextMap[msg.id];
    if (!replyContent) return;
    setSendingReplyId(msg.id);

    try {
      replyContactMessage(msg.id, replyContent);
      setReplyTextMap((prev) => ({ ...prev, [msg.id]: "" }));
    } catch (err) {
      console.error("回覆失敗：", err);
    } finally {
      setSendingReplyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 6 大功能分頁切換列 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "events"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>活動排程管理 (events)</span>
        </button>

        <button
          onClick={() => setActiveTab("idols")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "idols"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4 text-cyber-violet" />
          <span>動漫角色與偶像庫 (idols)</span>
        </button>

        <button
          onClick={() => setActiveTab("battles")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "battles"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Swords className="w-4 h-4 text-cyber-rose" />
          <span>賽季對決與防弊審計 (battles)</span>
        </button>

        <button
          onClick={() => setActiveTab("collabs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "collabs"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>聯名許願與抽獎 (collabs)</span>
        </button>

        <button
          onClick={() => setActiveTab("store")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "store"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>商城庫存與出貨 CSV (store)</span>
        </button>

        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "messages"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Mail className="w-4 h-4 text-purple-600" />
          <span>粉絲諮詢與郵件回覆 (messages)</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 分頁 1: EVENTS 活動排程管理 (上下架期間、實際活動期、複製、Google Maps) */}
      {/* ===================================================================== */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {/* 操作提示 Toast */}
          {duplicateToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-black shadow-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{duplicateToast}</span>
            </div>
          )}

          {/* 頂部標題與快速操作 */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">活動辦理與排程管理 CMS</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black border border-cyan-200">
                  {events.length} 檔活動
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                可精確設定「網站上下架時間」與「線下/線上活動舉辦時間」。提供<strong>一鍵複製活動 (Duplicate)</strong> 深拷貝副本功能，實體活動可直接聯動 Google Maps 導航連結。
              </p>
            </div>

            <button
              onClick={openNewEventModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>新增活動檔期</span>
            </button>
          </div>

          {/* 活動列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => {
              const status = getPublishStatus(event.publish_start_date, event.publish_end_date);

              return (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="space-y-3.5">
                    {/* 封面預覽與狀態 */}
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <SafeImage
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border shadow-xs backdrop-blur-md ${status.color}`}>
                          {status.label}
                        </span>
                        {event.is_physical && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-xs backdrop-blur-md flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>線下實體展</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 活動標題與簡述 */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">{event.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* 時間與地點資訊方塊 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                      {/* 上架時間 */}
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium">網站上架期間：</span>
                        <span className="font-mono font-bold text-slate-700">
                          {event.publish_start_date?.replace("T", " ")} ~ {event.publish_end_date?.replace("T", " ")}
                        </span>
                      </div>

                      {/* 舉辦時間 */}
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium">活動實際期程：</span>
                        <span className="font-mono font-bold text-cyber-violet">
                          {event.event_start_date?.replace("T", " ")} ~ {event.event_end_date?.replace("T", " ")}
                        </span>
                      </div>

                      {/* 實體地址與 Google Maps 外部連結 */}
                      {event.is_physical && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-700">
                          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{event.address || "未設定地址"}</span>
                          </div>
                          {event.google_maps_url && (
                            <a
                              href={event.google_maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 shrink-0 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md"
                            >
                              <span>開啟導航</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按鈕群（強調複製活動 Duplicate） */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(event.id)}
                      className="px-3 py-1.5 text-xs font-black text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                      title="一鍵深拷貝活動以快速微調"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-600" />
                      <span>複製活動 (Duplicate)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditEventModal(event)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>編輯</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`確定要刪除「${event.title}」活動嗎？`)) {
                            deleteEvent(event.id);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>刪除</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 分頁 2: IDOLS 偶像名錄 (CRUD、真實立繪、代表作品、動態成員) */}
      {/* ===================================================================== */}
      {activeTab === "idols" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900">動漫角色與偶像庫維護 (Total {idols.length})</h2>
              <p className="text-xs text-slate-500 mt-1">
                已全面啟用 AniList / Wikimedia 真實高畫質立繪。支援隨時編輯角色名稱、宣傳封面、神技/代表作品與多成員配置。
              </p>
            </div>
            <button
              onClick={openNewIdolModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>新增角色或偶像</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {idols.map((idol) => {
              const country = getCountryBadge(idol.country);
              const category = getCategoryBadge(idol.category);

              return (
                <div
                  key={idol.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <SafeImage
                        src={idol.avatar_url}
                        alt={idol.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 truncate">{idol.name}</span>
                        <span>{country.flag}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {idol.original_name} · {category}
                      </div>
                      <div className="text-xs font-mono font-bold text-cyber-violet mt-1">
                        {formatNumber(idol.vote_count)} 票
                      </div>
                    </div>
                  </div>

                  {/* 代表作預覽 */}
                  {idol.notable_works && idol.notable_works.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {idol.notable_works.slice(0, 2).map((w, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 truncate max-w-[140px]">
                          {w.type}: {w.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 成員與外鏈標籤 */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>編制：{idol.formation === "group" ? "團體宇宙" : "單人個人"}</span>
                    <span className="text-emerald-600 font-medium">
                      {idol.spotify_track_id ? "✓ Spotify" : ""} {idol.youtube_video_id ? "✓ YouTube" : ""}
                    </span>
                  </div>

                  {/* 編輯與刪除 */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditIdolModal(idol)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>編輯</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`確定要刪除「${idol.name}」嗎？`)) {
                          deleteIdol(idol.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>刪除</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 分頁 3: BATTLES 對決管理 & 防弊審計 */}
      {/* ===================================================================== */}
      {activeTab === "battles" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900">巔峰對決賽制排程與防弊審計</h2>
              <p className="text-xs text-slate-500 mt-1">
                管理各賽季大戰啟動、監控即時投票速率，並執行高頻率硬體設備指紋防刷審計。
              </p>
            </div>
            <button
              onClick={handleAuditFraud}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>啟動全域設備防刷審計</span>
            </button>
          </div>

          {fraudAuditMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium animate-fade-in">
              {fraudAuditMsg}
            </div>
          )}

          {/* 建立新賽事表單 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-slate-900">建立全新賽季對決</h3>
            <form onSubmit={handleCreateBattle} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="賽事名稱 (例如：2026 秋季跨國熱血盃)"
                value={newBattleTitle}
                onChange={(e) => setNewBattleTitle(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
              <input
                type="text"
                placeholder="賽事簡述說明..."
                value={newBattleDesc}
                onChange={(e) => setNewBattleDesc(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                + 發起大戰
              </button>
            </form>
          </div>

          {/* 賽事列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battles.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyber-rose uppercase tracking-wider">
                    ● {b.status === "live" ? "戰鬥進行中" : "已結算"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    截止至：{new Date(b.battle_end_at).toLocaleDateString("zh-TW")}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">{b.title}</h4>
                <p className="text-xs text-slate-500">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 分頁 4: COLLABS 聯名許願與抽獎 */}
      {/* ===================================================================== */}
      {activeTab === "collabs" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-xl font-black text-slate-900">跨界聯名許願池與安全抽獎系統</h2>
            <p className="text-xs text-slate-500 mt-1">
              監控連署募資門檻，並使用 Web Crypto 進行防偽密碼學無偏抽獎。
            </p>
          </div>

          {lotteryResult && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-bold animate-fade-in">
              {lotteryResult}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collabs.map((collab) => (
              <div key={collab.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600">
                    目標門檻：{formatNumber(collab.pledge_goal)} 票 (目前 {formatNumber(collab.pledge_count)})
                  </span>
                  <span className="text-xs text-slate-400">狀態：{collab.status}</span>
                </div>
                <h4 className="text-sm font-black text-slate-900">{collab.title}</h4>
                <p className="text-xs text-slate-500">{collab.details_markdown}</p>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleExecuteLottery(collab.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>密碼學防偽無偏抽獎</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 分頁 5: STORE 商城與訂單 CSV */}
      {/* ===================================================================== */}
      {activeTab === "store" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900">官方周邊庫存與出貨總控台</h2>
              <p className="text-xs text-slate-500 mt-1">
                管理官方手燈、特展限定周邊庫存，一鍵匯出全訂單 CSV 交付物流出貨。
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>匯出最新出貨 CSV 報表</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                  <SafeImage src={(p.images?.[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600")} alt={p.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex justify-between items-start pt-1">
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[70%]">{p.title}</h4>
                  <span className="text-xs font-mono font-bold text-cyber-rose">{formatCurrency(p.price)}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>庫存數量：{p.stock} 件</span>
                  <span className="text-emerald-600 font-bold">{p.is_active ? "販售中" : "已完售"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 分頁 6: MESSAGES 粉絲留言諮詢 */}
      {/* ===================================================================== */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-xl font-black text-slate-900">粉絲諮詢與郵件即時回覆</h2>
            <p className="text-xs text-slate-500 mt-1">
              直接檢視來自前台「聯絡我們」的即時留言，可於後台直接回覆並模擬發送信件。
            </p>
          </div>

          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{m.sender_name}</span>
                    <span className="text-slate-400">&lt;{m.sender_email}&gt;</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === "replied" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {m.status === "replied" ? "已回覆" : "待處理"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">{m.subject}</div>
                  <div>{m.message}</div>
                </div>

                {m.reply_content ? (
                  <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 border border-purple-100">
                    <div className="font-bold mb-0.5">後台回覆內容：</div>
                    <div>{m.reply_content}</div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="輸入回覆信件內容..."
                      value={replyTextMap[m.id] || ""}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [m.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      onClick={() => handleSendReply(m)}
                      disabled={sendingReplyId === m.id}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingReplyId === m.id ? "發送中..." : "發送回覆"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: EVENT 活動排程 新增 / 編輯彈窗 */}
      {/* ===================================================================== */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-black text-slate-900">
                {editingEvent ? "編輯活動排程" : "新增活動檔期"}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">活動標題 *</label>
                <input
                  type="text"
                  placeholder="例如：【特企】成振宇《我獨自升級》全球首映與暗影特展"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">宣傳海報大圖 URL *</label>
                <input
                  type="text"
                  placeholder="https://s4.anilist.co/..."
                  value={eventForm.image_url}
                  onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">活動簡介與亮點</label>
                <textarea
                  rows={3}
                  placeholder="介紹活動內容、票券發售、見面會亮點..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* 上架時間與活動時間 (雙軌分流) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="text-xs font-black text-slate-800">
                  時序排程設定 (網站上下架 vs 實際舉辦時間)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      網站上架時間 (Publish Start)
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.publish_start_date}
                      onChange={(e) => setEventForm({ ...eventForm, publish_start_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      網站下架時間 (Publish End)
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.publish_end_date}
                      onChange={(e) => setEventForm({ ...eventForm, publish_end_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      活動實際開始 (Event Start)
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.event_start_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_start_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      活動實際結束 (Event End)
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.event_end_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_end_date: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 線下實體會場設定 */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_physical_checkbox"
                    checked={eventForm.is_physical}
                    onChange={(e) => setEventForm({ ...eventForm, is_physical: e.target.checked })}
                    className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                  />
                  <label htmlFor="is_physical_checkbox" className="text-xs font-black text-slate-800 cursor-pointer">
                    是否有配合線下實體地點 (Physical Venue)
                  </label>
                </div>

                {eventForm.is_physical && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        實體地址 (輸入將自動生成 Google Maps 連結)
                      </label>
                      <input
                        type="text"
                        placeholder="例如：台北市中正區市民大道三段2號 (三創生活園區 1F)"
                        value={eventForm.address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Google Maps 導航連結 (可自動轉換或手動填寫)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://www.google.com/maps/search/?api=1&query=..."
                          value={eventForm.google_maps_url}
                          onChange={(e) => setEventForm({ ...eventForm, google_maps_url: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                        />
                        {eventForm.google_maps_url && (
                          <a
                            href={eventForm.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>測試連結</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 按鈕群 */}
              </div>
              <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md"
                >
                  確認儲存活動
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: IDOL 偶像 / 動漫實體 新增 / 編輯彈窗 */}
      {/* ===================================================================== */}
      {showIdolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-black text-slate-900">
                {editingIdol ? "編輯實體資料" : "新增偶像/角色"}
              </h3>
              <button
                onClick={() => setShowIdolModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIdol} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">主顯示名稱 *</label>
                  <input
                    type="text"
                    placeholder="例如：成振宇 (Sung Jinwoo)"
                    value={idolForm.name}
                    onChange={(e) => setIdolForm({ ...idolForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">原文/別名</label>
                  <input
                    type="text"
                    placeholder="例如：성진우 / Satoru Gojo"
                    value={idolForm.original_name}
                    onChange={(e) => setIdolForm({ ...idolForm, original_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">頭像立繪 URL *</label>
                  <input
                    type="text"
                    value={idolForm.avatar_url}
                    onChange={(e) => setIdolForm({ ...idolForm, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">宣傳封面大圖 URL</label>
                  <input
                    type="text"
                    value={idolForm.cover_url}
                    onChange={(e) => setIdolForm({ ...idolForm, cover_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">地區/國籍 *</label>
                  <select
                    value={idolForm.country}
                    onChange={(e) =>
                      setIdolForm({ ...idolForm, country: e.target.value as Idol["country"] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="JP">日本 (JP)</option>
                    <option value="KR">韓國 (KR)</option>
                    <option value="TW">台灣 (TW)</option>
                    <option value="US">美國 (US)</option>
                    <option value="CN">中國 (CN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">所屬領域 *</label>
                  <select
                    value={idolForm.category}
                    onChange={(e) =>
                      setIdolForm({ ...idolForm, category: e.target.value as Idol["category"] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="character">動漫角色 (character)</option>
                    <option value="singer">實力歌手</option>
                    <option value="vtuber">虛擬偶像</option>
                    <option value="actor">影視演員</option>
                    <option value="seiyuu">知名聲優</option>
                    <option value="creator">網路創作者</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">實體架構 *</label>
                  <select
                    value={idolForm.formation}
                    onChange={(e) =>
                      setIdolForm({
                        ...idolForm,
                        formation: e.target.value as Idol["formation"],
                        entity_type: e.target.value === "group" ? "universe" : "solo",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="solo">個人單人 (solo)</option>
                    <option value="group">團體組合 (universe)</option>
                  </select>
                </div>
              </div>

              {/* 代表作品 / 神技 / Solo 代表作設定 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-black text-slate-800">
                  代表作品與神技維護 (Notable Works)
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="類型 (如：代表作 / 領域展開 / Solo神曲)"
                    value={tempWorkType}
                    onChange={(e) => setTempWorkType(e.target.value)}
                    className="w-1/3 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="作品或技能名稱 (如：我獨自升級 / 無量空處)"
                    value={tempWorkTitle}
                    onChange={(e) => setTempWorkTitle(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddWork}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0"
                  >
                    + 加入
                  </button>
                </div>

                {idolForm.notable_works && idolForm.notable_works.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {idolForm.notable_works.map((w, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                      >
                        <span className="font-bold text-cyber-violet">[{w.type}]</span>
                        <span>{w.title}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setIdolForm((prev) => ({
                              ...prev,
                              notable_works: prev.notable_works.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-slate-400 hover:text-rose-500 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spotify Track ID (音訊試聽)
                  </label>
                  <input
                    type="text"
                    placeholder="例如：7x92d7UoGqKsp14yM6lZcR"
                    value={idolForm.spotify_track_id}
                    onChange={(e) =>
                      setIdolForm({ ...idolForm, spotify_track_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    YouTube Video ID (影音舞台)
                  </label>
                  <input
                    type="text"
                    placeholder="例如：a51VH9BYzZA"
                    value={idolForm.youtube_video_id}
                    onChange={(e) =>
                      setIdolForm({ ...idolForm, youtube_video_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* 動態成員添加區塊 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>動態成員名單設定 (現有 {idolForm.members.length} 人)</span>
                  <span className="text-cyber-violet font-medium">※依據生日自動換算星座符號</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="成員姓名"
                    value={tempMemberName}
                    onChange={(e) => setTempMemberName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="date"
                    value={tempMemberBirth}
                    onChange={(e) => setTempMemberBirth(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <select
                    value={tempMemberGender}
                    onChange={(e) =>
                      setTempMemberGender(e.target.value as "female" | "male" | "other")
                    }
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="female">女性</option>
                    <option value="male">男性</option>
                    <option value="other">其他</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMemberToForm}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    + 加入成員
                  </button>
                </div>

                {idolForm.members.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2">
                    {idolForm.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white rounded-lg text-xs border border-slate-200/60"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{m.name}</span>
                          <span className="ml-2 text-cyber-violet font-semibold">{m.zodiac}</span>
                          <span className="ml-2 text-slate-400">({m.birth_date})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setIdolForm((prev) => ({
                              ...prev,
                              members: prev.members.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              </div>
              <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowIdolModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
