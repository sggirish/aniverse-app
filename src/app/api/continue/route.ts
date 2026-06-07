import { NextRequest, NextResponse } from "next/server";
import { generateShouldContinue } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { title, episode } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Anime title required" }, { status: 400 });
    const ep = parseInt(episode) || 1;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:continue:${ip}`, 86400);
    if (count > 15) return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });

    const cacheKey = `continue:${title.toLowerCase().replace(/\s+/g, "-")}:ep${ep}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    const result = await generateShouldContinue(title.trim(), ep);
    await cacheSet(cacheKey, result, 86400 * 3);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
