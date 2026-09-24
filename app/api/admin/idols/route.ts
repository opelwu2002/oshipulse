import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("idols")
      .select("*")
      .order("votes", { ascending: false });

    if (error) {
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json({ success: false, tableMissing: isMissing, message: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, work, category, avatar, status, votes, match_history } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少偶像 ID" }, { status: 400 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updatePayload.name = name;
    if (work !== undefined) updatePayload.work = work;
    if (category !== undefined) updatePayload.category = category;
    if (avatar !== undefined) updatePayload.avatar = avatar;
    if (status !== undefined) updatePayload.status = status;
    if (votes !== undefined) updatePayload.votes = Number(votes) || 0;
    if (match_history !== undefined) updatePayload.match_history = match_history;

    // 嘗試完整寫入 Supabase idols 資料表
    let { data, error } = await supabaseAdmin
      .from("idols")
      .update(updatePayload)
      .eq("id", id)
      .select();

    // 防呆相容：若資料庫尚未手動新增 match_history 欄位導致報錯，降級排除該欄位重新更新
    if (error && (error.code === "PGRST204" || error.message.includes("match_history"))) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.match_history;
      const fallbackResult = await supabaseAdmin
        .from("idols")
        .update(fallbackPayload)
        .eq("id", id)
        .select();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, idol: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
