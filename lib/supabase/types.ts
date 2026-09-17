/**
 * OshiPulse 資料庫與領域類型定義
 */

export type UserRole = "user" | "admin";
export type IdolCountry = "TW" | "JP" | "KR" | "CN" | "US";
export type IdolCategory = "singer" | "actor" | "seiyuu" | "creator" | "vtuber" | "character";
export type IdolFormation = "solo" | "group";
export type EntityType = "universe" | "solo";
export type BattleStatus = "draft" | "teaser" | "live" | "ended";
export type CollabStatus = "pledging" | "confirmed" | "ticket_selling" | "completed";
export type ProductSource = "official_regular" | "collab_exclusive";
export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
export type MessageStatus = "unread" | "read" | "replied";

export interface Member {
  name: string;
  original_name?: string | null;
  gender: string;
  birth_date: string | null;
  is_unrevealed: boolean;
  zodiac: string;
  avatar_url: string;
}

export interface NotableWork {
  type: string;
  title: string;
}

export interface OfficialLink {
  name: string;
  url: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string | null;
  role: UserRole;
  referral_code: string;
  referred_by?: string | null;
  bonus_votes: number;
  created_at: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  desc: string;
}

export interface Idol {
  id: string;
  name: string;
  original_name?: string | null;
  country: IdolCountry;
  category: IdolCategory;
  entity_type: EntityType;
  universe_id?: string | null;
  formation: IdolFormation;
  debut_year?: number | null;
  avatar_url: string;
  cover_url?: string | null;
  members: Member[];
  notable_works: NotableWork[];
  official_links: OfficialLink[];
  timeline?: TimelineMilestone[];
  wiki_slug?: string | null;
  spotify_track_id?: string | null;
  youtube_video_id?: string | null;
  vote_count: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Vote {
  id: string;
  user_id: string;
  idol_id: string;
  device_fingerprint: string;
  cheer_message?: string | null;
  vote_date: string;
  created_at: string;
}

export interface Battle {
  id: string;
  title: string;
  description?: string | null;
  banner_url?: string | null;
  teaser_start_at: string;
  battle_start_at: string;
  battle_end_at: string;
  status: BattleStatus;
  champion_idol_id?: string | null;
  created_at: string;
  participants?: BattleParticipant[];
}

export interface BattleParticipant {
  battle_id: string;
  idol_id: string;
  final_rank?: number | null;
  final_votes: number;
  idol?: Idol;
}

export interface Collab {
  id: string;
  idol_id: string;
  title: string;
  status: CollabStatus;
  pledge_goal: number;
  pledge_count: number;
  event_date?: string | null;
  event_venue?: string | null;
  banner_url: string;
  details_markdown?: string | null;
  created_at: string;
  idol?: Idol;
}

export interface CollabGiveaway {
  id: string;
  collab_id: string;
  title: string;
  ticket_quota: number;
  min_votes_required: number;
  start_at: string;
  end_at: string;
  draw_at: string;
  is_drawn: boolean;
  created_at: string;
}

export interface GiveawayEntry {
  id: string;
  giveaway_id: string;
  user_id: string;
  tickets_count: number;
  is_winner: boolean;
  verification_code?: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Product {
  id: string;
  idol_id?: string | null;
  collab_id?: string | null;
  source_type: ProductSource;
  title: string;
  description?: string | null;
  price: number;
  stock: number;
  min_votes_to_buy: number;
  images: string[];
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id?: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_trade_no?: string | null;
  shipping_info: {
    recipient_name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  created_at: string;
  items?: OrderItem[];
}

export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  category: string;
  subject: string;
  message: string;
  status: MessageStatus;
  reply_content?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface EventData {
  id: string;
  title: string;
  publish_start_date: string; // 上架網站時間
  publish_end_date: string;   // 下架網站時間
  event_start_date: string;   // 活動實際開始時間
  event_end_date: string;     // 活動實際結束時間
  image_url: string;
  description: string;
  is_physical: boolean;       // 是否有配合實體地點
  address?: string;           // 實體地址
  google_maps_url?: string;   // Google Map 連結
}
