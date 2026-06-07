import { NextRequest, NextResponse } from "next/server";
import { generateIdentityCard } from "@/lib/claude";
import { summarizeMALList, getUserProfile, getUserAnimeList } from "@/lib/mal";
import { getAniListSummary } from "@/lib/anilist";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { username, platform } = await req.json();
    if (!username?.trim()) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:identity:${ip}`, 86400);
    if (count > 10) return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });

    const cacheKey = `identity:${platform ?? "mal"}:${username.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    let summary;
    if (platform === "anilist") {
      const profile = await getAniListSummary(username);
      if (!profile) return NextResponse.json({ error: `AniList user "${username}" not found` }, { status: 404 });
      summary = {
        username: profile.username,
        mean_score: profile.mean_score ?? 7,
        completed: profile.completed ?? 0,
        episodes_watched: profile.episodes_watched ?? 0,
        top_genres: profile.top_genres ?? [],
        top_rated: profile.top_rated ?? [],
        most_watched_franchise: profile.top_rated?.[0] ?? "Unknown",
      };
    } else {
      const [profile, list] = await Promise.all([getUserProfile(username), getUserAnimeList(username)]);
      if (!profile) return NextResponse.json({ error: `MAL user "${username}" not found` }, { status: 404 });
      summary = summarizeMALList(list, profile);
    }

    const result = await generateIdentityCard(summary);
    await cacheSet(cacheKey, result, 3600 * 12);
    return NextResponse.json({ ...result, username: summary.username, stats: summary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
