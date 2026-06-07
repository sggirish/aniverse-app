import Link from "next/link";
import { getTrendingVerdicts } from "@/lib/db";

export default async function HomePage() {
  let trending: Awaited<ReturnType<typeof getTrendingVerdicts>> = [];
  try { trending = await getTrendingVerdicts(6); } catch { /* DB not yet configured */ }

  return (
    <main className="bg-[#FAFAF9] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
        <div className="mb-5 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#6B7280] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse-soft inline-block" />
            Free · No account · AI-powered
          </span>
        </div>

        <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none mb-6 animate-fade-in-up stagger-1">
          Your AI<br />
          <span className="text-[#DC2626]">Anime</span><br />
          Companion.
        </h1>

        <p className="text-[#6B7280] text-lg max-w-xl mb-12 leading-relaxed animate-fade-in-up stagger-2">
          Free AI tools + competitive games that understand anime better than your friends. No login, no BS.
        </p>

        {/* Tool cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up stagger-3">

          {/* Roast */}
          <div className="group bg-gradient-to-br from-[#FFF5F5] to-[#FEE2E2] border border-red-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🔥</span>
              <span className="text-xs font-bold text-[#DC2626] bg-red-100 px-2 py-0.5 rounded-full">MAL · AniList</span>
            </div>
            <div>
              <p className="font-black text-lg text-[#DC2626] mb-1">Anime Roast</p>
              <p className="text-sm text-[#6B7280] leading-relaxed">Claude reads your anime list and gives you a full personality breakdown — your Taste DNA, your biggest sins, and your redemption arc.</p>
            </div>
            <Link href="/roast"
              className="mt-auto text-sm font-bold px-4 py-3 bg-[#DC2626] text-white rounded-xl text-center hover:bg-[#b91c1c] transition-colors group-hover:shadow-md">
              Roast my taste →
            </Link>
          </div>

          {/* Verdict */}
          <div className="group bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-green-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🎯</span>
              <span className="text-xs font-bold text-[#16A34A] bg-green-100 px-2 py-0.5 rounded-full">Any Anime</span>
            </div>
            <div>
              <p className="font-black text-lg text-[#16A34A] mb-1">Should I Watch?</p>
              <p className="text-sm text-[#6B7280] leading-relaxed">Search any anime. Get a WATCH / SKIP / WAIT verdict with vibe tags, binge score, and similar anime — no spoilers.</p>
            </div>
            <Link href="/watch"
              className="mt-auto text-sm font-bold px-4 py-3 bg-[#16A34A] text-white rounded-xl text-center hover:bg-[#15803d] transition-colors group-hover:shadow-md">
              Get a verdict →
            </Link>
          </div>

          {/* Character */}
          <div className="group bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-blue-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🔮</span>
              <span className="text-xs font-bold text-[#2563EB] bg-blue-100 px-2 py-0.5 rounded-full">8 Questions</span>
            </div>
            <div>
              <p className="font-black text-lg text-[#2563EB] mb-1">Character Match</p>
              <p className="text-sm text-[#6B7280] leading-relaxed">8 psychological questions. Claude gives you a primary match, a secondary match, your archetype, and your shadow self.</p>
            </div>
            <Link href="/character"
              className="mt-auto text-sm font-bold px-4 py-3 bg-[#2563EB] text-white rounded-xl text-center hover:bg-[#1d4ed8] transition-colors group-hover:shadow-md">
              Find my character →
            </Link>
          </div>

          {/* Mood Finder */}
          <div className="group bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-purple-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🎭</span>
              <span className="text-xs font-bold text-[#7C3AED] bg-purple-100 px-2 py-0.5 rounded-full">No account</span>
            </div>
            <div>
              <p className="font-black text-lg text-[#7C3AED] mb-1">Mood Finder</p>
              <p className="text-sm text-[#6B7280] leading-relaxed">Pick up to 3 moods. Claude picks 3 perfect anime for exactly how you feel right now. The fastest way to decide what to watch tonight.</p>
            </div>
            <Link href="/mood"
              className="mt-auto text-sm font-bold px-4 py-3 bg-[#7C3AED] text-white rounded-xl text-center hover:bg-[#6D28D9] transition-colors group-hover:shadow-md">
              Find tonight&apos;s anime →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Games section ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border-2 border-purple-200 rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎮</span>
              <div>
                <p className="font-black text-lg text-[#8B5CF6]">AniVerse Games</p>
                <p className="text-xs text-[#9CA3AF]">Compete on leaderboards · Challenge friends</p>
              </div>
            </div>
            <Link href="/games" className="text-xs font-bold text-[#8B5CF6] hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: "/duel",    emoji: "⚔️", name: "Duelist",  desc: "Speed picks" },
              { href: "/cipher",  emoji: "🔐", name: "Cipher",   desc: "Decode synopses" },
              { href: "/guesser", emoji: "🎯", name: "Guesser",  desc: "Predict verdict" },
            ].map((g) => (
              <Link key={g.href} href={g.href}
                className="flex flex-col items-center gap-1.5 p-4 bg-white/70 rounded-xl hover:bg-white hover:shadow-md transition-all text-center">
                <span className="text-2xl">{g.emoji}</span>
                <p className="text-xs font-black text-[#374151]">{g.name}</p>
                <p className="text-[10px] text-[#9CA3AF]">{g.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-[#E5E7EB] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-8 text-center">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { step: "1", title: "Pick a tool", desc: "Roast your MAL taste, search an anime, or take the character quiz." },
              { step: "2", title: "Claude analyzes", desc: "Our AI reads real data — your MAL list, anime metadata, your answers — not generic summaries." },
              { step: "3", title: "Share your result", desc: "Every result is a shareable card. Screenshots fly. Links load instantly." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0F0F0F] text-white flex items-center justify-center text-sm font-black">{s.step}</div>
                <p className="font-bold text-[#0F0F0F]">{s.title}</p>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending verdicts ─────────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Trending Verdicts</p>
            <Link href="/watch" className="text-xs text-[#2563EB] font-semibold hover:underline">Search any anime →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trending.map((v) => {
              const cfg = {
                WATCH: { pill: "bg-green-100 text-green-700", dot: "bg-green-500" },
                SKIP:  { pill: "bg-red-100 text-red-700",   dot: "bg-red-500" },
                WAIT:  { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
              }[v.verdict] ?? { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
              return (
                <Link key={v.anime_slug} href={`/watch/${v.anime_slug}`}
                  className="flex items-center justify-between p-3.5 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className="text-sm font-medium truncate">{v.anime_title}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${cfg.pill}`}>{v.verdict}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-[#E5E7EB] bg-white py-14 text-center">
        <p className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Ready to get roasted?</p>
        <p className="text-[#6B7280] text-sm mb-7 max-w-xs mx-auto">No account. No credit card. Just your MAL username and a thick skin.</p>
        <Link href="/roast"
          className="inline-block text-sm font-bold px-6 py-3.5 bg-[#DC2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors shadow-sm">
          🔥 Roast my anime taste
        </Link>
      </section>

    </main>
  );
}
