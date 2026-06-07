"use client";
import { useState, useEffect, useRef } from "react";
import { Leaderboard } from "@/components/ui/leaderboard";
import type { LeaderboardEntry } from "@/lib/games";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

type Verdict = "WATCH" | "SKIP" | "WAIT";

interface GuesserRound {
  mal_id: number;
  description: string;
  correct_verdict: Verdict;
  anime_title: string;
  genres: string[];
}

const VERDICT_CFG: Record<Verdict, { color: string; bg: string; border: string; icon: string; desc: string }> = {
  WATCH: { color: "#16A34A", bg: "bg-green-50",  border: "border-green-400", icon: "✅", desc: "Worth your time" },
  SKIP:  { color: "#DC2626", bg: "bg-red-50",    border: "border-red-400",   icon: "❌", desc: "Don't bother" },
  WAIT:  { color: "#D97706", bg: "bg-amber-50",  border: "border-amber-400", icon: "⏳", desc: "Only if you're bored" },
};

export default function GuesserPage() {
  const [phase, setPhase] = useState<"menu" | "loading" | "playing" | "result">("menu");
  const [rounds, setRounds] = useState<GuesserRound[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [chosen, setChosen] = useState<Verdict | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rank, setRank] = useState<{ rank: number; total: number; percentile: number } | null>(null);
  const sessionId = useRef(crypto.randomUUID());

  const TOTAL = 8;

  const startGame = async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/guesser?count=${TOTAL}`);
      const data = await res.json();
      setRounds(data.rounds ?? []);
      setRoundIdx(0);
      setChosen(null);
      setScore(0);
      setCorrect(0);
      setStreak(0);
      setPhase("playing");
    } catch {
      setPhase("menu");
    }
  };

  const pick = (verdict: Verdict) => {
    if (chosen !== null) return;
    const round = rounds[roundIdx];
    const isCorrect = verdict === round.correct_verdict;
    const newStreak = isCorrect ? streak + 1 : 0;
    const points = isCorrect ? 15 + (newStreak >= 3 ? 10 : 0) : 0;

    setChosen(verdict);
    if (isCorrect) {
      setScore(s => s + points);
      setCorrect(c => c + 1);
    }
    setStreak(newStreak);

    setTimeout(() => {
      if (roundIdx + 1 >= rounds.length) {
        setPhase("result");
        submitResult(score + points, isCorrect ? correct + 1 : correct);
      } else {
        setRoundIdx(i => i + 1);
        setChosen(null);
      }
    }, 1600);
  };

  const submitResult = async (finalScore: number, finalCorrect: number) => {
    try {
      const res = await fetch("/api/guesser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "score", session_id: sessionId.current,
          score: finalScore, correct: finalCorrect, total: rounds.length,
        }),
      });
      const data = await res.json();
      setRank(data.rank);
      setLeaderboard(data.leaderboard ?? []);
      window.plausible?.("tool_used", { props: { tool: "guesser" } });
    } catch { /* silent */ }
  };

  const round = rounds[roundIdx];
  const accuracy = roundIdx > 0 ? Math.round((correct / roundIdx) * 100) : 0;

  // ── Menu ──────────────────────────────────────────────────────────────────

  if (phase === "menu") {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">🎯</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#16A34A] block">Verdict Guesser</span>
                <span className="text-xs text-[#9CA3AF]">Predict the AI verdict</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
              Watch, Skip, or Wait?<br /><span className="text-[#16A34A]">You decide.</span>
            </h1>
            <p className="text-[#6B7280] text-base max-w-sm">
              Our AI writes a cryptic vibe description for an anime — no title, no spoilers. Predict the verdict: WATCH, SKIP, or WAIT. Score by accuracy.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up stagger-1">
            {(Object.entries(VERDICT_CFG) as [Verdict, typeof VERDICT_CFG.WATCH][]).map(([v, c]) => (
              <div key={v} className={`p-4 rounded-xl border-2 ${c.bg} ${c.border} text-center`}>
                <div className="text-2xl mb-1">{c.icon}</div>
                <p className="text-sm font-black" style={{ color: c.color }}>{v}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 p-4 bg-white border border-[#E5E7EB] rounded-xl text-sm animate-fade-in-up stagger-2">
            <p className="font-bold text-[#374151] mb-1">How to score</p>
            <ul className="text-xs text-[#6B7280] space-y-1">
              <li>✅ Correct verdict = <span className="font-bold text-[#374151]">+15 pts</span></li>
              <li>🔥 3-streak bonus = <span className="font-bold text-[#374151]">+10 pts extra</span></li>
              <li>📊 8 rounds · leaderboard by accuracy %</li>
            </ul>
          </div>

          <button onClick={startGame}
            className="w-full py-4 bg-[#16A34A] text-white font-black text-lg rounded-2xl hover:bg-[#15803D] transition-colors animate-fade-in-up stagger-3">
            Start Guessing 🎯
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin w-10 h-10 mx-auto text-[#16A34A]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
          <p className="font-bold text-[#374151]">Generating mystery descriptions…</p>
          <p className="text-xs text-[#9CA3AF]">Takes ~10 seconds</p>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  if (phase === "playing" && round) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-xl mx-auto px-4 py-8">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#6B7280]">{roundIdx + 1}/{TOTAL}</span>
              <div className="px-3 py-1 rounded-full bg-green-50 text-xs font-black text-[#16A34A]">
                {score} pts
              </div>
              {streak >= 3 && (
                <span className="text-xs font-bold text-orange-500 animate-pulse">🔥 {streak} streak</span>
              )}
            </div>
            <span className="text-xs text-[#9CA3AF]">{accuracy}% accuracy</span>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-[#F3F4F6] rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{ width: `${(roundIdx / TOTAL) * 100}%` }} />
          </div>

          {/* Description card */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Mystery Anime Description</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {round.genres.map(g => (
                <span key={g} className="text-[9px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
            <p className="text-base leading-relaxed text-[#1F1F1F]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
              &ldquo;{round.description}&rdquo;
            </p>

            {/* Reveal after guess */}
            {chosen && (
              <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                <p className="text-xs text-[#9CA3AF] mb-1">This was…</p>
                <p className="text-sm font-black text-[#0F0F0F]">{round.anime_title}</p>
                <p className="text-xs mt-1" style={{ color: VERDICT_CFG[round.correct_verdict].color }}>
                  {VERDICT_CFG[round.correct_verdict].icon} AI says: <strong>{round.correct_verdict}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Verdict buttons */}
          {!chosen ? (
            <div className="grid grid-cols-3 gap-3">
              {(["WATCH", "SKIP", "WAIT"] as Verdict[]).map((v) => {
                const c = VERDICT_CFG[v];
                return (
                  <button key={v} onClick={() => pick(v)}
                    className={`py-5 rounded-2xl border-2 font-black text-sm transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${c.bg} ${c.border}`}
                    style={{ color: c.color }}>
                    <div className="text-2xl mb-1">{c.icon}</div>
                    {v}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-4 rounded-2xl text-sm font-bold animate-scale-in border-2 ${
              chosen === round.correct_verdict
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-50 border-red-300 text-red-700"
            }`}>
              {chosen === round.correct_verdict
                ? `✅ Correct! +${15 + (streak >= 3 ? 10 : 0)} pts${streak >= 3 ? " 🔥 STREAK BONUS!" : ""}`
                : `❌ Wrong! AI said ${round.correct_verdict}`}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────

  const finalAccuracy = rounds.length > 0 ? Math.round((correct / rounds.length) * 100) : 0;
  const grade = finalAccuracy >= 80 ? { label: "Anime Oracle", emoji: "🔮" }
    : finalAccuracy >= 60 ? { label: "Sharp Eye", emoji: "👁️" }
    : finalAccuracy >= 40 ? { label: "Average Viewer", emoji: "📺" }
    : { label: "Just Guessing", emoji: "🎲" };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-xl mx-auto px-4 py-12">

        <div className="text-center mb-8 animate-bounce-in">
          <div className="text-4xl mb-2">{grade.emoji}</div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A] mb-2">{grade.label}</p>
          <div className="text-6xl font-black text-[#16A34A] mb-1">{score}</div>
          <p className="text-sm text-[#6B7280]">{correct}/{rounds.length} correct · {finalAccuracy}% accuracy</p>
          {rank && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
              <span className="text-sm font-bold text-[#16A34A]">#{rank.rank} of {rank.total} · Beat {rank.percentile}%</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-4">
          <p className="text-sm font-black mb-3">Challenge friends 🎯</p>
          <button
            onClick={() => navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/guesser`)}
            className="w-full py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors text-sm">
            📋 Copy link — beat my {finalAccuracy}% accuracy!
          </button>
        </div>

        {leaderboard.length > 0 && (
          <div className="mb-4">
            <Leaderboard entries={leaderboard} mySessionId={sessionId.current} label="🏆 Leaderboard" showAccuracy />
          </div>
        )}

        <button onClick={() => setPhase("menu")}
          className="w-full py-3 bg-[#111827] text-white font-bold rounded-xl hover:bg-[#1F2937] transition-colors text-sm">
          Play Again
        </button>
      </div>
    </div>
  );
}
