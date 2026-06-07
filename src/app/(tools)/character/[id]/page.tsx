import { Metadata } from "next";
import { getCharacterMatch } from "@/lib/db";
import { ShareButtons } from "@/components/ui/share-buttons";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const match = await getCharacterMatch(id);
  if (!match) return { title: "Character Match" };
  return {
    title: `I got ${match.character_name} on AniVerse`,
    description: match.explanation.slice(0, 160),
    robots: { index: false, follow: false },
    openGraph: {
      title: `I got ${match.character_name} (${match.anime_title})`,
      description: match.explanation.slice(0, 200),
      images: [`/api/og/character?id=${id}`],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function CharacterResultPage({ params }: Props) {
  const { id } = await params;
  const match = await getCharacterMatch(id);

  if (!match) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <p className="text-[#6B7280]">This result has expired or doesn't exist.</p>
          <Link href="/character" className="text-sm text-[#2563EB] underline">Take the quiz →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xl">◉</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Character Match</span>
        </div>

        <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-7 space-y-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-1">They are</p>
            <h1 className="text-3xl font-black tracking-tight">{match.character_name}</h1>
            <p className="text-sm text-[#6B7280] mt-1 font-medium">{match.anime_title}</p>
          </div>
          <div className="border-t border-blue-200" />
          <p className="text-base leading-relaxed text-[#1F1F1F]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
            {match.explanation}
          </p>
        </div>

        <ShareButtons
          url={`/character/${id}`}
          text={`I got ${match.character_name} from ${match.anime_title} on AniVerse 👁️`}
        />

        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <Link href="/character" className="text-sm text-[#6B7280] hover:text-[#0F0F0F] transition-colors">
            ← Find your character
          </Link>
        </div>
      </div>
    </div>
  );
}
