import { Metadata } from "next";
import { getRoastCache } from "@/lib/db";
import { ShareButtons } from "@/components/ui/share-buttons";
import Link from "next/link";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s anime taste got roasted by AI`,
    description: `See what AI thinks of ${username}'s anime taste on AniDeck — the free AI anime roast tool`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${username}'s anime taste got roasted 🔥`,
      description: `AniDeck roasted ${username}'s anime taste. See what AI said.`,
      images: [`/api/og/roast?username=${username}`],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RoastResultPage({ params }: Props) {
  const { username } = await params;
  const cache = await getRoastCache(username);

  if (!cache) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <p className="text-[#6B7280]">No roast found for <strong>{username}</strong></p>
          <Link href="/roast" className="text-sm text-[#2563EB] underline">Roast this profile →</Link>
        </div>
      </div>
    );
  }

  const stats = (cache.mal_data as { summary?: Record<string, unknown> })?.summary;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🔥</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#DC2626]">Anime Roast</span>
        </div>

        <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl p-7 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-base">{cache.username}</span>
            <span className="text-xs text-[#6B7280] font-mono">MAL Roast by AniDeck</span>
          </div>
          <div className="border-t border-[#E5E7EB]" />
          <p className="text-base leading-relaxed text-[#1F1F1F]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
            {cache.roast_text}
          </p>
          {stats && (
            <>
              <div className="border-t border-[#E5E7EB]" />
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Completed", value: (stats as Record<string, unknown>).completed },
                  { label: "Episodes", value: (stats as Record<string, unknown>).episodes_watched },
                  { label: "Mean Score", value: (stats as Record<string, unknown>).mean_score },
                ].map((s) => (
                  <span key={s.label} className="text-xs font-mono px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg">
                    <span className="text-[#9CA3AF]">{s.label}: </span>{String(s.value)}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <ShareButtons
          url={`/roast/${cache.username}`}
          text={`My anime taste just got roasted by AI 🔥 "${cache.roast_text.slice(0, 120)}…"`}
        />

        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <Link href="/roast" className="text-sm text-[#6B7280] hover:text-[#0F0F0F] transition-colors">
            ← Roast your own profile
          </Link>
        </div>
      </div>
    </div>
  );
}
