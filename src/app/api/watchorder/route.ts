import { NextRequest, NextResponse } from "next/server";
import { generateWatchOrder } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { franchise } = await req.json();
    if (!franchise?.trim()) return NextResponse.json({ error: "Franchise name required" }, { status: 400 });
    if (franchise.length > 100) return NextResponse.json({ error: "Too long" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:watchorder:${ip}`, 86400);
    if (count > 20) return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });

    const cacheKey = `watchorder:${franchise.toLowerCase().replace(/\s+/g, "-")}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    const result = await generateWatchOrder(franchise.trim());
    await cacheSet(cacheKey, result, 86400 * 7);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
