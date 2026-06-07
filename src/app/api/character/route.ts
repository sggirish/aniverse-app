import { NextRequest, NextResponse } from "next/server";
import { createCharacterMatch } from "@/lib/db";
import { generateCharacterMatch, type QuizAnswers } from "@/lib/claude";
import { cacheIncr } from "@/lib/redis";
import { randomUUID } from "crypto";

const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);
const ALL_QUESTIONS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: QuizAnswers = body.answers;

    if (!answers) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    for (const key of ALL_QUESTIONS) {
      if (!answers[key] || !VALID_OPTIONS.has(answers[key])) {
        return NextResponse.json({ error: `Answer for ${key} is required and must be A, B, C, or D` }, { status: 400 });
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

    // Try full insert; fall back without new columns if migration hasn't run yet
    let saved = await createCharacterMatch({
      session_id: sessionId,
      answers: answers as unknown as Record<string, string>,
      character_name: match.primary_character,
      anime_title: match.primary_anime,
      explanation: match.explanation,
      secondary_character: match.secondary_character,
      secondary_anime: match.secondary_anime,
      archetype: match.archetype,
    }).catch(() => null);

    if (!saved) {
      saved = await createCharacterMatch({
        session_id: sessionId,
        answers: answers as unknown as Record<string, string>,
        character_name: match.primary_character,
        anime_title: match.primary_anime,
        explanation: match.explanation,
      }).catch(() => null);
    }

    return NextResponse.json({
      id: saved?.id ?? sessionId,
      primary_character: match.primary_character,
      primary_anime: match.primary_anime,
      primary_percent: match.primary_percent,
      secondary_character: match.secondary_character,
      secondary_anime: match.secondary_anime,
      secondary_percent: match.secondary_percent,
      archetype: match.archetype,
      explanation: match.explanation,
      shadow_note: match.shadow_note,
      session_id: sessionId,
    });
  } catch (err) {
    console.error("[character]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
