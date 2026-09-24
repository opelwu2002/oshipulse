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

    // 🛡️ 屬性標準化：同時賦予 avatar、avatar_url、image_url，保證前後台各元件均能直接讀取網路圖片
    const standardized = (data || []).map((idol: any) => {
      const img = idol.avatar || idol.avatar_url || idol.image_url || idol.headshot_url || "";
      return {
        ...idol,
        avatar: img,
        avatar_url: img,
        image_url: img,
        headshot_url: img,
      };
    });

    return NextResponse.json({ success: true, data: standardized });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, work, category, avatar, avatar_url, image_url, headshot_url, status, votes, match_history } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少偶像 ID" }, { status: 400 });
    }

    const finalAvatar = avatar || avatar_url || image_url || headshot_url;

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updatePayload.name = name;
    if (work !== undefined) updatePayload.work = work;
    if (category !== undefined) updatePayload.category = category;
    if (finalAvatar !== undefined) updatePayload.avatar = finalAvatar;
    if (status !== undefined) updatePayload.status = status;
    if (votes !== undefined) updatePayload.votes = Number(votes) || 0;
    if (match_history !== undefined) updatePayload.match_history = match_history;

    // 嘗試完整寫入 Supabase idols 資料表
    let { data, error } = await supabaseAdmin
      .from("idols")
      .update(updatePayload)
      .eq("id", id)
      .select();

    // 防呆相容 1：若資料庫是 avatar_url 而非 avatar
    if (error && (error.code === "PGRST204" || error.message.includes("avatar"))) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.avatar;
      fallbackPayload.avatar_url = finalAvatar;
      const fallbackResult = await supabaseAdmin
        .from("idols")
        .update(fallbackPayload)
        .eq("id", id)
        .select();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    // 防呆相容 2：若資料庫尚未手動新增 match_history 欄位導致報錯，降級排除該欄位重新更新
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

    const resultIdol = data?.[0]
      ? {
          ...data[0],
          avatar: data[0].avatar || data[0].avatar_url || finalAvatar,
          avatar_url: data[0].avatar_url || data[0].avatar || finalAvatar,
          image_url: data[0].image_url || data[0].avatar || finalAvatar,
        }
      : null;

    return NextResponse.json({ success: true, idol: resultIdol });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
