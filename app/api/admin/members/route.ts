import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 讀取所有真實會員
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: 確實從資料庫刪除會員
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少會員 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "會員已確實從資料庫刪除" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: 確實更新會員資料
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, username, full_name, nickname, birth_date, phone, address, favorite_idol } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少會員 ID" }, { status: 400 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (username !== undefined) updatePayload.username = username;
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (nickname !== undefined) updatePayload.nickname = nickname;
    if (birth_date !== undefined) updatePayload.birth_date = birth_date || null;
    if (phone !== undefined) updatePayload.phone = phone;
    if (address !== undefined) updatePayload.address = address;
    if (favorite_idol !== undefined) updatePayload.favorite_idol = favorite_idol;

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
