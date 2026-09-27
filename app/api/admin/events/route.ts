import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    return NextResponse.json({ success: true, data: data || [] });
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

    const insertPayload: any = {
      title: title.trim(),
      description: description || "",
      status: status || "上架展示中",
      event_type: event_type || "線下實體展",
      location: location || "",
      image_url: image_url ? image_url.trim() : null,
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

    // 防呆相容：若資料庫尚未補齊欄位導致報錯，進行降級寫入
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time") || error.message.includes("image_url"))) {
      console.warn("Supabase events 資料表欄位缺失，進行降級寫入...");
      const fallbackPayload = { ...insertPayload };
      if (error.message.includes("start_time")) delete fallbackPayload.start_time;
      if (error.message.includes("end_time")) delete fallbackPayload.end_time;
      if (error.message.includes("image_url")) delete fallbackPayload.image_url;
      const retry = await supabaseAdmin.from("events").insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "活動已成功建立！", event: data?.[0] });
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

    const updatePayload: any = {
      title: title.trim(),
      description: description || "",
      status: status || "上架展示中",
      event_type: event_type || "線下實體展",
      location: location || "",
      image_url: image_url ? image_url.trim() : null,
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

    // 防呆相容：若資料庫尚未補齊欄位導致報錯，降級排除後更新
    if (error && (error.code === "PGRST204" || error.message.includes("start_time") || error.message.includes("end_time") || error.message.includes("image_url"))) {
      console.warn("Supabase events 資料表欄位缺失，進行降級更新...");
      const fallbackPayload = { ...updatePayload };
      if (error.message.includes("start_time")) delete fallbackPayload.start_time;
      if (error.message.includes("end_time")) delete fallbackPayload.end_time;
      if (error.message.includes("image_url")) delete fallbackPayload.image_url;
      const retry = await supabaseAdmin.from("events").update(fallbackPayload).eq("id", id).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "活動已成功更新並同步至資料庫！", event: data?.[0] });
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
