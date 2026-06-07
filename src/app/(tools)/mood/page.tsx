"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ui/share-buttons";
import type { MoodResult } from "@/lib/claude";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

const MOODS = [
  { label: "Hype",         emoji: "⚡", color: "from-yellow-400 to-orange-400",   border: "border-orange-300",  bg: "bg-orange-50"  },
  { label: "Emotional",    emoji: "😢", color: "from-blue-400 to-indigo-500",      border: "border-blue-300",    bg: "bg-blue-50"    },
  { label: "Mind-bending", emoji: "🌀", color: "from-purple-500 to-violet-600",    border: "border-purple-300",  bg: "bg-purple-50"  },
  { label: "Dark",         emoji: "🌑", color: "from-gray-700 to-gray-900",        border: "border-gray-400",    bg: "bg-gray-100"   },
  { label: "Cozy",         emoji: "🍵", color: "from-amber-300 to-orange-300",     border: "border-amber-300",   bg: "bg-amber-50"   },
  { label: "Action",       emoji: "💥", color: "from-red-500 to-rose-600",         border: "border-red-300",     bg: "bg-red-50"     },
  { label: "Romance",      emoji: "💞", color: "from-pink-400 to-rose-500",        border: "border-pink-300",    bg: "bg-pink-50"    },
  { label: "Funny",        emoji: "😂", color: "from-lime-400 to-green-500",       border: "border-green-300",   bg: "bg-green-50"   },
  { label: "Philosophical",emoji: "🤔", color: "from-slate-500 to-blue-700",       border: "border-slate-300",   bg: "bg-slate-50"   },
  { label: "Nostalgic",    emoji: "🌸", color: "from-pink-300 to-purple-400",      border: "border-pink-200",    bg: "bg-pink-50"    },
  { label: "Wholesome",    emoji: "🌻", color: "from-yellow-300 to-green-400",     border: "border-yellow-300",  bg: "bg-yellow-50"  },
  { label: "Thriller",     emoji: "😰", color: "from-zinc-600 to-zinc-900",        border: "border-zinc-400",    bg: "bg-zinc-100"   },
];

export default function MoodPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (mood: string) => {
    setSelected(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : prev.length < 3 ? [...prev, mood] : prev
    );
    setResult(null);
    setError(null);
  };

  const submit = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moods: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      window.plausible?.("tool_used", { props: { tool: "mood", moods: selected.join(",") } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
            <span className="text-3xl">🎭</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] block">Mood Finder</span>
              <span className="text-xs text-[#9CA3AF]">Powered by Claude AI</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            What to watch<br /><span className="text-[#7C3AED]">tonight?</span>
          </h1>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-md">
            Pick up to 3 moods. Claude picks 3 perfect anime for exactly how you feel right now. No account needed.
          </p>
        </div>

        {/* Mood grid */}
        <div className="animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
              Pick your mood{selected.length > 0 ? ` (${selected.length}/3)` : ""}
            </p>
            {selected.length > 0 && (
              <button onClick={() => setSelected([])} className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-6">
            {MOODS.map((mood) => {
              const isSelected = selected.includes(mood.label);
              const isDisabled = !isSelected && selected.length >= 3;
              return (
                <button
                  key={mood.label}
                  onClick={() => !isDisabled && toggle(mood.label)}
                  disabled={isDisabled}
                  className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all duration-200 text-center
                    ${isSelected
                      ? `${mood.bg} ${mood.border} scale-[0.97] shadow-sm`
                      : isDisabled
                        ? "border-[#F3F4F6] bg-[#FAFAF9] opacity-40 cursor-not-allowed"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:-translate-y-0.5 hover:shadow-sm"
                    }`}>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className={`text-xs font-bold leading-tight ${isSelected ? "text-[#374151]" : "text-[#6B7280]"}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="animate-fade-in-up stagger-2">
          <Button
            variant="primary"
            size="lg"
            onClick={submit}
            loading={loading}
            disabled={selected.length === 0 || loading}
            className="w-full rounded-2xl font-black text-base"
            style={{ background: selected.length > 0 ? "#7C3AED" : undefined }}>
            {loading ? "Finding perfect anime…" : selected.length > 0
              ? `Find anime for ${selected.join(" + ")} →`
              : "Select a mood first"}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-scale-in">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-5 animate-fade-in-up">
            {/* Mood label */}
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-1">Your mood combination</p>
              <h2 className="text-2xl font-black text-[#0F0F0F]">{result.mood_label}</h2>
            </div>

            {/* Recommendations */}
            {result.recommendations.map((rec, i) => (
              <div key={i}
                className={`bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-[#374151]">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-black text-lg leading-tight">{rec.title}</h3>
                      <span className="text-xs font-bold text-[#7C3AED] bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                        {rec.hook}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">{rec.genre}</span>
                      <span className="text-xs text-[#9CA3AF]">·</span>
                      <span className="text-xs text-[#9CA3AF]">{rec.episodes}</span>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed">{rec.why}</p>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`/watch/${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                        className="text-xs font-bold px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors">
                        Get verdict →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Share */}
            <div className="pt-2">
              <p className="text-xs text-[#6B7280] font-bold mb-3 uppercase tracking-wide">Share your picks</p>
              <ShareButtons
                url="/mood"
                text={`AI picked these anime for my "${result.mood_label}" mood — get yours`}
                title={result.mood_label}
              />
            </div>

            {/* Try again */}
            <button
              onClick={() => { setResult(null); setSelected([]); }}
              className="w-full text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors py-2">
              ← Try different moods
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
