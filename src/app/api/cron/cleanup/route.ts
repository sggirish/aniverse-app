import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Called by Vercel Cron — protected by CRON_SECRET header
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Delete character_matches older than 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error: charError, count: charCount } = await supabase
    .from("character_matches")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  // Delete expired roast_cache rows (belt-and-suspenders alongside the expires_at index)
  const { error: roastError, count: roastCount } = await supabase
    .from("roast_cache")
    .delete({ count: "exact" })
    .lt("expires_at", new Date().toISOString());

  if (charError || roastError) {
    console.error("[cron/cleanup]", { charError, roastError });
    return NextResponse.json({ error: "Partial failure" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    deleted: { character_matches: charCount, roast_cache: roastCount },
  });
}
