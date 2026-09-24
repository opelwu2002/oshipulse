import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("battles")
      .select("*")
      .order("id", { ascending: false })
      .limit(1);

    if (error) {
      const isMissing = error.code === "PGRST205" || error.message.includes("does not exist");
      return NextResponse.json({ success: false, tableMissing: isMissing, message: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, battle: data?.[0] || null });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, red_votes, blue_votes, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少對決 ID" }, { status: 400 });
    }

    const updatePayload: any = {};
    if (red_votes !== undefined) updatePayload.red_votes = red_votes;
    if (blue_votes !== undefined) updatePayload.blue_votes = blue_votes;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabaseAdmin
      .from("battles")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, battle: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
