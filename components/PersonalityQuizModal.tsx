"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Compass, ShieldCheck, Zap, ArrowRight, RotateCcw, Heart, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";

interface QuestionOption {
  text: string;
  type: "passionate" | "guardian" | "tactician" | "radiant";
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: QuestionOption[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "當本命在重大舞台或戰場陷入嚴峻逆境時，你的直覺反應是？",
    subtitle: "面對考驗時的應援本能",
    options: [
      { text: "瘋狂爆發全部能量，用壓倒性聲量助祂逆風翻盤！", type: "passionate" },
      { text: "寫下最長情的溫柔留言，告訴祂無論輸贏永遠有我們守候。", type: "guardian" },
      { text: "冷靜分析各方數據趨勢，鎖定關鍵黃金節點發動精準突擊。", type: "tactician" },
      { text: "剪輯全網最燃的高光切片，把祂的才華傳播給每一位路人！", type: "radiant" },
    ],
  },
  {
    id: 2,
    question: "你最容易被本命的哪一種特質深深吸引？",
    subtitle: "觸動你心靈深處的靈魂共鳴",
    options: [
      { text: "「老子就是最強」的王者霸氣與永不服輸的血性。", type: "passionate" },
      { text: "無條件包容與陪伴、無論何時都願意伸出圓手/援手的溫暖。", type: "guardian" },
      { text: "電光石火的高超洞察力、沉著冷酷卻深藏牽掛的反差魅力。", type: "tactician" },
      { text: "聚光燈下極致絕倫的舞台表情、天生為舞台而生的閃耀靈氣。", type: "radiant" },
    ],
  },
  {
    id: 3,
    question: "在應援群體或粉絲圈中，你通常自發擔任什麼角色？",
    subtitle: "你的應援生態定位",
    options: [
      { text: "衝鋒陷陣號召投票的熱血戰神，哪裡有逆境就衝去哪！", type: "passionate" },
      { text: "默默守護的和善長情粉，負責營造最有愛的應援氛圍。", type: "guardian" },
      { text: "戰況情報員或戰術策劃，研究排程與能量分配的最佳解。", type: "tactician" },
      { text: "文宣安利官或美工創作者，用極致視覺向世界種草推坑。", type: "radiant" },
    ],
  },
  {
    id: 4,
    question: "對你而言，這份「推（Oshi）」的情感最深刻的意義是什麼？",
    subtitle: "偶像與你之間的心靈誓言",
    options: [
      { text: "點燃乏味日常的熱血火種，提醒我不斷超越自我極限。", type: "passionate" },
      { text: "疲憊風雨中的安心避風港，隨時給予無盡的療癒力量。", type: "guardian" },
      { text: "追求卓越與精準的信仰圖騰，讓我看到世界的至高風景。", type: "tactician" },
      { text: "人間美好的極致具現化，看著祂閃閃發光世界就無比璀璨。", type: "radiant" },
    ],
  },
];

