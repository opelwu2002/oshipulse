import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IMG_REGEX = /<!--__OSHI_IMAGE_URL__:(.*?)-->/;

// 智慧解析圖片網址（優先原生欄位，次之自主題元標籤提取）
function extractCollabImage(collab: any) {
  if (!collab) return collab;
  let imageUrl = collab.image_url || "";
  let cleanTheme = collab.theme || "";

  if (!imageUrl && cleanTheme) {
    const match = cleanTheme.match(IMG_REGEX);
    if (match && match[1]) {
      imageUrl = match[1].trim();
      cleanTheme = cleanTheme.replace(IMG_REGEX, "").trim();
    }
  }

  return {
    ...collab,
    theme: cleanTheme,
    image_url: imageUrl || null,
  };
}

// 將圖片網址安全嵌入至主題標籤作為降級儲存
function embedImageIntoTheme(theme: string, imgUrl: string | null) {
  const baseTheme = (theme || "").replace(IMG_REGEX, "").trim();
  if (!imgUrl || !imgUrl.trim()) return baseTheme;
  return `${baseTheme}\n<!--__OSHI_IMAGE_URL__:${imgUrl.trim()}-->`;
}

// GET: 取得聯名許願集氣列表
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("collab_wishes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json({ success: false, tableMissing: isMissing, message: error.message }, { status: 200 });
    }

    const wishes = (data || []).map(extractCollabImage);
    return NextResponse.json({ success: true, data: wishes });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST: 新增聯名許願項目
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, idol, theme, target, votes, status, image_url, start_time, end_time } = body;

    if (!brand || !idol || !theme) {
      return NextResponse.json({ success: false, message: "品牌、偶像與聯名主題企劃皆為必填！" }, { status: 400 });
    }

    const rawImageUrl = image_url ? image_url.trim() : null;
    const insertPayload: any = {
      brand: brand.trim(),
      idol: idol.trim(),
      theme: theme.trim(),
      votes: Number(votes) || 0,
      target: Number(target) || 15000,
      status: status || "集氣連署中",
      image_url: rawImageUrl,
      start_time: start_time ? new Date(start_time).toISOString() : null,
      end_time: end_time ? new Date(end_time).toISOString() : null,
      created_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    let { data, error } = await supabaseAdmin
      .from("collab_wishes")
      .insert([insertPayload])
      .select();

    // 🛡️ 雙重相容儲存：若資料表尚未包含 image_url / start_time / end_time 等欄位導致報錯，啟用無縫雙重智慧儲存
    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message.includes("start_time") || error.message.includes("end_time") || error.message.includes("image_url"))) {
      console.warn("Supabase collab_wishes 資料表原生欄位缺失，啟用無縫雙重智慧儲存模式...");
      const fallbackPayload = { ...insertPayload };
      if (error.message.includes("start_time")) delete fallbackPayload.start_time;
      if (error.message.includes("end_time")) delete fallbackPayload.end_time;
      if (error.message.includes("image_url")) {
        delete fallbackPayload.image_url;
        fallbackPayload.theme = embedImageIntoTheme(theme, rawImageUrl);
      }
      const retry = await supabaseAdmin.from("collab_wishes").insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const savedCollab = data?.[0] ? extractCollabImage(data[0]) : null;
    return NextResponse.json({
      success: true,
      message: "聯名許願項目已成功建立！",
      collab: savedCollab,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: 編輯聯名許願或前台連署投票累加
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, brand, idol, theme, target, votes, status, image_url, start_time, end_time, increment } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少聯名許願 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 模式 A：前台集氣連署票數累加 (Atomic Increment)
    if (increment !== undefined) {
      const { data: currentWish, error: fetchErr } = await supabaseAdmin
        .from("collab_wishes")
        .select("votes")
        .eq("id", id)
        .single();

      if (fetchErr || !currentWish) {
        return NextResponse.json({ success: false, message: "找不到該聯名許願項目" }, { status: 404 });
      }

      const inc = Number(increment) || 1;
      const nextVotes = (Number(currentWish.votes) || 0) + inc;

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("collab_wishes")
        .update({ votes: nextVotes })
        .eq("id", id)
        .select();

      if (updateErr) {
        return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "聯名集氣連署已成功即時寫入資料庫！",
        collab: updated?.[0] ? extractCollabImage(updated[0]) : null,
      });
    }

    // 模式 B：後台完整編輯或更新
    const rawImageUrl = image_url ? image_url.trim() : null;
    const updatePayload: any = {};
    if (brand !== undefined) updatePayload.brand = brand.trim();
    if (idol !== undefined) updatePayload.idol = idol.trim();
    if (theme !== undefined) updatePayload.theme = theme.trim();
    if (votes !== undefined) updatePayload.votes = Number(votes);
    if (target !== undefined) updatePayload.target = Number(target);
    if (status !== undefined) updatePayload.status = status;
    if (image_url !== undefined) updatePayload.image_url = rawImageUrl;
    if (start_time !== undefined) {
      updatePayload.start_time = start_time ? new Date(start_time).toISOString() : null;
    }
    if (end_time !== undefined) {
      updatePayload.end_time = end_time ? new Date(end_time).toISOString() : null;
    }

    let { data, error } = await supabaseAdmin
      .from("collab_wishes")
      .update(updatePayload)
      .eq("id", id)
      .select();

    // 防呆相容降級
    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message.includes("start_time") || error.message.includes("end_time") || error.message.includes("image_url"))) {
      console.warn("Supabase collab_wishes 資料表原生欄位缺失，進行降級更新...");
      const fallbackPayload = { ...updatePayload };
      if (error.message.includes("start_time")) delete fallbackPayload.start_time;
      if (error.message.includes("end_time")) delete fallbackPayload.end_time;
      if (error.message.includes("image_url")) {
        delete fallbackPayload.image_url;
        const currentTheme = theme !== undefined ? theme : "";
        fallbackPayload.theme = embedImageIntoTheme(currentTheme, rawImageUrl);
      }
      const retry = await supabaseAdmin.from("collab_wishes").update(fallbackPayload).eq("id", id).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const savedCollab = data?.[0] ? extractCollabImage(data[0]) : null;
    return NextResponse.json({
      success: true,
      message: "聯名許願項目已成功同步更新至資料庫！",
      collab: savedCollab,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: 刪除聯名許願項目
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
      return NextResponse.json({ success: false, message: "缺少聯名許願 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("collab_wishes").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `聯名許願項目 #${id} 已成功從資料庫刪除！`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
