import { NextRequest, NextResponse } from "next/server";
import { generateCompatibility } from "@/lib/claude";
import { summarizeMALList, getUserProfile, getUserAnimeList } from "@/lib/mal";
import { getAniListSummary } from "@/lib/anilist";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { usernameA, usernameB, platformA, platformB } = await req.json();
    if (!usernameA || !usernameB) return NextResponse.json({ error: "Both usernames required" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:compat:${ip}`, 86400);
    if (count > 10) return NextResponse.json({ error: "Daily limit reached. Come back tomorrow!" }, { status: 429 });

    const cacheKey = `compat:${[usernameA, usernameB].sort().join("|")}:${platformA}:${platformB}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    async function getSummary(username: string, platform: string) {
      if (platform === "anilist") {
        const profile = await getAniListSummary(username);
        if (!profile) throw new Error(`AniList user "${username}" not found`);
        return {
          username: profile.username,
          top_genres: profile.top_genres ?? [],
          top_rated: profile.top_rated ?? [],
          mean_score: profile.mean_score ?? 7,
        };
      }
      const [profile, list] = await Promise.all([getUserProfile(username), getUserAnimeList(username)]);
      if (!profile) throw new Error(`MAL user "${username}" not found`);
      const s = summarizeMALList(list, profile);
      return { username: s.username, top_genres: s.top_genres, top_rated: s.top_rated, mean_score: s.mean_score };
    }

    const [a, b] = await Promise.all([
      getSummary(usernameA, platformA ?? "mal"),
      getSummary(usernameB, platformB ?? "mal"),
    ]);

    const result = await generateCompatibility(a, b);
    await cacheSet(cacheKey, result, 3600 * 6);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
