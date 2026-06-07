import { NextResponse } from "next/server";
import { getTrendingVerdicts } from "@/lib/db";

export async function GET() {
  try {
    const verdicts = await getTrendingVerdicts(6);
    return NextResponse.json({ verdicts });
  } catch {
    return NextResponse.json({ verdicts: [] });
  }
}
