"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Leaderboard } from "@/components/ui/leaderboard";
import type { LeaderboardEntry, DuelAnime } from "@/lib/games";
import Image from "next/image";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

type Metric = { id: string; label: string; desc: string; emoji: string; subjective?: boolean };

const METRICS: Metric[] = [
  { id: "score",   label: "Higher Score",   desc: "Which has the higher MAL score?",       emoji: "⭐" },
  { id: "popular", label: "More Popular",   desc: "Which has more MAL members?",            emoji: "👥" },
  { id: "longer",  label: "Longer Run",     desc: "Which has more episodes?",               emoji: "📺" },
  { id: "iconic",  label: "More Iconic",    desc: "Which is the more iconic landmark?",     emoji: "🏆", subjective: true },
  { id: "ending",  label: "Better Ending",  desc: "Which anime has the better ending?",     emoji: "🎭", subjective: true },
];

function getWinner(a: DuelAnime, b: DuelAnime, metric: string): "A" | "B" | null {
  if (metric === "score")   return a.score > b.score ? "A" : b.score > a.score ? "B" : null;
  if (metric === "popular") return a.members > b.members ? "A" : b.members > a.members ? "B" : null;
  if (metric === "longer")  return a.episodes > b.episodes ? "A" : b.episodes > a.episodes ? "B" : null;
  return null; // subjective — needs API call
}

const TIMER_SECONDS = 4;

interface Round {
  a: DuelAnime;
  b: DuelAnime;
  correctAnswer: "A" | "B" | null;
}

