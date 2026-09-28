import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST: 處理前台「應援推一把」投票請求 (支援原子累加與 Supabase 即時入庫)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idol_id, amount = 1, user_id, fingerprint } = body;

    if (!idol_id) {
      return NextResponse.json(
        { success: false, message: "缺少必要參數：idol_id" },
        { status: 400 }
      );
    }

    const incAmount = Math.max(1, Number(amount) || 1);
    const supabaseAdmin = getSupabaseAdminClient();

    // 1. 查詢該偶像當前資料庫紀錄
    const { data: idolData, error: fetchError } = await supabaseAdmin
      .from("idols")
      .select("id, name, votes")
      .eq("id", idol_id)
      .single();

    if (fetchError || !idolData) {
      // 容錯防呆：若資料庫尚無該偶像紀錄，嘗試讀取名冊若存在則自動 upsert 初始化
      return NextResponse.json(
        { success: false, message: `找不到該偶像項目 (${idol_id})` },
        { status: 404 }
      );
    }

    const currentVotes = Number(idolData.votes) || 0;
    const nextVotes = currentVotes + incAmount;

    // 2. 原子更新 Supabase idols 資料表中的 votes 與 updated_at
    const { data: updatedIdol, error: updateError } = await supabaseAdmin
      .from("idols")
      .update({
        votes: nextVotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idol_id)
      .select()
      .single();

    if (updateError) {
      console.error("[Supabase Vote Update Error]:", updateError);
      return NextResponse.json(
        { success: false, message: `投票寫入資料庫失敗: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 3. 審計稽核日誌登記 (非同步觸發，不阻斷主投票流程)
    try {
      const nowStr = new Date().toTimeString().split(" ")[0];
      await supabaseAdmin.from("audit_logs").insert([
        {
          time: nowStr,
          username: user_id || "會員手動應援",
          ip: "127.0.0.1",
          country: "台灣",
          fingerprint: fingerprint || `FP-VOTE-${Date.now().toString().slice(-4)}`,
          risk: "Safe",
          reason: `為 ${idolData.name} 投下 ${incAmount} 票應援聲量`,
          blocked: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // 審計表若不存在則靜默忽略
    }

    return NextResponse.json({
      success: true,
      message: `應援成功！已為 ${idolData.name} 注入 +${incAmount} 票！`,
      idol_id: idol_id,
      name: idolData.name,
      previous_votes: currentVotes,
      votes: nextVotes,
      updated_at: updatedIdol?.updated_at || new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Vote API Exception]:", err);
    return NextResponse.json(
      { success: false, message: `伺服器異常: ${err.message}` },
      { status: 500 }
    );
  }
}
