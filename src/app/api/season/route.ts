import { NextRequest, NextResponse } from "next/server";
import { generateSeasonalWatchlist } from "@/lib/claude";
import { cacheGet, cacheSet } from "@/lib/redis";

function getCurrentSeason(): { season: string; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const season = month <= 3 ? "Winter" : month <= 6 ? "Spring" : month <= 9 ? "Summer" : "Fall";
  return { season, year };
}

const CURRENT_SEASON_ANIME: Record<string, string[]> = {
  "Summer-2025": [
    "Bleach: Thousand-Year Blood War", "My Hero Academia Season 7", "Overlord V",
    "Sword Art Online Alternative: Gun Gale Online II", "Fairy Tail: 100 Years Quest",
    "Makeine: Too Many Losing Heroines!", "Pseudo Harem", "Wistoria: Wand and Sword",
    "Oshi no Ko Season 2", "Re:Zero Season 3", "Lazarus", "Twilight Out of Focus",
    "The Duke of Death and His Maid Season 3", "DAN DA DAN", "Blue Box",
    "The Ancient Magus' Bride Season 3", "Ranma 1/2 (2024)", "Terminator Zero",
    "Tower of God Season 2", "Kaiju No. 8"
  ],
  "Fall-2025": [
    "Chainsaw Man Season 2", "Solo Leveling Season 2", "Jujutsu Kaisen Season 3",
    "Vinland Saga Season 3", "Attack on Titan: The Final Chapters", "Mushoku Tensei Season 3",
    "Spy x Family Season 3", "Dungeon Meshi Season 2", "Frieren Season 2",
    "Black Clover: Sword of the Wizard King", "Blue Lock Season 2", "Haikyuu Final Arc",
    "Dandadan Season 2", "WITCH WATCH", "Sakamoto Days", "Zenshu", "The Apothecary Diaries Season 2"
  ],
  "Winter-2025": [
    "Solo Leveling", "Dungeon Meshi", "Frieren: Beyond Journey's End", "Delicious in Dungeon",
    "Mashle: Magic and Muscles Season 2", "Classroom of the Elite Season 3",
    "A Sign of Affection", "The Wrong Way to Use Healing Magic", "Villainess Level 99",
    "Bungou Stray Dogs Season 5", "Hokkaido Gals Are Super Adorable!", "Amagami-san chi no Enmusubi"
  ],
  "Spring-2025": [
    "Kagurabachi", "Wind Breaker", "Unnamed Memory", "Bartender Glass of God",
    "Spice and Wolf: Merchant meets the Wise Wolf", "Alya Sometimes Hides Her Feelings in Russian",
    "Kaiju No. 8", "Why Does Nobody Remember Me in This World?", "Wistoria",
    "Yuru Camp Season 3", "Hibike! Euphonium Season 3", "Laid-Back Camp Season 3"
  ],
};

export async function GET(req: NextRequest) {
  const { season, year } = getCurrentSeason();
  const requested = req.nextUrl.searchParams.get("season");
  const requestedYear = parseInt(req.nextUrl.searchParams.get("year") ?? String(year));
  const finalSeason = requested ?? season;
  const finalYear = requestedYear;

  const cacheKey = `season:${finalSeason}-${finalYear}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const key = `${finalSeason}-${finalYear}`;
  const animeList = CURRENT_SEASON_ANIME[key] ?? CURRENT_SEASON_ANIME[`${season}-${year}`] ?? CURRENT_SEASON_ANIME["Fall-2025"];

  const result = await generateSeasonalWatchlist(finalSeason, finalYear, animeList);
  await cacheSet(cacheKey, result, 3600 * 24 * 7);
  return NextResponse.json(result);
}
