import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IMG_REGEX = /<!--__OSHI_IMAGE_URL__:(.*?)-->/;

function extractEventImage(event: any) {
  let imageUrl = event.image_url || "";
  let cleanDesc = event.description || "";

  if (!imageUrl && cleanDesc) {
    const match = cleanDesc.match(IMG_REGEX);
    if (match && match[1]) {
      imageUrl = match[1].trim();
      cleanDesc = cleanDesc.replace(IMG_REGEX, "").trim();
    }
  }

  return {
    ...event,
    description: cleanDesc,
    image_url: imageUrl || null,
  };
}

function embedImageIntoDesc(desc: string, imgUrl: string | null) {
  const baseDesc = (desc || "").replace(IMG_REGEX, "").trim();
  if (!imgUrl || !imgUrl.trim()) return baseDesc;
  return `${baseDesc}\n\n<!--__OSHI_IMAGE_URL__:${imgUrl.trim()}-->`;
}

// GET: 取得活動排程列表
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json({ success: false, tableMissing: isMissing, message: error.message }, { status: 200 });
    }

    // 🛡️ 智能解析：標準化 image_url 與 description
    const standardized = (data || []).map(extractEventImage);

    return NextResponse.json({ success: true, data: standardized });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST: 新增活動排程
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, status, event_type, location, image_url, google_maps_url, start_time, end_time } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: "活動標題為必填" }, { status: 400 });
    }

    const rawImageUrl = image_url ? image_url.trim() : null;
    const insertPayload: any = {
      title: title.trim(),
      description: description || "",
      status: status || "上架展示中",
      event_type: event_type || "線下實體展",
      location: location || "",
      image_url: rawImageUrl,
      google_maps_url: google_maps_url || null,
      start_time: start_time ? new Date(start_time).toISOString() : null,
      end_time: end_time ? new Date(end_time).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    let { data, error } = await supabaseAdmin
      .from("events")
      .insert([insertPayload])
      .select();

    // 🛡️ 雙重相容儲存：若資料庫尚未建立 image_url 等欄位導致 PGRST204，降級將圖片安全嵌入 description，絕不丟失！
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time") || error.message.includes("image_url"))) {
      console.warn("Supabase events 資料表欄位缺失，啟用無縫相容儲存模式...");
      const fallbackPayload = { ...insertPayload };
      if (error.message.includes("start_time")) delete fallbackPayload.start_time;
      if (error.message.includes("end_time")) delete fallbackPayload.end_time;
      if (error.message.includes("image_url")) {
        delete fallbackPayload.image_url;
        fallbackPayload.description = embedImageIntoDesc(description, rawImageUrl);
      }
      const retry = await supabaseAdmin.from("events").insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const savedEvent = data?.[0] ? extractEventImage(data[0]) : null;
    return NextResponse.json({ success: true, message: "活動已成功建立！", event: savedEvent });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: 編輯已建立的活動資料
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, status, event_type, location, image_url, google_maps_url, start_time, end_time } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少活動 ID" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ success: false, message: "活動標題為必填" }, { status: 400 });
    }

    const rawImageUrl = image_url ? image_url.trim() : null;
    const updatePayload: any = {
      title: title.trim(),
      description: description || "",
      status: status || "上架展示中",
      event_type: event_type || "線下實體展",
      location: location || "",
      image_url: rawImageUrl,
      google_maps_url: google_maps_url || null,
      start_time: start_time ? new Date(start_time).toISOString() : null,
      end_time: end_time ? new Date(end_time).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    let { data, error } = await supabaseAdmin
      .from("events")
      .update(updatePayload)
      .eq("id", id)
      .select();

    // 🛡️ 雙重相容更新：若資料庫尚未建立 image_url 等欄位導致 PGRST204，降級將圖片安全嵌入 description，絕不丟失！
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time") || error.message.includes("image_url"))) {
      console.warn("Supabase events 資料表欄位缺失，啟用無縫相容更新模式...");
      const fallbackPayload = { ...updatePayload };
      if (error.message.includes("start_time")) delete fallbackPayload.start_time;
      if (error.message.includes("end_time")) delete fallbackPayload.end_time;
      if (error.message.includes("image_url")) {
        delete fallbackPayload.image_url;
        fallbackPayload.description = embedImageIntoDesc(description, rawImageUrl);
      }
      const retry = await supabaseAdmin.from("events").update(fallbackPayload).eq("id", id).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const updatedEvent = data?.[0] ? extractEventImage(data[0]) : null;
    return NextResponse.json({ success: true, message: "活動已成功更新並同步至資料庫！", event: updatedEvent });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: 刪除活動
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少活動 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "活動已從資料庫刪除" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