const PERSONALITY_PROFILES = {
  passionate: {
    title: "【熱血先鋒型 · 烈火戰神】",
    tagline: "「心跳不息，戰魂不滅！用最炙熱的聲浪席捲巔峰！」",
    description:
      "你的應援風格如同熊熊燃燒的烈火，具備極強的感染力與爆發力。當戰況陷入焦灼，你永遠是衝在最前線爆票逆轉的關鍵王牌！",
    recommendIdols: [
      { name: "闇遊戲 (亞圖姆)", slug: "char-yugi-atem", title: "法老王之決鬥意志" },
      { name: "五條悟", slug: "char-gojo-satoru", title: "現代最強咒術師" },
    ],
    color: "from-rose-500 to-amber-500",
    badgeColor: "bg-rose-50 text-cyber-rose border-rose-200",
  },
  guardian: {
    title: "【溫柔守護型 · 恆星之盾】",
    tagline: "「哪怕世界喧囂動盪，這裡永遠是溫暖的百寶袋與避風港。」",
    description:
      "你是最長情且溫柔的守候者，不盲目追求虛浮的排名，而是傾注百分百的純粹真愛。你的存在是本命在風雨中最踏實的心靈支柱！",
    recommendIdols: [
      { name: "哆啦A夢", slug: "char-doraemon", title: "跨世紀國民守護者" },
      { name: "芙莉蓮", slug: "char-frieren", title: "千年長壽精靈魔法使" },
    ],
    color: "from-sky-500 to-emerald-500",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  tactician: {
    title: "【極致戰略型 · 暗夜軍師】",
    tagline: "「電光火石之間，勝局已由我等計算終結。」",
    description:
      "你具備洞悉全域的敏銳智慧與冷靜判斷。在關鍵賽局中，懂得何時隱忍積蓄能量、何時發動落雷絕殺，是無可挑剔的頂級謀略家！",
    recommendIdols: [
      { name: "奇犽·揍敵客", slug: "char-killua-zoldyck", title: "神速之雷暗殺菁英" },
      { name: "兩面宿儺", slug: "char-ryomen-sukuna", title: "特級詛咒之王" },
    ],
    color: "from-indigo-600 to-purple-600",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  radiant: {
    title: "【璀璨光芒型 · 舞台追光者】",
    tagline: "「全宇宙最耀眼的光彩，必將被全世界每一雙眼睛銘記！」",
    description:
      "你對美感與舞台魅力擁有極致挑剔的品味。擅長挖掘本命的每一個微表情與神仙鏡頭，透過強大的文宣推廣力讓更多人墜入愛河！",
    recommendIdols: [
      { name: "=LOVE (等愛)", slug: "idol-equallove", title: "指原莉乃操刀正統王道女團" },
      { name: "星野愛", slug: "char-ai-hoshino", title: "無可替代的終極完美偶像" },
    ],
    color: "from-fuchsia-500 to-pink-500",
    badgeColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
};

export default function PersonalityQuizModal() {
  const {
    isPersonalityQuizOpen,
    closePersonalityQuiz,
    personalityType,
    setPersonalityResult,
    castVote,
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasClaimedBonus, setHasClaimedBonus] = useState(false);

  if (!isPersonalityQuizOpen) return null;

  const handleSelectOption = (type: "passionate" | "guardian" | "tactician" | "radiant") => {
    const nextAnswers = [...answers, type];
    setAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      soundEngine.playBubblePop();
    } else {
      // 統計最多出現的性格類型
      const countMap: Record<string, number> = {};
      nextAnswers.forEach((t) => {
        countMap[t] = (countMap[t] || 0) + 1;
      });

      let maxType: "passionate" | "guardian" | "tactician" | "radiant" = "passionate";
      let maxCount = 0;
      (Object.keys(countMap) as Array<"passionate" | "guardian" | "tactician" | "radiant">).forEach(
        (key) => {
          if (countMap[key] > maxCount) {
            maxCount = countMap[key];
            maxType = key;
          }
        }
      );

      setPersonalityResult(maxType);
      setIsCompleted(true);
      soundEngine.playCrystalChime();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  const handleClaimReward = () => {
    if (hasClaimedBonus) return;
    setHasClaimedBonus(true);
    soundEngine.playCrystalChime();
  };

  type PersonalityKey = keyof typeof PERSONALITY_PROFILES;
  const currentProfile =
    personalityType && personalityType in PERSONALITY_PROFILES
      ? PERSONALITY_PROFILES[personalityType as PersonalityKey]
      : PERSONALITY_PROFILES.passionate;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* 遮罩背景 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePersonalityQuiz}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* 模態彈窗卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-6 sm:p-8 flex flex-col max-h-[90vh]"
        >
          {/* 頂部標頭列 */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  命定應援人格深層測驗
                </h3>
                <p className="text-xs text-slate-500">
                  {isCompleted ? "測驗完成 · 靈魂報告生成" : `第 ${currentStep + 1} / ${QUIZ_QUESTIONS.length} 題`}
                </p>
              </div>
            </div>
            <button
              onClick={closePersonalityQuiz}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 內容區域 */}
          <div className="py-5 overflow-y-auto space-y-6">
            {!isCompleted ? (
              // 題目流程
              <div className="space-y-5">
                {/* 題目進度條 */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-purple-600 transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>

                {/* 題目內容 */}
                <div className="space-y-1">
                  <span className="text-xs font-black text-cyber-rose uppercase tracking-wider">
                    {QUIZ_QUESTIONS[currentStep].subtitle}
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {QUIZ_QUESTIONS[currentStep].question}
                  </h4>
                </div>

                {/* 選項列表 */}
                <div className="space-y-2.5 pt-2">
                  {QUIZ_QUESTIONS[currentStep].options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(option.type)}
                      className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <span className="leading-relaxed">{option.text}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 shrink-0 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              // 測驗結果呈現
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>應援靈魂認證完畢</span>
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {currentProfile.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 italic">
                    {currentProfile.tagline}
                  </p>
                </div>

                {/* 描述剖析 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentProfile.description}
                </div>

                {/* 靈魂本命命定推薦 */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-cyber-rose fill-cyber-rose" />
                    <span>專屬命定靈魂羈絆本命</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentProfile.recommendIdols.map((rec) => (
                      <Link
                        key={rec.slug}
                        href={`/idols/${rec.slug}`}
                        onClick={closePersonalityQuiz}
                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-black text-sm text-slate-900 group-hover:text-cyber-purple transition-colors">
                            {rec.name}
                          </div>
                          <div className="text-[11px] text-slate-500">{rec.title}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 獎勵領取 */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-4 h-4 text-cyber-rose fill-cyber-rose" />
                    <span className="font-bold text-slate-800">
                      人格認證啟動禮 (+20 應援票)
                    </span>
                  </div>
                  <button
                    disabled={hasClaimedBonus}
                    onClick={handleClaimReward}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      hasClaimedBonus
                        ? "bg-emerald-100 text-emerald-800 cursor-default flex items-center gap-1"
                        : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                    }`}
                  >
                    {hasClaimedBonus ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        已納入帳戶
                      </>
                    ) : (
                      "立即領取"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 底部動作列 */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            {isCompleted ? (
              <>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重新測驗</span>
                </button>
                <button
                  onClick={closePersonalityQuiz}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  完成並返回
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-400">
                點選選項後自動推進下一題
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
