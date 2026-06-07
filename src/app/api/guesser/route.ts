import { NextRequest, NextResponse } from "next/server";
import { DUEL_POOL, submitScore, getLeaderboard, getPlayerRank } from "@/lib/games";
import { cacheGet, cacheSet } from "@/lib/redis";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GuesserRound {
  mal_id: number;
  description: string;
  correct_verdict: "WATCH" | "SKIP" | "WAIT";
  anime_title: string;
  genres: string[];
}

async function generateRound(malId: number, title: string, genres: string[]): Promise<GuesserRound> {
  const cacheKey = `guesser:round:${malId}`;
  const cached = await cacheGet<GuesserRound>(cacheKey);
  if (cached) return cached;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: "You generate spoiler-free anime scene descriptions and honest verdicts. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `For the anime "${title}" (genres: ${genres.join(", ")}), generate:
1. A 2-3 sentence scene/vibe description that hints at its quality without spoilers or naming the title
2. An honest WATCH/SKIP/WAIT verdict

Output as JSON: { "description": "...", "verdict": "WATCH"|"SKIP"|"WAIT" }`,
    }],
  });

  const text = (msg.content[0] as { type: string; text: string }).text;
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  const parsed = JSON.parse(json);

  const round: GuesserRound = {
    mal_id: malId,
    description: parsed.description,
    correct_verdict: parsed.verdict,
    anime_title: title,
    genres,
  };

  await cacheSet(cacheKey, round, 86400 * 7);
  return round;
}

export async function GET(req: NextRequest) {
  const count = parseInt(req.nextUrl.searchParams.get("count") ?? "8");
  const n = Math.min(Math.max(count, 4), 10);

  // Pick n random anime from pool
  const pool = [...DUEL_POOL].sort(() => Math.random() - 0.5).slice(0, n);

  const rounds = await Promise.all(
    pool.map((a) => generateRound(a.mal_id, a.title, a.genres).catch(() => null))
  );

  return NextResponse.json({ rounds: rounds.filter(Boolean) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "score") {
      const { session_id, score, correct, total } = body;
      if (!session_id || score == null) return NextResponse.json({ error: "session_id and score required" }, { status: 400 });
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      await submitScore({ game: "guesser", session_id, score, accuracy });
      const rank = await getPlayerRank("guesser", score);
      const leaderboard = await getLeaderboard("guesser", 10);
      return NextResponse.json({ rank, leaderboard });
    }

    if (action === "leaderboard") {
      const board = await getLeaderboard("guesser", 10);
      return NextResponse.json({ leaderboard: board });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[guesser]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
