"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ui/share-buttons";
import { AdUnit } from "@/components/ads/AdUnit";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

interface RoastResult {
  roast_text: string;
  username: string;
  platform: "mal" | "anilist";
  stats: {
    mean_score: number;
    completed: number;
    episodes_watched: number;
    top_genres: string[];
    dropped: number;
    most_watched_franchise: string;
  };
}

const LOADING_MESSAGES = [
  "Reading your watch history…",
  "Judging your dropped anime list…",
  "Analyzing your taste crimes…",
  "Consulting the anime council…",
  "Writing your roast…",
];

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 13);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span className={done ? "" : "typewriter-cursor"}>{displayed}</span>;
}

export default function RoastPage() {
  const [platform, setPlatform] = useState<"mal" | "anilist">("mal");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textDone, setTextDone] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setLoadingMsg(0);
    setError(null);
    setResult(null);
    setTextDone(false);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      localStorage.setItem("aniverse_used_tool", "1");
      window.plausible?.("tool_used", { props: { tool: "roast", platform } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const statItems = result?.stats ? [
    { label: "Completed", value: result.stats.completed, icon: "✅" },
    { label: "Episodes", value: result.stats.episodes_watched?.toLocaleString(), icon: "📺" },
    { label: "Mean Score", value: result.stats.mean_score ? result.stats.mean_score.toFixed(1) + "/10" : null, icon: "⭐" },
    { label: "Dropped", value: result.stats.dropped, icon: "🗑️" },
    { label: "Top Genre", value: result.stats.top_genres?.[0], icon: "🎭" },
    { label: "Most Watched", value: result.stats.most_watched_franchise, icon: "🔁" },
  ].filter(s => s.value != null && s.value !== "undefined" && s.value !== "0") : [];

  const platformLabel = platform === "anilist" ? "anilist.co" : "myanimelist.net";
  const shareUrl = result ? `/roast/${result.username}` : "";

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-4xl">🔥</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#DC2626] block">Anime Roast</span>
              <span className="text-xs text-[#9CA3AF]">Powered by Claude AI</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Get Destroyed.<br /><span className="text-[#DC2626]">Lovingly.</span>
          </h1>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-md">
            Claude reads your entire anime list and writes a brutally honest, weirdly personal roast. Works with MAL and AniList.
          </p>
        </div>

        {/* Platform toggle */}
        <div className="flex gap-1 mb-4 p-1 bg-[#F3F4F6] rounded-xl w-fit animate-fade-in-up stagger-1">
          {(["mal", "anilist"] as const).map((p) => (
            <button key={p} onClick={() => { setPlatform(p); setResult(null); setError(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                platform === p ? "bg-white shadow-sm text-[#0F0F0F]" : "text-[#6B7280] hover:text-[#0F0F0F]"
              }`}>
              {p === "mal" ? "MyAnimeList" : "AniList"}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={submit} className="mb-8 animate-fade-in-up stagger-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] font-mono pointer-events-none">
                {platform === "mal" ? "mal/" : "al/"}
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                className="w-full h-12 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent transition-all"
                disabled={loading}
                maxLength={50}
              />
            </div>
            <Button variant="danger" size="lg" type="submit" loading={loading} className="rounded-xl shrink-0 font-bold">
              {loading ? "Roasting…" : "Roast Me 🔥"}
            </Button>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2.5">
            {platform === "mal"
              ? <>Profile must be public on MAL. <a href="https://myanimelist.net/editprofile.php" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">Make it public →</a></>
              : <>Find your username at <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">anilist.co</a> — lists are public by default.</>
            }
          </p>
        </form>

        {/* Loading */}
        {loading && (
          <div className="animate-fade-in text-center py-14 space-y-4">
            <div className="flex justify-center">
              <svg className="animate-spin-slow w-12 h-12 text-[#DC2626]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
            </div>
            <p className="font-bold text-[#374151] transition-all duration-300">{LOADING_MESSAGES[loadingMsg]}</p>
            <p className="text-xs text-[#9CA3AF]">This takes 10–15 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-scale-in">
            <p className="font-bold mb-1">Couldn&apos;t find your profile</p>
            <p>{error}</p>
            {platform === "mal" && (
              <a href="https://myanimelist.net/editprofile.php" target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 text-xs font-bold text-[#DC2626] underline">
                How to make your MAL list public →
              </a>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5 result-card">

            {/* Stats grid */}
            {statItems.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {statItems.map((s, i) => (
                  <div key={s.label}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 text-center animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
                    <div className="text-lg mb-0.5">{s.icon}</div>
                    <div className="text-xs font-black text-[#0F0F0F] leading-tight">{s.value}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Roast card */}
            <div className="bg-[#FFF8F5] border border-[#FCA5A5] rounded-2xl p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <span className="font-black text-base text-[#DC2626]">{result.username}</span>
                    <span className="text-[10px] text-[#9CA3AF] ml-2 uppercase tracking-wide">{platformLabel}</span>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF] font-mono bg-white border border-[#E5E7EB] px-2 py-1 rounded-lg">AI Roast</span>
              </div>
              <div className="border-t border-[#FCA5A5]" />
              <p className="text-base leading-[1.9] text-[#1F1F1F]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
                <TypewriterText text={result.roast_text} onDone={() => setTextDone(true)} />
              </p>
            </div>

            {/* Actions — appear after typewriter finishes */}
            {textDone && (
              <div className="space-y-4 animate-fade-in-up">
                {/* Share section */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-sm font-black mb-1">Share your roast</p>
                  <p className="text-xs text-[#9CA3AF] mb-4">Challenge your friends — send them this roast or dare them to get their own.</p>
                  <ShareButtons
                    url={shareUrl}
                    text={`my anime taste got absolutely destroyed by AI. get yours roasted too`}
                    title={`${result.username}'s Anime Roast`}
                    platform={platform}
                  />
                </div>

                {/* Challenge CTA */}
                <div className="p-4 bg-[#111827] text-white rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold">Dare a friend</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Copy the link and challenge them to get roasted too.</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/roast`)}
                    className="text-xs font-bold px-3 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#b91c1c] shrink-0 transition-colors">
                    Copy link
                  </button>
                </div>

                <AdUnit slot="roast-result" format="auto" />

                {/* Crunchyroll */}
                <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍊</span>
                    <p className="text-sm text-[#6B7280]">Fix your taste. 40,000+ episodes on Crunchyroll.</p>
                  </div>
                  <a href={`${process.env.NEXT_PUBLIC_CRUNCHYROLL_AFFILIATE_URL ?? "https://www.crunchyroll.com"}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => window.plausible?.("affiliate_clicked", { props: { affiliate: "crunchyroll" } })}
                    className="text-xs font-bold px-4 py-2.5 bg-[#F47521] text-white rounded-xl hover:opacity-90 shrink-0 transition-opacity">
                    Watch Free →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
