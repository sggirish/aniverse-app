import { NextRequest, NextResponse } from "next/server";
import { getRoastCache, setRoastCache } from "@/lib/db";
import { getUserProfile, getUserAnimeList, summarizeMALList } from "@/lib/mal";
import { getAniListSummary } from "@/lib/anilist";
import { generateRoast } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username: string = (body.username ?? "").trim();
    const platform: "mal" | "anilist" = body.platform === "anilist" ? "anilist" : "mal";

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    if (username.length > 50) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Rate limit: 5 per IP per day
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:roast:${ip}`, 86400);
    if (count > 5) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow!", rateLimited: true },
        { status: 429 }
      );
    }

    const cacheKey = `roast:${platform}:${username.toLowerCase()}`;

    // Redis cache
    const redisCache = await cacheGet<{ roast_text: string; stats: unknown; username: string }>(cacheKey);
    if (redisCache) return NextResponse.json(redisCache);

    // DB cache (MAL only for backward compat)
    if (platform === "mal") {
      const dbCache = await getRoastCache(username.toLowerCase());
      if (dbCache) {
        const result = {
          roast_text: dbCache.roast_text,
          username: dbCache.username,
          stats: (dbCache.mal_data as { summary?: unknown })?.summary,
          platform: "mal",
        };
        await cacheSet(cacheKey, result, 86400);
        return NextResponse.json(result);
      }
    }

    let summary;

    if (platform === "anilist") {
      summary = await getAniListSummary(username);
      if (!summary) {
        return NextResponse.json(
          { error: "AniList profile not found or list is private. Check your username at anilist.co." },
          { status: 404 }
        );
      }
    } else {
      const profile = await getUserProfile(username);
      if (!profile) {
        return NextResponse.json(
          { error: "MAL profile not found. Make sure your profile is public on myanimelist.net." },
          { status: 404 }
        );
      }
      const list = await getUserAnimeList(username);
      summary = summarizeMALList(list, profile);
    }

    const roastText = await generateRoast(summary);

    if (platform === "mal") {
      await setRoastCache(username.toLowerCase(), { summary }, roastText);
    }

    const result = { roast_text: roastText, username: summary.username, stats: summary, platform };
    await cacheSet(cacheKey, result, 86400);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[roast]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
