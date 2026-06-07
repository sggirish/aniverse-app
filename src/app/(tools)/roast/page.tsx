"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ui/share-buttons";
import { AdUnit } from "@/components/ads/AdUnit";
import type { RoastResult, TasteDNA, QuickRoastResult } from "@/lib/claude";
import Image from "next/image";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

interface ApiResponse {
  roast_result: RoastResult;
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

interface SearchHit {
  mal_id: number;
  title: string;
  image_url?: string;
  score?: number;
  episodes?: number;
}

interface PickedAnime {
  mal_id: number;
  title: string;
  image_url?: string;
  rating?: number;
}

const LOADING_MESSAGES = [
  "Reading your watch history…",
  "Judging your dropped anime list…",
  "Analyzing your taste crimes…",
  "Consulting the anime council…",
  "Writing your roast…",
];

const DNA_LABELS: Record<keyof TasteDNA, { label: string; lowLabel: string; highLabel: string; color: string }> = {
  mainstream:      { label: "Mainstream",    lowLabel: "Hidden Gem Hunter",   highLabel: "Normie",             color: "#8B5CF6" },
  patience:        { label: "Patience",      lowLabel: "Can't Commit",        highLabel: "Arc Enjoyer",        color: "#2563EB" },
  darkness:        { label: "Darkness",      lowLabel: "Wholesome Only",      highLabel: "Edge Lord",          color: "#111827" },
  emotional_depth: { label: "Emotional",     lowLabel: "Stone Cold",          highLabel: "Cries Easily",       color: "#DC2626" },
  completion_rate: { label: "Completion",    lowLabel: "Serial Dropper",      highLabel: "True Completionist", color: "#16A34A" },
};

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

function DNABar({ label, value, lowLabel, highLabel, color }: { label: string; value: number; lowLabel: string; highLabel: string; color: string }) {
  const pct = Math.min(Math.max(value, 1), 10) * 10;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#374151]">{label}</span>
        <span className="text-[#9CA3AF]">{value}/10</span>
      </div>
      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex justify-between text-[10px] text-[#9CA3AF]">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function RoastResultDisplay({
  roast, textDone, setTextDone,
  shareUrl, shareUsername, platformLabel, isQuick,
}: {
  roast: RoastResult | QuickRoastResult;
  textDone: boolean; setTextDone: (v: boolean) => void;
  shareUrl: string; shareUsername?: string; platformLabel?: string; isQuick?: boolean;
}) {
  return (
    <div className="space-y-4 result-card">
      {/* Personality type header */}
      <div className="bg-gradient-to-r from-[#111827] to-[#1F2937] text-white rounded-2xl p-6 animate-bounce-in">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1">Your Anime Personality</p>
        <h2 className="text-2xl sm:text-3xl font-black mb-1">{roast.personality_type}</h2>
        {roast.roast_tier && (
          <span className="inline-block text-xs font-bold bg-[#DC2626] text-white px-3 py-1 rounded-full mt-1">
            {roast.roast_tier}
          </span>
        )}
      </div>

      {/* Taste DNA */}
      {roast.taste_dna && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 animate-fade-in-up stagger-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">Taste DNA</p>
          <div className="space-y-4">
            {(Object.entries(roast.taste_dna) as [keyof TasteDNA, number][]).map(([key, val]) => {
              const cfg = DNA_LABELS[key];
              return <DNABar key={key} label={cfg.label} value={val} lowLabel={cfg.lowLabel} highLabel={cfg.highLabel} color={cfg.color} />;
            })}
          </div>
        </div>
      )}

      {/* Roast card */}
      <div className="bg-[#FFF8F5] border border-[#FCA5A5] rounded-2xl p-7 space-y-4 animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            {shareUsername ? (
              <div>
                <span className="font-black text-base text-[#DC2626]">{shareUsername}</span>
                {platformLabel && <span className="text-[10px] text-[#9CA3AF] ml-2 uppercase tracking-wide">{platformLabel}</span>}
              </div>
            ) : (
              <span className="font-black text-base text-[#DC2626]">Your Taste</span>
            )}
          </div>
          <span className="text-xs text-[#9CA3AF] font-mono bg-white border border-[#E5E7EB] px-2 py-1 rounded-lg">
            {isQuick ? "Quick Roast" : "AI Roast"}
          </span>
        </div>
        <div className="border-t border-[#FCA5A5]" />
        <p className="text-base leading-[1.9] text-[#1F1F1F]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
          <TypewriterText text={roast.roast_text} onDone={() => setTextDone(true)} />
        </p>
      </div>

      {/* Taste sins */}
      {roast.taste_sins?.length > 0 && textDone && (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-5 animate-fade-in-up stagger-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-3">Your Taste Sins</p>
          <div className="space-y-2">
            {roast.taste_sins.map((sin, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                <span className="text-red-400 font-black shrink-0 mt-0.5">#{i + 1}</span>
                <span>{sin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redemption arc */}
      {roast.redemption_arc?.length > 0 && textDone && (
        <div className="bg-[#F0FDF4] border border-green-200 rounded-2xl p-5 animate-fade-in-up stagger-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A] mb-3">Your Redemption Arc</p>
          <p className="text-xs text-[#6B7280] mb-3">Watch these to fix your taste:</p>
          <div className="flex flex-wrap gap-2">
            {roast.redemption_arc.map((anime, i) => (
              <a key={i} href={`/watch?q=${encodeURIComponent(anime)}`}
                className="text-sm font-bold px-4 py-2 bg-white border border-green-200 rounded-xl text-[#16A34A] hover:bg-green-50 transition-colors">
                {anime} →
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {textDone && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <p className="text-sm font-black mb-1">Share your roast</p>
            <p className="text-xs text-[#9CA3AF] mb-4">Challenge your friends — dare them to get their own.</p>
            <ShareButtons
              url={shareUrl}
              text={`my anime taste got absolutely destroyed by AI — I'm "${roast.personality_type}". get yours roasted too`}
              title="My Anime Roast"
            />
          </div>
          <AdUnit slot="roast-result" format="auto" />
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍊</span>
              <p className="text-sm text-[#6B7280]">Fix your taste. 40,000+ episodes on Crunchyroll.</p>
            </div>
            <a href={process.env.NEXT_PUBLIC_CRUNCHYROLL_AFFILIATE_URL ?? "https://www.crunchyroll.com"}
              target="_blank" rel="noopener noreferrer"
              onClick={() => window.plausible?.("affiliate_clicked", { props: { affiliate: "crunchyroll" } })}
              className="text-xs font-bold px-4 py-2.5 bg-[#F47521] text-white rounded-xl hover:opacity-90 shrink-0 transition-opacity">
              Watch Free →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quick Roast tab ───────────────────────────────────────────────────────────

function QuickRoastTab() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [picked, setPicked] = useState<PickedAnime[]>([]);
  const [hotTake, setHotTake] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<QuickRoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textDone, setTextDone] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setSearchOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setSearchOpen(true);
      } catch { setSuggestions([]); }
      setSearchLoading(false);
    }, 380);
  }, [query]);

  const addAnime = (hit: SearchHit) => {
    if (picked.length >= 10) return;
    if (picked.some(p => p.mal_id === hit.mal_id)) return;
    setPicked(prev => [...prev, { mal_id: hit.mal_id, title: hit.title, image_url: hit.image_url }]);
    setQuery("");
    setSuggestions([]);
    setSearchOpen(false);
  };

  const removeAnime = (mal_id: number) => setPicked(prev => prev.filter(p => p.mal_id !== mal_id));

  const setRating = (mal_id: number, rating: number | undefined) => {
    setPicked(prev => prev.map(p => p.mal_id === mal_id ? { ...p, rating } : p));
  };

  const submit = async () => {
    if (picked.length < 3) { setError("Pick at least 3 anime"); return; }
    setLoading(true);
    setLoadingMsg(0);
    setError(null);
    setResult(null);
    setTextDone(false);
    try {
      const res = await fetch("/api/roast/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anime: picked.map(p => ({ title: p.title, rating: p.rating })),
          hot_take: hotTake.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      window.plausible?.("tool_used", { props: { tool: "roast_quick" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div>
        <RoastResultDisplay
          roast={result} textDone={textDone} setTextDone={setTextDone}
          shareUrl="/roast" isQuick
        />
        <button onClick={() => { setResult(null); setPicked([]); setHotTake(""); }}
          className="w-full mt-4 text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors py-2">
          ← Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
            Your anime list {picked.length > 0 && <span className="text-[#DC2626]">({picked.length}/10)</span>}
          </label>
          {picked.length > 0 && (
            <button onClick={() => setPicked([])} className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Clear all</button>
          )}
        </div>
        <div className="relative">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" value={query}
              onChange={(e) => { setQuery(e.target.value); setError(null); }}
              onFocus={() => suggestions.length > 0 && setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 160)}
              placeholder={picked.length >= 10 ? "Maximum reached" : "Search and add anime…"}
              disabled={picked.length >= 10}
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent transition-all disabled:opacity-50"
            />
            {searchLoading && (
              <div className="absolute right-3.5 top-3">
                <svg className="animate-spin w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                </svg>
              </div>
            )}
          </div>
          {searchOpen && suggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-20 overflow-hidden animate-scale-in">
              {suggestions.slice(0, 6).map((s) => {
                const alreadyAdded = picked.some(p => p.mal_id === s.mal_id);
                return (
                  <button key={s.mal_id} onMouseDown={() => !alreadyAdded && addAnime(s)} disabled={alreadyAdded}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-[#F9F9F9] last:border-0 transition-colors ${alreadyAdded ? "opacity-40 cursor-default" : "hover:bg-[#F3F4F6]"}`}>
                    <div className="w-8 h-10 rounded overflow-hidden bg-[#F3F4F6] shrink-0">
                      {s.image_url ? (
                        <Image src={s.image_url} alt={s.title} width={32} height={40} className="w-full h-full object-cover" unoptimized />
                      ) : <div className="w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      {s.episodes && <p className="text-[10px] text-[#9CA3AF]">{s.episodes} eps</p>}
                    </div>
                    {alreadyAdded
                      ? <span className="text-xs text-green-600 font-bold shrink-0">Added ✓</span>
                      : <span className="text-xs text-[#9CA3AF] shrink-0">+ Add</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Picked list */}
      {picked.length > 0 && (
        <div className="space-y-2">
          {picked.map((p) => (
            <div key={p.mal_id} className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 animate-scale-in">
              <div className="w-8 h-10 rounded overflow-hidden bg-[#F3F4F6] shrink-0">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.title} width={32} height={40} className="w-full h-full object-cover" unoptimized />
                ) : <div className="w-full h-full bg-[#F3F4F6]" />}
              </div>
              <p className="flex-1 text-sm font-semibold text-[#0F0F0F] truncate">{p.title}</p>
              {/* Star rating row */}
              <div className="flex items-center gap-1 shrink-0">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <button key={n} title={`Rate ${n}/10`}
                    onClick={() => setRating(p.mal_id, p.rating === n ? undefined : n)}
                    className={`w-3.5 h-3.5 rounded-sm transition-colors text-[8px] leading-none flex items-center justify-center font-black
                      ${p.rating != null && n <= p.rating
                        ? "bg-[#DC2626] text-white"
                        : "bg-[#F3F4F6] text-[#9CA3AF] hover:bg-[#E5E7EB]"}`}>
                    {n}
                  </button>
                ))}
                {p.rating && <span className="text-[10px] text-[#9CA3AF] ml-1">{p.rating}/10</span>}
              </div>
              <button onClick={() => removeAnime(p.mal_id)}
                className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors shrink-0 ml-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hot take (optional) */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-[#6B7280] block mb-2">
          Hot take <span className="text-[#9CA3AF] normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={hotTake}
          onChange={(e) => setHotTake(e.target.value)}
          placeholder="e.g. 'SAO is underrated', 'Demon Slayer is overrated', 'I refuse to watch anything pre-2015'"
          maxLength={300}
          rows={2}
          className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent transition-all"
        />
        {hotTake.length > 0 && (
          <p className="text-[10px] text-[#9CA3AF] text-right mt-1">{hotTake.length}/300</p>
        )}
      </div>

      {/* Submit */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-scale-in">⚠️ {error}</div>
      )}

      <Button variant="danger" size="lg" onClick={submit} loading={loading}
        disabled={picked.length < 3 || loading}
        className="w-full rounded-xl font-black text-base">
        {loading ? LOADING_MESSAGES[loadingMsg] : picked.length < 3
          ? `Pick ${3 - picked.length} more anime to roast`
          : `Roast My Taste 🔥`}
      </Button>

      {loading && (
        <div className="text-center py-8 space-y-2 animate-fade-in">
          <svg className="animate-spin-slow w-10 h-10 text-[#DC2626] mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
          <p className="text-xs text-[#9CA3AF]">This takes ~10 seconds</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RoastPage() {
  const [tab, setTab] = useState<"mal" | "anilist" | "quick">("mal");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<ApiResponse | null>(null);
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
        body: JSON.stringify({ username, platform: tab }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      localStorage.setItem("aniverse_used_tool", "1");
      window.plausible?.("tool_used", { props: { tool: "roast", platform: tab } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const r = result?.roast_result;
  const statItems = result?.stats ? [
    { label: "Completed", value: result.stats.completed, icon: "✅" },
    { label: "Episodes", value: result.stats.episodes_watched?.toLocaleString(), icon: "📺" },
    { label: "Mean Score", value: result.stats.mean_score ? result.stats.mean_score.toFixed(1) + "/10" : null, icon: "⭐" },
    { label: "Dropped", value: result.stats.dropped, icon: "🗑️" },
    { label: "Top Genre", value: result.stats.top_genres?.[0], icon: "🎭" },
    { label: "Most Watched", value: result.stats.most_watched_franchise, icon: "🔁" },
  ].filter(s => s.value != null && s.value !== "undefined" && s.value !== "0") : [];

  const platformLabel = tab === "anilist" ? "anilist.co" : "myanimelist.net";

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
            Claude reads your anime list and gives you a brutally honest personality breakdown — your taste DNA, your sins, and how to fix yourself.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 p-1 bg-[#F3F4F6] rounded-xl w-fit animate-fade-in-up stagger-1">
          {([
            { id: "mal",    label: "MyAnimeList" },
            { id: "anilist", label: "AniList" },
            { id: "quick",  label: "⚡ Quick Roast" },
          ] as const).map((t) => (
            <button key={t.id}
              onClick={() => { setTab(t.id); setResult(null); setError(null); }}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.id ? "bg-white shadow-sm text-[#0F0F0F]" : "text-[#6B7280] hover:text-[#0F0F0F]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Quick Roast tab */}
        {tab === "quick" && (
          <div className="animate-fade-in-up stagger-2">
            <div className="mb-5 px-4 py-3 bg-[#FFF8F5] border border-[#FCA5A5] rounded-xl text-sm text-[#374151]">
              <p className="font-bold text-[#DC2626] mb-0.5">No account needed</p>
              <p className="text-xs text-[#6B7280]">Search and pick 3–10 anime you&apos;ve watched. Rate them if you want. Claude roasts your taste based on your picks.</p>
            </div>
            <QuickRoastTab />
          </div>
        )}

        {/* MAL / AniList tab */}
        {(tab === "mal" || tab === "anilist") && (
          <>
            <form onSubmit={submit} className="mb-8 animate-fade-in-up stagger-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] font-mono pointer-events-none">
                    {tab === "mal" ? "mal/" : "al/"}
                  </span>
                  <input
                    type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourusername"
                    className="w-full h-12 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent transition-all"
                    disabled={loading} maxLength={50}
                  />
                </div>
                <Button variant="danger" size="lg" type="submit" loading={loading} className="rounded-xl shrink-0 font-bold">
                  {loading ? "Roasting…" : "Roast Me 🔥"}
                </Button>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2.5">
                {tab === "mal"
                  ? <><span>Profile must be public on MAL. </span><a href="https://myanimelist.net/editprofile.php" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">Make it public →</a></>
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
                {tab === "mal" && (
                  <a href="https://myanimelist.net/editprofile.php" target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-[#DC2626] underline">
                    How to make your MAL list public →
                  </a>
                )}
                <p className="mt-3 text-xs text-[#6B7280]">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setTab("quick")} className="font-bold text-[#DC2626] underline">
                    Try Quick Roast instead →
                  </button>
                </p>
              </div>
            )}

            {/* Result */}
            {result && r && (
              <div className="space-y-4 result-card">
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
                <RoastResultDisplay
                  roast={r} textDone={textDone} setTextDone={setTextDone}
                  shareUrl={`/roast/${result.username}`}
                  shareUsername={result.username}
                  platformLabel={platformLabel}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
