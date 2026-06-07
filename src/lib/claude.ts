import Anthropic from "@anthropic-ai/sdk";
import type { AnimeData } from "./mal";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface VerdictResult {
  verdict: "WATCH" | "SKIP" | "WAIT";
  reasons: string[];
  for_who: string;
  not_for_who: string;
  test_episode: string;
}

export interface CharacterMatchResult {
  character_name: string;
  anime_title: string;
  explanation: string;
}

export interface QuizAnswers {
  q1: "A" | "B" | "C" | "D";
  q2: "A" | "B" | "C" | "D";
  q3: "A" | "B" | "C" | "D";
  q4: "A" | "B" | "C" | "D";
  q5: "A" | "B" | "C" | "D";
}

// ── Roast ────────────────────────────────────────────────────────────────────

export async function generateRoast(malSummary: {
  username: string;
  mean_score: number;
  completed: number;
  dropped: number;
  episodes_watched: number;
  top_genres: string[];
  top_rated: string[];
  worst_rated: string[];
  most_watched_franchise: string;
}): Promise<string> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system:
      "You are a brutally honest, witty anime critic who roasts people's taste with dark humor and specific references. You are like a friend who knows too much. Never be mean-spirited — always loving underneath. Keep it to 3 paragraphs, 150–200 words total. Be specific and personal using the data provided.",
    messages: [
      {
        role: "user",
        content: `Roast this anime watcher's taste based on their MAL profile:
Username: ${malSummary.username}
Mean score they give: ${malSummary.mean_score}/10
Completed: ${malSummary.completed} anime
Dropped: ${malSummary.dropped} anime
Episodes watched: ${malSummary.episodes_watched}
Top genres: ${malSummary.top_genres.join(", ")}
Highest rated: ${malSummary.top_rated.join(", ")}
Lowest rated: ${malSummary.worst_rated.join(", ")}
Most watched franchise: ${malSummary.most_watched_franchise}`,
      },
    ],
  });

  const content = msg.content[0];
  return content.type === "text" ? content.text : "";
}

// ── Verdict ──────────────────────────────────────────────────────────────────

export async function generateVerdict(anime: AnimeData): Promise<VerdictResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system:
      "You are a concise, opinionated anime critic. You give fast, honest verdicts. No spoilers. Your verdicts are respected because you have taste and you commit. Always respond with valid JSON only.",
    messages: [
      {
        role: "user",
        content: `Generate a verdict for "${anime.title}".
Genres: ${anime.genres.join(", ")}
MAL Score: ${anime.score ?? "N/A"}
Episodes: ${anime.episodes ?? "Unknown"}
Synopsis: ${anime.synopsis?.slice(0, 300) ?? "N/A"}

Output as JSON: { "verdict": "WATCH"|"SKIP"|"WAIT", "reasons": ["string","string","string"], "for_who": "string", "not_for_who": "string", "test_episode": "string" }`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as VerdictResult;
}

// ── Character Match ──────────────────────────────────────────────────────────

const QUIZ_LABELS: Record<string, Record<string, string>> = {
  q1: {
    A: "fix it quietly",
    B: "talk it out",
    C: "spiral first then recover",
    D: "go quiet",
  },
  q2: {
    A: "discipline",
    B: "empathy",
    C: "intensity",
    D: "independence",
  },
  q3: {
    A: "someone carrying too much",
    B: "someone searching",
    C: "someone rebuilding",
    D: "someone running",
  },
  q4: {
    A: "the one who keeps things moving",
    B: "the one people talk to",
    C: "the wildcard",
    D: "the observer",
  },
  q5: {
    A: "clarity",
    B: "connection",
    C: "freedom",
    D: "recognition",
  },
};

export async function generateCharacterMatch(answers: QuizAnswers): Promise<CharacterMatchResult> {
  const formatted = [
    `When things go wrong: ${QUIZ_LABELS.q1[answers.q1]}`,
    `Biggest strength you sometimes hate: ${QUIZ_LABELS.q2[answers.q2]}`,
    `Right now feeling like: ${QUIZ_LABELS.q3[answers.q3]}`,
    `In a group you are: ${QUIZ_LABELS.q4[answers.q4]}`,
    `What you actually want: ${QUIZ_LABELS.q5[answers.q5]}`,
  ].join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system:
      "You match people to anime characters through deep psychological reasoning. Your matches feel eerily accurate because they are based on the why, not the what. Always respond with valid JSON only.",
    messages: [
      {
        role: "user",
        content: `Match this person to an anime character based on their responses:

${formatted}

Output as JSON: { "character_name": "string", "anime_title": "string", "explanation": "4-6 sentences in second person, no spoilers, explain WHY not just what the character does" }`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as CharacterMatchResult;
}
