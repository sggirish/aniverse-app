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
    emoji: "⚡",
    options: [
      { value: "A", label: "Fix it quietly, without telling anyone" },
      { value: "B", label: "Talk it out until it makes sense" },
      { value: "C", label: "Spiral first, recover later" },
      { value: "D", label: "Go completely quiet" },
    ],
  },
  {
    id: "q2",
    text: "Your biggest strength — and sometimes your curse:",
    emoji: "🔱",
    options: [
      { value: "A", label: "Discipline — you show up even when you don't want to" },
      { value: "B", label: "Empathy — you feel what others feel before they say it" },
      { value: "C", label: "Intensity — everything matters too much" },
      { value: "D", label: "Independence — you never needed anyone's permission" },
    ],
  },
  {
    id: "q3",
    text: "Right now, you feel most like…",
    emoji: "🪞",
    options: [
      { value: "A", label: "Someone carrying too much, silently" },
      { value: "B", label: "Someone still searching for the right direction" },
      { value: "C", label: "Someone rebuilding themselves from scratch" },
      { value: "D", label: "Someone running — from what, you're not sure" },
    ],
  },
  {
    id: "q4",
    text: "In a group, people see you as…",
    emoji: "👁️",
    options: [
      { value: "A", label: "The one who keeps things moving" },
      { value: "B", label: "The one everyone confides in" },
      { value: "C", label: "The wildcard — unpredictable, but interesting" },
      { value: "D", label: "The observer — quiet, but you notice everything" },
    ],
  },
  {
    id: "q5",
    text: "Deep down, what you actually want right now:",
    emoji: "✨",
    options: [
      { value: "A", label: "Clarity — just tell me what to do" },
      { value: "B", label: "Connection — someone who truly gets it" },
      { value: "C", label: "Freedom — no expectations, no obligations" },
      { value: "D", label: "Recognition — to be seen for who you really are" },
    ],
  },
  {
    id: "q6",
    text: "When you care about something deeply, you…",
    emoji: "💎",
    options: [
      { value: "A", label: "Pour everything in — you become a little obsessed" },
      { value: "B", label: "Protect it quietly, without making a big deal" },
      { value: "C", label: "Want everyone else to care about it too" },
      { value: "D", label: "Study it until you understand every dimension" },
    ],
  },
  {
    id: "q7",
    text: "Your relationship with authority:",
    emoji: "⚖️",
    options: [
      { value: "A", label: "Respect it when earned — ignore it when it isn't" },
      { value: "B", label: "Work within it better than anyone" },
      { value: "C", label: "Challenge it — not out of rebellion, but principle" },
      { value: "D", label: "Observe it carefully from a distance" },
    ],
  },
  {
    id: "q8",
    text: "What will you leave behind?",
    emoji: "🌙",
    options: [
      { value: "A", label: "A record — proof that you were here and it mattered" },
      { value: "B", label: "Better people — those you helped become themselves" },
      { value: "C", label: "Questions — things that made others think differently" },
      { value: "D", label: "Nothing visible — you prefer to act without leaving a trace" },
    ],
  },
];

interface MatchResult {
  id: string;
  primary_character: string;
  primary_anime: string;
  primary_percent: number;
  secondary_character: string;
  secondary_anime: string;
  secondary_percent: number;
  archetype: string;
  explanation: string;
  shadow_note: string;
}

