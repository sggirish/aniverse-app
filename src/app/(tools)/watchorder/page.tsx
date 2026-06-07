"use client";
import { useState } from "react";

export default function WatchOrderPage() {
  const [franchise, setFranchise] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function getOrder() {
    if (!franchise.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/watchorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchise: franchise.trim() }),
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
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#F59E0B]">📺</span> Watch Order Guide
          </h1>
          <p className="text-gray-400">The definitive order to watch any anime franchise — no spoilers, no filler traps</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
          <input
            type="text"
            placeholder="e.g. Fate, Monogatari, Gundam, Evangelion..."
            value={franchise}
            onChange={(e) => setFranchise(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getOrder()}
            className="w-full bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B]"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={getOrder}
            disabled={loading || !franchise.trim()}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Generating guide..." : "Get Watch Order"}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">{result.franchise as string}</h2>
              <p className="text-gray-400 text-sm">{result.overview as string}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-full">
                  Complexity: {result.complexity as string}
                </span>
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                  Recommended: {result.recommended_start as string}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {((result.entries as Record<string, unknown>[]) ?? []).map((entry, i) => (
                <div
                  key={i}
                  className={`bg-[#12121a] border rounded-xl p-4 flex gap-4 ${
                    entry.essential ? "border-[#F59E0B]/50" : "border-[#2a2a3a]"
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-[#1a1a2e] text-[#F59E0B]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{entry.title as string}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a2e] text-gray-400">{entry.type as string}</span>
                      {!!entry.essential && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">Essential</span>
                      )}
                      {!!entry.can_skip && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">Can Skip</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{entry.note as string}</p>
                    {!!entry.warning && (
                      <p className="text-xs text-amber-400 mt-1">⚠️ {entry.warning as string}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!!result.tips && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-blue-400 font-semibold text-sm mb-2">💡 Pro Tips</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {((result.tips as string[]) ?? []).map((tip: string, i: number) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
