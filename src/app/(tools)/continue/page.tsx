"use client";
import { useState } from "react";

export default function ContinuePage() {
  const [title, setTitle] = useState("");
  const [droppedAt, setDroppedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function check() {
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), dropped_at: droppedAt.trim() }),
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

  const verdict = result?.verdict as string;
  const verdictColor = verdict === "CONTINUE" ? "text-green-400" : verdict === "SKIP" ? "text-red-400" : "text-yellow-400";
  const verdictBg = verdict === "CONTINUE" ? "border-green-500/50 bg-green-900/10" : verdict === "SKIP" ? "border-red-500/50 bg-red-900/10" : "border-yellow-500/50 bg-yellow-900/10";

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#10B981]">🤔</span> Should I Continue?
          </h1>
          <p className="text-gray-400">You dropped an anime. Was that the right call? Find out.</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Anime Title</label>
            <input
              type="text"
              placeholder="e.g. Sword Art Online, Bleach, Naruto..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Where did you drop it? <span className="text-gray-500">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Episode 20, Season 2, Filler arc..."
              value={droppedAt}
              onChange={(e) => setDroppedAt(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981]"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={check}
            disabled={loading || !title.trim()}
            className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Analyzing..." : "Should I Continue?"}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className={`bg-[#12121a] border ${verdictBg} rounded-2xl p-6 text-center`}>
              <div className={`text-5xl font-black ${verdictColor} mb-2`}>{verdict}</div>
              <p className="text-white text-lg font-semibold mb-1">{result.short_verdict as string}</p>
              <p className="text-gray-400">{result.reason as string}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
                <h3 className="text-green-400 font-semibold text-sm mb-2">✅ Reasons to Continue</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {((result.reasons_to_continue as string[]) ?? []).map((r: string, i: number) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
                <h3 className="text-red-400 font-semibold text-sm mb-2">❌ Reasons to Drop</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {((result.reasons_to_drop as string[]) ?? []).map((r: string, i: number) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {!!result.skip_to && (
              <div className="bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-1">⏭️ Skip to</h3>
                <p className="text-[#10B981] font-medium">{result.skip_to as string}</p>
                <p className="text-gray-400 text-sm mt-1">{result.skip_note as string}</p>
              </div>
            )}

            {!!result.comparable_shows && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">🎯 Better Alternatives</h3>
                <div className="flex flex-wrap gap-2">
                  {(result.comparable_shows as string[]).map((s: string) => (
                    <span key={s} className="bg-[#10B981]/20 text-[#10B981] px-3 py-1 rounded-full text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
