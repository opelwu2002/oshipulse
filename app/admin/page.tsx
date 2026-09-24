'use client'

import React, { useState, useEffect } from 'react'
import SmartAvatar from '@/components/SmartAvatar'
import {
  Plus,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ShieldCheck,
  ExternalLink,
  Search,
  ShieldAlert,
  Gift,
  Package,
  Mail,
  Reply,
  CheckCircle2,
  AlertTriangle,
  Flame,
  User,
  RefreshCw,
  X,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Clock,
  Send,
  Sparkles,
  Copy,
  Info,
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'events' | 'idols' | 'battles' | 'collabs' | 'store' | 'messages' | 'members'
  >('events')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [tableMissingWarning, setTableMissingWarning] = useState<string | null>(null)

  // ==========================================
  // 1. events (活動排程管理)
  // ==========================================
  const [eventsList, setEventsList] = useState<any[]>([])
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    status: '上架展示中',
    event_type: '線下實體展',
    location: '',
  })

  // ==========================================
  // 2. idols (動漫角色與偶像庫)
  // ==========================================
  const [idolsList, setIdolsList] = useState<any[]>([])
  const [idolSearch, setIdolSearch] = useState('')
  const [editingIdol, setEditingIdol] = useState<any>(null)
  const [isSavingIdol, setIsSavingIdol] = useState(false)

  // ==========================================
  // 3. battles (賽季對決與防弊審計)
  // ==========================================
  const [battleData, setBattleData] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  // ==========================================
  // 4. collabs (聯名許願與抽獎)
  // ==========================================
  const [collabWishes, setCollabWishes] = useState<any[]>([])
  const [drawActivity, setDrawActivity] = useState('IVE 專屬 Lucky Vicky 幸運壓克力立牌應援套組')
  const [drawnWinners, setDrawnWinners] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // ==========================================
  // 5. store (商城庫存與出貨)
  // ==========================================
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'shipped'>('all')

  // ==========================================
  // 6. messages (粉絲諮詢與郵件回覆)
  // ==========================================
  const [messagesList, setMessagesList] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')

  // ==========================================
  // 7. members (會員與粉絲檔案)
  // ==========================================
  const [members, setMembers] = useState<any[]>([])
  const [editingMember, setEditingMember] = useState<any>(null)

  // ------------------------------------------
  // 初始化載入：依據 activeTab 載入真實 API 資料
  // ------------------------------------------
  useEffect(() => {
    setTableMissingWarning(null)
    if (activeTab === 'events') fetchEvents()
    if (activeTab === 'idols') fetchIdols()
    if (activeTab === 'battles') {
      fetchBattles()
      fetchAuditLogs()
    }
    if (activeTab === 'collabs') {
      fetchCollabs()
      fetchMembers() // 供抽獎使用
    }
    if (activeTab === 'store') fetchOrders()
    if (activeTab === 'messages') fetchMessages()
    if (activeTab === 'members') fetchMembers()
  }, [activeTab])

  // --- API 請求函數 ---

  // 1. 活動
  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('events')
      } else if (json.success) {
        setEventsList(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    try {
      const googleMapsUrl = newEvent.location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newEvent.location)}`
        : null

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, google_maps_url: googleMapsUrl }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage('✅ 活動檔期已成功寫入資料庫！')
        setIsAddingEvent(false)
        setNewEvent({
          title: '',
          description: '',
          status: '上架展示中',
          event_type: '線下實體展',
          location: '',
        })
        fetchEvents()
      } else {
        alert(json.message || '新增失敗')
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleDeleteEvent(id: number | string) {
    if (!confirm('確定要從資料庫刪除此檔活動嗎？')) return
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMessage('🗑️ 活動已成功從資料庫刪除')
        fetchEvents()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleDuplicateEvent(event: any) {
    try {
      const googleMapsUrl = event.location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
        : null

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${event.title} (複製副本)`,
          description: event.description,
          status: '排程準備中',
          event_type: event.event_type,
          location: event.location,
          google_maps_url: googleMapsUrl,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage('📋 複製活動成功！新副本已儲存至資料庫。')
        fetchEvents()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  // 2. 偶像
  async function fetchIdols() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/idols')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('idols')
      } else if (json.success) {
        setIdolsList(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleIdolStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'active' ? 'archived' : 'active'
    try {
      const res = await fetch('/api/admin/idols', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage(`偶像狀態已更新為：${nextStatus === 'active' ? '活躍中' : '已封存'}`)
        fetchIdols()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleSaveIdol(e: React.FormEvent) {
    e.preventDefault()
    if (!editingIdol) return
    setIsSavingIdol(true)
    try {
      const res = await fetch('/api/admin/idols', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingIdol),
      })
      const json = await res.json()
      if (json.success) {
        setMessage(`✅ 偶像【${editingIdol.name}】資料已成功同步更新至資料庫！`)
        setEditingIdol(null)
        fetchIdols()
      } else {
        alert(json.message || '更新失敗')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsSavingIdol(false)
    }
  }

  // 3. 對決與日誌
  async function fetchBattles() {
    try {
      const res = await fetch('/api/admin/battles')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('battles')
      } else if (json.success) {
        setBattleData(json.battle)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchAuditLogs() {
    try {
      const res = await fetch('/api/admin/audit-logs')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('audit_logs')
      } else if (json.success) {
        setAuditLogs(json.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleBlockIp(id: number | string, ip: string) {
    if (!confirm(`確定要將惡意灌票來源 IP 【${ip}】永久列入黑名單並寫入資料庫嗎？`)) return
    try {
      const res = await fetch('/api/admin/audit-logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, blocked: true }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage(`🚨 成功封鎖可疑來源 IP: ${ip}，狀態已寫入資料庫！`)
        fetchAuditLogs()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  // 4. 聯名與抽獎
  async function fetchCollabs() {
    try {
      const res = await fetch('/api/admin/collabs')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('collab_wishes')
      } else if (json.success) {
        setCollabWishes(json.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 從真實會員資料庫抽獎
  function handleRunRealDraw() {
    if (members.length === 0) {
      alert('【資料庫提示】目前系統中尚無註冊會員，請先至前台註冊真實會員後再進行抽獎！')
      return
    }
    setIsDrawing(true)
    setTimeout(() => {
      // 隨機從真實 profiles 中挑選最多 5 位
      const shuffled = [...members].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, Math.min(5, members.length)).map((m, idx) => ({
        user: m.username,
        name: m.full_name || m.username,
        code: `OSHI-LUCKY-${Math.floor(1000 + Math.random() * 9000)}`,
        time: '剛剛',
      }))
      setDrawnWinners(selected)
      setIsDrawing(false)
      setMessage(`🎉 已成功從真實註冊會員庫抽出 ${selected.length} 名【${drawActivity}】幸運得主！`)
    }, 800)
  }

  // 5. 商城訂單
  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('orders')
      } else if (json.success) {
        setOrdersList(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleShipOrder(orderId: string) {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'shipped' }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage(`📦 訂單 ${orderId} 狀態已更新為【已出貨】！`)
        fetchOrders()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  // 6. 粉絲諮詢訊息
  async function fetchMessages() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/messages')
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('messages')
      } else if (json.success) {
        setMessagesList(json.data || [])
        if (json.data && json.data.length > 0) {
          setSelectedMessage(json.data[0])
        } else {
          setSelectedMessage(null)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMessage || !replyContent.trim()) return
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMessage.id,
          status: 'replied',
          reply_content: replyContent.trim(),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage(`✉️ 已將回覆寫入資料庫並標記處理完成！`)
        setReplyContent('')
        fetchMessages()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  // 7. 會員真實 CRUD
  async function fetchMembers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/members')
      const json = await res.json()
      if (json.success) {
        setMembers(json.data || [])
      } else {
        setMembers([])
      }
    } catch (err) {
      console.error('讀取會員失敗:', err)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteMember(id: string) {
    if (!confirm('確定要從資料庫永久刪除這位會員嗎？此動作將完全抹除該會員資料。')) return
    try {
      const res = await fetch(`/api/admin/members?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMessage('✅ 會員已確實從資料庫抹除，重整頁面絕不復原！')
        fetchMembers()
      } else {
        alert(json.message || '刪除失敗')
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleUpdateMember(e: React.FormEvent) {
    e.preventDefault()
    if (!editingMember) return
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      })
      const json = await res.json()
      if (json.success) {
        setMessage('✅ 會員資料已確實同步更新至資料庫！')
        setEditingMember(null)
        fetchMembers()
      } else {
        alert(json.message || '更新失敗')
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  const tabs = [
    { id: 'events', label: '活動排程管理' },
    { id: 'idols', label: '動漫角色與偶像庫' },
    { id: 'battles', label: '賽季對決與防弊審計' },
    { id: 'collabs', label: '聯名許願與抽獎' },
    { id: 'store', label: '商城庫存與出貨' },
    { id: 'messages', label: '粉絲諮詢與郵件回覆' },
    { id: 'members', label: '👥 會員與粉絲檔案' },
  ]

  return (
    <div className="pb-20 bg-slate-50/50 min-h-screen">
      {/* 導航 Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30 p-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap gap-2.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-6">
        {/* 全域反饋訊息 */}
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-bold shadow-sm border border-emerald-200 flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </span>
            <button
              onClick={() => setMessage('')}
              className="text-emerald-500 hover:text-emerald-800 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 資料表尚未建立警告 (未建表提示) */}
        {tableMissingWarning && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-black text-base text-amber-900">
                  Supabase 資料表尚未建立：【{tableMissingWarning}】
                </h3>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  系統目前正連線至您的遠端 Supabase 資料庫，但尚未偵測到此資料表。
                  我們已在專案根目錄備妥完整的建表與種子資料腳本：
                  <code className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono text-xs font-bold mx-1">
                    supabase-schema.sql
                  </code>
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-700">
                    💡 請至 Supabase 控制台的 SQL Editor 貼上執行該檔案，所有初始資料將瞬間就緒！
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            Tab 1: events (活動排程管理)
        ========================================== */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    活動辦理與排程管理 CMS
                  </h2>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {eventsList.length} 檔活動
                  </span>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                  直接對接 Supabase 資料庫。支援設定活動名稱、實體地點 Google Maps
                  連動、複製活動副本與刪除管理。
                </p>
              </div>
              <button
                onClick={() => setIsAddingEvent(!isAddingEvent)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shrink-0 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {isAddingEvent ? '取消新增' : '新增活動檔期'}
              </button>
            </div>

            {/* 新增活動表單 */}
            {isAddingEvent && (
              <form
                onSubmit={handleCreateEvent}
                className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4"
              >
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" /> 新增檔期活動
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">活動名稱</label>
                    <input
                      type="text"
                      required
                      placeholder="例：【特企】成振宇 全球首映會"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">活動類型</label>
                    <select
                      value={newEvent.event_type}
                      onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="線下實體展">線下實體展</option>
                      <option value="線上數位展">線上數位展</option>
                      <option value="跨界快閃店">跨界快閃店</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">實體地點</label>
                    <input
                      type="text"
                      placeholder="例：台北三創生活園區 1F 廣場"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">公開狀態</label>
                    <select
                      value={newEvent.status}
                      onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="上架展示中">上架展示中</option>
                      <option value="排程準備中">排程準備中</option>
                      <option value="已結束">已結束</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">活動介紹</label>
                    <textarea
                      rows={3}
                      placeholder="活動說明與粉絲應援細節..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm rounded-xl shadow cursor-pointer"
                  >
                    儲存至資料庫
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="text-center py-16 text-slate-400">載入資料庫中...</div>
            ) : eventsList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                目前資料庫中尚無活動排程。點擊右上角「新增活動檔期」開始建立。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsList.map((event) => (
                  <div
                    key={event.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
                  >
                    <div className="h-44 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                      <span className="relative z-10 text-3xl font-black text-white/40 tracking-widest">
                        OshiPulse
                      </span>
                      <div className="absolute top-4 left-4 flex gap-2 z-20">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2 py-1 rounded-full">
                          {event.status}
                        </span>
                        <span className="bg-pink-100 text-pink-800 text-xs font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.event_type}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{event.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
                        {event.description || '無詳細說明'}
                      </p>
                      {event.location && (
                        <div className="mt-3 text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-pink-500" />
                          <span>{event.location}</span>
                          {event.google_maps_url && (
                            <a
                              href={event.google_maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-pink-600 hover:underline ml-1 inline-flex items-center gap-0.5"
                            >
                              導航 <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <button
                          onClick={() => handleDuplicateEvent(event)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> 複製副本
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            Tab 2: idols (動漫角色與偶像庫)
        ========================================== */}
        {activeTab === 'idols' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    動漫角色與偶像名冊庫
                  </h2>
                  <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {idolsList.length} 位入庫
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  與資料庫即時同步。支援即時切換【活躍 / 封存】狀態，設定結果永久保存。
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜尋角色名稱、作品..."
                    value={idolSearch}
                    onChange={(e) => setIdolSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400">載入偶像庫中...</div>
            ) : idolsList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                目前資料庫中尚無角色資料。請執行根目錄 supabase-schema.sql 匯入初始名冊。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {idolsList
                  .filter(
                    (i) =>
                      !idolSearch ||
                      i.name.toLowerCase().includes(idolSearch.toLowerCase()) ||
                      i.work.toLowerCase().includes(idolSearch.toLowerCase())
                  )
                  .map((idol) => (
                    <div
                      key={idol.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm relative">
                          <SmartAvatar
                            src={idol.avatar}
                            alt={idol.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{idol.name}</h4>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{idol.work}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                              {idol.category}
                            </span>
                            {idol.match_history && (
                              <span
                                className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 max-w-[140px] truncate"
                                title={idol.match_history}
                              >
                                🏆 {idol.match_history}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs font-black text-rose-600">
                          <Flame className="w-3.5 h-3.5 fill-rose-600" />
                          <span>{(idol.votes || 0).toLocaleString()} 票</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingIdol({ ...idol })}
                            className="text-xs font-bold px-2.5 py-1 rounded-lg border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="編輯角色完整資料"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>編輯</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleIdolStatus(idol.id, idol.status)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              idol.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {idol.status === 'active' ? '活躍中' : '已封存'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ==========================================
                編輯動漫角色與偶像對話框 (Modal)
            ========================================== */}
            {editingIdol && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                        <Edit className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          編輯角色與偶像檔案
                        </h3>
                        <p className="text-xs text-slate-400">編號 ID: {editingIdol.id}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingIdol(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleSaveIdol} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* 圖片預覽與連結 */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-pink-200 shadow-sm relative bg-white">
                        <SmartAvatar
                          src={editingIdol.avatar || '/images/idols/sung-jinwoo.jpg'}
                          alt={editingIdol.name || '預覽'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 w-full space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          角色圖片連結 (Image URL / 本地路徑) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingIdol.avatar || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, avatar: e.target.value })
                          }
                          placeholder="/images/idols/sung-jinwoo.jpg 或外部網址"
                          className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        />
                        <p className="text-[11px] text-slate-400">
                          建議優先使用本地路徑（例如 <code className="text-pink-600 font-semibold">/images/idols/xxx.jpg</code>），以避開外部防盜鏈。
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 角色名稱 */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          角色名稱 (Character Name) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingIdol.name || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, name: e.target.value })
                          }
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      {/* 動漫/作品名稱 */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          動漫 / 作品名稱 (Anime Title) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingIdol.work || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, work: e.target.value })
                          }
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      {/* 角色屬性/標籤 */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          角色屬性 / 標籤 (Attributes)
                        </label>
                        <input
                          type="text"
                          value={editingIdol.category || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, category: e.target.value })
                          }
                          placeholder="例如：特級咒術師、四代女團、暗影君王"
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>

                      {/* 角色狀態 */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          角色狀態 (Status)
                        </label>
                        <select
                          value={editingIdol.status || 'active'}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, status: e.target.value })
                          }
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        >
                          <option value="active">活躍中 (開放前台投票與擂台對決)</option>
                          <option value="archived">已封存 (停止前台投票並凍結數據)</option>
                        </select>
                      </div>

                      {/* 票數 */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          總累積票數 (Vote Count)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={editingIdol.votes ?? 0}
                            onChange={(e) =>
                              setEditingIdol({ ...editingIdol, votes: Number(e.target.value) })
                            }
                            className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            票
                          </span>
                        </div>
                      </div>

                      {/* 對抗活動紀錄 */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          對抗活動紀錄 (Match History)
                        </label>
                        <textarea
                          rows={3}
                          value={editingIdol.match_history || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, match_history: e.target.value })
                          }
                          placeholder="例如：2026 第一季巔峰決戰 冠軍 (勝率 78%)、夏季跨界人氣大賞 8強"
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          紀錄該角色參與之拔河對決、聯名活動或歷史勝負數據，供後台審計與前台檔案展示。
                        </p>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingIdol(null)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingIdol}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingIdol ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>同步至資料庫中...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>儲存並同步至資料庫</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            Tab 3: battles (賽季對決與防弊審計)
        ========================================== */}
        {activeTab === 'battles' && (
          <div className="space-y-8">
            {/* 擂台現況 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                🏆 賽季 1v1 巔峰對決狀態
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                即時掌控擂台比分與比賽進行狀態，資料直連 Supabase battles 資料庫。
              </p>

              {battleData ? (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black px-3 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full">
                      {battleData.season_name}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                      ● 狀態：{battleData.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                    {/* 紅方 */}
                    <div className="text-center p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-rose-500">
                        <SmartAvatar
                          src={battleData.red_avatar || '/images/idols/sung-jinwoo.jpg'}
                          alt={battleData.red_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-base text-rose-300">{battleData.red_name}</h4>
                      <p className="text-2xl font-black text-white mt-1">
                        {(battleData.red_votes || 0).toLocaleString()} 票
                      </p>
                    </div>

                    {/* 藍方 */}
                    <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-blue-500">
                        <SmartAvatar
                          src={battleData.blue_avatar || '/images/idols/gojo-satoru.jpg'}
                          alt={battleData.blue_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-base text-blue-300">{battleData.blue_name}</h4>
                      <p className="text-2xl font-black text-white mt-1">
                        {(battleData.blue_votes || 0).toLocaleString()} 票
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  目前資料庫中尚無進行中賽季對決。請執行 supabase-schema.sql 初始化。
                </div>
              )}
            </div>

            {/* 防弊審計日誌 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    即時防弊審計與灌票監控日誌
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    直連 Supabase audit_logs 資料庫。點擊封鎖將即刻將來源 IP 寫入黑名單。
                  </p>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  目前尚無審計日誌。
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-600">
                      <tr>
                        <th className="px-4 py-3 text-left">時間</th>
                        <th className="px-4 py-3 text-left">來源會員</th>
                        <th className="px-4 py-3 text-left">IP 位址 / 地點</th>
                        <th className="px-4 py-3 text-left">風險評級</th>
                        <th className="px-4 py-3 text-left">偵測原因</th>
                        <th className="px-4 py-3 text-right">處置動作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{log.time}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{log.username}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {log.ip}{' '}
                            <span className="text-[10px] text-slate-400">({log.country || '未知'})</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                log.risk === 'Danger'
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.risk === 'Warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {log.risk}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{log.reason}</td>
                          <td className="px-4 py-3 text-right">
                            {log.blocked ? (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-200">
                                🚫 已封鎖
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBlockIp(log.id, log.ip)}
                                className="text-rose-600 hover:text-white hover:bg-rose-600 px-2.5 py-1 rounded border border-rose-200 font-bold transition cursor-pointer"
                              >
                                封鎖 IP
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            Tab 4: collabs (聯名許願與抽獎)
        ========================================== */}
        {activeTab === 'collabs' && (
          <div className="space-y-8">
            {/* 許願清單 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                🎁 聯名許願集氣清單
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                粉絲發起之品牌跨界許願，資料直連 Supabase collab_wishes 資料庫。
              </p>

              {collabWishes.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  目前尚無聯名許願提案。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {collabWishes.map((c) => (
                    <div
                      key={c.id}
                      className="border border-slate-200 rounded-2xl p-5 bg-white hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          {c.brand} × {c.idol}
                        </span>
                        <span className="text-xs font-bold text-pink-600">{c.status}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mb-3">{c.theme}</h4>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className="bg-pink-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round(((c.votes || 0) / (c.target || 15000)) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>集氣：{(c.votes || 0).toLocaleString()} 票</span>
                        <span>目標：{(c.target || 15000).toLocaleString()} 票</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 真實會員抽獎系統 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-pink-500" />
                    專屬應援週邊抽獎搖獎機 (直連真實註冊會員)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    系統直接從已註冊的真實會員庫中進行隨機抽取，杜絕假中獎名單。
                  </p>
                </div>
                <button
                  onClick={handleRunRealDraw}
                  disabled={isDrawing}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isDrawing ? '正在搖獎中...' : '🎲 立即抽出 5 名幸運會員'}
                </button>
              </div>

              {drawnWinners.length > 0 && (
                <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-5 animate-fade-in">
                  <h4 className="font-bold text-pink-900 text-sm mb-3">
                    🎊 本輪幸運得獎名單（直連 profiles 會員庫）：
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {drawnWinners.map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-pink-100 shadow-sm"
                      >
                        <div className="font-bold text-slate-900 text-sm">{w.name}</div>
                        <div className="text-xs text-slate-500 font-mono">@{w.user}</div>
                        <div className="text-[10px] text-pink-600 font-mono font-bold mt-1">
                          中獎代碼：{w.code}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            Tab 5: store (商城庫存與出貨)
        ========================================== */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                  📦 應援週邊訂單與出貨管理
                </h2>
                <p className="text-sm text-slate-500">
                  直連 Supabase orders 資料庫。管理員可一鍵出貨並即刻更新資料庫狀態。
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'shipped'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOrderFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      orderFilter === mode
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mode === 'all' ? '全部訂單' : mode === 'pending' ? '待出貨' : '已出貨'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400">載入訂單中...</div>
            ) : ordersList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                目前資料庫中尚無訂單紀錄。
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left">訂單編號</th>
                      <th className="px-4 py-3 text-left">訂購商品</th>
                      <th className="px-4 py-3 text-left">收件粉絲</th>
                      <th className="px-4 py-3 text-left">金額</th>
                      <th className="px-4 py-3 text-left">狀態</th>
                      <th className="px-4 py-3 text-right">出貨處置</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {ordersList
                      .filter((o) => (orderFilter === 'all' ? true : o.status === orderFilter))
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{o.id}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-[280px]">
                            {o.item_name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <div>{o.buyer_name || '會員下單'}</div>
                            <div className="text-[10px] text-slate-400">{o.buyer_phone || ''}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            NT$ {(Number(o.amount) || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                                o.status === 'shipped'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.status === 'shipped' ? '已出貨' : '待處理'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {o.status === 'pending' ? (
                              <button
                                onClick={() => handleShipOrder(o.id)}
                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition cursor-pointer"
                              >
                                一鍵出貨
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold">已完成配送</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            Tab 6: messages (粉絲諮詢與郵件回覆)
        ========================================== */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
              ✉️ 粉絲諮詢與客服郵件
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              直連 Supabase messages 資料庫。點擊信件檢視詳情並將回覆寫入資料庫。
            </p>

            {loading ? (
              <div className="text-center py-16 text-slate-400">載入客服信件中...</div>
            ) : messagesList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                目前尚無未處理之粉絲諮詢案件。
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 列表 */}
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                  {messagesList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMessage(m)}
                      className={`p-4 cursor-pointer transition ${
                        selectedMessage?.id === m.id
                          ? 'bg-pink-50/70 border-l-4 border-l-pink-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-900">{m.sender}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            m.status === 'replied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.status === 'replied' ? '已回覆' : '未處理'}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                        {m.subject}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{m.content}</p>
                    </div>
                  ))}
                </div>

                {/* 詳情與回覆 */}
                <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                  {selectedMessage ? (
                    <div>
                      <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">
                            {selectedMessage.subject}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            寄件人：{selectedMessage.sender} ({selectedMessage.email}) · 分類：
                            {selectedMessage.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        {selectedMessage.content}
                      </div>

                      {selectedMessage.reply_content && (
                        <div className="text-sm text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-6">
                          <span className="font-bold block mb-1">已寄出之回覆內容：</span>
                          {selectedMessage.reply_content}
                        </div>
                      )}

                      <form onSubmit={handleSendReply} className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">
                          快速撰寫官方回信（將同步寫入資料庫）
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="請輸入回覆內容..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> 發送回覆
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 text-xs">
                      請從左側點選一封信件進行檢視與回覆
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            Tab 7: members (👥 會員與粉絲檔案)
        ========================================== */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              👥 平台註冊會員管理清單
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              直接對接 Supabase profiles 資料表。刪除與編輯直連雲端資料庫，重整頁面絕不復原。
            </p>

            {editingMember && (
              <div className="mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-pink-500" /> 編輯會員資料：
                  {editingMember.username}
                </h3>
                <form onSubmit={handleUpdateMember} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      會員帳號
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.username || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, username: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      真實姓名
                    </label>
                    <input
                      type="text"
                      value={editingMember.full_name || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, full_name: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">暱稱</label>
                    <input
                      type="text"
                      value={editingMember.nickname || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, nickname: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      出生年月日
                    </label>
                    <input
                      type="date"
                      value={editingMember.birth_date || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, birth_date: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      連絡電話
                    </label>
                    <input
                      type="text"
                      value={editingMember.phone || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, phone: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      最推的偶像 / 角色
                    </label>
                    <input
                      type="text"
                      value={editingMember.favorite_idol || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, favorite_idol: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      聯絡地址
                    </label>
                    <input
                      type="text"
                      value={editingMember.address || ''}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, address: e.target.value })
                      }
                      className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                    >
                      取消編輯
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition cursor-pointer"
                    >
                      儲存變更
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-slate-500 font-medium">
                資料庫連線載入中...
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium">
                目前尚無任何註冊會員。當新粉絲在前台註冊時，檔案將即時同步於此處。
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-black text-slate-600">
                        會員帳號 / 姓名
                      </th>
                      <th className="px-6 py-4 text-left font-black text-slate-600">
                        暱稱與推角
                      </th>
                      <th className="px-6 py-4 text-left font-black text-slate-600">
                        聯絡資訊
                      </th>
                      <th className="px-6 py-4 text-right font-black text-slate-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-base">{m.username}</div>
                          <div className="text-slate-500 mt-1">
                            {m.full_name || '未填寫姓名'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-700">
                            暱稱：{m.nickname || '無'}
                          </div>
                          <div className="text-pink-600 font-black mt-1">
                            🔥 推：{m.favorite_idol || '未設定'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">{m.phone || '無電話'}</div>
                          <div
                            className="text-slate-500 mt-1 truncate max-w-[200px]"
                            title={m.address}
                          >
                            {m.address || '無地址'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="text-slate-600 hover:text-slate-900 mr-4 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4 inline-block mr-1" /> 編輯
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="text-rose-600 hover:text-rose-700 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 inline-block mr-1" /> 刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}