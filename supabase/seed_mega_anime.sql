-- 1. Ensure Enum supports character category
alter type public.idol_category add value if not exists 'character';

-- 2. Insert Mega 2.5D Franchise & Anime Roster
insert into public.idols (name, original_name, country, category, formation, debut_year, avatar_url, cover_url, wiki_slug, spotify_track_id, youtube_video_id, vote_count, members, notable_works, official_links)
values

-- ====================================================================
-- 【多媒體遊戲/企劃偶像 2.5D Franchise Idols】
-- ====================================================================

-- 1. 催眠麥克風 - Buster Bros!!! (池袋代表隊)
('Buster Bros!!!', 'バスター ブロス', 'JP', 'singer', 'group', 2017,
 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
 'Hypnosis_Mic:_Division_Rap_Battle', '7x92d7UoGqKsp14yM6lZcR', 'a51VH9BYzZA', 23400,
 '[
   {"name": "山田一郎 (MC.B.B)", "gender": "male", "birth_date": "1997-07-26", "is_unrevealed": false, "zodiac": "獅子座 ♌︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"},
   {"name": "山田二郎 (MC.M.B)", "gender": "male", "birth_date": "1999-02-06", "is_unrevealed": false, "zodiac": "水瓶座 ♒︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
   {"name": "山田三郎 (MC.L.B)", "gender": "male", "birth_date": "2001-12-16", "is_unrevealed": false, "zodiac": "射手座 ♐︎", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
 ]',
 '[{"type": "代表歌曲", "title": "俺が一郎"}, {"type": "單曲", "title": "IKEBUKURO WEST GAME PARK"}]',
 '[{"name": "官方企劃網站", "url": "https://hypnosismic.com"}]'),

-- 2. 催眠麥克風 - MAD TRIGGER CREW (橫濱代表隊)
('MAD TRIGGER CREW', 'マッド トリガー クルー', 'JP', 'singer', 'group', 2017,
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
 'Hypnosis_Mic:_Division_Rap_Battle', '2elA8uR2vWb7nS20x3YgUf', 'mp0jFkYJc3c', 22900,
 '[
   {"name": "碧棺左馬刻 (Mr.Hc)", "gender": "male", "birth_date": "1994-11-11", "is_unrevealed": false, "zodiac": "天蠍座 ♏︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"},
   {"name": "入間銃兔 (45 Rabbit)", "gender": "male", "birth_date": "1991-05-30", "is_unrevealed": false, "zodiac": "雙子座 ♊︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
   {"name": "毒島Mason理鶯 (Crazy M)", "gender": "male", "birth_date": "1989-06-21", "is_unrevealed": false, "zodiac": "雙子座 ♊︎", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
 ]',
 '[{"type": "代表歌曲", "title": "Yokohama Walker"}, {"type": "單曲", "title": "Scarface"}]',
 '[{"name": "官方網站", "url": "https://hypnosismic.com"}]'),

-- 3. 催眠麥克風 - Fling Posse (澀谷代表隊)
('Fling Posse', 'フリング ポッセ', 'JP', 'singer', 'group', 2017,
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
 'Hypnosis_Mic:_Division_Rap_Battle', '65FftVqd5MW6u0bqrR0v4s', 'js1Ctxc36AM', 24100,
 '[
   {"name": "飴村亂數 (easy R)", "gender": "male", "birth_date": "1996-02-14", "is_unrevealed": false, "zodiac": "水瓶座 ♒︎", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"},
   {"name": "夢野幻太郎 (Phantom)", "gender": "male", "birth_date": "1996-04-01", "is_unrevealed": false, "zodiac": "牡羊座 ♈︎", "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200"},
   {"name": "有栖川帝統 (Dead or Alive)", "gender": "male", "birth_date": "1997-07-07", "is_unrevealed": false, "zodiac": "巨蟹座 ♋︎", "avatar_url": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200"}
 ]',
 '[{"type": "代表作", "title": "Stella"}, {"type": "奪冠曲", "title": "Shibuya Marble Texture"}]',
 '[{"name": "官方網站", "url": "https://hypnosismic.com"}]'),

-- 4. 歌之☆王子殿下♪ - ST☆RISH
('ST☆RISH', 'スターリッシュ', 'JP', 'singer', 'group', 2010,
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
 'Uta_no_Prince-sama', '1x2y3z4w5v6u7t8s9r0q1p', 'vR6M8_bK2w9', 28500,
 '[
   {"name": "一十木音也", "gender": "male", "birth_date": "1995-04-11", "is_unrevealed": false, "zodiac": "牡羊座 ♈︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"},
   {"name": "聖川真斗", "gender": "male", "birth_date": "1994-12-29", "is_unrevealed": false, "zodiac": "摩羯座 ♑︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
   {"name": "四之宮那月", "gender": "male", "birth_date": "1994-06-09", "is_unrevealed": false, "zodiac": "雙子座 ♊︎", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"},
   {"name": "一之瀨時矢", "gender": "male", "birth_date": "1994-08-06", "is_unrevealed": false, "zodiac": "獅子座 ♌︎", "avatar_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200"},
   {"name": "神宮寺蓮", "gender": "male", "birth_date": "1993-02-14", "is_unrevealed": false, "zodiac": "水瓶座 ♒︎", "avatar_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200"},
   {"name": "來栖翔", "gender": "male", "birth_date": "1995-06-09", "is_unrevealed": false, "zodiac": "雙子座 ♊︎", "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200"},
   {"name": "愛島賽西爾", "gender": "male", "birth_date": "1996-10-31", "is_unrevealed": false, "zodiac": "天蠍座 ♏︎", "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200"}
 ]',
 '[{"type": "神曲", "title": "真愛1000% (マジLOVE1000%)"}, {"type": "單曲", "title": "真愛2000%"}]',
 '[{"name": "官方企劃網站", "url": "https://www.utapri.com"}]'),

-- 5. 歌之☆王子殿下♪ - QUARTET NIGHT
('QUARTET NIGHT', 'カルテットナイト', 'JP', 'singer', 'group', 2012,
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200',
 'Uta_no_Prince-sama', '702KjI6CgP4W66k8uBv0xG', 'k7m84Hn9s7k', 25600,
 '[
   {"name": "壽嶺二", "gender": "male", "birth_date": "1990-07-13", "is_unrevealed": false, "zodiac": "巨蟹座 ♋︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"},
   {"name": "黑崎蘭丸", "gender": "male", "birth_date": "1991-09-29", "is_unrevealed": false, "zodiac": "天秤座 ♎︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
   {"name": "美風藍", "gender": "male", "birth_date": "1998-03-01", "is_unrevealed": false, "zodiac": "雙魚座 ♓︎", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"},
   {"name": "卡繆 (Camus)", "gender": "male", "birth_date": "1992-01-23", "is_unrevealed": false, "zodiac": "水瓶座 ♒︎", "avatar_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200"}
 ]',
 '[{"type": "單曲", "title": "Evolution Eve"}, {"type": "代表曲", "title": "FLY TO THE FUTURE"}]',
 '[{"name": "官方網站", "url": "https://www.utapri.com"}]'),

-- 6. A3! 滿開劇團 - 春組 (Spring Troupe)
('A3! 滿開劇團 春組', 'MANKAI Company Spring Troupe', 'JP', 'actor', 'group', 2017,
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
 'A3!', '3rW7lOQ4U4yV5Nq9zC7G', 'D13Yk0Tj3k8', 19800,
 '[
   {"name": "佐久間咲也", "gender": "male", "birth_date": "2000-03-09", "is_unrevealed": false, "zodiac": "雙魚座 ♓︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"},
   {"name": "碓冰真澄", "gender": "male", "birth_date": "2001-01-17", "is_unrevealed": false, "zodiac": "摩羯座 ♑︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
   {"name": "皆木綴", "gender": "male", "birth_date": "1999-04-09", "is_unrevealed": false, "zodiac": "牡羊座 ♈︎", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"},
   {"name": "茅崎至", "gender": "male", "birth_date": "1996-04-24", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200"},
   {"name": "シトロン (Citron)", "gender": "male", "birth_date": "1997-05-15", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200"},
   {"name": "卯木千景", "gender": "male", "birth_date": "1994-04-15", "is_unrevealed": false, "zodiac": "牡羊座 ♈︎", "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200"}
 ]',
 '[{"type": "公演劇目", "title": "羅密歐與朱利葉斯"}, {"type": "主題曲", "title": "春ですね。"}]',
 '[{"name": "官方網站", "url": "https://www.a3-liber.jp"}]'),

-- 7. 偶像夢幻祭 - Knights
('Knights', 'ナイツ', 'JP', 'singer', 'group', 2015,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
 'Ensemble_Stars!', '6qqNVTkY8uBg9cP3Jd7DAH', 'viimfQi_pfg', 27600,
 '[
   {"name": "月永雷歐 (月永レオ)", "gender": "male", "birth_date": "1998-05-05", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"},
   {"name": "瀨名泉", "gender": "male", "birth_date": "1998-11-02", "is_unrevealed": false, "zodiac": "天蠍座 ♏︎", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
   {"name": "朔間凜月", "gender": "male", "birth_date": "1998-09-22", "is_unrevealed": false, "zodiac": "處女座 ♍︎", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"},
   {"name": "鳴上嵐", "gender": "female", "birth_date": "1998-03-03", "is_unrevealed": false, "zodiac": "雙魚座 ♓︎", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"},
   {"name": "朱櫻司", "gender": "male", "birth_date": "1999-04-06", "is_unrevealed": false, "zodiac": "牡羊座 ♈︎", "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200"}
 ]',
 '[{"type": "神曲", "title": "Silent Oath"}, {"type": "代表作", "title": "Voice of Sword"}]',
 '[{"name": "官方網站", "url": "https://ensemble-stars.jp"}]'),

-- ====================================================================
-- 【頂級熱門動漫角色 Anime Characters】
-- ====================================================================

-- 8. 五條悟 (Gojo Satoru) - 咒術迴戰
('五條悟', '五条悟 (Gojo Satoru)', 'JP', 'character', 'solo', 2018,
 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200',
 'Satoru_Gojo', null, 'mp0jFkYJc3c', 38900,
 '[{"name": "五條悟", "gender": "male", "birth_date": "1989-12-07", "is_unrevealed": false, "zodiac": "射手座 ♐︎", "avatar_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200"}]',
 '[{"type": "術式奧義", "title": "無量空處 / 虛式「茈」"}, {"type": "所屬", "title": "東京都立咒術高等專門學校"}]',
 '[{"name": "咒術迴戰官方", "url": "https://jujutsukaisen.jp"}]'),

-- 9. 伏黑惠 (Fushiguro Megumi) - 咒術迴戰
('伏黑惠', '伏黒恵 (Fushiguro Megumi)', 'JP', 'character', 'solo', 2018,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
 'Megumi_Fushiguro', null, 'a51VH9BYzZA', 31200,
 '[{"name": "伏黑惠", "gender": "male", "birth_date": "2002-12-22", "is_unrevealed": false, "zodiac": "摩羯座 ♑︎", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}]',
 '[{"type": "術式", "title": "十種影法術 / 八握劍異戒神將魔虛羅"}, {"type": "領域展開", "title": "嵌合暗翳庭"}]',
 '[{"name": "咒術迴戰官方", "url": "https://jujutsukaisen.jp"}]'),

-- 10. 芙莉蓮 (Frieren) - 葬送的芙莉蓮
('芙莉蓮', 'フリーレン (Frieren)', 'JP', 'character', 'solo', 2020,
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
 'Frieren', null, 'Y_h9o87fG2a', 36800,
 '[{"name": "芙莉蓮", "gender": "female", "birth_date": null, "is_unrevealed": true, "zodiac": "千年精靈 ✦", "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200"}]',
 '[{"type": "代表作", "title": "葬送的芙莉蓮"}, {"type": "稱號", "title": "大魔法使弗蘭梅的唯一弟子"}]',
 '[{"name": "官方動畫網站", "url": "https://frieren-anime.jp"}]'),

-- 11. 星野愛 (Hoshino Ai) - 【我推的孩子】
('星野愛', '星野アイ (Hoshino Ai)', 'JP', 'character', 'solo', 2020,
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200',
 'Ai_Hoshino', '6WBI5crZrD9aR6aT4', 'mAKsZ26SabQ', 39500,
 '[{"name": "星野愛", "gender": "female", "birth_date": "2003-05-07", "is_unrevealed": false, "zodiac": "金牛座 ♉︎", "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200"}]',
 '[{"type": "所屬偶像團體", "title": "B小町 (初代 C位)"}, {"type": "代表神曲", "title": "我推的偶像 (アイドル)"}]',
 '[{"name": "官方網站", "url": "https://ichigoproduction.com"}]'),

-- 12. 里維·阿卡曼 (Levi Ackerman) - 進擊的巨人
('里維·阿卡曼', 'リヴァイ・アッカーマン', 'JP', 'character', 'solo', 2009,
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200',
 'Levi_Ackerman', null, 'gdZLi9oWNZg', 35400,
 '[{"name": "里維·阿卡曼", "gender": "male", "birth_date": "1988-12-25", "is_unrevealed": false, "zodiac": "摩羯座 ♑︎", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"}]',
 '[{"type": "稱號", "title": "人類最強的士兵"}, {"type": "所屬", "title": "調查兵團 特別作戰班 兵長"}]',
 '[{"name": "進擊的巨人官方", "url": "https://shingeki.tv"}]');
