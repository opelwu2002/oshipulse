/**
 * Zustand 全域用戶端狀態庫 - 本機純前端離線模式 (Local Mock Mode)
 * 整合 persist 中介軟體持久化購物車、音效設定、使用者身分與偶像票數變更
 * 全站直接讀取本機 INITIAL_IDOLS，不連線任何外部資料庫
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Idol, Product, Battle, Collab, ContactMessage, EventData, Profile } from "./supabase/types";
import {
  INITIAL_IDOLS,
  INITIAL_BATTLES,
  INITIAL_COLLABS,
  INITIAL_PRODUCTS,
  INITIAL_MESSAGES,
} from "./mockData";
import { soundEngine } from "./audio";


export const INITIAL_PROFILES: Profile[] = [
  {
    id: "usr-1",
    username: "hunter_jinwoo_vip",
    full_name: "林晨宇",
    nickname: "暗影獵人",
    birth_date: "1998-06-12",
    phone: "0912-345-678",
    address: "台北市大安區信義路四段100號",
    favorite_idol: "成振宇 (Sung Jinwoo)",
    avatar_url: "/images/idols/sung-jinwoo.jpg",
    role: "user",
    referral_code: "JINWOO2026",
    bonus_votes: 120,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-03-01T15:30:00Z",
  },
  {
    id: "usr-2",
    username: "gojo_domain_master",
    full_name: "張無限",
    nickname: "六眼悟推",
    birth_date: "2000-12-07",
    phone: "0923-456-789",
    address: "新北市板橋區文化路一段20號",
    favorite_idol: "五條悟",
    avatar_url: "/images/idols/gojo-satoru.jpg",
    role: "user",
    referral_code: "INFINITY5",
    bonus_votes: 85,
    created_at: "2026-01-15T14:20:00Z",
    updated_at: "2026-03-05T09:10:00Z",
  },
  {
    id: "usr-3",
    username: "golden_jk_army",
    full_name: "陳語婕",
    nickname: "黃金阿米",
    birth_date: "2002-09-01",
    phone: "0934-567-890",
    address: "台中市西區公益路68號",
    favorite_idol: "田柾國 (Jung Kook)",
    avatar_url: "/images/idols/jungkook.jpg",
    role: "user",
    referral_code: "SEVEN777",
    bonus_votes: 210,
    created_at: "2026-01-20T18:00:00Z",
    updated_at: "2026-03-10T12:00:00Z",
  },
  {
    id: "usr-4",
    username: "wonyoung_lucky_dive",
    full_name: "黃維琪",
    nickname: "Lucky Vicky",
    birth_date: "2004-08-31",
    phone: "0955-678-901",
    address: "高雄市左營區博愛二路777號",
    favorite_idol: "張員瑛 (Wonyoung)",
    avatar_url: "/images/idols/wonyoung.jpg",
    role: "user",
    referral_code: "VICKY100",
    bonus_votes: 160,
    created_at: "2026-02-01T11:30:00Z",
    updated_at: "2026-03-12T16:45:00Z",
  },
  {
    id: "usr-5",
    username: "frieren_magic_fan",
    full_name: "李欣穎",
    nickname: "葬送的勇者隊",
    birth_date: "1999-04-20",
    phone: "0966-789-012",
    address: "台南市中西區西門路一段658號",
    favorite_idol: "芙莉蓮 (Frieren)",
    avatar_url: "/images/idols/frieren.jpg",
    role: "user",
    referral_code: "ZOLTRAAK",
    bonus_votes: 95,
    created_at: "2026-02-10T08:15:00Z",
    updated_at: "2026-03-15T11:20:00Z",
  },
];

export const INITIAL_EVENTS: EventData[] = [
  {
    id: "evt-1",
    title: "【特企】成振宇《我獨自升級》全球首映與暗影特展",
    publish_start_date: "2026-06-01T00:00",
    publish_end_date: "2026-12-31T23:59",
    event_start_date: "2026-08-10T10:00",
    event_end_date: "2026-08-25T20:00",
    image_url: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VtlCXHQT.jpg",
    description: "全台獵人集合！體驗成振宇『起來 (Arise)』超震撼暗影提取空間，現場獨家釋出專屬應援票券與限量周邊。",
    is_physical: true,
    address: "台北市中正區市民大道三段2號 (三創生活園區 1F)",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E5%B8%82%E6%B0%91%E5%A4%A7%E9%81%93%E4%B8%89%E6%AE%B52%E8%99%9F",
  },
  {
    id: "evt-2",
    title: "【應援展】BTS 田柾國《GOLDEN》線下聲量咖啡廳與影像特展",
    publish_start_date: "2026-07-01T00:00",
    publish_end_date: "2026-11-30T23:59",
    event_start_date: "2026-09-01T11:00",
    event_end_date: "2026-09-15T19:00",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/BTS_for_Dispatch_White_Day_Special%2C_27_February_2019_01.jpg",
    description: "慶祝黃金忙內 Seven 突破歷史紀錄！現場展出歷年珍貴打歌服與應援手燈連動光雕秀。",
    is_physical: true,
    address: "台北市中山區南京西路14號 (誠品生活南西門市特區)",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E5%B1%B1%E5%8D%80%E5%8D%97%E4%BA%AC%E8%A5%BF%E8%B7%AF14%E8%99%9F",
  },
  {
    id: "evt-3",
    title: "【線上連動】張員瑛 IVE 專屬 Lucky Vicky 幸運願望池",
    publish_start_date: "2026-05-01T00:00",
    publish_end_date: "2026-12-31T23:59",
    event_start_date: "2026-06-01T00:00",
    event_end_date: "2026-12-31T23:59",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/230811_Jamboree_K-Pop_Super_Live_IVE.jpg/1200px-230811_Jamboree_K-Pop_Super_Live_IVE.jpg",
    description: "參與線上幸運打氣，集氣達成解鎖全亞洲戶外電視牆投放與全球抽獎好禮！",
    is_physical: false,
  },
  {
    id: "evt-4",
    title: "【巡迴展】咒術迴戰 五條悟「無量空處」沉浸式領域展開展",
    publish_start_date: "2026-06-15T00:00",
    publish_end_date: "2026-10-31T23:59",
    event_start_date: "2026-07-01T10:00",
    event_end_date: "2026-08-31T18:00",
    image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
    description: "特級咒術師五條悟涉谷高光重現，360度環形投影重溫無限咒力奧義。",
    is_physical: true,
    address: "台北市信義區光復南路133號 (松山文創園區 2號倉庫)",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%BF%A1%E7%BE%A9%E5%8D%80%E5%85%89%E5%BE%A9%E5%8D%97%E8%B7%AF133%E8%99%9F",
  },
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  rewardVotes: number;
}

export const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: "mission-music",
    title: "聆聽今日推薦神曲",
    description: "沈浸於五條悟或星街彗星的戰歌節奏中",
    completed: false,
    rewardVotes: 1,
  },
  {
    id: "mission-vote",
    title: "投出今日神聖一票",
    description: "為你的本命注入關鍵信仰能量",
    completed: false,
    rewardVotes: 1,
  },
  {
    id: "mission-cheer",
    title: "留下今日應援打氣",
    description: "在應援廣場或卡片留下滾燙心聲",
    completed: false,
    rewardVotes: 1,
  },
  {
    id: "mission-share",
    title: "發動一次擴散希望",
    description: "將本命舞台分享給更多應援同好",
    completed: false,
    rewardVotes: 2,
  },
];

interface AppState {
  // 購物車抽屜狀態
  isCartOpen: boolean;
  cart: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // 感官與音效偏好
  isSoundEnabled: boolean;
  isVibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;


  // 平台會員與粉絲管理
  currentMember: Profile | null;
  setCurrentMember: (profile: Profile | null) => void;
  members: Profile[];
  addMember: (member: Omit<Profile, "id" | "created_at">) => void;
  updateMember: (id: string, updates: Partial<Profile>) => void;
  deleteMember: (id: string) => void;

  // 角色與身分 (支援展示切換)
  currentUserRole: "user" | "admin";
  setUserRole: (role: "user" | "admin") => void;
  bonusVotes: number;
  useBonusVote: () => boolean;
  addBonusVotes: (amount: number) => void;

  // 贊助彈窗狀態
  isDonateModalOpen: boolean;
  openDonateModal: () => void;
  closeDonateModal: () => void;

  // 擴散希望分享彈窗狀態
  isShareModalOpen: boolean;
  shareIdol: Idol | null;
  openShareModal: (idol?: Idol) => void;
  closeShareModal: () => void;

  // 每日應援任務中心
  dailyMissions: DailyMission[];
  toggleMission: (id: string) => void;
  completeMission: (id: string) => void;
  hasClaimedDailyBonus: boolean;
  dailyGrandRewardClaimed: boolean;
  dailyStreak: number;
  claimDailyGrandReward: () => boolean;

  // 應援人格測驗狀態
  isPersonalityQuizOpen: boolean;
  openPersonalityQuiz: () => void;
  closePersonalityQuiz: () => void;
  personalityType: string | null;
  setPersonalityType: (type: string | null) => void;
  setPersonalityResult: (type: any) => void;

  // AI 應援小助手狀態
  isAIAssistantOpen: boolean;
  toggleAIAssistant: () => void;
  openAIAssistant: () => void;
  closeAIAssistant: () => void;

  // 實體動態資料（全域直接讀取本地 INITIAL 資料並響應式更新）
  idols: Idol[];
  battles: Battle[];
  collabs: Collab[];
  products: Product[];
  messages: ContactMessage[];
  events: EventData[];

  // 重置為最新種子資料
  resetAllToInitial: () => void;

  // 操作函式
  castVote: (idolId: string, cheerMessage?: string) => { success: boolean; message: string; rankChanged?: boolean };
  addIdol: (idol: Omit<Idol, "id" | "vote_count" | "created_at">) => void;
  updateIdol: (id: string, updates: Partial<Idol>) => void;
  deleteIdol: (id: string) => void;

  addBattle: (battle: Omit<Battle, "id" | "created_at">) => void;
  updateBattle: (id: string, updates: Partial<Battle>) => void;

  addCollab: (collab: Omit<Collab, "id" | "created_at" | "pledge_count">) => void;
  pledgeCollab: (collabId: string) => void;

  addProduct: (product: Omit<Product, "id" | "created_at">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;

  addContactMessage: (msg: Omit<ContactMessage, "id" | "status" | "reply_content" | "replied_at" | "created_at">) => void;
  replyContactMessage: (id: string, replyContent: string) => void;

  addEvent: (event: Omit<EventData, "id">) => void;
  updateEvent: (id: string, updates: Partial<EventData>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isCartOpen: false,
      cart: [],
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.cart.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isCartOpen: true,
            };
          }
          return {
            cart: [...state.cart, { product, quantity }],
            isCartOpen: true,
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter((item) => item.product.id !== productId) };
          }
          return {
            cart: state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => set({ cart: [] }),

      cartTotal: () => {
        const { cart } = get();
        return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      },

      cartCount: () => {
        const { cart } = get();
        return cart.reduce((acc, item) => acc + item.quantity, 0);
      },

      // 音效與震動偏好
      isSoundEnabled: true,
      isVibrationEnabled: true,
      toggleSound: () => {
        set((state) => {
          const next = !state.isSoundEnabled;
          soundEngine.setMuted(!next);
          return { isSoundEnabled: next };
        });
      },
      toggleVibration: () => set((state) => ({ isVibrationEnabled: !state.isVibrationEnabled })),


      // 平台會員狀態
      currentMember: null,
      setCurrentMember: (profile) => set({ currentMember: profile }),
      members: INITIAL_PROFILES,
      addMember: (newMem) => {
        const profile: Profile = {
          ...newMem,
          id: "usr-" + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ members: [profile, ...state.members] }));
      },
      updateMember: (id, updates) => {
        set((state) => {
          const updated = state.members.map((m) =>
            m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
          );
          const current = state.currentMember?.id === id
            ? { ...state.currentMember, ...updates, updated_at: new Date().toISOString() }
            : state.currentMember;
          return { members: updated, currentMember: current };
        });
      },
      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          currentMember: state.currentMember?.id === id ? null : state.currentMember,
        }));
      },

      // 角色管理與贈票
      currentUserRole: "admin", // 預設提供管理者展示模式以利開箱測試後台
      setUserRole: (role) => set({ currentUserRole: role }),
      bonusVotes: 5,
      useBonusVote: () => {
        const state = get();
        if (state.bonusVotes > 0) {
          set({ bonusVotes: state.bonusVotes - 1 });
          return true;
        }
        return false;
      },
      addBonusVotes: (amount) => set((state) => ({ bonusVotes: state.bonusVotes + amount })),

      // 彈窗開關
      isDonateModalOpen: false,
      openDonateModal: () => set({ isDonateModalOpen: true }),
      closeDonateModal: () => set({ isDonateModalOpen: false }),

      isShareModalOpen: false,
      shareIdol: null,
      openShareModal: (idol) => {
        set({ isShareModalOpen: true, shareIdol: idol || null });
        get().completeMission("mission-share");
      },
      closeShareModal: () => set({ isShareModalOpen: false, shareIdol: null }),

      // 每日應援任務中心
      dailyMissions: INITIAL_MISSIONS,
      toggleMission: (id) =>
        set((state) => ({
          dailyMissions: state.dailyMissions.map((m) =>
            m.id === id ? { ...m, completed: !m.completed } : m
          ),
        })),
      completeMission: (id) =>
        set((state) => ({
          dailyMissions: state.dailyMissions.map((m) =>
            m.id === id ? { ...m, completed: true } : m
          ),
        })),
      dailyStreak: 7,
      hasClaimedDailyBonus: false,
      dailyGrandRewardClaimed: false,
      claimDailyGrandReward: () => {
        const { dailyMissions, hasClaimedDailyBonus, bonusVotes } = get();
        const allDone = dailyMissions.every((m) => m.completed);
        if (allDone && !hasClaimedDailyBonus) {
          set({
            hasClaimedDailyBonus: true,
            dailyGrandRewardClaimed: true,
            bonusVotes: bonusVotes + 50,
          });
          return true;
        }
        return false;
      },

      // 應援人格測驗狀態
      isPersonalityQuizOpen: false,
      openPersonalityQuiz: () => set({ isPersonalityQuizOpen: true }),
      closePersonalityQuiz: () => set({ isPersonalityQuizOpen: false }),
      personalityType: null,
      setPersonalityType: (type) => set({ personalityType: type }),
      setPersonalityResult: (type) => set({ personalityType: type }),

      // AI 應援小助手狀態
      isAIAssistantOpen: false,
      toggleAIAssistant: () => set((state) => ({ isAIAssistantOpen: !state.isAIAssistantOpen })),
      openAIAssistant: () => set({ isAIAssistantOpen: true }),
      closeAIAssistant: () => set({ isAIAssistantOpen: false }),

      // 初始資料實體：直接使用包含所有動漫角色、企劃偶像與 =LOVE 的完整資料
      idols: INITIAL_IDOLS,
      battles: INITIAL_BATTLES,
      collabs: INITIAL_COLLABS,
      products: INITIAL_PRODUCTS,
      messages: INITIAL_MESSAGES,
      events: INITIAL_EVENTS,

      resetAllToInitial: () => {
        set({
          idols: INITIAL_IDOLS,
          battles: INITIAL_BATTLES,
          collabs: INITIAL_COLLABS,
          products: INITIAL_PRODUCTS,
          messages: INITIAL_MESSAGES,
          events: INITIAL_EVENTS,
          members: INITIAL_PROFILES,
          currentMember: INITIAL_PROFILES[0],
          dailyMissions: INITIAL_MISSIONS,
          hasClaimedDailyBonus: false,
        });
      },

      // 投票邏輯 (純本地離線防刷與累加)
      castVote: (idolId: string) => {
        const state = get();
        const idolIndex = state.idols.findIndex((i) => i.id === idolId);
        if (idolIndex === -1) return { success: false, message: "找不到該偶像資料" };

        const updatedIdols = [...state.idols];
        updatedIdols[idolIndex] = {
          ...updatedIdols[idolIndex],
          vote_count: updatedIdols[idolIndex].vote_count + 1,
        };

        // 按票數即時重新排序
        updatedIdols.sort((a, b) => b.vote_count - a.vote_count);

        set({ idols: updatedIdols });
        state.completeMission("mission-vote");
        return { success: true, message: "應援成功！聲量已注入！" };
      },

      addIdol: (newIdol) => {
        const id = "idol-" + Date.now();
        const idol: Idol = {
          ...newIdol,
          id,
          vote_count: 0,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ idols: [idol, ...state.idols] }));
      },

      updateIdol: (id, updates) => {
        set((state) => ({
          idols: state.idols.map((idol) => (idol.id === id ? { ...idol, ...updates } : idol)),
        }));
      },

      deleteIdol: (id) => {
        set((state) => ({
          idols: state.idols.filter((idol) => idol.id !== id),
        }));
      },

      addBattle: (newBattle) => {
        const battle: Battle = {
          ...newBattle,
          id: "battle-" + Date.now(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ battles: [battle, ...state.battles] }));
      },

      updateBattle: (id, updates) => {
        set((state) => ({
          battles: state.battles.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      addCollab: (newCollab) => {
        const collab: Collab = {
          ...newCollab,
          id: "collab-" + Date.now(),
          pledge_count: 0,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ collabs: [collab, ...state.collabs] }));
      },

      pledgeCollab: (collabId) => {
        set((state) => ({
          collabs: state.collabs.map((c) =>
            c.id === collabId ? { ...c, pledge_count: c.pledge_count + 1 } : c
          ),
        }));
      },

      addProduct: (newProd) => {
        const product: Product = {
          ...newProd,
          id: "prod-" + Date.now(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ products: [product, ...state.products] }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      addContactMessage: (msg) => {
        const newMsg: ContactMessage = {
          ...msg,
          id: "msg-" + Date.now(),
          status: "unread",
          reply_content: null,
          replied_at: null,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ messages: [newMsg, ...state.messages] }));
      },

      replyContactMessage: (id, replyContent) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "replied",
                  reply_content: replyContent,
                  replied_at: new Date().toISOString(),
                }
              : m
          ),
        }));
      },

      addEvent: (newEvent) => {
        const event: EventData = {
          ...newEvent,
          id: "evt-" + Date.now(),
        };
        set((state) => ({ events: [event, ...state.events] }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      duplicateEvent: (id) => {
        set((state) => {
          const target = state.events.find((e) => e.id === id);
          if (!target) return state;
          const copy: EventData = {
            ...target,
            id: `evt-copy-${Date.now()}`,
            title: `${target.title} (副本)`,
          };
          return { events: [copy, ...state.events] };
        });
      },
    }),
    {
      name: "oshipulse_local_storage_v10",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        isSoundEnabled: state.isSoundEnabled,
        isVibrationEnabled: state.isVibrationEnabled,
        currentUserRole: state.currentUserRole,
        bonusVotes: state.bonusVotes,
        idols: state.idols,
        battles: state.battles,
        collabs: state.collabs,
        products: state.products,
        messages: state.messages,
        events: state.events,
        members: state.members,
        currentMember: state.currentMember,
        dailyMissions: state.dailyMissions,
        hasClaimedDailyBonus: state.hasClaimedDailyBonus,
        dailyGrandRewardClaimed: state.dailyGrandRewardClaimed,
        dailyStreak: state.dailyStreak,
        personalityType: state.personalityType,
      }),
      // 當本機儲存資料載入時，自動清除廢棄團體 ID 並補齊最新 solo 動漫角色與預設活動
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.idols) {
            const validInitialIds = new Set(INITIAL_IDOLS.map((i) => i.id));
            // 濾除已被 purge 的舊動漫打包條目
            state.idols = state.idols.filter((i) => validInitialIds.has(i.id));

            const existingIds = new Set(state.idols.map((i) => i.id));
            const missing = INITIAL_IDOLS.filter((i) => !existingIds.has(i.id));
            if (missing.length > 0) {
              state.idols = [...state.idols, ...missing].sort((a, b) => b.vote_count - a.vote_count);
            }
          }
          if (!state.events || state.events.length === 0) {
            state.events = INITIAL_EVENTS;
          }
          if (!state.members || state.members.length === 0) {
            state.members = INITIAL_PROFILES;
          }
          if (state.currentMember === undefined) {
            state.currentMember = INITIAL_PROFILES[0];
          }
        }
      },
    }
  )
);
