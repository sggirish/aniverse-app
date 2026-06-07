import { NextRequest, NextResponse } from "next/server";
import { getRoastCache, setRoastCache } from "@/lib/db";
import { getUserProfile, getUserAnimeList, summarizeMALList } from "@/lib/mal";
import { getAniListSummary } from "@/lib/anilist";
import { generateRoast, type RoastResult } from "@/lib/claude";
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

    // Redis cache (stores full structured result)
    const redisCache = await cacheGet<{ roast_result: RoastResult; username: string; stats: unknown; platform: string }>(cacheKey);
    if (redisCache) return NextResponse.json(redisCache);

    // DB cache — try to parse as new JSON format or legacy string
    if (platform === "mal") {
      const dbCache = await getRoastCache(username.toLowerCase());
      if (dbCache) {
        // Try to parse new JSON-encoded roast_text
        let roastResult: RoastResult | null = null;
        try {
          const parsed = JSON.parse(dbCache.roast_text);
          if (parsed.personality_type) roastResult = parsed as RoastResult;
        } catch { /* legacy plain text */ }

        if (roastResult) {
          const result = { roast_result: roastResult, username: dbCache.username, stats: (dbCache.mal_data as { summary?: unknown })?.summary, platform: "mal" };
          await cacheSet(cacheKey, result, 86400);
          return NextResponse.json(result);
        }
        // Legacy: plain roast text — return with minimal structure
        const legacyResult = {
          roast_result: { roast_text: dbCache.roast_text, personality_type: null, roast_tier: null, taste_dna: null, taste_sins: [], redemption_arc: [] },
          username: dbCache.username,
          stats: (dbCache.mal_data as { summary?: unknown })?.summary,
          platform: "mal",
        };
        await cacheSet(cacheKey, legacyResult, 86400);
        return NextResponse.json(legacyResult);
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

    const roastResult = await generateRoast(summary);

    if (platform === "mal") {
      // Store JSON-encoded roast result in roast_text field
      await setRoastCache(username.toLowerCase(), { summary }, JSON.stringify(roastResult));
    }

    const result = { roast_result: roastResult, username: summary.username, stats: summary, platform };
    await cacheSet(cacheKey, result, 86400);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[roast]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
