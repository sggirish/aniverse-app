import { NextRequest, NextResponse } from "next/server";
import { generateMoodRecommendations } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

const VALID_MOODS = new Set([
  "Hype", "Emotional", "Mind-bending", "Dark", "Cozy",
  "Action", "Romance", "Funny", "Philosophical", "Nostalgic",
  "Wholesome", "Thriller", "Fantasy", "Sci-fi",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const moods: string[] = body.moods ?? [];

    if (!Array.isArray(moods) || moods.length < 1 || moods.length > 4) {
      return NextResponse.json({ error: "Select 1 to 4 moods" }, { status: 400 });
    }

    const validMoods = moods.filter(m => VALID_MOODS.has(m));
    if (validMoods.length === 0) {
      return NextResponse.json({ error: "Invalid mood selection" }, { status: 400 });
    }

    // Rate limit: 20 per IP per day
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:mood:${ip}`, 86400);
    if (count > 20) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow!", rateLimited: true },
        { status: 429 }
      );
    }

    const cacheKey = `mood:${validMoods.sort().join(",")}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached);

    const result = await generateMoodRecommendations(validMoods);

    await cacheSet(cacheKey, result, 3600); // 1-hour cache per mood combo

    return NextResponse.json(result);
  } catch (err) {
    console.error("[mood]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
