import { NextRequest, NextResponse } from "next/server";
import { sendContactNotificationEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, subject, message } = body;

    // 1. 嚴格輸入校驗
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "請完整填寫所有必填欄位！" },
        { status: 400 }
      );
    }

    const cleanSender = name.trim();
    const cleanEmail = email.trim();
    const cleanCategory = category.trim();
    const cleanSubject = subject.trim();
    const cleanContent = message.trim();

    // 2. 正式寫入 Supabase 資料表 public.messages（與後台 CMS 100% 同步對齊）
    const supabaseAdmin = getSupabaseAdminClient();
    const insertPayload = {
      sender: cleanSender,
      email: cleanEmail,
      category: cleanCategory,
      subject: cleanSubject,
      content: cleanContent,
      status: "unread",
      created_at: new Date().toISOString(),
    };

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("messages")
      .insert([insertPayload])
      .select();

    if (dbError) {
      console.error("[Supabase Messages INSERT Error]:", dbError);
      return NextResponse.json(
        { success: false, error: `寫入資料庫失敗：${dbError.message}` },
        { status: 500 }
      );
    }

    // 3. 觸發電子郵件通知（發送至 opelwu2002@gmail.com）
    let emailResult = null;
    try {
      emailResult = await sendContactNotificationEmail({
        name: cleanSender,
        email: cleanEmail,
        category: cleanCategory,
        subject: cleanSubject,
        message: cleanContent,
      });
    } catch (mailErr) {
      console.warn("通知郵件發送異常，但資料庫已成功入庫：", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "您的諮詢訊息已成功寫入資料庫並送達宇沛實業營運團隊！",
      data: dbData?.[0],
      emailResult,
    });
  } catch (error: any) {
    console.error("處理聯絡表單發生嚴重錯誤：", error);
    return NextResponse.json(
      { success: false, error: error.message || "伺服器處理失敗，請稍後重試。" },
      { status: 500 }
    );
  }
}
