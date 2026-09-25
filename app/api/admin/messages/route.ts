import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Messages GET Error]:", error);
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json({ success: false, tableMissing: isMissing, message: error.message }, {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
      });
    }

    return NextResponse.json({ success: true, data: data || [] }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    console.error("[Messages GET Exception]:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, subject, category, sender, email, content, status, reply_content } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少訊息 ID" }, { status: 400 });
    }

    const updatePayload: any = {};
    if (subject !== undefined) updatePayload.subject = subject.trim();
    if (category !== undefined) updatePayload.category = category.trim();
    if (sender !== undefined) updatePayload.sender = sender.trim();
    if (email !== undefined) updatePayload.email = email.trim();
    if (content !== undefined) updatePayload.content = content.trim();
    if (status !== undefined) updatePayload.status = status;
    if (reply_content !== undefined) updatePayload.reply_content = reply_content;

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("messages")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("[Messages PUT Error]:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data?.[0] }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    console.error("[Messages PUT Exception]:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少要刪除的訊息 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Messages DELETE Error]:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `客服訊息 ${id} 已成功刪除` }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    console.error("[Messages DELETE Exception]:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
