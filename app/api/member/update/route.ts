import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, username, fullName, nickname, birthDate, phone, address, favoriteIdol } = body;

    if (!username) {
      return NextResponse.json({ success: false, message: "會員帳號為必填項" }, { status: 400 });
    }

    // 確保 ID 符合 Supabase profiles.id 的 UUID 規範
    let profileId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId || "");
    if (!isUuid) {
      profileId = '00000000-0000-4000-8000-' + (String(profileId || '1').replace(/\D/g, '') || '1').padStart(12, '0');
    }

    // 精準對應 profiles 資料庫實體欄位
    const profilePayload: any = {
      id: profileId,
      username: username.trim(),
      full_name: fullName ? fullName.trim() : username.trim(),
      nickname: nickname ? nickname.trim() : username.trim(),
      birth_date: birthDate || null,
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      favorite_idol: favoriteIdol ? favoriteIdol.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select();

    if (error) {
      console.error("[Supabase Error] profiles upsert 失敗:", error);
      return NextResponse.json({ success: false, message: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data?.[0] || profilePayload });
  } catch (err: any) {
    console.error("[API Exception] 會員資料更新異常:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
