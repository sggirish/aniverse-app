import { NextRequest, NextResponse } from "next/server";
import { createCharacterMatch } from "@/lib/db";
import { generateCharacterMatch, type QuizAnswers } from "@/lib/claude";
import { cacheIncr } from "@/lib/redis";
import { randomUUID } from "crypto";

const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: QuizAnswers = body.answers;

    if (!answers?.q1 || !answers?.q2 || !answers?.q3 || !answers?.q4 || !answers?.q5) {
      return NextResponse.json({ error: "All 5 answers are required" }, { status: 400 });
    }

    // Validate each answer is strictly A/B/C/D
    for (const key of ["q1", "q2", "q3", "q4", "q5"] as const) {
      if (!VALID_OPTIONS.has(answers[key])) {
        return NextResponse.json({ error: "Invalid answer value" }, { status: 400 });
      }
    }

    // Rate limit: 10 per IP per day
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = await cacheIncr(`ratelimit:character:${ip}`, 86400);
    if (count > 10) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow!", rateLimited: true },
        { status: 429 }
      );
    }

    const match = await generateCharacterMatch(answers);
    const sessionId = randomUUID();

    const saved = await createCharacterMatch({
      session_id: sessionId,
      answers: answers as unknown as Record<string, string>,
      character_name: match.character_name,
      anime_title: match.anime_title,
      explanation: match.explanation,
    });

    return NextResponse.json({
      id: saved?.id ?? sessionId,
      character_name: match.character_name,
      anime_title: match.anime_title,
      explanation: match.explanation,
      session_id: sessionId,
    });
  } catch (err) {
    console.error("[character]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
