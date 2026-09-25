import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, username, fullName, nickname, birthDate, phone, address, favoriteIdol } = body;

    if (!username) {
      return NextResponse.json({ success: false, message: "會員帳號為必填項" }, { status: 400 });
    }

    // 確保 ID 是標準 UUID 格式，以符合 Supabase profiles.id (uuid)
    let profileId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId || "");
    if (!isUuid) {
      profileId = crypto.randomUUID();
    }

    // 精確符合 profiles 資料表的實體欄位定義 (不傳不存在的 created_at)
    const profileData = {
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
      .upsert(profileData, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase profiles upsert error:", error);
      return NextResponse.json({ success: false, message: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data?.[0] || profileData });
  } catch (err: any) {
    console.error("Register API exception:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
