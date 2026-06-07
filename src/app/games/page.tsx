import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Anime Games",
  description: "Play free AI-powered anime games — Anime Duelist, Synopsis Cipher, and Verdict Guesser.",
};

const GAMES = [
  {
    href: "/duel",
    emoji: "⚔️",
    name: "Anime Duelist",
    tagline: "Pick the winner. Beat the clock.",
    desc: "Two anime, one metric, 4 seconds. Pick which is higher-scored, more popular, longer — or let Claude judge the most iconic. 10 rounds. Leaderboard.",
    color: "#8B5CF6",
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-200",
    badge: "Speed Game",
    badgeBg: "bg-purple-100 text-purple-700",
  },
  {
    href: "/cipher",
    emoji: "🔐",
    name: "Synopsis Cipher",
    tagline: "Decode the synopsis. Name the anime.",
    desc: "AI scrambles anime synopses — removes key words, rephrases sentences. Identify the anime from multiple choices. Faster = more points. Daily challenge, everyone competes.",
    color: "#D97706",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    badge: "Daily Challenge",
    badgeBg: "bg-amber-100 text-amber-700",
  },
  {
    href: "/guesser",
    emoji: "🎯",
    name: "Verdict Guesser",
    tagline: "Watch, Skip, or Wait — you decide.",
    desc: "Claude writes a cryptic vibe description for an anime — no title, no spoilers. You predict the verdict. Match the AI's judgment across 8 rounds. Scored by accuracy.",
    color: "#16A34A",
    bg: "from-green-50 to-emerald-50",
    border: "border-green-200",
    badge: "Skill Game",
    badgeBg: "bg-green-100 text-green-700",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🎮</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] block">AniVerse Games</span>
              <span className="text-xs text-[#9CA3AF]">Free · No account · AI-powered</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Test your<br /><span className="text-[#8B5CF6]">anime knowledge.</span>
          </h1>
          <p className="text-[#6B7280] text-base max-w-md">
            Three games. All free, no account needed. Compete on leaderboards and challenge friends.
          </p>
        </div>

        <div className="space-y-4">
          {GAMES.map((g, i) => (
            <Link key={g.href} href={g.href}
              className={`block bg-gradient-to-br ${g.bg} border-2 ${g.border} rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start gap-4">
                <span className="text-4xl shrink-0">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-[#0F0F0F]">{g.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.badgeBg}`}>{g.badge}</span>
                  </div>
                  <p className="text-sm font-bold mb-2" style={{ color: g.color }}>{g.tagline}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{g.desc}</p>
                </div>
                <div className="shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 text-white rounded-lg transition-opacity hover:opacity-90" style={{ background: g.color }}>
                  Play Now →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 p-5 bg-[#111827] text-white rounded-2xl animate-fade-in-up">
          <p className="text-sm font-black mb-1">More coming soon</p>
          <p className="text-xs text-[#9CA3AF]">Anime Heist (branching story game), Seasonal Predictor, and Compatibility Clash are in the works.</p>
        </div>
      </div>
    </div>
  );
}
