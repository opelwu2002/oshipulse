import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Orders GET Error]:", error);
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
    console.error("[Orders GET Exception]:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, buyer_name, buyer_phone, item_name, amount, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少訂單 ID" }, { status: 400 });
    }

    const updatePayload: any = {};
    if (buyer_name !== undefined) updatePayload.buyer_name = buyer_name.trim();
    if (buyer_phone !== undefined) updatePayload.buyer_phone = buyer_phone.trim();
    if (item_name !== undefined) updatePayload.item_name = item_name.trim();
    if (amount !== undefined) updatePayload.amount = Number(amount) || 0;
    if (status !== undefined) updatePayload.status = status;

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("[Orders PUT Error]:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data?.[0] }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    console.error("[Orders PUT Exception]:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少要刪除的訂單 ID" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Orders DELETE Error]:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `訂單 ${id} 已成功刪除` }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    console.error("[Orders DELETE Exception]:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
