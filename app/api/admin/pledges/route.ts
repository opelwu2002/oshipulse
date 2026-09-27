import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 預備備援許願池（確保離線或尚未建表時前台仍可完美呈現星街彗星願望池）
const FALLBACK_PLEDGES = [
  {
    id: 1,
    title: "【生誕祭特企】星街彗星 2026 璀璨彗星 3D 全息投影連署",
    description: "凝聚星詠者的璀璨星光！集氣達標 15,000 票，將在台北信義威秀商圈打造為期兩週的 3D 裸視巨型戶外應援，並解鎖限定特典！",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
    current_votes: 9850,
    target_votes: 15000,
    status: "active",
    start_time: "2026-08-01T00:00:00Z",
    end_time: "2026-10-31T23:59:59Z",
  },
  {
    id: 2,
    title: "台北捷運全線燈箱應援企劃 · 五條悟領域展開 2026",
    description: "最強咒術師五條悟全線佔領！集氣滿額即解鎖台北捷運忠孝復興與台北車站巨型光箱廣告。",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
    current_votes: 7850,
    target_votes: 10000,
    status: "active",
  },
];

// GET: 取得許願池列表與當前進行中許願池
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        data: FALLBACK_PLEDGES,
        pledges: FALLBACK_PLEDGES,
        active: FALLBACK_PLEDGES[0],
        pledge: FALLBACK_PLEDGES[0],
        fallback: true,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("pledge_wishes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json(
        {
          success: true,
          data: FALLBACK_PLEDGES,
          pledges: FALLBACK_PLEDGES,
          active: FALLBACK_PLEDGES[0],
          pledge: FALLBACK_PLEDGES[0],
          tableMissing: isMissing,
          fallback: true,
        },
        { status: 200 }
      );
    }

    // 🛡️ 當資料庫成功查詢時，100% 依據資料庫實際筆數（刪光則為空陣列），絕不強制回填假許願池
    const pledges = data || [];
    const now = new Date();

    // 智能判斷：篩選狀態為 active 且在有效時間區間內的願望池
    const activePledges = pledges.filter((p: any) => {
      if (p.status !== "active") return false;
      if (p.start_time && new Date(p.start_time) > now) return false;
      if (p.end_time && new Date(p.end_time) < now) return false;
      return true;
    });

    // 優先選取星街彗星願望池或第一筆進行中願望池，若無進行中則為 null
    const activePledge =
      activePledges.find((p: any) => p.title?.includes("星街")) ||
      activePledges[0] ||
      pledges.find((p: any) => p.status === "active") ||
      null;

    return NextResponse.json({
      success: true,
      data: pledges,
      pledges,
      active: activePledge,
      pledge: activePledge,
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: FALLBACK_PLEDGES,
      pledges: FALLBACK_PLEDGES,
      active: FALLBACK_PLEDGES[0],
      pledge: FALLBACK_PLEDGES[0],
      fallback: true,
    }, { status: 200 });
  }
}

// POST: 新增應援許願池項目
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      image_url,
      current_votes,
      target_votes,
      start_time,
      end_time,
      status,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: "許願池標題為必填欄位" }, { status: 400 });
    }

    const insertPayload: any = {
      title: title.trim(),
      description: description || "",
      image_url: image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
      current_votes: Number(current_votes) || 0,
      target_votes: Number(target_votes) || 10000,
      status: status || "active",
      start_time: start_time ? new Date(start_time).toISOString() : null,
      end_time: end_time ? new Date(end_time).toISOString() : null,
      created_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    let { data, error } = await supabaseAdmin
      .from("pledge_wishes")
      .insert([insertPayload])
      .select();

    // 防呆相容：若資料表尚未補齊 start_time/end_time 欄位導致報錯，進行降級寫入
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time"))) {
      console.warn("Supabase pledge_wishes 資料表尚未包含 start_time/end_time 欄位，進行降級寫入...");
      const fallbackPayload = { ...insertPayload };
      delete fallbackPayload.start_time;
      delete fallbackPayload.end_time;
      const retry = await supabaseAdmin.from("pledge_wishes").insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "應援許願池項目已成功建立！",
      pledge: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: 編輯許願池或前台應援票數累加
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      image_url,
      current_votes,
      target_votes,
      start_time,
      end_time,
      status,
      increment,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少許願池 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 模式 A：前台點擊「+1 願望」即時累加票數
    if (increment !== undefined) {
      const { data: currentPledge, error: fetchErr } = await supabaseAdmin
        .from("pledge_wishes")
        .select("current_votes")
        .eq("id", id)
        .single();

      if (fetchErr || !currentPledge) {
        return NextResponse.json({ success: false, message: "找不到該許願池項目" }, { status: 404 });
      }

      const inc = Number(increment) || 1;
      const nextVotes = (Number(currentPledge.current_votes) || 0) + inc;

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("pledge_wishes")
        .update({ current_votes: nextVotes })
        .eq("id", id)
        .select();

      if (updateErr) {
        return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "集氣票數已成功即時寫入資料庫！",
        pledge: updated?.[0],
      });
    }

    // 模式 B：後台完整編輯或更新欄位
    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (current_votes !== undefined) updatePayload.current_votes = Number(current_votes);
    if (target_votes !== undefined) updatePayload.target_votes = Number(target_votes);
    if (status !== undefined) updatePayload.status = status;
    if (start_time !== undefined) {
      updatePayload.start_time = start_time ? new Date(start_time).toISOString() : null;
    }
    if (end_time !== undefined) {
      updatePayload.end_time = end_time ? new Date(end_time).toISOString() : null;
    }

    let { data, error } = await supabaseAdmin
      .from("pledge_wishes")
      .update(updatePayload)
      .eq("id", id)
      .select();

    // 防呆相容降級
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time"))) {
      console.warn("Supabase pledge_wishes 資料表尚未包含 start_time/end_time 欄位，進行降級更新...");
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.start_time;
      delete fallbackPayload.end_time;
      const retry = await supabaseAdmin.from("pledge_wishes").update(fallbackPayload).eq("id", id).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "許願池資料已成功同步更新至資料庫！",
      pledge: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: 刪除許願池項目
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id: any = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body 可能為空
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少許願池 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("pledge_wishes").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `許願池項目 #${id} 已成功從資料庫刪除！`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
