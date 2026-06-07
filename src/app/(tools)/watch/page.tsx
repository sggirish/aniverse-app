"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

interface SearchResult {
  mal_id: number;
  title: string;
  slug: string;
  genres: string[];
  score?: number;
}

export default function WatchPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } catch { setSuggestions([]); }
      setSearchLoading(false);
    }, 400);
  }, [query]);

  const getVerdict = async (title?: string) => {
    const q = title ?? query;
    if (!q.trim()) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.anime_slug) router.push(`/watch/${data.anime_slug}`);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">▶</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">Verdict Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Should I watch this?
          </h1>
          <p className="text-[#6B7280] text-base">
            Get a fast, honest verdict on any anime. WATCH / SKIP / WAIT — with reasons. No spoilers.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 animate-fade-in-up stagger-1">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && getVerdict()}
                placeholder="Search any anime title…"
                className="w-full h-12 px-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                disabled={loading}
              />
              {searchLoading && (
                <div className="absolute right-3 top-3.5">
                  <svg className="animate-spin w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                </div>
              )}
            </div>
            <Button variant="primary" size="lg" onClick={() => getVerdict()} loading={loading} className="rounded-xl shrink-0"
              style={{ background: "#16A34A" }}>
              {loading ? "Thinking…" : "Get Verdict"}
            </Button>
          </div>

          {/* Autocomplete */}
          {suggestions.length > 0 && (
            <div className="absolute top-14 left-0 right-0 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 overflow-hidden">
              {suggestions.map((s) => (
                <button key={s.mal_id}
                  className="w-full text-left px-4 py-3 hover:bg-[#F3F4F6] flex items-center justify-between gap-2 border-b border-[#F3F4F6] last:border-0"
                  onClick={() => { setQuery(s.title); setSuggestions([]); getVerdict(s.title); }}>
                  <span className="text-sm font-medium">{s.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.score && <span className="text-xs text-[#6B7280] font-mono">★ {s.score}</span>}
                    <span className="text-xs text-[#9CA3AF]">{s.genres[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular verdicts */}
        <TrendingVerdicts />
      </div>
    </div>
  );
}

function TrendingVerdicts() {
  const [verdicts, setVerdicts] = useState<Array<{ anime_slug: string; anime_title: string; verdict: string; view_count: number }>>([]);

  useEffect(() => {
    fetch("/api/verdict/trending").then(r => r.json()).then(d => setVerdicts(d.verdicts ?? [])).catch(() => {});
  }, []);

  if (!verdicts.length) return null;

  const colors = { WATCH: "bg-green-100 text-green-700", SKIP: "bg-red-100 text-red-700", WAIT: "bg-amber-100 text-amber-700" };

  return (
    <div className="animate-fade-in-up stagger-2">
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Trending Verdicts</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {verdicts.map((v) => (
          <a key={v.anime_slug} href={`/watch/${v.anime_slug}`}
            className="flex items-center justify-between p-3 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-sm transition-all group">
            <span className="text-sm font-medium group-hover:text-[#0F0F0F] text-[#374151] truncate mr-2">{v.anime_title}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${colors[v.verdict as keyof typeof colors] ?? "bg-gray-100 text-gray-600"}`}>
              {v.verdict}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
