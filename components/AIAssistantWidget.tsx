"use client";

import React, { useState, useRef, useEffect } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Send, User, ChevronRight, MessageSquare, Flame, Lightbulb, ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  suggestedSlug?: string;
  suggestedName?: string;
}

const PRESET_PROMPTS = [
  { label: "五條悟的名場面與領域", query: "五條悟在涉谷與高專的最強高光戰績是什麼？" },
  { label: "哆啦A夢的奇蹟法寶", query: "哆啦A夢最神祕的法寶與最感人的篇章是什麼？" },
  { label: "=LOVE 的入坑神曲推薦", query: "=LOVE (等愛) 最推薦的新人入坑神曲與魅力？" },
  { label: "奇犽的神速暗殺絕技", query: "奇犽·揍敵客的念能力神速與性格轉變？" },
  { label: "闇遊戲的法老王決鬥魂", query: "闇遊戲 (亞圖姆) 的法老王身世與經典決鬥？" },
  { label: "兩面宿儺的特級領域", query: "兩面宿儺的伏魔御廚子與詛咒之王威能有多強？" },
];

// 本地 Lore 知識庫對答引擎（純前端離線運行，100% 繁體中文）
function generateLocalLoreResponse(input: string): { text: string; slug?: string; name?: string } {
  const query = input.toLowerCase();

  if (query.includes("五條") || query.includes("悟") || query.includes("無量空處") || query.includes("咒術")) {
    return {
      text: "【現代最強咒術師 · 五條悟】情報檔案解鎖：\n\n作為特級咒術師與六眼擁有者，五條老師將「無下限術式」開發至神之境界！其領域「無量空處」能將無限的情報強行灌入對手大腦使其失去知覺。在涉谷事變中以 0.2 秒領域展開展現驚人的精準度。\n\n「放心吧，因為老子是最強的！」——立刻前往應援專區，為五條老師注入無盡咒力吧！",
      slug: "char-gojo-satoru",
      name: "五條悟",
    };
  }

  if (query.includes("哆啦") || query.includes("銅鑼燒") || query.includes("百寶袋") || query.includes("任意門") || query.includes("大雄")) {
    return {
      text: "【22世紀貓型機器人 · 哆啦A夢】情懷紀錄：\n\n四次元百寶袋中擁有無數充滿浪漫想像的秘密道具：時光機、竹蜻蜓、如果電話亭與謊言800。而在《哆啦A夢大長篇》與《伴我同行》中，他與大雄跨越時空的羈絆感動了全球數世代觀眾。\n\n「如果累了，就拿出任意門，去看看最想見的人吧！」——快來為童年守護神送上最甜的應援吧！",
      slug: "char-doraemon",
      name: "哆啦A夢",
    };
  }

  if (query.includes("等愛") || query.includes("equal") || query.includes("指原") || query.includes("佐佐木") || query.includes("野口")) {
    return {
      text: "【指原莉乃操刀王道女團 · =LOVE】閃耀導覽：\n\n由指原莉乃精準填詞並打造的正統聲優偶像團體。神曲《あの子コンプレックス (那個女孩的自卑情結)》深刻刻劃少女幽微心境；《青春“サブリミナル”》更被譽為日系王道偶像的青春天花板！成員各個歌喉全開、現場表現力爆棚。\n\n「那份不甘與閃爍的淚光，終將化作聚光燈下的永恆之歌。」——歡迎加入等愛應援團！",
      slug: "idol-equallove",
      name: "=LOVE (等愛)",
    };
  }

  if (query.includes("奇犽") || query.includes("揍敵客") || query.includes("小傑") || query.includes("神速") || query.includes("雷")) {
    return {
      text: "【揍敵客家族天賦奇才 · 奇犽】戰力分析：\n\n將變化系念能力與自幼淬鍊的暗殺格鬥技完美融合，開創超音速戰鬥型態「神速（電光石火 / 疾風迅雷）」。從小傑身邊的冷酷少年，蛻變為願意賭上性命守護阿路加的溫柔哥哥，性格弧光感動無數獵人粉！\n\n「如果那是小傑的願望，我就一定會陪他走到底！」——快來為銀髮雷神點亮應援燈號！",
      slug: "char-killua-zoldyck",
      name: "奇犽·揍敵客",
    };
  }

  if (query.includes("遊戲") || query.includes("亞圖姆") || query.includes("法老") || query.includes("黑魔導") || query.includes("決鬥")) {
    return {
      text: "【無名法老王 · 闇遊戲 (亞圖姆)】霸氣回顧：\n\n手握千年積木沉睡三千年的古埃及法老王！與夥伴武藤遊戲共同經歷死鬥，以黑魔導、歐西里斯天空龍與「相信卡片的羈絆」創造無數神抽逆轉神話。冥界告別決鬥更被奉為少年漫畫的終極殿堂名作。\n\n「抽牌！我賭上身為決鬥者的靈魂！」——快把神聖一票獻給決鬥之王！",
      slug: "char-yugi-atem",
      name: "闇遊戲 (亞圖姆)",
    };
  }

  if (query.includes("宿儺") || query.includes("兩面宿儺") || query.includes("伏魔御廚子") || query.includes("斬擊") || query.includes("手指")) {
    return {
      text: "【千年前詛咒之頂點 · 兩面宿儺】震懾檔案：\n\n生於平安時代的傳奇詛咒之王，擁有毀天滅地的術式「解」與「捌」。其領域「伏魔御廚子」不封閉結界，直接將周遭半徑二百米化為碎屑修羅場，傲然睥睨眾生，為絕對力量的至高化身！\n\n「跪下吧，雜魚。能得見我之一眼，已是你此生的無上榮幸。」——敢挑戰詛咒之王就來投票吧！",
      slug: "char-ryomen-sukuna",
      name: "兩面宿儺",
    };
  }

  if (query.includes("芙莉蓮") || query.includes("葬送") || query.includes("欣梅爾") || query.includes("魔法")) {
    return {
      text: "【千年魔法使 · 芙莉蓮】時光低語：\n\n擊敗魔王的勇者小隊成員，活過千年的精靈。在勇者欣梅爾離世後踏上「了解人類」的巡禮之旅，擅長收集各種冷門有趣的民間魔法。那份細水長流的溫柔，直擊心靈最柔軟的角落。\n\n「欣梅爾，我現在好像更明白你的心情了。」——為安靜守候的精靈精緻應援！",
      slug: "char-frieren",
      name: "芙莉蓮",
    };
  }

  // 預設通用智慧回覆
  return {
    text: `收到你的應援探索請求！身為 OshiPulse 的專屬 AI 夥伴，我隨時掌握全宇宙動漫豪傑、2.5D 企劃與跨國王道偶像的即時戰報與深層傳記。\n\n你可以嘗試詢問五條悟、哆啦A夢、奇犽、闇遊戲、=LOVE、芙莉蓮等經典角色的招式秘密與入坑指南，或者前往「每日任務中心」與「拔河擂台」為你的靈魂本命注入最強聲量！`,
  };
}

