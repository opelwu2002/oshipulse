-- ==============================================================================
-- OshiPulse 企業級真實資料庫架構 (Supabase Database Schema)
-- 請在 Supabase 控制台的 SQL Editor 中直接貼上並執行本腳本
-- ==============================================================================

-- 啟用必要的擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. 會員與粉絲檔案 (profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  nickname TEXT,
  birth_date DATE,
  phone TEXT,
  address TEXT,
  favorite_idol TEXT,
  role TEXT DEFAULT 'user',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete profiles" ON public.profiles;
CREATE POLICY "Anyone can delete profiles" ON public.profiles FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 2. 活動排程管理 (events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT '上架展示中',
  event_type TEXT DEFAULT '線下實體展',
  location TEXT,
  google_maps_url TEXT,
  image_url TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 安全補齊 image_url、start_time 與 end_time 欄位（相容既有資料庫）
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Events full access" ON public.events;
CREATE POLICY "Events full access" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. 動漫角色與偶像庫 (idols)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  work TEXT NOT NULL,
  category TEXT NOT NULL,
  votes BIGINT DEFAULT 0,
  avatar TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  match_history TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 安全補齊 match_history 欄位（相容既有資料庫）
ALTER TABLE public.idols ADD COLUMN IF NOT EXISTS match_history TEXT;

ALTER TABLE public.idols ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Idols full access" ON public.idols;
CREATE POLICY "Idols full access" ON public.idols FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3.1. 應援投票 RPC 原子累加函式 (increment_idol_votes)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_idol_votes(target_idol_id TEXT, amount INT DEFAULT 1)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_votes BIGINT;
BEGIN
  UPDATE public.idols
  SET votes = COALESCE(votes, 0) + amount,
      updated_at = timezone('utc'::text, now())
  WHERE id = target_idol_id
  RETURNING votes INTO new_votes;
  
  RETURN new_votes;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_idol_votes(TEXT, INT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. 賽季對決拔河擂台 (battles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.battles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  season_name TEXT NOT NULL,
  red_name TEXT NOT NULL,
  red_votes BIGINT DEFAULT 0,
  red_avatar TEXT,
  blue_name TEXT NOT NULL,
  blue_votes BIGINT DEFAULT 0,
  blue_avatar TEXT,
  status TEXT DEFAULT 'live',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 安全補齊 start_time 與 end_time 欄位（相容既有資料庫）
ALTER TABLE public.battles ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE public.battles ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Battles full access" ON public.battles;
CREATE POLICY "Battles full access" ON public.battles FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. 防弊審計與惡意灌票攔截紀錄 (audit_logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  time TEXT NOT NULL,
  username TEXT NOT NULL,
  ip TEXT NOT NULL,
  country TEXT,
  fingerprint TEXT,
  risk TEXT DEFAULT 'Safe',
  reason TEXT,
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Audit logs full access" ON public.audit_logs;
CREATE POLICY "Audit logs full access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. 聯名許願與集氣 (collab_wishes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collab_wishes (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  idol TEXT NOT NULL,
  theme TEXT NOT NULL,
  votes INT DEFAULT 0,
  target INT DEFAULT 15000,
  status TEXT DEFAULT '集氣連署中',
  image_url TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 安全補齊 image_url、start_time 與 end_time 欄位（相容既有資料庫）
ALTER TABLE public.collab_wishes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.collab_wishes ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE public.collab_wishes ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

ALTER TABLE public.collab_wishes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Collab wishes full access" ON public.collab_wishes;
CREATE POLICY "Collab wishes full access" ON public.collab_wishes FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6.1. 首頁應援許願池 (pledge_wishes / Pledging Pools)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pledge_wishes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  current_votes INT DEFAULT 0,
  target_votes INT DEFAULT 10000,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 安全補齊欄位（相容既有資料庫）
ALTER TABLE public.pledge_wishes ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE public.pledge_wishes ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

ALTER TABLE public.pledge_wishes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pledge wishes full access" ON public.pledge_wishes;
CREATE POLICY "Pledge wishes full access" ON public.pledge_wishes FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. 商城訂單與出貨紀錄 (orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders full access" ON public.orders;
CREATE POLICY "Orders full access" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7.1. 商城周邊庫存與商品管理 (shop_inventory)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_inventory (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock INT DEFAULT 0,
  image_url TEXT,
  min_votes_to_buy INT DEFAULT 0,
  source_type TEXT DEFAULT 'collab_exclusive',
  idol_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.shop_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Shop inventory full access" ON public.shop_inventory;
CREATE POLICY "Shop inventory full access" ON public.shop_inventory FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. 粉絲諮詢與客服郵件 (messages)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  reply_content TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Messages full access" ON public.messages;
CREATE POLICY "Messages full access" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 種子初始資料 (Seed Data)
-- ==============================================================================

-- 1. 動漫角色與偶像初始名冊
INSERT INTO public.idols (id, name, work, category, votes, avatar, status)
VALUES
  ('char-sung-jinwoo', '成振宇 (Sung Jinwoo)', '《我獨自升級》', '動漫條漫', 58200, 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg', 'active'),
  ('char-gojo', '五條悟 (Satoru Gojo)', '《咒術迴戰》', '特級咒術師', 65200, 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg', 'active'),
  ('idol-jungkook', '田柾國 (Jung Kook)', 'BTS 防彈少年團', 'K-Pop 偶像', 62500, 'https://upload.wikimedia.org/wikipedia/commons/4/4e/BTS_for_Dispatch_White_Day_Special%2C_27_February_2019_01.jpg', 'active'),
  ('idol-wonyoung', '張員瑛 (Wonyoung)', 'IVE', 'K-Pop 偶像', 59800, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/230811_Jamboree_K-Pop_Super_Live_IVE.jpg/1200px-230811_Jamboree_K-Pop_Super_Live_IVE.jpg', 'active'),
  ('char-kim-dokja', '金獨子 (Kim Dokja)', '《全知讀者視角》', '動漫條漫', 53100, 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-2VOnp9aL30xG.png', 'active'),
  ('char-frieren', '芙莉蓮 (Frieren)', '《葬送的芙莉蓮》', '千年魔法使', 54100, 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-g1roJ6R7zJ6C.jpg', 'active'),
  ('idol-1', '星街彗星', 'hololive 0期生', '虛擬偶像 VTuber', 48900, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hoshimachi_Suisei_2023.jpg/800px-Hoshimachi_Suisei_2023.jpg', 'active'),
  ('char-chiikawa', '吉伊卡哇 (Chiikawa)', '《吉伊卡哇》', '超人氣萌物', 46200, 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144217-U6P0kHmsj7Uq.jpg', 'archived')
ON CONFLICT (id) DO NOTHING;

-- 2. 活動排程初始資料
INSERT INTO public.events (title, description, status, event_type, location, google_maps_url)
VALUES
  ('【特企】成振宇《我獨自升級》全球首映與暗影特展', '全台獵人集結！體驗成振宇「起來 (Arise)」超震撼暗影提取空間，現場獨家釋出專屬應援票券與限量周邊。', '上架展示中', '線下實體展', '台北三創生活園區 1F 廣場', 'https://www.google.com/maps/search/?api=1&query=台北三創生活園區'),
  ('【應援展】BTS 田柾國《GOLDEN》線下聲量咖啡廳與影像特展', '慶祝黃金忙內 Seven 突破歷史紀錄！現場展出歷年珍貴打歌服與應援手幅互動光雕秀。', '上架展示中', '線下實體展', '微風南山 3F 藝文展演空間', 'https://www.google.com/maps/search/?api=1&query=微風南山'),
  ('【線上】野口依織 (Iori Noguchi) 2026 誕生祭跨國大會', '=LOVE 野口依織生日特企！線上同步串聯日台粉絲，達成指定應援聲量即可解鎖澀谷街頭大螢幕廣告。', '排程準備中', '線上數位展', '線上元宇宙會場', NULL),
  ('【快閃】五條悟 領域展開：無量空處 沉浸式快閃店', '澀谷事變特設企劃！最強咒術師五條悟等比例模型首度來台，購買周邊即贈送專屬聲量投票券。', '排程準備中', '線下實體展', '誠品生活松菸店 2F 特展區', 'https://www.google.com/maps/search/?api=1&query=誠品生活松菸店')
ON CONFLICT DO NOTHING;

-- 3. 賽季對決初始資料
INSERT INTO public.battles (title, season_name, red_name, red_votes, red_avatar, blue_name, blue_votes, blue_avatar, status)
VALUES
  ('2026 第一季巔峰拔河冠軍賽', 'Season 1 終局決戰', '成振宇 (Sung Jinwoo)', 128400, 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg', '五條悟 (Satoru Gojo)', 116500, 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg', 'live')
ON CONFLICT DO NOTHING;

-- 4. 聯名許願初始資料
INSERT INTO public.collab_wishes (brand, idol, theme, votes, target, status)
VALUES
  ('animate 安利美特', '《咒術迴戰》五條悟', '特設主題應援咖啡廳與限量特典杯墊', 18420, 15000, '洽談簽約中'),
  ('UNIQLO / GU', '《我獨自升級》成振宇', '全台限定暗影軍團潮流聯名 UT 與連帽外套', 15310, 15000, '商務評估中'),
  ('台灣麥當勞', 'IVE 張員瑛', 'Lucky Vicky 幸運應援分享餐與拍立得小卡', 12890, 15000, '集氣連署中'),
  ('藏壽司 Kura Sushi', '《吉伊卡哇》', '應援限定立體轉蛋扭蛋與獨家保冷袋', 11450, 15000, '集氣連署中')
ON CONFLICT DO NOTHING;

-- 4.1. 首頁應援許願池初始資料
INSERT INTO public.pledge_wishes (title, description, image_url, current_votes, target_votes, status)
VALUES
  ('【生誕祭特企】星街彗星 2026 璀璨彗星 3D 全息投影連署', '凝聚星詠者的璀璨星光！集氣達標 15,000 票，將在台北信義威秀商圈打造為期兩週的 3D 裸視巨型戶外應援，並解鎖限定特典！', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200', 9850, 15000, 'active'),
  ('台北捷運全線燈箱應援企劃 · 五條悟領域展開 2026', '最強咒術師五條悟全線佔領！集氣滿額即解鎖台北捷運忠孝復興與台北車站巨型光箱廣告。', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200', 7850, 10000, 'active')
ON CONFLICT DO NOTHING;

-- 5. 商城訂單初始資料
INSERT INTO public.orders (id, buyer_name, buyer_phone, item_name, amount, status)
VALUES
  ('ORD-2026-8801', '林晨宇', '0912-345-678', '【限量應援】成振宇《我獨自升級》闇影提取霓虹手燈 + 特典小卡', 1480, 'pending'),
  ('ORD-2026-8802', '黃維琪', '0955-678-901', '【官方授權】張員瑛 IVE 專屬 Lucky Vicky 幸運壓克力立牌應援套組', 850, 'pending'),
  ('ORD-2026-8799', '張無限', '0923-456-789', '【應援特展】五條悟「無量空處」沉浸式領域展開展 早鳥門票 x 2', 1200, 'shipped'),
  ('ORD-2026-8795', '陳語婕', '0934-567-890', '【限定周邊】BTS 田柾國《GOLDEN》線下紀念手幅與鐳射徽章組', 690, 'shipped')
ON CONFLICT (id) DO NOTHING;

-- 5.1. 商城周邊商品與庫存初始資料 (shop_inventory)
INSERT INTO public.shop_inventory (id, title, description, price, stock, image_url, min_votes_to_buy, source_type, idol_id, is_active)
VALUES
  ('prod-1', '【聯名限定】星街彗星 2026 璀璨彗星應援互動手燈', '內建 RGB 聲光同步晶片，支援現場舞台無線連動，粉絲專屬雷雕編號。', 980, 120, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', 3, 'collab_exclusive', 'idol-1', true),
  ('prod-2', '【聯名限定】NewJeans Bunnies 復古卡帶藍牙音響組', '結合 Y2K 復古設計與高解析立體聲，隨附成員專屬寫真概念透卡一套。', 1880, 45, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600', 5, 'collab_exclusive', 'idol-3', true),
  ('prod-3', '【官方周邊】周杰倫 嘉年華巡迴經典紀念連帽衫', '重磅純棉高質感刺繡，經典音符標誌低調奢華，百搭應援必備款。', 1580, 80, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600', 0, 'official_regular', 'idol-2', true),
  ('prod-4', '【官方周邊】Taylor Swift The Eras 典藏手繪吉他撥片組', '收錄各大時代巡演視覺圖案，精裝燙金鐵盒收藏組。', 650, 150, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600', 0, 'official_regular', 'idol-4', true)
ON CONFLICT (id) DO NOTHING;

-- 6. 粉絲諮詢初始資料
INSERT INTO public.messages (sender, email, category, subject, content, status)
VALUES
  ('林晨宇', 'chenyu.lin@example.com', '投票疑義', '請問每日擴散希望任務的能量票每日重置時間？', '您好！我是成振宇的忠實粉絲，想詢問每天「擴散希望」獲得的額外能量票會在台灣時間午夜 00:00 自動歸零嗎？還是會累積至下個賽季？感謝管理團隊辛勞！', 'unread'),
  ('黃維琪', 'vicky.dive@example.com', '周邊出貨', 'Lucky Vicky 壓克力立牌套組寄件地址更正申請', '您好，我剛剛在商城下單了張員瑛的 Lucky Vicky 立牌套組（訂單編號 ORD-2026-8802），因為搬家想更改收件地址，請問能在出貨前替我修改備註嗎？謝謝！', 'unread'),
  ('星街彗星海外應援會', 'suisei.fanclub.tw@example.com', '商務合作', '希望洽詢 2026 彗星誕生祭線上線下應援企劃贊助事宜', 'OshiPulse 團隊您好，我們是台灣星街彗星海外應援後援會，希望能透過平台的「聯名許願」專區共同發起大型應援公車與西門町大螢幕投放贊助企劃，期待進一步聯絡！', 'replied')
ON CONFLICT DO NOTHING;

-- 7. 防弊審計初始日誌
INSERT INTO public.audit_logs (time, username, ip, country, fingerprint, risk, reason, blocked)
VALUES
  ('14:28:10', 'bot_hunter_99', '182.234.12.89', '台灣', 'FP-9901', 'Danger', '高頻微秒級自動灌票 (1秒25票)', false),
  ('14:26:45', 'gojo_love_07', '218.161.45.22', '台灣', 'FP-4412', 'Safe', '會員手動完成每日應援任務', false),
  ('14:24:19', 'auto_voter_tw', '45.134.20.11', '荷蘭 (代理)', 'FP-0021', 'Warning', '海外匿名 VPN 節點跳躍', false),
  ('14:18:32', 'spammer_cluster_a', '103.246.10.5', '東歐 (殭屍網)', 'FP-3390', 'Danger', '跨國無頭瀏覽器指紋偽裝', true)
ON CONFLICT DO NOTHING;
