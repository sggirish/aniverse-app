"use client";
import { useState, useEffect, useRef } from "react";
import { Leaderboard } from "@/components/ui/leaderboard";
import type { LeaderboardEntry } from "@/lib/games";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

type Difficulty = "easy" | "medium" | "hard";

interface CipherRound {
  mal_id: number;
  correct: string;
  scrambled: string;
  options: string[];
  genres: string[];
}

const DIFF_CONFIG = {
  easy:   { label: "Easy",   color: "#16A34A", bg: "bg-green-50",  border: "border-green-400",  points: 50,  desc: "3 choices, fewer redactions" },
  medium: { label: "Medium", color: "#D97706", bg: "bg-amber-50",  border: "border-amber-400",  points: 100, desc: "4 choices, more redactions" },
  hard:   { label: "Hard",   color: "#DC2626", bg: "bg-red-50",    border: "border-red-400",    points: 200, desc: "5 choices, rephrased sentences" },
};

export default function CipherPage() {
  const [phase, setPhase] = useState<"menu" | "loading" | "playing" | "result">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [rounds, setRounds] = useState<CipherRound[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [roundStart, setRoundStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rank, setRank] = useState<{ rank: number; total: number; percentile: number } | null>(null);
  const sessionId = useRef(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg = DIFF_CONFIG[difficulty];

  // Live timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, startTime]);

  const startGame = async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/cipher?difficulty=${difficulty}`);
      const data = await res.json();
      setRounds(data.challenge ?? []);
      setRoundIdx(0);
      setChosen(null);
      setScore(0);
      setCorrect(0);
      const now = Date.now();
      setStartTime(now);
      setRoundStart(now);
      setElapsed(0);
      setPhase("playing");
    } catch {
      setPhase("menu");
    }
  };

  const pick = (option: string) => {
    if (chosen !== null) return;
    const round = rounds[roundIdx];
    const isCorrect = option === round.correct;
    const timeTaken = Math.max(1, Math.round((Date.now() - roundStart) / 1000));
    const speedBonus = Math.max(0, 30 - timeTaken);
    const points = isCorrect ? DIFF_CONFIG[difficulty].points + speedBonus : 0;

    setChosen(option);
    if (isCorrect) {
      setScore(s => s + points);
      setCorrect(c => c + 1);
    }

    setTimeout(() => {
      if (roundIdx + 1 >= rounds.length) {
        setPhase("result");
        submitResult(score + points, isCorrect ? correct + 1 : correct);
      } else {
        setRoundIdx(i => i + 1);
        setChosen(null);
        setRoundStart(Date.now());
      }
    }, 1400);
  };

  const submitResult = async (finalScore: number, finalCorrect: number) => {
    const timeSecs = Math.floor((Date.now() - startTime) / 1000);
    try {
      const res = await fetch("/api/cipher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "score", session_id: sessionId.current,
          score: finalScore, correct: finalCorrect, total: rounds.length, time_seconds: timeSecs,
        }),
      });
      const data = await res.json();
      setRank(data.rank);
      setLeaderboard(data.leaderboard ?? []);
      window.plausible?.("tool_used", { props: { tool: "cipher", difficulty } });
    } catch { /* silent */ }
  };

  const round = rounds[roundIdx];
  const totalRounds = rounds.length;
  const accuracy = roundIdx > 0 ? Math.round((correct / roundIdx) * 100) : 0;

  // ── Menu ──────────────────────────────────────────────────────────────────

  if (phase === "menu") {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">🔐</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] block">Synopsis Cipher</span>
                <span className="text-xs text-[#9CA3AF]">AI-scrambled guessing game</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
              Decode the synopsis.<br /><span className="text-[#D97706]">Name the anime.</span>
            </h1>
            <p className="text-[#6B7280] text-base max-w-sm">
              AI scrambles anime synopses — removes key words, rephrases sentences. Can you still identify the anime? Speed counts.
            </p>
          </div>

          <div className="mb-6 animate-fade-in-up stagger-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-3">Difficulty</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(DIFF_CONFIG) as [Difficulty, typeof DIFF_CONFIG.easy][]).map(([d, c]) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    difficulty === d ? `${c.bg} ${c.border}` : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}>
                  <p className={`text-sm font-black ${difficulty === d ? "" : "text-[#374151]"}`} style={{ color: difficulty === d ? c.color : undefined }}>{c.label}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">{c.desc}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: c.color }}>+{c.points} pts</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-[#374151] animate-fade-in-up stagger-2">
            <p className="font-bold text-[#D97706] mb-1">How it works</p>
            <p className="text-xs text-[#6B7280]">Read 5 AI-scrambled synopses and identify the anime from multiple choices. Faster correct answers = more bonus points. Same challenge for everyone today — compete on the leaderboard!</p>
          </div>

          <button onClick={startGame}
            className="w-full py-4 font-black text-lg text-white rounded-2xl transition-colors animate-fade-in-up stagger-3"
            style={{ background: cfg.color }}>
            Start Cipher 🔐
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
          <svg className="animate-spin w-10 h-10 mx-auto" style={{ color: cfg.color }} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
          <p className="font-bold text-[#374151]">AI scrambling synopses…</p>
          <p className="text-xs text-[#9CA3AF]">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  if (phase === "playing" && round) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-xl mx-auto px-4 py-8">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#6B7280]">{roundIdx + 1}/{totalRounds}</span>
              <div className="px-3 py-1 rounded-full text-xs font-black" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                {score} pts
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9CA3AF]">⏱</span>
              <span className="text-sm font-black text-[#374151]">{elapsed}s</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#F3F4F6] rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${((roundIdx) / totalRounds) * 100}%`, background: cfg.color }} />
          </div>

          {/* Scrambled synopsis */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Scrambled Synopsis</p>
            <p className="text-sm leading-relaxed text-[#374151]">
              {round.scrambled.split(/(\[\?\?\?\])/g).map((part, i) =>
                part === "[???]"
                  ? <span key={i} className="inline-block bg-[#F3F4F6] text-[#9CA3AF] px-2 py-0.5 rounded font-bold text-xs mx-0.5">???</span>
                  : <span key={i}>{part}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {round.genres.map(g => (
                <span key={g} className="text-[9px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {round.options.map((option) => {
              const isChosen = chosen === option;
              const isCorrect = option === round.correct;
              let style = "bg-white border-[#E5E7EB] text-[#374151]";
              if (chosen !== null) {
                if (isCorrect) style = "bg-green-50 border-green-400 text-green-800";
                else if (isChosen) style = "bg-red-50 border-red-300 text-red-700";
                else style = "bg-white border-[#F3F4F6] text-[#9CA3AF]";
              }
              return (
                <button key={option}
                  onClick={() => pick(option)}
                  disabled={chosen !== null}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${style} ${
                    chosen === null ? "hover:border-[#D1D5DB] hover:bg-[#F9F9F9] active:scale-[0.98]" : "cursor-default"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {chosen !== null && isCorrect && <span>✅</span>}
                    {chosen !== null && isChosen && !isCorrect && <span>❌</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────

  const finalTime = elapsed;
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-xl mx-auto px-4 py-12">

        <div className="text-center mb-8 animate-bounce-in">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: cfg.color }}>Cipher Complete!</p>
          <div className="text-6xl font-black mb-1" style={{ color: cfg.color }}>{score}</div>
          <p className="text-sm text-[#6B7280]">{correct}/{totalRounds} correct · {accuracy}% accuracy · {finalTime}s</p>
          {rank && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold"
              style={{ background: `${cfg.color}10`, borderColor: `${cfg.color}40`, color: cfg.color }}>
              #{rank.rank} of {rank.total} · Beat {rank.percentile}%
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-4">
          <p className="text-sm font-black mb-3">Challenge friends 🔐</p>
          <button
            onClick={() => navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/cipher`)}
            className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
            style={{ background: cfg.color }}>
            📋 Copy link — beat my {score} pts on {cfg.label}!
          </button>
        </div>

        {leaderboard.length > 0 && (
          <div className="mb-4">
            <Leaderboard entries={leaderboard} mySessionId={sessionId.current} label="🏆 Leaderboard" showAccuracy showTime />
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
