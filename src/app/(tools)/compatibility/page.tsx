"use client";
import { useState } from "react";

interface CompatUser {
  username: string;
  platform: "mal" | "anilist";
}

export default function CompatibilityPage() {
  const [userA, setUserA] = useState<CompatUser>({ username: "", platform: "mal" });
  const [userB, setUserB] = useState<CompatUser>({ username: "", platform: "mal" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function check() {
    if (!userA.username.trim() || !userB.username.trim()) {
      setError("Both usernames required");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userA, userB }),
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

  const score = result ? (result.compatibility_score as number) : null;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#EC4899]">💘</span> Taste Compatibility
          </h1>
          <p className="text-gray-400">Find out how well your anime tastes align with a friend</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-6">
          {[{ label: "Your Account", val: userA, set: setUserA }, { label: "Friend's Account", val: userB, set: setUserB }].map(({ label, val, set }) => (
            <div key={label} className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{label}</label>
              <div className="flex gap-2">
                <select
                  value={val.platform}
                  onChange={(e) => set((p) => ({ ...p, platform: e.target.value as "mal" | "anilist" }))}
                  className="bg-[#1a1a2e] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="mal">MyAnimeList</option>
                  <option value="anilist">AniList</option>
                </select>
                <input
                  type="text"
                  placeholder="Username"
                  value={val.username}
                  onChange={(e) => set((p) => ({ ...p, username: e.target.value }))}
                  className="flex-1 bg-[#1a1a2e] border border-[#2a2a3a] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#EC4899]"
                />
              </div>
            </div>
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={check}
            disabled={loading}
            className="w-full bg-[#EC4899] hover:bg-[#db2777] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Analyzing..." : "Check Compatibility"}
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-6">
            <div className="text-center">
              <div className="text-7xl font-black text-[#EC4899] mb-2">{score}%</div>
              <div className="text-2xl font-bold text-white mb-1">{result.title as string}</div>
              <p className="text-gray-400">{result.summary as string}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-green-400 font-semibold text-sm mb-2">✅ Shared Loves</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {((result.shared_loves as string[]) ?? []).map((g: string) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                <h3 className="text-red-400 font-semibold text-sm mb-2">⚡ Taste Clashes</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {((result.taste_clashes as string[]) ?? []).map((g: string) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {(result.recommendations as string[])?.length > 0 && (
              <div className="bg-[#1a1a2e] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">🎯 Watch Together</h3>
                <div className="flex flex-wrap gap-2">
                  {(result.recommendations as string[]).map((r: string) => (
                    <span key={r} className="bg-[#EC4899]/20 text-[#EC4899] px-3 py-1 rounded-full text-sm">{r}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              {result.roast as string}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
