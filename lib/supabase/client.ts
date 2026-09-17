/**
 * Supabase 客戶端配置
 * 本專案完全採用「本機純前端離線模式（Local Mock Mode）」
 * 零外部資料庫依賴，全站功能 100% 離線即開即用
 */
import { createBrowserClient } from "@supabase/ssr";

// 強制為純本機離線模式
export const isSupabaseConfigured = false;

export function createClient() {
  return createBrowserClient(
    "https://local-mock-mode.supabase.co",
    "local-mock-anon-key"
  );
}
