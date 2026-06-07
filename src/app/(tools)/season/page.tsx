"use client";
import { useEffect, useState } from "react";

interface SeasonAnime {
  title: string;
  genre: string;
  synopsis: string;
  verdict: "MUST_WATCH" | "WORTH_WATCHING" | "SKIP" | "WAIT_FOR_BATCH";
  hype_level: number;
  episodes?: number;
  weekly_score?: number;
}

interface SeasonResult {
  season: string;
  year: number;
  summary: string;
  top_pick: string;
  hidden_gem: string;
  anime: SeasonAnime[];
}

const VERDICT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  MUST_WATCH: { label: "Must Watch", color: "text-green-400", bg: "bg-green-900/20 border-green-500/40" },
  WORTH_WATCHING: { label: "Worth Watching", color: "text-blue-400", bg: "bg-blue-900/20 border-blue-500/40" },
  SKIP: { label: "Skip", color: "text-red-400", bg: "bg-red-900/20 border-red-500/40" },
  WAIT_FOR_BATCH: { label: "Wait for Batch", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-500/40" },
};

export default function SeasonPage() {
  const [result, setResult] = useState<SeasonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/season")
      .then((r) => r.json())
      .then((d) => { setResult(d); setLoading(false); })
      .catch(() => { setError("Failed to load season guide"); setLoading(false); });
  }, []);

  const filtered = result?.anime.filter((a) => filter === "ALL" || a.verdict === filter) ?? [];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#3B82F6]">📅</span> Seasonal Watchlist
          </h1>
          {result && (
            <p className="text-gray-400">
              {result.season} {result.year} — AI-curated picks ranked by hype & quality
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Analyzing the season...</p>
          </div>
        )}

        {error && <p className="text-red-400 text-center">{error}</p>}

        {result && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#12121a] border border-green-500/30 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">🏆 Season's Top Pick</p>
                <p className="text-white font-semibold">{result.top_pick}</p>
              </div>
              <div className="bg-[#12121a] border border-purple-500/30 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">💎 Hidden Gem</p>
                <p className="text-white font-semibold">{result.hidden_gem}</p>
              </div>
            </div>

            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm">{result.summary}</p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {["ALL", "MUST_WATCH", "WORTH_WATCHING", "WAIT_FOR_BATCH", "SKIP"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === v
                      ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                      : "bg-[#12121a] border-[#2a2a3a] text-gray-400 hover:text-white"
                  }`}
                >
                  {v === "ALL" ? "All" : VERDICT_STYLES[v]?.label ?? v}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map((anime) => {
                const vs = VERDICT_STYLES[anime.verdict] ?? VERDICT_STYLES.SKIP;
                return (
                  <div key={anime.title} className={`bg-[#12121a] border ${vs.bg} rounded-xl p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-white">{anime.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${vs.bg} ${vs.color}`}>{vs.label}</span>
                          <span className="text-xs text-gray-500">{anime.genre}</span>
                        </div>
                        <p className="text-sm text-gray-400">{anime.synopsis}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[#3B82F6] font-bold">{anime.hype_level}/10</div>
                        <div className="text-xs text-gray-500">hype</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
