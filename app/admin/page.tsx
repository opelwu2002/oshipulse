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
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'events' | 'idols' | 'battles' | 'pledges' | 'collabs' | 'store' | 'messages' | 'members'
  >('events')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [tableMissingWarning, setTableMissingWarning] = useState<string | null>(null)

  // ==========================================
  // 1. events (活動排程管理)
  // ==========================================
  const [eventsList, setEventsList] = useState<any[]>([])
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | string | null>(null)
  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    status: '上架展示中',
    event_type: '線下實體展',
    location: '',
    start_time: '',
    end_time: '',
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
  const [battlesList, setBattlesList] = useState<any[]>([])
  const [editingBattle, setEditingBattle] = useState<any>(null)
  const [isSavingBattle, setIsSavingBattle] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  // ==========================================
  // 3.1. pledges (應援許願池 Pledging)
  // ==========================================
  const [pledgesList, setPledgesList] = useState<any[]>([])
  const [editingPledge, setEditingPledge] = useState<any>(null)
  const [isSavingPledge, setIsSavingPledge] = useState(false)

  // ==========================================
  // 4. collabs (聯名許願與抽獎)
  // ==========================================
  const [collabWishes, setCollabWishes] = useState<any[]>([])
  const [editingCollab, setEditingCollab] = useState<any>(null)
  const [isSavingCollab, setIsSavingCollab] = useState(false)
  const [drawActivity, setDrawActivity] = useState('IVE 專屬 Lucky Vicky 幸運壓克力立牌應援套組')
  const [drawnWinners, setDrawnWinners] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // ==========================================
  // 5. store (商城庫存與出貨)
  // ==========================================
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'shipped' | 'cancelled'>('all')
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  // ==========================================
  // 6. messages (粉絲諮詢與郵件回覆)
  // ==========================================
  const [messagesList, setMessagesList] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingMessage, setEditingMessage] = useState<any>(null)
  const [isSavingMessage, setIsSavingMessage] = useState(false)

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
    if (activeTab === 'pledges') fetchPledges()
    if (activeTab === 'collabs') {
      fetchCollabs()
      fetchMembers() // 供抽獎使用
    }
    if (activeTab === 'store') fetchOrders()
    if (activeTab === 'messages') fetchMessages()
    if (activeTab === 'members') fetchMembers()
  }, [activeTab])

  // --- 活動時間格式化輔助函數 ---
  function formatToDatetimeLocal(isoString?: string | null): string {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      if (isNaN(d.getTime())) return ''
      const pad = (n: number) => n.toString().padStart(2, '0')
      const yyyy = d.getFullYear()
      const MM = pad(d.getMonth() + 1)
      const dd = pad(d.getDate())
      const hh = pad(d.getHours())
      const mm = pad(d.getMinutes())
      return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
    } catch {
      return ''
    }
  }

  function formatDisplayDateTime(isoString?: string | null): string {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } catch {
      return ''
    }
  }

  // --- API 請求函數 ---

  // 1. 活動
  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
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

  // 點擊卡片編輯按鈕，帶入編輯模式
  function handleEditEventClick(event: any) {
    setEditingEventId(event.id)
    setNewEvent({
      title: event.title || '',
      description: event.description || '',
      status: event.status || '上架展示中',
      event_type: event.event_type || '線下實體展',
      location: event.location || '',
      start_time: formatToDatetimeLocal(event.start_time),
      end_time: formatToDatetimeLocal(event.end_time),
    })
    setIsAddingEvent(true)
    // 平滑滾動至上方表單位置
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }

  // 取消編輯模式回到預設狀態
  function handleCancelEditEvent() {
    setEditingEventId(null)
    setIsAddingEvent(false)
    setNewEvent({
      title: '',
      description: '',
      status: '上架展示中',
      event_type: '線下實體展',
      location: '',
      start_time: '',
      end_time: '',
    })
  }

  // 儲存活動（支援新增 POST 與編輯更新 PUT）
  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingEvent(true)
    try {
      const googleMapsUrl = newEvent.location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newEvent.location)}`
        : null

      const payload: any = {
        title: (newEvent.title || '').trim(),
        description: (newEvent.description || '').trim(),
        status: newEvent.status || '上架展示中',
        event_type: newEvent.event_type || '線下實體展',
        location: (newEvent.location || '').trim(),
        google_maps_url: googleMapsUrl,
        start_time: newEvent.start_time ? new Date(newEvent.start_time).toISOString() : null,
        end_time: newEvent.end_time ? new Date(newEvent.end_time).toISOString() : null,
      }

      const isEditing = Boolean(editingEventId)
      if (isEditing) {
        payload.id = editingEventId
      }

      // 1. 發送 API 請求（PUT 編輯 / POST 新增）
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      // 2. 備援直連 Supabase
      if (!json.success) {
        if (isEditing) {
          const { error } = await supabase.from('events').update(payload).eq('id', editingEventId)
          if (error) throw new Error(error.message)
        } else {
          const { error } = await supabase.from('events').insert([payload])
          if (error) throw new Error(error.message)
        }
      }

      setMessage(
        isEditing
          ? `✅ 活動檔期【${payload.title}】已成功更新並同步至資料庫！`
          : `🎉 活動檔期【${payload.title}】已成功建立並寫入資料庫！`
      )

      handleCancelEditEvent()
      await fetchEvents()
    } catch (e: any) {
      console.error('儲存活動失敗:', e)
      alert(`❌ 儲存活動失敗：${e.message || '無法寫入資料庫'}`)
    } finally {
      setIsSavingEvent(false)
    }
  }

  async function handleDeleteEvent(id: number | string) {
    if (!confirm('⚠️ 確定要從資料庫徹底刪除此檔活動嗎？刪除後不可復原！')) return
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMessage('🗑️ 活動已成功從資料庫刪除')
        setEventsList((prev) => prev.filter((ev) => ev.id !== id))
        fetchEvents()
      } else {
        const { error } = await supabase.from('events').delete().eq('id', id)
        if (!error) {
          setMessage('🗑️ 活動已成功從資料庫刪除')
          setEventsList((prev) => prev.filter((ev) => ev.id !== id))
          fetchEvents()
        } else {
          throw new Error(json.message || error.message)
        }
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
          start_time: event.start_time || null,
          end_time: event.end_time || null,
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
      // 1. 優先嘗試 Supabase 用戶端直連讀取，防範任何中繼快取
      const { data: dbData, error: dbError } = await supabase
        .from('idols')
        .select('*')
        .order('votes', { ascending: false })

      if (!dbError && dbData && dbData.length > 0) {
        const standardized = dbData.map((idol: any) => {
          const img = idol.avatar || idol.avatar_url || idol.image_url || idol.headshot_url || ''
          return {
            ...idol,
            avatar: img,
            avatar_url: img,
            image_url: img,
          }
        })
        setIdolsList(standardized)
        return
      }

      // 2. 備援後端 API 讀取 (加上 no-store 與動態時間戳防止任何快取)
      const res = await fetch(`/api/admin/idols?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('idols')
      } else if (json.success) {
        setIdolsList(json.data || [])
      }
    } catch (e: any) {
      console.error('抓取偶像資料庫失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleIdolStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'active' ? 'archived' : 'active'
    try {
      // 1. 優先透過 Supabase 用戶端直連更新
      const { error: dbError } = await supabase
        .from('idols')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      // 2. 備援管理員 API 更新
      const res = await fetch('/api/admin/idols', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      })
      const json = await res.json()

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      // 3. 樂觀更新前端狀態並重新拉取
      setIdolsList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: nextStatus } : i))
      )
      setMessage(`偶像狀態已更新為：${nextStatus === 'active' ? '活躍中' : '已封存'}`)
      fetchIdols()
    } catch (e: any) {
      console.error('切換偶像狀態失敗:', e)
      alert('切換狀態失敗：' + e.message)
    }
  }

  async function handleSaveIdol(e: React.FormEvent) {
    e.preventDefault()
    if (!editingIdol) return
    setIsSavingIdol(true)
    setMessage('')

    try {
      // 1. 精準對齊 Supabase 資料庫真實欄位（資料庫立繪欄位名稱為 avatar）
      const cleanPayload: any = {
        id: editingIdol.id,
        name: (editingIdol.name || '').trim(),
        work: (editingIdol.work || '').trim(),
        category: (editingIdol.category || '').trim(),
        avatar: (editingIdol.avatar || editingIdol.avatar_url || editingIdol.image_url || editingIdol.headshot_url || '').trim(),
        status: editingIdol.status || 'active',
        votes: Number(editingIdol.votes) || 0,
        updated_at: new Date().toISOString(),
      }

      if (editingIdol.match_history !== undefined) {
        cleanPayload.match_history = (editingIdol.match_history || '').trim()
      }

      console.log('準備真實寫入 Supabase idols 資料表:', cleanPayload)

      // 2. 雙重執行真實寫入：
      // (A) Supabase 用戶端直連 upsert
      let directSuccess = false
      let directErrorMsg = ''
      try {
        let { data, error } = await supabase
          .from('idols')
          .upsert(cleanPayload, { onConflict: 'id' })
          .select()

        // 防呆相容：若資料庫尚未建立 match_history 欄位導致報錯，移除該欄位再次嘗試
        if (error && (error.code === 'PGRST204' || error.message.includes('match_history'))) {
          console.warn('Supabase idols 資料表尚未含有 match_history 欄位，進行降級寫入...')
          const fallbackPayload = { ...cleanPayload }
          delete fallbackPayload.match_history
          const retry = await supabase
            .from('idols')
            .upsert(fallbackPayload, { onConflict: 'id' })
            .select()
          data = retry.data
          error = retry.error
        }

        if (!error && data && data.length > 0) {
          directSuccess = true
          console.log('Supabase 用戶端直連寫入成功:', data[0])
        } else if (error) {
          directErrorMsg = error.message
        }
      } catch (err: any) {
        directErrorMsg = err.message
      }

      // (B) 管理員 API 伺服器端寫入 (使用 service_role，確保持久化)
      const res = await fetch(`/api/admin/idols?t=${Date.now()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      })
      const json = await res.json()

      // 若兩者皆失敗，拋出明確錯誤，絕不假報成功！
      if (!directSuccess && !json.success) {
        const finalError = json.message || directErrorMsg || '寫入資料庫失敗'
        throw new Error(finalError)
      }

      // 3. 樂觀同步前端畫面（消除任何網路延遲的視覺抖動）
      setIdolsList((prev) =>
        prev.map((item) =>
          item.id === cleanPayload.id
            ? {
                ...item,
                ...cleanPayload,
                avatar_url: cleanPayload.avatar,
                image_url: cleanPayload.avatar,
              }
            : item
        )
      )

      setMessage(`✅ 偶像【${cleanPayload.name}】資料已真實同步寫入 Supabase 資料庫！`)
      setEditingIdol(null)

      // 4. 立即從 Supabase 重新拉取最新資料 (Re-fetch)
      await fetchIdols()
    } catch (e: any) {
      console.error('儲存至 Supabase 資料庫發生錯誤:', e)
      alert(`❌ 儲存失敗：${e.message || '無法寫入資料庫，請檢查資料欄位或網路連線'}`)
      setMessage(`❌ 儲存失敗：${e.message}`)
    } finally {
      setIsSavingIdol(false)
    }
  }

  function handleDuplicateIdol(idol: any) {
    const copyId = `${idol.id}-copy-${Date.now().toString().slice(-4)}`
    setEditingIdol({
      id: copyId,
      name: `${idol.name} (副本)`,
      work: idol.work || '',
      category: idol.category || '',
      avatar: idol.avatar || idol.avatar_url || idol.image_url || idol.headshot_url || 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg',
      status: 'active',
      votes: Number(idol.votes) || 0,
      match_history: idol.match_history || '',
      isNew: true,
      isCopy: true,
    })
  }

  // 3. 對決與日誌
  async function fetchBattles() {
    try {
      // 1. 優先嘗試 Supabase 用戶端直連讀取，防範任何中繼快取
      const { data: dbData, error: dbError } = await supabase
        .from('battles')
        .select('*')
        .order('id', { ascending: false })

      if (!dbError && dbData && dbData.length > 0) {
        setBattlesList(dbData)
        return
      }

      // 2. 備援管理員 API 讀取
      const res = await fetch(`/api/admin/battles?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('battles')
      } else if (json.success) {
        setBattlesList(json.battles || (json.battle ? [json.battle] : []))
      }
    } catch (e) {
      console.error('抓取對決資料失敗:', e)
    }
  }

  function handleNewBattle() {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    setEditingBattle({
      isNew: true,
      title: '2026 跨界巔峰對決冠軍賽',
      season_name: 'Season 2 決戰之巔',
      status: 'live',
      start_time: formatToDatetimeLocal(now.toISOString()),
      end_time: formatToDatetimeLocal(nextWeek.toISOString()),
      red_name: '成振宇 (Sung Jinwoo)',
      red_avatar: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg',
      red_votes: 125000,
      blue_name: '五條悟 (Satoru Gojo)',
      blue_avatar: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg',
      blue_votes: 118000,
    })
  }

  async function handleSaveBattle(e: React.FormEvent) {
    e.preventDefault()
    if (!editingBattle) return
    setIsSavingBattle(true)
    setMessage('')

    try {
      const payload: any = {
        title: (editingBattle.title || '').trim(),
        season_name: (editingBattle.season_name || '2026 跨界巔峰對決').trim(),
        red_name: (editingBattle.red_name || '').trim(),
        red_avatar: (editingBattle.red_avatar || '').trim(),
        red_votes: Number(editingBattle.red_votes) || 0,
        blue_name: (editingBattle.blue_name || '').trim(),
        blue_avatar: (editingBattle.blue_avatar || '').trim(),
        blue_votes: Number(editingBattle.blue_votes) || 0,
        status: editingBattle.status || 'live',
        start_time: editingBattle.start_time || null,
        end_time: editingBattle.end_time || null,
      }

      if (!editingBattle.isNew) {
        payload.id = editingBattle.id
      }

      let success = false
      let errorMsg = ''

      // 1. 雙重執行真實寫入：優先透過管理員 API (service_role)，確保無 RLS 權限障礙
      const method = editingBattle.isNew ? 'POST' : 'PUT'
      const res = await fetch(`/api/admin/battles?t=${Date.now()}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json.success) {
        success = true
      } else {
        errorMsg = json.message || '寫入失敗'
        // 嘗試備援 Supabase 用戶端直連
        if (editingBattle.isNew) {
          const { error: insertErr } = await supabase.from('battles').insert([payload])
          if (!insertErr) success = true
        } else {
          const { error: updateErr } = await supabase.from('battles').update(payload).eq('id', payload.id)
          if (!updateErr) success = true
        }
      }

      if (!success) {
        throw new Error(errorMsg || '無法寫入資料庫')
      }

      setMessage(
        editingBattle.isNew
          ? `🎉 巔峰對決【${payload.title}】已成功新增並寫入 Supabase 資料庫！`
          : `✅ 巔峰對決【${payload.title}】資料已成功同步更新至 Supabase 資料庫！`
      )
      setEditingBattle(null)
      await fetchBattles()
    } catch (err: any) {
      console.error('儲存對決項目失敗:', err)
      alert(`❌ 儲存失敗：${err.message}`)
      setMessage(`❌ 儲存對決失敗：${err.message}`)
    } finally {
      setIsSavingBattle(false)
    }
  }

  async function handleDeleteBattle(id: number | string, title: string) {
    if (!confirm(`⚠️ 確定要從資料庫徹底刪除對決項目【${title}】(ID: #${id}) 嗎？此操作不可復原！`)) return

    try {
      const res = await fetch(`/api/admin/battles?id=${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (json.success) {
        setMessage(`🗑️ 對決項目 #${id} 已成功從資料庫刪除！`)
        // 樂觀過濾
        setBattlesList((prev) => prev.filter((b) => b.id !== id))
        fetchBattles()
      } else {
        // 嘗試 Supabase 用戶端直連刪除
        const { error: delErr } = await supabase.from('battles').delete().eq('id', id)
        if (!delErr) {
          setMessage(`🗑️ 對決項目 #${id} 已成功從資料庫刪除！`)
          setBattlesList((prev) => prev.filter((b) => b.id !== id))
          fetchBattles()
        } else {
          throw new Error(json.message || delErr.message)
        }
      }
    } catch (err: any) {
      console.error('刪除對決項目失敗:', err)
      alert(`❌ 刪除失敗：${err.message}`)
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

  // 3.1. 應援許願池 (Pledging)
  async function fetchPledges() {
    try {
      // 1. 優先嘗試 Supabase 用戶端直連讀取
      const { data: dbData, error: dbError } = await supabase
        .from('pledge_wishes')
        .select('*')
        .order('id', { ascending: false })

      if (!dbError && dbData && dbData.length > 0) {
        setPledgesList(dbData)
        return
      }

      // 2. 備援管理員 API 讀取
      const res = await fetch(`/api/admin/pledges?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('pledge_wishes')
      } else if (json.success) {
        setPledgesList(json.pledges || (json.pledge ? [json.pledge] : []))
      }
    } catch (e) {
      console.error('抓取應援許願池資料失敗:', e)
    }
  }

  function handleNewPledge() {
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    setEditingPledge({
      isNew: true,
      title: '台北捷運全線燈箱應援企劃 · 五條悟領域展開 2026',
      description: '最強咒術師五條悟全線佔領！集氣滿額即解鎖台北捷運忠孝復興與台北車站巨型光箱廣告。',
      image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      current_votes: 0,
      target_votes: 10000,
      status: 'active',
      start_time: formatToDatetimeLocal(now.toISOString()),
      end_time: formatToDatetimeLocal(nextMonth.toISOString()),
    })
  }

  async function handleSavePledge(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPledge) return
    setIsSavingPledge(true)
    setMessage('')

    try {
      const payload: any = {
        title: (editingPledge.title || '').trim(),
        description: (editingPledge.description || '').trim(),
        image_url: (editingPledge.image_url || '').trim(),
        current_votes: Number(editingPledge.current_votes) || 0,
        target_votes: Number(editingPledge.target_votes) || 10000,
        status: editingPledge.status || 'active',
        start_time: editingPledge.start_time || null,
        end_time: editingPledge.end_time || null,
      }

      if (!editingPledge.isNew) {
        payload.id = editingPledge.id
      }

      const method = editingPledge.isNew ? 'POST' : 'PUT'
      const res = await fetch(`/api/admin/pledges?t=${Date.now()}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      let success = json.success
      if (!success) {
        if (editingPledge.isNew) {
          const { error: insertErr } = await supabase.from('pledge_wishes').insert([payload])
          if (!insertErr) success = true
        } else {
          const { error: updateErr } = await supabase.from('pledge_wishes').update(payload).eq('id', payload.id)
          if (!updateErr) success = true
        }
      }

      if (!success) {
        throw new Error(json.message || '無法儲存許願池資料')
      }

      setMessage(
        editingPledge.isNew
          ? `🎉 應援許願池【${payload.title}】已成功建立！`
          : `✅ 應援許願池【${payload.title}】已成功同步至資料庫！`
      )
      setEditingPledge(null)
      await fetchPledges()
    } catch (err: any) {
      console.error('儲存許願池失敗:', err)
      alert(`❌ 儲存失敗：${err.message}`)
      setMessage(`❌ 儲存許願池失敗：${err.message}`)
    } finally {
      setIsSavingPledge(false)
    }
  }

  async function handleDeletePledge(id: number | string, title: string) {
    if (!confirm(`⚠️ 確定要從資料庫徹底刪除應援許願池【${title}】(ID: #${id}) 嗎？此操作不可復原！`)) return

    try {
      const res = await fetch(`/api/admin/pledges?id=${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (json.success) {
        setMessage(`🗑️ 許願池項目 #${id} 已成功刪除！`)
        setPledgesList((prev) => prev.filter((p) => p.id !== id))
        fetchPledges()
      } else {
        const { error: delErr } = await supabase.from('pledge_wishes').delete().eq('id', id)
        if (!delErr) {
          setMessage(`🗑️ 許願池項目 #${id} 已成功刪除！`)
          setPledgesList((prev) => prev.filter((p) => p.id !== id))
          fetchPledges()
        } else {
          throw new Error(json.message || delErr.message)
        }
      }
    } catch (err: any) {
      console.error('刪除許願池失敗:', err)
      alert(`❌ 刪除失敗：${err.message}`)
    }
  }

  // 4. 聯名與抽獎
  async function fetchCollabs() {
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('collab_wishes')
        .select('*')
        .order('id', { ascending: false })

      if (!dbError && dbData && dbData.length > 0) {
        setCollabWishes(dbData)
        return
      }

      const res = await fetch(`/api/admin/collabs?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
      const json = await res.json()
      if (json.tableMissing) {
        setTableMissingWarning('collab_wishes')
      } else if (json.success) {
        setCollabWishes(json.data || [])
      }
    } catch (e) {
      console.error('抓取聯名許願失敗:', e)
    }
  }

  function handleNewCollab() {
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    setEditingCollab({
      isNew: true,
      brand: 'animate 安利美特',
      idol: '《咒術迴戰》五條悟',
      theme: '特設主題應援咖啡廳與限量特典杯墊',
      target: 15000,
      votes: 0,
      status: '集氣連署中',
      start_time: formatToDatetimeLocal(now.toISOString()),
      end_time: formatToDatetimeLocal(nextMonth.toISOString()),
    })
  }

  async function handleSaveCollab(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCollab) return
    setIsSavingCollab(true)
    setMessage('')

    try {
      const payload: any = {
        brand: (editingCollab.brand || '').trim(),
        idol: (editingCollab.idol || '').trim(),
        theme: (editingCollab.theme || '').trim(),
        target: Number(editingCollab.target) || 15000,
        votes: Number(editingCollab.votes) || 0,
        status: editingCollab.status || '集氣連署中',
        start_time: editingCollab.start_time || null,
        end_time: editingCollab.end_time || null,
      }

      if (!editingCollab.isNew) {
        payload.id = editingCollab.id
      }

      const method = editingCollab.isNew ? 'POST' : 'PUT'
      const res = await fetch(`/api/admin/collabs?t=${Date.now()}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      let success = json.success
      if (!success) {
        if (editingCollab.isNew) {
          const { error: insertErr } = await supabase.from('collab_wishes').insert([payload])
          if (!insertErr) success = true
        } else {
          const { error: updateErr } = await supabase.from('collab_wishes').update(payload).eq('id', payload.id)
          if (!updateErr) success = true
        }
      }

      if (!success) {
        throw new Error(json.message || '無法儲存聯名許願資料')
      }

      setMessage(
        editingCollab.isNew
          ? `🎉 聯名許願【${payload.brand} × ${payload.idol}】已成功建立！`
          : `✅ 聯名許願【${payload.brand} × ${payload.idol}】資料已成功更新！`
      )
      setEditingCollab(null)
      await fetchCollabs()
    } catch (err: any) {
      console.error('儲存聯名許願失敗:', err)
      alert(`❌ 儲存失敗：${err.message}`)
      setMessage(`❌ 儲存聯名許願失敗：${err.message}`)
    } finally {
      setIsSavingCollab(false)
    }
  }

  async function handleDeleteCollab(id: number | string, theme: string) {
    if (!confirm(`⚠️ 確定要從資料庫徹底刪除聯名企劃【${theme}】(ID: #${id}) 嗎？此操作不可復原！`)) return

    try {
      const res = await fetch(`/api/admin/collabs?id=${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (json.success) {
        setMessage(`🗑️ 聯名許願項目 #${id} 已成功刪除！`)
        setCollabWishes((prev) => prev.filter((c) => c.id !== id))
        fetchCollabs()
      } else {
        const { error: delErr } = await supabase.from('collab_wishes').delete().eq('id', id)
        if (!delErr) {
          setMessage(`🗑️ 聯名許願項目 #${id} 已成功刪除！`)
          setCollabWishes((prev) => prev.filter((c) => c.id !== id))
          fetchCollabs()
        } else {
          throw new Error(json.message || delErr.message)
        }
      }
    } catch (err: any) {
      console.error('刪除聯名許願失敗:', err)
      alert(`❌ 刪除失敗：${err.message}`)
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
      const { error: dbError } = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', orderId)

      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'shipped' }),
      })
      const json = await res.json()
      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setMessage(`📦 訂單 ${orderId} 狀態已更新為【已出貨】！`)
      fetchOrders()
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleSaveOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!editingOrder) return
    setIsSavingOrder(true)
    try {
      const cleanPayload = {
        buyer_name: (editingOrder.buyer_name || '').trim(),
        buyer_phone: (editingOrder.buyer_phone || '').trim(),
        item_name: (editingOrder.item_name || '').trim(),
        amount: Number(editingOrder.amount) || 0,
        status: editingOrder.status || 'pending',
      }

      // 1. 直連 Supabase 更新
      const { error: dbError } = await supabase
        .from('orders')
        .update(cleanPayload)
        .eq('id', editingOrder.id)

      // 2. 備援管理員 API
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingOrder.id, ...cleanPayload }),
      })
      const json = await res.json()

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setMessage(`✅ 訂單【${editingOrder.id}】資料已成功同步更新至資料庫！`)
      setEditingOrder(null)
      fetchOrders()
    } catch (err: any) {
      console.error('更新訂單失敗:', err)
      alert(`❌ 更新訂單失敗：${err.message}`)
    } finally {
      setIsSavingOrder(false)
    }
  }

  async function handleDeleteOrder(id: string) {
    if (!confirm(`⚠️ 確定要永久刪除此筆訂單【${id}】嗎？此操作將自資料庫完全抹除且不可復原！`)) return
    try {
      const { error: dbError } = await supabase.from('orders').delete().eq('id', id)
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setOrdersList((prev) => prev.filter((o) => o.id !== id))
      setMessage(`🗑️ 訂單【${id}】已成功從資料庫永久刪除！`)
      fetchOrders()
    } catch (err: any) {
      console.error('刪除訂單失敗:', err)
      alert(`❌ 刪除訂單失敗：${err.message}`)
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
          setSelectedMessage((prev: any) => {
            if (prev) {
              const found = json.data.find((m: any) => m.id === prev.id)
              return found || json.data[0]
            }
            return json.data[0]
          })
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
      const { error: dbError } = await supabase
        .from('messages')
        .update({
          status: 'replied',
          reply_content: replyContent.trim(),
        })
        .eq('id', selectedMessage.id)

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

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setMessage(`✉️ 已將回覆寫入資料庫並標記處理完成！`)
      setReplyContent('')
      fetchMessages()
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleSaveMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!editingMessage) return
    setIsSavingMessage(true)
    try {
      const cleanPayload = {
        subject: (editingMessage.subject || '').trim(),
        category: (editingMessage.category || '').trim(),
        sender: (editingMessage.sender || '').trim(),
        email: (editingMessage.email || '').trim(),
        content: (editingMessage.content || '').trim(),
        status: editingMessage.status || 'unread',
      }

      const { error: dbError } = await supabase
        .from('messages')
        .update(cleanPayload)
        .eq('id', editingMessage.id)

      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingMessage.id, ...cleanPayload }),
      })
      const json = await res.json()

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setMessage(`✅ 粉絲諮詢案【${cleanPayload.subject}】已成功同步更新！`)
      setSelectedMessage((prev: any) =>
        prev?.id === editingMessage.id ? { ...prev, ...cleanPayload } : prev
      )
      setEditingMessage(null)
      fetchMessages()
    } catch (err: any) {
      console.error('更新諮詢案失敗:', err)
      alert(`❌ 更新諮詢案失敗：${err.message}`)
    } finally {
      setIsSavingMessage(false)
    }
  }

  async function handleDeleteMessage(id: number | string) {
    if (!confirm('⚠️ 確定要永久刪除此筆粉絲諮詢紀錄嗎？刪除後無法復原。')) return
    try {
      const { error: dbError } = await supabase.from('messages').delete().eq('id', id)
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setMessage('🗑️ 粉絲諮詢案件已成功刪除！')
      setSelectedMessage(null)
      fetchMessages()
    } catch (err: any) {
      console.error('刪除訊息失敗:', err)
      alert('刪除訊息失敗：' + err.message)
    }
  }

  async function handleDeleteReply(id: number | string) {
    if (!confirm('確定要清除此筆回覆紀錄嗎？清除後狀態將轉為【未處理】。')) return
    try {
      const { error: dbError } = await supabase
        .from('messages')
        .update({ reply_content: null, status: 'unread' })
        .eq('id', id)

      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reply_content: null, status: 'unread' }),
      })
      const json = await res.json()

      if (dbError && !json.success) {
        throw new Error(dbError.message || json.message)
      }

      setMessage('🗑️ 已成功刪除回覆內容並重設案件狀態！')
      fetchMessages()
    } catch (err: any) {
      alert(err.message)
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
    { id: 'pledges', label: '應援許願池 (Pledging)' },
    { id: 'collabs', label: '聯名許願集氣與抽獎' },
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
                  直接對接 Supabase 資料庫。支援設定活動名稱、起訖時間區間、實體地點 Google Maps
                  連動、完整活動編輯、複製活動副本與刪除管理。
                </p>
              </div>
              <button
                onClick={() => {
                  if (isAddingEvent && editingEventId) {
                    handleCancelEditEvent()
                  } else {
                    setIsAddingEvent(!isAddingEvent)
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shrink-0 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {isAddingEvent ? (editingEventId ? '取消編輯' : '收起表單') : '+ 新增活動檔期'}
              </button>
            </div>

            {/* 新增 / 編輯活動表單 */}
            {isAddingEvent && (
              <form
                onSubmit={handleSaveEvent}
                className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    {editingEventId ? (
                      <>
                        <Edit className="w-4 h-4 text-pink-500" />
                        <span>✏️ 正在編輯活動檔期：【{newEvent.title || '未命名'}】</span>
                        <span className="text-xs font-mono font-normal text-slate-400">ID: #{editingEventId}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span>新增檔期活動</span>
                      </>
                    )}
                  </h3>
                  {editingEventId && (
                    <button
                      type="button"
                      onClick={handleCancelEditEvent}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      ✕ 放棄編輯
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      活動名稱 <span className="text-rose-500">*</span>
                    </label>
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
                      <option value="大型演唱會">大型演唱會</option>
                      <option value="粉絲見面會">粉絲見面會</option>
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
                      <option value="上架展示中">上架展示中 (前台展示)</option>
                      <option value="排程準備中">排程準備中 (籌備未開放)</option>
                      <option value="已結束">已結束 (歷史存檔)</option>
                    </select>
                  </div>

                  {/* 🌟 活動起訖時間區間設定 (Start Time & End Time) */}
                  <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                    <label className="block text-xs font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>活動開始時間 (Start Time)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                    <p className="text-[10px] text-purple-600/80 mt-1">選填，活動對外開放起始時間點。</p>
                  </div>

                  <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                    <label className="block text-xs font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>活動結束時間 (End Time)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                    <p className="text-[10px] text-purple-600/80 mt-1">選填，活動撤展或截止時間點。</p>
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

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEditEvent}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEvent}
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingEvent ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>同步至資料庫中...</span>
                      </>
                    ) : editingEventId ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>💾 儲存活動變更</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>儲存至資料庫</span>
                      </>
                    )}
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
                    className={`border rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col ${
                      editingEventId === event.id ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    <div className="h-44 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                      <span className="relative z-10 text-3xl font-black text-white/40 tracking-widest">
                        OshiPulse
                      </span>
                      <div className="absolute top-4 left-4 flex gap-2 z-20">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                          event.status === '上架展示中'
                            ? 'bg-emerald-100 text-emerald-800'
                            : event.status === '排程準備中'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {event.status}
                        </span>
                        <span className="bg-pink-100 text-pink-800 text-xs font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.event_type}
                        </span>
                      </div>
                      <span className="absolute top-4 right-4 text-xs font-mono font-bold text-white/50 bg-black/40 px-2 py-0.5 rounded-full z-20">
                        #{event.id}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                          <span>{event.title}</span>
                          {editingEventId === event.id && (
                            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                              編輯中
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {event.description || '無詳細說明'}
                        </p>

                        {/* 🌟 活動起訖時間區間標籤展示 */}
                        {(event.start_time || event.end_time) ? (
                          <div className="mt-3 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>
                              {event.start_time ? formatDisplayDateTime(event.start_time) : '未定'}
                              {' ~ '}
                              {event.end_time ? formatDisplayDateTime(event.end_time) : '未定'}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-300 shrink-0" />
                            <span>未設定活動時間區間</span>
                          </div>
                        )}

                        {event.location && (
                          <div className="mt-2.5 text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span className="truncate">{event.location}</span>
                            {event.google_maps_url && (
                              <a
                                href={event.google_maps_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-600 hover:underline ml-1 inline-flex items-center gap-0.5 shrink-0"
                              >
                                導航 <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 卡片操作列：新增「編輯」按鈕 */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicateEvent(event)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="一鍵複製此活動並建立排程副本"
                        >
                          <Copy className="w-3.5 h-3.5" /> 複製副本
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* 🌟 核心新增：「編輯」按鈕 */}
                          <button
                            type="button"
                            onClick={() => handleEditEventClick(event)}
                            className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-pink-200 transition cursor-pointer shadow-2xs"
                            title="編輯此活動資料與時間區間"
                          >
                            <Edit className="w-3.5 h-3.5" /> 編輯
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 cursor-pointer"
                            title="刪除此活動"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 刪除
                          </button>
                        </div>
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

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setEditingIdol({
                      id: 'char-' + Date.now().toString().slice(-6),
                      name: '',
                      work: '',
                      category: '動漫角色',
                      avatar: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg',
                      status: 'active',
                      votes: 0,
                      match_history: '',
                      isNew: true,
                    })
                  }
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增角色或偶像</span>
                </button>

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
                            src={idol.avatar || idol.avatar_url || idol.image_url || idol.headshot_url}
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

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateIdol(idol)}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="一鍵複製此角色並快速建立副本"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>複製</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEditingIdol({
                                ...idol,
                                avatar:
                                  idol.avatar ||
                                  idol.avatar_url ||
                                  idol.image_url ||
                                  idol.headshot_url ||
                                  '',
                              })
                            }
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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
                        {editingIdol.isCopy ? <Copy className="w-5 h-5" /> : editingIdol.isNew ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {editingIdol.isCopy
                            ? '一鍵複製建立新角色 (副本)'
                            : editingIdol.isNew
                            ? '新增動漫角色或偶像名冊'
                            : '編輯角色與偶像檔案'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {editingIdol.isNew ? '即刻直連寫入 Supabase 資料庫' : `編號 ID: ${editingIdol.id}`}
                        </p>
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
                    {/* 若為新增或複製，提供 ID 自訂輸入框 */}
                    {(editingIdol.isNew || editingIdol.isCopy) && (
                      <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 space-y-1">
                        <label className="block text-xs font-bold text-pink-900">
                          角色唯一識別碼 ID (必填，供資料庫索引) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingIdol.id || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, id: e.target.value.trim() })
                          }
                          placeholder="例如 char-sung-jinwoo-2 或 idol-new"
                          className="block w-full rounded-xl border border-pink-200 px-3 py-2 text-xs font-mono font-bold focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        />
                        <p className="text-[11px] text-pink-600/80">
                          系統已預先為您產生安全唯一 ID，您亦可依需求微調為好記的英數字代碼。
                        </p>
                      </div>
                    )}

                    {/* 圖片預覽與連結 */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-pink-200 shadow-sm relative bg-white">
                        <SmartAvatar
                          src={editingIdol.avatar || 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg'}
                          alt={editingIdol.name || '預覽'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 w-full space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          角色圖片連結 (Image URL / 網路圖床) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingIdol.avatar || ''}
                          onChange={(e) =>
                            setEditingIdol({ ...editingIdol, avatar: e.target.value })
                          }
                          placeholder="請輸入高解析立繪外鏈 (如 AniList, Wikimedia, Google, Unsplash 等)"
                          className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        />
                        <p className="text-[11px] text-slate-400">
                          支援任何標準 HTTPS 圖片網址，系統已內建防盜鏈繞過與破圖優雅降級機制。
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
                            <span>{editingIdol.isNew ? '確認新增並寫入資料庫' : '儲存並同步至資料庫'}</span>
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
            {/* 擂台現況與對決列表 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
                    🏆 賽季 1v1 巔峰對決管理 (CRUD)
                  </h2>
                  <p className="text-sm text-slate-500">
                    即時掌控擂台比分、選手陣容與狀態，資料直連 Supabase battles 資料庫，前台首頁對決擂台將即時動態連動呈現。
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      fetchBattles()
                      fetchAuditLogs()
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                    title="重新整理資料庫"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNewBattle}
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ 新增巔峰對決</span>
                  </button>
                </div>
              </div>

              {/* 對決項目列表 */}
              {battlesList.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-500 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Flame className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">目前資料庫中尚無賽季對決項目</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      您可以點擊下方按鈕建立第一檔對決，設定雙方選手立繪與初始票數，將即刻同步至前台首頁擂台！
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewBattle}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    立即建立第一場對決
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {battlesList.map((battle) => {
                    const totalVotes = (Number(battle.red_votes) || 0) + (Number(battle.blue_votes) || 0)
                    const redRatio = totalVotes > 0 ? ((Number(battle.red_votes) || 0) / totalVotes) * 100 : 50
                    const blueRatio = totalVotes > 0 ? ((Number(battle.blue_votes) || 0) / totalVotes) * 100 : 50

                    return (
                      <div
                        key={battle.id}
                        className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-pink-500/50 transition-all"
                      >
                        {/* 頂部賽季與狀態 */}
                        <div className="flex items-center justify-between gap-2 z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                              #{battle.id}
                            </span>
                            <span className="text-xs font-black px-3 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full">
                              {battle.season_name || '巔峰對決'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {battle.status === 'live' ? (
                              <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1.5 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>進行中 (LIVE)</span>
                              </span>
                            ) : battle.status === 'upcoming' ? (
                              <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                <span>排程準備中 (Upcoming)</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-3 py-1 bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-full flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                                <span>已完賽結算 (Ended)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 賽季起訖時間區間徽章 */}
                        {(battle.start_time || battle.end_time) && (
                          <div className="z-10 flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg w-fit">
                            <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                            <span>
                              {battle.start_time ? formatDisplayDateTime(battle.start_time) : '即日起'}
                              {' ~ '}
                              {battle.end_time ? formatDisplayDateTime(battle.end_time) : '無限期'}
                            </span>
                          </div>
                        )}

                        {/* 對決標題 */}
                        <div className="z-10">
                          <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-pink-300 transition-colors">
                            {battle.title}
                          </h3>
                        </div>

                        {/* 雙雄對抗立繪與即時票數 */}
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-center z-10 bg-slate-950/40 rounded-2xl p-4 sm:p-5 border border-white/5">
                          {/* 紅方選手 */}
                          <div className="text-center flex flex-col items-center">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 border-2 border-rose-500 shadow-lg shadow-rose-500/20 bg-slate-800">
                              <SmartAvatar
                                src={battle.red_avatar || 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg'}
                                alt={battle.red_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 mb-1">
                              紅方陣營
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px]">
                              {battle.red_name}
                            </h4>
                            <p className="text-sm sm:text-base font-black text-rose-400 font-mono mt-0.5">
                              {(Number(battle.red_votes) || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">票</span>
                            </p>
                          </div>

                          {/* 藍方選手 */}
                          <div className="text-center flex flex-col items-center">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 border-2 border-blue-500 shadow-lg shadow-blue-500/20 bg-slate-800">
                              <SmartAvatar
                                src={battle.blue_avatar || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg'}
                                alt={battle.blue_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 mb-1">
                              藍方陣營
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px]">
                              {battle.blue_name}
                            </h4>
                            <p className="text-sm sm:text-base font-black text-blue-400 font-mono mt-0.5">
                              {(Number(battle.blue_votes) || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">票</span>
                            </p>
                          </div>
                        </div>

                        {/* 聲量拉鋸比例條 */}
                        <div className="space-y-1.5 z-10">
                          <div className="flex justify-between text-xs font-mono font-bold">
                            <span className="text-rose-400">{redRatio.toFixed(1)}%</span>
                            <span className="text-[11px] text-slate-400 font-medium">即時聲量佔比</span>
                            <span className="text-blue-400">{blueRatio.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5 sm:h-3 overflow-hidden flex p-0.5 border border-white/10">
                            <div
                              className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-l-full transition-all duration-500"
                              style={{ width: `${redRatio}%` }}
                            />
                            <div className="w-0.5 h-full bg-white z-10" />
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-r-full transition-all duration-500"
                              style={{ width: `${blueRatio}%` }}
                            />
                          </div>
                        </div>

                        {/* 底部操作按鈕 */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between z-10">
                          <span className="text-[11px] text-slate-400">
                            {battle.status === 'live'
                              ? '🔥 前台首頁將即時呈現本對決並開放雙向應援'
                              : battle.status === 'upcoming'
                              ? '⏳ 排程準備中（前台顯示預告，投票鎖定）'
                              : '🏁 賽季已完賽結算（前台展示榮譽榜，投票關閉）'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingBattle({
                                  ...battle,
                                  start_time: formatToDatetimeLocal(battle.start_time),
                                  end_time: formatToDatetimeLocal(battle.end_time),
                                })
                              }
                              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
                              title="編輯此對決資訊與票數"
                            >
                              <Edit className="w-3.5 h-3.5 text-pink-400" />
                              <span>編輯</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBattle(battle.id, battle.title)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1 border border-rose-500/20 cursor-pointer"
                              title="刪除此對決項目"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>刪除</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ==========================================
                編輯 / 新增巔峰對決對話框 (Modal)
            ========================================== */}
            {editingBattle && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                        {editingBattle.isNew ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {editingBattle.isNew ? '新增巔峰對決項目' : '編輯巔峰對決資料'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {editingBattle.isNew
                            ? '即刻直連寫入 Supabase battles 資料庫，前台將同步呈現'
                            : `對決序號 ID: #${editingBattle.id}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingBattle(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleSaveBattle} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 基本資訊 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          對決標題 (Title) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingBattle.title || ''}
                          onChange={(e) => setEditingBattle({ ...editingBattle, title: e.target.value })}
                          placeholder="例如：2026 第一季巔峰拔河冠軍賽"
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          賽季標籤 (Season Name)
                        </label>
                        <input
                          type="text"
                          value={editingBattle.season_name || ''}
                          onChange={(e) => setEditingBattle({ ...editingBattle, season_name: e.target.value })}
                          placeholder="例如：Season 1 終局決戰"
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        />
                      </div>

                      {/* 活動起訖時間區間 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-3 pt-2 border-t border-slate-200/80">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-pink-500" />
                            <span>活動開始時間 (Start Time)</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={editingBattle.start_time || ''}
                            onChange={(e) => setEditingBattle({ ...editingBattle, start_time: e.target.value })}
                            className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-500" />
                            <span>活動結束時間 (End Time)</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={editingBattle.end_time || ''}
                            onChange={(e) => setEditingBattle({ ...editingBattle, end_time: e.target.value })}
                            className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          比賽狀態 (Status)
                        </label>
                        <select
                          value={editingBattle.status || 'live'}
                          onChange={(e) => setEditingBattle({ ...editingBattle, status: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white font-medium"
                        >
                          <option value="live">🔥 進行中 (Live) - 熱烈進行中，前台即時顯示投票與拉鋸戰</option>
                          <option value="upcoming">⏳ 排程準備中 (Upcoming / Scheduled) - 尚未開始，前台可顯示倒數計時或預告</option>
                          <option value="ended">🏁 已完賽結算 (Ended) - 賽季已結算，前台顯示最終贏家金標與結算結果</option>
                        </select>
                      </div>
                    </div>

                    {/* 雙方選手設定 (並列兩欄) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 紅方選手 */}
                      <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                          <span className="text-xs font-black text-rose-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span>選手 A (紅方陣營)</span>
                          </span>
                          <span className="text-[10px] text-rose-500 font-bold">LEFT SIDE</span>
                        </div>

                        {/* 選手立繪即時預覽 */}
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-rose-400 bg-white shadow-sm">
                            <SmartAvatar
                              src={editingBattle.red_avatar || 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg'}
                              alt={editingBattle.red_name || '紅方'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              頭像外鏈 (Image URL) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editingBattle.red_avatar || ''}
                              onChange={(e) => setEditingBattle({ ...editingBattle, red_avatar: e.target.value })}
                              placeholder="請輸入高解析立繪外鏈網址"
                              className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-rose-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* 選手名稱 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            選手名稱 (Name) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingBattle.red_name || ''}
                            onChange={(e) => setEditingBattle({ ...editingBattle, red_name: e.target.value })}
                            placeholder="例如：成振宇 (Sung Jinwoo)"
                            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 bg-white"
                          />
                        </div>

                        {/* 即時票數 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            當前應援票數 (Votes)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={editingBattle.red_votes ?? 0}
                              onChange={(e) => setEditingBattle({ ...editingBattle, red_votes: Number(e.target.value) })}
                              className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-rose-700 focus:border-rose-500 bg-white"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              票
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 藍方選手 */}
                      <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                          <span className="text-xs font-black text-blue-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span>選手 B (藍方陣營)</span>
                          </span>
                          <span className="text-[10px] text-blue-500 font-bold">RIGHT SIDE</span>
                        </div>

                        {/* 選手立繪即時預覽 */}
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-blue-400 bg-white shadow-sm">
                            <SmartAvatar
                              src={editingBattle.blue_avatar || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg'}
                              alt={editingBattle.blue_name || '藍方'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              頭像外鏈 (Image URL) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editingBattle.blue_avatar || ''}
                              onChange={(e) => setEditingBattle({ ...editingBattle, blue_avatar: e.target.value })}
                              placeholder="請輸入高解析立繪外鏈網址"
                              className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* 選手名稱 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            選手名稱 (Name) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingBattle.blue_name || ''}
                            onChange={(e) => setEditingBattle({ ...editingBattle, blue_name: e.target.value })}
                            placeholder="例如：五條悟 (Satoru Gojo)"
                            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 bg-white"
                          />
                        </div>

                        {/* 即時票數 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            當前應援票數 (Votes)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={editingBattle.blue_votes ?? 0}
                              onChange={(e) => setEditingBattle({ ...editingBattle, blue_votes: Number(e.target.value) })}
                              className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-blue-700 focus:border-blue-500 bg-white"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              票
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingBattle(null)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingBattle}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingBattle ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>同步寫入資料庫中...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{editingBattle.isNew ? '確認新增並寫入資料庫' : '儲存並同步至資料庫'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
            Tab 3.1: pledges (應援許願池 Pledging)
        ========================================== */}
        {activeTab === 'pledges' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                    首頁應援許願池管理 (Pledging Pools)
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    直連 Supabase pledge_wishes 資料庫。進行中之許願池將即時呈現於前台首頁 Pledging 專區。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNewPledge}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增應援許願池</span>
                </button>
              </div>

              {pledgesList.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  目前資料庫中尚無應援許願池項目，點擊上方按鈕立即建立！
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pledgesList.map((p) => {
                    const percent = Math.min(100, Math.round(((p.current_votes || 0) / (p.target_votes || 10000)) * 100))
                    return (
                      <div
                        key={p.id}
                        className="border border-slate-200 rounded-2xl p-5 bg-white hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              #{p.id}
                            </span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                p.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : p.status === 'upcoming'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {p.status === 'active' ? '🔥 進行中 (Active)' : p.status === 'upcoming' ? '⏳ 排程準備中' : '🏁 已結束'}
                            </span>
                          </div>

                          <div className="flex gap-4">
                            {p.image_url && (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                <SmartAvatar src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 text-base leading-snug truncate" title={p.title}>
                                {p.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {p.description || '無詳細簡介'}
                              </p>
                            </div>
                          </div>

                          {/* 檔期時間徽章 */}
                          {(p.start_time || p.end_time) && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
                              <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                              <span>
                                {p.start_time ? formatDisplayDateTime(p.start_time) : '即日起'}
                                {' ~ '}
                                {p.end_time ? formatDisplayDateTime(p.end_time) : '無限期'}
                              </span>
                            </div>
                          )}

                          {/* 集氣進度條 */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-amber-500 h-full rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs font-mono text-slate-500 pt-0.5">
                              <span>已集氣：{(p.current_votes || 0).toLocaleString()} 票 ({percent}%)</span>
                              <span>目標：{(p.target_votes || 10000).toLocaleString()} 票</span>
                            </div>
                          </div>
                        </div>

                        {/* 操作按鈕 */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {p.status === 'active' ? '首頁展示進行中' : '未在首頁推薦'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPledge({
                                  ...p,
                                  start_time: formatToDatetimeLocal(p.start_time),
                                  end_time: formatToDatetimeLocal(p.end_time),
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>編輯</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePledge(p.id, p.title)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>刪除</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 新增 / 編輯許願池彈窗 */}
            {editingPledge && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                        {editingPledge.isNew ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {editingPledge.isNew ? '新增應援許願池項目' : '編輯應援許願池資料'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {editingPledge.isNew ? '將直接寫入 Supabase pledge_wishes 資料表' : `許願序號 ID: #${editingPledge.id}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPledge(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePledge} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        許願池標題 (Title) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPledge.title || ''}
                        onChange={(e) => setEditingPledge({ ...editingPledge, title: e.target.value })}
                        placeholder="例如：台北捷運全線燈箱應援企劃 · 五條悟領域展開 2026"
                        className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        簡介文案 / 口號 (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={editingPledge.description || ''}
                        onChange={(e) => setEditingPledge({ ...editingPledge, description: e.target.value })}
                        placeholder="請輸入許願活動口號與達標獎勵說明..."
                        className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        封面圖片網址 (Image URL)
                      </label>
                      <input
                        type="text"
                        value={editingPledge.image_url || ''}
                        onChange={(e) => setEditingPledge({ ...editingPledge, image_url: e.target.value })}
                        placeholder="https://..."
                        className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          目前票數 (Current Votes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingPledge.current_votes ?? 0}
                          onChange={(e) => setEditingPledge({ ...editingPledge, current_votes: Number(e.target.value) })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          目標票數 (Target Votes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingPledge.target_votes ?? 10000}
                          onChange={(e) => setEditingPledge({ ...editingPledge, target_votes: Number(e.target.value) })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          活動狀態 (Status)
                        </label>
                        <select
                          value={editingPledge.status || 'active'}
                          onChange={(e) => setEditingPledge({ ...editingPledge, status: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 bg-white"
                        >
                          <option value="active">🔥 進行中 (Active)</option>
                          <option value="upcoming">⏳ 排程準備中 (Upcoming)</option>
                          <option value="completed">🏁 已達標結束 (Completed)</option>
                        </select>
                      </div>
                    </div>

                    {/* 活動時間排程 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-pink-500" />
                          <span>開始時間 (Start Time)</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editingPledge.start_time || ''}
                          onChange={(e) => setEditingPledge({ ...editingPledge, start_time: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          <span>結束時間 (End Time)</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editingPledge.end_time || ''}
                          onChange={(e) => setEditingPledge({ ...editingPledge, end_time: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingPledge(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingPledge}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingPledge ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>儲存中...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{editingPledge.isNew ? '確認新增許願池' : '儲存變更'}</span>
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
            Tab 4: collabs (聯名許願集氣與抽獎)
        ========================================== */}
        {activeTab === 'collabs' && (
          <div className="space-y-8">
            {/* 許願清單 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-pink-500" />
                    🎁 聯名許願集氣清單管理
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    粉絲發起之品牌跨界許願企劃，資料直連 Supabase collab_wishes 資料庫。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNewCollab}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增聯名許願</span>
                </button>
              </div>

              {collabWishes.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  目前尚無聯名許願提案，點擊上方按鈕建立新企劃！
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {collabWishes.map((c) => {
                    const percent = Math.min(100, Math.round(((c.votes || 0) / (c.target || 15000)) * 100))
                    return (
                      <div
                        key={c.id}
                        className="border border-slate-200 rounded-2xl p-5 bg-white hover:shadow-md transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100">
                              {c.brand} × {c.idol}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
                              {c.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-base leading-snug">{c.theme}</h4>

                          {/* 檔期起訖時間 */}
                          {(c.start_time || c.end_time) && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg w-fit">
                              <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                              <span>
                                {c.start_time ? formatDisplayDateTime(c.start_time) : '即日起'}
                                {' ~ '}
                                {c.end_time ? formatDisplayDateTime(c.end_time) : '無限期'}
                              </span>
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                              <span>集氣：{(c.votes || 0).toLocaleString()} 票 ({percent}%)</span>
                              <span>目標：{(c.target || 15000).toLocaleString()} 票</span>
                            </div>
                          </div>
                        </div>

                        {/* 底部操作按鈕 */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-mono">ID: #{c.id}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingCollab({
                                  ...c,
                                  start_time: formatToDatetimeLocal(c.start_time),
                                  end_time: formatToDatetimeLocal(c.end_time),
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>編輯</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCollab(c.id, c.theme)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>刪除</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 新增 / 編輯聯名許願彈窗 */}
            {editingCollab && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                        {editingCollab.isNew ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {editingCollab.isNew ? '新增聯名許願企劃' : '編輯聯名許願企劃'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {editingCollab.isNew ? '將直接寫入 Supabase collab_wishes 資料表' : `企劃序號 ID: #${editingCollab.id}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCollab(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCollab} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          聯名品牌 (Brand) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCollab.brand || ''}
                          onChange={(e) => setEditingCollab({ ...editingCollab, brand: e.target.value })}
                          placeholder="例如：animate 安利美特、UNIQLO"
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          合作偶像 / 本命 (Idol) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCollab.idol || ''}
                          onChange={(e) => setEditingCollab({ ...editingCollab, idol: e.target.value })}
                          placeholder="例如：《咒術迴戰》五條悟、IVE 張員瑛"
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        聯名主題企劃 (Theme) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCollab.theme || ''}
                        onChange={(e) => setEditingCollab({ ...editingCollab, theme: e.target.value })}
                        placeholder="例如：特設主題應援咖啡廳與限量特典杯墊"
                        className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          當前集氣票數 (Votes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingCollab.votes ?? 0}
                          onChange={(e) => setEditingCollab({ ...editingCollab, votes: Number(e.target.value) })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          集氣目標門檻 (Target)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingCollab.target ?? 15000}
                          onChange={(e) => setEditingCollab({ ...editingCollab, target: Number(e.target.value) })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          狀態標籤 (Status)
                        </label>
                        <select
                          value={editingCollab.status || '集氣連署中'}
                          onChange={(e) => setEditingCollab({ ...editingCollab, status: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 bg-white"
                        >
                          <option value="集氣連署中">集氣連署中</option>
                          <option value="商務評估中">商務評估中</option>
                          <option value="洽談簽約中">洽談簽約中</option>
                          <option value="籌備募票中">籌備募票中</option>
                          <option value="募氣達標中">募氣達標中</option>
                        </select>
                      </div>
                    </div>

                    {/* 活動時間排程 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-pink-500" />
                          <span>活動開始時間 (Start Time)</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editingCollab.start_time || ''}
                          onChange={(e) => setEditingCollab({ ...editingCollab, start_time: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          <span>活動結束時間 (End Time)</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editingCollab.end_time || ''}
                          onChange={(e) => setEditingCollab({ ...editingCollab, end_time: e.target.value })}
                          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-pink-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingCollab(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingCollab}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingCollab ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>儲存中...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{editingCollab.isNew ? '確認建立聯名企劃' : '儲存變更'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                {(['all', 'pending', 'shipped', 'cancelled'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOrderFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      orderFilter === mode
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mode === 'all'
                      ? '全部訂單'
                      : mode === 'pending'
                      ? '待出貨'
                      : mode === 'shipped'
                      ? '已出貨'
                      : '已取消'}
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
                      <th className="px-4 py-3 text-right">管理操作</th>
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
                                  : o.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.status === 'shipped'
                                ? '已出貨'
                                : o.status === 'cancelled'
                                ? '已取消'
                                : '待處理'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {o.status === 'pending' && (
                                <button
                                  onClick={() => handleShipOrder(o.id)}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                                  title="一鍵標記為已出貨"
                                >
                                  一鍵出貨
                                </button>
                              )}
                              <button
                                onClick={() => setEditingOrder({ ...o })}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                                title="編輯訂單資料"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>編輯</span>
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                                title="從資料庫永久刪除此訂單"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>刪單</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 訂單編輯 Modal */}
            {editingOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-pink-600" />
                        編輯應援訂單資料
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        訂單編號：{editingOrder.id}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingOrder(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveOrder} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        訂購商品名稱
                      </label>
                      <input
                        type="text"
                        required
                        value={editingOrder.item_name || ''}
                        onChange={(e) =>
                          setEditingOrder({ ...editingOrder, item_name: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          收件粉絲姓名
                        </label>
                        <input
                          type="text"
                          required
                          value={editingOrder.buyer_name || ''}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, buyer_name: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          聯絡電話
                        </label>
                        <input
                          type="text"
                          value={editingOrder.buyer_phone || ''}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, buyer_phone: e.target.value })
                          }
                          placeholder="0912-345-678"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          訂單金額 (NT$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={editingOrder.amount || 0}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, amount: Number(e.target.value) })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          出貨與配送狀態
                        </label>
                        <select
                          value={editingOrder.status || 'pending'}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, status: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        >
                          <option value="pending">待處理（待出貨）</option>
                          <option value="shipped">已出貨（已配送）</option>
                          <option value="cancelled">已取消（已作廢）</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingOrder(null)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingOrder}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingOrder ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>儲存同步中...</span>
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-slate-900">
                              {selectedMessage.subject}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                selectedMessage.status === 'replied'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {selectedMessage.status === 'replied' ? '已回覆' : '未處理'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            寄件人：{selectedMessage.sender} ({selectedMessage.email}) · 分類：
                            {selectedMessage.category || '一般諮詢'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingMessage({ ...selectedMessage })}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                            title="編輯此案件主旨、內容與寄件資訊"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                            <span>編輯案件</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(selectedMessage.id)}
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
                            title="自資料庫永久刪除此筆粉絲諮詢"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>刪除案件</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <span className="block text-[11px] font-bold text-slate-400 mb-1">
                          粉絲提問內容：
                        </span>
                        {selectedMessage.content}
                      </div>

                      {selectedMessage.reply_content && (
                        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              已寄出之官方回覆：
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyContent(selectedMessage.reply_content || '')
                                  setMessage('💡 已將回覆內容帶入下方輸入框，修改後點擊發送即可更新！')
                                }}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100/50 transition cursor-pointer flex items-center gap-1"
                                title="將回覆內容帶回輸入框重新編輯"
                              >
                                <Edit className="w-3 h-3" />
                                <span>編輯回覆</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReply(selectedMessage.id)}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-50 transition cursor-pointer flex items-center gap-1"
                                title="清空回覆並將案件重設為未處理"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>刪除回覆</span>
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-emerald-950 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.reply_content}
                          </div>
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

            {/* 編輯諮詢案 Modal */}
            {editingMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-pink-600" />
                        編輯粉絲諮詢案件
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        案件編號：#{editingMessage.id}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingMessage(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMessage} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          寄件人姓名 / 暱稱
                        </label>
                        <input
                          type="text"
                          required
                          value={editingMessage.sender || ''}
                          onChange={(e) =>
                            setEditingMessage({ ...editingMessage, sender: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          電子郵件 (Email)
                        </label>
                        <input
                          type="email"
                          required
                          value={editingMessage.email || ''}
                          onChange={(e) =>
                            setEditingMessage({ ...editingMessage, email: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          問題分類
                        </label>
                        <input
                          type="text"
                          value={editingMessage.category || ''}
                          onChange={(e) =>
                            setEditingMessage({ ...editingMessage, category: e.target.value })
                          }
                          placeholder="例如：投票規則、周邊商城、帳號問題"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          案件處理狀態
                        </label>
                        <select
                          value={editingMessage.status || 'unread'}
                          onChange={(e) =>
                            setEditingMessage({ ...editingMessage, status: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                        >
                          <option value="unread">未處理 (unread)</option>
                          <option value="replied">已回覆 (replied)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        諮詢主旨
                      </label>
                      <input
                        type="text"
                        required
                        value={editingMessage.subject || ''}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, subject: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        諮詢詳細內容
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={editingMessage.content || ''}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, content: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingMessage(null)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingMessage}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingMessage ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>儲存同步中...</span>
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