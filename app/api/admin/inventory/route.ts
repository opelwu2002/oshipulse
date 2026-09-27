import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 預備備援商品（確保在資料庫建表前或離線時前台皆能正常顯示星街手燈與庫存）
const FALLBACK_INVENTORY = [
  {
    id: "prod-1",
    title: "【聯名限定】星街彗星 2026 璀璨彗星應援互動手燈",
    description: "內建 RGB 聲光同步晶片，支援現場舞台無線連動，粉絲專屬雷雕編號。",
    price: 980,
    stock: 120,
    min_votes_to_buy: 3,
    source_type: "collab_exclusive",
    idol_id: "idol-1",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
    is_active: true,
  },
  {
    id: "prod-2",
    title: "【聯名限定】NewJeans Bunnies 復古卡帶藍牙音響組",
    description: "結合 Y2K 復古設計與高解析立體聲，隨附成員專屬寫真概念透卡一套。",
    price: 1880,
    stock: 45,
    min_votes_to_buy: 5,
    source_type: "collab_exclusive",
    idol_id: "idol-3",
    image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600",
    is_active: true,
  },
  {
    id: "prod-3",
    title: "【官方周邊】周杰倫 嘉年華巡迴經典紀念連帽衫",
    description: "重磅純棉高質感刺繡，經典音符標誌低調奢華，百搭應援必備款。",
    price: 1580,
    stock: 80,
    min_votes_to_buy: 0,
    source_type: "official_regular",
    idol_id: "idol-2",
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
    is_active: true,
  },
  {
    id: "prod-4",
    title: "【官方周邊】Taylor Swift The Eras 典藏手繪吉他撥片組",
    description: "收錄各大時代巡演視覺圖案，精裝燙金鐵盒收藏組。",
    price: 650,
    stock: 150,
    min_votes_to_buy: 0,
    source_type: "official_regular",
    idol_id: "idol-4",
    image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
    is_active: true,
  },
];

// GET: 取得商城商品清單與即時庫存
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: FALLBACK_INVENTORY,
        featured: FALLBACK_INVENTORY[0],
        fallback: true,
      });
    }

    const { data, error } = await supabase
      .from("shop_inventory")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[Inventory GET Warning]: shop_inventory 表尚未建立或存取失敗，使用備援商品:", error.message);
      return NextResponse.json({
        success: true,
        data: FALLBACK_INVENTORY,
        featured: FALLBACK_INVENTORY[0],
        fallback: true,
        tableMissing: error.code === "PGRST205" || error.message.includes("does not exist"),
      });
    }

    const items = data && data.length > 0 ? data : FALLBACK_INVENTORY;
    // 首頁推薦：優先尋找星街彗星互動手燈 (prod-1) 或第一個活躍商品
    const featured = items.find((p: any) => p.id === "prod-1") || items[0] || null;

    return NextResponse.json({
      success: true,
      data: items,
      featured,
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (err: any) {
    console.error("[Inventory GET Exception]:", err);
    return NextResponse.json({
      success: true,
      data: FALLBACK_INVENTORY,
      featured: FALLBACK_INVENTORY[0],
      fallback: true,
    });
  }
}

// PUT: 編輯商品資訊（價格、庫存剩餘量、品名等）
export async function PUT(req: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, message: "資料庫尚未連線" }, { status: 500 });
    }

    const body = await req.json();
    const { id, title, description, price, stock, min_votes_to_buy, image_url, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少商品 ID" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description?.trim();
    if (price !== undefined) updatePayload.price = Number(price);
    if (stock !== undefined) updatePayload.stock = Number(stock);
    if (min_votes_to_buy !== undefined) updatePayload.min_votes_to_buy = Number(min_votes_to_buy);
    if (image_url !== undefined) updatePayload.image_url = image_url?.trim();
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);

    const { data, error } = await supabase
      .from("shop_inventory")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Inventory PUT Error]:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `商品【${updatePayload.title || id}】庫存與售價已成功更新至資料庫！`,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST: 新增周邊商品
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, message: "資料庫尚未連線" }, { status: 500 });
    }

    const body = await req.json();
    const { id, title, description, price, stock, min_votes_to_buy, source_type, idol_id, image_url } = body;

    if (!title || price === undefined) {
      return NextResponse.json({ success: false, message: "品名與售價為必填欄位" }, { status: 400 });
    }

    const newId = id || `prod-${Date.now()}`;
    const insertPayload = {
      id: newId,
      title: title.trim(),
      description: description?.trim() || "",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      min_votes_to_buy: Number(min_votes_to_buy) || 0,
      source_type: source_type || "collab_exclusive",
      idol_id: idol_id || null,
      image_url: image_url?.trim() || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("shop_inventory")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "周邊商品已成功新增！",
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: 刪除商品
export async function DELETE(req: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, message: "資料庫尚未連線" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "缺少商品 ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("shop_inventory")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Inventory DELETE Error]:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `商品 #${id} 已成功從庫存中刪除！`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
