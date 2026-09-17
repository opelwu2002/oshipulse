"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Gift, Sparkles, Zap, Award, Flame, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useAppStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";

const getMissionIcon = (id: string) => {
  switch (id) {
    case "mission-music":
    case "listen-audio":
      return "🎧";
    case "mission-vote":
    case "cast-vote":
      return "🗳️";
    case "mission-cheer":
    case "leave-comment":
      return "💌";
    case "mission-share":
    case "share-platform":
      return "🚀";
    default:
      return "✨";
  }
};

export default function MissionCenter() {
  const {
    dailyMissions,
    toggleMission,
    claimDailyGrandReward,
    dailyGrandRewardClaimed,
    dailyStreak,
  } = useAppStore();

  const completedCount = dailyMissions.filter((m) => m.completed).length;
  const allCompleted = completedCount === dailyMissions.length;
  const progressPercent = Math.round((completedCount / dailyMissions.length) * 100);

  const handleClaimGrandReward = () => {
    if (!allCompleted || dailyGrandRewardClaimed) return;
    claimDailyGrandReward();
    soundEngine.playCrystalChime();

    // 觸發彩帶雨特效
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#F43F5E", "#8B5CF6", "#F59E0B", "#10B981"],
    });
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleMission(id);
    if (!currentlyCompleted) {
      soundEngine.playBubblePop();
    }
  };

  return (
    <section
      id="mission-center"
      className="rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* 標題與每日連擊徽章 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-black text-cyber-rose">
            <Award className="w-3.5 h-3.5" />
            <span>粉絲日常修煉所</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            每日應援任務中心
            <span className="text-sm font-semibold text-slate-500 font-mono">
              ({completedCount}/{dailyMissions.length})
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            完成每日例行應援即可積累大量能量票，助你本命攻頂冠軍殿堂！
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 連續打卡徽章 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs shadow-sm">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>已連續應援</span>
            <span className="text-base font-black text-amber-600 font-mono">
              {dailyStreak}
            </span>
            <span>天</span>
          </div>
        </div>
      </div>

      {/* 總體進度條 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>今日進度達成率</span>
          <span className="text-cyber-purple font-mono font-black">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyber-purple via-cyber-rose to-cyber-gold"
          />
        </div>
      </div>

      {/* 4 大任務清單 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dailyMissions.map((mission) => {
          return (
            <motion.div
              key={mission.id}
              whileHover={{ y: -2 }}
              onClick={() => handleToggle(mission.id, mission.completed)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                mission.completed
                  ? "bg-emerald-50/50 border-emerald-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{getMissionIcon(mission.id)}</span>
                  {mission.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-black text-sm ${
                      mission.completed ? "text-emerald-900 line-through opacity-80" : "text-slate-900"
                    }`}
                  >
                    {mission.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {mission.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">獎勵</span>
                <span className="font-mono font-black text-cyber-rose flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-cyber-rose" />+{mission.rewardVotes} 票
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 全任務大滿貫解鎖獎勵箱 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border border-amber-200/80 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-black shrink-0 shadow-md">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2 text-slate-900">
              <span>五星大滿貫成就狂熱包</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h4>
            <p className="text-xs text-slate-600">
              完成上述全部 4 項日常應援任務，立即領取 +50 張神聖能量票！
            </p>
          </div>
        </div>

        <div>
          <button
            disabled={!allCompleted || dailyGrandRewardClaimed}
            onClick={handleClaimGrandReward}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              dailyGrandRewardClaimed
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : allCompleted
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:scale-105 shadow-md shadow-amber-500/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {dailyGrandRewardClaimed
                ? "今日已領取大滿貫"
                : allCompleted
                ? "立即解鎖 +50 能量票"
                : `還差 ${dailyMissions.length - completedCount} 項任務解鎖`}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
