import { NextRequest, NextResponse } from "next/server";
import { sendContactNotificationEmail } from "@/lib/email";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, subject, message } = body;

    // 基本輸入校驗
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "請完整填寫所有必填欄位！" },
        { status: 400 }
      );
    }

    // 1. 寫入 Supabase 資料表 public.contact_messages (若已連線)
    if (isSupabaseConfigured) {
      try {
        const supabase = createServerSupabaseClient();
        const { error: dbError } = await supabase.from("contact_messages").insert({
          sender_name: name,
          sender_email: email,
          category,
          subject,
          message,
          status: "unread",
        });

        if (dbError) {
          console.warn("Supabase 寫入失敗，但仍繼續寄送通知信：", dbError);
        }
      } catch (err) {
        console.warn("資料庫異常：", err);
      }
    }

    // 2. 透過 Resend API 發送即時通知郵件至 opelwu2002@gmail.com
    const emailResult = await sendContactNotificationEmail({
      name,
      email,
      category,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "您的訊息已成功送達宇沛實業營運團隊！我們將儘速查閱並回覆。",
      emailResult,
    });
  } catch (error) {
    console.error("處理聯絡表單發生錯誤：", error);
    return NextResponse.json(
      { success: false, error: "伺服器處理失敗，請稍後重試。" },
      { status: 500 }
    );
  }
}
