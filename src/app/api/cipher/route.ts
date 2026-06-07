import { NextRequest, NextResponse } from "next/server";
import { CIPHER_POOL, submitScore, getLeaderboard, getPlayerRank } from "@/lib/games";
import { cacheGet, cacheSet } from "@/lib/redis";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Scramble a synopsis using Claude
async function scrambleSynopsis(title: string, synopsis: string, difficulty: "easy" | "medium" | "hard"): Promise<string> {
  const cacheKey = `cipher:scrambled:${difficulty}:${title}`;
  const cached = await cacheGet<string>(cacheKey);
  if (cached) return cached;

  const instructions = {
    easy: "Remove 2-3 proper nouns (character names, place names) and replace with [???]. Keep the plot clear.",
    medium: "Remove 4-5 key identifying words (proper nouns, unique concepts) and replace with [???]. Also rephrase 1-2 sentences.",
    hard: "Remove 6-8 critical words, replace with [???], rephrase 2-3 sentences to use synonyms, and slightly reorder one event. Make it challenging but still solvable.",
  }[difficulty];

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Scramble this anime synopsis to create a guessing challenge. ${instructions}

Synopsis: "${synopsis}"

Return ONLY the scrambled synopsis text, nothing else.`,
    }],
  });

  const scrambled = (msg.content[0] as { type: string; text: string }).text.trim();
  await cacheSet(cacheKey, scrambled, 86400); // cache 24h
  return scrambled;
}

// Build a daily challenge (5 synopses, same for everyone per day)
async function getDailyChallenge(difficulty: "easy" | "medium" | "hard") {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `cipher:daily:${difficulty}:${today}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  // Pick 5 deterministic anime from pool based on date seed
  const seed = today.split("-").reduce((acc, n) => acc + parseInt(n), 0);
  const pool = [...CIPHER_POOL];
  const picked: typeof CIPHER_POOL = [];
  for (let i = 0; i < 5; i++) {
    const idx = (seed + i * 7) % pool.length;
    picked.push(pool.splice(idx % pool.length, 1)[0]);
  }

  // Build decoy options for each (3-5 wrong choices from pool)
  const challenge = await Promise.all(picked.map(async (anime) => {
    const scrambled = await scrambleSynopsis(anime.title, anime.synopsis, difficulty);
    const decoys = pool
      .filter((a) => a.mal_id !== anime.mal_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, difficulty === "hard" ? 4 : 3)
      .map((a) => a.title);
    const options = [anime.title, ...decoys].sort(() => Math.random() - 0.5);
    return {
      mal_id: anime.mal_id,
      correct: anime.title,
      scrambled,
      options,
      genres: anime.genres,
    };
  }));

  await cacheSet(cacheKey, challenge, 3600 * 6);
  return challenge;
}

export async function GET(req: NextRequest) {
  const difficulty = (req.nextUrl.searchParams.get("difficulty") ?? "easy") as "easy" | "medium" | "hard";
  const challenge = await getDailyChallenge(difficulty);
  return NextResponse.json({ challenge });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "score") {
      const { session_id, score, correct, total, time_seconds } = body;
      if (!session_id || score == null) return NextResponse.json({ error: "session_id and score required" }, { status: 400 });
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      await submitScore({ game: "cipher", session_id, score, accuracy, time_seconds });
      const rank = await getPlayerRank("cipher", score);
      const leaderboard = await getLeaderboard("cipher", 10);
      return NextResponse.json({ rank, leaderboard });
    }

    if (action === "leaderboard") {
      const board = await getLeaderboard("cipher", 10);
      return NextResponse.json({ leaderboard: board });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[cipher]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
