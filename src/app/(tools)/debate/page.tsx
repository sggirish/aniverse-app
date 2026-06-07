"use client";
import { useState } from "react";

const HOT_TAKES = [
  "Sword Art Online is actually good",
  "Naruto filler was not that bad",
  "The dub is better than the sub",
  "Isekai is the best genre",
  "Attack on Titan's ending was perfect",
  "One Piece should have ended by now",
];

export default function DebatePage() {
  const [opinion, setOpinion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    if (!opinion.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opinion: opinion.trim() }),
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

  const score = result?.controversy_score as number | undefined;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#EF4444]">🔥</span> Debate Engine
          </h1>
          <p className="text-gray-400">Drop your hot take. We argue both sides and rate how spicy it is.</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
          <textarea
            placeholder="Enter your controversial anime opinion..."
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            maxLength={200}
            rows={3}
            className="w-full bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#EF4444] resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{opinion.length}/200</span>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Try a hot take:</p>
            <div className="flex flex-wrap gap-2">
              {HOT_TAKES.map((h) => (
                <button
                  key={h}
                  onClick={() => setOpinion(h)}
                  className="text-xs bg-[#1a1a2e] border border-[#2a2a3a] hover:border-[#EF4444]/50 text-gray-400 hover:text-white px-3 py-1 rounded-full transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={submit}
            disabled={loading || !opinion.trim()}
            className="w-full bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Debating..." : "Start the Debate 🔥"}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-3">Topic</p>
              <p className="text-xl font-bold text-white mb-4">"{result.topic as string}"</p>
              {score !== undefined && (
                <div className="inline-flex flex-col items-center">
                  <div className="text-6xl font-black text-[#EF4444]">{score}/10</div>
                  <div className="text-sm text-gray-400 mt-1">Controversy Score</div>
                  <div className="text-sm font-medium text-white mt-1">{result.verdict as string}</div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-5">
                <h3 className="text-green-400 font-bold mb-3">✅ For</h3>
                <ul className="space-y-2">
                  {((result.for_arguments as string[]) ?? []).map((a: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-5">
                <h3 className="text-red-400 font-bold mb-3">❌ Against</h3>
                <ul className="space-y-2">
                  {((result.against_arguments as string[]) ?? []).map((a: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">⚖️ Final Call</h3>
              <p className="text-gray-300 text-sm">{result.final_take as string}</p>
            </div>

            <button
              onClick={() => { setResult(null); setOpinion(""); }}
              className="w-full bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 py-3 rounded-xl transition-colors text-sm"
            >
              Try Another Take
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
