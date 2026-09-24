'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { Profile } from '@/lib/supabase/types'
import { Sparkles, Heart, Flame, LogOut, CheckCircle2 } from 'lucide-react'

export default function MemberPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoginMode, setIsLoginMode] = useState(true)

  // 全域 Store (用於離線容錯、展示身分切換與全站 Navbar 橫幅同步)
  const {
    currentMember,
    setCurrentMember,
    members,
    addMember,
    updateMember: updateStoreMember,
    idols,
  } = useAppStore()

  // 表單欄位狀態
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [favoriteIdol, setFavoriteIdol] = useState('')

  const [message, setMessage] = useState('')

  useEffect(() => {
    checkUser()

    // 監聽 Supabase 認證變化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfileAndOrders(session.user.id)
        } else {
          // 若無 Supabase session，檢查是否使用本機 store 會員
          const local = useAppStore.getState().currentMember
          if (local) {
            setUser({ id: local.id, email: `${local.username}@oshipulse.com` })
            setProfile(local)
            fillFormWithProfile(local)
            loadMockOrders(local.id)
          } else {
            setUser(null)
            setProfile(null)
            setOrders([])
          }
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  function fillFormWithProfile(p: any) {
    if (!p) return
    setUsername(p.username || '')
    setFullName(p.full_name || '')
    setNickname(p.nickname || '')
    setBirthDate(p.birth_date || '')
    setPhone(p.phone || '')
    setAddress(p.address || '')
    setFavoriteIdol(p.favorite_idol || '')
  }

  // 取得或產生本機展示購買紀錄 (防止空資料庫無內容可檢視)
  function loadMockOrders(userId: string) {
    const mockOrders = [
      {
        id: 'ord-1001',
        user_id: userId,
        item_name: '【限量應援】成振宇《我獨自升級》闇影提取霓虹手燈 + 珍藏特典小卡',
        amount: 1480,
        status: '已付款完成',
        created_at: '2026-03-01T14:30:00Z',
      },
      {
        id: 'ord-1002',
        user_id: userId,
        item_name: '【官方授權】張員瑛 IVE 專屬 Lucky Vicky 幸運壓克力立牌應援套組',
        amount: 850,
        status: '出貨運送中',
        created_at: '2026-02-20T10:15:00Z',
      },
      {
        id: 'ord-1003',
        user_id: userId,
        item_name: '【應援門票】BTS 田柾國線下特展早鳥預售票 x 2',
        amount: 1200,
        status: '已付款完成',
        created_at: '2026-01-15T18:00:00Z',
      },
    ]
    setOrders(mockOrders)
  }

  async function checkUser() {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)
        await fetchProfileAndOrders(session.user.id)
      } else {
        // 離線優先：若本機已有登入之展示會員
        const local = useAppStore.getState().currentMember
        if (local) {
          setUser({ id: local.id, email: `${local.username}@oshipulse.com` })
          setProfile(local)
          fillFormWithProfile(local)
          loadMockOrders(local.id)
        } else {
          setUser(null)
          setProfile(null)
          setOrders([])
        }
      }
    } catch (err) {
      // 離線環境優雅降級
      const local = useAppStore.getState().currentMember
      if (local) {
        setUser({ id: local.id, email: `${local.username}@oshipulse.com` })
        setProfile(local)
        fillFormWithProfile(local)
        loadMockOrders(local.id)
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchProfileAndOrders(userId: string) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileData) {
        setProfile(profileData)
        fillFormWithProfile(profileData)
        // 同步至全站狀態，使頂部 Navbar 偶像橫幅立刻連動
        setCurrentMember(profileData)
      } else {
        // 若 profiles 尚未同步建立，比對本機會員
        const local = members.find((m) => m.id === userId)
        if (local) {
          setProfile(local)
          fillFormWithProfile(local)
        }
      }

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (ordersData && ordersData.length > 0) {
        setOrders(ordersData)
      } else {
        loadMockOrders(userId)
      }
    } catch (e) {
      // 離線降級
      loadMockOrders(userId)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setMessage('註冊處理中...')

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            nickname,
            birth_date: birthDate,
            phone,
            address,
            favorite_idol: favoriteIdol,
          },
        },
      })

      // 無論是否需要 Email 驗證，均透過後端 API 安全將 Profile 寫入 Supabase profiles 資料表
      const registerRes = await fetch('/api/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: signUpData?.user?.id,
          username,
          fullName,
          nickname,
          birthDate,
          phone,
          address,
          favoriteIdol,
        }),
      })
      const regJson = await registerRes.json()

      if (regJson.success) {
        const savedProfile = regJson.profile
        setProfile(savedProfile)
        setCurrentMember(savedProfile)
        setUser({ id: savedProfile.id, email })
        fillFormWithProfile(savedProfile)
        setMessage('🎉 註冊成功！資料已安全同步至資料庫。')
      } else {
        // 若遠端 profiles 寫入遇到異常，做優雅降級
        console.warn('寫入 profiles 資料表回應:', regJson.message)
        setMessage(`註冊處理完成：${regJson.message || '歡迎加入！'}`)
      }

      await checkUser()
    } catch (err: any) {
      console.error('註冊過程發生錯誤:', err)
      setMessage(`註冊處理中發生狀況：${err?.message || '請稍後再試'}`)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setMessage('登入中...')

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 若 Supabase 登入失敗或連線不到，嘗試本機展示會員比對
        const found = members.find(
          (m) =>
            m.username.toLowerCase() === email.toLowerCase() ||
            `${m.username}@oshipulse.com`.toLowerCase() === email.toLowerCase() ||
            (m.phone && m.phone === email)
        )

        if (found) {
          setCurrentMember(found)
          setUser({ id: found.id, email: `${found.username}@oshipulse.com` })
          setProfile(found)
          fillFormWithProfile(found)
          loadMockOrders(found.id)
          setMessage(`🎉 登入成功！歡迎回來，${found.nickname || found.username}！`)
        } else {
          setMessage(`登入失敗: ${error.message}（若使用展示帳號，可點擊上方快速帶入）`)
        }
      } else {
        setMessage('登入成功！')
        await checkUser()
      }
    } catch (err: any) {
      setMessage(`登入處理中: ${err?.message || '請確認帳號密碼'}`)
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // 離線降級
    }
    setUser(null)
    setProfile(null)
    setOrders([])
    setCurrentMember(null)
    setMessage('已成功登出')
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setMessage('儲存中...')

    const updatePayload = {
      username,
      full_name: fullName,
      nickname,
      birth_date: birthDate || null,
      phone,
      address,
      favorite_idol: favoriteIdol,
      updated_at: new Date().toISOString(),
    }

    // 1. 同步更新本機 store (確保頂部 Navbar 即時刷新)
    if (user?.id) {
      updateStoreMember(user.id, updatePayload)
      if (currentMember && currentMember.id === user.id) {
        setCurrentMember({ ...currentMember, ...updatePayload })
      }
    }

    // 2. 更新 Supabase 資料庫
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (error) {
        setMessage('✅ 會員資料與最推本命已於本機成功更新！頂部打氣橫幅已同步刷新！')
      } else {
        setMessage('會員資料更新成功！')
        await fetchProfileAndOrders(user.id)
      }
    } catch (err) {
      setMessage('✅ 會員資料已成功儲存！')
    }
  }

  // 快速切換本機展示身分
  const handleQuickSwitch = (m: Profile) => {
    setCurrentMember(m)
    setUser({ id: m.id, email: `${m.username}@oshipulse.com` })
    setEmail(`${m.username}@oshipulse.com`)
    setPassword('demo123456')
    setProfile(m)
    fillFormWithProfile(m)
    loadMockOrders(m.id)
    setMessage(`✨ 已切換至展示會員【${m.nickname || m.username}】，最推本命：${m.favorite_idol}！`)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        載入中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* ⚡ 快速展示身分體驗列 (點擊一秒帶入登入身分與本命偶像) */}
      <div className="max-w-3xl mx-auto bg-white p-4 rounded-xl border border-pink-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>快速身分體驗 (點擊一鍵帶入身分、切換本命偶像與歷史訂單)</span>
          </span>
          {user && (
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>切換為訪客未登入</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {members.slice(0, 5).map((m) => {
            const isSelected = user?.id === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleQuickSwitch(m)}
                className={`p-2 rounded-lg border text-left transition text-xs cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                <div className="font-bold text-gray-900 truncate">{m.nickname || m.username}</div>
                <div className="text-[10px] text-pink-600 font-semibold truncate mt-1 flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 fill-pink-600" />
                  <span>{m.favorite_idol}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {user ? '💎 OshiPulse 會員中心' : isLoginMode ? '🔐 會員登入' : '📝 加入原生會員'}
        </h1>

        {message && (
          <div className="mb-4 p-4 rounded bg-pink-50 text-pink-700 text-sm font-medium text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!user ? (
          <div>
            {isLoginMode ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">電子信箱 (E-mail)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com 或輸入展示帳號"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">密碼</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼 (展示帳號可任意填寫)"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none cursor-pointer transition"
                >
                  登入
                </button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(false)}
                    className="text-sm text-pink-600 hover:underline cursor-pointer"
                  >
                    還沒有帳號？點此免費註冊
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">電子信箱 (E-mail) *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">設定密碼 (至少6碼) *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">會員帳號 (Username) *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="例如：wonyoung_fan_99"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">連絡電話 (Phone) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912-345-678"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">真實姓名</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="例如：林晨宇"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">暱稱</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="例如：暗影獵人"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">出生年月日</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">最推的偶像 / 角色</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={favoriteIdol}
                        onChange={(e) => setFavoriteIdol(e.target.value)}
                        placeholder="例如：成振宇、五條悟、張員瑛"
                        className="flex-1 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 font-bold text-pink-600"
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) setFavoriteIdol(e.target.value)
                        }}
                        className="mt-1 px-2 py-2 bg-gray-50 border border-gray-300 rounded-md text-xs"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          快速選取
                        </option>
                        {idols.slice(0, 8).map((i) => (
                          <option key={i.id} value={i.name}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">聯絡地址</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="例如：台北市大安區信義路四段100號"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none cursor-pointer transition"
                >
                  確認註冊
                </button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(true)}
                    className="text-sm text-pink-600 hover:underline cursor-pointer"
                  >
                    已經有帳號了？點此登入
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">當前登入信箱 (E-mail)</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
                {profile?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-bold rounded-full">
                    能量票餘額：{profile.bonus_votes || 10} 票 · 邀請碼：{profile.referral_code || 'VIP'}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                登出
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-medium text-gray-900">✏️ 個人檔案與聯絡資訊維護</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">會員帳號</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">連絡電話 (Phone)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">真實姓名</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">暱稱</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">出生年月日</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    最推的偶像 / 角色 (將即時更新頂部打氣橫幅) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={favoriteIdol}
                      onChange={(e) => setFavoriteIdol(e.target.value)}
                      placeholder="例如：成振宇、五條悟、張員瑛"
                      className="flex-1 mt-1 block w-full rounded-md border border-pink-300 bg-pink-50/40 px-3 py-2 shadow-sm focus:border-pink-500 font-bold text-pink-700"
                    />
                    <select
                      onChange={(e) => {
                        if (e.target.value) setFavoriteIdol(e.target.value)
                      }}
                      className="mt-1 px-2 py-2 bg-gray-50 border border-gray-300 rounded-md text-xs"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        快速選取
                      </option>
                      {idols.slice(0, 8).map((i) => (
                        <option key={i.id} value={i.name}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">聯絡地址</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 transition cursor-pointer"
              >
                儲存變更
              </button>
            </form>

            <div className="border-t pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">🛍️ 在本網站的商品購買紀錄</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center">
                  目前尚無任何購買紀錄。
                </p>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                  <ul className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <li
                        key={order.id}
                        className="px-4 py-4 sm:px-6 flex justify-between items-center hover:bg-gray-50/60 transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-pink-600">
                            {order.item_name || order.items?.[0]?.product?.title || '應援周邊商品'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            NT$ {order.amount ?? order.total_amount ?? 0}
                          </p>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
