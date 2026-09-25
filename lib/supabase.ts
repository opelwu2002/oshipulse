import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedAdminClient: SupabaseClient | null = null
let cachedClient: SupabaseClient | null = null

// 安全預設佔位值，確保在 Vercel 建置期（Build-time / Static Analysis）缺少環境變數時不會拋錯中斷
const DUMMY_SUPABASE_URL = 'https://placeholder-oshipulse.supabase.co'
const DUMMY_SUPABASE_KEY = 'placeholder-anon-key-for-build-time'

/**
 * 取得伺服器端管理者權限的 Supabase 客戶端 (Admin Client)
 * 1. 延遲初始化 (Lazy Initialization)：僅在 API 被實際請求時（Runtime）才讀取環境變數。
 * 2. 防呆機制：若建置期或尚未配置金鑰，安全降級使用佔位金鑰，絕不拋出 `supabaseKey is required` 錯誤中斷建置。
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DUMMY_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DUMMY_SUPABASE_KEY

  if (cachedAdminClient) {
    return cachedAdminClient
  }

  try {
    cachedAdminClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    return cachedAdminClient
  } catch (error) {
    console.warn('[Supabase Admin Client] 警告：使用安全防呆備援客戶端:', error)
    return createClient(DUMMY_SUPABASE_URL, DUMMY_SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
}

/**
 * 取得客戶端/公開存取使用的 Supabase 客戶端 (Public Client)
 * 延遲初始化，避免在 Next.js 建置與打包階段於頂層模組過早執行。
 */
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DUMMY_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DUMMY_SUPABASE_KEY

  if (cachedClient) {
    return cachedClient
  }

  try {
    cachedClient = createClient(url, key)
    return cachedClient
  } catch (error) {
    console.warn('[Supabase Client] 警告：使用安全防呆備援客戶端:', error)
    return createClient(DUMMY_SUPABASE_URL, DUMMY_SUPABASE_KEY)
  }
}

/**
 * 導出向後相容的 supabase 物件 (Proxy 模式)
 * 確保既有程式碼中使用 `import { supabase } from '@/lib/supabase'` 時完全不受影響。
 * 頂層模組載入時為零副作用，直到呼叫具體方法（如 `supabase.from(...)`）時才在 Runtime 取得 Client。
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})