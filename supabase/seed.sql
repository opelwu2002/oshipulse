-- OshiPulse (推しパルス) Seed Data: 10 位跨 5 國 5 領域頂尖偶像
insert into public.idols (name, original_name, country, category, formation, debut_year, avatar_url, cover_url, wiki_slug, spotify_track_id, youtube_video_id, vote_count, members, notable_works, official_links)
values
-- 1. 日本 虛擬偶像: 星街彗星
('星街彗星', '星街すいせい', 'JP', 'vtuber', 'solo', 2018,
 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200',
 'Hoshimachi_Suisei', '7x92d7UoGqKsp14yM6lZcR', 'a51VH9BYzZA', 14205,
 '[{"name": "星街すいせい", "gender": "female", "birth_date": null, "is_unrevealed": true, "zodiac": "未知星屑 ✦", "avatar_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200"}]',
 '[{"type": "歌曲", "title": "Stellar Stellar"}, {"type": "歌曲", "title": "ビビデバ"}]',
 '[{"name": "官方 X", "url": "https://twitter.com/suisei_hosimati"}, {"name": "YouTube", "url": "https://youtube.com/@HoshimachiSuisei"}]'),

-- 2. 台灣 歌手: 周杰倫
('周杰倫', 'Jay Chou', 'TW', 'singer', 'solo', 2000,
 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
 'Jay_Chou', '2elA8uR2vWb7nS20x3YgUf', 'mp0jFkYJc3c', 13950,
 '[{"name": "周杰倫", "gender": "male", "birth_date": "1979-01-18", "is_unrevealed": false, "zodiac": "摩羯座 ♑︎", "avatar_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200"}]',
 '[{"type": "代表作", "title": "青花瓷"}, {"type": "電影", "title": "不能說的秘密"}]',
 '[{"name": "Instagram", "url": "https://instagram.com/jaychou"}]'),

