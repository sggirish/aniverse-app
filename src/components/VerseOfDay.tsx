"use client";
import { useEffect, useState } from "react";

interface VerseData {
  quote: string;
  character: string;
  anime: string;
  context: string;
  theme: string;
}

export function VerseOfDay() {
  const [verse, setVerse] = useState<VerseData | null>(null);

  useEffect(() => {
    fetch("/api/verse")
      .then((r) => r.json())
      .then(setVerse)
      .catch(() => null);
  }, []);

  if (!verse) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
      <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0a0a1e] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">✨ Verse of the Day</p>
        <blockquote className="text-lg font-medium italic text-white mb-3 leading-relaxed">
          &ldquo;{verse.quote}&rdquo;
        </blockquote>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-300">— {verse.character}</p>
            <p className="text-xs text-gray-400">{verse.anime}</p>
          </div>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
            {verse.theme}
          </span>
        </div>
      </div>
    </section>
  );
}
