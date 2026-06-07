import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/mal";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    if (!q || q.length < 2) return NextResponse.json({ results: [] });
    if (q.length > 100) return NextResponse.json({ error: "Query too long" }, { status: 400 });
    const results = await searchAnime(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
