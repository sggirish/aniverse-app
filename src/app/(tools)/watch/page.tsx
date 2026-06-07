"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

interface SearchResult {
  mal_id: number;
  title: string;
  slug: string;
  genres: string[];
  score?: number;
  episodes?: number;
  image_url?: string;
  status?: string;
}

const POPULAR_SEARCHES = [
  "Attack on Titan", "Demon Slayer", "Death Note", "One Punch Man",
  "Jujutsu Kaisen", "Fullmetal Alchemist", "Naruto", "Frieren",
];

function WatchPageInner() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-trigger from mood finder: /watch?q=Attack+on+Titan
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      // small delay so the input renders first
      setTimeout(() => getVerdict(q), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const results = data.results ?? [];
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch { setSuggestions([]); setOpen(false); }
      setSearchLoading(false);
    }, 380);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const getVerdict = async (title?: string) => {
    const q = title ?? query;
    if (!q.trim()) return;
    setLoading(true);
    setOpen(false);
    setSuggestions([]);
    setError(null);
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Anime not found. Try a different title.");
        return;
      }
      if (data.anime_slug) {
        router.push(`/watch/${data.anime_slug}`);
      } else {
        setError("Couldn't generate a verdict. Try a different title.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🎯</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#16A34A] block">Verdict Engine</span>
              <span className="text-xs text-[#9CA3AF]">Powered by Claude AI</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Should I watch<br /><span className="text-[#16A34A]">this anime?</span>
          </h1>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-md">
            Search any anime. Get an honest WATCH / SKIP / WAIT verdict with vibe tags, binge score, and similar picks. No spoilers.
          </p>
        </div>

        {/* Search box */}
        <div className="relative mb-3 animate-fade-in-up stagger-1">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && getVerdict()}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 180)}
                placeholder="Search any anime title…"
                className="w-full h-12 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                disabled={loading}
              />
              {searchLoading && (
                <div className="absolute right-3.5 top-3.5">
                  <svg className="animate-spin w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                </div>
              )}
            </div>
            <Button variant="primary" size="lg" onClick={() => getVerdict()} loading={loading}
              className="rounded-xl shrink-0 font-bold" style={{ background: "#16A34A" }}>
              {loading ? "Checking…" : "Get Verdict"}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-scale-in">
              ⚠️ {error}
            </div>
          )}

          {/* Autocomplete dropdown */}
          {open && suggestions.length > 0 && (
            <div className="absolute top-14 left-0 right-0 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-20 overflow-hidden animate-scale-in">
              {suggestions.map((s, i) => (
                <button key={s.mal_id}
                  onMouseDown={() => { setQuery(s.title); setOpen(false); getVerdict(s.title); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#F3F4F6] flex items-center gap-3 border-b border-[#F9F9F9] last:border-0 transition-colors">
                  <div className="w-9 h-12 rounded-lg overflow-hidden bg-[#F3F4F6] shrink-0">
                    {s.image_url ? (
                      <Image src={s.image_url} alt={s.title} width={36} height={48}
                        className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-xs font-bold">{i + 1}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F0F0F] truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.genres[0] && <span className="text-[10px] text-[#9CA3AF]">{s.genres[0]}</span>}
                      {s.episodes && <span className="text-[10px] text-[#9CA3AF]">{s.episodes} eps</span>}
                    </div>
                  </div>
                  {s.score && (
                    <div className="shrink-0 flex items-center gap-1 bg-[#FEF9C3] px-2 py-1 rounded-lg">
                      <span className="text-xs">⭐</span>
                      <span className="text-xs font-bold text-[#92400E]">{s.score}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick searches */}
        {!query && !loading && (
          <div className="mb-10 animate-fade-in-up stagger-2">
            <p className="text-xs text-[#9CA3AF] mb-2.5 font-medium">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} onClick={() => { setQuery(s); getVerdict(s); }}
                  className="text-xs font-medium px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full hover:border-[#16A34A] hover:text-[#16A34A] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-12 animate-fade-in">
            <svg className="animate-spin w-8 h-8 text-[#16A34A]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
            </svg>
            <p className="text-sm font-medium text-[#6B7280]">Generating verdict for &ldquo;{query}&rdquo;…</p>
          </div>
        )}

        {/* Trending verdicts */}
        {!loading && <TrendingVerdicts />}
      </div>
    </div>
  );
}

function TrendingVerdicts() {
  const [verdicts, setVerdicts] = useState<Array<{
    anime_slug: string; anime_title: string; verdict: string;
    view_count: number; image_url?: string;
  }>>([]);

  useEffect(() => {
    fetch("/api/verdict/trending")
      .then(r => r.json())
      .then(d => setVerdicts(d.verdicts ?? []))
      .catch(() => {});
  }, []);

  if (!verdicts.length) return null;

  const cfg = {
    WATCH: { pill: "bg-green-100 text-green-700", dot: "bg-green-500", icon: "✅" },
    SKIP:  { pill: "bg-red-100 text-red-700",   dot: "bg-red-500",   icon: "❌" },
    WAIT:  { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500", icon: "⏳" },
  };

  return (
    <div className="animate-fade-in-up stagger-3">
      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">Trending Verdicts</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {verdicts.map((v) => {
          const c = cfg[v.verdict as keyof typeof cfg] ?? { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400", icon: "•" };
          return (
            <a key={v.anime_slug} href={`/watch/${v.anime_slug}`}
              className="flex items-center gap-3 p-3 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group">
              <div className="w-10 h-14 rounded-lg overflow-hidden bg-[#F3F4F6] shrink-0">
                {v.image_url ? (
                  <Image src={v.image_url} alt={v.anime_title} width={40} height={56}
                    className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">{c.icon}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#374151] truncate group-hover:text-[#0F0F0F] transition-colors">
                  {v.anime_title}
                </p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{v.view_count} views</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${c.pill}`}>{v.verdict}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense>
      <WatchPageInner />
    </Suspense>
  );
}
