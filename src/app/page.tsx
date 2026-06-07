import Link from "next/link";
import { getTrendingVerdicts } from "@/lib/db";

export default async function HomePage() {
  let trending: Awaited<ReturnType<typeof getTrendingVerdicts>> = [];
  try { trending = await getTrendingVerdicts(6); } catch { /* DB not configured yet */ }

  return (
    <main className="bg-[#FAFAF9] min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="mb-4 animate-fade-in-up">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">Free · No account · Instant results</span>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none mb-5 animate-fade-in-up stagger-1">
          Your AI<br />Anime<br />Companion.
        </h1>
        <p className="text-[#6B7280] text-lg max-w-lg mb-10 animate-fade-in-up stagger-2">
          Three free tools. No account. Every result is a shareable card.
        </p>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up stagger-3">
          {/* Roast */}
          <div className="bg-[#FFF5F5] border border-red-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-[#DC2626]">Anime Roast</span>
            </div>
            <p className="text-sm text-[#6B7280] flex-1">Paste your MAL username. Get destroyed.</p>
            <Link href="/roast"
              className="text-sm font-semibold px-4 py-2.5 bg-[#DC2626] text-white rounded-xl text-center hover:bg-[#b91c1c] transition-colors">
              Roast my taste →
            </Link>
          </div>

          {/* Verdict */}
          <div className="bg-[#F0FDF4] border border-green-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <span className="text-xl">▶</span>
              <span className="font-bold text-[#16A34A]">Should I Watch?</span>
            </div>
            <p className="text-sm text-[#6B7280] flex-1">Get a verdict in 5 seconds. WATCH / SKIP / WAIT.</p>
            <Link href="/watch"
              className="text-sm font-semibold px-4 py-2.5 bg-[#16A34A] text-white rounded-xl text-center hover:bg-[#15803d] transition-colors">
              Get a verdict →
            </Link>
          </div>

          {/* Character */}
          <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <span className="text-xl">◉</span>
              <span className="font-bold text-[#2563EB]">Character Match</span>
            </div>
            <p className="text-sm text-[#6B7280] flex-1">5 questions. Eerily accurate.</p>
            <Link href="/character"
              className="text-sm font-semibold px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-center hover:bg-[#1d4ed8] transition-colors">
              Start quiz →
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-[#E5E7EB] bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
          <span className="font-semibold text-[#0F0F0F]">Built for anime fans worldwide</span>
          <span>·</span>
          <span>20M+ MAL users</span>
          <span>·</span>
          <span>2.8M r/anime subscribers</span>
          <span>·</span>
          <span>100M+ India anime viewers</span>
        </div>
      </section>

      {/* Recent verdicts */}
      {trending.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-4">Recent Verdicts</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trending.map((v) => {
              const c = { WATCH:"bg-green-100 text-green-700", SKIP:"bg-red-100 text-red-700", WAIT:"bg-amber-100 text-amber-700" }[v.verdict] ?? "bg-gray-100 text-gray-600";
              return (
                <Link key={v.anime_slug} href={`/watch/${v.anime_slug}`}
                  className="flex items-center justify-between p-3 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-sm transition-all">
                  <span className="text-sm font-medium truncate mr-2">{v.anime_title}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${c}`}>{v.verdict}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