export default function DuelPage() {
  const [phase, setPhase] = useState<"menu" | "playing" | "result">("menu");
  const [metric, setMetric] = useState<Metric>(METRICS[0]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [chosen, setChosen] = useState<"A" | "B" | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rank, setRank] = useState<{ rank: number; total: number; percentile: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingVerdict, setFetchingVerdict] = useState(false);
  const sessionId = useRef(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verdictCache = useRef<Record<string, "A" | "B">>({});

  const TOTAL_ROUNDS = 10;

  // Pre-fetch pairs
  const loadRounds = useCallback(async () => {
    const pairs: Round[] = [];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const res = await fetch("/api/duel");
      const { a, b } = await res.json();
      pairs.push({ a, b, correctAnswer: getWinner(a, b, metric.id) });
    }
    setRounds(pairs);
  }, [metric]);

  // Resolve subjective verdict for current round
  const resolveVerdict = useCallback(async (round: Round) => {
    if (!metric.subjective) return;
    const key = `${metric.id}:${round.a.title}|${round.b.title}`;
    if (verdictCache.current[key]) return;
    setFetchingVerdict(true);
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verdict", titleA: round.a.title, titleB: round.b.title, metric: metric.id }),
      });
      const { winner } = await res.json();
      verdictCache.current[key] = winner;
      setRounds(prev => prev.map((r, i) => i === roundIdx ? { ...r, correctAnswer: winner } : r));
    } catch { /* best effort */ }
    setFetchingVerdict(false);
  }, [metric, roundIdx]);

  const startGame = useCallback(async () => {
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setRoundIdx(0);
    setChosen(null);
    setLastCorrect(null);
    await loadRounds();
    setPhase("playing");
  }, [loadRounds]);

  // Timer tick
  useEffect(() => {
    if (phase !== "playing" || chosen !== null) return;
    if (timer <= 0) {
      setChosen(null);
      setLastCorrect(false);
      setStreak(0);
      setTimeout(nextRound, 900);
      return;
    }
    timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timer, chosen]);

  useEffect(() => {
    if (phase === "playing" && chosen === null) {
      setTimer(TIMER_SECONDS);
    }
  }, [roundIdx, phase, chosen]);

  // Resolve subjective verdict when round changes
  useEffect(() => {
    if (phase !== "playing" || !rounds[roundIdx]) return;
    if (metric.subjective) resolveVerdict(rounds[roundIdx]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, phase]);

  const nextRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      setPhase("result");
      return;
    }
    setRoundIdx(i => i + 1);
    setChosen(null);
    setLastCorrect(null);
    setTimer(TIMER_SECONDS);
  }, [roundIdx]);

  const pick = useCallback((side: "A" | "B") => {
    if (chosen !== null || phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setChosen(side);
    const round = rounds[roundIdx];
    const answer = round?.correctAnswer;
    // If answer unknown (still fetching), be generous — give half points
    const isCorrect = answer == null ? null : side === answer;
    const timeFactor = timer / TIMER_SECONDS;
    const basePoints = 10;
    const speedBonus = Math.round(timeFactor * 5);
    const newStreak = isCorrect ? streak + 1 : 0;
    let points = 0;
    if (isCorrect === true) {
      points = basePoints + speedBonus + (newStreak >= 3 ? 5 : 0);
      setScore(s => s + points);
      setCorrect(c => c + 1);
    } else if (isCorrect === null) {
      points = 5;
      setScore(s => s + points);
    }
    setStreak(newStreak);
    setLastCorrect(isCorrect);
    setTimeout(nextRound, 1200);
  }, [chosen, phase, rounds, roundIdx, timer, streak, nextRound]);

  // Submit score on game end
  useEffect(() => {
    if (phase !== "result") return;
    (async () => {
      setSubmitting(true);
      try {
        const res = await fetch("/api/duel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "score", session_id: sessionId.current, score, rounds: TOTAL_ROUNDS, correct }),
        });
        const data = await res.json();
        setRank(data.rank);
        setLeaderboard(data.leaderboard ?? []);
        window.plausible?.("tool_used", { props: { tool: "duel", metric: metric.id } });
      } catch { /* silent */ }
      setSubmitting(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const round = rounds[roundIdx];
  const accuracy = correct > 0 ? Math.round((correct / roundIdx) * 100) : 0;

  // ── Menu ──────────────────────────────────────────────────────────────────

  if (phase === "menu") {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">⚔️</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] block">Anime Duelist</span>
                <span className="text-xs text-[#9CA3AF]">Speed prediction game</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
              Pick the winner.<br /><span className="text-[#8B5CF6]">Beat the clock.</span>
            </h1>
            <p className="text-[#6B7280] text-base max-w-sm">
              Two anime. One metric. {TIMER_SECONDS} seconds to decide. Get 10 rounds. Score high, beat the board.
            </p>
          </div>

          <div className="mb-6 animate-fade-in-up stagger-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-3">Choose your metric</p>
            <div className="grid grid-cols-1 gap-2">
              {METRICS.map((m) => (
                <button key={m.id} onClick={() => setMetric(m)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    metric.id === m.id
                      ? "border-[#8B5CF6] bg-purple-50"
                      : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                  }`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${metric.id === m.id ? "text-[#8B5CF6]" : "text-[#0F0F0F]"}`}>{m.label}</p>
                    <p className="text-xs text-[#9CA3AF]">{m.desc}</p>
                  </div>
                  {m.subjective && (
                    <span className="ml-auto text-[10px] font-bold text-[#8B5CF6] bg-purple-100 px-2 py-0.5 rounded-full shrink-0">AI Judge</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame}
            className="w-full py-4 bg-[#8B5CF6] text-white font-black text-lg rounded-2xl hover:bg-[#7C3AED] transition-colors animate-fade-in-up stagger-2">
            Start Duel ⚔️
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  if (phase === "playing" && round) {
    const timerPct = (timer / TIMER_SECONDS) * 100;
    const timerColor = timer <= 1 ? "#DC2626" : timer <= 2 ? "#D97706" : "#8B5CF6";

    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Header bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#6B7280]">{roundIdx + 1}/{TOTAL_ROUNDS}</span>
              <div className="flex items-center gap-1.5 bg-[#8B5CF6]/10 px-3 py-1 rounded-full">
                <span className="text-xs font-black text-[#8B5CF6]">{score}</span>
                <span className="text-[10px] text-[#8B5CF6]">pts</span>
              </div>
              {streak >= 3 && (
                <span className="text-xs font-bold text-orange-500 animate-pulse">🔥 {streak} streak</span>
              )}
            </div>
            <div className="text-xs font-bold text-[#6B7280] bg-white border border-[#E5E7EB] px-3 py-1 rounded-full">
              {metric.emoji} {metric.label}
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-2 bg-[#F3F4F6] rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${chosen ? 0 : timerPct}%`, background: timerColor }} />
          </div>

          {/* Question */}
          <p className="text-center text-sm font-bold text-[#374151] mb-5">
            {metric.desc}
            {fetchingVerdict && <span className="ml-2 text-[#9CA3AF] font-normal">AI deciding…</span>}
          </p>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {([["A", round.a], ["B", round.b]] as const).map(([side, anime]) => {
              const isChosen = chosen === side;
              const isWinner = chosen !== null && round.correctAnswer === side;
              const isLoser = chosen !== null && round.correctAnswer !== null && round.correctAnswer !== side;
              let cardBg = "bg-white border-[#E5E7EB]";
              if (isWinner) cardBg = "bg-green-50 border-green-400";
              else if (isLoser) cardBg = "bg-red-50 border-red-300";
              else if (isChosen && round.correctAnswer === null) cardBg = "bg-purple-50 border-[#8B5CF6]";

              return (
                <button key={side}
                  onClick={() => pick(side)}
                  disabled={chosen !== null}
                  className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left
                    ${cardBg}
                    ${chosen === null ? "hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer" : "cursor-default"}
                  `}>
                  <div className="relative w-full aspect-[2/3] bg-[#F3F4F6]">
                    <Image src={anime.image_url} alt={anime.title} fill className="object-cover" unoptimized />
                    {isWinner && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <span className="text-4xl">✅</span>
                      </div>
                    )}
                    {isLoser && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <span className="text-4xl">❌</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-black leading-tight text-[#0F0F0F] line-clamp-2">{anime.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {anime.genres.slice(0, 2).map(g => (
                        <span key={g} className="text-[9px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded-full">{g}</span>
                      ))}
                    </div>
                    {chosen !== null && (
                      <div className="mt-2 pt-2 border-t border-[#F3F4F6]">
                        {metric.id === "score" && <p className="text-xs font-bold text-[#374151]">⭐ {anime.score}</p>}
                        {metric.id === "popular" && <p className="text-xs font-bold text-[#374151]">👥 {anime.members.toLocaleString()}</p>}
                        {metric.id === "longer" && <p className="text-xs font-bold text-[#374151]">📺 {anime.episodes} eps</p>}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {chosen !== null && (
            <div className={`mt-4 text-center py-2 rounded-xl text-sm font-bold animate-scale-in ${
              lastCorrect === true ? "text-green-700 bg-green-50" :
              lastCorrect === false ? "text-red-700 bg-red-50" :
              "text-purple-700 bg-purple-50"
            }`}>
              {lastCorrect === true
                ? `✅ Correct! +${10 + Math.round((timer / TIMER_SECONDS) * 5) + (streak >= 3 ? 5 : 0)} pts`
                : lastCorrect === false
                  ? "❌ Wrong! No points"
                  : "⚡ AI still deciding — 5 pts"}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-xl mx-auto px-4 py-12">

        <div className="text-center mb-8 animate-bounce-in">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Game Over</p>
          <div className="text-6xl font-black text-[#8B5CF6] mb-1">{score}</div>
          <p className="text-sm text-[#6B7280]">points · {correct}/{TOTAL_ROUNDS} correct · {accuracy}% accuracy</p>
          {rank && (
            <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-full">
              <span className="text-sm font-bold text-[#8B5CF6]">
                #{rank.rank} of {rank.total} players · Beat {rank.percentile}%
              </span>
            </div>
          )}
        </div>

        {/* Share */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-4 animate-fade-in-up">
          <p className="text-sm font-black mb-3">Challenge a friend ⚔️</p>
          <button
            onClick={() => navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/duel`)}
            className="w-full py-3 bg-[#8B5CF6] text-white font-bold rounded-xl hover:bg-[#7C3AED] transition-colors text-sm">
            📋 Copy challenge link — can you beat {score} pts?
          </button>
        </div>

        {!submitting && leaderboard.length > 0 && (
          <div className="mb-4 animate-fade-in-up stagger-1">
            <Leaderboard entries={leaderboard} mySessionId={sessionId.current} label="🏆 Leaderboard" />
          </div>
        )}

        <button onClick={() => setPhase("menu")}
          className="w-full py-3 bg-[#111827] text-white font-bold rounded-xl hover:bg-[#1F2937] transition-colors text-sm animate-fade-in-up stagger-2">
          Play Again
        </button>
      </div>
    </div>
  );
}