export default function CharacterPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const current = QUESTIONS[step];
  const isQuiz = step < QUESTIONS.length;
  const isLoading = step === QUESTIONS.length;
  const isResult = step === QUESTIONS.length + 1;

  const select = async (value: string) => {
    if (animating) return;
    setSelected(value);
    setAnimating(true);

    await new Promise(r => setTimeout(r, 280));

    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);
    setSelected(null);
    setAnimating(false);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
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
        setStep(QUESTIONS.length + 1);
        localStorage.setItem("aniverse_used_tool", "1");
        window.plausible?.("tool_used", { props: { tool: "character" } });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep(QUESTIONS.length - 1);
        setAnimating(false);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🔮</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] block">Character Match</span>
              <span className="text-xs text-[#9CA3AF]">AI-powered</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-2">
            Which anime<br />
            <span className="text-[#2563EB]">character are you?</span>
          </h1>
          <p className="text-[#6B7280] text-base leading-relaxed">
            8 psychological questions. Our AI finds your primary character, your secondary match, and your hidden archetype.
          </p>
        </div>

        {/* Quiz */}
        {isQuiz && (
          <div key={step} className="animate-scale-in">
            {/* Progress */}
            <div className="mb-7">
              <div className="flex justify-between text-xs text-[#9CA3AF] mb-2.5 font-medium">
                <span>Question {step + 1} of {QUESTIONS.length}</span>
                <span>{Math.round((step / QUESTIONS.length) * 100)}% done</span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <div className="flex gap-1 mt-2">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-[#2563EB]" : i === step ? "bg-blue-300" : "bg-[#E5E7EB]"}`} />
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <span className="text-3xl mb-3 block">{current.emoji}</span>
              <h2 className="text-xl sm:text-2xl font-black leading-snug">{current.text}</h2>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {current.options.map((opt) => (
                <button key={opt.value}
                  onClick={() => select(opt.value)}
                  disabled={animating}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group
                    ${selected === opt.value
                      ? "border-[#2563EB] bg-[#EFF6FF] scale-[0.98]"
                      : "border-[#E5E7EB] bg-white hover:border-[#2563EB] hover:bg-blue-50 hover:-translate-y-0.5"
                    }`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors
                    ${selected === opt.value ? "bg-[#2563EB] text-white" : "bg-[#F3F4F6] text-[#6B7280] group-hover:bg-[#2563EB] group-hover:text-white"}`}>
                    {opt.value}
                  </span>
                  <span className="text-sm font-medium text-[#374151] leading-snug">{opt.label}</span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                ← Back
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="animate-fade-in text-center py-16 space-y-5">
            <div className="relative flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <span className="text-3xl animate-pulse-soft">🔮</span>
              </div>
              <svg className="absolute inset-0 w-16 h-16 animate-spin-slow" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#DBEAFE" strokeWidth="3"/>
                <path d="M32 2a30 30 0 0130 30" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-lg text-[#374151]">Analyzing your psyche…</p>
              <p className="text-sm text-[#9CA3AF] mt-1">Finding your primary and shadow match</p>
            </div>
            <div className="flex justify-center gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse-soft"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && !isResult && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-scale-in">
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {isResult && result && (
          <div className="space-y-5">

            {/* Archetype header */}
            <div className="bg-gradient-to-br from-[#111827] to-[#1E3A5F] text-white rounded-2xl p-6 animate-bounce-in text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#93C5FD] mb-1">Your Archetype</p>
              <h2 className="text-2xl sm:text-3xl font-black">{result.archetype}</h2>
            </div>

            {/* Dual match */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up stagger-1">
              {/* Primary */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border-2 border-blue-300 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wide">Primary</span>
                  <span className="text-lg font-black text-[#2563EB]">{result.primary_percent}%</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full mb-3">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${result.primary_percent}%` }} />
                </div>
                <p className="font-black text-lg leading-tight text-[#0F0F0F]">{result.primary_character}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{result.primary_anime}</p>
              </div>

              {/* Secondary */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Also</span>
                  <span className="text-lg font-black text-[#6B7280]">{result.secondary_percent}%</span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full mb-3">
                  <div className="h-full bg-[#9CA3AF] rounded-full" style={{ width: `${result.secondary_percent}%` }} />
                </div>
                <p className="font-black text-base leading-tight text-[#374151]">{result.secondary_character}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{result.secondary_anime}</p>
              </div>
            </div>

            {/* Explanation card */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-blue-200 rounded-2xl p-7 animate-fade-in-up stagger-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-3">Why you are {result.primary_character}</p>
              <div className="border-t border-blue-200 mb-4" />
              <p className="text-base leading-[1.9] text-[#1F1F1F]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
                {result.explanation}
              </p>
            </div>

            {/* Shadow note */}
            {result.shadow_note && (
              <div className="bg-[#111827] text-white rounded-xl p-4 animate-fade-in-up stagger-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Under Pressure</p>
                <p className="text-sm leading-relaxed text-[#E5E7EB]">{result.shadow_note}</p>
              </div>
            )}

            {/* Answer recap */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 animate-fade-in-up stagger-3">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">Your answers</p>
              <div className="space-y-1.5">
                {QUESTIONS.map((q) => {
                  const ans = answers[q.id];
                  const opt = q.options.find(o => o.value === ans);
                  return opt ? (
                    <div key={q.id} className="flex items-start gap-2 text-xs">
                      <span className="text-[#9CA3AF] shrink-0">{q.emoji}</span>
                      <span className="text-[#6B7280]">{opt.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <AdUnit slot="character-result" format="auto" />

            {/* Watch CTA */}
            <div className="bg-[#F0FDF4] border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in-up stagger-4">
              <div>
                <p className="text-sm font-bold text-[#16A34A]">Watch {result.primary_anime}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">See where your character comes from.</p>
              </div>
              <a href={`/watch/${result.primary_anime.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                className="text-xs font-bold px-3 py-2 bg-[#16A34A] text-white rounded-xl hover:bg-[#15803d] shrink-0 transition-colors">
                Get verdict →
              </a>
            </div>

            {/* Share */}
            <div className="animate-fade-in-up stagger-4">
              <p className="text-xs text-[#6B7280] font-bold mb-3 uppercase tracking-wide">Share your result</p>
              <ShareButtons
                url={`/character/${result.id}`}
                text={`I'm ${result.archetype} — ${result.primary_percent}% ${result.primary_character} and ${result.secondary_percent}% ${result.secondary_character}. Which anime character are you?`}
                title={`I am ${result.primary_character}`}
              />
            </div>

            <Button variant="outline" size="md" onClick={reset} className="w-full animate-fade-in-up stagger-5">
              ← Take the quiz again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
