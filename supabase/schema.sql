-- OshiPulse (推しパルス) Database Schema
-- 擴充套件
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('user', 'admin');
create type idol_country as enum ('TW', 'JP', 'KR', 'CN', 'US');
create type idol_category as enum ('singer', 'actor', 'seiyuu', 'creator', 'vtuber', 'character');
create type idol_formation as enum ('solo', 'group');
create type battle_status as enum ('draft', 'teaser', 'live', 'ended');
create type collab_status as enum ('pledging', 'confirmed', 'ticket_selling', 'completed');
create type product_source as enum ('official_regular', 'collab_exclusive');
create type order_status as enum ('pending', 'paid', 'shipped', 'cancelled');
create type message_status as enum ('unread', 'read', 'replied');

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  avatar_url text,
  role user_role default 'user' not null,
  referral_code text unique default substring(md5(random()::text) from 1 for 8),
  referred_by uuid references public.profiles(id),
  bonus_votes integer default 0 check (bonus_votes >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Idols Table
create table public.idols (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  original_name text,
  country idol_country not null,
  category idol_category not null,
  formation idol_formation default 'solo' not null,
  debut_year integer,
  avatar_url text not null,          -- Fixed 1:1 ratio
  cover_url text,                   -- Fixed 16:9 ratio
  members jsonb default '[]'::jsonb, -- Up力 50 members: [{name, gender, birth_date, is_unrevealed, zodiac, avatar_url}]
  notable_works jsonb default '[]'::jsonb,
  official_links jsonb default '[]'::jsonb,
  wiki_slug text,
  spotify_track_id text,
  youtube_video_id text,
  vote_count bigint default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Votes Ledger & Device Anti-Cheat
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  idol_id uuid references public.idols(id) on delete cascade not null,
  device_fingerprint text not null,
  cheer_message varchar(20),
  vote_date date default (current_date at time zone 'Asia/Taipei') not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.device_daily_records (
  device_fingerprint text not null,
  record_date date default (current_date at time zone 'Asia/Taipei') not null,
  primary key (device_fingerprint, record_date)
);

-- 4. Battles & Time-Series Snapshots
create table public.battles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  banner_url text,
  teaser_start_at timestamp with time zone not null,
  battle_start_at timestamp with time zone not null,
  battle_end_at timestamp with time zone not null,
  status battle_status default 'draft' not null,
  champion_idol_id uuid references public.idols(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.battle_participants (
  battle_id uuid references public.battles(id) on delete cascade,
  idol_id uuid references public.idols(id) on delete cascade,
  final_rank integer,
  final_votes bigint default 0,
  primary key (battle_id, idol_id)
);

create table public.battle_snapshots (
  id uuid default gen_random_uuid() primary key,
  battle_id uuid references public.battles(id) on delete cascade not null,
  idol_id uuid references public.idols(id) on delete cascade not null,
  recorded_at timestamp with time zone not null,
  accumulated_votes bigint not null
);

-- 5. Collabs, Wish Pool & Ticket Lotteries
create table public.collabs (
  id uuid default gen_random_uuid() primary key,
  idol_id uuid references public.idols(id) on delete cascade not null,
  title text not null,
  status collab_status default 'pledging' not null,
  pledge_goal integer default 3000,
  pledge_count integer default 0,
  event_date timestamp with time zone,
  event_venue text,
  banner_url text not null,
  details_markdown text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.collab_pledges (
  collab_id uuid references public.collabs(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  pledged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (collab_id, user_id)
);

create table public.collab_giveaways (
  id uuid default gen_random_uuid() primary key,
  collab_id uuid references public.collabs(id) on delete cascade not null,
  title text not null,
  ticket_quota integer default 1,
  min_votes_required integer default 3,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  draw_at timestamp with time zone not null,
  is_drawn boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.giveaway_entries (
  id uuid default gen_random_uuid() primary key,
  giveaway_id uuid references public.collab_giveaways(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tickets_count integer default 1,
  is_winner boolean default false,
  verification_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(giveaway_id, user_id)
);

-- 6. Store Products & Orders
create table public.products (
  id uuid default gen_random_uuid() primary key,
  idol_id uuid references public.idols(id) on delete set null,
  collab_id uuid references public.collabs(id) on delete set null,
  source_type product_source default 'official_regular' not null,
  title text not null,
  description text,
  price integer not null,
  stock integer not null default 0 check (stock >= 0),
  min_votes_to_buy integer default 0,
  images text[] not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  total_amount integer not null,
  status order_status default 'pending' not null,
  payment_trade_no text,
  shipping_info jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null
);

-- 7. Contact Messages
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  sender_name text not null,
  sender_email text not null,
  category text not null,
  subject text not null,
  message text not null,
  status message_status default 'unread' not null,
  reply_content text,
  replied_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stored Procedure: Atomic Safe Voting Procedure
create or replace function cast_idol_vote(
  p_user_id uuid,
  p_idol_id uuid,
  p_fingerprint text,
  p_message varchar(20)
) returns jsonb as $$
declare
  v_today date := (current_date at time zone 'Asia/Taipei');
  v_has_device_voted boolean;
  v_user_bonus_votes int;
  v_user_voted_today boolean;
begin
  select exists(select 1 from public.device_daily_records where device_fingerprint = p_fingerprint and record_date = v_today) into v_has_device_voted;
  select exists(select 1 from public.votes where user_id = p_user_id and vote_date = v_today) into v_user_voted_today;
  select bonus_votes into v_user_bonus_votes from public.profiles where id = p_user_id;

  if v_has_device_voted and v_user_voted_today and (v_user_bonus_votes <= 0) then
    return jsonb_build_object('success', false, 'message', '今日該設備與帳號投票額度已達上限！');
  end if;

  if v_user_voted_today then
    update public.profiles set bonus_votes = bonus_votes - 1 where id = p_user_id;
  end if;

  insert into public.device_daily_records (device_fingerprint, record_date) values (p_fingerprint, v_today) on conflict do nothing;
  insert into public.votes (user_id, idol_id, device_fingerprint, cheer_message, vote_date) values (p_user_id, p_idol_id, p_fingerprint, p_message, v_today);
  update public.idols set vote_count = vote_count + 1 where id = p_idol_id;

  return jsonb_build_object('success', true, 'message', '應援成功！');
end;
$$ language plpgsql security definer;

-- Stored Procedure: Atomic Safe Stock Decrement
create or replace function decrement_stock(p_id uuid, qty int)
returns boolean as $$
declare
  current_stock int;
begin
  select stock into current_stock from public.products where id = p_id for update;
  if current_stock >= qty then
    update public.products set stock = stock - qty where id = p_id;
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql;

-- Row Level Security (RLS) 設定
alter table public.profiles enable row level security;
alter table public.idols enable row level security;
alter table public.votes enable row level security;
alter table public.battles enable row level security;
alter table public.battle_participants enable row level security;
alter table public.collabs enable row level security;
alter table public.collab_pledges enable row level security;
alter table public.collab_giveaways enable row level security;
alter table public.giveaway_entries enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;

-- 讀取政策：一般公眾資料所有人可讀
create policy "公開偶像名單可自由讀取" on public.idols for select using (true);
create policy "公開對決資訊可自由讀取" on public.battles for select using (true);
create policy "公開對決參賽者可自由讀取" on public.battle_participants for select using (true);
create policy "公開聯名活動可自由讀取" on public.collabs for select using (true);
create policy "公開抽獎活動可自由讀取" on public.collab_giveaways for select using (true);
create policy "公開商城商品可自由讀取" on public.products for select using (is_active = true);
create policy "個人資料讀取" on public.profiles for select using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 管理員權限全開政策
create policy "管理員全權管理偶像" on public.idols for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "管理員全權管理對決" on public.battles for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "管理員全權管理聯名" on public.collabs for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "管理員全權管理商品" on public.products for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "管理員檢視聯絡訊息" on public.contact_messages for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
