import { NextRequest, NextResponse } from "next/server";
import { generateTierList } from "@/lib/claude";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();
    if (!category?.trim()) return NextResponse.json({ error: "Category required" }, { status: 400 });
    if (category.length > 100) return NextResponse.json({ error: "Too long" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:tier:${ip}`, 86400);
    if (count > 10) return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });

    const cacheKey = `tier:${category.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 60)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    const result = await generateTierList(category.trim());
    await cacheSet(cacheKey, result, 86400 * 3);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
