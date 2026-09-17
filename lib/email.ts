/**
 * Resend 電子郵件服務模組
 * 自動發送聯絡表單通知至 opelwu2002@gmail.com 及抽獎中獎通知
 */
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const OFFICIAL_ADMIN_EMAIL = "opelwu2002@gmail.com";

interface ContactNotificationParams {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

export async function sendContactNotificationEmail(params: ContactNotificationParams) {
  const { name, email, category, subject, message } = params;

  if (!resend) {
    console.log("【模擬模式】未偵測到 RESEND_API_KEY，已模擬發送聯絡信件通知至：", OFFICIAL_ADMIN_EMAIL, {
      fromUser: `${name} <${email}>`,
      category,
      subject,
      content: message,
    });
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: "OshiPulse 官方通知 <onboarding@resend.dev>",
      to: OFFICIAL_ADMIN_EMAIL,
      subject: `[OshiPulse 聯絡通知] 【${category}】${subject} - 來自 ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
          <h2 style="color: #8B5CF6; margin-bottom: 16px;">OshiPulse 收到新的粉絲聯絡詢問</h2>
          <div style="background-color: #F8FAFC; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>諮詢類別：</strong> ${category}</p>
            <p><strong>寄件者姓名：</strong> ${name}</p>
            <p><strong>寄件者信箱：</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>主旨：</strong> ${subject}</p>
          </div>
          <div style="margin-bottom: 24px;">
            <h3 style="color: #0F172A;">諮詢內容：</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #334155;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748B;">
            此信件由 <strong>宇沛實業股份有限公司 (UPAY Corp.)</strong> OshiPulse 平台自動發送。
            若要直接回覆該用戶，請登入管理後台或直接回信至 ${email}。
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend API 發送失敗：", error);
    return { success: false, error };
  }
}

interface AdminReplyParams {
  toEmail: string;
  recipientName: string;
  subject: string;
  replyContent: string;
}

export async function sendAdminReplyEmail(params: AdminReplyParams) {
  const { toEmail, recipientName, subject, replyContent } = params;

  if (!resend) {
    console.log("【模擬模式】已模擬寄出管理員回信至：", toEmail, {
      recipientName,
      subject,
      replyContent,
    });
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: "OshiPulse 官方客服 <onboarding@resend.dev>",
      to: toEmail,
      subject: `[OshiPulse 回覆] 關於您諮詢的「${subject}」`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
          <h2 style="color: #8B5CF6; margin-bottom: 16px;">親愛的 ${recipientName} 您好：</h2>
          <p style="color: #475569; line-height: 1.6;">感謝您對 OshiPulse 的支持與寶貴反饋！官方營運團隊已針對您的詢問進行處理，以下是我們的回覆：</p>
          <div style="background-color: #F8FAFC; padding: 16px; border-left: 4px solid #8B5CF6; border-radius: 4px; margin: 20px 0;">
            <p style="white-space: pre-wrap; line-height: 1.6; color: #0F172A; margin: 0;">${replyContent}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748B;">
            宇沛實業股份有限公司 (UPAY Corp.) 版權所有<br/>
            官方聯絡信箱：${OFFICIAL_ADMIN_EMAIL}
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend API 管理員回覆寄送失敗：", error);
    return { success: false, error };
  }
}
