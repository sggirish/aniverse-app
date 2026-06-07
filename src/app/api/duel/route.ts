import { NextRequest, NextResponse } from "next/server";
import { getRandomPair, submitScore, getLeaderboard, getPlayerRank } from "@/lib/games";
import { cacheGet, cacheSet } from "@/lib/redis";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const [a, b] = getRandomPair();
  return NextResponse.json({ a, b });
}

// Get Claude's verdict for subjective metrics (cached per anime pair + metric)
async function getSubjectiveVerdict(
  titleA: string,
  titleB: string,
  metric: "iconic" | "ending"
): Promise<"A" | "B"> {
  const key = `duel:subjective:${metric}:${[titleA, titleB].sort().join("|")}`;
  const cached = await cacheGet<{ winner: "A" | "B"; sortedFirst: string }>(key);
  if (cached) {
    // Re-map: if sort order matches original, winner is same; else flip
    const sortedFirst = [titleA, titleB].sort()[0];
    if (sortedFirst === cached.sortedFirst) return cached.winner;
    return cached.winner === "A" ? "B" : "A";
  }

  const [sortedA, sortedB] = [titleA, titleB].sort();
  const prompt = metric === "iconic"
    ? `Which anime has the more iconic cultural impact and is more memorable as a landmark series: "${sortedA}" or "${sortedB}"? Answer with just the title.`
    : `Which anime has the better, more satisfying ending: "${sortedA}" or "${sortedB}"? Answer with just the title.`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 50,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (msg.content[0] as { type: string; text: string }).text.toLowerCase();
  const winner: "A" | "B" = text.includes(sortedA.toLowerCase()) ? "A" : "B";
  await cacheSet(key, { winner, sortedFirst: sortedA }, 86400 * 7);

  // Re-map to original order
  if ([titleA, titleB].sort()[0] === sortedA) return winner;
  return winner === "A" ? "B" : "A";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "verdict") {
      const { titleA, titleB, metric } = body;
      if (!titleA || !titleB || !["iconic", "ending"].includes(metric)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      const winner = await getSubjectiveVerdict(titleA, titleB, metric);
      return NextResponse.json({ winner });
    }

    if (action === "score") {
      const { session_id, score, rounds, correct } = body;
      if (!session_id || score == null) {
        return NextResponse.json({ error: "session_id and score required" }, { status: 400 });
      }
      const accuracy = rounds > 0 ? Math.round((correct / rounds) * 100) : 0;
      await submitScore({ game: "duel", session_id, score, accuracy });
      const rank = await getPlayerRank("duel", score);
      const top = await getLeaderboard("duel", 10);
      return NextResponse.json({ rank, leaderboard: top });
    }

    if (action === "leaderboard") {
      const board = await getLeaderboard("duel", 10);
      return NextResponse.json({ leaderboard: board });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[duel]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
