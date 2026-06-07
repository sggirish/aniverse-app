import { Metadata } from "next";
import { getVerdict, getTrendingVerdicts, getAllVerdictSlugs, type VerdictMetadata } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { crunchyrollLink, nordvpnLink } from "@/lib/affiliates";
import { ShareButtons } from "@/components/ui/share-buttons";
import { AdUnit } from "@/components/ads/AdUnit";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllVerdictSlugs();
    return slugs.slice(0, 500).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const verdict = await getVerdict(slug);
  if (!verdict) return { title: "Verdict Not Found" };

  const meta = verdict.metadata as VerdictMetadata | undefined;
  const verdictLabel = verdict.verdict === "WATCH" ? "✅ WATCH" : verdict.verdict === "SKIP" ? "❌ SKIP" : "⏳ WAIT";
  const description = meta?.hook ?? verdict.for_who ?? verdict.reasoning.slice(0, 140);

  return {
    title: `Is ${verdict.anime_title} Worth Watching? ${verdictLabel} — AniDeck`,
    description,
    openGraph: {
      title: `${verdict.anime_title}: ${verdictLabel}`,
      description,
      images: verdict.image_url
        ? [{ url: verdict.image_url, width: 225, height: 320 }, { url: `/api/og/verdict?slug=${slug}` }]
        : [`/api/og/verdict?slug=${slug}`],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function VerdictPage({ params }: Props) {
  const { slug } = await params;
  const verdict = await getVerdict(slug);
  if (!verdict) notFound();

  const related = await getTrendingVerdicts(4);
  const others = related.filter((r) => r.anime_slug !== slug).slice(0, 3);

  const meta = verdict.metadata as VerdictMetadata | undefined;

  const cfg = {
    WATCH: {
      label: "WATCH",
      bg: "bg-green-50", border: "border-green-200", text: "text-green-700",
      badge: "bg-green-500", badgeText: "text-white",
      heroBg: "from-green-50 to-[#FAFAF9]",
      icon: "✅",
    },
    SKIP: {
      label: "SKIP",
      bg: "bg-red-50", border: "border-red-200", text: "text-red-700",
      badge: "bg-red-500", badgeText: "text-white",
      heroBg: "from-red-50 to-[#FAFAF9]",
      icon: "❌",
    },
    WAIT: {
      label: "WAIT",
      bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700",
      badge: "bg-amber-500", badgeText: "text-white",
      heroBg: "from-amber-50 to-[#FAFAF9]",
      icon: "⏳",
    },
  }[verdict.verdict];

  const reasons = verdict.reasoning.split("\n").filter(Boolean);
  const crunchUrl = crunchyrollLink();
  const nordUrl = nordvpnLink();

  const bingeScore = meta?.binge_score;
  const vibeTags = meta?.vibe_tags ?? [];
  const hook = meta?.hook;
  const similarAnime = meta?.similar_anime ?? [];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `Is ${verdict.anime_title} Worth Watching?`,
        "description": verdict.for_who,
      })}} />

      {/* Hero band */}
      <div className={`bg-gradient-to-b ${cfg.heroBg} border-b border-[#E5E7EB]`}>
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-6">
            <Link href="/watch" className="hover:text-[#6B7280] transition-colors">Verdict Engine</Link>
            <span>/</span>
            <span className="truncate">{verdict.anime_title}</span>
          </div>

          {/* Poster + title row */}
          <div className="flex gap-5 items-start mb-5 animate-fade-in-up">
            {verdict.image_url && (
              <div className="shrink-0">
                <Image
                  src={verdict.image_url}
                  alt={verdict.anime_title}
                  width={96}
                  height={136}
                  className="rounded-xl shadow-md poster-img object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#9CA3AF] mb-1.5 font-medium uppercase tracking-wide">Should you watch?</p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">{verdict.anime_title}</h1>

              {/* Verdict badge */}
              <div className={`verdict-badge inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border ${cfg.bg} ${cfg.border} mb-3`}>
                <span className="text-2xl">{cfg.icon}</span>
                <span className={`text-2xl sm:text-3xl font-black ${cfg.text}`}>{cfg.label}</span>
              </div>

              {/* Binge score */}
              {bingeScore != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">Binge score</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i < bingeScore ? "bg-[#F47521]" : "bg-[#E5E7EB]"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#374151]">{bingeScore}/10</span>
                </div>
              )}
            </div>
          </div>

          {/* Hook */}
          {hook && (
            <div className={`rounded-xl border px-4 py-3 ${cfg.bg} ${cfg.border}`}>
              <p className={`text-sm font-semibold italic ${cfg.text}`}>&ldquo;{hook}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Vibe tags */}
        {vibeTags.length > 0 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-2.5">Vibes</p>
            <div className="flex flex-wrap gap-2">
              {vibeTags.map((tag) => (
                <span key={tag} className="text-xs font-bold px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-[#374151]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reasons */}
        <div className={`rounded-2xl border p-6 animate-fade-in-up stagger-1 ${cfg.bg} ${cfg.border}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">Why {cfg.label}?</p>
          <ul className="space-y-3">
            {reasons.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#374151] leading-relaxed">
                <span className={`font-black text-base shrink-0 ${cfg.text}`}>{i + 1}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* For / Not for */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up stagger-2">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-green-500 font-black text-sm">✓</span>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Watch if</p>
            </div>
            <p className="text-sm text-[#374151] leading-relaxed">{verdict.for_who}</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-red-500 font-black text-sm">✕</span>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Skip if</p>
            </div>
            <p className="text-sm text-[#374151] leading-relaxed">{verdict.not_for_who}</p>
          </div>
        </div>

        {/* Test episode */}
        {verdict.test_episode && (
          <div className="bg-[#111827] text-white rounded-xl p-5 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🧪</span>
              <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide">Not sure? Try this episode first</p>
            </div>
            <p className="text-sm leading-relaxed text-[#E5E7EB]">Episode {verdict.test_episode}</p>
          </div>
        )}

        {/* Similar anime */}
        {similarAnime.length > 0 && (
          <div className="animate-fade-in-up stagger-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-3">If you like this, watch</p>
            <div className="flex flex-wrap gap-2">
              {similarAnime.map((title) => (
                <Link
                  key={title}
                  href={`/watch/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="text-sm font-medium px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#374151] hover:-translate-y-0.5 transition-all">
                  {title} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Crunchyroll CTA — WATCH only */}
        {verdict.verdict === "WATCH" && (
          <div className="flex items-center justify-between gap-4 p-4 bg-[#F47521]/10 border border-[#F47521]/30 rounded-xl animate-fade-in-up stagger-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🍊</span>
              <p className="text-sm text-[#374151]">Watch <strong>{verdict.anime_title}</strong> on Crunchyroll</p>
            </div>
            <a href={crunchUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-bold px-4 py-2.5 bg-[#F47521] text-white rounded-xl hover:opacity-90 shrink-0 transition-opacity">
              Watch Free →
            </a>
          </div>
        )}

        {/* NordVPN */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl animate-fade-in-up stagger-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌐</span>
            <p className="text-sm text-[#6B7280]">Some titles are geo-restricted. A VPN unlocks them instantly.</p>
          </div>
          <a href={nordUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold px-4 py-2.5 bg-[#4687FF] text-white rounded-xl hover:opacity-90 shrink-0 transition-opacity">
            Try NordVPN →
          </a>
        </div>

        <AdUnit slot="verdict-result" format="auto" className="my-2" />

        {/* Share */}
        <div className="animate-fade-in-up stagger-5">
          <p className="text-xs text-[#6B7280] font-bold mb-3 uppercase tracking-wide">Share this verdict</p>
          <ShareButtons
            url={`/watch/${slug}`}
            text={`AI verdict on ${verdict.anime_title}: ${verdict.verdict}. Here's why you should or shouldn't watch it:`}
            title={`${verdict.anime_title}: ${cfg.label}`}
          />
        </div>

        {/* Related */}
        {others.length > 0 && (
          <div className="border-t border-[#E5E7EB] pt-8 animate-fade-in-up stagger-6">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">More Verdicts</p>
            <div className="space-y-2">
              {others.map((v) => {
                const c = { WATCH:"bg-green-100 text-green-700", SKIP:"bg-red-100 text-red-700", WAIT:"bg-amber-100 text-amber-700" }[v.verdict] ?? "bg-gray-100 text-gray-600";
                return (
                  <Link key={v.anime_slug} href={`/watch/${v.anime_slug}`}
                    className="flex items-center justify-between p-3.5 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-sm hover:-translate-y-0.5 transition-all">
                    <span className="text-sm font-medium">{v.anime_title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c}`}>{v.verdict}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
