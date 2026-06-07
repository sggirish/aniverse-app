import { NextRequest, NextResponse } from "next/server";
import { getRoastCache, setRoastCache } from "@/lib/db";
import { getUserProfile, getUserAnimeList, summarizeMALList } from "@/lib/mal";
import { generateRoast } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username: string = (body.username ?? "").trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    if (username.length > 50) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }
    // MAL usernames: alphanumeric, hyphens, underscores only
    if (!/^[a-z0-9_-]+$/i.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Rate limit: 5 generations per IP per day
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:roast:${ip}`, 86400);
    if (count > 5) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow!", rateLimited: true },
        { status: 429 }
      );
    }

    // Check Redis cache first
    const redisCacheKey = `roast:${username}`;
    const redisCache = await cacheGet<{ roast_text: string; stats: unknown }>(redisCacheKey);
    if (redisCache) {
      return NextResponse.json(redisCache);
    }

    // Check DB cache
    const dbCache = await getRoastCache(username);
    if (dbCache) {
      const result = {
        roast_text: dbCache.roast_text,
        username: dbCache.username,
        stats: (dbCache.mal_data as { summary?: unknown })?.summary,
      };
      await cacheSet(redisCacheKey, result, 86400);
      return NextResponse.json(result);
    }

    // Fetch MAL data
    const profile = await getUserProfile(username);
    if (!profile) {
      return NextResponse.json(
        { error: "MAL profile not found. Make sure your profile is public." },
        { status: 404 }
      );
    }

    const list = await getUserAnimeList(username);
    const summary = summarizeMALList(list, profile);

    // Generate roast
    const roastText = await generateRoast(summary);

    // Cache result
    await setRoastCache(username, { summary }, roastText);
    const result = { roast_text: roastText, username: profile.username, stats: summary };
    await cacheSet(redisCacheKey, result, 86400);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[roast]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
