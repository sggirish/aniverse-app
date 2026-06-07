"use client";
import { useState } from "react";

const ARCHETYPES: Record<string, string> = {
  "The Completionist": "📚",
  "The Contrarian": "🔥",
  "The Romantic": "💕",
  "The Shonen Purist": "⚡",
  "The Artsy One": "🎨",
  "The Isekai Addict": "🌀",
  "The Mystery Buff": "🔍",
  "The Horror Fan": "👻",
  "The Mech Pilot": "🤖",
  "The Slice-of-Life Enjoyer": "☕",
};

export default function IdentityPage() {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState<"mal" | "anilist">("mal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), platform }),
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

  const archetype = result?.archetype as string;
  const emoji = ARCHETYPES[archetype] ?? "🎭";

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#8B5CF6]">🎭</span> Anime Identity Card
          </h1>
          <p className="text-gray-400">Your anime personality, distilled into a single card.</p>
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
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={generate}
            disabled={loading || !username.trim()}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Creating card..." : "Generate Identity Card"}
          </button>
        </div>

        {result && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-[#1a0a2e] via-[#12121a] to-[#0a1a2e] border border-[#8B5CF6]/50 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{emoji}</div>
                <div className="text-3xl font-black text-white mb-1">{archetype}</div>
                <div className="text-[#8B5CF6] font-medium">{result.username as string}</div>
              </div>

              <div className="bg-[#0a0a0f]/50 rounded-xl p-4 mb-6">
                <p className="text-gray-300 text-sm italic text-center">{result.bio as string}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {(result.stats as Record<string, unknown>)
                  ? Object.entries(result.stats as Record<string, unknown>).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="bg-[#0a0a0f]/50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-[#8B5CF6]">{String(v)}</div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">{k.replace(/_/g, " ")}</div>
                      </div>
                    ))
                  : null}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Defining Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {((result.traits as string[]) ?? []).map((t: string) => (
                      <span key={t} className="bg-[#8B5CF6]/20 text-[#8B5CF6] text-sm px-3 py-1 rounded-full border border-[#8B5CF6]/30">{t}</span>
                    ))}
                  </div>
                </div>

                {(result.power_genre as string) && (
                  <div className="bg-[#0a0a0f]/50 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-xs text-gray-500">Power Genre</p>
                      <p className="text-white font-semibold">{result.power_genre as string}</p>
                    </div>
                  </div>
                )}

                {(result.spirit_anime as string) && (
                  <div className="bg-[#0a0a0f]/50 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="text-xs text-gray-500">Spirit Anime</p>
                      <p className="text-white font-semibold">{result.spirit_anime as string}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a2a3a] text-center">
                <p className="text-xs text-gray-600">AniVerse Identity Card • {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
