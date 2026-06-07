"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ui/share-buttons";
import { AdUnit } from "@/components/ads/AdUnit";

declare global { interface Window { plausible?: (event: string, opts?: object) => void; } }

const QUESTIONS = [
  {
    id: "q1",
    text: "When things go wrong, you usually…",
    options: [
      { value: "A", label: "Fix it quietly" },
      { value: "B", label: "Talk it out" },
      { value: "C", label: "Spiral first, then recover" },
      { value: "D", label: "Go quiet" },
    ],
  },
  {
    id: "q2",
    text: "Your biggest strength that you sometimes hate about yourself:",
    options: [
      { value: "A", label: "Discipline" },
      { value: "B", label: "Empathy" },
      { value: "C", label: "Intensity" },
      { value: "D", label: "Independence" },
    ],
  },
  {
    id: "q3",
    text: "Right now, you're feeling most like…",
    options: [
      { value: "A", label: "Someone carrying too much" },
      { value: "B", label: "Someone searching" },
      { value: "C", label: "Someone rebuilding" },
      { value: "D", label: "Someone running" },
    ],
  },
  {
    id: "q4",
    text: "In a group, you are…",
    options: [
      { value: "A", label: "The one who keeps things moving" },
      { value: "B", label: "The one people talk to" },
      { value: "C", label: "The wildcard" },
      { value: "D", label: "The observer" },
    ],
  },
  {
    id: "q5",
    text: "What you actually want right now:",
    options: [
      { value: "A", label: "Clarity" },
      { value: "B", label: "Connection" },
      { value: "C", label: "Freedom" },
      { value: "D", label: "Recognition" },
    ],
  },
];

interface MatchResult {
  id: string;
  character_name: string;
  anime_title: string;
  explanation: string;
}

export default function CharacterPage() {
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = loading, 6 = result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  const select = async (value: string) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      setStep(5);
      setError(null);
      try {
        const res = await fetch("/api/character", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong");
        setResult(data);
        setStep(6);
        localStorage.setItem("aniverse_used_tool", "1");
        window.plausible?.("tool_used", { props: { tool: "character" } });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep(4);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">◉</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Character Match</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-2">
            Which anime character are you?
          </h1>
          <p className="text-[#6B7280] text-base">5 questions. Eerily accurate. Powered by Claude AI.</p>
        </div>

        {/* Quiz */}
        {step < 5 && (
          <div className="animate-fade-in-up stagger-1">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-[#9CA3AF] mb-2">
                <span>{step < QUESTIONS.length ? `Question ${step + 1} of ${QUESTIONS.length}` : ""}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {current && (
              <div>
                <h2 className="text-xl font-bold mb-5 leading-snug">{current.text}</h2>
                <div className="space-y-2.5">
                  {current.options.map((opt) => (
                    <button key={opt.value}
                      onClick={() => select(opt.value)}
                      className="w-full text-left p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#2563EB] hover:bg-blue-50 transition-all flex items-center gap-3 group">
                      <span className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-xs font-bold text-[#6B7280] group-hover:bg-[#2563EB] group-hover:text-white transition-colors shrink-0">
                        {opt.value}
                      </span>
                      <span className="text-sm font-medium text-[#374151]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {step === 5 && (
          <div className="animate-fade-in text-center py-16 space-y-4">
            <div className="flex justify-center">
              <svg className="animate-spin w-10 h-10 text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
            </div>
            <p className="font-semibold text-[#374151]">Analyzing your responses…</p>
            <p className="text-sm text-[#9CA3AF]">Claude is matching you to a character</p>
          </div>
        )}

        {/* Error */}
        {error && step === 4 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {step === 6 && result && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Result card */}
            <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-7 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-1">You are</p>
                <h2 className="text-3xl font-black tracking-tight">{result.character_name}</h2>
                <p className="text-sm text-[#6B7280] mt-1 font-medium">{result.anime_title}</p>
              </div>
              <div className="border-t border-blue-200" />
              <p className="text-base leading-relaxed text-[#1F1F1F]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
                {result.explanation}
              </p>
              <div className="text-xs text-[#9CA3AF]">aniverse.app/character/{result.id}</div>
            </div>

            {/* AdSense — after result, highest CTR placement */}
            <AdUnit slot="character-result" format="auto" />

            {/* Share */}
            <div>
              <p className="text-xs text-[#6B7280] font-medium mb-2 uppercase tracking-wide">Share your result</p>
              <ShareButtons
                url={`/character/${result.id}`}
                text={`I got ${result.character_name} from ${result.anime_title} on AniVerse — eerily accurate 👁️`}
              />
            </div>

            {/* Retry */}
            <Button variant="outline" size="md" onClick={reset} className="w-full">
              ← Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