-- 3. 韓國 多人女團: NewJeans
('NewJeans', '뉴진스', 'KR', 'singer', 'group', 2022,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200',
 'NewJeans', '65FftVqd5MW6u0bqrR0v4s', 'js1Ctxc36AM', 12890,
 '[{"name": "Minji", "gender": "female", "birth_date": "2004-05-07", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"},
   {"name": "Hanni", "gender": "female", "birth_date": "2004-10-06", "is_unrevealed": false, "zodiac": "天秤座 ♎︎", "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200"},
   {"name": "Danielle", "gender": "female", "birth_date": "2005-04-11", "is_unrevealed": false, "zodiac": "牡羊座 ♈︎", "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200"},
   {"name": "Haerin", "gender": "female", "birth_date": "2006-05-15", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"},
   {"name": "Hyein", "gender": "female", "birth_date": "2008-04-21", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200"}]',
 '[{"type": "歌曲", "title": "Ditto"}, {"type": "歌曲", "title": "Hype Boy"}]',
 '[{"name": "官方 X", "url": "https://twitter.com/NewJeans_ADOR"}]'),

-- 4. 美國 流行天后: Taylor Swift
('泰勒絲', 'Taylor Swift', 'US', 'singer', 'solo', 2006,
 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400',
 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
 'Taylor_Swift', '06HL4z0CvFAxyc27GXpf02', 'b1kbLwvqugk', 12100,
 '[{"name": "Taylor Swift", "gender": "female", "birth_date": "1989-12-13", "is_unrevealed": false, "zodiac": "射手座 ♐︎", "avatar_url": "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200"}]',
 '[{"type": "代表作", "title": "Cruel Summer"}, {"type": "巡演", "title": "The Eras Tour"}]',
 '[{"name": "官方網站", "url": "https://www.taylorswift.com"}]'),

-- 5. 日本 知名聲優: 花澤香菜
('花澤香菜', 'Kana Hanazawa', 'JP', 'seiyuu', 'solo', 2003,
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
 'Kana_Hanazawa', '702KjI6CgP4W66k8uBv0xG', 'k7m84Hn9s7k', 9840,
 '[{"name": "花澤香菜", "gender": "female", "birth_date": "1989-02-25", "is_unrevealed": false, "zodiac": "雙魚座 ♓︎", "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"}]',
 '[{"type": "角色配音", "title": "千石撫子 (物語系列)"}, {"type": "代表歌曲", "title": "戀愛循環"}]',
 '[{"name": "官方 X", "url": "https://twitter.com/hanazawa_staff"}]'),

-- 6. 中國 實力演員: 肖戰
('肖戰', 'Sean Xiao', 'CN', 'actor', 'solo', 2015,
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200',
 'Xiao_Zhan', '3rW7lOQ4U4yV5Nq9zC7G', 'D13Yk0Tj3k8', 9210,
 '[{"name": "肖戰", "gender": "male", "birth_date": "1991-10-05", "is_unrevealed": false, "zodiac": "天秤座 ♎︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"}]',
 '[{"type": "電視劇", "title": "陳情令"}, {"type": "電視劇", "title": "夢中的那片海"}]',
 '[{"name": "微博工作室", "url": "https://weibo.com"}]'),

-- 7. 台灣 網路創作者/實況主: 統神
('統神', 'Asiagodtone', 'TW', 'creator', 'solo', 2013,
 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
 '亞洲統神', null, 'YQHsXMglC9A', 8650,
 '[{"name": "張嘉航", "gender": "male", "birth_date": "1988-09-12", "is_unrevealed": false, "zodiac": "處女座 ♍︎", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}]',
 '[{"type": "知名實況", "title": "英雄聯盟戰隊 HPS 創辦人"}]',
 '[{"name": "YouTube 頻道", "url": "https://youtube.com"}]'),

-- 8. 日本 大型女團: AKB48
('AKB48', 'AKB48', 'JP', 'singer', 'group', 2005,
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200',
 'AKB48', '51G2U1H6jP5x1Hj2P0', 'lkHlnWFnJ4c', 8340,
 '[{"name": "小栗有以", "gender": "female", "birth_date": "2001-12-26", "is_unrevealed": false, "zodiac": "摩羯座 ♑︎", "avatar_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200"},
   {"name": "倉野尾成美", "gender": "female", "birth_date": "2000-11-08", "is_unrevealed": false, "zodiac": "天蠍座 ♏︎", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}]',
 '[{"type": "代表作", "title": "戀愛的幸運餅乾"}, {"type": "代表作", "title": "Heavy Rotation"}]',
 '[{"name": "官方網站", "url": "https://www.akb48.co.jp"}]'),

-- 9. 歐美 知名實況主: IShowSpeed
('IShowSpeed', 'Darren Watkins Jr.', 'US', 'creator', 'solo', 2016,
 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400',
 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
 'IShowSpeed', null, 'mKkJyqYv3b8', 7890,
 '[{"name": "Darren Watkins Jr.", "gender": "male", "birth_date": "2005-01-21", "is_unrevealed": false, "zodiac": "水瓶座 ♒︎", "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200"}]',
 '[{"type": "代表成就", "title": "全球人氣 IRL 實況主"}]',
 '[{"name": "YouTube", "url": "https://youtube.com/@IShowSpeed"}]'),

-- 10. 韓國 人氣演員: 金秀賢
('金秀賢', 'Kim Soo-hyun', 'KR', 'actor', 'solo', 2007,
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200',
 'Kim_Soo-hyun', null, 'Gk8b1fG1e4w', 7450,
 '[{"name": "金秀賢", "gender": "male", "birth_date": "1988-02-16", "is_unrevealed": false, "zodiac": "水瓶座 ♒︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"}]',
 '[{"type": "電視劇", "title": "淚之女王"}, {"type": "電視劇", "title": "來自星星的你"}]',
 '[{"name": "Instagram", "url": "https://instagram.com/soohyun_k216"}]');
