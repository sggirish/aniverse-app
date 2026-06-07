import { NextRequest, NextResponse } from "next/server";
import { generateQuickRoast, type QuickAnimeEntry } from "@/lib/claude";
import { cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const anime: QuickAnimeEntry[] = body.anime ?? [];
    const hotTake: string | undefined = body.hot_take?.trim() || undefined;

    if (!Array.isArray(anime) || anime.length < 3) {
      return NextResponse.json({ error: "Pick at least 3 anime" }, { status: 400 });
    }
    if (anime.length > 10) {
      return NextResponse.json({ error: "Maximum 10 anime" }, { status: 400 });
    }
    for (const entry of anime) {
      if (!entry.title || typeof entry.title !== "string" || entry.title.trim().length === 0) {
        return NextResponse.json({ error: "Each entry must have a valid title" }, { status: 400 });
      }
      if (entry.rating != null && (entry.rating < 1 || entry.rating > 10)) {
        return NextResponse.json({ error: "Ratings must be 1-10" }, { status: 400 });
      }
    }
    if (hotTake && hotTake.length > 300) {
      return NextResponse.json({ error: "Hot take too long (max 300 chars)" }, { status: 400 });
    }

    // Rate limit: 5 per IP per day (slightly tighter since no auth)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:quickroast:${ip}`, 86400);
    if (count > 5) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow!", rateLimited: true },
        { status: 429 }
      );
    }

    const result = await generateQuickRoast(
      anime.map((a) => ({ title: a.title.trim(), rating: a.rating })),
      hotTake
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[roast/quick]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
