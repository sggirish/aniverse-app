import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const { data: verdicts } = await supabase
    .from("verdicts")
    .select("id, anime_slug, anime_title, mal_id, image_url")
    .is("image_url", null);

  if (!verdicts?.length) { console.log("All verdicts already have images."); return; }
  console.log(`Backfilling ${verdicts.length} verdicts...`);

  for (const v of verdicts) {
    if (!v.mal_id) continue;
    await sleep(600);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${v.mal_id}`);
      const json = await res.json();
      const imageUrl = json.data?.images?.jpg?.large_image_url || json.data?.images?.jpg?.image_url;
      if (imageUrl) {
        await supabase.from("verdicts").update({ image_url: imageUrl }).eq("id", v.id);
        console.log(`  ✓ ${v.anime_title}`);
      } else {
        console.log(`  - ${v.anime_title}: no image`);
      }
    } catch (e) {
      console.log(`  ✗ ${v.anime_title}: ${e}`);
    }
  }
  console.log("Done.");
}

main();
