import { NextResponse } from "next/server";
import { generateVerseOfDay } from "@/lib/claude";
import { cacheGet, cacheSet } from "@/lib/redis";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `verse:${today}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);
  const verse = await generateVerseOfDay();
  await cacheSet(cacheKey, verse, 3600 * 24);
  return NextResponse.json(verse);
}
