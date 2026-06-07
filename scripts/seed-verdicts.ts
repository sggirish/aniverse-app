/**
 * Seed script: pre-generates verdicts for top 200 MAL anime
 * Run: npx tsx scripts/seed-verdicts.ts
 *
 * Requires .env.local to be populated.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const TOP_ANIME_SLUGS = [
  { mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood" },
  { mal_id: 9253, title: "Steins;Gate" },
  { mal_id: 28977, title: "Gintama°" },
  { mal_id: 38524, title: "Shingeki no Kyojin: The Final Season" },
  { mal_id: 9969, title: "Gintama'" },
  { mal_id: 15417, title: "Gintama': Enchousen" },
  { mal_id: 820,   title: "Gintama" },
  { mal_id: 1535,  title: "Death Note" },
  { mal_id: 16498, title: "Shingeki no Kyojin" },
  { mal_id: 52991, title: "Sousou no Frieren" },
  { mal_id: 49387, title: "Boku no Hero Academia 6th Season" },
  { mal_id: 41467, title: "Demon Slayer: Kimetsu no Yaiba" },
  { mal_id: 21,    title: "One Piece" },
  { mal_id: 20,    title: "Naruto" },
  { mal_id: 11061, title: "Hunter x Hunter (2011)" },
  { mal_id: 23755, title: "Mushishi Zoku Shou" },
  { mal_id: 457,   title: "Mushishi" },
  { mal_id: 1,     title: "Cowboy Bebop" },
  { mal_id: 30276, title: "One Punch Man" },
  { mal_id: 19,    title: "Monster" },
];

async function slugify(text: string): Promise<string> {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  for (const anime of TOP_ANIME_SLUGS) {
    const slug = await slugify(anime.title);

    // Skip if already exists
    const { data: existing } = await supabase.from("verdicts").select("id").eq("anime_slug", slug).single();
    if (existing) { console.log(`  SKIP (exists): ${anime.title}`); continue; }

    console.log(`  Generating: ${anime.title}…`);
    try {
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Generate a verdict for the anime "${anime.title}". Output as JSON: { "verdict": "WATCH"|"SKIP"|"WAIT", "reasons": ["string","string","string"], "for_who": "string", "not_for_who": "string", "test_episode": "string" }. Be concise and opinionated. No spoilers.`,
        }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text : "";
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      if (!json) throw new Error("No JSON");
      const v = JSON.parse(json);

      await supabase.from("verdicts").insert({
        anime_slug: slug,
        anime_title: anime.title,
        mal_id: anime.mal_id,
        verdict: v.verdict,
        reasoning: v.reasons.join("\n"),
        for_who: v.for_who,
        not_for_who: v.not_for_who,
        test_episode: v.test_episode,
      });
      console.log(`  ✓ ${anime.title} → ${v.verdict}`);
    } catch (err) {
      console.error(`  ✗ ${anime.title}:`, err);
    }
    await sleep(1000);
  }
  console.log("\nSeed complete.");
}

main().catch(console.error);
