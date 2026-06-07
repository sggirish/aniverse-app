import { NextRequest, NextResponse } from "next/server";
import { getVerdict, setVerdict, incrementVerdictView } from "@/lib/db";
import { searchAnime } from "@/lib/mal";
import { generateVerdict } from "@/lib/claude";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = (body.query ?? "").trim();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    if (query.length > 150) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const results = await searchAnime(query);
    if (!results.length) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }
    const anime = results[0];
    const slug = slugify(anime.title);

    const existing = await getVerdict(slug);
    if (existing) {
      await incrementVerdictView(slug);
      return NextResponse.json({ ...existing, fromCache: true });
    }

    const verdictData = await generateVerdict(anime);

    const saved = await setVerdict({
      anime_slug: slug,
      anime_title: anime.title,
      mal_id: anime.mal_id,
      image_url: anime.image_url,
      verdict: verdictData.verdict,
      reasoning: verdictData.reasons.join("\n"),
      for_who: verdictData.for_who,
      not_for_who: verdictData.not_for_who,
      test_episode: verdictData.test_episode,
    });

    return NextResponse.json(saved ?? { ...verdictData, anime_slug: slug, anime_title: anime.title });
  } catch (err) {
    console.error("[verdict]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    const verdict = await getVerdict(slug);
    if (!verdict) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(verdict);
  } catch (err) {
    console.error("[verdict GET]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
