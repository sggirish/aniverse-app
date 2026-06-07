"use client";
import { useState } from "react";

export default function WrappedPage() {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState<"mal" | "anilist">("mal");
  const [year] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), platform, year }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-4xl font-bold mb-3">Year in Anime Wrapped</h1>
          <p className="text-gray-400">{year} — Your anime year, reviewed and roasted.</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
          <div className="flex gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as "mal" | "anilist")}
              className="bg-[#1a1a2e] border border-[#2a2a3a] rounded-lg px-3 py-3 text-white text-sm"
            >
              <option value="mal">MyAnimeList</option>
              <option value="anilist">AniList</option>
            </select>
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={generate}
            disabled={loading || !username.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {loading ? "Creating your Wrapped..." : `Generate ${year} Wrapped`}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="bg-gradient-to-br from-purple-900/40 via-[#12121a] to-pink-900/30 border border-purple-500/30 rounded-2xl p-8 text-center">
              <p className="text-purple-400 text-sm font-medium mb-2">{result.username as string} • {result.year as number}</p>
              <h2 className="text-3xl font-black text-white mb-2">{result.title as string}</h2>
              <p className="text-gray-300">{result.summary as string}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Episodes Watched", value: result.total_episodes, icon: "📺" },
                { label: "Hours Spent", value: result.hours_spent, icon: "⏱️" },
                { label: "Shows Completed", value: result.shows_completed, icon: "✅" },
                { label: "Mean Score", value: result.mean_score, icon: "⭐" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 text-center">
                  <div className="text-3xl mb-1">{icon}</div>
                  <div className="text-2xl font-bold text-white">{String(value ?? "—")}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {!!result.top_shows && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3">🏆 Your Top Shows</h3>
                <div className="space-y-2">
                  {(result.top_shows as Record<string, unknown>[]).map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-gray-500 w-6 text-sm">{i + 1}.</span>
                      <span className="text-white flex-1">{s.title as string}</span>
                      {!!s.score && <span className="text-yellow-400 text-sm">★ {s.score as number}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!result.genre_breakdown && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3">📊 Genre DNA</h3>
                <div className="space-y-2">
                  {(result.genre_breakdown as Record<string, unknown>[]).map((g) => (
                    <div key={g.genre as string} className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-24 truncate">{g.genre as string}</span>
                      <div className="flex-1 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(g.percentage as number) ?? 0}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs w-10 text-right">{g.percentage as number}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!result.personality && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-5 text-center">
                <p className="text-xs text-purple-400 mb-1">Your {result.year as number} Anime Personality</p>
                <p className="text-2xl font-bold text-white mb-2">{result.personality as string}</p>
                <p className="text-gray-400 text-sm">{result.personality_note as string}</p>
              </div>
            )}

            {!!result.roast && (
              <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-red-400 text-sm font-medium mb-1">🔥 Year in Review (Roast Edition)</p>
                <p className="text-gray-300 text-sm italic">{result.roast as string}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
