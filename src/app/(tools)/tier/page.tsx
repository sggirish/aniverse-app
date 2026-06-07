"use client";
import { useState } from "react";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/40" },
  A: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/40" },
  B: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/40" },
  C: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40" },
  D: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/40" },
  F: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/40" },
};

const EXAMPLES = [
  "Shonen battle anime",
  "Isekai anime",
  "Anime openings",
  "Romance anime",
  "Studio Ghibli films",
  "Anime villains",
  "Mecha anime",
  "Slice of life anime",
];

export default function TierPage() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!category.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category.trim() }),
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

  const tiers = result ? (result.tiers as Record<string, unknown>[]) : [];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#F59E0B]">📊</span> Tier List Generator
          </h1>
          <p className="text-gray-400">AI generates definitive tier lists for any anime category. Argue in the comments.</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
          <input
            type="text"
            placeholder="e.g. Shonen battle anime, anime waifus, mecha suits..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            maxLength={100}
            className="w-full bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B]"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setCategory(ex)}
                className="text-xs bg-[#1a1a2e] border border-[#2a2a3a] hover:border-[#F59E0B]/50 text-gray-400 hover:text-white px-3 py-1 rounded-full transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={generate}
            disabled={loading || !category.trim()}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Generating tier list..." : "Generate Tier List"}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
              <h2 className="text-xl font-bold text-white mb-1">{result.category as string}</h2>
              <p className="text-gray-400 text-sm">{result.methodology as string}</p>
            </div>

            {tiers.map((tier) => {
              const tierLabel = tier.tier as string;
              const styles = TIER_COLORS[tierLabel] ?? TIER_COLORS.C;
              return (
                <div key={tierLabel} className={`bg-[#12121a] border ${styles.border} rounded-xl overflow-hidden`}>
                  <div className={`${styles.bg} px-4 py-2 flex items-center gap-3`}>
                    <span className={`text-3xl font-black ${styles.text} w-8 text-center`}>{tierLabel}</span>
                    <span className="text-white font-semibold text-sm">{tier.label as string}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {((tier.entries as Record<string, unknown>[]) ?? []).map((entry: Record<string, unknown>) => (
                        <div key={entry.name as string} className={`${styles.bg} border ${styles.border} rounded-lg px-3 py-2`}>
                          <p className={`font-semibold text-sm ${styles.text}`}>{entry.name as string}</p>
                          {!!entry.reason && <p className="text-xs text-gray-500 mt-0.5">{entry.reason as string}</p>}
                        </div>
                      ))}
                    </div>
                    {!!tier.justification && (
                      <p className="text-xs text-gray-500 italic">{tier.justification as string}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {!!result.hot_take && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4">
                <p className="text-[#EF4444] font-semibold text-sm mb-1">🔥 Hot Take</p>
                <p className="text-gray-300 text-sm">{result.hot_take as string}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
