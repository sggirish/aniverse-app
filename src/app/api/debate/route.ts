import { NextRequest, NextResponse } from "next/server";
import { generateDebate } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { opinion } = await req.json();
    if (!opinion?.trim()) return NextResponse.json({ error: "Opinion required" }, { status: 400 });
    if (opinion.length > 200) return NextResponse.json({ error: "Keep it under 200 characters" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:debate:${ip}`, 86400);
    if (count > 15) return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });

    const cacheKey = `debate:${opinion.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 60)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    const result = await generateDebate(opinion.trim());
    await cacheSet(cacheKey, result, 86400 * 2);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
