import { Metadata } from "next";
import { getVerdict, getTrendingVerdicts, getAllVerdictSlugs } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
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

  const verdictLabel = verdict.verdict === "WATCH" ? "✅ WATCH" : verdict.verdict === "SKIP" ? "❌ SKIP" : "⏳ WAIT";
  return {
    title: `Is ${verdict.anime_title} Worth Watching? ${verdictLabel} — AniVerse`,
    description: `${verdict.for_who} ${verdict.reasoning.slice(0, 160)}`,
    openGraph: {
      title: `${verdict.anime_title}: ${verdictLabel}`,
      description: verdict.for_who,
      images: [`/api/og/verdict?slug=${slug}`],
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

  const verdictConfig = {
    WATCH: { label: "WATCH", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-500", icon: "✅" },
    SKIP:  { label: "SKIP",  bg: "bg-red-50",   border: "border-red-200",   text: "text-red-700",   badge: "bg-red-500",   icon: "❌" },
    WAIT:  { label: "WAIT",  bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500", icon: "⏳" },
  }[verdict.verdict];

  const reasons = verdict.reasoning.split("\n").filter(Boolean);
  const crunchUrl = crunchyrollLink();
  const nordUrl = nordvpnLink();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `Is ${verdict.anime_title} Worth Watching?`,
        "description": verdict.for_who,
      })}} />

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-8">
          <Link href="/watch" className="hover:text-[#6B7280]">Verdict Engine</Link>
          <span>/</span>
          <span>{verdict.anime_title}</span>
        </div>

        {/* Title */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-xs text-[#9CA3AF] mb-2">Is it worth watching?</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">{verdict.anime_title}</h1>

          {/* Verdict badge */}
          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border ${verdictConfig.bg} ${verdictConfig.border}`}>
            <span className="text-xl">{verdictConfig.icon}</span>
            <span className={`text-2xl font-black ${verdictConfig.text}`}>{verdictConfig.label}</span>
          </div>
        </div>

        {/* Reasons */}
        <div className={`rounded-2xl border p-6 mb-5 animate-fade-in-up stagger-1 ${verdictConfig.bg} ${verdictConfig.border}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3">Why</p>
          <ul className="space-y-2">
            {reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#374151] leading-relaxed">
                <span className={`font-bold shrink-0 ${verdictConfig.text}`}>{i + 1}.</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* For / Not for */}
        <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-in-up stagger-2">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">For you if</p>
            <p className="text-sm text-[#374151] leading-relaxed">{verdict.for_who}</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Not for you if</p>
            <p className="text-sm text-[#374151] leading-relaxed">{verdict.not_for_who}</p>
          </div>
        </div>

        {/* Test episode */}
        {verdict.test_episode && (
          <div className="bg-[#111827] text-white rounded-xl p-4 mb-6 animate-fade-in-up stagger-3">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Test Episode</p>
            <p className="text-sm">{verdict.test_episode}</p>
          </div>
        )}

        {/* CTA — Crunchyroll (only on WATCH) */}
        {verdict.verdict === "WATCH" && (
          <div className="flex items-center justify-between gap-4 p-4 bg-[#F47521]/10 border border-[#F47521]/30 rounded-xl mb-6 animate-fade-in-up stagger-4">
            <p className="text-sm text-[#374151]">Ready to watch <strong>{verdict.anime_title}</strong>?</p>
            <a href={crunchUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-2 bg-[#F47521] text-white rounded-lg hover:opacity-90 shrink-0">
              Watch on Crunchyroll →
            </a>
          </div>
        )}

        {/* NordVPN — geo-restriction context (all verdicts) */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl mb-6 animate-fade-in-up stagger-4">
          <p className="text-sm text-[#6B7280]">Some titles are geo-restricted in your region. A VPN helps.</p>
          <a href={nordUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 bg-[#4687FF] text-white rounded-lg hover:opacity-90 shrink-0">
            Try NordVPN →
          </a>
        </div>

        {/* AdSense — after result, highest CTR placement */}
        <AdUnit slot="verdict-result" format="auto" className="mb-6" />

        {/* Share */}
        <div className="mb-8 animate-fade-in-up stagger-5">
          <p className="text-xs text-[#6B7280] font-medium mb-2 uppercase tracking-wide">Share this verdict</p>
          <ShareButtons
            url={`/watch/${slug}`}
            text={`AI says ${verdict.verdict}: ${verdict.anime_title} — here's why:`}
          />
        </div>

        {/* Related */}
        {others.length > 0 && (
          <div className="border-t border-[#E5E7EB] pt-8">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">More Verdicts</p>
            <div className="space-y-2">
              {others.map((v) => {
                const c = { WATCH:"bg-green-100 text-green-700", SKIP:"bg-red-100 text-red-700", WAIT:"bg-amber-100 text-amber-700" }[v.verdict] ?? "bg-gray-100 text-gray-600";
                return (
                  <Link key={v.anime_slug} href={`/watch/${v.anime_slug}`}
                    className="flex items-center justify-between p-3 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-sm transition-all">
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
