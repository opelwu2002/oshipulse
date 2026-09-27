import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 取得對決清單與當前進行中對決
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("battles")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json(
        { success: false, tableMissing: isMissing, message: error.message },
        { status: 200 }
      );
    }

    const battles = data || [];
    // 優先挑選狀態為 live 的對決，若無則取最新一筆
    const liveBattle = battles.find((b: any) => b.status === "live") || battles[0] || null;

    return NextResponse.json({
      success: true,
      battles,
      battle: liveBattle,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST: 新增巔峰對決項目
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      season_name,
      red_name,
      red_avatar,
      red_votes,
      blue_name,
      blue_avatar,
      blue_votes,
      status,
      start_time,
      end_time,
    } = body;

    if (!title || !red_name || !blue_name) {
      return NextResponse.json(
        { success: false, message: "缺少必要欄位：對決標題、選手 A 名稱與選手 B 名稱皆為必填！" },
        { status: 400 }
      );
    }

    const insertPayload: any = {
      title: title.trim(),
      season_name: (season_name || "2026 跨界巔峰對決").trim(),
      red_name: red_name.trim(),
      red_avatar: (red_avatar || "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg").trim(),
      red_votes: Number(red_votes) || 0,
      blue_name: blue_name.trim(),
      blue_avatar: (blue_avatar || "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg").trim(),
      blue_votes: Number(blue_votes) || 0,
      status: status || "live",
      start_time: start_time ? new Date(start_time).toISOString() : null,
      end_time: end_time ? new Date(end_time).toISOString() : null,
      created_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    let { data, error } = await supabaseAdmin
      .from("battles")
      .insert([insertPayload])
      .select();

    // 防呆相容：若資料庫尚未補齊 start_time/end_time 欄位導致報錯，進行降級寫入
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time"))) {
      console.warn("Supabase battles 資料表尚未包含 start_time/end_time 欄位，進行降級寫入...");
      const fallbackPayload = { ...insertPayload };
      delete fallbackPayload.start_time;
      delete fallbackPayload.end_time;
      const retry = await supabaseAdmin.from("battles").insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "對決項目新增成功！",
      data: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: 編輯對決內容或即時應援票數累加
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      season_name,
      red_name,
      red_avatar,
      red_votes,
      blue_name,
      blue_avatar,
      blue_votes,
      status,
      start_time,
      end_time,
      vote_side,
      increment,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少對決 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 模式 A：前台應援單邊票數累加 (Atomic Vote Increment)
    if (vote_side === "red" || vote_side === "blue") {
      const { data: currentBattle, error: fetchErr } = await supabaseAdmin
        .from("battles")
        .select("red_votes, blue_votes")
        .eq("id", id)
        .single();

      if (fetchErr || !currentBattle) {
        return NextResponse.json(
          { success: false, message: "找不到該對決項目以進行投票" },
          { status: 404 }
        );
      }

      const inc = Number(increment) || 1;
      const updateData: any = {};
      if (vote_side === "red") {
        updateData.red_votes = (Number(currentBattle.red_votes) || 0) + inc;
      } else {
        updateData.blue_votes = (Number(currentBattle.blue_votes) || 0) + inc;
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("battles")
        .update(updateData)
        .eq("id", id)
        .select();

      if (updateErr) {
        return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "應援票數已成功即時寫入資料庫！",
        battle: updated?.[0],
      });
    }

    // 模式 B：後台完整編輯或特定欄位更新
    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (season_name !== undefined) updatePayload.season_name = season_name.trim();
    if (red_name !== undefined) updatePayload.red_name = red_name.trim();
    if (red_avatar !== undefined) updatePayload.red_avatar = red_avatar.trim();
    if (red_votes !== undefined) updatePayload.red_votes = Number(red_votes);
    if (blue_name !== undefined) updatePayload.blue_name = blue_name.trim();
    if (blue_avatar !== undefined) updatePayload.blue_avatar = blue_avatar.trim();
    if (blue_votes !== undefined) updatePayload.blue_votes = Number(blue_votes);
    if (status !== undefined) updatePayload.status = status;
    if (start_time !== undefined) {
      updatePayload.start_time = start_time ? new Date(start_time).toISOString() : null;
    }
    if (end_time !== undefined) {
      updatePayload.end_time = end_time ? new Date(end_time).toISOString() : null;
    }

    let { data, error } = await supabaseAdmin
      .from("battles")
      .update(updatePayload)
      .eq("id", id)
      .select();

    // 防呆相容：若資料庫尚未補齊 start_time/end_time 欄位導致報錯，進行降級更新
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time"))) {
      console.warn("Supabase battles 資料表尚未包含 start_time/end_time 欄位，進行降級更新...");
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.start_time;
      delete fallbackPayload.end_time;
      const retry = await supabaseAdmin.from("battles").update(fallbackPayload).eq("id", id).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "對決項目資料已成功同步寫入資料庫！",
      battle: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: 刪除對決項目
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
      return NextResponse.json({ success: false, message: "缺少對決 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("battles")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `對決項目 #${id} 已成功從資料庫刪除！`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