export default function AIAssistantWidget() {
  const { isAIAssistantOpen, openAIAssistant, closeAIAssistant } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "你好！我是 OshiPulse 的專屬 AI 應援助手「小光」✨。無論是想了解本命高光歷史、招牌絕技，或是獲取推坑神曲，我都能隨時為你解答！請點擊下方快捷問題，或直接打字向我提問吧！",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAIAssistantOpen) {
      scrollToBottom();
    }
  }, [messages, isAIAssistantOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateLocalLoreResponse(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.text,
        suggestedSlug: response.slug,
        suggestedName: response.name,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      soundEngine.playBubblePop();
    }, 450);
  };

  return (
    <>
      {/* 懸浮發光按鈕（桌面端與行動端均可點擊） */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openAIAssistant}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-cyber-purple via-indigo-600 to-cyber-rose text-white shadow-xl shadow-purple-500/25 border border-white/20 flex items-center gap-2 cursor-pointer hover:shadow-purple-500/40 transition-all"
        aria-label="打開 AI 應援助手"
      >
        <Bot className="w-5 h-5 text-amber-300" />
        <span className="text-xs font-black tracking-wide hidden sm:inline">
          AI 應援助手
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </motion.button>

      {/* 智慧對話抽屜 */}
      <AnimatePresence>
        {isAIAssistantOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* 遮罩背景 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAIAssistant}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* 右側滑出抽屜卡片 */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10"
            >
              {/* 抽屜頂部 */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-rose-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-purple to-cyber-rose flex items-center justify-center text-white shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span>小光 · AI 應援智囊</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        在線
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      100% 本機純前端 Lore 推論知識庫
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeAIAssistant}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 快捷推薦氣泡欄 */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 overflow-x-auto flex gap-2 no-scrollbar">
                {PRESET_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-cyber-purple text-xs text-slate-700 whitespace-nowrap shrink-0 transition-all hover:text-cyber-purple flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* 聊天訊息流 */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAi ? "items-start" : "items-end justify-end"}`}
                    >
                      {isAi && (
                        <div className="w-7 h-7 rounded-lg bg-cyber-purple/10 text-cyber-purple flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}

                      <div className="space-y-2 max-w-[82%]">
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            isAi
                              ? "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/60"
                              : "bg-gradient-to-r from-cyber-purple to-cyber-rose text-white rounded-tr-sm shadow-sm"
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* 本命專屬跳轉捷徑 */}
                        {msg.suggestedSlug && (
                          <Link
                            href={`/idols/${msg.suggestedSlug}`}
                            onClick={closeAIAssistant}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-black text-cyber-purple hover:bg-purple-100 transition-all"
                          >
                            <span>前往 {msg.suggestedName} 專屬頁面應援</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <span className="w-2 h-2 rounded-full bg-cyber-purple animate-ping" />
                    <span>小光正在檢索本命檔案庫...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 底部輸入列 */}
              <div className="p-3 border-t border-slate-100 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="輸入想詢問的偶像、動漫角色或名場面..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-cyber-purple focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-slate-900 text-white disabled:opacity-40 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
