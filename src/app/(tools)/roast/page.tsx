"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ui/share-buttons";
import { AdUnit } from "@/components/ads/AdUnit";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

interface RoastResult {
  roast_text: string;
  username: string;
  stats: {
    mean_score: number;
    completed: number;
    episodes_watched: number;
    top_genres: string[];
    dropped: number;
  };
}

export default function RoastPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      // Mark tool as used (shows Buy Me a Coffee)
      localStorage.setItem("aniverse_used_tool", "1");
      // Plausible event
      window.plausible?.("tool_used", { props: { tool: "roast" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🔥</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#DC2626]">Anime Roast</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Get Roasted.
          </h1>
          <p className="text-[#6B7280] text-base leading-relaxed">
            Paste your MyAnimeList username. We'll read your entire watch history and write you a brutally honest, weirdly personal roast. No login required.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={submit} className="mb-8 animate-fade-in-up stagger-1">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your MAL username"
                className="w-full h-12 px-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>
            <Button variant="danger" size="lg" type="submit" loading={loading} className="rounded-xl shrink-0">
              {loading ? "Roasting…" : "Roast Me"}
            </Button>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2">
            Profile must be public on MAL.&nbsp;
            <a href="https://myanimelist.net/editprofile.php" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">
              Make it public →
            </a>
          </p>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Roast card */}
            <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl p-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base" style={{ fontFamily: "system-ui" }}>{result.username}</span>
                <span className="text-xs text-[#6B7280] font-mono">MAL Roast</span>
              </div>
              <div className="border-t border-[#E5E7EB]" />
              <p className="text-base leading-relaxed text-[#1F1F1F]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
                {result.roast_text}
              </p>
              <div className="border-t border-[#E5E7EB]" />
              {/* Stats row */}
              {result.stats && (
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Completed", value: result.stats.completed },
                    { label: "Episodes", value: result.stats.episodes_watched?.toLocaleString() },
                    { label: "Mean Score", value: result.stats.mean_score?.toFixed(1) },
                    { label: "Top Genre", value: result.stats.top_genres?.[0] },
                    { label: "Dropped", value: result.stats.dropped },
                  ].filter(s => s.value != null && s.value !== undefined).map((s) => (
                    <span key={s.label}
                      className="text-xs font-mono font-medium px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg">
                      <span className="text-[#9CA3AF]">{s.label}: </span>
                      <span className="text-[#0F0F0F]">{s.value}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-[#9CA3AF] pt-1">aniverse.app/roast/{result.username}</div>
            </div>

            {/* Share */}
            <div>
              <p className="text-xs text-[#6B7280] font-medium mb-2 uppercase tracking-wide">Share your roast</p>
              <ShareButtons
                url={`/roast/${result.username}`}
                text={`My anime taste just got roasted by AI and I deserve it 🔥 "${result.roast_text.slice(0, 120)}…"`}
              />
            </div>

            {/* AdSense — after result, highest CTR placement */}
            <AdUnit slot="roast-result" format="auto" />

            {/* Affiliate — Crunchyroll */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between gap-4">
              <p className="text-sm text-[#6B7280]">Ready to watch more? Crunchyroll has 40,000+ episodes.</p>
              <a href={`${process.env.NEXT_PUBLIC_CRUNCHYROLL_AFFILIATE_URL ?? "https://www.crunchyroll.com"}`}
                target="_blank" rel="noopener noreferrer"
                onClick={() => window.plausible?.("affiliate_clicked", { props: { affiliate: "crunchyroll" } })}
                className="text-xs font-semibold px-3 py-2 bg-[#F47521] text-white rounded-lg hover:opacity-90 shrink-0">
                Try Crunchyroll →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
