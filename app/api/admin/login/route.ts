import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 嚴格自伺服器端環境變數讀取管理者憑證，絕對禁止在原始碼硬編碼任何預設明碼或測試後門
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // 若伺服器環境變數未正確配置，嚴格拒絕認證，杜絕未授權存取
    if (!expectedUsername || !expectedPassword) {
      console.error("[資安防護] 伺服器端尚未配置 ADMIN_USERNAME 或 ADMIN_PASSWORD 環境變數");
      return NextResponse.json(
        {
          success: false,
          message: "伺服器管理者環境變數未配置，請於環境變數（如 Vercel Project Settings）中設定 ADMIN_USERNAME 與 ADMIN_PASSWORD。",
        },
        { status: 500 }
      );
    }

    // 進行比對
    if (
      username &&
      password &&
      username.trim() === expectedUsername.trim() &&
      password === expectedPassword
    ) {
      // 驗證成功，簽發安全 Session Token
      const token = `oshipulse_admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      const response = NextResponse.json({
        success: true,
        message: "驗證成功",
        token,
      });

      // 設定 HTTP-Only、Secure 安全 Cookie
      response.cookies.set({
        name: "oshipulse_admin_session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 小時有效
      });

      return response;
    }

    // 帳號或授權密碼錯誤
    return NextResponse.json(
      { success: false, message: "帳號或授權密碼錯誤，請重新確認！" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "登入驗證服務異常，請稍後再試。" },
      { status: 500 }
    );
  }
}
